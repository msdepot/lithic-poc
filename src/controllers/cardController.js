const { Card, User, Account, SpendingProfile, Role, Transaction, AuditLog } = require('../models');
const { lithicService } = require('../config/lithic');
const { apiLogger } = require('../utils/logger');
const { Op } = require('sequelize');

class CardController {
  // Create new card
  async createCard(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const {
        user_id,
        account_id,
        card_type,
        card_subtype = 'virtual',
        spending_profile_id,
        custom_limits,
        memo
      } = req.body;
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

      // Check if user can have cards (must be 'user' role or higher)
      if (!['user', 'admin', 'super_admin', 'owner'].includes(user.role.role_name)) {
        await transaction.rollback();
        return res.status(400).json({
          error: {
            code: 'INVALID_USER_ROLE',
            message: 'User must have role of "user" or higher to have cards'
          }
        });
      }

      // Get account and verify it belongs to the user
      const account = await Account.findByPk(account_id, { transaction });
      if (!account) {
        await transaction.rollback();
        return res.status(404).json({
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'Account not found'
          }
        });
      }

      if (account.user_id !== user_id) {
        await transaction.rollback();
        return res.status(400).json({
          error: {
            code: 'ACCOUNT_USER_MISMATCH',
            message: 'Account does not belong to the specified user'
          }
        });
      }

      // Validate spending profile if provided
      let spendingProfile = null;
      if (spending_profile_id) {
        spendingProfile = await SpendingProfile.findByPk(spending_profile_id, { transaction });
        if (!spendingProfile) {
          await transaction.rollback();
          return res.status(404).json({
            error: {
              code: 'SPENDING_PROFILE_NOT_FOUND',
              message: 'Spending profile not found'
            }
          });
        }
      }

      // Create Lithic card first
      let lithicCard = null;
      try {
        const cardData = {
          card_subtype,
          memo,
          lithic_financial_account_token: account.lithic_financial_account_token
        };

        lithicCard = await lithicService.createCard(lithicService.transformCardData(cardData));
        
        apiLogger.info('Lithic card created', {
          lithicCardToken: lithicCard.token,
          cardType: card_subtype,
          userId: user_id
        });
      } catch (lithicError) {
        await transaction.rollback();
        apiLogger.error('Failed to create Lithic card', {
          error: lithicError.message,
          userId: user_id,
          accountId: account_id
        });
        return res.status(500).json({
          error: {
            code: 'LITHIC_CARD_CREATION_FAILED',
            message: 'Failed to create card with Lithic'
          }
        });
      }

      // Create local card record
      const card = await Card.create({
        user_id,
        account_id,
        spending_profile_id,
        card_type,
        card_subtype,
        memo,
        custom_daily_limit: custom_limits?.daily_limit,
        custom_monthly_limit: custom_limits?.monthly_limit,
        custom_per_transaction_limit: custom_limits?.per_transaction_limit,
        lithic_card_token: lithicCard.token
      }, { transaction });

      // Handle spending limits
      let lithicAuthRule = null;
      if (spending_profile_id && spendingProfile) {
        // Apply spending profile auth rule to card
        try {
          if (spendingProfile.lithic_auth_rule_token) {
            await lithicService.applyAuthRule(spendingProfile.lithic_auth_rule_token, {
              card_tokens: [lithicCard.token]
            });
            apiLogger.info('Spending profile applied to card', {
              cardId: card.card_id,
              profileId: spending_profile_id,
              lithicCardToken: lithicCard.token
            });
          }
        } catch (lithicError) {
          apiLogger.warn('Failed to apply spending profile to Lithic card', {
            cardId: card.card_id,
            error: lithicError.message
          });
        }
      } else if (custom_limits) {
        // Create individual auth rule for custom limits
        try {
          const authRuleData = card.toCustomAuthRule();
          if (authRuleData) {
            lithicAuthRule = await lithicService.createAuthRule(authRuleData);
            await card.update({
              lithic_auth_rule_token: lithicAuthRule.token
            }, { transaction });
            
            apiLogger.info('Custom auth rule created for card', {
              cardId: card.card_id,
              lithicAuthRuleToken: lithicAuthRule.token
            });
          }
        } catch (lithicError) {
          apiLogger.warn('Failed to create custom auth rule for card', {
            cardId: card.card_id,
            error: lithicError.message
          });
        }
      }

      await transaction.commit();

      // Create audit log
      await AuditLog.logCreate('cards', card.card_id, {
        user_id: card.user_id,
        account_id: card.account_id,
        card_type: card.card_type,
        card_subtype: card.card_subtype,
        spending_profile_id: card.spending_profile_id,
        lithic_card_token: card.lithic_card_token,
        created_by: createdBy.user_id
      }, createdBy.user_id, req);

      // Get card with relations for response
      const createdCard = await Card.findByPk(card.card_id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'first_name', 'last_name']
          },
          {
            model: Account,
            as: 'account',
            attributes: ['account_id', 'account_name', 'account_type']
          },
          {
            model: SpendingProfile,
            as: 'spending_profile',
            attributes: ['spending_profile_id', 'profile_name', 'daily_limit', 'monthly_limit', 'per_transaction_limit']
          }
        ]
      });

      apiLogger.info('Card created successfully', {
        cardId: card.card_id,
        userId: user_id,
        accountId: account_id,
        createdBy: createdBy.user_id
      });

      res.status(201).json({
        success: true,
        message: 'Card created successfully',
        data: {
          card: createdCard,
          lithic_card: {
            token: lithicCard.token,
            status: lithicCard.status,
            type: lithicCard.type
          },
          effective_limits: await createdCard.getEffectiveLimits()
        }
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Create card error', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body,
        createdBy: req.user?.user_id
      });

      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: validationErrors
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'CREATE_CARD_ERROR',
          message: 'Failed to create card'
        }
      });
    }
  }

  // Get all cards
  async getCards(req, res) {
    try {
      const {
        limit = 50,
        offset = 0,
        user_id,
        account_id,
        card_type,
        status
      } = req.query;

      const whereClause = {};
      
      // Filter by user (for admins to view specific user cards)
      if (user_id) {
        whereClause.user_id = user_id;
      } else if (req.user.role.role_name === 'user') {
        // Regular users can only see their own cards
        whereClause.user_id = req.user.user_id;
      }

      // Filter by account
      if (account_id) {
        whereClause.account_id = account_id;
      }

      // Filter by card type
      if (card_type) {
        whereClause.card_type = card_type;
      }

      // Filter by status
      if (status) {
        whereClause.status = status;
      }

      const cards = await Card.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'first_name', 'last_name']
          },
          {
            model: Account,
            as: 'account',
            attributes: ['account_id', 'account_name', 'account_type']
          },
          {
            model: SpendingProfile,
            as: 'spending_profile',
            attributes: ['spending_profile_id', 'profile_name', 'daily_limit', 'monthly_limit', 'per_transaction_limit']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      // Add effective limits for each card
      const cardsWithLimits = await Promise.all(
        cards.rows.map(async (card) => {
          const effectiveLimits = await card.getEffectiveLimits();
          return {
            ...card.toJSON(),
            effective_limits: effectiveLimits
          };
        })
      );

      res.json({
        success: true,
        data: {
          cards: cardsWithLimits,
          pagination: {
            total: cards.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(cards.count / limit)
          }
        }
      });

    } catch (error) {
      apiLogger.error('Get cards error', {
        error: error.message,
        stack: error.stack,
        query: req.query,
        userId: req.user?.user_id
      });

      res.status(500).json({
        error: {
          code: 'GET_CARDS_ERROR',
          message: 'Failed to retrieve cards'
        }
      });
    }
  }

  // Get card by ID
  async getCardById(req, res) {
    try {
      const { id } = req.params;

      const card = await Card.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'first_name', 'last_name']
          },
          {
            model: Account,
            as: 'account',
            attributes: ['account_id', 'account_name', 'account_type', 'balance']
          },
          {
            model: SpendingProfile,
            as: 'spending_profile',
            attributes: ['spending_profile_id', 'profile_name', 'daily_limit', 'monthly_limit', 'per_transaction_limit']
          }
        ]
      });

      if (!card) {
        return res.status(404).json({
          error: {
            code: 'CARD_NOT_FOUND',
            message: 'Card not found'
          }
        });
      }

      // Check access permissions
      if (req.user.role.role_name === 'user' && card.user_id !== req.user.user_id) {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only access your own cards'
          }
        });
      }

      const effectiveLimits = await card.getEffectiveLimits();

      // Get recent transactions
      const recentTransactions = await Transaction.findAll({
        where: { card_id: card.card_id },
        limit: 10,
        order: [['transaction_date', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          card: card.toJSON(),
          effective_limits: effectiveLimits,
          recent_transactions: recentTransactions
        }
      });

    } catch (error) {
      apiLogger.error('Get card by ID error', {
        error: error.message,
        stack: error.stack,
        cardId: req.params.id,
        userId: req.user?.user_id
      });

      res.status(500).json({
        error: {
          code: 'GET_CARD_ERROR',
          message: 'Failed to retrieve card'
        }
      });
    }
  }

  // Update card
  async updateCard(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedBy = req.user;

      const card = await Card.findByPk(id, {
        include: [
          { model: User, as: 'user' },
          { model: Account, as: 'account' },
          { model: SpendingProfile, as: 'spending_profile' }
        ],
        transaction
      });

      if (!card) {
        await transaction.rollback();
        return res.status(404).json({
          error: {
            code: 'CARD_NOT_FOUND',
            message: 'Card not found'
          }
        });
      }

      // Check access permissions
      if (req.user.role.role_name === 'user' && card.user_id !== req.user.user_id) {
        await transaction.rollback();
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only update your own cards'
          }
        });
      }

      // Store old values for audit
      const oldValues = {
        spending_profile_id: card.spending_profile_id,
        custom_daily_limit: card.custom_daily_limit,
        custom_monthly_limit: card.custom_monthly_limit,
        custom_per_transaction_limit: card.custom_per_transaction_limit,
        memo: card.memo
      };

      // Handle spending profile assignment
      if (updates.spending_profile_id !== undefined) {
        if (updates.spending_profile_id === null) {
          // Remove from spending profile
          await card.assignToProfile(null, transaction);
        } else {
          // Assign to new spending profile
          const profile = await SpendingProfile.findByPk(updates.spending_profile_id, { transaction });
          if (!profile) {
            await transaction.rollback();
            return res.status(404).json({
              error: {
                code: 'SPENDING_PROFILE_NOT_FOUND',
                message: 'Spending profile not found'
              }
            });
          }
          await card.assignToProfile(updates.spending_profile_id, transaction);
        }
      }

      // Handle custom limits
      if (updates.custom_limits) {
        await card.setCustomLimits(updates.custom_limits, transaction);
      }

      // Update other fields
      const otherUpdates = { ...updates };
      delete otherUpdates.spending_profile_id;
      delete otherUpdates.custom_limits;
      
      if (Object.keys(otherUpdates).length > 0) {
        await card.update(otherUpdates, { transaction });
      }

      await transaction.commit();

      // Create audit log
      await AuditLog.logUpdate('cards', card.card_id, oldValues, {
        spending_profile_id: card.spending_profile_id,
        custom_daily_limit: card.custom_daily_limit,
        custom_monthly_limit: card.custom_monthly_limit,
        custom_per_transaction_limit: card.custom_per_transaction_limit,
        memo: card.memo,
        updated_by: updatedBy.user_id
      }, updatedBy.user_id, req);

      // Get updated card with relations
      const updatedCard = await Card.findByPk(card.card_id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['user_id', 'username', 'first_name', 'last_name']
          },
          {
            model: Account,
            as: 'account',
            attributes: ['account_id', 'account_name', 'account_type']
          },
          {
            model: SpendingProfile,
            as: 'spending_profile',
            attributes: ['spending_profile_id', 'profile_name', 'daily_limit', 'monthly_limit', 'per_transaction_limit']
          }
        ]
      });

      const effectiveLimits = await updatedCard.getEffectiveLimits();

      apiLogger.info('Card updated successfully', {
        cardId: card.card_id,
        updatedBy: updatedBy.user_id
      });

      res.json({
        success: true,
        message: 'Card updated successfully',
        data: {
          card: updatedCard,
          effective_limits: effectiveLimits
        }
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Update card error', {
        error: error.message,
        stack: error.stack,
        cardId: req.params.id,
        updates: req.body
      });

      if (error.name === 'SequelizeValidationError') {
        const validationErrors = error.errors.map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: validationErrors
          }
        });
      }

      res.status(500).json({
        error: {
          code: 'UPDATE_CARD_ERROR',
          message: 'Failed to update card'
        }
      });
    }
  }

  // Update card status
  async updateCardStatus(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const updatedBy = req.user;

      const card = await Card.findByPk(id, { transaction });

      if (!card) {
        await transaction.rollback();
        return res.status(404).json({
          error: {
            code: 'CARD_NOT_FOUND',
            message: 'Card not found'
          }
        });
      }

      // Check access permissions
      if (req.user.role.role_name === 'user' && card.user_id !== req.user.user_id) {
        await transaction.rollback();
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only update your own cards'
          }
        });
      }

      const statusChange = await card.updateStatus(status, reason);

      // Update Lithic card status
      try {
        const lithicStatus = {
          'active': 'OPEN',
          'locked': 'PAUSED',
          'cancelled': 'CLOSED'
        }[status];

        if (lithicStatus) {
          await lithicService.updateCard(card.lithic_card_token, {
            state: lithicStatus,
            memo: reason || `Status changed to ${status}`
          });
          
          apiLogger.info('Lithic card status updated', {
            cardId: card.card_id,
            lithicCardToken: card.lithic_card_token,
            newStatus: lithicStatus
          });
        }
      } catch (lithicError) {
        apiLogger.warn('Failed to update Lithic card status', {
          cardId: card.card_id,
          error: lithicError.message
        });
      }

      await transaction.commit();

      // Create audit log
      await AuditLog.logUpdate('cards', card.card_id, 
        { status: statusChange.old_status }, 
        { status: statusChange.new_status, reason: statusChange.reason }, 
        updatedBy.user_id, req
      );

      apiLogger.info('Card status updated successfully', {
        cardId: card.card_id,
        oldStatus: statusChange.old_status,
        newStatus: statusChange.new_status,
        updatedBy: updatedBy.user_id
      });

      res.json({
        success: true,
        message: 'Card status updated successfully',
        data: {
          card_id: card.card_id,
          old_status: statusChange.old_status,
          new_status: statusChange.new_status,
          reason: statusChange.reason
        }
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Update card status error', {
        error: error.message,
        stack: error.stack,
        cardId: req.params.id,
        status: req.body.status
      });

      res.status(500).json({
        error: {
          code: 'UPDATE_CARD_STATUS_ERROR',
          message: 'Failed to update card status'
        }
      });
    }
  }

  // Get card spending limits
  async getCardLimits(req, res) {
    try {
      const { id } = req.params;

      const card = await Card.findByPk(id, {
        include: [
          {
            model: SpendingProfile,
            as: 'spending_profile',
            attributes: ['spending_profile_id', 'profile_name', 'daily_limit', 'monthly_limit', 'per_transaction_limit']
          }
        ]
      });

      if (!card) {
        return res.status(404).json({
          error: {
            code: 'CARD_NOT_FOUND',
            message: 'Card not found'
          }
        });
      }

      // Check access permissions
      if (req.user.role.role_name === 'user' && card.user_id !== req.user.user_id) {
        return res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: 'You can only access your own cards'
          }
        });
      }

      const effectiveLimits = await card.getEffectiveLimits();

      // Get current spending for the month and day
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const monthlySpending = await Transaction.sum('amount', {
        where: {
          card_id: card.card_id,
          transaction_date: {
            [Op.gte]: startOfMonth
          },
          status: ['pending', 'settled']
        }
      }) || 0;

      const dailySpending = await Transaction.sum('amount', {
        where: {
          card_id: card.card_id,
          transaction_date: {
            [Op.gte]: startOfDay
          },
          status: ['pending', 'settled']
        }
      }) || 0;

      res.json({
        success: true,
        data: {
          card_id: card.card_id,
          effective_limits: effectiveLimits,
          current_spending: {
            daily: parseFloat(dailySpending),
            monthly: parseFloat(monthlySpending)
          },
          remaining_limits: {
            daily: effectiveLimits.daily_limit ? Math.max(0, parseFloat(effectiveLimits.daily_limit) - parseFloat(dailySpending)) : null,
            monthly: effectiveLimits.monthly_limit ? Math.max(0, parseFloat(effectiveLimits.monthly_limit) - parseFloat(monthlySpending)) : null
          }
        }
      });

    } catch (error) {
      apiLogger.error('Get card limits error', {
        error: error.message,
        stack: error.stack,
        cardId: req.params.id
      });

      res.status(500).json({
        error: {
          code: 'GET_CARD_LIMITS_ERROR',
          message: 'Failed to retrieve card limits'
        }
      });
    }
  }
}

module.exports = new CardController();
