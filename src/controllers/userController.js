const { User, Role, Account, AuditLog } = require('../models');
const { lithicService } = require('../config/lithic');
const { apiLogger } = require('../utils/logger');
const { Op } = require('sequelize');

class UserController {
  // Create new user
  async createUser(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { username, email, password, role, first_name, last_name, phone } = req.body;
      const createdBy = req.user;

      // Get role ID
      const roleRecord = await Role.findOne({ where: { role_name: role } });
      if (!roleRecord) {
        await transaction.rollback();
        return res.status(400).json({
          error: {
            code: 'INVALID_ROLE',
            message: 'Invalid role specified'
          }
        });
      }

      // Check if creating user has permission to create this role
      const { canManageUser } = require('../middleware/rbac');
      if (!canManageUser(createdBy.role.role_name, role)) {
        await transaction.rollback();
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `You cannot create users with role: ${role}`
          }
        });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password_hash: password, // Will be hashed by model hook
        role_id: roleRecord.role_id,
        first_name,
        last_name,
        phone
      }, { transaction });

      // Create Lithic account holder if user role is 'user' or higher
      let lithicAccountHolder = null;
      if (['user', 'admin', 'super_admin', 'owner'].includes(role)) {
        try {
          const accountHolderData = lithicService.transformUserToAccountHolder({
            email: user.email,
            first_name: user.first_name || 'User',
            last_name: user.last_name || 'Name',
            phone: user.phone || '+12345678901',
            address1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            dob: '1990-01-01',
            government_id: '123456789',
            account_type: 'individual'
          });

          lithicAccountHolder = await lithicService.createAccountHolder(accountHolderData);
          
          // Update user with Lithic token
          await user.update({
            lithic_account_holder_token: lithicAccountHolder.token
          }, { transaction });

          apiLogger.info('Lithic account holder created', {
            userId: user.user_id,
            lithicToken: lithicAccountHolder.token
          });
        } catch (lithicError) {
          apiLogger.warn('Failed to create Lithic account holder', {
            userId: user.user_id,
            error: lithicError.message
          });
          // Continue without Lithic integration for now
        }
      }

      await transaction.commit();

      // Create audit log
      await AuditLog.logCreate('users', user.user_id, {
        username: user.username,
        email: user.email,
        role: role,
        created_by: createdBy.user_id
      }, createdBy.user_id, req);

      // Get user with role for response
      const createdUser = await User.findByPk(user.user_id, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name', 'role_description']
          }
        ]
      });

      apiLogger.info('User created successfully', {
        userId: user.user_id,
        username: user.username,
        role: role,
        createdBy: createdBy.user_id
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: createdUser,
          lithic_account_holder: lithicAccountHolder ? {
            token: lithicAccountHolder.token,
            status: lithicAccountHolder.status
          } : null
        }
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Create user error', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body,
        createdBy: req.user?.user_id
      });

      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0].path;
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_VALUE',
            message: `${field} already exists`
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'CREATE_USER_ERROR',
          message: 'Failed to create user'
        }
      });
    }
  }

  // Get all users
  async getUsers(req, res) {
    try {
      const {
        limit = 50,
        offset = 0,
        role,
        is_active,
        search
      } = req.query;

      const whereClause = {};
      
      // Filter by role
      if (role) {
        const roleRecord = await Role.findOne({ where: { role_name: role } });
        if (roleRecord) {
          whereClause.role_id = roleRecord.role_id;
        }
      }

      // Filter by active status
      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }

      // Search filter
      if (search) {
        whereClause[Op.or] = [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const users = await User.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name', 'role_description']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          users: users.rows,
          pagination: {
            total: users.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(users.count / limit)
          }
        }
      });

    } catch (error) {
      apiLogger.error('Get users error', {
        error: error.message,
        stack: error.stack,
        query: req.query
      });

      res.status(500).json({
        error: {
          code: 'GET_USERS_ERROR',
          message: 'Failed to retrieve users'
        }
      });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name', 'role_description']
          },
          {
            model: Account,
            as: 'accounts',
            attributes: ['account_id', 'account_name', 'account_type', 'balance', 'is_active']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      apiLogger.error('Get user by ID error', {
        error: error.message,
        stack: error.stack,
        userId: req.params.id
      });

      res.status(500).json({
        error: {
          code: 'GET_USER_ERROR',
          message: 'Failed to retrieve user'
        }
      });
    }
  }

  // Update user
  async updateUser(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedBy = req.user;

      const user = await User.findByPk(id, {
        include: [{ model: Role, as: 'role' }],
        transaction
      });

      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Store old values for audit
      const oldValues = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role.role_name,
        is_active: user.is_active
      };

      // Handle role change
      if (updates.role && updates.role !== user.role.role_name) {
        const { canManageUser } = require('../middleware/rbac');
        
        // Check if updater can manage current user
        if (!canManageUser(updatedBy.role.role_name, user.role.role_name)) {
          await transaction.rollback();
          return res.status(403).json({
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: `You cannot manage users with role: ${user.role.role_name}`
            }
          });
        }

        // Check if updater can assign new role
        if (!canManageUser(updatedBy.role.role_name, updates.role)) {
          await transaction.rollback();
          return res.status(403).json({
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: `You cannot assign role: ${updates.role}`
            }
          });
        }

        const newRole = await Role.findOne({ where: { role_name: updates.role } });
        if (!newRole) {
          await transaction.rollback();
          return res.status(400).json({
            error: {
              code: 'INVALID_ROLE',
              message: 'Invalid role specified'
            }
          });
        }

        updates.role_id = newRole.role_id;
        delete updates.role; // Remove role from updates since we're using role_id
      }

      // Update user
      await user.update(updates, { transaction });

      // Update Lithic account holder if needed
      if (user.lithic_account_holder_token && (updates.email || updates.first_name || updates.last_name || updates.phone)) {
        try {
          const updateData = {};
          if (updates.email) updateData.email = updates.email;
          if (updates.first_name || updates.last_name) {
            updateData.control_person = {
              first_name: updates.first_name || user.first_name,
              last_name: updates.last_name || user.last_name,
              email: updates.email || user.email
            };
          }

          await lithicService.updateAccountHolder(user.lithic_account_holder_token, updateData);
          
          apiLogger.info('Lithic account holder updated', {
            userId: user.user_id,
            lithicToken: user.lithic_account_holder_token
          });
        } catch (lithicError) {
          apiLogger.warn('Failed to update Lithic account holder', {
            userId: user.user_id,
            error: lithicError.message
          });
        }
      }

      await transaction.commit();

      // Create audit log
      await AuditLog.logUpdate('users', user.user_id, oldValues, {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: updates.role || oldValues.role,
        is_active: user.is_active,
        updated_by: updatedBy.user_id
      }, updatedBy.user_id, req);

      // Get updated user with role
      const updatedUser = await User.findByPk(user.user_id, {
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name', 'role_description']
          }
        ]
      });

      apiLogger.info('User updated successfully', {
        userId: user.user_id,
        updatedBy: updatedBy.user_id,
        changes: Object.keys(updates)
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Update user error', {
        error: error.message,
        stack: error.stack,
        userId: req.params.id,
        updates: req.body
      });

      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0].path;
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_VALUE',
            message: `${field} already exists`
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'UPDATE_USER_ERROR',
          message: 'Failed to update user'
        }
      });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { id } = req.params;
      const deletedBy = req.user;

      const user = await User.findByPk(id, {
        include: [
          { model: Role, as: 'role' },
          { model: Account, as: 'accounts' }
        ],
        transaction
      });

      if (!user) {
        await transaction.rollback();
        return res.status(404).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Check permissions
      const { canManageUser } = require('../middleware/rbac');
      if (!canManageUser(deletedBy.role.role_name, user.role.role_name)) {
        await transaction.rollback();
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: `You cannot delete users with role: ${user.role.role_name}`
          }
        });
      }

      // Check if user has active accounts with cards
      const { Card } = require('../models');
      const activeCards = await Card.count({
        include: [
          {
            model: Account,
            as: 'account',
            where: { user_id: user.user_id }
          }
        ],
        where: { status: ['active', 'locked'] },
        transaction
      });

      if (activeCards > 0) {
        await transaction.rollback();
        return res.status(400).json({
          error: {
            code: 'USER_HAS_ACTIVE_CARDS',
            message: 'Cannot delete user with active cards'
          }
        });
      }

      // Store user data for audit
      const userData = {
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role.role_name
      };

      // Delete user (this will cascade to sessions due to foreign key constraints)
      await user.destroy({ transaction });

      await transaction.commit();

      // Create audit log
      await AuditLog.logDelete('users', parseInt(id), userData, deletedBy.user_id, req);

      apiLogger.info('User deleted successfully', {
        deletedUserId: parseInt(id),
        deletedBy: deletedBy.user_id,
        username: userData.username
      });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Delete user error', {
        error: error.message,
        stack: error.stack,
        userId: req.params.id
      });

      res.status(500).json({
        error: {
          code: 'DELETE_USER_ERROR',
          message: 'Failed to delete user'
        }
      });
    }
  }
}

module.exports = new UserController();
