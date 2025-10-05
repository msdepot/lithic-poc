const Lithic = require('lithic');
require('dotenv').config();

// Initialize Lithic client
function resolveLithicEnvironment() {
  const env = (process.env.LITHIC_ENVIRONMENT || 'sandbox').toLowerCase();
  if (env.startsWith('prod')) return 'production';
  return 'sandbox';
}

if (!process.env.LITHIC_API_KEY) {
  // Do not throw at import time to avoid crashing non-Lithic flows
  console.warn('Warning: LITHIC_API_KEY not set. Lithic API calls will fail with 401.');
}

const lithicClient = new Lithic({
  apiKey: process.env.LITHIC_API_KEY,
  environment: resolveLithicEnvironment(),
  baseURL: process.env.LITHIC_BASE_URL || undefined,
});

// Lithic API helper functions
class LithicService {
  constructor() {
    this.client = lithicClient;
  }

  // Account Holder Methods
  async createAccountHolder(accountHolderData) {
    try {
      const response = await this.client.accountHolders.create(accountHolderData);
      return response;
    } catch (error) {
      console.error('Lithic createAccountHolder error:', error);
      throw this.handleLithicError(error);
    }
  }

  async getAccountHolder(token) {
    try {
      const response = await this.client.accountHolders.retrieve(token);
      return response;
    } catch (error) {
      console.error('Lithic getAccountHolder error:', error);
      throw this.handleLithicError(error);
    }
  }

  async updateAccountHolder(token, updateData) {
    try {
      const response = await this.client.accountHolders.update(token, updateData);
      return response;
    } catch (error) {
      console.error('Lithic updateAccountHolder error:', error);
      throw this.handleLithicError(error);
    }
  }

  // Financial Account Methods - Note: In sandbox, financial accounts are auto-created
  async createFinancialAccount({ account_holder_token }) {
    try {
      // Retrieve the holder to get their account token
      const holder = await this.client.accountHolders.retrieve(account_holder_token);
      const accountToken = holder.account_token;
      if (!accountToken) {
        throw new Error('Account holder does not have an associated Lithic account token');
      }
      // Retrieve account to get current state
      const account = await this.client.accounts.retrieve(accountToken);
      return {
        token: accountToken,
        status: account.state,
      };
    } catch (error) {
      console.error('Lithic createFinancialAccount error:', error);
      throw this.handleLithicError(error);
    }
  }

  async getFinancialAccount(token) {
    try {
      const response = await this.client.accounts.retrieve(token);
      return response;
    } catch (error) {
      console.error('Lithic getFinancialAccount error:', error);
      throw this.handleLithicError(error);
    }
  }

  async updateFinancialAccount(token, updateData) {
    try {
      const response = await this.client.accounts.update(token, updateData);
      return response;
    } catch (error) {
      console.error('Lithic updateFinancialAccount error:', error);
      throw this.handleLithicError(error);
    }
  }

  // Card Methods
  async createCard(cardData) {
    try {
      const response = await this.client.cards.create(cardData);
      return response;
    } catch (error) {
      console.error('Lithic createCard error:', error);
      throw this.handleLithicError(error);
    }
  }

  async getCard(token) {
    try {
      const response = await this.client.cards.retrieve(token);
      return response;
    } catch (error) {
      console.error('Lithic getCard error:', error);
      throw this.handleLithicError(error);
    }
  }

  async updateCard(token, updateData) {
    try {
      const response = await this.client.cards.update(token, updateData);
      return response;
    } catch (error) {
      console.error('Lithic updateCard error:', error);
      throw this.handleLithicError(error);
    }
  }

  async getCardSpendLimits(token) {
    try {
      const response = await this.client.cards.retrieveSpendLimits(token);
      return response;
    } catch (error) {
      console.error('Lithic getCardSpendLimits error:', error);
      throw this.handleLithicError(error);
    }
  }

  // Auth Rules Methods
  async createAuthRule(authRuleData) {
    try {
      const response = await this.client.authRules.create(authRuleData);
      return response;
    } catch (error) {
      console.error('Lithic createAuthRule error:', error);
      throw this.handleLithicError(error);
    }
  }

  async getAuthRule(token) {
    try {
      const response = await this.client.authRules.retrieve(token);
      return response;
    } catch (error) {
      console.error('Lithic getAuthRule error:', error);
      throw this.handleLithicError(error);
    }
  }

  async updateAuthRule(token, updateData) {
    try {
      const response = await this.client.authRules.update(token, updateData);
      return response;
    } catch (error) {
      console.error('Lithic updateAuthRule error:', error);
      throw this.handleLithicError(error);
    }
  }

  async applyAuthRule(token, applyData) {
    try {
      const response = await this.client.authRules.apply(token, applyData);
      return response;
    } catch (error) {
      console.error('Lithic applyAuthRule error:', error);
      throw this.handleLithicError(error);
    }
  }

  async deleteAuthRule(token) {
    try {
      const response = await this.client.authRules.remove(token);
      return response;
    } catch (error) {
      console.error('Lithic deleteAuthRule error:', error);
      throw this.handleLithicError(error);
    }
  }

  // Transaction Methods
  async getTransactions(params = {}) {
    try {
      const response = await this.client.transactions.list(params);
      return response;
    } catch (error) {
      console.error('Lithic getTransactions error:', error);
      throw this.handleLithicError(error);
    }
  }

  async getTransaction(token) {
    try {
      const response = await this.client.transactions.retrieve(token);
      return response;
    } catch (error) {
      console.error('Lithic getTransaction error:', error);
      throw this.handleLithicError(error);
    }
  }

  // External Payments Methods
  async createExternalPayment(paymentData) {
    try {
      const response = await this.client.externalPayments.create(paymentData);
      return response;
    } catch (error) {
      console.error('Lithic createExternalPayment error:', error);
      throw this.handleLithicError(error);
    }
  }

  async getExternalPayment(token) {
    try {
      const response = await this.client.externalPayments.retrieve(token);
      return response;
    } catch (error) {
      console.error('Lithic getExternalPayment error:', error);
      throw this.handleLithicError(error);
    }
  }

  // Helper Methods
  transformUserToAccountHolder(userData) {
    // Business enrollment (KYB)
    if (userData.account_type === 'business') {
      return {
        beneficial_owner_entities: userData.beneficial_owner_entities || [],
        beneficial_owner_individuals: userData.beneficial_owner_individuals || [],
        business_entity: {
          address: {
            address1: userData.business_address1 || '123 Business Ave',
            city: userData.business_city || 'New York',
            country: 'USA',
            postal_code: userData.business_postal_code || '10001',
            state: userData.business_state || 'NY'
          },
          dba_business_name: userData.dba_business_name || userData.business_name,
          government_id: userData.business_ein || '123456789',
          legal_business_name: userData.business_name,
          parent_company: userData.parent_company || undefined,
          phone_numbers: [userData.business_phone || '+15551234567']
        },
        control_person: {
          address: {
            address1: userData.cp_address1 || userData.address1 || '123 Main St',
            city: userData.cp_city || userData.city || 'New York',
            country: 'USA',
            postal_code: userData.cp_postal_code || userData.postal_code || '10001',
            state: userData.cp_state || userData.state || 'NY'
          },
          dob: userData.cp_dob || userData.dob || '1990-01-01',
          email: userData.cp_email || userData.email,
          first_name: userData.cp_first_name || userData.first_name || 'First',
          last_name: userData.cp_last_name || userData.last_name || 'Last',
          phone_number: (userData.cp_phone || userData.phone || '+15551234567').replace(/[\s\-\(\)]/g, '')
        },
        nature_of_business: userData.nature_of_business || 'General',
        tos_timestamp: new Date().toISOString(),
        workflow: 'KYB_BASIC'
      };
    }

    // Individual enrollment (KYC)
    return {
      individual: {
        address: {
          address1: userData.address1 || '123 Main St',
          city: userData.city || 'New York',
          country: 'USA',
          postal_code: userData.postal_code || '10001',
          state: userData.state || 'NY'
        },
        dob: userData.dob || '1990-01-01',
        email: userData.email,
        first_name: userData.first_name || 'First',
        last_name: userData.last_name || 'Last',
        government_id: userData.government_id || '123456789',
        phone_number: (userData.phone || '+15551234567').replace(/[\s\-\(\)]/g, '')
      },
      tos_timestamp: new Date().toISOString(),
      workflow: 'KYC_BASIC'
    };
  }

  transformAccountToFinancialAccount(accountData) {
    return {
      nickname: accountData.account_name,
      type: 'OPERATING'
    };
  }

  transformCardData(cardData) {
    const lithicCardData = {
      type: cardData.card_subtype === 'virtual' ? 'VIRTUAL' : 'PHYSICAL',
      memo: cardData.memo || 'Card created via POC API',
    };

    // Map local stored token to Lithic account_token
    if (cardData.lithic_financial_account_token) {
      lithicCardData.account_token = cardData.lithic_financial_account_token;
    }

    // Physical card shipping parameters passthrough
    if (cardData.shipping_address) {
      lithicCardData.shipping_address = cardData.shipping_address;
    }
    if (cardData.shipping_method) {
      lithicCardData.shipping_method = cardData.shipping_method;
    }
    if (cardData.product_id) {
      lithicCardData.product_id = cardData.product_id;
    }
    if (cardData.pin) {
      lithicCardData.pin = cardData.pin;
    }

    return lithicCardData;
  }

  transformSpendingProfileToAuthRule(profile, cardTokens = []) {
    const authRuleData = {
      account_tokens: [],
      card_tokens: cardTokens,
      program_level: false,
    };

    // Merchant category controls
    if (profile.allowed_merchant_categories && profile.allowed_merchant_categories.length > 0) {
      authRuleData.allowed_mcc = profile.allowed_merchant_categories;
    }

    if (profile.blocked_merchant_categories && profile.blocked_merchant_categories.length > 0) {
      authRuleData.blocked_mcc = profile.blocked_merchant_categories;
    }

    return authRuleData;
  }

  async applyCardLimits(cardToken, limits) {
    // Map local limits to Lithic card spend_limit configuration
    // Priority: per_transaction -> TRANSACTION; else monthly -> MONTHLY; else ignore
    const update = {};
    if (limits?.per_transaction_limit) {
      update.spend_limit = Math.round(parseFloat(limits.per_transaction_limit) * 100);
      update.spend_limit_duration = 'TRANSACTION';
    } else if (limits?.monthly_limit) {
      update.spend_limit = Math.round(parseFloat(limits.monthly_limit) * 100);
      update.spend_limit_duration = 'MONTHLY';
    } else {
      return null;
    }

    return await this.client.cards.update(cardToken, update);
  }

  // Error handling
  handleLithicError(error) {
    const lithicError = new Error(error.message || 'Lithic API Error');
    lithicError.name = 'LithicError';
    lithicError.status = error.status || 500;
    lithicError.body = error.body || error.response?.data || {};
    return lithicError;
  }

  // Test connection
  async testConnection() {
    try {
      await this.client.apiStatus();
      console.log('✅ Lithic API status reachable');
      return true;
    } catch (error) {
      console.error('❌ Lithic API connection failed:', error.message);
      return false;
    }
  }
}

const lithicService = new LithicService();

module.exports = {
  lithicClient,
  lithicService,
  LithicService
};
