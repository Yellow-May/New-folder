import { Request, Response } from 'express';
import { Event } from '../models/Event.model';
import { User } from '../models/User.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { body, validationResult, query } from 'express-validator';

export const getAllEvents = [
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

      const [events, total] = await Promise.all([
        Event.find()
          .sort({ eventDate: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Event.countDocuments(),
      ]);

      // Populate createdBy information
      const eventsWithCreators = await Promise.all(
        events.map(async (item) => {
          const creator = await User.findById(item.createdById).select('id firstName lastName email').lean();
          return {
            ...item,
            createdBy: creator ? {
              id: creator.id,
              firstName: creator.firstName,
              lastName: creator.lastName,
              email: creator.email,
            } : null,
          };
        })
      );

      res.json({
        events: eventsWithCreators,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get events error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
];

export const getEventById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const event = await Event.findById(req.params.id).lean();

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    // Populate createdBy
    const creator = await User.findById(event.createdById).select('id firstName lastName email').lean();
    const eventWithCreator = {
      ...event,
      createdBy: creator ? {
        id: creator.id,
        firstName: creator.firstName,
        lastName: creator.lastName,
        email: creator.email,
      } : null,
    };

    res.json(eventWithCreator);
  } catch (error) {
    console.error('Get event by id error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createEvent = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('eventDate').isISO8601(),
  body('location').optional().trim(),
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

      const { title, description, eventDate, location, imageUrl } = req.body;

      const event = new Event({
        title,
        description,
        eventDate: new Date(eventDate),
        location,
        imageUrl,
        createdById: req.user.id,
      });

      await event.save();

      // Populate createdBy
      const creator = await User.findById(event.createdById).select('id firstName lastName email').lean();
      const savedEvent = {
        ...event.toObject(),
        createdBy: creator ? {
          id: creator.id,
          firstName: creator.firstName,
          lastName: creator.lastName,
          email: creator.email,
        } : null,
      };

      res.status(201).json(savedEvent);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
];

export const updateEvent = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('eventDate').optional().isISO8601(),
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

      const event = await Event.findById(req.params.id);

      if (!event) {
        res.status(404).json({ message: 'Event not found' });
        return;
      }

      if (
        event.createdById !== req.user.id &&
        req.user.role !== 'admin'
      ) {
        res.status(403).json({ message: 'Permission denied' });
        return;
      }

      const { title, description, eventDate, location, imageUrl } = req.body;

      if (title) event.title = title;
      if (description) event.description = description;
      if (eventDate) event.eventDate = new Date(eventDate);
      if (location !== undefined) event.location = location;
      if (imageUrl !== undefined) event.imageUrl = imageUrl;

      await event.save();

      // Populate createdBy
      const creator = await User.findById(event.createdById).select('id firstName lastName email').lean();
      const updatedEvent = {
        ...event.toObject(),
        createdBy: creator ? {
          id: creator.id,
          firstName: creator.firstName,
          lastName: creator.lastName,
          email: creator.email,
        } : null,
      };

      res.json(updatedEvent);
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
];

export const deleteEvent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    if (event.createdById !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Permission denied' });
      return;
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



