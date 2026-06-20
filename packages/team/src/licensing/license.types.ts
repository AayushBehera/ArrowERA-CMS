export interface License {
  id: string;
  licenseKey: string; // Masked for security
  organizationId: string | null;
  tier: 'community' | 'professional' | 'enterprise';
  status: 'active' | 'expired' | 'revoked' | 'suspended';
  issuedAt: Date;
  expiresAt: Date | null;
  activatedAt: Date | null;
  deactivatedAt: Date | null;
  maxUsers: number | null;
  maxWorkspaces: number | null;
  maxTeams: number | null;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLicenseInput {
  organizationId?: string;
  tier: 'community' | 'professional' | 'enterprise';
  expiresAt?: Date;
  maxUsers?: number;
  maxWorkspaces?: number;
  maxTeams?: number;
}

export interface LicenseValidationResult {
  valid: boolean;
  license?: License;
  features?: string[];
  error?: string;
}

export type LicenseTier = 'community' | 'professional' | 'enterprise';

export type FeatureFlag = 
  | 'basic_content'
  | 'single_user'
  | 'multiple_users'
  | 'unlimited_users'
  | 'basic_storage'
  | 'advanced_storage'
  | 'unlimited_storage'
  | 'oauth_login'
  | 'teams'
  | 'audit_logs_basic'
  | 'audit_logs_full'
  | 'sso_saml'
  | 'sso_oidc'
  | 'advanced_security'
  | 'priority_support'
  | 'custom_integrations';
