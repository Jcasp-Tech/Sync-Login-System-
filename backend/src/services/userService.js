const getUserModel = require('../models/userModel');
const { Token, AuditLog } = require('../models');
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/jwtUtils');

/**
 * Register a new user for a client
 * @param {String} clientId - The client ID (from access key)
 * @param {Object} userData - User registration data
 * @param {String} userData.email - User email
 * @param {String} userData.password - User password (will be hashed)
 * @param {String} userData.name - User name (optional)
 * @param {Object} userData.custom_fields - Custom fields (optional)
 * @param {String} ipAddress - IP address for audit log
 * @param {String} userAgent - User agent for audit log
 * @returns {Promise<Object>} Created user data and tokens
 */
const registerUser = async (clientId, userData, ipAddress, userAgent) => {
  const { email, password, name, custom_fields } = userData;

  // Get the user model for this client
  const User = getUserModel(clientId);

  // Check if user already exists in this client's collection
  const existingUser = await User.findOne({ 
    email: email.toLowerCase().trim(),
    client_id: clientId
  });

  if (existingUser) {
    // Log failed registration attempt
    await AuditLog.create({
      user_id: null,
      client_id: clientId,
      action: 'REGISTER',
      ip_address: ipAddress,
      user_agent: userAgent
    });
    throw new Error('User with this email already exists');
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Create new user
  const user = await User.create({
    email: email.toLowerCase().trim(),
    password_hash,
    name: name ? name.trim() : null,
    custom_fields: custom_fields || {},
    client_id: clientId,
    is_email_verified: false
  });

  // Generate tokens
  const tokenPayload = {
    userId: user.id, // Use UUID string, not ObjectId
    email: user.email,
    clientId: clientId
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Calculate expiry dates
  const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store refresh token hash in database
  const refreshTokenHash = hashToken(refreshToken);
  await Token.create({
    user_id: user.id, // Store as string UUID
    client_id: clientId,
    token_type: 'Refresh',
    token_hash: refreshTokenHash,
    expires_at: refreshTokenExpiry,
    revoked: false
  });

  // Log successful registration
  await AuditLog.create({
    user_id: user.id,
    client_id: clientId,
    action: 'REGISTER',
    ip_address: ipAddress,
    user_agent: userAgent
  });

  // Return user data and tokens
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      custom_fields: user.custom_fields,
      is_email_verified: user.is_email_verified,
      created_at: user.createdAt
    },
    tokens: {
      accessToken,
      refreshToken,
      accessTokenExpiry: accessTokenExpiry.toISOString(),
      refreshTokenExpiry: refreshTokenExpiry.toISOString()
    }
  };
};

/**
 * Authenticate user and generate tokens
 * @param {String} clientId - The client ID (from access key)
 * @param {String} email - User email
 * @param {String} password - User password
 * @param {String} ipAddress - IP address for audit log
 * @param {String} userAgent - User agent for audit log
 * @returns {Promise<Object>} User data and tokens
 */
const loginUser = async (clientId, email, password, ipAddress, userAgent) => {
  // Get the user model for this client
  const User = getUserModel(clientId);

  // Find user by email and client_id
  const user = await User.findOne({ 
    email: email.toLowerCase().trim(),
    client_id: clientId
  });

  if (!user) {
    // Log failed login attempt
    await AuditLog.create({
      user_id: null,
      client_id: clientId,
      action: 'FAILED_LOGIN',
      ip_address: ipAddress,
      user_agent: userAgent
    });
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password_hash);

  if (!isPasswordValid) {
    // Log failed login attempt
    await AuditLog.create({
      user_id: user.id,
      client_id: clientId,
      action: 'FAILED_LOGIN',
      ip_address: ipAddress,
      user_agent: userAgent
    });
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    clientId: clientId
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Calculate expiry dates
  const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Revoke old refresh tokens for this user
  await Token.updateMany(
    { user_id: user.id, client_id: clientId, token_type: 'Refresh', revoked: false },
    { revoked: true }
  );

  // Store refresh token hash in database
  const refreshTokenHash = hashToken(refreshToken);
  await Token.create({
    user_id: user.id,
    client_id: clientId,
    token_type: 'Refresh',
    token_hash: refreshTokenHash,
    expires_at: refreshTokenExpiry,
    revoked: false
  });

  // Log successful login
  await AuditLog.create({
    user_id: user.id,
    client_id: clientId,
    action: 'LOGIN',
    ip_address: ipAddress,
    user_agent: userAgent
  });

  // Return user data and tokens
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      custom_fields: user.custom_fields,
      is_email_verified: user.is_email_verified
    },
    tokens: {
      accessToken,
      refreshToken,
      accessTokenExpiry: accessTokenExpiry.toISOString(),
      refreshTokenExpiry: refreshTokenExpiry.toISOString()
    }
  };
};

/**
 * Refresh access token using refresh token
 * @param {String} clientId - The client ID
 * @param {String} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens
 */
const refreshAccessToken = async (clientId, refreshToken) => {
  const { verifyToken } = require('../utils/jwtUtils');

  // Verify refresh token
  const decoded = verifyToken(refreshToken);

  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  // Verify client_id matches
  if (decoded.clientId !== clientId) {
    throw new Error('Token client mismatch');
  }

  // Get user model
  const User = getUserModel(clientId);
  const user = await User.findOne({ id: decoded.userId, client_id: clientId });

  if (!user) {
    throw new Error('User not found');
  }

  // Verify refresh token exists and is valid
  const tokenHash = hashToken(refreshToken);
  const storedToken = await Token.findOne({
    user_id: decoded.userId,
    client_id: clientId,
    token_hash: tokenHash,
    token_type: 'Refresh',
    revoked: false,
    expires_at: { $gt: new Date() }
  });

  if (!storedToken) {
    throw new Error('Invalid or expired refresh token');
  }

  // Revoke old refresh tokens for this user
  await Token.updateMany(
    { user_id: user.id, client_id: clientId, token_type: 'Refresh', revoked: false },
    { revoked: true }
  );

  // Generate new tokens
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    clientId: clientId
  };

  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  // Calculate expiry dates
  const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store new refresh token hash in database
  const refreshTokenHash = hashToken(newRefreshToken);
  await Token.create({
    user_id: user.id,
    client_id: clientId,
    token_type: 'Refresh',
    token_hash: refreshTokenHash,
    expires_at: refreshTokenExpiry,
    revoked: false
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenExpiry: accessTokenExpiry.toISOString(),
    refreshTokenExpiry: refreshTokenExpiry.toISOString()
  };
};

/**
 * Logout user by revoking refresh token
 * @param {String} clientId - The client ID
 * @param {String} refreshToken - Refresh token to revoke
 * @param {String} ipAddress - IP address for audit log
 * @param {String} userAgent - User agent for audit log
 * @returns {Promise<void>}
 */
const logoutUser = async (clientId, refreshToken, ipAddress, userAgent) => {
  const { verifyToken, hashToken } = require('../utils/jwtUtils');

  try {
    // Verify and decode refresh token
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Verify client_id matches
    if (decoded.clientId !== clientId) {
      throw new Error('Token client mismatch');
    }

    const tokenHash = hashToken(refreshToken);

    // Revoke the refresh token
    const result = await Token.updateOne(
      {
        user_id: decoded.userId,
        client_id: clientId,
        token_hash: tokenHash,
        token_type: 'Refresh'
      },
      {
        revoked: true
      }
    );

    if (result.matchedCount === 0) {
      throw new Error('Token not found');
    }

    // Log logout
    await AuditLog.create({
      user_id: decoded.userId,
      client_id: clientId,
      action: 'LOGOUT',
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (error) {
    // If token is invalid, still return success to prevent token enumeration
    throw new Error('Invalid refresh token');
  }
};

/**
 * Get user by ID
 * @param {String} clientId - The client ID
 * @param {String} userId - User ID
 * @returns {Promise<Object>} User data
 */
const getUserById = async (clientId, userId) => {
  const User = getUserModel(clientId);
  const user = await User.findOne({ id: userId, client_id: clientId });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    custom_fields: user.custom_fields,
    is_email_verified: user.is_email_verified,
    created_at: user.createdAt,
    updated_at: user.updatedAt
  };
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserById
};
