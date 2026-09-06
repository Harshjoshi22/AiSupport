import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication token missing or invalid. Please log in.'));
    }

    const secret = process.env.JWT_SECRET || 'ai_supporthub_secret_key_default';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return next(new ApiError(401, 'Session expired or invalid token. Please log in again.'));
    }

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return next(new ApiError(401, 'User associated with this token no longer exists.'));
    }

    // Allowed active statuses: 'active', 'ACTIVE', 'AVAILABLE'
    const activeStatuses = ['active', 'ACTIVE', 'AVAILABLE'];
    if (!activeStatuses.includes(user.status)) {
      if (user.status === 'pending_approval') {
        return next(new ApiError(403, 'Your admin access request is pending approval by the company owner.'));
      }
      return next(new ApiError(403, 'Your account is inactive or has been deactivated. Please contact support.'));
    }

    req.user = user;
    req.organizationId = user.organizationId ? user.organizationId.toString() : null;
    next();
  } catch (error) {
    next(new ApiError(401, 'Authentication failed', [error.message]));
  }
};
