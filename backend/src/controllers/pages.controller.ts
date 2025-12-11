import { Request, Response } from 'express';
import { Page } from '../models/Page.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { body, validationResult } from 'express-validator';

export const getAllPages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 }).lean();

    res.json(pages);
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPageBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = await Page.findOne({ slug: req.params.slug.toLowerCase() }).lean();

    if (!page) {
      res.status(404).json({ message: 'Page not found' });
      return;
    }

    res.json(page);
  } catch (error) {
    console.error('Get page by slug error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPage = [
  body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/),
  body('title').trim().notEmpty(),
  body('content').trim().notEmpty(),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'lecturer')) {
        res.status(403).json({ message: 'Permission denied' });
        return;
      }

      const { slug, title, content, metaDescription } = req.body;

      const existingPage = await Page.findOne({ slug: slug.toLowerCase() });
      if (existingPage) {
        res.status(400).json({ message: 'Page with this slug already exists' });
        return;
      }

      const page = new Page({
        slug: slug.toLowerCase(),
        title,
        content,
        metaDescription,
      });

      await page.save();

      res.status(201).json(page.toObject());
    } catch (error) {
      console.error('Create page error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
];

export const updatePage = [
  body('title').optional().trim().notEmpty(),
  body('content').optional().trim().notEmpty(),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'lecturer')) {
        res.status(403).json({ message: 'Permission denied' });
        return;
      }

      const page = await Page.findById(req.params.id);

      if (!page) {
        res.status(404).json({ message: 'Page not found' });
        return;
      }

      const { title, content, metaDescription } = req.body;

      if (title) page.title = title;
      if (content) page.content = content;
      if (metaDescription !== undefined) page.metaDescription = metaDescription;

      await page.save();

      res.json(page.toObject());
    } catch (error) {
      console.error('Update page error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
];

export const deletePage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Permission denied' });
      return;
    }

    const page = await Page.findById(req.params.id);

    if (!page) {
      res.status(404).json({ message: 'Page not found' });
      return;
    }

    await Page.findByIdAndDelete(req.params.id);

    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



