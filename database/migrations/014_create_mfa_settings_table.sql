-- Migration 014: MFA Settings table

CREATE TABLE IF NOT EXISTS mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    totp_enabled BOOLEAN DEFAULT FALSE,
    totp_secret VARCHAR(255),
    backup_codes TEXT[], -- Hashed backup codes
    backup_codes_remaining INTEGER DEFAULT 0,
    recovery_email VARCHAR(255),
    trusted_devices JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_mfa_settings_user_id ON mfa_settings(user_id);
CREATE UNIQUE INDEX idx_mfa_settings_user_unique ON mfa_settings(user_id);
