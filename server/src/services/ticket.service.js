import { Ticket } from '../models/Ticket.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { classifyTicket } from './ai/ticketClassifier.js';
import { summarizeConversation } from './ai/summarizer.js';
import { suggestAgentReply } from './ai/replySuggester.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const createTicketWithAI = async ({ organizationId, customerId, title, description, conversationId }) => {
  // If conversation exists, get history for better AI classification
  let history = [];
  if (conversationId) {
    history = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean();
  }

  const classification = await classifyTicket({
    title,
    description,
    conversationContext: history.map((m) => `${m.senderType}: ${m.content}`).join(' | '),
  });

  const summary = await summarizeConversation(history.length > 0 ? history : [{ senderType: 'customer', content: description }]);

  const ticket = await Ticket.create({
    organizationId,
    customerId,
    conversationId: conversationId || null,
    title,
    description,
    category: classification.category,
    priority: classification.priority,
    status: 'open',
    aiSummary: summary,
  });

  if (conversationId) {
    await Conversation.findByIdAndUpdate(conversationId, {
      ticketId: ticket._id,
      status: 'waiting_human',
      mode: 'human',
      summary: summary.shortSummary,
    });
  }

  return ticket;
};

export const updateTicketDetails = async ({ organizationId, ticketId, updates, user }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, organizationId });
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  if (updates.status) {
    const normStatus = updates.status.toUpperCase();
    ticket.status = normStatus;
    if (normStatus === 'RESOLVED') {
      ticket.resolvedAt = new Date();
      if (ticket.conversationId) {
        await Conversation.findByIdAndUpdate(ticket.conversationId, { status: 'RESOLVED' });
      }
    } else if (normStatus === 'HUMAN_REQUIRED') {
      if (ticket.conversationId) {
        await Conversation.findByIdAndUpdate(ticket.conversationId, { status: 'HUMAN_REQUIRED', mode: 'human' });
      }
    } else if (normStatus === 'OPEN') {
      if (ticket.conversationId) {
        await Conversation.findByIdAndUpdate(ticket.conversationId, { status: 'OPEN', mode: 'ai' });
      }
    }
  }

  if (updates.priority) ticket.priority = updates.priority;
  if (updates.category) ticket.category = updates.category;
  if (updates.assignedAgentId !== undefined) ticket.assignedAgentId = updates.assignedAgentId;

  await ticket.save();
  return ticket;
};

export const addTicketInternalNote = async ({ organizationId, ticketId, authorId, note }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, organizationId });
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  ticket.internalNotes.push({
    authorId,
    note,
    createdAt: new Date(),
  });

  await ticket.save();
  return ticket;
};

export const getAgentSuggestedReply = async ({ organizationId, ticketId, agentName }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, organizationId }).populate('customerId', 'name email');
  if (!ticket) {
    throw new ApiError(404, 'Ticket not found');
  }

  let conversationHistory = [];
  if (ticket.conversationId) {
    conversationHistory = await Message.find({ conversationId: ticket.conversationId }).sort({ createdAt: 1 }).lean();
  }

  const reply = await suggestAgentReply({
    organizationId,
    ticket,
    conversationHistory,
    agentName,
  });

  return reply;
};
