/**
 * Splits raw text into meaningful chunks with overlap for RAG retrieval
 */
export const chunkText = (text, options = {}) => {
  const { chunkSize = 400, overlap = 50 } = options;

  if (!text || typeof text !== 'string') {
    return [];
  }

  // Clean and normalize text
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Split into paragraphs / logical sections first
  const paragraphs = cleanText.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;

  for (const para of paragraphs) {
    const words = para.split(/\s+/);

    if (words.length > chunkSize) {
      // Split large paragraph into sliding windows
      for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const windowWords = words.slice(i, i + chunkSize);
        if (windowWords.length > 0) {
          chunks.push(windowWords.join(' '));
        }
      }
      continue;
    }

    if (currentWordCount + words.length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n\n'));
      // Keep overlap from end of previous paragraph if feasible
      currentChunk = [para];
      currentWordCount = words.length;
    } else {
      currentChunk.push(para);
      currentWordCount += words.length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n\n'));
  }

  // If no chunks produced (e.g. single small line), return array with the clean text
  return chunks.length > 0 ? chunks : [cleanText];
};
