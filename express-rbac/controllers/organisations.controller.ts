import { Request, Response } from 'express';
import { Organization } from '../models/organisation.model';
import { User, IUser } from '../models/user.model';
import { clerkClient } from '@clerk/clerk-sdk-node';

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export const organisationsController = {
  // GET /org - Get all orgs (superadmin only)
  getAllOrgs: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const organizations = await Organization.find({}).sort({ createdAt: -1 });
      res.json({ 
        organizations,
        total: organizations.length
      });
    } catch (error) {
      console.error('Error fetching organizations:', error);
      res.status(500).json({ error: 'Failed to fetch organizations' });
    }
  },

  // GET /org/:id - Get one org (member+)
  getOneOrg: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const organization = await Organization.findOne({ clerkId: id });
      
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json({ organization });
    } catch (error) {
      console.error('Error fetching organization:', error);
      res.status(500).json({ error: 'Failed to fetch organization' });
    }
  },

  // POST /org - Create new org (superadmin only)
  createOrg: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, adminEmail } = req.body;

      if (!name || !adminEmail) {
        return res.status(400).json({ 
          error: 'Organization name and admin email are required' 
        });
      }

      // Generate unique org ID
      const clerkId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create organization
      const organization = new Organization({
        name,
        clerkId
      });

      await organization.save();

      // Send Clerk invitation to admin
      try {
        await clerkClient.invitations.createInvitation({
          emailAddress: adminEmail,
          publicMetadata: {
            role: 'admin',
            orgClerkId: clerkId,
            orgName: name
          },
          redirectUrl: `${process.env.FRONTEND_URL}/accept-invite`
        });

        res.status(201).json({ 
          organization,
          message: `Organization "${name}" created successfully. Invitation sent to ${adminEmail}.`
        });
      } catch (inviteError) {
        // Delete org if invitation fails
        await Organization.findByIdAndDelete(organization._id);
        console.error('Failed to send invitation:', inviteError);
        res.status(500).json({ error: 'Failed to send invitation to admin' });
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      res.status(500).json({ error: 'Failed to create organization' });
    }
  },

  // PATCH /org/:id - Edit org (superadmin only)
  editOrg: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Organization name is required' });
      }

      const organization = await Organization.findOneAndUpdate(
        { clerkId: id },
        { name },
        { new: true }
      );

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      res.json({ 
        organization,
        message: 'Organization updated successfully'
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      res.status(500).json({ error: 'Failed to update organization' });
    }
  },

  // DELETE /org/:id - Delete org (superadmin only)
  deleteOrg: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      // Find and delete organization
      const organization = await Organization.findOneAndDelete({ clerkId: id });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Delete all users in this organization
      const deletedUsers = await User.deleteMany({ orgClerkId: id });

      res.json({ 
        message: `Organization "${organization.name}" and ${deletedUsers.deletedCount} associated users deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting organization:', error);
      res.status(500).json({ error: 'Failed to delete organization' });
    }
  },

  // POST /org/:id/invite - Invite admin (superadmin only)
  inviteAdmin: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Verify organization exists
      const organization = await Organization.findOne({ clerkId: id });
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Send Clerk invitation
      await clerkClient.invitations.createInvitation({
        emailAddress: email,
        publicMetadata: {
          role: 'admin',
          orgClerkId: id,
          orgName: organization.name
        },
        redirectUrl: `${process.env.FRONTEND_URL}/accept-invite`
      });

      res.json({ 
        message: `Admin invitation sent to ${email} for organization "${organization.name}"`
      });
    } catch (error) {
      console.error('Error sending admin invitation:', error);
      res.status(500).json({ error: 'Failed to send invitation' });
    }
  },

  // GET /org/:id/users - Get all users in org (admin+)
  getAllUsersInOrg: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const users = await User.find({ orgClerkId: id })
        .select('-__v')
        .sort({ createdAt: -1 });

      res.json({ 
        users,
        total: users.length,
        orgId: id
      });
    } catch (error) {
      console.error('Error fetching organization users:', error);
      res.status(500).json({ error: 'Failed to fetch organization users' });
    }
  },

  // GET /org/:id/users/:userId - Get one user in org (admin+)
  getOneUserInOrg: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, userId } = req.params;

      const user = await User.findOne({ 
        clerkId: userId,
        orgClerkId: id 
      }).select('-__v');

      if (!user) {
        return res.status(404).json({ error: 'User not found in this organization' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  // PATCH /org/:id/users/:userId - Update user (admin+)
  updateUserInOrg: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, userId } = req.params;
      const { role } = req.body;

      if (!role || !['admin', 'member'].includes(role)) {
        return res.status(400).json({ 
          error: 'Valid role is required (admin or member)' 
        });
      }

      const user = await User.findOneAndUpdate(
        { clerkId: userId, orgClerkId: id },
        { role },
        { new: true }
      ).select('-__v');

      if (!user) {
        return res.status(404).json({ error: 'User not found in this organization' });
      }

      res.json({ 
        user,
        message: `User role updated to ${role}`
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },
  
  // DELETE /org/:id/users/:userId - Delete user (admin+)
  deleteUserInOrg: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, userId } = req.params;

      const user = await User.findOneAndDelete({ 
        clerkId: userId,
        orgClerkId: id 
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found in this organization' });
      }

      res.json({ 
        message: `User removed from organization successfully`
      });
    } catch (error) {
      console.error('Error removing user:', error);
      res.status(500).json({ error: 'Failed to remove user from organization' });
    }
  }

  ,

  inviteMember: async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email } = req.body; // Email from request body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const organization = await Organization.findOne({ clerkId: id });
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    await clerkClient.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role: 'member',
        orgClerkId: id,
        orgName: organization.name
      }
    });

    res.json({ message: `Member invitation sent to ${email}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send invitation' });
  }
}
};
