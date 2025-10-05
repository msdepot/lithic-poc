const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

class SimpleAuthController {
  // Simple login without session management for testing
  async login(req, res) {
    try {
      const { username, password } = req.body;
      console.log('Login attempt for:', username);

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
        console.log('User not found:', username);
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        });
      }

      console.log('User found, checking password...');

      // Check if user is active
      if (!user.is_active) {
        console.log('User inactive:', username);
        return res.status(401).json({
          error: {
            code: 'ACCOUNT_INACTIVE',
            message: 'Account is inactive'
          }
        });
      }

      // Validate password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password validation result:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('Invalid password for:', username);
        return res.status(401).json({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid username or password'
          }
        });
      }

      // Generate token
      const token = jwt.sign(
        {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role.role_name
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log('Login successful for:', username);

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
          expires_in: '24h'
        }
      });

    } catch (error) {
      console.error('Login error:', error.message);
      console.error('Stack:', error.stack);
      res.status(500).json({
        error: {
          code: 'LOGIN_ERROR',
          message: 'Login failed'
        }
      });
    }
  }

  // Placeholder methods for other auth routes
  async refreshToken(req, res) {
    res.status(501).json({
      error: { code: 'NOT_IMPLEMENTED', message: 'Refresh token not implemented in simple controller' }
    });
  }

  async logout(req, res) {
    res.json({ success: true, message: 'Logged out successfully' });
  }

  async changePassword(req, res) {
    res.status(501).json({
      error: { code: 'NOT_IMPLEMENTED', message: 'Change password not implemented in simple controller' }
    });
  }

  async getProfile(req, res) {
    res.json({
      success: true,
      data: { user: req.user }
    });
  }
}

module.exports = new SimpleAuthController();
