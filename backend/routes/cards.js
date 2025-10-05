const express = require('express');
const { Card, User, Account, SpendingProfile } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const lithicClient = require('../config/lithic');
const router = express.Router();

// Create card
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({ error: 'User access required' });
    }

    const { userId, cardType, spendingProfileId, spendLimit, spendLimitDuration } = req.body;

    const targetUser = await User.findByPk(userId);
    if (!targetUser || targetUser.account_id !== req.user.accountId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const account = await Account.findByPk(req.user.accountId);

    // Create card via Lithic
    const cardPayload = {
      type: cardType === 'debit' ? 'SINGLE_USE' : 'MERCHANT_LOCKED',
      account_token: targetUser.lithic_account_holder_token,
      memo: `${cardType} card for ${targetUser.first_name} ${targetUser.last_name}`
    };

    // Add spending limits if provided
    if (spendLimit && spendLimitDuration) {
      cardPayload.spend_limit = Math.round(parseFloat(spendLimit) * 100); // Convert to cents
      cardPayload.spend_limit_duration = spendLimitDuration.toUpperCase();
    }

    const lithicResponse = await lithicClient.post('/cards', cardPayload);

    const card = await Card.create({
      account_id: req.user.accountId,
      user_id: userId,
      spending_profile_id: spendingProfileId || null,
      lithic_card_token: lithicResponse.data.token,
      card_type: cardType,
      last_four: lithicResponse.data.last_four,
      status: lithicResponse.data.state,
      spend_limit: spendLimit || null,
      spend_limit_duration: spendLimitDuration || null
    });

    res.json({
      id: card.id,
      cardType: card.card_type,
      lastFour: card.last_four,
      status: card.status,
      userId: card.user_id,
      spendLimit: card.spend_limit,
      spendLimitDuration: card.spend_limit_duration
    });
  } catch (error) {
    console.error('Create card error:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to create card', details: error.response?.data || error.message });
  }
});

// List all cards
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({ error: 'User access required' });
    }

    const cards = await Card.findAll({
      where: { account_id: req.user.accountId },
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          model: SpendingProfile,
          required: false,
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(cards.map(card => ({
      id: card.id,
      cardType: card.card_type,
      lastFour: card.last_four,
      status: card.status,
      spendLimit: card.spend_limit,
      spendLimitDuration: card.spend_limit_duration,
      user: {
        id: card.User.id,
        name: `${card.User.first_name} ${card.User.last_name}`,
        email: card.User.email
      },
      spendingProfile: card.SpendingProfile ? {
        id: card.SpendingProfile.id,
        name: card.SpendingProfile.name
      } : null,
      createdAt: card.created_at
    })));
  } catch (error) {
    console.error('List cards error:', error);
    res.status(500).json({ error: 'Failed to list cards' });
  }
});

module.exports = router;
