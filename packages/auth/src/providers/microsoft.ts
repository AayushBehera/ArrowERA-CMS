/**
 * Microsoft OAuth Provider Implementation (Azure AD / Microsoft Account)
 */

import { OAuthProvider, OAuthConfig, OAuthUserProfile } from './base';

export class MicrosoftOAuthProvider extends OAuthProvider {
  private tenantId: string;

  constructor(config: OAuthConfig, tenantId: string = 'common') {
    super('Microsoft', config);
    this.tenantId = tenantId;
  }

  protected getAuthBaseUrl(): string {
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize`;
  }

  protected getTokenEndpoint(): string {
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
  }

  protected getUserInfoEndpoint(): string {
    return 'https://graph.microsoft.com/v1.0/me';
  }

  protected getRevokeEndpoint(): string | null {
    // Microsoft doesn't support token revocation via API
    return null;
  }

  protected transformUserProfile(data: any): OAuthUserProfile {
    return {
      id: data.id,
      email: data.mail || data.userPrincipalName,
      name: data.displayName,
      avatar: undefined, // Microsoft Graph requires separate call for photo
      emailVerified: true, // Azure AD emails are verified
      raw: data,
    };
  }

  /**
   * Get user profile from Microsoft Graph API
   */
  async getUserProfile(accessToken: string): Promise<OAuthUserProfile> {
    const response = await fetch(this.getUserInfoEndpoint(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'ConsistencyLevel': 'eventual',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`[Microsoft] Profile fetch failed: ${error}`);
    }

    const data = await response.json();
    return this.transformUserProfile(data);
  }
}
