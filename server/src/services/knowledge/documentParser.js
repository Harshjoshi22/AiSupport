import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { logger } from '../../utils/logger.js';

export const parseDocument = async (filePath, fileType) => {
  try {
    const ext = (fileType || path.extname(filePath)).toLowerCase().replace('.', '');

    if (ext === 'txt' || ext === 'md') {
      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    }

    if (ext === 'pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text || '';
    }

    if (ext === 'docx' || ext === 'doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '';
    }

    // Default fallback
    const fallbackContent = fs.readFileSync(filePath, 'utf-8');
    return fallbackContent;
  } catch (error) {
    logger.error(`Error parsing document at ${filePath}: ${error.message}`);
    throw new Error(`Failed to parse document: ${error.message}`);
  }
};
