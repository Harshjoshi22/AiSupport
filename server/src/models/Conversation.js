import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    title: {
      type: String,
      default: 'New Support Conversation',
      trim: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'HUMAN_REQUIRED', 'RESOLVED', 'open', 'human_required', 'resolved', 'active', 'waiting_human', 'agent_active', 'closed'],
      default: 'OPEN',
      set: (v) => {
        if (!v) return 'OPEN';
        const upper = v.toUpperCase();
        if (upper === 'ACTIVE') return 'OPEN';
        if (upper === 'WAITING_HUMAN' || upper === 'AGENT_ACTIVE') return 'HUMAN_REQUIRED';
        if (upper === 'CLOSED') return 'RESOLVED';
        return upper;
      },
      index: true,
    },
    mode: {
      type: String,
      enum: ['ai', 'human'],
      default: 'ai',
      index: true,
    },
    escalationReason: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ organizationId: 1, customerId: 1, status: 1 });
conversationSchema.index({ organizationId: 1, assignedAgentId: 1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
