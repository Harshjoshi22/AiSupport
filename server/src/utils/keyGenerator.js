import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Generates a human-friendly format like 'ABCD-92FK-XP81'
export const generateAdminJoinKey = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const generateChunk = (len) => {
    let result = '';
    const randomBytes = crypto.randomBytes(len);
    for (let i = 0; i < len; i++) {
      result += chars[randomBytes[i] % chars.length];
    }
    return result;
  };

  return `${generateChunk(4)}-${generateChunk(4)}-${generateChunk(4)}`;
};

export const hashJoinKey = async (plainKey) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainKey.trim().toUpperCase(), salt);
};

export const verifyJoinKey = async (plainKey, hashedKey) => {
  if (!plainKey || !hashedKey) return false;
  return bcrypt.compare(plainKey.trim().toUpperCase(), hashedKey);
};
