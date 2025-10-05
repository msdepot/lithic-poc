-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE USER MANAGEMENT TABLES
-- =====================================================

-- Roles table for RBAC
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(role_id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    lithic_account_holder_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT chk_username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    CONSTRAINT chk_phone_format CHECK (phone IS NULL OR phone ~ '^\+?[\d\s\-\(\)]+$')
);

-- Financial accounts table
CREATE TABLE IF NOT EXISTS accounts (
    account_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'personal' CHECK (account_type IN ('personal', 'business')),
    balance DECIMAL(15,2) DEFAULT 0.00 CHECK (balance >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    lithic_financial_account_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_account_per_user UNIQUE (user_id, account_name)
);

-- Spending profiles table (custom implementation)
CREATE TABLE IF NOT EXISTS spending_profiles (
    spending_profile_id SERIAL PRIMARY KEY,
    profile_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    daily_limit DECIMAL(15,2) CHECK (daily_limit IS NULL OR daily_limit > 0),
    monthly_limit DECIMAL(15,2) CHECK (monthly_limit IS NULL OR monthly_limit > 0), 
    per_transaction_limit DECIMAL(15,2) CHECK (per_transaction_limit IS NULL OR per_transaction_limit > 0),
    allowed_merchant_categories JSONB DEFAULT '[]'::jsonb,
    blocked_merchant_categories JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    lithic_auth_rule_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure daily limit doesn't exceed monthly limit
    CONSTRAINT chk_daily_monthly_limit CHECK (
        daily_limit IS NULL OR monthly_limit IS NULL OR daily_limit <= monthly_limit
    ),
    -- Ensure at least one limit is specified
    CONSTRAINT chk_at_least_one_limit CHECK (
        daily_limit IS NOT NULL OR monthly_limit IS NOT NULL OR per_transaction_limit IS NOT NULL
    )
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
    card_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    account_id INTEGER NOT NULL REFERENCES accounts(account_id) ON DELETE RESTRICT,
    spending_profile_id INTEGER REFERENCES spending_profiles(spending_profile_id) ON DELETE SET NULL,
    card_type VARCHAR(20) NOT NULL CHECK (card_type IN ('debit', 'credit', 'prepaid')),
    card_subtype VARCHAR(20) DEFAULT 'virtual' CHECK (card_subtype IN ('virtual', 'physical')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'locked', 'cancelled', 'expired')),
    memo TEXT,
    
    -- Custom limits (used when not on a spending profile)
    custom_daily_limit DECIMAL(15,2) CHECK (custom_daily_limit IS NULL OR custom_daily_limit > 0),
    custom_monthly_limit DECIMAL(15,2) CHECK (custom_monthly_limit IS NULL OR custom_monthly_limit > 0),
    custom_per_transaction_limit DECIMAL(15,2) CHECK (custom_per_transaction_limit IS NULL OR custom_per_transaction_limit > 0),
    
    -- Lithic integration
    lithic_card_token VARCHAR(100) NOT NULL UNIQUE,
    lithic_auth_rule_token VARCHAR(100) UNIQUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at DATE,
    
    -- Ensure either spending profile OR custom limits, not both
    CONSTRAINT chk_profile_or_custom CHECK (
        (spending_profile_id IS NOT NULL AND custom_daily_limit IS NULL AND custom_monthly_limit IS NULL AND custom_per_transaction_limit IS NULL) OR
        (spending_profile_id IS NULL)
    ),
    -- Ensure custom limits hierarchy
    CONSTRAINT chk_custom_limits_hierarchy CHECK (
        (custom_daily_limit IS NULL OR custom_monthly_limit IS NULL OR custom_daily_limit <= custom_monthly_limit) AND
        (custom_per_transaction_limit IS NULL OR custom_daily_limit IS NULL OR custom_per_transaction_limit <= custom_daily_limit)
    )
);

-- Transactions table (synced from Lithic)
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id SERIAL PRIMARY KEY,
    card_id INTEGER NOT NULL REFERENCES cards(card_id) ON DELETE RESTRICT,
    lithic_transaction_token VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    merchant_name VARCHAR(255),
    merchant_category_code VARCHAR(10),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('authorization', 'clearing', 'return', 'void')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'settled', 'declined', 'expired')),
    description TEXT,
    
    -- Transaction timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    settled_date TIMESTAMP WITH TIME ZONE,
    
    -- Location data
    merchant_city VARCHAR(100),
    merchant_state VARCHAR(50),
    merchant_country VARCHAR(3),
    
    -- Additional Lithic data
    lithic_raw_data JSONB
);

-- Audit log for tracking all changes
CREATE TABLE IF NOT EXISTS audit_log (
    audit_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(10) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session management for JWT tokens
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    jwt_token_hash VARCHAR(255) NOT NULL,
    refresh_token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
    setting_id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(10) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create all indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_lithic_token ON users(lithic_account_holder_token);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_lithic_financial_token ON accounts(lithic_financial_account_token);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON spending_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON spending_profiles(profile_name);
CREATE INDEX IF NOT EXISTS idx_lithic_auth_rule ON spending_profiles(lithic_auth_rule_token);
CREATE INDEX IF NOT EXISTS idx_cards_user ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_account ON cards(account_id);
CREATE INDEX IF NOT EXISTS idx_cards_profile ON cards(spending_profile_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_type ON cards(card_type);
CREATE INDEX IF NOT EXISTS idx_lithic_card_token ON cards(lithic_card_token);
CREATE INDEX IF NOT EXISTS idx_transactions_card ON transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_name);
CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);
CREATE INDEX IF NOT EXISTS idx_lithic_transaction_token ON transactions(lithic_transaction_token);
CREATE INDEX IF NOT EXISTS idx_transactions_card_date ON transactions(card_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(jwt_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_settings_key ON system_settings(setting_key);
