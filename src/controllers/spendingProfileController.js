const { SpendingProfile, Card, User, Account, AuditLog } = require('../models');
const { lithicService } = require('../config/lithic');
const { apiLogger } = require('../utils/logger');

class SpendingProfileController {
  // Create new spending profile
  async createSpendingProfile(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const {
        profile_name,
        description,
        daily_limit,
        monthly_limit,
        per_transaction_limit,
        allowed_merchant_categories = [],
        blocked_merchant_categories = []
      } = req.body;
      const createdBy = req.user;

      // Create spending profile
      const profile = await SpendingProfile.create({
        profile_name,
        description,
        daily_limit,
        monthly_limit,
        per_transaction_limit,
        allowed_merchant_categories,
        blocked_merchant_categories
      }, { transaction });

      // Create corresponding Lithic auth rule
      let lithicAuthRule = null;
      try {
        const authRuleData = lithicService.transformSpendingProfileToAuthRule(profile, []);
        lithicAuthRule = await lithicService.createAuthRule(authRuleData);
        
        // Update profile with Lithic auth rule token
        await profile.update({
          lithic_auth_rule_token: lithicAuthRule.token
        }, { transaction });

        apiLogger.info('Lithic auth rule created for spending profile', {
          profileId: profile.spending_profile_id,
          lithicToken: lithicAuthRule.token
        });
      } catch (lithicError) {
        apiLogger.warn('Failed to create Lithic auth rule for spending profile', {
          profileId: profile.spending_profile_id,
          error: lithicError.message
        });
        // Continue without Lithic integration for now
      }

      await transaction.commit();

      // Create audit log
      await AuditLog.logCreate('spending_profiles', profile.spending_profile_id, {
        profile_name: profile.profile_name,
        daily_limit: profile.daily_limit,
        monthly_limit: profile.monthly_limit,
        per_transaction_limit: profile.per_transaction_limit,
        created_by: createdBy.user_id
      }, createdBy.user_id, req);

      apiLogger.info('Spending profile created successfully', {
        profileId: profile.spending_profile_id,
        profileName: profile.profile_name,
        createdBy: createdBy.user_id
      });

      res.status(201).json({
        success: true,
        message: 'Spending profile created successfully',
        data: {
          spending_profile: profile,
          lithic_auth_rule: lithicAuthRule ? {
            token: lithicAuthRule.token,
            status: lithicAuthRule.status
          } : null
        }
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Create spending profile error', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body,
        createdBy: req.user?.user_id
      });

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_PROFILE_NAME',
            message: 'Spending profile name already exists'
          }
        });
      }

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
          code: 'CREATE_SPENDING_PROFILE_ERROR',
          message: 'Failed to create spending profile'
        }
      });
    }
  }

  // Get all spending profiles
  async getSpendingProfiles(req, res) {
    try {
      const {
        limit = 50,
        offset = 0,
        is_active
      } = req.query;

      const whereClause = {};
      
      // Filter by active status
      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }

      const profiles = await SpendingProfile.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      // Add card count for each profile
      const profilesWithCardCount = await Promise.all(
        profiles.rows.map(async (profile) => {
          const cardCount = await Card.count({
            where: { spending_profile_id: profile.spending_profile_id }
          });
          return {
            ...profile.toJSON(),
            attached_cards_count: cardCount
          };
        })
      );

      res.json({
        success: true,
        data: {
          spending_profiles: profilesWithCardCount,
          pagination: {
            total: profiles.count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            pages: Math.ceil(profiles.count / limit)
          }
        }
      });

    } catch (error) {
      apiLogger.error('Get spending profiles error', {
        error: error.message,
        stack: error.stack,
        query: req.query
      });

      res.status(500).json({
        error: {
          code: 'GET_SPENDING_PROFILES_ERROR',
          message: 'Failed to retrieve spending profiles'
        }
      });
    }
  }

  // Get spending profile by ID
  async getSpendingProfileById(req, res) {
    try {
      const { id } = req.params;

      const profile = await SpendingProfile.findByPk(id);

      if (!profile) {
        return res.status(404).json({
          error: {
            code: 'SPENDING_PROFILE_NOT_FOUND',
            message: 'Spending profile not found'
          }
        });
      }

      // Get attached cards
      const attachedCards = await profile.getAttachedCards();

      res.json({
        success: true,
        data: {
          spending_profile: profile,
          attached_cards: attachedCards
        }
      });

    } catch (error) {
      apiLogger.error('Get spending profile by ID error', {
        error: error.message,
        stack: error.stack,
        profileId: req.params.id
      });

      res.status(500).json({
        error: {
          code: 'GET_SPENDING_PROFILE_ERROR',
          message: 'Failed to retrieve spending profile'
        }
      });
    }
  }

  // Update spending profile
  async updateSpendingProfile(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedBy = req.user;

      const profile = await SpendingProfile.findByPk(id, { transaction });

      if (!profile) {
        await transaction.rollback();
        return res.status(404).json({
          error: {
            code: 'SPENDING_PROFILE_NOT_FOUND',
            message: 'Spending profile not found'
          }
        });
      }

      // Store old values for audit
      const oldValues = {
        profile_name: profile.profile_name,
        description: profile.description,
        daily_limit: profile.daily_limit,
        monthly_limit: profile.monthly_limit,
        per_transaction_limit: profile.per_transaction_limit,
        allowed_merchant_categories: profile.allowed_merchant_categories,
        blocked_merchant_categories: profile.blocked_merchant_categories
      };

      // Update profile
      await profile.update(updates, { transaction });

      // Update Lithic auth rule if it exists
      if (profile.lithic_auth_rule_token) {
        try {
          const authRuleData = lithicService.transformSpendingProfileToAuthRule(profile, []);
          await lithicService.updateAuthRule(profile.lithic_auth_rule_token, authRuleData);
          
          apiLogger.info('Lithic auth rule updated for spending profile', {
            profileId: profile.spending_profile_id,
            lithicToken: profile.lithic_auth_rule_token
          });
        } catch (lithicError) {
          apiLogger.warn('Failed to update Lithic auth rule for spending profile', {
            profileId: profile.spending_profile_id,
            error: lithicError.message
          });
        }
      }

      await transaction.commit();

      // Create audit log
      await AuditLog.logUpdate('spending_profiles', profile.spending_profile_id, oldValues, {
        profile_name: profile.profile_name,
        description: profile.description,
        daily_limit: profile.daily_limit,
        monthly_limit: profile.monthly_limit,
        per_transaction_limit: profile.per_transaction_limit,
        updated_by: updatedBy.user_id
      }, updatedBy.user_id, req);

      apiLogger.info('Spending profile updated successfully', {
        profileId: profile.spending_profile_id,
        updatedBy: updatedBy.user_id
      });

      res.json({
        success: true,
        message: 'Spending profile updated successfully',
        data: { spending_profile: profile }
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Update spending profile error', {
        error: error.message,
        stack: error.stack,
        profileId: req.params.id,
        updates: req.body
      });

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: {
            code: 'DUPLICATE_PROFILE_NAME',
            message: 'Spending profile name already exists'
          }
        });
      }

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
          code: 'UPDATE_SPENDING_PROFILE_ERROR',
          message: 'Failed to update spending profile'
        }
      });
    }
  }

  // Delete spending profile
  async deleteSpendingProfile(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { id } = req.params;
      const deletedBy = req.user;

      const profile = await SpendingProfile.findByPk(id, { transaction });

      if (!profile) {
        await transaction.rollback();
        return res.status(404).json({
          error: {
            code: 'SPENDING_PROFILE_NOT_FOUND',
            message: 'Spending profile not found'
          }
        });
      }

      // Check if profile has attached cards
      const hasAttachedCards = await profile.hasAttachedCards();
      if (hasAttachedCards) {
        await transaction.rollback();
        return res.status(400).json({
          error: {
            code: 'PROFILE_HAS_ATTACHED_CARDS',
            message: 'Cannot delete spending profile with attached cards'
          }
        });
      }

      // Store profile data for audit
      const profileData = {
        profile_name: profile.profile_name,
        description: profile.description,
        daily_limit: profile.daily_limit,
        monthly_limit: profile.monthly_limit,
        per_transaction_limit: profile.per_transaction_limit
      };

      // Delete Lithic auth rule if it exists
      if (profile.lithic_auth_rule_token) {
        try {
          await lithicService.deleteAuthRule(profile.lithic_auth_rule_token);
          apiLogger.info('Lithic auth rule deleted', {
            profileId: profile.spending_profile_id,
            lithicToken: profile.lithic_auth_rule_token
          });
        } catch (lithicError) {
          apiLogger.warn('Failed to delete Lithic auth rule', {
            profileId: profile.spending_profile_id,
            error: lithicError.message
          });
        }
      }

      // Delete profile
      await profile.destroy({ transaction });

      await transaction.commit();

      // Create audit log
      await AuditLog.logDelete('spending_profiles', parseInt(id), profileData, deletedBy.user_id, req);

      apiLogger.info('Spending profile deleted successfully', {
        deletedProfileId: parseInt(id),
        deletedBy: deletedBy.user_id,
        profileName: profileData.profile_name
      });

      res.json({
        success: true,
        message: 'Spending profile deleted successfully'
      });

    } catch (error) {
      await transaction.rollback();
      
      apiLogger.error('Delete spending profile error', {
        error: error.message,
        stack: error.stack,
        profileId: req.params.id
      });

      res.status(500).json({
        error: {
          code: 'DELETE_SPENDING_PROFILE_ERROR',
          message: 'Failed to delete spending profile'
        }
      });
    }
  }

  // Get cards attached to spending profile
  async getProfileCards(req, res) {
    try {
      const { id } = req.params;

      const profile = await SpendingProfile.findByPk(id);

      if (!profile) {
        return res.status(404).json({
          error: {
            code: 'SPENDING_PROFILE_NOT_FOUND',
            message: 'Spending profile not found'
          }
        });
      }

      const attachedCards = await profile.getAttachedCards();

      res.json({
        success: true,
        data: {
          spending_profile: {
            spending_profile_id: profile.spending_profile_id,
            profile_name: profile.profile_name
          },
          attached_cards: attachedCards
        }
      });

    } catch (error) {
      apiLogger.error('Get profile cards error', {
        error: error.message,
        stack: error.stack,
        profileId: req.params.id
      });

      res.status(500).json({
        error: {
          code: 'GET_PROFILE_CARDS_ERROR',
          message: 'Failed to retrieve profile cards'
        }
      });
    }
  }
}

module.exports = new SpendingProfileController();
