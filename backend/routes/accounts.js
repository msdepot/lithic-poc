const express = require('express');
const { Account, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const lithicClient = require('../config/lithic');
const router = express.Router();

// Create account (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { businessName, ownerEmail, ownerFirstName, ownerLastName, ownerPhone } = req.body;

    // Create Lithic account holder for the owner
    const lithicResponse = await lithicClient.post('/account_holders', {
      individual: {
        first_name: ownerFirstName,
        last_name: ownerLastName,
        email: ownerEmail,
        phone_number: ownerPhone
      },
      kyc_passed: true,
      tos_accepted: new Date().toISOString()
    });

    const lithicAccountToken = lithicResponse.data.token;

    // Create account in our database
    const account = await Account.create({
      business_name: businessName,
      owner_email: ownerEmail,
      lithic_account_token: lithicAccountToken,
      balance: 0,
      status: 'active'
    });

    // Create owner user
    const owner = await User.create({
      account_id: account.id,
      email: ownerEmail,
      first_name: ownerFirstName,
      last_name: ownerLastName,
      role: 'owner',
      lithic_account_holder_token: lithicAccountToken,
      status: 'active'
    });

    res.json({
      account: {
        id: account.id,
        businessName: account.business_name,
        ownerEmail: account.owner_email,
        balance: account.balance
      },
      owner: {
        id: owner.id,
        email: owner.email,
        firstName: owner.first_name,
        lastName: owner.last_name,
        role: owner.role
      }
    });
  } catch (error) {
    console.error('Create account error:', error.response?.data || error);
    res.status(500).json({ error: 'Failed to create account', details: error.response?.data || error.message });
  }
});

// Fund account (Admin only)
router.post('/:id/fund', authenticateToken, async (req, res) => {
  try {
    if (req.user.type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { amount } = req.body;
    const account = await Account.findByPk(req.params.id);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // In sandbox, we simulate funding
    account.balance = parseFloat(account.balance) + parseFloat(amount);
    await account.save();

    res.json({
      accountId: account.id,
      newBalance: account.balance
    });
  } catch (error) {
    console.error('Fund account error:', error);
    res.status(500).json({ error: 'Failed to fund account' });
  }
});

// Get account details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const account = await Account.findByPk(req.params.id, {
      include: [{ model: User }]
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Failed to get account' });
  }
});

module.exports = router;
