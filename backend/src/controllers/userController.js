const userService = require('../services/userService');

/**
 * Handle user registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    // Get client_id from validated access key (set by accessKeyMiddleware)
    const clientId = req.serviceClient?.client_id;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access key'
      });
    }

    const { email, password, name, custom_fields } = req.body;

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    const result = await userService.registerUser(
      clientId,
      { email, password, name, custom_fields },
      ipAddress,
      userAgent
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    const statusCode = error.message === 'User with this email already exists' ? 409 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

/**
 * Handle user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    // Get client_id from validated access key
    const clientId = req.serviceClient?.client_id;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access key'
      });
    }

    const { email, password } = req.body;

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    const result = await userService.loginUser(
      clientId,
      email,
      password,
      ipAddress,
      userAgent
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Login failed. Please check your credentials.'
    });
  }
};

/**
 * Handle refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    // Get client_id from validated access key
    const clientId = req.serviceClient?.client_id;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access key'
      });
    }

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const result = await userService.refreshAccessToken(clientId, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed'
    });
  }
};

/**
 * Handle user logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    // Get client_id from validated access key
    const clientId = req.serviceClient?.client_id;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access key'
      });
    }

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    await userService.logoutUser(clientId, refreshToken, ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message || 'Logout failed'
    });
  }
};

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    // Get client_id from validated access key
    const clientId = req.serviceClient?.client_id;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access key'
      });
    }

    // Get user ID from JWT token (if authenticated via JWT)
    // For now, we'll get it from request body or query params
    // In a real scenario, you might want to add JWT authentication middleware
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await userService.getUserById(clientId, userId);

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message || 'User not found'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile
};
