const crypto = require('crypto');
const EmailVerificationToken = require('../models/emailVerificationTokenModel');
const { sendVerificationEmail } = require('./emailService');
const Client = require('../models/clientModel');
const getUserModel = require('../models/userModel');

/**
 * Generate a secure random token for email verification
 * @returns {String} Random token string
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a verification token and send verification email for client
 * @param {String} clientId - Client ID (UUID)
 * @param {String} email - Client email address
 * @param {String} userName - Client name (optional)
 * @returns {Promise<Object>} Created token information
 */
const createClientVerificationToken = async (clientId, email, userName = null) => {
  try {
    // Check if there's an existing unverified token for this client
    const existingToken = await EmailVerificationToken.findOne({
      user_id: clientId,
      client_id: clientId,
      user_type: 'client',
      is_used: false,
      verified_at: null,
      expires_at: { $gt: new Date() }
    });

    // If token exists and is still valid, return it
    if (existingToken) {
      return {
        token: existingToken.token,
        expires_at: existingToken.expires_at
      };
    }

    // Generate new token
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create verification token record
    const verificationToken = await EmailVerificationToken.create({
      user_id: clientId,
      client_id: clientId,
      token: token,
      email: email.toLowerCase().trim(),
      user_type: 'client',
      expires_at: expiresAt,
      is_used: false
    });

    return {
      token: verificationToken.token,
      expires_at: verificationToken.expires_at
    };
  } catch (error) {
    console.error('Error creating client verification token:', error);
    throw new Error(`Failed to create verification token: ${error.message}`);
  }
};

/**
 * Send verification email to client
 * @param {String} clientId - Client ID (UUID)
 * @param {String} email - Client email address
 * @param {String} userName - Client name (optional)
 * @returns {Promise<Object>} Email sending result
 */
const sendClientVerificationEmail = async (clientId, email, userName = null) => {
  try {
    // Create or get existing verification token
    const { token } = await createClientVerificationToken(clientId, email, userName);

    // Generate verification link
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verify-email?token=${token}&type=client`;

    // Send verification email
    await sendVerificationEmail(email, verificationLink, userName || 'User');

    return {
      success: true,
      message: 'Verification email sent successfully'
    };
  } catch (error) {
    console.error('Error sending client verification email:', error);
    throw error;
  }
};

/**
 * Verify email token for client
 * @param {String} token - Verification token
 * @returns {Promise<Object>} Verification result
 */
const verifyClientEmailToken = async (token) => {
  try {
    // Find the verification token
    const verificationToken = await EmailVerificationToken.findOne({
      token: token,
      user_type: 'client',
      is_used: false
    });

    if (!verificationToken) {
      throw new Error('Invalid or expired verification token');
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires_at) {
      throw new Error('Verification token has expired');
    }

    // Check if already verified
    if (verificationToken.verified_at) {
      throw new Error('Email has already been verified');
    }

    // Find the client
    const client = await Client.findOne({ id: verificationToken.user_id });
    
    if (!client) {
      throw new Error('Client not found');
    }

    // Check if email matches
    if (client.email_address.toLowerCase() !== verificationToken.email.toLowerCase()) {
      throw new Error('Email mismatch');
    }

    // Mark token as used and verified
    verificationToken.is_used = true;
    verificationToken.verified_at = new Date();
    await verificationToken.save();

    // Update client's email verification status
    client.is_email_verified = true;
    await client.save();

    return {
      success: true,
      message: 'Email verified successfully',
      client: {
        id: client.id,
        email_address: client.email_address,
        is_email_verified: client.is_email_verified
      }
    };
  } catch (error) {
    console.error('Error verifying client email token:', error);
    throw error;
  }
};

/**
 * Resend verification email for client
 * @param {String} email - Client email address
 * @returns {Promise<Object>} Email sending result
 */
const resendClientVerificationEmail = async (email) => {
  try {
    // Find client by email
    const client = await Client.findOne({ 
      email_address: email.toLowerCase().trim() 
    });

    if (!client) {
      throw new Error('Client not found');
    }

    // Check if already verified
    if (client.is_email_verified) {
      throw new Error('Email is already verified');
    }

    // Send verification email
    await sendClientVerificationEmail(
      client.id,
      client.email_address,
      client.full_name
    );

    return {
      success: true,
      message: 'Verification email sent successfully'
    };
  } catch (error) {
    console.error('Error resending client verification email:', error);
    throw error;
  }
};

/**
 * Create a verification token for service user
 * @param {String} clientId - Client ID (UUID)
 * @param {String} userId - User ID (UUID)
 * @param {String} email - User email address
 * @param {String} userName - User name (optional)
 * @returns {Promise<Object>} Created token information
 */
const createUserVerificationToken = async (clientId, userId, email, userName = null) => {
  try {
    // Check if there's an existing unverified token for this user
    const existingToken = await EmailVerificationToken.findOne({
      user_id: userId,
      client_id: clientId,
      user_type: 'user',
      is_used: false,
      verified_at: null,
      expires_at: { $gt: new Date() }
    });

    // If token exists and is still valid, return it
    if (existingToken) {
      return {
        token: existingToken.token,
        expires_at: existingToken.expires_at
      };
    }

    // Generate new token
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Create verification token record
    const verificationToken = await EmailVerificationToken.create({
      user_id: userId,
      client_id: clientId,
      token: token,
      email: email.toLowerCase().trim(),
      user_type: 'user',
      expires_at: expiresAt,
      is_used: false
    });

    return {
      token: verificationToken.token,
      expires_at: verificationToken.expires_at
    };
  } catch (error) {
    console.error('Error creating user verification token:', error);
    throw new Error(`Failed to create verification token: ${error.message}`);
  }
};

/**
 * Send verification email to service user
 * @param {String} clientId - Client ID (UUID)
 * @param {String} userId - User ID (UUID)
 * @param {String} email - User email address
 * @param {String} userName - User name (optional)
 * @returns {Promise<Object>} Email sending result
 */
const sendUserVerificationEmail = async (clientId, userId, email, userName = null) => {
  try {
    // Create or get existing verification token
    const { token } = await createUserVerificationToken(clientId, userId, email, userName);

    // Generate verification link
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verify-email?token=${token}&type=user&clientId=${clientId}`;

    // Send verification email
    await sendVerificationEmail(email, verificationLink, userName || 'User');

    return {
      success: true,
      message: 'Verification email sent successfully'
    };
  } catch (error) {
    console.error('Error sending user verification email:', error);
    throw error;
  }
};

/**
 * Verify email token for service user
 * @param {String} token - Verification token
 * @param {String} clientId - Client ID (UUID)
 * @returns {Promise<Object>} Verification result
 */
const verifyUserEmailToken = async (token, clientId) => {
  try {
    // Find the verification token
    const verificationToken = await EmailVerificationToken.findOne({
      token: token,
      client_id: clientId,
      user_type: 'user',
      is_used: false
    });

    if (!verificationToken) {
      throw new Error('Invalid or expired verification token');
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires_at) {
      throw new Error('Verification token has expired');
    }

    // Check if already verified
    if (verificationToken.verified_at) {
      throw new Error('Email has already been verified');
    }

    // Get user model for this client
    const User = getUserModel(clientId);
    const user = await User.findOne({ 
      id: verificationToken.user_id,
      client_id: clientId
    });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Check if email matches
    if (user.email.toLowerCase() !== verificationToken.email.toLowerCase()) {
      throw new Error('Email mismatch');
    }

    // Mark token as used and verified
    verificationToken.is_used = true;
    verificationToken.verified_at = new Date();
    await verificationToken.save();

    // Update user's email verification status
    user.is_email_verified = true;
    await user.save();

    return {
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        is_email_verified: user.is_email_verified
      }
    };
  } catch (error) {
    console.error('Error verifying user email token:', error);
    throw error;
  }
};

/**
 * Resend verification email for service user
 * @param {String} clientId - Client ID (UUID)
 * @param {String} email - User email address
 * @returns {Promise<Object>} Email sending result
 */
const resendUserVerificationEmail = async (clientId, email) => {
  try {
    // Get user model for this client
    const User = getUserModel(clientId);
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(),
      client_id: clientId
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if already verified
    if (user.is_email_verified) {
      throw new Error('Email is already verified');
    }

    // Send verification email
    await sendUserVerificationEmail(
      clientId,
      user.id,
      user.email,
      user.name
    );

    return {
      success: true,
      message: 'Verification email sent successfully'
    };
  } catch (error) {
    console.error('Error resending user verification email:', error);
    throw error;
  }
};

module.exports = {
  generateVerificationToken,
  createClientVerificationToken,
  sendClientVerificationEmail,
  verifyClientEmailToken,
  resendClientVerificationEmail,
  createUserVerificationToken,
  sendUserVerificationEmail,
  verifyUserEmailToken,
  resendUserVerificationEmail
};
