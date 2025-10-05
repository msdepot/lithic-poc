const { authLogger } = require('../utils/logger');

// Role hierarchy and permissions
const ROLE_HIERARCHY = {
  'owner': 5,
  'super_admin': 4,
  'admin': 3,
  'user': 2,
  'analyst': 1
};

const ROLE_PERMISSIONS = {
  'owner': [
    'users:create:*',
    'users:read:*',
    'users:update:*',
    'users:delete:*',
    'accounts:create:*',
    'accounts:read:*',
    'accounts:update:*',
    'accounts:delete:*',
    'cards:create:*',
    'cards:read:*',
    'cards:update:*',
    'cards:delete:*',
    'spending_profiles:create',
    'spending_profiles:read',
    'spending_profiles:update',
    'spending_profiles:delete',
    'transactions:read:*',
    'reports:read:*',
    'audit:read:*',
    'system:manage'
  ],
  'super_admin': [
    'users:create:admin,user,analyst',
    'users:read:*',
    'users:update:admin,user,analyst',
    'users:delete:admin,user,analyst',
    'accounts:create:*',
    'accounts:read:*',
    'accounts:update:*',
    'accounts:delete:*',
    'cards:create:*',
    'cards:read:*',
    'cards:update:*',
    'cards:delete:*',
    'spending_profiles:create',
    'spending_profiles:read',
    'spending_profiles:update',
    'spending_profiles:delete',
    'transactions:read:*',
    'reports:read:*',
    'audit:read:limited'
  ],
  'admin': [
    'users:create:user,analyst',
    'users:read:user,analyst',
    'users:update:user,analyst',
    'users:delete:user,analyst',
    'accounts:create:*',
    'accounts:read:*',
    'accounts:update:*',
    'cards:create:*',
    'cards:read:*',
    'cards:update:*',
    'spending_profiles:create',
    'spending_profiles:read',
    'spending_profiles:update',
    'spending_profiles:delete',
    'transactions:read:managed',
    'reports:read:limited'
  ],
  'user': [
    'users:read:own',
    'users:update:own',
    'accounts:read:own',
    'cards:read:own',
    'cards:update:own',
    'transactions:read:own'
  ],
  'analyst': [
    'transactions:read:*',
    'reports:read:*'
  ]
};

// RBAC Middleware Factory
const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        authLogger.warn('RBAC check failed: No user or role', { 
          endpoint: req.path, 
          method: req.method,
          ip: req.ip 
        });
        return res.status(401).json({
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required'
          }
        });
      }

      const userRole = req.user.role.role_name;
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      if (hasPermission(userPermissions, permission, req)) {
        authLogger.debug('RBAC check passed', { 
          userId: req.user.user_id,
          username: req.user.username,
          role: userRole,
          permission,
          endpoint: req.path 
        });
        next();
      } else {
        authLogger.warn('RBAC check failed: Insufficient permissions', { 
          userId: req.user.user_id,
          username: req.user.username,
          role: userRole,
          permission,
          endpoint: req.path,
          method: req.method 
        });
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'You do not have permission to perform this action'
          }
        });
      }
    } catch (error) {
      authLogger.error('RBAC middleware error', { 
        error: error.message, 
        stack: error.stack,
        userId: req.user?.user_id,
        endpoint: req.path 
      });
      return res.status(500).json({
        error: {
          code: 'RBAC_ERROR',
          message: 'Permission check failed'
        }
      });
    }
  };
};

// Role-based access control
const requireRole = (roles) => {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required'
          }
        });
      }

      const userRole = req.user.role.role_name;
      
      if (roleArray.includes(userRole)) {
        next();
      } else {
        authLogger.warn('Role check failed', { 
          userId: req.user.user_id,
          username: req.user.username,
          userRole,
          requiredRoles: roleArray,
          endpoint: req.path 
        });
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_ROLE',
            message: `Required role: ${roleArray.join(' or ')}`
          }
        });
      }
    } catch (error) {
      authLogger.error('Role middleware error', { 
        error: error.message, 
        stack: error.stack,
        endpoint: req.path 
      });
      return res.status(500).json({
        error: {
          code: 'ROLE_CHECK_ERROR',
          message: 'Role check failed'
        }
      });
    }
  };
};

// Minimum role level required
const requireMinRole = (minRole) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required'
          }
        });
      }

      const userRole = req.user.role.role_name;
      const userLevel = ROLE_HIERARCHY[userRole] || 0;
      const minLevel = ROLE_HIERARCHY[minRole] || 0;

      if (userLevel >= minLevel) {
        next();
      } else {
        authLogger.warn('Minimum role check failed', { 
          userId: req.user.user_id,
          username: req.user.username,
          userRole,
          userLevel,
          requiredRole: minRole,
          requiredLevel: minLevel,
          endpoint: req.path 
        });
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_ROLE_LEVEL',
            message: `Minimum required role: ${minRole}`
          }
        });
      }
    } catch (error) {
      authLogger.error('Minimum role middleware error', { 
        error: error.message, 
        stack: error.stack,
        endpoint: req.path 
      });
      return res.status(500).json({
        error: {
          code: 'MIN_ROLE_CHECK_ERROR',
          message: 'Minimum role check failed'
        }
      });
    }
  };
};

// Resource ownership check
const requireOwnership = (resourceParam = 'id', resourceType = 'user') => {
  return (req, res, next) => {
    try {
      const resourceId = req.params[resourceParam];
      const userId = req.user.user_id;
      const userRole = req.user.role.role_name;

      // Owners and super admins can access any resource
      if (['owner', 'super_admin'].includes(userRole)) {
        return next();
      }

      // Admins can access user and analyst resources
      if (userRole === 'admin' && resourceType === 'user') {
        return next();
      }

      // Users can only access their own resources
      if (parseInt(resourceId) === userId) {
        return next();
      }

      authLogger.warn('Ownership check failed', { 
        userId,
        username: req.user.username,
        userRole,
        resourceId,
        resourceType,
        endpoint: req.path 
      });

      return res.status(403).json({
        error: {
          code: 'RESOURCE_ACCESS_DENIED',
          message: 'You can only access your own resources'
        }
      });
    } catch (error) {
      authLogger.error('Ownership middleware error', { 
        error: error.message, 
        stack: error.stack,
        endpoint: req.path 
      });
      return res.status(500).json({
        error: {
          code: 'OWNERSHIP_CHECK_ERROR',
          message: 'Ownership check failed'
        }
      });
    }
  };
};

// Helper function to check permissions
const hasPermission = (userPermissions, requiredPermission, req) => {
  // Check for exact match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // Parse permission components
  const [resource, action, scope] = requiredPermission.split(':');

  // Check for wildcard permissions
  const wildcardPermissions = [
    `${resource}:${action}:*`,
    `${resource}:*:*`,
    `*:*:*`
  ];

  for (const wildcardPerm of wildcardPermissions) {
    if (userPermissions.includes(wildcardPerm)) {
      return true;
    }
  }

  // Check for scoped permissions
  if (scope && scope !== '*') {
    const scopedPermissions = userPermissions.filter(perm => 
      perm.startsWith(`${resource}:${action}:`) && perm !== `${resource}:${action}:*`
    );

    for (const scopedPerm of scopedPermissions) {
      const allowedScopes = scopedPerm.split(':')[2].split(',');
      if (allowedScopes.includes(scope)) {
        return true;
      }
    }
  }

  // Special cases for ownership-based permissions
  if (scope === 'own' && req.user) {
    const resourceId = req.params.id || req.params.userId;
    if (resourceId && parseInt(resourceId) === req.user.user_id) {
      return true;
    }
  }

  return false;
};

// Get user permissions
const getUserPermissions = (userRole) => {
  return ROLE_PERMISSIONS[userRole] || [];
};

// Check if user can manage another user based on role hierarchy
const canManageUser = (managerRole, targetRole) => {
  const managerLevel = ROLE_HIERARCHY[managerRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

  // Special case: super_admin cannot manage owner
  if (managerRole === 'super_admin' && targetRole === 'owner') {
    return false;
  }

  return managerLevel > targetLevel;
};

// Middleware to check if user can manage target user
const requireUserManagement = () => {
  return async (req, res, next) => {
    try {
      const targetUserId = req.params.id || req.params.userId;
      const managerRole = req.user.role.role_name;

      if (!targetUserId) {
        return next(); // Let the endpoint handle missing ID
      }

      // Get target user's role
      const { User, Role } = require('../models');
      const targetUser = await User.findByPk(targetUserId, {
        include: [{ model: Role, as: 'role' }]
      });

      if (!targetUser) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Target user not found'
          }
        });
      }

      const targetRole = targetUser.role.role_name;

      if (canManageUser(managerRole, targetRole)) {
        req.targetUser = targetUser;
        next();
      } else {
        authLogger.warn('User management check failed', { 
          managerId: req.user.user_id,
          managerRole,
          targetId: targetUserId,
          targetRole,
          endpoint: req.path 
        });
        return res.status(403).json({
          error: {
            code: 'CANNOT_MANAGE_USER',
            message: `You cannot manage users with role: ${targetRole}`
          }
        });
      }
    } catch (error) {
      authLogger.error('User management middleware error', { 
        error: error.message, 
        stack: error.stack,
        endpoint: req.path 
      });
      return res.status(500).json({
        error: {
          code: 'USER_MANAGEMENT_CHECK_ERROR',
          message: 'User management check failed'
        }
      });
    }
  };
};

module.exports = {
  requirePermission,
  requireRole,
  requireMinRole,
  requireOwnership,
  requireUserManagement,
  hasPermission,
  getUserPermissions,
  canManageUser,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS
};
