-- Accounts Table (Business accounts created by admin)
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_email VARCHAR(255) NOT NULL UNIQUE,
  lithic_account_holder_token VARCHAR(255),
  lithic_financial_account_token VARCHAR(255),
  balance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users Table (Users within accounts)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- owner, admin, user, analyst
  lithic_account_holder_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(account_id, email)
);

-- Spending Profiles Table (Custom spending rules)
CREATE TABLE spending_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  daily_limit DECIMAL(12, 2),
  monthly_limit DECIMAL(12, 2),
  allowed_categories TEXT[], -- Array of merchant categories
  blocked_categories TEXT[], -- Array of blocked categories
  lithic_auth_rule_token VARCHAR(255),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cards Table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_type VARCHAR(50) NOT NULL, -- debit, reloadable, limit_based
  lithic_card_token VARCHAR(255) NOT NULL,
  last_four VARCHAR(4),
  spending_profile_id UUID REFERENCES spending_profiles(id),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions Table (For JWT tracking)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_type VARCHAR(50) NOT NULL, -- admin or user
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_account_id ON users(account_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cards_account_id ON cards(account_id);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_spending_profiles_account_id ON spending_profiles(account_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
