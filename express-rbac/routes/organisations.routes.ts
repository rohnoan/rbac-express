import { Router } from 'express';
import { organisationsController } from '../controllers/organisations.controller';
import { clerkAuth } from '../middleware/clerkAuth.middleware';
import { requireRoles, requireOrgAccess } from '../middleware/roles.middleware';

const router = Router();

// All routes require authentication
router.use(clerkAuth);

// Organization CRUD routes
router.get('/', requireRoles('superadmin'), organisationsController.getAllOrgs);
router.get('/:id', requireRoles('superadmin', 'admin', 'member'), requireOrgAccess, organisationsController.getOneOrg);
router.post('/', requireRoles('superadmin'), organisationsController.createOrg);
router.patch('/:id', requireRoles('superadmin'), organisationsController.editOrg);
router.delete('/:id', requireRoles('superadmin'), organisationsController.deleteOrg);

// Admin invitation route
router.post('/:id/invite', requireRoles('superadmin'), organisationsController.inviteAdmin);

// Organization user management routes
router.get('/:id/users', requireRoles('superadmin', 'admin'), requireOrgAccess, organisationsController.getAllUsersInOrg);
router.get('/:id/users/:userId', requireRoles('superadmin', 'admin'), requireOrgAccess, organisationsController.getOneUserInOrg);
router.patch('/:id/users/:userId', requireRoles('superadmin', 'admin'), requireOrgAccess, organisationsController.updateUserInOrg);
router.delete('/:id/users/:userId', requireRoles('superadmin', 'admin'), requireOrgAccess, organisationsController.deleteUserInOrg);
// Add this route
router.post('/:id/invite-member', requireRoles('admin'), requireOrgAccess, organisationsController.inviteMember);
export { router as organisationsRoutes };