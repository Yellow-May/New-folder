import { Request, Response } from 'express';
import { News, NewsStatus } from '../models/News.model';
import { User } from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { body, validationResult, query } from 'express-validator';

export const getAllNews = [
  query('status').optional().isIn(['draft', 'published']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const status = req.query.status as string;

      const query: any = {};
      if (status) {
        query.status = status;
      } else if (!(req as AuthRequest).user) {
        query.status = NewsStatus.PUBLISHED;
      }

      const [news, total] = await Promise.all([
        News.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        News.countDocuments(query),
      ]);

      // Populate author information
      const newsWithAuthors = await Promise.all(
        news.map(async (item) => {
          const author = await User.findById(item.authorId).select('id firstName lastName email').lean();
          return {
            ...item,
            author: author ? {
              id: author.id,
              firstName: author.firstName,
              lastName: author.lastName,
              email: author.email,
            } : null,
          };
        })
      );

      res.json({
        news: newsWithAuthors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get news error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
];

export const getNewsById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const news = await News.findById(req.params.id).lean();

    if (!news) {
      res.status(404).json({ message: 'News not found' });
      return;
    }

    if (
      news.status === NewsStatus.DRAFT &&
      !(req as AuthRequest).user?.role
    ) {
      res.status(404).json({ message: 'News not found' });
      return;
    }

    // Populate author
    const author = await User.findById(news.authorId).select('id firstName lastName email').lean();
    const newsWithAuthor = {
      ...news,
      author: author ? {
        id: author.id,
        firstName: author.firstName,
        lastName: author.lastName,
        email: author.email,
      } : null,
    };

    res.json(newsWithAuthor);
  } catch (error) {
    console.error('Get news by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createNews = [
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
  body('category').optional().trim(),
  body('status').optional().isIn(['draft', 'published']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const { title, content, category, status, imageUrl } = req.body;

      const news = new News({
        title,
        content,
        category,
        imageUrl,
        status: status || NewsStatus.DRAFT,
        authorId: req.user.id,
        publishDate:
          status === NewsStatus.PUBLISHED ? new Date() : undefined,
      });

      await news.save();

      // Populate author
      const author = await User.findById(news.authorId).select('id firstName lastName email').lean();
      const savedNews = {
        ...news.toObject(),
        author: author ? {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          email: author.email,
        } : null,
      };

      res.status(201).json(savedNews);
    } catch (error) {
      console.error('Create news error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
];

export const updateNews = [
  body('title').optional().trim().notEmpty(),
  body('content').optional().trim().notEmpty(),
  body('status').optional().isIn(['draft', 'published']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const news = await News.findById(req.params.id);

      if (!news) {
        res.status(404).json({ message: 'News not found' });
        return;
      }

      if (news.authorId !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ message: 'Permission denied' });
        return;
      }

      const { title, content, category, status, imageUrl } = req.body;

      if (title) news.title = title;
      if (content) news.content = content;
      if (category !== undefined) news.category = category;
      if (imageUrl !== undefined) news.imageUrl = imageUrl;
      if (status) {
        news.status = status;
        if (status === NewsStatus.PUBLISHED && !news.publishDate) {
          news.publishDate = new Date();
        }
      }

      await news.save();

      // Populate author
      const author = await User.findById(news.authorId).select('id firstName lastName email').lean();
      const updatedNews = {
        ...news.toObject(),
        author: author ? {
          id: author.id,
          firstName: author.firstName,
          lastName: author.lastName,
          email: author.email,
        } : null,
      };

      res.json(updatedNews);
    } catch (error) {
      console.error('Update news error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
];

export const deleteNews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const news = await News.findById(req.params.id);

    if (!news) {
      res.status(404).json({ message: 'News not found' });
      return;
    }

    if (news.authorId !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Permission denied' });
      return;
    }

    await News.findByIdAndDelete(req.params.id);

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



