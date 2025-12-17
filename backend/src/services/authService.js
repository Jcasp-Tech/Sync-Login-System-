const { Client, Token, AuditLog } = require('../models');
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/jwtUtils');

/**
 * Register a new client
 * @param {Object} clientData - Client registration data
 * @param {String} clientData.full_name - Client's full name
 * @param {String} clientData.position_title - Client's job title/position
 * @param {String} clientData.email_address - Client's email address
 * @param {String} clientData.phone_no - Client's contact number
 * @param {String} clientData.industry - Industry the client belongs to
 * @param {String} clientData.password - Client's password (will be hashed)
 * @returns {Promise<Object>} Created client data (without password)
 */
const registerUser = async (clientData) => {
  const { full_name, position_title, email_address, phone_no, industry, password } = clientData;

  // Check if client already exists
  const existingClient = await Client.findOne({ 
    email_address: email_address.toLowerCase().trim() 
  });

  if (existingClient) {
    throw new Error('Client with this email already exists');
  }

  // Hash password
  const password_hash = await hashPassword(password);

  // Create new client
  const client = await Client.create({
    full_name: full_name.trim(),
    position_title: position_title.trim(),
    email_address: email_address.toLowerCase().trim(),
    phone_no: phone_no.trim(),
    industry: industry.trim(),
    password_hash,
    is_email_verified: false // Default to false, can be updated after email verification
  });

  // Return client data without password
  return {
    id: client.id,
    full_name: client.full_name,
    position_title: client.position_title,
    email_address: client.email_address,
    phone_no: client.phone_no,
    industry: client.industry,
    is_email_verified: client.is_email_verified,
    created_at: client.createdAt,
    updated_at: client.updatedAt
  };
};

/**
 * Authenticate client and generate tokens
 * @param {String} email - Client email
 * @param {String} password - Client password
 * @returns {Promise<Object>} Client data and tokens
 */
const loginUser = async (email, password) => {
  // Find client by email_address
  const client = await Client.findOne({ email_address: email.toLowerCase().trim() });
  
  if (!client) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, client.password_hash);
  
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Check if email is verified (optional, based on your requirements)
  if (!client.is_email_verified) {
    throw new Error('Email not verified. Please verify your email first.');
  }

  // Generate tokens
  const tokenPayload = {
    userId: client._id.toString(),
    email: client.email_address
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Calculate expiry dates
  const accessTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Revoke old refresh tokens for this client
  await Token.updateMany(
    { user_id: client._id, client_id: client.id, token_type: 'Refresh', revoked: false },
    { revoked: true }
  );

  // Store refresh token hash in database
  const refreshTokenHash = hashToken(refreshToken);
  await Token.create({
    user_id: client._id,
    client_id: client.id, // Use client's UUID as client_id
    token_type: 'Refresh',
    token_hash: refreshTokenHash,
    expires_at: refreshTokenExpiry,
    revoked: false
  });

  // Return client data and only accessToken (refreshToken is stored but not returned)
  return {
    client: {
      id: client.id,
      full_name: client.full_name,
      position_title: client.position_title,
      email_address: client.email_address,
      phone_no: client.phone_no,
      industry: client.industry,
      is_email_verified: client.is_email_verified
    },
    tokens: {
      accessToken,
      accessTokenExpiry: accessTokenExpiry.toISOString()
    }
  };
};

/**
 * Refresh token using access token (returns only new refresh token)
 * @param {String} accessToken - Access token
 * @returns {Promise<Object>} New refresh token
 */
const refreshAccessToken = async (accessToken) => {
  const { verifyToken, hashToken: hashTokenUtil, generateRefreshToken } = require('../utils/jwtUtils');
  
  // Verify access token
  const decoded = verifyToken(accessToken);
  
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }

  // Get client
  const client = await Client.findById(decoded.userId);
  if (!client) {
    throw new Error('Client not found');
  }

  // Revoke old refresh tokens for this client
  await Token.updateMany(
    { user_id: client._id, client_id: client.id, token_type: 'Refresh', revoked: false },
    { revoked: true }
  );

  // Generate new refresh token
  const tokenPayload = {
    userId: client._id.toString(),
    email: client.email_address
  };

  const newRefreshToken = generateRefreshToken(tokenPayload);
  
  // Calculate expiry date
  const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store new refresh token hash in database
  const refreshTokenHash = hashTokenUtil(newRefreshToken);
  await Token.create({
    user_id: client._id,
    client_id: client.id, // Use client's UUID as client_id
    token_type: 'Refresh',
    token_hash: refreshTokenHash,
    expires_at: refreshTokenExpiry,
    revoked: false
  });

  return {
    refreshToken: newRefreshToken,
    refreshTokenExpiry: refreshTokenExpiry.toISOString()
  };
};

/**
 * Logout client by revoking refresh token
 * @param {String} refreshToken - Refresh token to revoke
 * @returns {Promise<void>}
 */
const logoutUser = async (refreshToken) => {
  const { verifyToken, hashToken } = require('../utils/jwtUtils');
  
  try {
    // Verify and decode refresh token to get userId
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    const tokenHash = hashToken(refreshToken);
    
    // Get client to get client_id
    const client = await Client.findById(decoded.userId);
    if (!client) {
      throw new Error('Client not found');
    }

    // Revoke the refresh token
    const result = await Token.updateOne(
      {
        user_id: decoded.userId,
        client_id: client.id,
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
  } catch (error) {
    // If token is invalid, still return success to prevent token enumeration
    // In production, you might want to log this for security monitoring
    throw new Error('Invalid refresh token');
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser
};

