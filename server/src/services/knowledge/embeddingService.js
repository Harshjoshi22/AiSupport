import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { logger } from '../../utils/logger.js';

// Deterministic high-dimensional hash vector for local development fallback
const generateDeterministicVector = (text, dimensions = 128) => {
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

  if (words.length === 0) return vector;

  words.forEach((word, idx) => {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const bucket = Math.abs(hash) % dimensions;
    vector[bucket] += 1 / Math.sqrt(idx + 1);
  });

  // Normalize vector to unit length
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
};

export const generateEmbedding = async (text) => {
  if (!text || typeof text !== 'string') {
    return new Array(128).fill(0);
  }

  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  // Try Gemini embedding
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const embedModels = ['gemini-embedding-001', 'text-embedding-004', 'gemini-embedding-2'];
      for (const m of embedModels) {
        try {
          const model = genAI.getGenerativeModel({ model: m });
          const result = await model.embedContent(text);
          if (result && result.embedding && result.embedding.values) {
            return result.embedding.values;
          }
        } catch (e) {
          // try next
        }
      }
    } catch (err) {
      logger.warn(`Gemini embedding failed (${err.message}). Using fallback vector representation.`);
    }
  }

  // Try OpenAI embedding
  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      if (response && response.data && response.data[0]?.embedding) {
        return response.data[0].embedding;
      }
    } catch (err) {
      logger.warn(`OpenAI embedding failed (${err.message}). Using fallback vector representation.`);
    }
  }

  // Fallback vector representation
  return generateDeterministicVector(text, 128);
};
