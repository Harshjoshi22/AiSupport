import express from 'express';
import {
  getAvailableAgents,
  getAgentProfileById,
  inviteAgent,
  getMyInvitations,
  acceptInvitation,
  declineInvitation,
  leaveCompany,
  removeAgentFromCompany,
  getCompanyAgents,
} from '../controllers/agent.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin, requireAgent } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

// Global Directory & Profile (Admins/Owners browse, Agents view profile)
router.get('/available', requireAdmin, getAvailableAgents);
router.get('/profile/:id', getAgentProfileById);

// Company Invitations (Admin invites, Agent manages)
router.post('/:id/invite', requireAdmin, inviteAgent);
router.get('/invitations', requireAgent, getMyInvitations);
router.patch('/invitations/:id/accept', requireAgent, acceptInvitation);
router.patch('/invitations/:id/decline', requireAgent, declineInvitation);

// Agent Lifecycle (Leaving, Company Removal, and Company Member Listing)
router.post('/leave-company', requireAgent, leaveCompany);
router.delete('/company/:id', requireAdmin, removeAgentFromCompany);
router.get('/company-agents', requireAdmin, getCompanyAgents);

export default router;
