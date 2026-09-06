import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Ticket } from '../models/Ticket.js';
import {
  createNewSession,
  handleCustomerMessage,
  escalateConversationManually,
  resolveConversationManually,
} from '../services/conversation.service.js';
import { summarizeConversation } from '../services/ai/summarizer.js';
import { suggestAgentReply } from '../services/ai/replySuggester.js';
import { ApiError } from '../utils/ApiError.js';
import { getIO } from '../socket/socket.js';

export const getConversations = async (req, res, next) => {
  try {
    const { status, mode, search } = req.query;
    const query = { organizationId: req.organizationId };

    // Role-based visibility
    if (req.user.role === 'CUSTOMER') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'AGENT') {
      if (status === 'assigned') {
        query.assignedAgentId = req.user._id;
      }
    }

    if (status && status !== 'assigned' && status !== 'all') {
      const upper = status.toUpperCase();
      if (upper === 'WAITING_HUMAN' || upper === 'HUMAN_REQUIRED' || upper === 'AGENT_ACTIVE') {
        query.status = { $in: ['HUMAN_REQUIRED', 'human_required', 'waiting_human', 'agent_active', 'WAITING_HUMAN', 'AGENT_ACTIVE'] };
      } else if (upper === 'OPEN' || upper === 'ACTIVE') {
        query.status = { $in: ['OPEN', 'open', 'active', 'ACTIVE'] };
      } else if (upper === 'RESOLVED' || upper === 'CLOSED') {
        query.status = { $in: ['RESOLVED', 'resolved', 'closed', 'CLOSED'] };
      } else {
        query.status = { $regex: `^${status}$`, $options: 'i' };
      }
    }
    if (mode && mode !== 'all') {
      query.mode = mode.toLowerCase();
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const conversations = await Conversation.find(query)
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar')
      .populate('ticketId', 'ticketNumber category priority status')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Creates a brand new session:
 * 1. New Conversation
 * 2. New Ticket
 * 3. Initial AI welcome message
 * Returns new conversation and ticket information
 */
export const startConversation = async (req, res, next) => {
  try {
    const customerId = req.user._id;

    const { conversation, ticket, message } = await createNewSession(
      req.organizationId,
      customerId
    );

    const populatedConv = await Conversation.findById(conversation._id)
      .populate('customerId', 'name email avatar')
      .populate('ticketId');

    res.status(201).json({
      success: true,
      conversation: populatedConv,
      ticket,
      messages: [message],
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = { _id: id, organizationId: req.organizationId };

    if (req.user.role === 'CUSTOMER') {
      query.customerId = req.user._id;
    }

    const conversation = await Conversation.findOne(query)
      .populate('customerId', 'name email avatar')
      .populate('assignedAgentId', 'name email avatar')
      .populate('ticketId');

    if (!conversation) {
      return next(new ApiError(404, 'Conversation not found'));
    }

    const messages = await Message.find({
      conversationId: conversation._id,
      organizationId: req.organizationId,
    })
      .populate('senderId', 'name role avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      conversation,
      ticket: conversation.ticketId,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return next(new ApiError(400, 'Message content cannot be empty'));
    }

    const conversation = await Conversation.findOne({
      _id: id,
      organizationId: req.organizationId,
    });

    if (!conversation) {
      return next(new ApiError(404, 'Conversation not found'));
    }

    // Check authorization: customers can only message their own conversation
    if (req.user.role === 'CUSTOMER' && conversation.customerId.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Unauthorized access to this conversation'));
    }

    const io = getIO();

    if (req.user.role === 'CUSTOMER') {
      const result = await handleCustomerMessage({
        organizationId: req.organizationId,
        customerId: req.user._id,
        conversationId: conversation._id,
        content: content.trim(),
      });

      // Emit real-time Socket events
      if (io) {
        io.to(`conversation:${conversation._id}`).emit('new_message', result.customerMessage);
        if (result.aiMessage) {
          io.to(`conversation:${conversation._id}`).emit('new_message', result.aiMessage);
        }
        if (result.escalated) {
          io.to(`org:${req.organizationId}`).emit('conversation_escalated', {
            conversationId: conversation._id,
            ticket: result.ticket,
          });
          io.to(`conversation:${conversation._id}`).emit('conversation_updated', {
            status: 'HUMAN_REQUIRED',
            mode: 'human',
          });
        }
        if (result.resolved) {
          io.to(`conversation:${conversation._id}`).emit('conversation_resolved', {
            conversationId: conversation._id,
            ticket: result.ticket,
          });
          io.to(`org:${req.organizationId}`).emit('ticket_status_changed', {
            ticketId: result.ticket?._id,
            status: 'RESOLVED',
          });
        }
      }

      return res.status(200).json({
        success: true,
        customerMessage: result.customerMessage,
        aiMessage: result.aiMessage,
        escalated: result.escalated,
        resolved: result.resolved,
        ticket: result.ticket,
      });
    } else {
      // Agent or Admin sending message
      const agentMsg = await Message.create({
        organizationId: req.organizationId,
        conversationId: conversation._id,
        senderId: req.user._id,
        senderType: 'agent',
        content: content.trim(),
      });

      conversation.lastMessageAt = new Date();
      if (conversation.status === 'OPEN') {
        conversation.status = 'HUMAN_REQUIRED';
      }
      await conversation.save();

      if (io) {
        const populatedMsg = await Message.findById(agentMsg._id).populate('senderId', 'name role avatar');
        io.to(`conversation:${conversation._id}`).emit('new_message', populatedMsg);
      }

      return res.status(200).json({
        success: true,
        message: agentMsg,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const escalateConversation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await escalateConversationManually({
      organizationId: req.organizationId,
      customerId: req.user._id,
      conversationId: id,
      reason,
    });

    const io = getIO();
    if (io) {
      io.to(`conversation:${id}`).emit('conversation_escalated', {
        conversation: result.conversation,
        ticket: result.ticket,
        systemMessage: result.systemMsg,
      });
      io.to(`org:${req.organizationId}`).emit('new_ticket', result.ticket);
    }

    res.status(200).json({
      success: true,
      message: 'Conversation successfully transferred to human support queue',
      conversation: result.conversation,
      ticket: result.ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const takeOverConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findOne({
      _id: id,
      organizationId: req.organizationId,
    });

    if (!conversation) {
      return next(new ApiError(404, 'Conversation not found'));
    }

    conversation.assignedAgentId = req.user._id;
    conversation.mode = 'human';
    conversation.status = 'HUMAN_REQUIRED';
    await conversation.save();

    // If ticket attached, update assigned agent
    if (conversation.ticketId) {
      await Ticket.findByIdAndUpdate(conversation.ticketId, {
        assignedAgentId: req.user._id,
        status: 'HUMAN_REQUIRED',
      });
    }

    // System announcement message
    const systemMsg = await Message.create({
      organizationId: req.organizationId,
      conversationId: conversation._id,
      senderType: 'system',
      content: `Support Agent ${req.user.name} has joined the conversation.`,
    });

    const io = getIO();
    if (io) {
      io.to(`conversation:${conversation._id}`).emit('agent_joined', {
        agent: { _id: req.user._id, name: req.user.name },
        conversation,
        systemMessage: systemMsg,
      });
      io.to(`conversation:${conversation._id}`).emit('new_message', systemMsg);
    }

    res.status(200).json({
      success: true,
      message: 'Conversation assigned to you successfully',
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const resolveConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await resolveConversationManually({
      organizationId: req.organizationId,
      conversationId: id,
      resolvedBy: req.user,
    });

    const io = getIO();
    if (io) {
      io.to(`conversation:${id}`).emit('conversation_resolved', {
        conversation: result.conversation,
        ticket: result.ticket,
        systemMessage: result.systemMsg,
      });
      io.to(`conversation:${id}`).emit('new_message', result.systemMsg);
      io.to(`org:${req.organizationId}`).emit('ticket_status_changed', {
        ticketId: result.ticket?._id,
        status: 'RESOLVED',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Support conversation and ticket resolved successfully',
      conversation: result.conversation,
      ticket: result.ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const summarizeChat = async (req, res, next) => {
  try {
    const { id } = req.params;

    const messages = await Message.find({
      conversationId: id,
      organizationId: req.organizationId,
    }).sort({ createdAt: 1 });

    const summary = await summarizeConversation(messages);

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

export const suggestReply = async (req, res, next) => {
  try {
    const { id } = req.params;

    const conversation = await Conversation.findOne({ _id: id, organizationId: req.organizationId });
    if (!conversation) {
      return next(new ApiError(404, 'Conversation not found'));
    }

    let ticket = null;
    if (conversation.ticketId) {
      ticket = await Ticket.findById(conversation.ticketId);
    }

    const messages = await Message.find({ conversationId: id, organizationId: req.organizationId }).sort({ createdAt: 1 });

    const suggestedText = await suggestAgentReply({
      organizationId: req.organizationId,
      ticket: ticket || { title: conversation.title, description: 'Customer support request' },
      conversationHistory: messages,
      agentName: req.user.name,
    });

    res.status(200).json({
      success: true,
      suggestedReply: suggestedText,
    });
  } catch (error) {
    next(error);
  }
};
