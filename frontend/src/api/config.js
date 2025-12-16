/**
 * API Configuration
 * 
 * Central configuration for all API calls.
 * Update BASE_URL to match your backend server.
 */

export const API_CONFIG = {
  // Base URL for the API - change this to match your backend server
  BASE_URL: 'http://localhost:5002',
  
  // API version prefix
  API_VERSION: '/api/v1',
  
  // Full API base URL
  get API_BASE_URL() {
    return `${this.BASE_URL}${this.API_VERSION}`
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
}

/**
 * Helper function to get the full API endpoint URL
 * @param {string} endpoint - The API endpoint (e.g., '/client/auth/register')
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint) => {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_CONFIG.API_BASE_URL}${normalizedEndpoint}`
}

