import { ApiError } from '../utils/ApiError.js';

export const validateCreateTicket = (req, res, next) => {
  const { title, description, category, priority } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Ticket title must be at least 3 characters long');
  }

  if (!description || description.trim().length < 5) {
    errors.push('Ticket description must be at least 5 characters long');
  }

  const validCategories = ['Billing', 'Technical', 'Account', 'Course/Product', 'Refund', 'General'];
  if (category && !validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};

export const validateUpdateTicket = (req, res, next) => {
  const { category, priority, status } = req.body;
  const errors = [];

  const validCategories = ['Billing', 'Technical', 'Account', 'Course/Product', 'Refund', 'General'];
  if (category && !validCategories.includes(category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
  if (priority && !validPriorities.includes(priority)) {
    errors.push(`Priority must be one of: ${validPriorities.join(', ')}`);
  }

  const validStatuses = ['OPEN', 'HUMAN_REQUIRED', 'RESOLVED', 'open', 'human_required', 'resolved', 'in_progress', 'closed', 'waiting_customer'];
  if (status && !validStatuses.includes(status)) {
    errors.push(`Status must be one of: OPEN, HUMAN_REQUIRED, RESOLVED`);
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};
