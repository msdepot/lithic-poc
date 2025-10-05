const supabase = require('../config/database');
const lithicService = require('../services/lithic.service');

class UserController {
  // Create user (owner or admin only)
  async createUser(req, res) {
    try {
      const { name, email, role } = req.body;
      const accountId = req.user.accountId;

      // Validate input
      if (!name || !email || !role) {
        return res.status(400).json({ error: 'Name, email, and role are required' });
      }

      // Validate role hierarchy (owner can create anyone, admin can create user/analyst)
      const allowedRoles = {
        owner: ['admin', 'user', 'analyst'],
        admin: ['user', 'analyst']
      };

      if (!allowedRoles[req.user.role] || !allowedRoles[req.user.role].includes(role)) {
        return res.status(403).json({ error: 'You cannot create users with this role' });
      }

      // Check if user already exists in this account
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('account_id', accountId)
        .eq('email', email)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'User with this email already exists in this account' });
      }

      // Get account info
      const { data: account } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Parse name
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'User';

      // Create Lithic account holder for this user
      let lithicAccountHolderToken = null;
      try {
        const accountHolder = await lithicService.createAccountHolder({
          type: 'individual',
          firstName,
          lastName,
          email
        });
        lithicAccountHolderToken = accountHolder.token;
      } catch (error) {
        console.error('Lithic account holder creation failed:', error);
        // Continue without Lithic token for now
      }

      // Create user in database
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          account_id: accountId,
          email,
          name,
          role,
          lithic_account_holder_token: lithicAccountHolderToken
        })
        .select()
        .single();

      if (userError) {
        console.error('User creation error:', userError);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          lithicAccountHolder: lithicAccountHolderToken
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      return res.status(500).json({ 
        error: 'Failed to create user',
        details: error.message 
      });
    }
  }

  // List users in account
  async listUsers(req, res) {
    try {
      const accountId = req.user.accountId;

      const { data: users, error } = await supabase
        .from('users')
        .select('id, email, name, role, created_at')
        .eq('account_id', accountId)
        .order('created_at', { ascending: true });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch users' });
      }

      return res.json({ users });
    } catch (error) {
      console.error('List users error:', error);
      return res.status(500).json({ error: 'Failed to list users' });
    }
  }

  // Get user details
  async getUser(req, res) {
    try {
      const userId = req.params.id;
      const accountId = req.user.accountId;

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('account_id', accountId)
        .single();

      if (error || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ error: 'Failed to get user' });
    }
  }
}

module.exports = new UserController();
