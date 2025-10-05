const jwt = require('jsonwebtoken');
const { User, UserSession, Role } = require('../models');
const { authLogger } = require('../utils/logger');

// JWT Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      authLogger.warn('No token provided', { ip: req.ip, endpoint: req.path });
      return res.status(401).json({ 
        error: { 
          code: 'NO_TOKEN', 
          message: 'Access token is required' 
        } 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session exists and is active
    const session = await UserSession.findByJwtToken(token);
    if (!session) {
      authLogger.warn('Invalid or expired session', { 
        userId: decoded.user_id, 
        ip: req.ip, 
        endpoint: req.path 
      });
      return res.status(401).json({ 
        error: { 
          code: 'INVALID_SESSION', 
          message: 'Session is invalid or expired' 
        } 
      });
    }

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
      authLogger.warn('User not found', { userId: decoded.user_id, ip: req.ip });
      return res.status(401).json({ 
        error: { 
          code: 'USER_NOT_FOUND', 
          message: 'User not found' 
        } 
      });
    }

    if (!user.is_active) {
      authLogger.warn('Inactive user attempted access', { 
        userId: user.user_id, 
        username: user.username, 
        ip: req.ip 
      });
      return res.status(401).json({ 
        error: { 
          code: 'USER_INACTIVE', 
          message: 'User account is inactive' 
        } 
      });
    }

    if (user.isLocked()) {
      authLogger.warn('Locked user attempted access', { 
        userId: user.user_id, 
        username: user.username, 
        ip: req.ip 
      });
      return res.status(401).json({ 
        error: { 
          code: 'USER_LOCKED', 
          message: 'User account is locked' 
        } 
      });
    }

    // Update session last used
    await session.updateLastUsed();

    // Add user info to request
    req.user = user;
    req.session = session;
    
    authLogger.debug('User authenticated successfully', { 
      userId: user.user_id, 
      username: user.username, 
      role: user.role.role_name,
      endpoint: req.path 
    });

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      authLogger.warn('Invalid JWT token', { error: error.message, ip: req.ip });
      return res.status(401).json({ 
        error: { 
          code: 'INVALID_TOKEN', 
          message: 'Invalid access token' 
        } 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      authLogger.warn('Expired JWT token', { ip: req.ip });
      return res.status(401).json({ 
        error: { 
          code: 'TOKEN_EXPIRED', 
          message: 'Access token has expired' 
        } 
      });
    }

    authLogger.error('Authentication error', { 
      error: error.message, 
      stack: error.stack, 
      ip: req.ip 
    });
    
    return res.status(500).json({ 
      error: { 
        code: 'AUTH_ERROR', 
        message: 'Authentication failed' 
      } 
    });
  }
};

// Optional authentication (for public endpoints that can benefit from user context)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.user_id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['role_name', 'role_description']
        }
      ]
    });

    if (user && user.is_active && !user.isLocked()) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail for optional auth
    authLogger.debug('Optional auth failed', { error: error.message });
  }

  next();
};

// Generate JWT token
const generateToken = (user) => {
  const payload = {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    role: user.role ? user.role.role_name : null,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'lithic-poc',
    audience: 'lithic-poc-users'
  });
};

// Generate refresh token
const generateRefreshToken = (user) => {
  const payload = {
    user_id: user.user_id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    issuer: 'lithic-poc',
    audience: 'lithic-poc-refresh'
  });
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};

// Extract user ID from token (without full verification)
const extractUserIdFromToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded ? decoded.user_id : null;
  } catch (error) {
    return null;
  }
};

// Check if token is about to expire (within next 5 minutes)
const isTokenNearExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return false;
    
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return (expirationTime - currentTime) < fiveMinutes;
  } catch (error) {
    return false;
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  extractUserIdFromToken,
  isTokenNearExpiry
};
