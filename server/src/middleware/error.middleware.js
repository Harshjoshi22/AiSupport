import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error
  logger.error(`Error handling ${req.method} ${req.originalUrl}: ${err.message}`, err.stack);

  // If not an instance of ApiError, convert standard errors
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ApiError(400, `A record with this ${field} already exists.`);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Resource not found. Invalid ID: ${err.value}`);
  }

  const response = {
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || 'An unexpected error occurred',
    errors: error.errors && error.errors.length > 0 ? error.errors : undefined,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode || 500).json(response);
};
