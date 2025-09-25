import { Request, Response } from 'express';

interface AuthenticatedRequest extends Request {
  user?: { role: string; orgClerkId: string; clerkId: string };
}

export const organisationsController = {
  // GET /org - Get all orgs (superadmin only)
  getAllOrgs: (req: AuthenticatedRequest, res: Response) => {
    res.json({ 
      message: `Superadmin ${req.user?.clerkId} retrieving all organizations`,
      action: 'get_all_orgs',
      user: req.user 
    });
  },

  // GET /org/:id - Get one org (member+)
  getOneOrg: (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    res.json({ 
      message: `User ${req.user?.clerkId} retrieving organization ${id}`,
      action: 'get_one_org',
      orgId: id,
      user: req.user 
    });
  },

  // POST /org - Create new org (superadmin only)
  createOrg: (req: AuthenticatedRequest, res: Response) => {
    res.json({ 
      message: `Superadmin ${req.user?.clerkId} creating new organization`,
      action: 'create_org',
      body: req.body,
      user: req.user 
    });
  },

  // PATCH /org/:id - Edit org (superadmin only)
  editOrg: (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    res.json({ 
      message: `Superadmin ${req.user?.clerkId} editing organization ${id}`,
      action: 'edit_org',
      orgId: id,
      body: req.body,
      user: req.user 
    });
  },

  // DELETE /org/:id - Delete org (superadmin only)
  deleteOrg: (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    res.json({ 
      message: `Superadmin ${req.user?.clerkId} deleting organization ${id}`,
      action: 'delete_org',
      orgId: id,
      user: req.user 
    });
  },

  // POST /org/:id/invite - Invite admin (superadmin only)
  inviteAdmin: (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    res.json({ 
      message: `Superadmin ${req.user?.clerkId} inviting admin to organization ${id}`,
      action: 'invite_admin',
      orgId: id,
      body: req.body,
      user: req.user 
    });
  },

  // GET /org/:id/users - Get all users in org (admin+)
  getAllUsersInOrg: (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    res.json({ 
      message: `${req.user?.role} ${req.user?.clerkId} retrieving users in organization ${id}`,
      action: 'get_all_users_in_org',
      orgId: id,
      user: req.user 
    });
  },

  // GET /org/:id/users/:userId - Get one user in org (admin+)
  getOneUserInOrg: (req: AuthenticatedRequest, res: Response) => {
    const { id, userId } = req.params;
    res.json({ 
      message: `${req.user?.role} ${req.user?.clerkId} retrieving user ${userId} in organization ${id}`,
      action: 'get_one_user_in_org',
      orgId: id,
      userId: userId,
      user: req.user 
    });
  },

  // PATCH /org/:id/users/:userId - Update user (admin+)
  updateUserInOrg: (req: AuthenticatedRequest, res: Response) => {
    const { id, userId } = req.params;
    res.json({ 
      message: `${req.user?.role} ${req.user?.clerkId} updating user ${userId} in organization ${id}`,
      action: 'update_user_in_org',
      orgId: id,
      userId: userId,
      body: req.body,
      user: req.user 
    });
  },

  // DELETE /org/:id/users/:userId - Delete user (admin+)
  deleteUserInOrg: (req: AuthenticatedRequest, res: Response) => {
    const { id, userId } = req.params;
    res.json({ 
      message: `${req.user?.role} ${req.user?.clerkId} removing user ${userId} from organization ${id}`,
      action: 'delete_user_in_org',
      orgId: id,
      userId: userId,
      user: req.user 
    });
  }
};
