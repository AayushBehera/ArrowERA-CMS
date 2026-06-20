/**
 * Discord OAuth Provider Implementation
 */

import { OAuthProvider, OAuthConfig, OAuthUserProfile } from './base';

export class DiscordOAuthProvider extends OAuthProvider {
  constructor(config: OAuthConfig) {
    super('Discord', config);
  }

  protected getAuthBaseUrl(): string {
    return 'https://discord.com/api/oauth2/authorize';
  }

  protected getTokenEndpoint(): string {
    return 'https://discord.com/api/oauth2/token';
  }

  protected getUserInfoEndpoint(): string {
    return 'https://discord.com/api/users/@me';
  }

  protected getRevokeEndpoint(): string | null {
    return 'https://discord.com/api/oauth2/token/revoke';
  }

  protected transformUserProfile(data: any): OAuthUserProfile {
    const avatarUrl = data.avatar 
      ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.${data.avatar.startsWith('a_') ? 'gif' : 'png'}`
      : undefined;

    return {
      id: data.id,
      email: data.email || '',
      name: data.username,
      avatar: avatarUrl,
      emailVerified: !!data.verified,
      raw: data,
    };
  }
}
