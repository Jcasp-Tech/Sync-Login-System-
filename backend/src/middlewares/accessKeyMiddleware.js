const apiClientService = require('../services/apiClientService');

/**
 * Middleware to validate API access key from Authorization header
 * Format: Authorization: AccessKey {access_key_id}
 * Backend validates internally (checks if key exists, is active, and not revoked)
 * 
 * Attaches serviceClient to req object if valid:
 * req.serviceClient = { id, access_key_id, client_id, rate_limit }
 */
const validateAccessKey = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required. Use format: AccessKey {access_key_id}'
      });
    }

    // Parse Authorization header
    // Expected format: "AccessKey ak_live_xxx" or "AccessKey ak_test_xxx"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'AccessKey') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Authorization: AccessKey {access_key_id}'
      });
    }

    const access_key_id = parts[1];

    if (!access_key_id) {
      return res.status(401).json({
        success: false,
        message: 'Access key ID is required. Use format: AccessKey {access_key_id}'
      });
    }

    // Validate access key by ID only (backend handles validation internally)
    const serviceClient = await apiClientService.validateAccessKeyById(access_key_id);

    // Attach service client to request object
    req.serviceClient = serviceClient;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid access key'
    });
  }
};

/**
 * Middleware to validate both AccessKey and RefreshToken
 * Requires:
 * - Authorization: AccessKey {access_key_id}
 * - X-Refresh-Token: {refreshToken}
 * 
 * Attaches to req:
 * - req.serviceClient = { id, access_key_id, client_id, rate_limit }
 * - req.user = { userId, email, clientId }
 */
const validateAccessKeyAndRefreshToken = async (req, res, next) => {
  try {
    // First validate AccessKey
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required. Use format: AccessKey {access_key_id}'
      });
    }

    // Parse Authorization header for AccessKey
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'AccessKey') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Authorization: AccessKey {access_key_id}'
      });
    }

    const access_key_id = parts[1];

    if (!access_key_id) {
      return res.status(401).json({
        success: false,
        message: 'Access key ID is required. Use format: AccessKey {access_key_id}'
      });
    }

    // Validate access key
    const serviceClient = await apiClientService.validateAccessKeyById(access_key_id);
    req.serviceClient = serviceClient;

    // Now validate RefreshToken from X-Refresh-Token header
    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required. Use header: X-Refresh-Token: {refreshToken}'
      });
    }

    // Verify refresh token
    const { verifyToken, hashToken } = require('../utils/jwtUtils');
    const { Token } = require('../models');

    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Refresh token required'
      });
    }

    // Verify clientId from token matches client_id from AccessKey
    if (decoded.clientId !== serviceClient.client_id) {
      return res.status(401).json({
        success: false,
        message: 'Token client mismatch'
      });
    }

    // Verify refresh token exists in database and is not revoked
    const tokenHash = hashToken(refreshToken);
    const storedToken = await Token.findOne({
      user_id: decoded.userId,
      client_id: decoded.clientId,
      token_hash: tokenHash,
      token_type: 'Refresh',
      revoked: false,
      expires_at: { $gt: new Date() }
    });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or revoked refresh token'
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      clientId: decoded.clientId
    };

    next();
  } catch (error) {
    if (error.message === 'Invalid or expired token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }
    return res.status(401).json({
      success: false,
      message: error.message || 'Authentication failed'
    });
  }
};

module.exports = {
  validateAccessKey,
  validateAccessKeyAndRefreshToken
};

