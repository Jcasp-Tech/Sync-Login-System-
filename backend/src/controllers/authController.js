const authService = require('../services/authService');

/**
 * Handle client registration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { full_name, position_title, email_address, phone_no, industry, password } = req.body;

    const client = await authService.registerUser({
      full_name,
      position_title,
      email_address,
      phone_no,
      industry,
      password
    });

    res.status(201).json({
      success: true,
      message: 'Client registered successfully',
      data: client
    });
  } catch (error) {
    const statusCode = error.message === 'Client with this email already exists' ? 409 : 400;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
};

/**
 * Handle client login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    // Don't expose specific error details for security
    const message = error.message === 'Invalid email or password' 
      ? 'Invalid email or password' 
      : error.message === 'Email not verified. Please verify your email first.'
      ? 'Email not verified. Please verify your email first.'
      : 'Login failed. Please try again.';

    res.status(401).json({
      success: false,
      message: message
    });
  }
};

/**
 * Handle token refresh (accepts accessToken, returns new refreshToken only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const result = await authService.refreshAccessToken(accessToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired access token'
    });
  }
};

/**
 * Handle client logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    await authService.logoutUser(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};

