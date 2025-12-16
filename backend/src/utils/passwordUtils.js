const bcrypt = require('bcrypt');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Hash password using bcrypt
 * @param {String} password - Plain text password
 * @returns {Promise<String>} Hashed password
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

/**
 * Verify password against hash
 * @param {String} password - Plain text password
 * @param {String} hash - Hashed password
 * @returns {Promise<Boolean>} True if password matches
 */
const verifyPassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error('Error verifying password');
  }
};

module.exports = {
  hashPassword,
  verifyPassword
};

