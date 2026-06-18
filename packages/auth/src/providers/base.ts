/**
 * ArrowERA OAuth Provider Base Class
 * Enterprise-grade OAuth implementation with token refresh and profile management
 */

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}

export interface OAuthUserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
  raw: Record<string, any>;
}

export abstract class OAuthProvider {
  protected config: OAuthConfig;
  
  constructor(protected providerName: string, config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Generate authorization URL with state parameter for CSRF protection
   */
  async getAuthorizationUrl(state: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      state,
    });

    return `${this.getAuthBaseUrl()}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForToken(code: string): Promise<OAuthTokens> {
    const response = await fetch(this.getTokenEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`[${this.providerName}] Token exchange failed: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthTokens> {
    const response = await fetch(this.getTokenEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`[${this.providerName}] Token refresh failed: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresIn: data.expires_in,
      tokenType: data.token_type,
      scope: data.scope,
    };
  }

  /**
   * Get user profile from provider
   */
  async getUserProfile(accessToken: string): Promise<OAuthUserProfile> {
    const response = await fetch(this.getUserInfoEndpoint(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`[${this.providerName}] Profile fetch failed: ${error}`);
    }

    const data = await response.json();
    return this.transformUserProfile(data);
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserProfile(accessToken);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Revoke access token
   */
  async revokeToken(accessToken: string): Promise<void> {
    const endpoint = this.getRevokeEndpoint();
    if (!endpoint) {
      console.warn(`[${this.providerName}] Token revocation not supported`);
      return;
    }

    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        token: accessToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });
  }

  // Abstract methods to be implemented by specific providers
  protected abstract getAuthBaseUrl(): string;
  protected abstract getTokenEndpoint(): string;
  protected abstract getUserInfoEndpoint(): string;
  protected abstract getRevokeEndpoint(): string | null;
  protected abstract transformUserProfile(data: any): OAuthUserProfile;
}
