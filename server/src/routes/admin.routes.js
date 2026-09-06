import express from 'express';
import { getDashboardAnalytics, getCustomersWithStats } from '../controllers/admin.controller.js';
import {
  getAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  getCompanyAdmins,
  removeAdmin,
  getAdminJoinKey,
  regenerateAdminJoinKey,
} from '../controllers/adminManagement.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin, requireOwner } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

// Analytics & Customer overview (Admins and Owner)
router.get('/analytics', requireAdmin, getDashboardAnalytics);
router.get('/customers', requireAdmin, getCustomersWithStats);
router.get('/team', requireAdmin, getCompanyAdmins);

// Owner-only: Admin Join Requests & Approvals
router.get('/requests', requireOwner, getAdminRequests);
router.patch('/requests/:id/approve', requireOwner, approveAdminRequest);
router.patch('/requests/:id/reject', requireOwner, rejectAdminRequest);

// Owner-only: Remove Admin
router.delete('/:id', requireOwner, removeAdmin);

// Owner-only: Admin Join Key Management
router.get('/join-key', requireOwner, getAdminJoinKey);
router.post('/regenerate-join-key', requireOwner, regenerateAdminJoinKey);

export default router;
