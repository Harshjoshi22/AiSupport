import mongoose from 'mongoose';

const agentInvitationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
  },
  {
    timestamps: true,
  }
);

agentInvitationSchema.index({ agentId: 1, status: 1 });
agentInvitationSchema.index({ organizationId: 1, agentId: 1 });

export const AgentInvitation = mongoose.model('AgentInvitation', agentInvitationSchema);
