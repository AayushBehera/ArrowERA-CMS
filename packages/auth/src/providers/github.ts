/**
 * GitHub OAuth Provider Implementation
 */

import { OAuthProvider, OAuthConfig, OAuthUserProfile } from './base';

export class GitHubOAuthProvider extends OAuthProvider {
  constructor(config: OAuthConfig) {
    super('GitHub', config);
  }

  protected getAuthBaseUrl(): string {
    return 'https://github.com/login/oauth/authorize';
  }

  protected getTokenEndpoint(): string {
    return 'https://github.com/login/oauth/access_token';
  }

  protected getUserInfoEndpoint(): string {
    return 'https://api.github.com/user';
  }

  protected getRevokeEndpoint(): string | null {
    // GitHub doesn't support token revocation
    return null;
  }

  protected transformUserProfile(data: any): OAuthUserProfile {
    return {
      id: String(data.id),
      email: data.email || '',
      name: data.name || data.login,
      avatar: data.avatar_url,
      emailVerified: !!data.email,
      raw: data,
    };
  }
}
