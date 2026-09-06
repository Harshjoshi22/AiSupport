import express from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  addNote,
  getSuggestedReplyForTicket,
} from '../controllers/ticket.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireAgentOrAdmin } from '../middleware/role.middleware.js';
import { validateCreateTicket, validateUpdateTicket } from '../validators/ticket.validator.js';

const router = express.Router();

router.use(protect);

router.get('/', getTickets);
router.post('/', validateCreateTicket, createTicket);
router.get('/:id', getTicketById);
router.put('/:id', validateUpdateTicket, updateTicket);
router.put('/:id/assign', requireAgentOrAdmin, assignTicket);
router.post('/:id/notes', requireAgentOrAdmin, addNote);
router.get('/:id/suggest-reply', requireAgentOrAdmin, getSuggestedReplyForTicket);

export default router;
