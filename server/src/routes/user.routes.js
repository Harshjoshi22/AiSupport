import express from 'express';
import { getUsers, getAgents, createAgent, updateAgent, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin, requireAgentOrAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', requireAdmin, getUsers);
router.get('/agents', requireAgentOrAdmin, getAgents);
router.post('/agents', requireAdmin, createAgent);
router.put('/agents/:id', requireAdmin, updateAgent);
router.put('/profile', updateProfile);

export default router;
