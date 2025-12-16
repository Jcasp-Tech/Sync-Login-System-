const apiClientService = require('../services/apiClientService');

/**
 * Middleware to validate API access key from Authorization header
 * Format: Authorization: AccessKey {access_key_id}:{access_key_secret}
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
        message: 'Authorization header is required. Use format: AccessKey {id}:{secret}'
      });
    }

    // Parse Authorization header
    // Expected format: "AccessKey ak_live_xxx:sk_live_yyy"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'AccessKey') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Authorization: AccessKey {id}:{secret}'
      });
    }

    const credentials = parts[1];
    const [access_key_id, access_key_secret] = credentials.split(':');

    if (!access_key_id || !access_key_secret) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access key format. Use: {access_key_id}:{access_key_secret}'
      });
    }

    // Validate credentials
    const serviceClient = await apiClientService.validateClientCredentials(
      access_key_id,
      access_key_secret
    );

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

