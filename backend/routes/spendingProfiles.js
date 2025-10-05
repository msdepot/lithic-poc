const express = require('express');
const { SpendingProfile, Card } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const lithicClient = require('../config/lithic');
const router = express.Router();

// Create spending profile
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({ error: 'User access required' });
    }

    const { name, description, spendLimit, spendLimitDuration, allowedCategories, blockedCategories } = req.body;

    // Create auth rule in Lithic
    const authRulePayload = {
      allowed_mcc: allowedCategories || [],
      blocked_mcc: blockedCategories || []
    };

    // Note: Lithic auth rules API might have different structure, this is simplified
    // In production, you'd need to properly configure auth rules based on Lithic docs

    const profile = await SpendingProfile.create({
      account_id: req.user.accountId,
      name,
      description,
      spend_limit: spendLimit || null,
      spend_limit_duration: spendLimitDuration || null,
      allowed_categories: allowedCategories || [],
      blocked_categories: blockedCategories || [],
      lithic_auth_rule_token: null // Would be set after Lithic API call
    });

    res.json({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      spendLimit: profile.spend_limit,
      spendLimitDuration: profile.spend_limit_duration,
      allowedCategories: profile.allowed_categories,
      blockedCategories: profile.blocked_categories
    });
  } catch (error) {
    console.error('Create spending profile error:', error);
    res.status(500).json({ error: 'Failed to create spending profile' });
  }
});

// List spending profiles
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({ error: 'User access required' });
    }

    const profiles = await SpendingProfile.findAll({
      where: { account_id: req.user.accountId },
      include: [
        {
          model: Card,
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      spendLimit: profile.spend_limit,
      spendLimitDuration: profile.spend_limit_duration,
      allowedCategories: profile.allowed_categories,
      blockedCategories: profile.blocked_categories,
      cardCount: profile.Cards.length,
      createdAt: profile.created_at
    })));
  } catch (error) {
    console.error('List spending profiles error:', error);
    res.status(500).json({ error: 'Failed to list spending profiles' });
  }
});

module.exports = router;
