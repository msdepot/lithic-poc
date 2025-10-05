const express = require('express');
const supabase = require('../config/supabase');
const lithicService = require('../services/lithic');
const { authenticate, requireOwnerOrAdmin } = require('../middleware/auth');
const router = express.Router();

// Create new user
router.post('/', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { email, firstName, lastName, role } = req.body;
    const accountId = req.user.accountId;
    
    // Validate input
    if (!email || !firstName || !lastName || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate role
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or user' });
    }
    
    // Only owner can create admin
    if (role === 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Only owner can create admin users' });
    }
    
    // Create account holder in Lithic
    const accountHolder = await lithicService.createAccountHolder({
      firstName,
      lastName,
      email
    });
    
    // Create user in database
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        account_id: accountId,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        lithic_account_holder_id: accountHolder.account_holder_token
      })
      .select()
      .single();
    
    if (error) {
      console.error('User creation error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }
    
    res.json({
      user,
      lithic: {
        accountHolder: accountHolder.account_holder_token
      }
    });
    
  } catch (error) {
    console.error('User creation error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users for account
router.get('/', authenticate, async (req, res) => {
  try {
    const accountId = req.user.accountId;
    
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    res.json(users);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const accountId = req.user.accountId;
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*, cards(*)')
      .eq('id', id)
      .eq('account_id', accountId)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;