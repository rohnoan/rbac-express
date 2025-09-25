import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { role: string; clerkId: string };
}

export const usersController = {
  // GET /users - Get all users (superadmin only)
  getAllUsers: (req: AuthenticatedRequest, res: Response) => {
    res.json({ 
      message: `Superadmin ${req.user?.clerkId} retrieving all users across all organizations`,
      action: 'get_all_users',
      user: req.user 
    });
  }
};