const supabase = require('../config/database');
const lithicService = require('../services/lithic.service');

class AccountController {
  // Create new account (admin only)
  async createAccount(req, res) {
    try {
      const { accountName, ownerName, ownerEmail, initialBalance } = req.body;

      // Validate input
      if (!accountName || !ownerEmail) {
        return res.status(400).json({ error: 'Account name and owner email are required' });
      }

      // Check if account with this email already exists
      const { data: existing } = await supabase
        .from('accounts')
        .select('id')
        .eq('owner_email', ownerEmail)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'Account with this email already exists' });
      }

      // Parse owner name
      const nameParts = (ownerName || 'Owner User').split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || 'User';

      // Create Lithic account holder (business)
      const accountHolder = await lithicService.createAccountHolder({
        type: 'business',
        businessName: accountName,
        firstName,
        lastName,
        email: ownerEmail
      });

      // Create financial account
      const financialAccount = await lithicService.createFinancialAccount(
        accountHolder.token,
        `${accountName} Operating Account`
      );

      // Create account in database
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .insert({
          name: accountName,
          owner_email: ownerEmail,
          lithic_account_holder_token: accountHolder.token,
          lithic_financial_account_token: financialAccount.token,
          balance: initialBalance || 0
        })
        .select()
        .single();

      if (accountError) {
        console.error('Database error:', accountError);
        return res.status(500).json({ error: 'Failed to create account in database' });
      }

      // Create owner user
      const { data: owner, error: ownerError } = await supabase
        .from('users')
        .insert({
          account_id: account.id,
          email: ownerEmail,
          name: ownerName || 'Owner User',
          role: 'owner',
          lithic_account_holder_token: accountHolder.token
        })
        .select()
        .single();

      if (ownerError) {
        console.error('Owner creation error:', ownerError);
        return res.status(500).json({ error: 'Failed to create owner user' });
      }

      return res.json({
        success: true,
        account: {
          id: account.id,
          name: account.name,
          ownerEmail: account.owner_email,
          balance: account.balance,
          lithicAccountHolder: accountHolder.token,
          lithicFinancialAccount: financialAccount.token
        },
        owner: {
          id: owner.id,
          email: owner.email,
          name: owner.name,
          role: owner.role
        }
      });
    } catch (error) {
      console.error('Create account error:', error);
      return res.status(500).json({ 
        error: 'Failed to create account',
        details: error.message 
      });
    }
  }

  // List all accounts (admin only)
  async listAccounts(req, res) {
    try {
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Failed to fetch accounts' });
      }

      return res.json({ accounts });
    } catch (error) {
      console.error('List accounts error:', error);
      return res.status(500).json({ error: 'Failed to list accounts' });
    }
  }

  // Get account details
  async getAccount(req, res) {
    try {
      const accountId = req.params.id;

      const { data: account, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (error || !account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      return res.json({ account });
    } catch (error) {
      console.error('Get account error:', error);
      return res.status(500).json({ error: 'Failed to get account' });
    }
  }
}

module.exports = new AccountController();
