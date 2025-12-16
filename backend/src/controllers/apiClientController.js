const apiClientService = require('../services/apiClientService');
const { Client } = require('../models');

/**
 * Generate new API access key for authenticated client
 * POST /api/auth/api-clients
 * Requires: Authenticated client (from portal login)
 */
const generateApiClient = async (req, res) => {
  try {
    // Get userId from authenticated user (from authMiddleware)
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to generate API keys.'
      });
    }

    // Get client by userId to get the client.id (UUID)
    const client = await Client.findById(userId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const client_id = client.id; // This is the UUID string

    // Get optional parameters from request body
    const { environment = 'live', rate_limit = 1000 } = req.body;

    // Validate environment
    if (environment !== 'live' && environment !== 'test') {
      return res.status(400).json({
        success: false,
        message: 'Environment must be either "live" or "test"'
      });
    }

    // Validate rate limit
    if (rate_limit && (typeof rate_limit !== 'number' || rate_limit < 1)) {
      return res.status(400).json({
        success: false,
        message: 'Rate limit must be a positive number'
      });
    }

    // Generate credentials
    const credentials = await apiClientService.generateClientCredentials({
      client_id,
      environment,
      rate_limit
    });

    res.status(201).json({
      success: true,
      message: 'API access key generated successfully',
      data: {
        ...credentials,
        warning: '⚠️ Store your access_key_secret securely. It will not be shown again.'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate API access key'
    });
  }
};

/**
 * Get all API access keys for authenticated client
 * GET /api/auth/api-clients
 * Requires: Authenticated client
 */
const getApiClients = async (req, res) => {
  try {
    // Get userId from authenticated user
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get client by userId to get the client.id (UUID)
    const client = await Client.findById(userId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const client_id = client.id; // This is the UUID string

    const accessKeys = await apiClientService.getClientAccessKeys(client_id);

    res.status(200).json({
      success: true,
      message: 'API access keys retrieved successfully',
      data: accessKeys
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to retrieve API access keys'
    });
  }
};

/**
 * Revoke an API access key
 * DELETE /api/auth/api-clients/:access_key_id
 * Requires: Authenticated client
 */
const revokeApiClient = async (req, res) => {
  try {
    const { access_key_id } = req.params;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get client by userId to get the client.id (UUID)
    const client = await Client.findById(userId);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    const client_id = client.id; // This is the UUID string

    if (!access_key_id) {
      return res.status(400).json({
        success: false,
        message: 'Access key ID is required'
      });
    }

    const deleted = await apiClientService.revokeAccessKey(access_key_id, client_id);

    res.status(200).json({
      success: true,
      message: 'API access key permanently deleted successfully',
      data: deleted
    });
  } catch (error) {
    const statusCode = error.message === 'Access key not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to revoke API access key'
    });
  }
};

module.exports = {
  generateApiClient,
  getApiClients,
  revokeApiClient
};

