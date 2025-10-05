-- Drop existing tables if they exist
DROP TABLE IF EXISTS card_transactions CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS spending_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- Create accounts table (businesses/organizations)
CREATE TABLE accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    lithic_account_holder_id VARCHAR(255),
    lithic_financial_account_id VARCHAR(255),
    type VARCHAR(50) DEFAULT 'business',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'user')),
    lithic_account_holder_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create spending profiles table
CREATE TABLE spending_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    daily_limit DECIMAL(10, 2),
    monthly_limit DECIMAL(10, 2),
    transaction_limit DECIMAL(10, 2),
    allowed_categories TEXT[], -- Array of MCC codes
    blocked_categories TEXT[], -- Array of MCC codes
    allowed_merchants TEXT[],
    blocked_merchants TEXT[],
    lithic_auth_rule_id VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create cards table
CREATE TABLE cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    spending_profile_id UUID REFERENCES spending_profiles(id),
    lithic_card_id VARCHAR(255) UNIQUE,
    last_four VARCHAR(4),
    status VARCHAR(50),
    type VARCHAR(50) CHECK (type IN ('virtual', 'physical', 'reloadable')),
    custom_daily_limit DECIMAL(10, 2),
    custom_monthly_limit DECIMAL(10, 2),
    custom_transaction_limit DECIMAL(10, 2),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create card transactions table (for demo purposes)
CREATE TABLE card_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
    lithic_transaction_id VARCHAR(255),
    amount DECIMAL(10, 2),
    merchant_name VARCHAR(255),
    merchant_category VARCHAR(255),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_users_account_id ON users(account_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_account_id ON cards(account_id);
CREATE INDEX idx_transactions_card_id ON card_transactions(card_id);

-- Insert admin account
INSERT INTO accounts (id, name, email, type) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Admin CRM', 'admin', 'admin');