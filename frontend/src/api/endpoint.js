/**
 * API Endpoints
 * 
 * Centralized endpoint definitions for all API calls.
 * This makes it easy to manage and update endpoints in one place.
 */

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: '/client/auth/register',
  LOGIN: '/client/auth/login',
  LOGOUT: '/client/auth/logout',
  REFRESH_TOKEN: '/client/auth/refresh',
  FORGOT_PASSWORD: '/client/auth/forgot-password',
  RESET_PASSWORD: '/client/auth/reset-password',
}

// User endpoints (example - add more as needed)
export const USER_ENDPOINTS = {
  PROFILE: '/client/user/profile',
  UPDATE_PROFILE: '/client/user/profile',
  CHANGE_PASSWORD: '/client/user/change-password',
}

// Add more endpoint groups as your API grows
// export const DOCUMENT_ENDPOINTS = { ... }
// export const DASHBOARD_ENDPOINTS = { ... }

// API Client endpoints
export const API_CLIENT_ENDPOINTS = {
  GENERATE: '/client/auth/api-clients',
  LIST: '/client/auth/api-clients',
  REVOKE: '/client/auth/api-clients', // Will append :access_key_id
}

// Export all endpoints in a single object for convenience
export const ENDPOINTS = {
  ...AUTH_ENDPOINTS,
  ...USER_ENDPOINTS,
  ...API_CLIENT_ENDPOINTS,
}

