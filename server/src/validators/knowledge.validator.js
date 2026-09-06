import { ApiError } from '../utils/ApiError.js';

export const validateCreateKnowledge = (req, res, next) => {
  const { title, rawContent, sourceType } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }

  if (sourceType !== 'upload' && (!rawContent || rawContent.trim().length < 5)) {
    errors.push('Content is required and must be at least 5 characters long');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};
