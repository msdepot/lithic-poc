const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController.simple');
const { authenticateToken } = require('../middleware/auth.simple');
const { validate, userSchemas } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    error: {
      code: 'LOGIN_RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 * @body {username, password}
 */
router.post('/login', 
  loginLimiter,
  validate(userSchemas.login),
  authController.login
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 * @access Public
 * @body {refresh_token}
 */
router.post('/refresh',
  authLimiter,
  validate(userSchemas.refreshToken),
  authController.refreshToken
);

/**
 * @route POST /api/auth/logout
 * @desc User logout
 * @access Private
 */
router.post('/logout',
  authenticateToken,
  authController.logout
);

/**
 * @route POST /api/auth/change-password
 * @desc Change user password
 * @access Private
 * @body {current_password, new_password}
 */
router.post('/change-password',
  authenticateToken,
  validate(userSchemas.changePassword),
  authController.changePassword
);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile',
  authenticateToken,
  authController.getProfile
);

module.exports = router;
