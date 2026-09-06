import { KnowledgeChunk } from '../../models/KnowledgeChunk.js';
import { generateEmbedding } from './embeddingService.js';
import { logger } from '../../utils/logger.js';

// Cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const retrieveRelevantKnowledge = async (organizationId, query, limit = 4) => {
  try {
    if (!query || typeof query !== 'string') return [];

    const cleanQuery = query.trim().toLowerCase();
    const commonGreetings = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'sup', 'yo', 'thanks', 'thank you', 'ok', 'okay', 'bye'];
    if (commonGreetings.includes(cleanQuery)) {
      // Pure greetings do not require knowledge chunks
      return [];
    }

    // Step 1: Query embedding
    const queryVector = await generateEmbedding(query);

    // Step 2: Fetch chunks belonging exclusively to this organization
    const chunks = await KnowledgeChunk.find({ organizationId }).lean();

    if (!chunks || chunks.length === 0) {
      logger.info(`No knowledge chunks found for organization ${organizationId}`);
      return [];
    }

    // Step 3: Compute scores using Vector Similarity + Keyword Matching
    const queryTokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    const scoredChunks = chunks.map((chunk) => {
      let vectorScore = 0;
      if (chunk.embedding && chunk.embedding.length > 0) {
        vectorScore = cosineSimilarity(queryVector, chunk.embedding);
      }

      // Keyword boost
      const contentLower = (chunk.content || '').toLowerCase();
      let keywordHits = 0;
      queryTokens.forEach((token) => {
        if (contentLower.includes(token)) {
          keywordHits++;
        }
      });
      const keywordScore = queryTokens.length > 0 ? keywordHits / queryTokens.length : 0;

      // Combined score (70% vector + 30% keyword)
      const combinedScore = vectorScore * 0.7 + keywordScore * 0.3;

      return {
        ...chunk,
        score: combinedScore,
      };
    });

    // Step 4: Filter by minimum relevance threshold and sort descending
    const relevantChunks = scoredChunks.filter((c) => c.score > 0.15);
    relevantChunks.sort((a, b) => b.score - a.score);

    const topResults = relevantChunks.slice(0, limit);
    logger.debug(`Retrieved ${topResults.length} knowledge chunks for query: "${query.substring(0, 50)}..."`);
    return topResults;
  } catch (error) {
    logger.error(`Error in retrieveRelevantKnowledge: ${error.message}`);
    return [];
  }
};
