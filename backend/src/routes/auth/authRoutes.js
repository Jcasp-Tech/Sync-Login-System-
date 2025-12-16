const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { loginRateLimiter, registerRateLimiter, refreshTokenRateLimiter } = require('../../middlewares/rateLimiterMiddleware');
const { 
  validateRegister,
  validateLogin, 
  validateRefreshToken, 
  validateLogout,
  handleValidationErrors 
} = require('../../middlewares/validationMiddleware');
const { authenticate } = require('../../middlewares/authMiddleware');

/**
 * @route   POST /api/v1/client/auth/register
 * @desc    Register new client
 * @access  Public
 */
router.post(
  '/register',
  registerRateLimiter,
  validateRegister,
  handleValidationErrors,
  authController.register
);

/**
 * @route   POST /api/v1/client/auth/login
 * @desc    Login client
 * @access  Public
 */
router.post(
  '/login',
  // loginRateLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);

/**
 * @route   POST /api/v1/client/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  refreshTokenRateLimiter,
  validateRefreshToken,
  handleValidationErrors,
  authController.refreshToken
);

/**
 * @route   POST /api/v1/client/auth/logout
 * @desc    Logout client (revoke refresh token)
 * @access  Public (token validation happens in service)
 */
router.post(
  '/logout',
  validateLogout,
  handleValidationErrors,
  authController.logout
);

module.exports = router;

