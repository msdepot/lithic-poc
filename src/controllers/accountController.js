const { Account, User, Role, Card, AuditLog } = require('../models');
const { lithicService } = require('../config/lithic');
const { apiLogger } = require('../utils/logger');
const { Op } = require('sequelize');

class AccountController {
  // Create new account
  async createAccount(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { account_name, user_id, account_type = 'personal', initial_balance = 0 } = req.body;
      const createdBy = req.user;

      // Get user with role
      const user = await User.findByPk(user_id, {
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

      // Check if user can have accounts (must be 'user' role or higher)
      if (!['user', 'admin', 'super_admin', 'owner'].includes(user.role.role_name)) {
        await transaction.rollback();
        return res.status(400).json({
          error: {
            code: 'INVALID_USER_ROLE',
            message: 'User must have role of "user" or higher to have accounts'
          }
        });
      }

      // Create account
      const account = await Account.create({
        user_id,
        account_name,
        account_type,
        balance: initial_balance
      }, { transaction });

      // Create Lithic financial account if user has Lithic account holder
      let lithicFinancialAccount = null;
      if (user.lithic_account_holder_token) {
        try {
          const financialAccountData = lithicService.transformAccountToFinancialAccount({
            account_name,
            account_type
          });

          lithicFinancialAccount = await lithicService.createFinancialAccount(financialAccountData);
          
          // Update account with Lithic token
          await account.update({
            lithic_financial_account_token: lithicFinancialAccount.token
          }, { transaction });

          apiLogger.info('Lithic financial account created', {
            accountId: account.account_id,
            lithicToken: lithicFinancialAccount.token,
            userId: user_id
          });
        } catch (lithicError) {
          apiLogger.warn('Failed to create Lithic financial account', {
            accountId: account.account_id,
            userId: user_id,
            error: lithicError.message
          });
          // Continue without Lithic integration for now
        }
      }

      await transaction.commit();

      // Create audit log
      await AuditLog.logCreate('accounts', account.account_id, {
        account_name: account.account_name,
        user_id: account.user_id,
        account_type: account.account_type,
        initial_balance: account.balance,
        created_by: createdBy.user_id
      }, createdBy.user_id, req);

      // Get account with user for response
      const createdAccount = await Account.findByPk(account.account_id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'first_name', 'last_name'],
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['role_name']
              }
            ]
          }
        ]
      });

      apiLogger.info('Account created successfully', {
        accountId: account.account_id,
        userId: user_id,
        createdBy: createdBy.user_id
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          account: createdAccount,
          lithic_financial_account: lithicFinancialAccount ? {
            token: lithicFinancialAccount.token,
            status: lithicFinancialAccount.status
          } : null
        }
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Create account error', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body,
        createdBy: req.user?.user_id
      });

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_ACCOUNT_NAME',
            message: 'Account name already exists for this user'
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'CREATE_ACCOUNT_ERROR',
          message: 'Failed to create account'
        }
      });
    }
  }

  // Get all accounts
  async getAccounts(req, res) {
    try {
      const {
        limit = 50,
        offset = 0,
        user_id,
        account_type,
        is_active
      } = req.query;

      const whereClause = {};
      
      // Filter by user (for admins to view specific user accounts)
      if (user_id) {
        whereClause.user_id = user_id;
      } else if (req.user.role.role_name === 'user') {
        // Regular users can only see their own accounts
        whereClause.user_id = req.user.user_id;
      }

      // Filter by account type
      if (account_type) {
        whereClause.account_type = account_type;
      }

      // Filter by active status
      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }

      const accounts = await Account.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'first_name', 'last_name'],
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['role_name']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          accounts: accounts.rows,
          pagination: {
            total: accounts.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(accounts.count / limit)
          }
        }
      });

    } catch (error) {
      apiLogger.error('Get accounts error', {
        error: error.message,
        stack: error.stack,
        query: req.query,
        userId: req.user?.user_id
      });

      res.status(500).json({
        error: {
          code: 'GET_ACCOUNTS_ERROR',
          message: 'Failed to retrieve accounts'
        }
      });
    }
  }

  // Get account by ID
  async getAccountById(req, res) {
    try {
      const { id } = req.params;

      const account = await Account.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'first_name', 'last_name'],
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['role_name']
              }
            ]
          },
          {
            model: Card,
            as: 'cards',
            attributes: ['card_id', 'card_type', 'card_subtype', 'status', 'lithic_card_token']
          }
        ]
      });

      if (!account) {
        return res.status(404).json({
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Account not found'
          }
        });
      }

      // Check access permissions
      if (req.user.role.role_name === 'user' && account.user_id !== req.user.user_id) {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only access your own accounts'
          }
        });
      }

      res.json({
        success: true,
        data: { account }
      });

    } catch (error) {
      apiLogger.error('Get account by ID error', {
        error: error.message,
        stack: error.stack,
        accountId: req.params.id,
        userId: req.user?.user_id
      });

      res.status(500).json({
        error: {
          code: 'GET_ACCOUNT_ERROR',
          message: 'Failed to retrieve account'
        }
      });
    }
  }

  // Update account
  async updateAccount(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedBy = req.user;

      const account = await Account.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            include: [{ model: Role, as: 'role' }]
          }
        ],
        transaction
      });

      if (!account) {
        await transaction.rollback();
        return res.status(404).json({
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Account not found'
          }
        });
      }

      // Check access permissions
      if (req.user.role.role_name === 'user' && account.user_id !== req.user.user_id) {
        await transaction.rollback();
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only update your own accounts'
          }
        });
      }

      // Store old values for audit
      const oldValues = {
        account_name: account.account_name,
        account_type: account.account_type
      };

      // Update account
      await account.update(updates, { transaction });

      // Update Lithic financial account if needed
      if (account.lithic_financial_account_token && updates.account_name) {
        try {
          await lithicService.updateFinancialAccount(account.lithic_financial_account_token, {
            nickname: updates.account_name
          });
          
          apiLogger.info('Lithic financial account updated', {
            accountId: account.account_id,
            lithicToken: account.lithic_financial_account_token
          });
        } catch (lithicError) {
          apiLogger.warn('Failed to update Lithic financial account', {
            accountId: account.account_id,
            error: lithicError.message
          });
        }
      }

      await transaction.commit();

      // Create audit log
      await AuditLog.logUpdate('accounts', account.account_id, oldValues, {
        account_name: account.account_name,
        account_type: account.account_type,
        updated_by: updatedBy.user_id
      }, updatedBy.user_id, req);

      apiLogger.info('Account updated successfully', {
        accountId: account.account_id,
        updatedBy: updatedBy.user_id
      });

      res.json({
        success: true,
        message: 'Account updated successfully',
        data: { account }
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Update account error', {
        error: error.message,
        stack: error.stack,
        accountId: req.params.id,
        updates: req.body
      });

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_ACCOUNT_NAME',
            message: 'Account name already exists for this user'
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'UPDATE_ACCOUNT_ERROR',
          message: 'Failed to update account'
        }
      });
    }
  }

  // Add funds to account
  async addFunds(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { amount, funding_source, description } = req.body;
      const addedBy = req.user;

      const account = await Account.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            include: [{ model: Role, as: 'role' }]
          }
        ],
        transaction
      });

      if (!account) {
        await transaction.rollback();
        return res.status(404).json({
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Account not found'
          }
        });
      }

      // Store old balance for audit
      const oldBalance = parseFloat(account.balance);

      // Add funds to account
      const newBalance = await account.addFunds(amount);

      await transaction.commit();

      // Create audit log
      await AuditLog.logUpdate('accounts', account.account_id, 
        { balance: oldBalance }, 
        { balance: newBalance, funding_added: amount, funding_source }, 
        addedBy.user_id, req
      );

      // Note: In sandbox, external payments might not work
      // This is a placeholder for funding operations
      apiLogger.info('Funds added to account', {
        accountId: account.account_id,
        amount: amount,
        oldBalance: oldBalance,
        newBalance: newBalance,
        fundingSource: funding_source,
        addedBy: addedBy.user_id
      });

      res.json({
        success: true,
        message: 'Funds added successfully',
        data: {
          account_id: account.account_id,
          old_balance: oldBalance,
          amount_added: parseFloat(amount),
          new_balance: newBalance,
          funding_source
        }
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Add funds error', {
        error: error.message,
        stack: error.stack,
        accountId: req.params.id,
        amount: req.body.amount
      });

      res.status(500).json({
        error: {
          code: 'ADD_FUNDS_ERROR',
          message: 'Failed to add funds to account'
        }
      });
    }
  }

  // Delete account
  async deleteAccount(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { id } = req.params;
      const deletedBy = req.user;

      const account = await Account.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            include: [{ model: Role, as: 'role' }]
          }
        ],
        transaction
      });

      if (!account) {
        await transaction.rollback();
        return res.status(404).json({
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Account not found'
          }
        });
      }

      // Check if account has active cards
      const activeCards = await account.hasActiveCards();
      if (activeCards) {
        await transaction.rollback();
        return res.status(400).json({
          error: {
            code: 'ACCOUNT_HAS_ACTIVE_CARDS',
            message: 'Cannot delete account with active cards'
          }
        });
      }

      // Store account data for audit
      const accountData = {
        account_name: account.account_name,
        account_type: account.account_type,
        balance: account.balance,
        user_id: account.user_id
      };

      // Delete account
      await account.destroy({ transaction });

      await transaction.commit();

      // Create audit log
      await AuditLog.logDelete('accounts', parseInt(id), accountData, deletedBy.user_id, req);

      apiLogger.info('Account deleted successfully', {
        deletedAccountId: parseInt(id),
        deletedBy: deletedBy.user_id,
        accountName: accountData.account_name
      });

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Delete account error', {
        error: error.message,
        stack: error.stack,
        accountId: req.params.id
      });

      res.status(500).json({
        error: {
          code: 'DELETE_ACCOUNT_ERROR',
          message: 'Failed to delete account'
        }
      });
    }
  }
}

module.exports = new AccountController();
