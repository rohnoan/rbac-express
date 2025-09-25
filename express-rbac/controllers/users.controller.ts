import { Request, Response } from 'express';
import { User, IUser } from '../models/user.model';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const usersController = {
  // GET /users - Get all users (superadmin only)
  getAllUsers: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await User.find({})
        .select('-__v')
        .sort({ createdAt: -1 });

      // Group users by role for better overview
      const usersByRole = users.reduce((acc, user) => {
        if (!acc[user.role]) {
          acc[user.role] = [];
        }
        acc[user.role].push(user);
        return acc;
      }, {} as Record<string, typeof users>);

      res.json({ 
        users,
        total: users.length,
        breakdown: {
          superadmin: usersByRole.superadmin?.length || 0,
          admin: usersByRole.admin?.length || 0,
          member: usersByRole.member?.length || 0
        },
        usersByRole
      });
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
};