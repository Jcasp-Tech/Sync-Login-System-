const emailVerificationService = require('../services/emailVerificationService');

/**
 * Send verification email to client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendClientVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    await emailVerificationService.resendClientVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    const statusCode = error.message === 'Client not found' 
      ? 404 
      : error.message === 'Email is already verified'
      ? 400
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to send verification email'
    });
  }
};

/**
 * Verify email token for client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyClientEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const result = await emailVerificationService.verifyClientEmailToken(token);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        client: result.client
      }
    });
  } catch (error) {
    const statusCode = error.message === 'Invalid or expired verification token' 
      ? 400
      : error.message === 'Verification token has expired'
      ? 400
      : error.message === 'Email has already been verified'
      ? 400
      : error.message === 'Client not found'
      ? 404
      : error.message === 'Email mismatch'
      ? 400
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Email verification failed'
    });
  }
};

/**
 * Send verification email to service user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendUserVerificationEmail = async (req, res) => {
  try {
    const clientId = req.serviceClient?.client_id;
    const { email } = req.body;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access key'
      });
    }

    await emailVerificationService.resendUserVerificationEmail(clientId, email);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    const statusCode = error.message === 'User not found' 
      ? 404 
      : error.message === 'Email is already verified'
      ? 400
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to send verification email'
    });
  }
};

/**
 * Verify email token for service user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyUserEmail = async (req, res) => {
  try {
    const clientId = req.serviceClient?.client_id;
    const { token } = req.body;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access key'
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const result = await emailVerificationService.verifyUserEmailToken(token, clientId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        user: result.user
      }
    });
  } catch (error) {
    const statusCode = error.message === 'Invalid or expired verification token' 
      ? 400
      : error.message === 'Verification token has expired'
      ? 400
      : error.message === 'Email has already been verified'
      ? 400
      : error.message === 'User not found'
      ? 404
      : error.message === 'Email mismatch'
      ? 400
      : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Email verification failed'
    });
  }
};

module.exports = {
  sendClientVerificationEmail,
  verifyClientEmail,
  sendUserVerificationEmail,
  verifyUserEmail
};
