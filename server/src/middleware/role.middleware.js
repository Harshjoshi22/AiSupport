import { ApiError } from '../utils/ApiError.js';

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access forbidden: Role '${req.user ? req.user.role : 'UNKNOWN'}' is not authorized to access this resource`
        )
      );
    }
    next();
  };
};

export const requireOwner = authorizeRoles('OWNER');
export const requireAdmin = authorizeRoles('OWNER', 'ADMIN');
export const requireAgent = authorizeRoles('AGENT');
export const requireAgentOrAdmin = authorizeRoles('OWNER', 'ADMIN', 'AGENT');
export const requireCustomer = authorizeRoles('CUSTOMER');

export const requireCompanyMember = (req, res, next) => {
  if (!req.user || !req.user.organizationId) {
    return next(
      new ApiError(403, 'Access forbidden: You do not currently belong to an active company workspace.')
    );
  }
  next();
};
