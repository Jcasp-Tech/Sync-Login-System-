const { verifyToken, hashToken } = require('../utils/jwtUtils');
const { Token } = require('../models');

/**
 * Middleware to authenticate requests using JWT
 * Verifies access token or refresh token and attaches client info to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = verifyToken(token);

    // Accept both access and refresh tokens for protected APIs
    if (decoded.type !== 'access' && decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // If it's a refresh token, verify it exists in database and is not revoked
    if (decoded.type === 'refresh') {
      const tokenHash = hashToken(token);
      const tokenQuery = {
        user_id: decoded.userId,
        token_hash: tokenHash,
        token_type: 'Refresh',
        revoked: false,
        expires_at: { $gt: new Date() }
      };

      // If clientId is present in token (for service users), include it in the query
      if (decoded.clientId) {
        tokenQuery.client_id = decoded.clientId;
      }

      const storedToken = await Token.findOne(tokenQuery);

      if (!storedToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or revoked refresh token'
        });
      }
    }

    // Attach client info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    // Attach clientId if present (for service users)
    if (decoded.clientId) {
      req.user.clientId = decoded.clientId;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = {
  authenticate
};

