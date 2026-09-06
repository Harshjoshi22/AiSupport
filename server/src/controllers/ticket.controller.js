import { Ticket } from '../models/Ticket.js';
import { Conversation } from '../models/Conversation.js';
import {
  createTicketWithAI,
  updateTicketDetails,
  addTicketInternalNote,
  getAgentSuggestedReply,
} from '../services/ticket.service.js';
import { ApiError } from '../utils/ApiError.js';
import { getIO } from '../socket/socket.js';

export const getTickets = async (req, res, next) => {
  try {
    const { status, priority, category, assigned, search } = req.query;
    const query = { organizationId: req.organizationId };

    // Role scoping
    if (req.user.role === 'CUSTOMER') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'AGENT' && assigned === 'me') {
      query.assignedAgentId = req.user._id;
    }

    if (status && status !== 'all') {
      const upper = status.toUpperCase();
      if (upper === 'OPEN') {
        query.status = { $in: ['OPEN', 'open'] };
      } else if (upper === 'HUMAN_REQUIRED' || upper === 'IN_PROGRESS' || upper === 'WAITING_CUSTOMER') {
        query.status = { $in: ['HUMAN_REQUIRED', 'human_required', 'in_progress', 'IN_PROGRESS', 'waiting_customer', 'WAITING_CUSTOMER'] };
      } else if (upper === 'RESOLVED' || upper === 'CLOSED') {
        query.status = { $in: ['RESOLVED', 'resolved', 'closed', 'CLOSED'] };
      } else {
        query.status = { $regex: `^${status}$`, $options: 'i' };
      }
    }
    if (priority && priority !== 'all') query.priority = { $regex: `^${priority}$`, $options: 'i' };
    if (category && category !== 'all') query.category = { $regex: `^${category}$`, $options: 'i' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar')
      .populate('conversationId', 'title status mode')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = { _id: id, organizationId: req.organizationId };

    if (req.user.role === 'CUSTOMER') {
      query.customerId = req.user._id;
    }

    const ticket = await Ticket.findOne(query)
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar')
      .populate('conversationId')
      .populate('internalNotes.authorId', 'name email avatar role');

    if (!ticket) {
      return next(new ApiError(404, 'Ticket not found'));
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    const { title, description, conversationId, category, priority } = req.body;

    const ticket = await createTicketWithAI({
      organizationId: req.organizationId,
      customerId: req.user._id,
      title,
      description,
      conversationId,
    });

    // Override with manual values if explicitly provided
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;
    await ticket.save();

    const io = getIO();
    if (io) {
      io.to(`org:${req.organizationId}`).emit('new_ticket', ticket);
    }

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const ticket = await updateTicketDetails({
      organizationId: req.organizationId,
      ticketId: id,
      updates,
      user: req.user,
    });

    const io = getIO();
    if (io) {
      io.to(`ticket:${ticket._id}`).emit('ticket_updated', ticket);
      io.to(`org:${req.organizationId}`).emit('ticket_status_changed', {
        ticketId: ticket._id,
        status: ticket.status,
        priority: ticket.priority,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;

    const ticket = await Ticket.findOne({ _id: id, organizationId: req.organizationId });
    if (!ticket) {
      return next(new ApiError(404, 'Ticket not found'));
    }

    ticket.assignedAgentId = agentId || req.user._id;
    if (ticket.status === 'open') {
      ticket.status = 'in_progress';
    }
    await ticket.save();

    if (ticket.conversationId) {
      await Conversation.findByIdAndUpdate(ticket.conversationId, {
        assignedAgentId: ticket.assignedAgentId,
        status: 'agent_active',
        mode: 'human',
      });
    }

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar');

    const io = getIO();
    if (io) {
      io.to(`ticket:${ticket._id}`).emit('ticket_updated', populatedTicket);
      io.to(`org:${req.organizationId}`).emit('ticket_updated', populatedTicket);
      io.to(`org:${req.organizationId}`).emit('ticket_status_changed', {
        ticketId: populatedTicket._id,
        status: populatedTicket.status,
        priority: populatedTicket.priority,
        ticket: populatedTicket,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket: populatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

export const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || !note.trim()) {
      return next(new ApiError(400, 'Note cannot be empty'));
    }

    const ticket = await addTicketInternalNote({
      organizationId: req.organizationId,
      ticketId: id,
      authorId: req.user._id,
      note: note.trim(),
    });

    const populatedTicket = await Ticket.findById(ticket._id).populate('internalNotes.authorId', 'name role avatar');

    res.status(200).json({
      success: true,
      message: 'Internal note added',
      internalNotes: populatedTicket.internalNotes,
    });
  } catch (error) {
    next(error);
  }
};

export const getSuggestedReplyForTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reply = await getAgentSuggestedReply({
      organizationId: req.organizationId,
      ticketId: id,
      agentName: req.user.name,
    });

    res.status(200).json({
      success: true,
      suggestedReply: reply,
    });
  } catch (error) {
    next(error);
  }
};
