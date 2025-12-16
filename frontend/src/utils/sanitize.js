/**
 * Input sanitization utilities
 */

/**
 * Sanitize text input - removes HTML tags and dangerous characters
 */
export const sanitizeText = (input) => {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/[&<>"']/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Sanitize email - removes dangerous characters but keeps valid email format
 */
export const sanitizeEmail = (input) => {
  if (!input) return ''
  
  return input
    .trim()
    .toLowerCase()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/[&"']/g, '') // Remove HTML entities
    .replace(/\s+/g, '') // Remove whitespace
}

/**
 * Sanitize phone number - keeps only digits, +, -, spaces, and parentheses
 */
export const sanitizePhone = (input) => {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[^\d+\-() ]/g, '') // Keep only digits, +, -, (, ), and spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Sanitize password - removes whitespace and dangerous characters
 */
export const sanitizePassword = (input) => {
  if (!input) return ''
  
  return input
    .replace(/\s/g, '') // Remove all whitespace
    .replace(/[<>]/g, '') // Remove HTML brackets
}

/**
 * Validate and sanitize full name
 * Allows spaces and normalizes them
 */
export const sanitizeFullName = (input) => {
  if (!input) return ''
  
  // Don't trim during typing, only normalize spaces
  // This allows users to type spaces naturally
  return input
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/[&"']/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
    .substring(0, 100) // Limit length
}

/**
 * Sanitize full name on submit (more strict)
 */
export const sanitizeFullNameOnSubmit = (input) => {
  if (!input) return ''
  
  return input
    .trim() // Trim only on submit
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/[&"']/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 100) // Limit length
}

/**
 * Validate and sanitize industry
 */
export const sanitizeIndustry = (input) => {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/[&"']/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 100) // Limit length
}

/**
 * Validate and sanitize position/title
 */
export const sanitizePosition = (input) => {
  if (!input) return ''
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/[&"']/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 100) // Limit length
}

