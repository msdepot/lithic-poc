const express = require('express');
const supabase = require('../config/supabase');
const lithicService = require('../services/lithic');
const { authenticate, requireOwnerOrAdmin } = require('../middleware/auth');
const router = express.Router();

// Create spending profile
router.post('/', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      dailyLimit,
      monthlyLimit,
      transactionLimit,
      allowedCategories,
      blockedCategories,
      allowedMerchants,
      blockedMerchants
    } = req.body;
    const accountId = req.user.accountId;
    
    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Profile name is required' });
    }
    
    // Get account details for Lithic
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();
    
    if (accountError || !account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Create auth rule in Lithic
    let lithicAuthRuleId = null;
    if (account.lithic_account_holder_id) {
      try {
        const authRule = await lithicService.createAuthRule({
          accountHolderId: account.lithic_account_holder_id,
          allowedMcc: allowedCategories || [],
          blockedMcc: blockedCategories || [],
          maxTransactionAmount: transactionLimit,
          maxSpendLimit: monthlyLimit,
          maxSpendWindow: 'MONTHLY'
        });
        lithicAuthRuleId = authRule.token;
      } catch (lithicError) {
        console.error('Error creating Lithic auth rule:', lithicError);
        // Continue without Lithic auth rule for POC
      }
    }
    
    // Create profile in database
    const { data: profile, error } = await supabase
      .from('spending_profiles')
      .insert({
        account_id: accountId,
        name,
        description,
        daily_limit: dailyLimit,
        monthly_limit: monthlyLimit,
        transaction_limit: transactionLimit,
        allowed_categories: allowedCategories || [],
        blocked_categories: blockedCategories || [],
        allowed_merchants: allowedMerchants || [],
        blocked_merchants: blockedMerchants || [],
        lithic_auth_rule_id: lithicAuthRuleId,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Profile creation error:', error);
      return res.status(500).json({ error: 'Failed to create spending profile' });
    }
    
    res.json({
      profile,
      lithic: {
        authRuleId: lithicAuthRuleId
      }
    });
    
  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({ error: 'Failed to create spending profile' });
  }
});

// Get all spending profiles for account
router.get('/', authenticate, async (req, res) => {
  try {
    const accountId = req.user.accountId;
    
    const { data: profiles, error } = await supabase
      .from('spending_profiles')
      .select(`
        *,
        created_by:users!created_by(first_name, last_name),
        _count:cards(count)
      `)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching profiles:', error);
      return res.status(500).json({ error: 'Failed to fetch spending profiles' });
    }
    
    res.json(profiles);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch spending profiles' });
  }
});

// Get spending profile details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const accountId = req.user.accountId;
    
    const { data: profile, error } = await supabase
      .from('spending_profiles')
      .select(`
        *,
        created_by:users!created_by(first_name, last_name),
        cards(*, users(first_name, last_name, email))
      `)
      .eq('id', id)
      .eq('account_id', accountId)
      .single();
    
    if (error || !profile) {
      return res.status(404).json({ error: 'Spending profile not found' });
    }
    
    res.json(profile);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch spending profile' });
  }
});

// Update spending profile
router.put('/:id', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const accountId = req.user.accountId;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.account_id;
    delete updates.created_by;
    delete updates.lithic_auth_rule_id;
    
    // Update profile in database
    const { data: profile, error } = await supabase
      .from('spending_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('account_id', accountId)
      .select()
      .single();
    
    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ error: 'Failed to update spending profile' });
    }
    
    res.json(profile);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update spending profile' });
  }
});

module.exports = router;