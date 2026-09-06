import { KnowledgeDocument } from '../models/KnowledgeDocument.js';
import { KnowledgeChunk } from '../models/KnowledgeChunk.js';
import { parseDocument } from '../services/knowledge/documentParser.js';
import { chunkText } from '../services/knowledge/textChunker.js';
import { generateEmbedding } from '../services/knowledge/embeddingService.js';
import { retrieveRelevantKnowledge } from '../services/knowledge/retrievalService.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';

// Helper to chunk, generate embeddings, and save
const processAndIndexDocument = async (doc, content) => {
  try {
    doc.processingStatus = 'processing';
    await doc.save();

    // 1. Remove old chunks if re-indexing
    await KnowledgeChunk.deleteMany({ documentId: doc._id, organizationId: doc.organizationId });

    // 2. Chunk text
    const chunks = chunkText(content, { chunkSize: 350, overlap: 50 });

    if (chunks.length === 0) {
      doc.processingStatus = 'completed';
      doc.chunkCount = 0;
      await doc.save();
      return;
    }

    // 3. Generate embeddings and save chunks
    const chunkDocs = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      const embedding = await generateEmbedding(chunkContent);

      chunkDocs.push({
        organizationId: doc.organizationId,
        documentId: doc._id,
        content: chunkContent,
        embedding,
        metadata: {
          title: doc.title,
          chunkIndex: i,
          totalChunks: chunks.length,
          category: doc.category,
          tags: doc.tags || [],
        },
      });
    }

    await KnowledgeChunk.insertMany(chunkDocs);

    doc.chunkCount = chunkDocs.length;
    doc.processingStatus = 'completed';
    doc.errorMessage = '';
    await doc.save();
    logger.success(`Indexed document "${doc.title}" with ${chunkDocs.length} chunks.`);
  } catch (error) {
    logger.error(`Failed to index document ${doc._id}: ${error.message}`);
    doc.processingStatus = 'failed';
    doc.errorMessage = error.message;
    await doc.save();
  }
};

export const getKnowledgeList = async (req, res, next) => {
  try {
    const { category, search, sourceType, status } = req.query;
    const query = { organizationId: req.organizationId };

    if (category && category !== 'all') query.category = category;
    if (sourceType) query.sourceType = sourceType;
    if (status) query.processingStatus = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { rawContent: { $regex: search, $options: 'i' } },
      ];
    }

    const documents = await KnowledgeDocument.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

export const createKnowledge = async (req, res, next) => {
  try {
    const { title, category = 'General', rawContent, sourceType = 'manual', tags = [] } = req.body;

    const doc = await KnowledgeDocument.create({
      organizationId: req.organizationId,
      title,
      category,
      rawContent,
      sourceType,
      fileType: sourceType === 'faq' ? 'faq' : 'text',
      processingStatus: 'pending',
      tags: Array.isArray(tags) ? tags : [],
    });

    // Process indexing asynchronously
    processAndIndexDocument(doc, rawContent);

    res.status(201).json({
      success: true,
      message: 'Knowledge item created and indexing started',
      document: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadKnowledgeDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please upload a document file (PDF, DOCX, TXT)'));
    }

    const { title, category = 'General', tags = [] } = req.body;
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const ext = originalName.split('.').pop().toLowerCase();

    // Extract text from file
    let extractedText = '';
    try {
      extractedText = await parseDocument(filePath, ext);
    } catch (parseError) {
      // Clean up temp file
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return next(new ApiError(400, `Could not parse file: ${parseError.message}`));
    }

    const doc = await KnowledgeDocument.create({
      organizationId: req.organizationId,
      title: title || originalName,
      category,
      fileUrl: req.file.path,
      fileType: ext,
      rawContent: extractedText,
      sourceType: 'upload',
      processingStatus: 'pending',
      tags: typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags,
    });

    // Index document
    processAndIndexDocument(doc, extractedText);

    // Clean up local temp file after processing starts if needed
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {}
      }
    }, 10000);

    res.status(201).json({
      success: true,
      message: 'Document uploaded and processing queued',
      document: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const updateKnowledge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, rawContent, tags } = req.body;

    const doc = await KnowledgeDocument.findOne({ _id: id, organizationId: req.organizationId });
    if (!doc) {
      return next(new ApiError(404, 'Knowledge document not found'));
    }

    if (title) doc.title = title;
    if (category) doc.category = category;
    if (tags !== undefined) doc.tags = Array.isArray(tags) ? tags : [];

    let contentChanged = false;
    if (rawContent && rawContent !== doc.rawContent) {
      doc.rawContent = rawContent;
      contentChanged = true;
    }

    await doc.save();

    if (contentChanged) {
      processAndIndexDocument(doc, doc.rawContent);
    }

    res.status(200).json({
      success: true,
      message: 'Knowledge document updated',
      document: doc,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteKnowledge = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doc = await KnowledgeDocument.findOneAndDelete({ _id: id, organizationId: req.organizationId });
    if (!doc) {
      return next(new ApiError(404, 'Knowledge document not found'));
    }

    // Delete all chunks
    await KnowledgeChunk.deleteMany({ documentId: id, organizationId: req.organizationId });

    res.status(200).json({
      success: true,
      message: 'Knowledge document and indexed chunks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const testKnowledgeSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      return next(new ApiError(400, 'Search query is required'));
    }

    const results = await retrieveRelevantKnowledge(req.organizationId, query, 5);

    res.status(200).json({
      success: true,
      query,
      results,
    });
  } catch (error) {
    next(error);
  }
};
