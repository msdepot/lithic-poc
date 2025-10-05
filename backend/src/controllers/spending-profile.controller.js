const supabase = require('../config/database');
const lithicService = require('../services/lithic.service');

class SpendingProfileController {
  // Create spending profile
  async createProfile(req, res) {
    try {
      const { name, dailyLimit, monthlyLimit, allowedCategories, blockedCategories } = req.body;
      const accountId = req.user.accountId;

      // Validate input
      if (!name) {
        return res.status(400).json({ error: 'Profile name is required' });
      }

      // Only owner and admin can create spending profiles
      if (!['owner', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Only owners and admins can create spending profiles' });
      }

      // Get account info for Lithic integration
      const { data: account } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Create auth rule in Lithic
      let lithicAuthRuleToken = null;
      try {
        const authRule = await lithicService.createAuthRule(
          account.lithic_account_holder_token,
          {
            limits: dailyLimit ? { daily: dailyLimit } : null,
            allowedCategories: allowedCategories || [],
            blockedCategories: blockedCategories || []
          }
        );
        lithicAuthRuleToken = authRule.token;
      } catch (error) {
        console.error('Failed to create Lithic auth rule:', error);
        // Continue without auth rule token
      }

      // Save spending profile in database
      const { data: profile, error: profileError } = await supabase
        .from('spending_profiles')
        .insert({
          account_id: accountId,
          name,
          daily_limit: dailyLimit || null,
          monthly_limit: monthlyLimit || null,
          allowed_categories: allowedCategories || [],
          blocked_categories: blockedCategories || [],
          lithic_auth_rule_token: lithicAuthRuleToken,
          created_by: req.user.userId
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return res.status(500).json({ error: 'Failed to create spending profile' });
      }

      return res.json({
        success: true,
        profile: {
          id: profile.id,
          name: profile.name,
          dailyLimit: profile.daily_limit,
          monthlyLimit: profile.monthly_limit,
          allowedCategories: profile.allowed_categories,
          blockedCategories: profile.blocked_categories,
          lithicAuthRule: lithicAuthRuleToken
        }
      });
    } catch (error) {
      console.error('Create spending profile error:', error);
      return res.status(500).json({ 
        error: 'Failed to create spending profile',
        details: error.message 
      });
    }
  }

  // List spending profiles
  async listProfiles(req, res) {
    try {
      const accountId = req.user.accountId;

      const { data: profiles, error } = await supabase
        .from('spending_profiles')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch spending profiles' });
      }

      return res.json({ profiles });
    } catch (error) {
      console.error('List spending profiles error:', error);
      return res.status(500).json({ error: 'Failed to list spending profiles' });
    }
  }

  // Get spending profile details
  async getProfile(req, res) {
    try {
      const profileId = req.params.id;
      const accountId = req.user.accountId;

      const { data: profile, error } = await supabase
        .from('spending_profiles')
        .select('*')
        .eq('id', profileId)
        .eq('account_id', accountId)
        .single();

      if (error || !profile) {
        return res.status(404).json({ error: 'Spending profile not found' });
      }

      // Get cards using this profile
      const { data: cards } = await supabase
        .from('cards')
        .select('id, card_type, last_four, users(name, email)')
        .eq('spending_profile_id', profileId);

      return res.json({
        profile: {
          ...profile,
          cardsUsing: cards || []
        }
      });
    } catch (error) {
      console.error('Get spending profile error:', error);
      return res.status(500).json({ error: 'Failed to get spending profile' });
    }
  }
}

module.exports = new SpendingProfileController();
