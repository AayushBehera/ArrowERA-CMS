-- Migration 016: SSO Configurations table

CREATE TABLE IF NOT EXISTS sso_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider_type VARCHAR(50) NOT NULL CHECK (provider_type IN ('saml', 'oidc')),
    name VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    
    -- SAML specific
    idp_entity_id TEXT,
    idp_sso_url TEXT,
    idp_slo_url TEXT,
    idp_certificate TEXT,
    sp_entity_id TEXT,
    sp_certificate TEXT,
    sp_private_key TEXT,
    
    -- OIDC specific
    oidc_issuer TEXT,
    oidc_client_id TEXT,
    oidc_client_secret TEXT,
    oidc_redirect_uri TEXT,
    oidc_scopes TEXT[],
    
    -- Common settings
    default_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    auto_provision BOOLEAN DEFAULT TRUE,
    domain_whitelist TEXT[],
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sso_configurations_organization_id ON sso_configurations(organization_id);
CREATE INDEX idx_sso_configurations_provider_type ON sso_configurations(provider_type);
CREATE INDEX idx_sso_configurations_enabled ON sso_configurations(enabled);
CREATE INDEX idx_sso_configurations_deleted_at ON sso_configurations(deleted_at);
