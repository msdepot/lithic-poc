-- Insert default roles
INSERT INTO roles (role_name, role_description) VALUES
('owner', 'System owner with full access to all operations'),
('super_admin', 'High-level admin with all permissions except owner management'),
('admin', 'Standard administrator with user and card management permissions'),
('user', 'Regular user who can have cards and manage own account'),
('analyst', 'Read-only access for transaction analysis and reporting')
ON CONFLICT (role_name) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('lithic_api_key', '595234f1-968e-4fad-b308-41f6e19bc93f', 'string', 'Lithic sandbox API key'),
('lithic_environment', 'sandbox', 'string', 'Lithic environment (sandbox or production)'),
('jwt_secret', 'super-secret-jwt-token-with-at-least-32-characters-long-for-lithic-poc', 'string', 'JWT signing secret'),
('jwt_expiry', '24h', 'string', 'JWT token expiry time'),
('refresh_token_expiry', '7d', 'string', 'Refresh token expiry time'),
('max_login_attempts', '5', 'number', 'Maximum login attempts before lockout'),
('lockout_duration', '30', 'number', 'Account lockout duration in minutes'),
('default_daily_limit', '1000.00', 'number', 'Default daily spending limit for new cards'),
('default_monthly_limit', '5000.00', 'number', 'Default monthly spending limit for new cards'),
('sync_transactions_interval', '300', 'number', 'Transaction sync interval in seconds')
ON CONFLICT (setting_key) DO NOTHING;

-- Create default admin user (password: 'admin123' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, role_id, first_name, last_name) 
VALUES ('admin', 'admin@lithic-poc.com', '$2b$12$rBV2HQ/QlGDLv.4qO8/OxeWJOqvNZVhcYlEoABE8C8A1N.oYuLyO6', 1, 'System', 'Administrator')
ON CONFLICT (username) DO NOTHING;

-- Create default account for admin
INSERT INTO accounts (user_id, account_name, account_type) 
VALUES (1, 'Admin Account', 'business')
ON CONFLICT (user_id, account_name) DO NOTHING;

-- Create default spending profiles
INSERT INTO spending_profiles (profile_name, description, daily_limit, monthly_limit, per_transaction_limit) VALUES
('Basic User', 'Standard spending profile for regular users', 500.00, 2000.00, 200.00),
('Premium User', 'Enhanced spending profile for premium users', 1000.00, 5000.00, 500.00),
('Corporate', 'Corporate spending profile with higher limits', 2000.00, 10000.00, 1000.00),
('Limited', 'Restricted spending profile for new users', 100.00, 500.00, 50.00)
ON CONFLICT (profile_name) DO NOTHING;