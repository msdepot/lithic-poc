const bcrypt = require('bcryptjs');
const { User, Role, UserSession, AuditLog } = require('../models');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { authLogger } = require('../utils/logger');

class AuthController {
  // User login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Find user with role information
      const user = await User.findOne({
        where: { username },
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name', 'role_description']
          }
        ]
      });

      if (!user) {
        authLogger.warn('Login attempt with invalid username', { username, ip: req.ip });
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        });
      }

      // Check if user is locked
      if (user.isLocked()) {
        authLogger.warn('Login attempt for locked user', { 
          userId: user.user_id, 
          username: user.username, 
          ip: req.ip 
        });
        return res.status(401).json({
          error: {
            code: 'ACCOUNT_LOCKED',
            message: 'Account is temporarily locked due to multiple failed login attempts'
          }
        });
      }

      // Check if user is active
      if (!user.is_active) {
        authLogger.warn('Login attempt for inactive user', { 
          userId: user.user_id, 
          username: user.username, 
          ip: req.ip 
        });
        return res.status(401).json({
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Account is inactive'
          }
        });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        await user.incrementFailedLogins();
        authLogger.warn('Login attempt with invalid password', { 
          userId: user.user_id, 
          username: user.username, 
          ip: req.ip,
          failedAttempts: user.failed_login_attempts + 1
        });
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        });
      }

      // Reset failed login attempts on successful login
      await user.resetFailedLogins();

      // Generate tokens
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);

      // Create session
      const session = await UserSession.createSession(user.user_id, token, refreshToken, req);

      // Log successful login
      authLogger.info('User logged in successfully', { 
        userId: user.user_id, 
        username: user.username, 
        role: user.role.role_name,
        ip: req.ip 
      });

      // Create audit log
      await AuditLog.logCreate('user_sessions', session.session_id, {
        action: 'LOGIN',
        user_id: user.user_id,
        ip_address: req.ip
      }, user.user_id, req);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role.role_name
          },
          token,
          refresh_token: refreshToken,
          expires_in: process.env.JWT_EXPIRES_IN || '24h'
        }
      });

    } catch (error) {
      authLogger.error('Login error', { 
        error: error.message, 
        stack: error.stack, 
        ip: req.ip 
      });
      res.status(500).json({
        error: {
          code: 'LOGIN_ERROR',
          message: 'Login failed'
        }
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          error: {
            code: 'REFRESH_TOKEN_REQUIRED',
            message: 'Refresh token is required'
          }
        });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refresh_token);
      
      // Find session
      const session = await UserSession.findByRefreshToken(refresh_token);
      if (!session) {
        authLogger.warn('Invalid refresh token used', { ip: req.ip });
        return res.status(401).json({
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid refresh token'
          }
        });
      }

      // Get user with role
      const user = await User.findByPk(session.user_id, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name', 'role_description']
          }
        ]
      });

      if (!user || !user.is_active) {
        await session.revoke();
        return res.status(401).json({
          error: {
            code: 'USER_INACTIVE',
            message: 'User account is inactive'
          }
        });
      }

      // Generate new tokens
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);

      // Update session
      await session.refreshSession(newToken, newRefreshToken);

      authLogger.info('Token refreshed successfully', { 
        userId: user.user_id, 
        username: user.username,
        ip: req.ip 
      });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: newToken,
          refresh_token: newRefreshToken,
          expires_in: process.env.JWT_EXPIRES_IN || '24h'
        }
      });

    } catch (error) {
      authLogger.error('Token refresh error', { 
        error: error.message, 
        stack: error.stack, 
        ip: req.ip 
      });
      
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token'
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'TOKEN_REFRESH_ERROR',
          message: 'Token refresh failed'
        }
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const session = req.session;

      if (session) {
        await session.revoke();
        
        // Log logout
        authLogger.info('User logged out', { 
          userId: req.user.user_id, 
          username: req.user.username,
          ip: req.ip 
        });

        // Create audit log
        await AuditLog.logCreate('user_sessions', session.session_id, {
          action: 'LOGOUT',
          user_id: req.user.user_id,
          ip_address: req.ip
        }, req.user.user_id, req);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      authLogger.error('Logout error', { 
        error: error.message, 
        stack: error.stack,
        userId: req.user?.user_id,
        ip: req.ip 
      });
      res.status(500).json({
        error: {
          code: 'LOGOUT_ERROR',
          message: 'Logout failed'
        }
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const user = req.user;

      // Validate current password
      const isValidPassword = await user.validatePassword(current_password);
      if (!isValidPassword) {
        authLogger.warn('Invalid current password in change password attempt', { 
          userId: user.user_id, 
          username: user.username,
          ip: req.ip 
        });
        return res.status(400).json({
          error: {
            code: 'INVALID_CURRENT_PASSWORD',
            message: 'Current password is incorrect'
          }
        });
      }

      // Update password
      user.password_hash = new_password; // Will be hashed by model hook
      await user.save();

      // Revoke all existing sessions except current
      await UserSession.update(
        { is_active: false },
        {
          where: {
            user_id: user.user_id,
            session_id: { [require('sequelize').Op.ne]: req.session.session_id }
          }
        }
      );

      authLogger.info('Password changed successfully', { 
        userId: user.user_id, 
        username: user.username,
        ip: req.ip 
      });

      // Create audit log
      await AuditLog.logUpdate('users', user.user_id, 
        { password_changed: false }, 
        { password_changed: true }, 
        user.user_id, req
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      authLogger.error('Change password error', { 
        error: error.message, 
        stack: error.stack,
        userId: req.user?.user_id,
        ip: req.ip 
      });
      res.status(500).json({
        error: {
          code: 'CHANGE_PASSWORD_ERROR',
          message: 'Password change failed'
        }
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.user_id, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name', 'role_description']
          }
        ],
        attributes: { exclude: ['password_hash'] }
      });

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      authLogger.error('Get profile error', { 
        error: error.message, 
        stack: error.stack,
        userId: req.user?.user_id 
      });
      res.status(500).json({
        error: {
          code: 'GET_PROFILE_ERROR',
          message: 'Failed to get user profile'
        }
      });
    }
  }
}

module.exports = new AuthController();
