/**
 * OAuth Provider Factory and Registry
 */

import { OAuthProvider, OAuthConfig } from './base';
import { GoogleOAuthProvider } from './google';
import { GitHubOAuthProvider } from './github';
import { MicrosoftOAuthProvider } from './microsoft';
import { DiscordOAuthProvider } from './discord';
import { LinkedInOAuthProvider } from './linkedin';

export type OAuthProviderType = 'google' | 'github' | 'microsoft' | 'discord' | 'linkedin';

export interface OAuthProviderRegistryConfig {
  google?: OAuthConfig;
  github?: OAuthConfig;
  microsoft?: OAuthConfig & { tenantId?: string };
  discord?: OAuthConfig;
  linkedin?: OAuthConfig;
}

export class OAuthProviderFactory {
  private static providers: Map<string, OAuthProvider> = new Map();

  /**
   * Register an OAuth provider
   */
  static register(type: OAuthProviderType, config: OAuthConfig, options?: any): void {
    let provider: OAuthProvider;

    switch (type) {
      case 'google':
        provider = new GoogleOAuthProvider(config);
        break;
      case 'github':
        provider = new GitHubOAuthProvider(config);
        break;
      case 'microsoft':
        provider = new MicrosoftOAuthProvider(config, options?.tenantId);
        break;
      case 'discord':
        provider = new DiscordOAuthProvider(config);
        break;
      case 'linkedin':
        provider = new LinkedInOAuthProvider(config);
        break;
      default:
        throw new Error(`Unknown OAuth provider type: ${type}`);
    }

    this.providers.set(type, provider);
  }

  /**
   * Get a registered provider
   */
  static getProvider(type: OAuthProviderType): OAuthProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new Error(`OAuth provider '${type}' is not registered`);
    }
    return provider;
  }

  /**
   * Check if a provider is registered
   */
  static hasProvider(type: OAuthProviderType): boolean {
    return this.providers.has(type);
  }

  /**
   * Get all registered provider types
   */
  static getRegisteredProviders(): OAuthProviderType[] {
    return Array.from(this.providers.keys()) as OAuthProviderType[];
  }

  /**
   * Initialize all providers from configuration
   */
  static initializeFromConfig(config: OAuthProviderRegistryConfig): void {
    if (config.google) {
      this.register('google', config.google);
    }
    if (config.github) {
      this.register('github', config.github);
    }
    if (config.microsoft) {
      const { tenantId, ...microsoftConfig } = config.microsoft;
      this.register('microsoft', microsoftConfig, { tenantId });
    }
    if (config.discord) {
      this.register('discord', config.discord);
    }
    if (config.linkedin) {
      this.register('linkedin', config.linkedin);
    }
  }

  /**
   * Clear all registered providers (useful for testing)
   */
  static clear(): void {
    this.providers.clear();
  }
}
