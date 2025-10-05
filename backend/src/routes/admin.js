const express = require('express');
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/supabase');
const lithicService = require('../services/lithic');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Create new account with owner
router.post('/accounts', authenticate, requireAdmin, async (req, res) => {
  try {
    const { accountName, ownerEmail, ownerFirstName, ownerLastName } = req.body;
    
    // Validate input
    if (!accountName || !ownerEmail || !ownerFirstName || !ownerLastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Create account holder in Lithic
    const accountHolder = await lithicService.createAccountHolder({
      firstName: ownerFirstName,
      lastName: ownerLastName,
      email: ownerEmail
    });
    
    // Create financial account in Lithic
    const financialAccount = await lithicService.createFinancialAccount(
      accountHolder.account_holder_token,
      accountName
    );
    
    // Create account in database
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        name: accountName,
        email: ownerEmail,
        lithic_account_holder_id: accountHolder.account_holder_token,
        lithic_financial_account_id: financialAccount.financial_account_token,
        type: 'business'
      })
      .select()
      .single();
    
    if (accountError) {
      console.error('Account creation error:', accountError);
      return res.status(500).json({ error: 'Failed to create account' });
    }
    
    // Create owner user
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .insert({
        account_id: account.id,
        email: ownerEmail,
        first_name: ownerFirstName,
        last_name: ownerLastName,
        role: 'owner',
        lithic_account_holder_id: accountHolder.account_holder_token
      })
      .select()
      .single();
    
    if (ownerError) {
      console.error('Owner creation error:', ownerError);
      return res.status(500).json({ error: 'Failed to create owner user' });
    }
    
    res.json({
      account: account,
      owner: owner,
      lithic: {
        accountHolder: accountHolder.account_holder_token,
        financialAccount: financialAccount.financial_account_token
      }
    });
    
  } catch (error) {
    console.error('Account creation error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Get all accounts (for admin dashboard)
router.get('/accounts', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*, users!account_id(*)')
      .neq('type', 'admin')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching accounts:', error);
      return res.status(500).json({ error: 'Failed to fetch accounts' });
    }
    
    res.json(accounts);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

module.exports = router;