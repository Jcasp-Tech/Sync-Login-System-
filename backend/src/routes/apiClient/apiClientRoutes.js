const express = require('express');
const router = express.Router();
const apiClientController = require('../../controllers/apiClientController');
const { authenticate } = require('../../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

/**
 * @route   POST /api/auth/api-clients
 * @desc    Generate new API access key (requires portal authentication)
 * @access  Private (Portal authenticated users only)
 */
// Rate limiter for API key generation
const apiKeyGenerationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 API key generation requests per 15 minutes
  message: {
    success: false,
    message: 'Too many API key generation attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post(
  '/',
  authenticate, // Require portal login authentication
  apiKeyGenerationLimiter,
  apiClientController.generateApiClient
);

/**
 * @route   GET /api/auth/api-clients
 * @desc    Get all API access keys for authenticated client
 * @access  Private (Portal authenticated users only)
 */
router.get(
  '/',
  authenticate, // Require portal login authentication
  apiClientController.getApiClients
);

/**
 * @route   DELETE /api/auth/api-clients/:access_key_id
 * @desc    Revoke an API access key
 * @access  Private (Portal authenticated users only)
 */
router.delete(
  '/:access_key_id',
  authenticate, // Require portal login authentication
  apiClientController.revokeApiClient
);

module.exports = router;

