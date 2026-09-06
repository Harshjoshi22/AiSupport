import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeDocument',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      default: [],
    },
    metadata: {
      title: { type: String, default: '' },
      chunkIndex: { type: Number, default: 0 },
      totalChunks: { type: Number, default: 1 },
      category: { type: String, default: 'General' },
      tags: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

knowledgeChunkSchema.index({ organizationId: 1, documentId: 1 });
knowledgeChunkSchema.index({ organizationId: 1, content: 'text' });

export const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
