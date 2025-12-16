const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login endpoint
 * Prevents brute force attacks
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests too
  skipFailedRequests: false
});

/**
 * Rate limiter for registration endpoint
 * Prevents spam registrations
 */
const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration requests per hour
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 1 hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

/**
 * Rate limiter for refresh token endpoint
 */
const refreshTokenRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 refresh requests per windowMs
  message: {
    success: false,
    message: 'Too many token refresh attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  loginRateLimiter,
  registerRateLimiter,
  refreshTokenRateLimiter
};

