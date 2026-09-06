import express from 'express';
import {
  getMyOrganization,
  updateMyOrganization,
  getPublicOrganizationBySlug,
} from '../controllers/organization.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

// Public route to resolve company support portal
router.get('/public/:slug', getPublicOrganizationBySlug);

// Protected routes
router.use(protect);
router.get('/me', getMyOrganization);
router.put('/me', requireAdmin, updateMyOrganization);

export default router;
