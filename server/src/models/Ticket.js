import mongoose from 'mongoose';

const internalNoteSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ticketSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
      default: () => `TICK-${Math.floor(100000 + Math.random() * 900000)}`,
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
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Ticket title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Ticket description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Billing', 'Technical', 'Account', 'Course/Product', 'Courses', 'Refund', 'General'],
      default: 'General',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'HUMAN_REQUIRED', 'RESOLVED', 'open', 'human_required', 'resolved', 'in_progress', 'closed', 'waiting_customer'],
      default: 'OPEN',
      set: (v) => {
        if (!v) return 'OPEN';
        const upper = v.toUpperCase();
        if (upper === 'IN_PROGRESS' || upper === 'WAITING_CUSTOMER') return 'HUMAN_REQUIRED';
        if (upper === 'CLOSED') return 'RESOLVED';
        return upper;
      },
      index: true,
    },
    aiSummary: {
      shortSummary: { type: String, default: '' },
      keyDetails: [{ type: String }],
      customerProblem: { type: String, default: '' },
      suggestedAction: { type: String, default: '' },
    },
    internalNotes: [internalNoteSchema],
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.index({ organizationId: 1, status: 1, priority: 1 });
ticketSchema.index({ organizationId: 1, assignedAgentId: 1, status: 1 });

export const Ticket = mongoose.model('Ticket', ticketSchema);
