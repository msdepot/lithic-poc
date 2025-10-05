const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const router = express.Router();

// Login - no password required for POC
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Check if it's admin login
    if (email === 'admin') {
      const token = jwt.sign(
        { 
          id: '00000000-0000-0000-0000-000000000000',
          email: 'admin',
          type: 'admin',
          accountId: '00000000-0000-0000-0000-000000000000'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.json({
        token,
        user: {
          id: '00000000-0000-0000-0000-000000000000',
          email: 'admin',
          type: 'admin',
          name: 'Admin CRM'
        }
      });
    }
    
    // Check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*, accounts(*)')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email' });
    }
    
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        accountId: user.account_id,
        type: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        account: user.accounts
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;