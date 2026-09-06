import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { handleCustomerMessage } from '../services/conversation.service.js';
import { logger } from '../utils/logger.js';

export const setupChatSocket = (io) => {
  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const secret = process.env.JWT_SECRET || 'ai_supporthub_secret_key_default';
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select('-passwordHash');

      const allowedStatuses = ['active', 'ACTIVE', 'AVAILABLE'];
      if (!user || !allowedStatuses.includes(user.status)) {
        return next(new Error('Authentication error: User account not active'));
      }

      socket.user = user;
      socket.organizationId = user.organizationId ? user.organizationId.toString() : null;
      next();
    } catch (err) {
      logger.warn(`Socket authentication failed: ${err.message}`);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    logger.info(`Socket client connected: ${user.name} (${user.role}) - Socket ID: ${socket.id}`);

    // Update user online status
    await User.findByIdAndUpdate(user._id, { isOnline: true, lastActiveAt: new Date() });

    // Join personal user room for targeted notifications, invites, and approvals
    socket.join(`user:${user._id}`);

    // Join organization-wide room if affiliated with an organization
    const orgRoom = socket.organizationId ? `org:${socket.organizationId}` : null;
    if (orgRoom) {
      socket.join(orgRoom);
    }

    // Join conversation room
    socket.on('join_conversation', async (conversationId) => {
      const room = `conversation:${conversationId}`;
      socket.join(room);
      logger.debug(`${user.name} joined room: ${room}`);

      socket.to(room).emit('user_joined_chat', {
        userId: user._id,
        userName: user.name,
        role: user.role,
      });
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      const room = `conversation:${conversationId}`;
      socket.leave(room);
      logger.debug(`${user.name} left room: ${room}`);
    });

    // Typing start indicator
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_start', {
        userId: user._id,
        userName: user.name,
        role: user.role,
      });
    });

    // Typing stop indicator
    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing_stop', {
        userId: user._id,
      });
    });

    // Send real-time chat message via socket
    socket.on('send_message', async ({ conversationId, content }, callback) => {
      try {
        if (!content || !content.trim()) {
          if (callback) callback({ error: 'Message cannot be empty' });
          return;
        }

        const conversation = await Conversation.findOne({
          _id: conversationId,
          organizationId: socket.organizationId,
        });

        if (!conversation) {
          if (callback) callback({ error: 'Conversation not found' });
          return;
        }

        if (user.role === 'CUSTOMER') {
          const result = await handleCustomerMessage({
            organizationId: socket.organizationId,
            customerId: user._id,
            conversationId: conversation._id,
            content: content.trim(),
          });

          // Broadcast customer message
          io.to(`conversation:${conversationId}`).emit('new_message', result.customerMessage);

          // Broadcast AI message if present
          if (result.aiMessage) {
            io.to(`conversation:${conversationId}`).emit('new_message', result.aiMessage);
          }

          // Broadcast escalation if triggered
          if (result.escalated) {
            io.to(orgRoom).emit('conversation_escalated', {
              conversationId,
              ticket: result.ticket,
            });
          }

          if (callback) callback({ success: true, message: result.customerMessage });
        } else {
          // Agent / Admin message
          const agentMsg = await Message.create({
            organizationId: socket.organizationId,
            conversationId: conversation._id,
            senderId: user._id,
            senderType: 'agent',
            content: content.trim(),
          });

          conversation.lastMessageAt = new Date();
          if (conversation.status === 'waiting_human') {
            conversation.status = 'agent_active';
          }
          await conversation.save();

          const populatedMsg = await Message.findById(agentMsg._id).populate('senderId', 'name role avatar');
          io.to(`conversation:${conversationId}`).emit('new_message', populatedMsg);

          if (callback) callback({ success: true, message: populatedMsg });
        }
      } catch (err) {
        logger.error(`Socket message error: ${err.message}`);
        if (callback) callback({ error: err.message });
      }
    });

    // Disconnect handler
    socket.on('disconnect', async () => {
      logger.info(`Socket client disconnected: ${user.name}`);
      await User.findByIdAndUpdate(user._id, { isOnline: false, lastActiveAt: new Date() });
    });
  });
};
