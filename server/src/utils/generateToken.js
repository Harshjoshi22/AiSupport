import jwt from 'jsonwebtoken';

export const generateToken = (userId, role, organizationId) => {
  const secret = process.env.JWT_SECRET || 'ai_supporthub_secret_key_default';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: userId,
      role,
      organizationId,
    },
    secret,
    { expiresIn }
  );
};
