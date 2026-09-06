import mongoose from 'mongoose';

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      default: 'General',
      enum: ['General', 'Courses', 'Pricing', 'Refund Policy', 'FAQ', 'Troubleshooting', 'Account', 'Technical'],
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      enum: ['text', 'faq', 'pdf', 'docx'],
      default: 'text',
    },
    rawContent: {
      type: String,
      default: '',
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['manual', 'upload', 'faq'],
      default: 'manual',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

knowledgeDocumentSchema.index({ organizationId: 1, processingStatus: 1 });
knowledgeDocumentSchema.index({ organizationId: 1, title: 'text', rawContent: 'text' });

export const KnowledgeDocument = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
