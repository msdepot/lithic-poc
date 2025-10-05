const supabase = require('../config/database');
const lithicService = require('../services/lithic.service');

class CardController {
  // Create card
  async createCard(req, res) {
    try {
      const { userId, cardType, spendingProfileId } = req.body;
      const accountId = req.user.accountId;

      // Validate input
      if (!userId || !cardType) {
        return res.status(400).json({ error: 'User ID and card type are required' });
      }

      // Validate card type
      const validTypes = ['debit', 'reloadable', 'limit_based'];
      if (!validTypes.includes(cardType)) {
        return res.status(400).json({ error: 'Invalid card type' });
      }

      // Check if user exists and belongs to this account
      const { data: targetUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('account_id', accountId)
        .single();

      if (userError || !targetUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Permission check: owner/admin can create for anyone, user can only create for themselves
      if (req.user.role === 'user' && req.user.userId !== userId) {
        return res.status(403).json({ error: 'You can only create cards for yourself' });
      }

      // Analyst cannot have cards
      if (targetUser.role === 'analyst') {
        return res.status(400).json({ error: 'Analysts cannot have cards' });
      }

      // Get account info
      const { data: account } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (!account || !account.lithic_account_holder_token) {
        return res.status(400).json({ error: 'Account not properly configured with Lithic' });
      }

      // Create card in Lithic
      const cardData = {
        accountHolderToken: targetUser.lithic_account_holder_token || account.lithic_account_holder_token,
        userEmail: targetUser.email,
        memo: `${cardType} card for ${targetUser.name}`
      };

      // If spending profile is specified, get its limits
      if (spendingProfileId) {
        const { data: profile } = await supabase
          .from('spending_profiles')
          .select('*')
          .eq('id', spendingProfileId)
          .eq('account_id', accountId)
          .single();

        if (profile && profile.daily_limit) {
          cardData.spendLimit = Math.round(profile.daily_limit * 100); // Convert to cents
          cardData.spendLimitDuration = 'DAILY';
        }
      }

      const lithicCard = await lithicService.createCard(cardData);

      // Save card in database
      const { data: card, error: cardError } = await supabase
        .from('cards')
        .insert({
          account_id: accountId,
          user_id: userId,
          card_type: cardType,
          lithic_card_token: lithicCard.token,
          last_four: lithicCard.last_four,
          spending_profile_id: spendingProfileId || null,
          status: lithicCard.state
        })
        .select()
        .single();

      if (cardError) {
        console.error('Card database error:', cardError);
        return res.status(500).json({ error: 'Failed to save card' });
      }

      // If spending profile is specified and has auth rule, apply it
      if (spendingProfileId) {
        const { data: profile } = await supabase
          .from('spending_profiles')
          .select('*')
          .eq('id', spendingProfileId)
          .single();

        if (profile && profile.lithic_auth_rule_token) {
          try {
            await lithicService.applyAuthRuleToCard(
              lithicCard.token,
              profile.lithic_auth_rule_token
            );
          } catch (error) {
            console.error('Failed to apply auth rule:', error);
          }
        }
      }

      return res.json({
        success: true,
        card: {
          id: card.id,
          userId: card.user_id,
          cardType: card.card_type,
          lastFour: card.last_four,
          status: card.status,
          spendingProfileId: card.spending_profile_id,
          lithicToken: lithicCard.token
        }
      });
    } catch (error) {
      console.error('Create card error:', error);
      return res.status(500).json({ 
        error: 'Failed to create card',
        details: error.message 
      });
    }
  }

  // List cards
  async listCards(req, res) {
    try {
      const accountId = req.user.accountId;

      const { data: cards, error } = await supabase
        .from('cards')
        .select(`
          *,
          users!inner(id, name, email, role),
          spending_profiles(id, name, daily_limit, monthly_limit)
        `)
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('List cards error:', error);
        return res.status(500).json({ error: 'Failed to fetch cards' });
      }

      const formattedCards = cards.map(card => ({
        id: card.id,
        cardType: card.card_type,
        lastFour: card.last_four,
        status: card.status,
        user: {
          id: card.users.id,
          name: card.users.name,
          email: card.users.email,
          role: card.users.role
        },
        spendingProfile: card.spending_profiles ? {
          id: card.spending_profiles.id,
          name: card.spending_profiles.name,
          dailyLimit: card.spending_profiles.daily_limit,
          monthlyLimit: card.spending_profiles.monthly_limit
        } : null,
        createdAt: card.created_at
      }));

      return res.json({ cards: formattedCards });
    } catch (error) {
      console.error('List cards error:', error);
      return res.status(500).json({ error: 'Failed to list cards' });
    }
  }

  // Get card details
  async getCard(req, res) {
    try {
      const cardId = req.params.id;
      const accountId = req.user.accountId;

      const { data: card, error } = await supabase
        .from('cards')
        .select(`
          *,
          users(id, name, email, role),
          spending_profiles(id, name, daily_limit, monthly_limit, allowed_categories, blocked_categories)
        `)
        .eq('id', cardId)
        .eq('account_id', accountId)
        .single();

      if (error || !card) {
        return res.status(404).json({ error: 'Card not found' });
      }

      return res.json({
        card: {
          id: card.id,
          cardType: card.card_type,
          lastFour: card.last_four,
          status: card.status,
          lithicToken: card.lithic_card_token,
          user: card.users,
          spendingProfile: card.spending_profiles,
          createdAt: card.created_at
        }
      });
    } catch (error) {
      console.error('Get card error:', error);
      return res.status(500).json({ error: 'Failed to get card' });
    }
  }
}

module.exports = new CardController();
