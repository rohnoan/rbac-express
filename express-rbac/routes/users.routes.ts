import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { clerkAuth } from '../middleware/clerkAuth.middleware';
import { requireRoles } from '../middleware/roles.middleware';

const router = Router();

// All routes require authentication
router.use(clerkAuth);

// User routes
router.get('/', requireRoles('superadmin'), usersController.getAllUsers);

export { router as usersRoutes };