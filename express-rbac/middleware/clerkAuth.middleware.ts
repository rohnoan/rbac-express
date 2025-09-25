import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { User, IUser } from '../models/user.model';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const clerkAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const payload = await clerkClient.verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY ,
    });

    const user = await User.findOne({ clerkId: payload.sub });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};