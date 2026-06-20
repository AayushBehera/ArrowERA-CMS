/**
 * LinkedIn OAuth Provider Implementation
 */

import { OAuthProvider, OAuthConfig, OAuthUserProfile } from './base';

export class LinkedInOAuthProvider extends OAuthProvider {
  constructor(config: OAuthConfig) {
    super('LinkedIn', config);
  }

  protected getAuthBaseUrl(): string {
    return 'https://www.linkedin.com/oauth/v2/authorization';
  }

  protected getTokenEndpoint(): string {
    return 'https://www.linkedin.com/oauth/v2/accessToken';
  }

  protected getUserInfoEndpoint(): string {
    return 'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams),primaryEmail)';
  }

  protected getRevokeEndpoint(): string | null {
    return 'https://www.linkedin.com/oauth/v2/revoke';
  }

  protected transformUserProfile(data: any): OAuthUserProfile {
    // Extract profile picture URL
    let avatar: string | undefined;
    if (data.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier) {
      avatar = data.profilePicture['displayImage~'].elements[0].identifiers[0].identifier;
    }

    // Extract email
    const email = data.primaryEmail?.emailAddress || '';

    // Construct full name
    const firstName = data.firstName?.localized?.en_US || '';
    const lastName = data.lastName?.localized?.en_US || '';
    const name = `${firstName} ${lastName}`.trim();

    return {
      id: data.id,
      email,
      name: name || 'LinkedIn User',
      avatar,
      emailVerified: !!email,
      raw: data,
    };
  }

  /**
   * Get user profile from LinkedIn API v2
   */
  async getUserProfile(accessToken: string): Promise<OAuthUserProfile> {
    const response = await fetch(this.getUserInfoEndpoint(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`[LinkedIn] Profile fetch failed: ${error}`);
    }

    const data = await response.json();
    return this.transformUserProfile(data);
  }
}
