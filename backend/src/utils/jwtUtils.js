const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate access token
 * @param {Object} payload - Client data to encode in token
 * @returns {String} JWT access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'access'
    },
    JWT_SECRET,
    {
      expiresIn: JWT_ACCESS_EXPIRY,
      issuer: 'auth-service',
      audience: 'client-app'
    }
  );
};

/**
 * Generate refresh token
 * @param {Object} payload - Client data to encode in token
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      type: 'refresh'
    },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRY,
      issuer: 'auth-service',
      audience: 'client-app'
    }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'auth-service',
      audience: 'client-app'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Hash token for storage in database
 * @param {String} token - Token to hash
 * @returns {String} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  hashToken
};

