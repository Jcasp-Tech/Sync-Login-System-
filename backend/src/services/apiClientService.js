const ServiceAccessKey = require('../models/serviceAccessKeyModel');
const { generateAccessKeyId, generateAccessKeySecret } = require('../utils/keyGenerator');
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');

/**
 * Generate new API client credentials (access key ID and secret)
 * @param {Object} options - Generation options
 * @param {String} options.client_id - Client ID (UUID from clients collection)
 * @param {String} options.environment - 'live' or 'test' (default: 'live')
 * @param {Number} options.rate_limit - Rate limit per hour (default: 1000)
 * @returns {Promise<Object>} Access key ID, secret, and metadata
 */
const generateClientCredentials = async (options = {}) => {
  const { client_id, environment = 'live', rate_limit = 1000 } = options;

  if (!client_id) {
    throw new Error('Client ID is required');
  }

  // Generate access key ID and secret
  const access_key_id = generateAccessKeyId(environment);
  const access_key_secret = generateAccessKeySecret(environment);

  // Hash the secret before storing (using same password hashing utility)
  const access_key_secret_hash = await hashPassword(access_key_secret);

  // Create service access key record
  const serviceAccessKey = await ServiceAccessKey.create({
    access_key_id,
    access_key_secret_hash,
    client_id,
    environment,
    is_active: true,
    rate_limit,
    revoked_at: null
  });

  // Return the access key ID and secret (secret shown only once)
  return {
    access_key_id: serviceAccessKey.access_key_id,
    access_key_secret, // Return plain secret only once
    client_id: serviceAccessKey.client_id,
    environment: serviceAccessKey.environment,
    rate_limit: serviceAccessKey.rate_limit,
    created_at: serviceAccessKey.createdAt
  };
};

/**
 * Validate client credentials (access key ID and secret)
 * @param {String} access_key_id - Access key ID
 * @param {String} access_key_secret - Access key secret (plain text)
 * @returns {Promise<Object>} Service access key data if valid
 */
const validateClientCredentials = async (access_key_id, access_key_secret) => {
  if (!access_key_id || !access_key_secret) {
    throw new Error('Access key ID and secret are required');
  }

  // Find access key by ID
  const serviceAccessKey = await ServiceAccessKey.findOne({
    access_key_id: access_key_id.trim(),
    is_active: true,
    revoked_at: null
  });

  if (!serviceAccessKey) {
    throw new Error('Invalid access key');
  }

  // Verify the secret using password verification utility
  const isSecretValid = await verifyPassword(
    access_key_secret,
    serviceAccessKey.access_key_secret_hash
  );

  if (!isSecretValid) {
    throw new Error('Invalid access key secret');
  }

  // Return access key data (without secret hash)
  return {
    id: serviceAccessKey.id,
    access_key_id: serviceAccessKey.access_key_id,
    client_id: serviceAccessKey.client_id,
    environment: serviceAccessKey.environment,
    rate_limit: serviceAccessKey.rate_limit,
    is_active: serviceAccessKey.is_active,
    created_at: serviceAccessKey.createdAt
  };
};

/**
 * Validate access key by ID only (no secret required from client)
 * Backend handles secret validation internally
 * @param {String} access_key_id - Access key ID
 * @returns {Promise<Object>} Service access key data if valid
 */
const validateAccessKeyById = async (access_key_id) => {
  if (!access_key_id) {
    throw new Error('Access key ID is required');
  }

  // Find access key by ID
  const serviceAccessKey = await ServiceAccessKey.findOne({
    access_key_id: access_key_id.trim(),
    is_active: true,
    revoked_at: null
  });

  if (!serviceAccessKey) {
    throw new Error('Invalid access key');
  }

  // Return access key data (without secret hash)
  return {
    id: serviceAccessKey.id,
    access_key_id: serviceAccessKey.access_key_id,
    client_id: serviceAccessKey.client_id,
    environment: serviceAccessKey.environment,
    rate_limit: serviceAccessKey.rate_limit,
    is_active: serviceAccessKey.is_active,
    created_at: serviceAccessKey.createdAt
  };
};

/**
 * Revoke an access key (hard delete - permanently removes the record)
 * @param {String} access_key_id - Access key ID to revoke
 * @param {String} client_id - Client ID (for authorization check)
 * @returns {Promise<Object>} Deleted access key data
 */
const revokeAccessKey = async (access_key_id, client_id) => {
  if (!access_key_id || !client_id) {
    throw new Error('Access key ID and client ID are required');
  }

  const serviceAccessKey = await ServiceAccessKey.findOne({
    access_key_id: access_key_id.trim(),
    client_id: client_id.trim()
  });

  if (!serviceAccessKey) {
    throw new Error('Access key not found');
  }

  // Store access_key_id before deletion for response
  const deletedAccessKeyId = serviceAccessKey.access_key_id;

  // Hard delete - permanently remove the record from database
  await ServiceAccessKey.deleteOne({
    _id: serviceAccessKey._id
  });

  return {
    access_key_id: deletedAccessKeyId,
    deleted_at: new Date(),
    message: 'Access key permanently deleted'
  };
};

/**
 * Get all active access keys for a client (filtered by authenticated user's client_id)
 * Only returns non-revoked, active access keys
 * @param {String} client_id - Client ID (from authenticated user)
 * @returns {Promise<Array>} List of active access keys (without secrets)
 */
const getClientAccessKeys = async (client_id) => {
  if (!client_id) {
    throw new Error('Client ID is required');
  }

  // Only return active, non-revoked access keys for this specific client
  const accessKeys = await ServiceAccessKey.find({
    client_id: client_id.trim(),
    is_active: true,
    revoked_at: null
  }).select('-access_key_secret_hash').sort({ createdAt: -1 });

  return accessKeys.map(key => ({
    id: key.id,
    access_key_id: key.access_key_id,
    client_id: key.client_id,
    environment: key.environment,
    is_active: key.is_active,
    rate_limit: key.rate_limit,
    created_at: key.createdAt,
    revoked_at: key.revoked_at
  }));
};

module.exports = {
  generateClientCredentials,
  validateClientCredentials,
  validateAccessKeyById,
  revokeAccessKey,
  getClientAccessKeys
};

