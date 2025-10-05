const express = require('express');
const supabase = require('../config/supabase');
const lithicService = require('../services/lithic');
const { authenticate, requireOwnerOrAdmin } = require('../middleware/auth');
const router = express.Router();

// Create card for user
router.post('/', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { 
      userId, 
      type, 
      spendingProfileId,
      customDailyLimit,
      customMonthlyLimit,
      customTransactionLimit 
    } = req.body;
    const accountId = req.user.accountId;
    
    // Validate input
    if (!userId || !type) {
      return res.status(400).json({ error: 'User ID and card type are required' });
    }
    
    // Validate card type
    if (!['virtual', 'physical', 'reloadable'].includes(type)) {
      return res.status(400).json({ error: 'Invalid card type' });
    }
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('account_id', accountId)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prepare card data for Lithic
    let cardData = {
      accountHolderId: user.lithic_account_holder_id,
      type: type === 'reloadable' ? 'VIRTUAL' : type.toUpperCase(),
      memo: `${user.first_name} ${user.last_name} - ${type}`,
      spendLimit: customMonthlyLimit || 1000, // Default limit
      spendLimitDuration: 'MONTHLY'
    };
    
    // If spending profile is provided, get auth rule tokens
    if (spendingProfileId) {
      const { data: profile, error: profileError } = await supabase
        .from('spending_profiles')
        .select('*')
        .eq('id', spendingProfileId)
        .eq('account_id', accountId)
        .single();
      
      if (profileError || !profile) {
        return res.status(404).json({ error: 'Spending profile not found' });
      }
      
      // Use profile limits if no custom limits provided
      cardData.spendLimit = customMonthlyLimit || profile.monthly_limit;
      
      if (profile.lithic_auth_rule_id) {
        cardData.authRuleTokens = [profile.lithic_auth_rule_id];
      }
    }
    
    // Create card in Lithic
    const lithicCard = await lithicService.createCard(cardData);
    
    // Save card in database
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        account_id: accountId,
        user_id: userId,
        spending_profile_id: spendingProfileId,
        lithic_card_id: lithicCard.token,
        last_four: lithicCard.last_four,
        status: lithicCard.state,
        type: type,
        custom_daily_limit: customDailyLimit,
        custom_monthly_limit: customMonthlyLimit,
        custom_transaction_limit: customTransactionLimit,
        created_by: req.user.id
      })
      .select()
      .single();
    
    if (cardError) {
      console.error('Card creation error:', cardError);
      return res.status(500).json({ error: 'Failed to create card' });
    }
    
    res.json({
      card,
      lithic: {
        cardToken: lithicCard.token,
        lastFour: lithicCard.last_four,
        state: lithicCard.state
      }
    });
    
  } catch (error) {
    console.error('Card creation error:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Get all cards for account
router.get('/', authenticate, async (req, res) => {
  try {
    const accountId = req.user.accountId;
    
    const { data: cards, error } = await supabase
      .from('cards')
      .select(`
        *,
        users(first_name, last_name, email),
        spending_profiles(name),
        created_by:users!created_by(first_name, last_name)
      `)
      .eq('account_id', accountId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching cards:', error);
      return res.status(500).json({ error: 'Failed to fetch cards' });
    }
    
    res.json(cards);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Get card details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const accountId = req.user.accountId;
    
    const { data: card, error } = await supabase
      .from('cards')
      .select(`
        *,
        users(first_name, last_name, email),
        spending_profiles(*),
        card_transactions(*)
      `)
      .eq('id', id)
      .eq('account_id', accountId)
      .single();
    
    if (error || !card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Get latest card status from Lithic
    if (card.lithic_card_id) {
      try {
        const lithicCard = await lithicService.getCard(card.lithic_card_id);
        card.lithic_status = lithicCard.state;
        card.lithic_details = lithicCard;
      } catch (lithicError) {
        console.error('Error fetching Lithic card:', lithicError);
      }
    }
    
    res.json(card);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Update card status
router.patch('/:id/status', authenticate, requireOwnerOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const accountId = req.user.accountId;
    
    // Validate status
    const validStatuses = ['ACTIVE', 'PAUSED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Get card
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .eq('account_id', accountId)
      .single();
    
    if (cardError || !card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Update status in Lithic
    const lithicCard = await lithicService.updateCardStatus(card.lithic_card_id, status);
    
    // Update status in database
    const { data: updatedCard, error: updateError } = await supabase
      .from('cards')
      .update({ 
        status: lithicCard.state,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      return res.status(500).json({ error: 'Failed to update card' });
    }
    
    res.json(updatedCard);
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to update card status' });
  }
});

module.exports = router;