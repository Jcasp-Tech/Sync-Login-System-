const crypto = require('crypto');

/**
 * Generate cryptographically secure random key using base64url encoding
 * @param {Number} bytes - Number of random bytes to generate
 * @returns {String} Base64url encoded string (URL-safe, no padding)
 */
const generateRandomKey = (bytes = 32) => {
  return crypto
    .randomBytes(bytes)
    .toString('base64url'); // URL-safe base64 (no +, /, = padding)
};

/**
 * Generate Access Key ID
 * Format: ak_{environment}_{random_base64url}
 * @param {String} environment - 'live' or 'test' (default: 'live')
 * @returns {String} Access key ID
 */
const generateAccessKeyId = (environment = 'live') => {
  const randomPart = generateRandomKey(24); // 24 bytes = ~32 chars base64url
  return `ak_${environment}_${randomPart}`;
};

/**
 * Generate Access Key Secret
 * Format: sk_{environment}_{random_base64url}
 * @param {String} environment - 'live' or 'test' (default: 'live')
 * @returns {String} Access key secret
 */
const generateAccessKeySecret = (environment = 'live') => {
  const randomPart = generateRandomKey(36); // 36 bytes = ~48 chars base64url
  return `sk_${environment}_${randomPart}`;
};

module.exports = {
  generateAccessKeyId,
  generateAccessKeySecret,
  generateRandomKey
};

