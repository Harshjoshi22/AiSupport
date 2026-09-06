import { ApiError } from '../utils/ApiError.js';

export const validateRegisterCompany = (req, res, next) => {
  const { companyName, name, email, password } = req.body;
  const errors = [];

  if (!companyName || companyName.trim().length < 2) {
    errors.push('Company name must be at least 2 characters long');
  }
  if (!name || name.trim().length < 2) {
    errors.push('Your name must be at least 2 characters long');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }
  next();
};

export const validateRegisterAgent = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }
  next();
};

export const validateAdminJoinRequest = (req, res, next) => {
  const { name, email, password, adminJoinKey } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!adminJoinKey || adminJoinKey.trim().length < 4) {
    errors.push('A valid Company Admin Join Key is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }
  next();
};

export const validateCustomerRegister = (req, res, next) => {
  const { name, email, password, organizationSlug } = req.body;
  const errors = [];

  if (!organizationSlug) {
    errors.push('Valid company support link is required');
  }
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }
  next();
};

export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (role && !['OWNER', 'ADMIN', 'AGENT', 'CUSTOMER'].includes(role)) {
    errors.push('Invalid role specified');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};
