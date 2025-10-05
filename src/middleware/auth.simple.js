const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

// Simple JWT Authentication Middleware (without session management)
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: { 
          code: 'NO_TOKEN', 
          message: 'Access token is required' 
        } 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user with role information
    const user = await User.findByPk(decoded.user_id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['role_name', 'role_description']
        }
      ]
    });

    if (!user) {
      return res.status(401).json({ 
        error: { 
          code: 'USER_NOT_FOUND', 
          message: 'User not found' 
        } 
      });
    }

    if (!user.is_active) {
      return res.status(401).json({ 
        error: { 
          code: 'USER_INACTIVE', 
          message: 'User account is inactive' 
        } 
      });
    }

    // Add user info to request
    req.user = user;
    
    console.log('User authenticated:', user.username, 'Role:', user.role.role_name);
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: { 
          code: 'INVALID_TOKEN', 
          message: 'Invalid access token' 
        } 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: { 
          code: 'TOKEN_EXPIRED', 
          message: 'Access token has expired' 
        } 
      });
    }
    
    return res.status(500).json({ 
      error: { 
        code: 'AUTH_ERROR', 
        message: 'Authentication failed' 
      } 
    });
  }
};

module.exports = {
  authenticateToken
};
