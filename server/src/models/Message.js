import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    senderType: {
      type: String,
      enum: ['customer', 'agent', 'ai', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    metadata: {
      confidenceScore: { type: Number, default: 1.0 },
      retrievedChunkIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeChunk' }],
      suggestedReplies: [{ type: String }],
      isInternalNote: { type: Boolean, default: false },
      sourcesUsed: [{ type: String }],
      sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'frustrated'], default: 'neutral' },
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ organizationId: 1, createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
