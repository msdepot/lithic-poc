const axios = require('axios');

class LithicService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.LITHIC_API_URL,
      headers: {
        'Authorization': `api-key ${process.env.LITHIC_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Create account holder
  async createAccountHolder(data) {
    try {
      const response = await this.client.post('/account_holders', {
        individual: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone_number: data.phoneNumber || '+15551234567' // Default for POC
        },
        tos_acceptance: {
          date: new Date().toISOString(),
          ip: '127.0.0.1',
          user_agent: 'lithic-poc/1.0'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Lithic error creating account holder:', error.response?.data || error);
      throw error;
    }
  }

  // Create financial account
  async createFinancialAccount(accountHolderId, nickname) {
    try {
      const response = await this.client.post('/financial_accounts', {
        account_holder_id: accountHolderId,
        nickname: nickname,
        type: 'INDIVIDUAL'
      });
      return response.data;
    } catch (error) {
      console.error('Lithic error creating financial account:', error.response?.data || error);
      throw error;
    }
  }

  // Create card
  async createCard(data) {
    try {
      const response = await this.client.post('/cards', {
        account_holder_id: data.accountHolderId,
        product_id: '1', // Default product for sandbox
        type: data.type || 'VIRTUAL',
        memo: data.memo,
        spend_limit: data.spendLimit,
        spend_limit_duration: data.spendLimitDuration || 'MONTHLY',
        auth_rule_tokens: data.authRuleTokens || []
      });
      return response.data;
    } catch (error) {
      console.error('Lithic error creating card:', error.response?.data || error);
      throw error;
    }
  }

  // Create auth rule
  async createAuthRule(data) {
    try {
      const response = await this.client.post('/auth_rules', {
        account_holder_id: data.accountHolderId,
        allowed_mcc: data.allowedMcc || [],
        blocked_mcc: data.blockedMcc || [],
        allowed_countries: data.allowedCountries || ['USA'],
        blocked_countries: data.blockedCountries || [],
        avs_type: 'ZIP_AND_STREET',
        max_transaction_amount: data.maxTransactionAmount,
        max_spend_limit: data.maxSpendLimit,
        max_spend_window: data.maxSpendWindow || 'MONTHLY'
      });
      return response.data;
    } catch (error) {
      console.error('Lithic error creating auth rule:', error.response?.data || error);
      throw error;
    }
  }

  // Get card details
  async getCard(cardId) {
    try {
      const response = await this.client.get(`/cards/${cardId}`);
      return response.data;
    } catch (error) {
      console.error('Lithic error getting card:', error.response?.data || error);
      throw error;
    }
  }

  // Update card status
  async updateCardStatus(cardId, status) {
    try {
      const response = await this.client.patch(`/cards/${cardId}`, {
        state: status
      });
      return response.data;
    } catch (error) {
      console.error('Lithic error updating card status:', error.response?.data || error);
      throw error;
    }
  }

  // Simulate authorization (sandbox only)
  async simulateAuthorization(cardId, amount, merchantName) {
    try {
      const response = await this.client.post('/simulate/authorize', {
        card_token: cardId,
        amount: amount,
        merchant: {
          descriptor: merchantName,
          mcc: '5812' // Restaurant MCC for testing
        }
      });
      return response.data;
    } catch (error) {
      console.error('Lithic error simulating authorization:', error.response?.data || error);
      throw error;
    }
  }
}

module.exports = new LithicService();