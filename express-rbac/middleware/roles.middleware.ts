import { Request, Response, NextFunction } from 'express';
import { Role } from '../models/user.model';

interface AuthenticatedRequest extends Request {
  user?: { role: Role; orgClerkId: string };
}

export const requireRoles = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: [${roles.join(', ')}]. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

export const requireOrgAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const orgId = req.params.id || req.params.orgId;
  
  // Superadmins can access any org
  if (req.user.role === 'superadmin') {
    return next();
  }

  // Other users can only access their own org
  if (req.user.orgClerkId !== orgId) {
    return res.status(403).json({ error: 'Access denied. You can only access your own organization.' });
  }

  next();
};
