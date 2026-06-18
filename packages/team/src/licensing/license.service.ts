import { randomBytes, createHash } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '@arrowera/db';
import { licenses, organizations } from '@arrowera/db/schema';
import type { License, CreateLicenseInput, LicenseValidationResult } from './license.types';

export class LicenseService {
  private static readonly LICENSE_PREFIX = 'ARROW-';
  
  // Feature flags by tier
  private static readonly TIER_FEATURES = {
    community: [
      'basic_content',
      'single_user',
      'basic_storage',
    ],
    professional: [
      'basic_content',
      'multiple_users',
      'advanced_storage',
      'oauth_login',
      'teams',
      'audit_logs_basic',
    ],
    enterprise: [
      'basic_content',
      'unlimited_users',
      'unlimited_storage',
      'oauth_login',
      'teams',
      'audit_logs_full',
      'sso_saml',
      'sso_oidc',
      'advanced_security',
      'priority_support',
      'custom_integrations',
    ],
  };

  /**
   * Generate a license key
   */
  private static generateLicenseKey(): string {
    const randomPart = randomBytes(16).toString('hex').toUpperCase();
    const formatted = randomPart.match(/.{1,4}/g)?.join('-') || '';
    return `${this.LICENSE_PREFIX}${formatted}`;
  }

  /**
   * Hash a license key for storage
   */
  private static hashLicenseKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Create a new license
   */
  static async createLicense(input: CreateLicenseInput): Promise<{ license: License; licenseKey: string }> {
    const licenseKey = this.generateLicenseKey();
    
    const features = this.TIER_FEATURES[input.tier] || [];

    const [license] = await db
      .insert(licenses)
      .values({
        licenseKey: this.hashLicenseKey(licenseKey),
        organizationId: input.organizationId,
        tier: input.tier,
        status: 'active',
        expiresAt: input.expiresAt,
        maxUsers: input.maxUsers,
        maxWorkspaces: input.maxWorkspaces,
        maxTeams: input.maxTeams,
        features: JSON.stringify(features),
      })
      .returning();

    if (!license) {
      throw new Error('Failed to create license');
    }

    return {
      license: this.mapToLicense(license),
      licenseKey,
    };
  }

  /**
   * Validate a license key
   */
  static async validateLicense(licenseKey: string): Promise<LicenseValidationResult> {
    const hashedKey = this.hashLicenseKey(licenseKey);

    const [license] = await db
      .select()
      .from(licenses)
      .where(and(eq(licenses.licenseKey, hashedKey), eq(licenses.status, 'active')))
      .limit(1);

    if (!license) {
      return {
        valid: false,
        error: 'Invalid license key',
      };
    }

    // Check expiration
    if (license.expiresAt && license.expiresAt < new Date()) {
      return {
        valid: false,
        error: 'License has expired',
      };
    }

    return {
      valid: true,
      license: this.mapToLicense(license),
      features: license.features as string[] || [],
    };
  }

  /**
   * Get license by organization
   */
  static async getOrganizationLicense(organizationId: string): Promise<License | null> {
    const [license] = await db
      .select()
      .from(licenses)
      .where(and(eq(licenses.organizationId, organizationId), eq(licenses.status, 'active')))
      .orderBy(licenses.createdAt)
      .limit(1);

    if (!license) {
      return null;
    }

    return this.mapToLicense(license);
  }

  /**
   * Check if organization has a specific feature
   */
  static async hasFeature(organizationId: string, feature: string): Promise<boolean> {
    const license = await this.getOrganizationLicense(organizationId);
    
    if (!license) {
      return false;
    }

    const features = license.features as string[] || [];
    return features.includes(feature);
  }

  /**
   * Activate a license
   */
  static async activateLicense(licenseKey: string, organizationId: string): Promise<License> {
    const hashedKey = this.hashLicenseKey(licenseKey);

    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.licenseKey, hashedKey))
      .limit(1);

    if (!license) {
      throw new Error('Invalid license key');
    }

    if (license.organizationId && license.organizationId !== organizationId) {
      throw new Error('License is already activated for another organization');
    }

    const [updated] = await db
      .update(licenses)
      .set({
        organizationId,
        activatedAt: new Date(),
        status: 'active',
      })
      .where(eq(licenses.id, license.id))
      .returning();

    if (!updated) {
      throw new Error('Failed to activate license');
    }

    return this.mapToLicense(updated);
  }

  /**
   * Deactivate a license
   */
  static async deactivateLicense(licenseId: string): Promise<void> {
    await db
      .update(licenses)
      .set({
        deactivatedAt: new Date(),
        status: 'revoked',
      })
      .where(eq(licenses.id, licenseId));
  }

  /**
   * Revoke a license
   */
  static async revokeLicense(licenseId: string): Promise<void> {
    await db
      .update(licenses)
      .set({
        status: 'revoked',
      })
      .where(eq(licenses.id, licenseId));
  }

  /**
   * Get license usage statistics
   */
  static async getLicenseUsage(licenseId: string): Promise<{
    userCount: number;
    workspaceCount: number;
    teamCount: number;
  }> {
    // This would require joining with users, workspaces, teams tables
    return {
      userCount: 0,
      workspaceCount: 0,
      teamCount: 0,
    };
  }

  private static mapToLicense(row: typeof licenses.$inferSelect): License {
    return {
      id: row.id,
      licenseKey: row.licenseKey.substring(0, 8) + '...', // Masked for security
      organizationId: row.organizationId,
      tier: row.tier as 'community' | 'professional' | 'enterprise',
      status: row.status as 'active' | 'expired' | 'revoked' | 'suspended',
      issuedAt: row.issuedAt,
      expiresAt: row.expiresAt,
      activatedAt: row.activatedAt,
      deactivatedAt: row.deactivatedAt,
      maxUsers: row.maxUsers,
      maxWorkspaces: row.maxWorkspaces,
      maxTeams: row.maxTeams,
      features: row.features as string[],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
