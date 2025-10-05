const express = require('express');
const { User, Account, Card } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const lithicClient = require('../config/lithic');
const router = express.Router();

// Create user (Owner/Admin role required)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({ error: 'User access required' });
    }

    const currentUser = await User.findByPk(req.user.userId);
    if (!['owner', 'admin'].includes(currentUser.role)) {
      return res.status(403).json({ error: 'Owner or admin role required' });
    }

    const { email, firstName, lastName, role, phone } = req.body;

    // Create Lithic account holder
    const lithicResponse = await lithicClient.post('/account_holders', {
      individual: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phone
      },
      kyc_passed: true,
      tos_accepted: new Date().toISOString()
    });

    const user = await User.create({
      account_id: req.user.accountId,
      email,
      first_name: firstName,
      last_name: lastName,
      role,
      lithic_account_holder_token: lithicResponse.data.token,
      status: 'active'
    });

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role
    });
  } catch (error) {
    console.error('Create user error:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to create user', details: error.response?.data || error.message });
  }
});

// List all users in account
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'user') {
      return res.status(403).json({ error: 'User access required' });
    }

    const users = await User.findAll({
      where: { account_id: req.user.accountId },
      include: [
        {
          model: Card,
          required: false
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json(users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      cardCount: user.Cards.length,
      createdAt: user.created_at
    })));
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

module.exports = router;
