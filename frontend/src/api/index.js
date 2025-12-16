/**
 * API Module - Main Export
 * 
 * This is the main entry point for all API-related functionality.
 * Import from this file to use API functions throughout the application.
 * 
 * Usage:
 *   import { registerUser, loginUser } from '@/api'
 *   import { AUTH_ENDPOINTS } from '@/api'
 *   import { apiRequest, post, get } from '@/api'
 */

// Export endpoints
export * from './endpoint'

// Export config
export * from './config'

// Export service functions
export * from './service'

// Export specific API modules
export * from './auth'

// You can add more API modules here as your application grows:
// export * from './user'
// export * from './documents'
// export * from './dashboard'

