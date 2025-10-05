const lithicClient = require('../config/lithic');

class LithicService {
  // Create account holder (individual or business)
  async createAccountHolder(data) {
    try {
      const accountHolder = await lithicClient.accountHolders.create({
        beneficial_owner_entities: data.type === 'business' ? [{
          business_entity: {
            legal_business_name: data.businessName,
            phone_numbers: ['+15555551234'],
            dba_business_name: data.businessName,
            government_id: {
              business_tax_id_provided: true
            }
          }
        }] : undefined,
        beneficial_owner_individuals: data.type === 'individual' ? [{
          individual: {
            first_name: data.firstName || 'User',
            last_name: data.lastName || 'User',
            phone_number: '+15555551234',
            email: data.email,
            address: {
              address1: '123 Main St',
              city: 'New York',
              state: 'NY',
              postal_code: '10001',
              country: 'USA'
            },
            dob: '1990-01-01'
          }
        }] : undefined,
        control_person: {
          first_name: data.firstName || 'Owner',
          last_name: data.lastName || 'Owner',
          phone_number: '+15555551234',
          email: data.email,
          address: {
            address1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postal_code: '10001',
            country: 'USA'
          },
          dob: '1990-01-01'
        },
        nature_of_business: 'Software',
        tos_timestamp: new Date().toISOString(),
        workflow: 'KYB_BASIC',
        kyb_passed_timestamp: new Date().toISOString()
      });

      return accountHolder;
    } catch (error) {
      console.error('Lithic account holder creation error:', error);
      throw error;
    }
  }

  // Create financial account for funding
  async createFinancialAccount(accountHolderToken, nickname) {
    try {
      const financialAccount = await lithicClient.financialAccounts.create({
        nickname: nickname,
        type: 'OPERATING',
        account_token: accountHolderToken
      });

      return financialAccount;
    } catch (error) {
      console.error('Lithic financial account creation error:', error);
      throw error;
    }
  }

  // Create a card
  async createCard(data) {
    try {
      const card = await lithicClient.cards.create({
        type: 'VIRTUAL',
        account_token: data.accountHolderToken,
        card_program_token: undefined, // Use default program
        carrier: undefined,
        digital_card_art_token: undefined,
        exp_month: undefined,
        exp_year: undefined,
        memo: data.memo || `Card for ${data.userEmail}`,
        pin: undefined,
        product_id: undefined,
        shipping_address: undefined,
        shipping_method: undefined,
        spend_limit: data.spendLimit || undefined,
        spend_limit_duration: data.spendLimitDuration || undefined,
        state: 'OPEN'
      });

      return card;
    } catch (error) {
      console.error('Lithic card creation error:', error);
      throw error;
    }
  }

  // Create auth rule (spending limits)
  async createAuthRule(accountToken, rules) {
    try {
      const authRule = await lithicClient.authRules.create({
        account_tokens: [accountToken],
        allowed_mcc: rules.allowedCategories || undefined,
        blocked_mcc: rules.blockedCategories || undefined,
        spending_limits: rules.limits ? [{
          amount: Math.round(rules.limits.daily * 100), // Convert to cents
          interval: 'DAILY'
        }] : undefined
      });

      return authRule;
    } catch (error) {
      console.error('Lithic auth rule creation error:', error);
      throw error;
    }
  }

  // Apply auth rule to card
  async applyAuthRuleToCard(cardToken, authRuleToken) {
    try {
      await lithicClient.authRules.apply({
        card_tokens: [cardToken],
        auth_rule_token: authRuleToken
      });

      return true;
    } catch (error) {
      console.error('Lithic apply auth rule error:', error);
      throw error;
    }
  }

  // Get card details
  async getCard(cardToken) {
    try {
      const card = await lithicClient.cards.retrieve(cardToken);
      return card;
    } catch (error) {
      console.error('Lithic get card error:', error);
      throw error;
    }
  }

  // List cards for account
  async listCards(accountToken) {
    try {
      const cards = await lithicClient.cards.list({
        account_token: accountToken
      });
      return cards.data || [];
    } catch (error) {
      console.error('Lithic list cards error:', error);
      throw error;
    }
  }
}

module.exports = new LithicService();
