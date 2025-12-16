/**
 * Auth API Functions
 * 
 * Specific API functions for authentication operations.
 */

import { post, get, del, apiRequest } from './service'
import { AUTH_ENDPOINTS, API_CLIENT_ENDPOINTS } from './endpoint'

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @param {string} userData.full_name - User's full name
 * @param {string} userData.position_title - User's position/title
 * @param {string} userData.email_address - User's email address
 * @param {string} userData.phone_no - User's phone number
 * @param {string} userData.industry - User's industry
 * @param {string} userData.password - User's password
 * @returns {Promise<object>} Response data
 */
export async function registerUser(userData) {
  return post(AUTH_ENDPOINTS.REGISTER, userData)
}

/**
 * Login a user
 * @param {object} credentials - Login credentials
 * @param {string} credentials.email - User's email address
 * @param {string} credentials.password - User's password
 * @returns {Promise<object>} Response data (typically includes token)
 */
export async function loginUser(credentials) {
  return post(AUTH_ENDPOINTS.LOGIN, credentials)
}

/**
 * Logout a user
 * @returns {Promise<object>} Response data
 */
export async function logoutUser() {
  return post(AUTH_ENDPOINTS.LOGOUT)
}

/**
 * Refresh authentication token
 * @param {string} accessToken - The access token to refresh
 * @returns {Promise<object>} Response data with new token
 */
export async function refreshToken(accessToken) {
  // Use apiRequest directly to pass custom Authorization header
  // since we're calling this before storing the token
  return apiRequest(AUTH_ENDPOINTS.REFRESH_TOKEN, {
    method: 'POST',
    body: {
      accessToken: accessToken,
    },
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })
}

/**
 * Request password reset
 * @param {object} data - Password reset request data
 * @param {string} data.email - User's email address
 * @returns {Promise<object>} Response data
 */
export async function forgotPassword(data) {
  return post(AUTH_ENDPOINTS.FORGOT_PASSWORD, data)
}

/**
 * Reset password with token
 * @param {object} data - Password reset data
 * @param {string} data.token - Reset token
 * @param {string} data.password - New password
 * @returns {Promise<object>} Response data
 */
export async function resetPassword(data) {
  return post(AUTH_ENDPOINTS.RESET_PASSWORD, data)
}

/**
 * Generate a new API access key
 * @param {object} data - API client data
 * @param {string} data.environment - Environment type (e.g., 'live', 'test')
 * @param {number} data.rate_limit - Rate limit for the API key
 * @returns {Promise<object>} Response data with generated API key
 */
export async function generateApiClient(data) {
  return post(API_CLIENT_ENDPOINTS.GENERATE, data)
}

/**
 * List all API access keys for the authenticated user
 * @returns {Promise<object>} Response data with list of API keys
 */
export async function listApiClients() {
  return get(API_CLIENT_ENDPOINTS.LIST)
}

/**
 * Revoke/delete an API access key
 * @param {string} accessKeyId - The access key ID to revoke
 * @returns {Promise<object>} Response data
 */
export async function revokeApiClient(accessKeyId) {
  return del(`${API_CLIENT_ENDPOINTS.REVOKE}/${accessKeyId}`)
}

