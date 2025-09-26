import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { User, IUser } from '../models/user.model';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const clerkAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Auth middleware called');
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const payload = await clerkClient.verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      issuer: process.env.ISSUER!
    });
    
    console.log('Token verified for user:', payload.sub);
    console.log('Superadmin ID from env:', process.env.SUPERADMIN_CLERK_ID);
    console.log('User is superadmin:', payload.sub === process.env.SUPERADMIN_CLERK_ID);

    // Fix the role assignment logic
    const role = payload.sub === process.env.SUPERADMIN_CLERK_ID ? 'superadmin' : 'member';
    
    req.user = {
      clerkId: payload.sub,
      role: role
    } as IUser;

    console.log('User role set to:', role);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};