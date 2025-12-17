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

module.exports = {
  validateAccessKey
};

