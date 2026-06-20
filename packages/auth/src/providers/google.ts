/**
 * Google OAuth Provider Implementation
 */

import { OAuthProvider, OAuthConfig, OAuthUserProfile } from './base';

export class GoogleOAuthProvider extends OAuthProvider {
  constructor(config: OAuthConfig) {
    super('Google', config);
  }

  protected getAuthBaseUrl(): string {
    return 'https://accounts.google.com/o/oauth2/v2/auth';
  }

  protected getTokenEndpoint(): string {
    return 'https://oauth2.googleapis.com/token';
  }

  protected getUserInfoEndpoint(): string {
    return 'https://www.googleapis.com/oauth2/v3/userinfo';
  }

  protected getRevokeEndpoint(): string | null {
    return 'https://oauth2.googleapis.com/revoke';
  }

  protected transformUserProfile(data: any): OAuthUserProfile {
    return {
      id: data.sub,
      email: data.email,
      name: data.name,
      avatar: data.picture,
      emailVerified: data.email_verified ?? false,
      raw: data,
    };
  }
}
