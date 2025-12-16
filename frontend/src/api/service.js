/**
 * API Service
 * 
 * Core service functions for making API requests.
 * All API calls should go through these functions for consistency.
 */

import { getApiUrl } from './config'

/**
 * Get default headers for API requests
 * @returns {object} Default headers object
 */
const getDefaultHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  }

  // Add authorization header if token exists
  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint (e.g., '/client/auth/register')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} Response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint)
  
  const config = {
    method: 'GET',
    ...options,
    headers: {
      ...getDefaultHeaders(),
      ...options.headers,
    },
  }

  // Only add body if it exists and method is not GET
  if (config.body && typeof config.body === 'object' && config.method !== 'GET') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      // Create error object with validation errors if available
      const error = new Error(data.message || `API request failed: ${response.statusText}`)
      error.response = data
      error.errors = data.errors || []
      error.status = response.status
      throw error
    }

    return data
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error.errors || error.response) {
      throw error
    }
    // Otherwise, create a new error with more context
    const newError = new Error(error.message || 'Network error occurred')
    newError.originalError = error
    throw newError
  }
}

/**
 * GET request helper
 * @param {string} endpoint - API endpoint
 * @param {object} params - Query parameters (optional)
 * @returns {Promise<object>} Response data
 */
export async function get(endpoint, params = {}) {
  let url = getApiUrl(endpoint)
  
  // Add query parameters if provided
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  return apiRequest(endpoint, {
    method: 'GET',
  })
}

/**
 * POST request helper
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise<object>} Response data
 */
export async function post(endpoint, data = {}) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: data,
  })
}

/**
 * PUT request helper
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise<object>} Response data
 */
export async function put(endpoint, data = {}) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: data,
  })
}

/**
 * PATCH request helper
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @returns {Promise<object>} Response data
 */
export async function patch(endpoint, data = {}) {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: data,
  })
}

/**
 * DELETE request helper
 * @param {string} endpoint - API endpoint
 * @returns {Promise<object>} Response data
 */
export async function del(endpoint) {
  return apiRequest(endpoint, {
    method: 'DELETE',
  })
}

