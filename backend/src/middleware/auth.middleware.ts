import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    // Convert to plain object with id field
    const userObj = user.toObject();
    userObj.id = user._id.toString();
    req.user = userObj as IUser;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};



