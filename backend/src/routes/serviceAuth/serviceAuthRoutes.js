const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { validateAccessKey } = require('../../middlewares/accessKeyMiddleware');
const {
  validateServiceUserRegister,
  validateServiceUserLogin,
  validateServiceRefreshToken,
  validateServiceLogout,
  handleValidationErrors
} = require('../../middlewares/validationMiddleware');
const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for user registration
 */
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 registration requests per 15 minutes
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter for user login
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login requests per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * @route   POST /api/v1/service/auth/register
 * @desc    Register a new user (requires access key)
 * @access  Private (Access key required)
 */
router.post(
  '/register',
  validateAccessKey, // Validate access key first
  registerLimiter,
  validateServiceUserRegister,
  handleValidationErrors,
  userController.register
);

/**
 * @route   POST /api/v1/service/auth/login
 * @desc    Login user (requires access key)
 * @access  Private (Access key required)
 */
router.post(
  '/login',
  validateAccessKey, // Validate access key first
  loginLimiter,
  validateServiceUserLogin,
  handleValidationErrors,
  userController.login
);

/**
 * @route   POST /api/v1/service/auth/refresh-token
 * @desc    Refresh access token (requires access key)
 * @access  Private (Access key required)
 */
router.post(
  '/refresh-token',
  validateAccessKey, // Validate access key first
  validateServiceRefreshToken,
  handleValidationErrors,
  userController.refreshToken
);

/**
 * @route   POST /api/v1/service/auth/logout
 * @desc    Logout user (requires access key)
 * @access  Private (Access key required)
 */
router.post(
  '/logout',
  validateAccessKey, // Validate access key first
  validateServiceLogout,
  handleValidationErrors,
  userController.logout
);

/**
 * @route   POST /api/v1/service/auth/profile
 * @desc    Get user profile (requires access key)
 * @access  Private (Access key required)
 */
router.post(
  '/profile',
  validateAccessKey, // Validate access key first
  userController.getProfile
);

module.exports = router;
