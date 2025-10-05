const express = require('express');
const jwt = require('jsonwebtoken');
const { User, Account } = require('../models');
const router = express.Router();

// Admin login (CRM access)
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { type: 'admin', username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({ token, type: 'admin' });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User login (account owner/user access)
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email, status: 'active' },
      include: [{ model: Account }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign(
      {
        type: 'user',
        userId: user.id,
        accountId: user.account_id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      type: 'user',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        accountId: user.account_id,
        businessName: user.Account.business_name
      }
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
