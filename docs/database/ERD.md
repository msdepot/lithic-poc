# Entity Relationship Diagram (Textual)

This is a high-level textual ERD of the current schema.

entities:
  accounts:
    - id (PK)
    - business_name
    - owner_email (UNIQUE)
    - lithic_account_token
    - lithic_financial_account_token
    - balance
    - status
    - timestamps

  users:
    - id (PK)
    - account_id (FK → accounts.id)
    - email (UNIQUE)
    - first_name
    - last_name
    - role
    - lithic_account_holder_token
    - status
    - timestamps

  spending_profiles:
    - id (PK)
    - account_id (FK → accounts.id)
    - name
    - description
    - spend_limit
    - spend_limit_duration
    - allowed_categories (JSON)
    - blocked_categories (JSON)
    - lithic_auth_rule_token
    - timestamps

  cards:
    - id (PK)
    - account_id (FK → accounts.id)
    - user_id (FK → users.id)
    - spending_profile_id (FK → spending_profiles.id)
    - lithic_card_token
    - card_type
    - last_four
    - status
    - spend_limit
    - spend_limit_duration
    - timestamps

relationships:
  - accounts 1..* users
  - accounts 1..* cards
  - accounts 1..* spending_profiles
  - users 1..* cards
  - spending_profiles 1..* cards
