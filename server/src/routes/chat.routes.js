import express from 'express';
import {
  getConversations,
  getConversationById,
  startConversation,
  sendMessage,
  escalateConversation,
  takeOverConversation,
  resolveConversation,
  summarizeChat,
  suggestReply,
} from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAgentOrAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getConversations);
router.post('/start', startConversation);
router.get('/:id', getConversationById);
router.post('/:id/messages', sendMessage);
router.post('/:id/escalate', escalateConversation);
router.post('/:id/takeover', requireAgentOrAdmin, takeOverConversation);
router.post('/:id/resolve', requireAgentOrAdmin, resolveConversation);
router.post('/:id/summarize', requireAgentOrAdmin, summarizeChat);
router.post('/:id/suggest-reply', requireAgentOrAdmin, suggestReply);

export default router;
