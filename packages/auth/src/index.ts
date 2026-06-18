/**
 * ArrowERA Auth Package
 * Enterprise Authentication & Identity Platform
 * 
 * Features:
 * - OAuth 2.0 (Google, GitHub, Microsoft, Discord, LinkedIn)
 * - Passkeys (WebAuthn/FIDO2)
 * - MFA/TOTP
 * - Session Management
 * - JWT Tokens
 */

// OAuth Providers
export { OAuthProvider, OAuthConfig, OAuthTokens, OAuthUserProfile } from './providers/base';
export { GoogleOAuthProvider } from './providers/google';
export { GitHubOAuthProvider } from './providers/github';
export { MicrosoftOAuthProvider } from './providers/microsoft';
export { DiscordOAuthProvider } from './providers/discord';
export { LinkedInOAuthProvider } from './providers/linkedin';
export { OAuthProviderFactory, OAuthProviderType, OAuthProviderRegistryConfig } from './providers';

// Passkeys
export { PasskeyService, createPasskeyService } from './passkeys/passkey.service';
export type {
  PasskeyRegistrationOptions,
  PasskeyRegistrationResult,
  PasskeyVerificationResult,
  StoredCredential,
} from './passkeys/passkey.service';

// MFA
export { MFAService, mfaService } from './mfa/totp.service';
export type { MFASetupResult, MFAVerificationResult } from './mfa/totp.service';

// Session
export { SessionManager } from './session';

// WebAuthn (legacy compatibility)
export { WebAuthnProvider } from './webauthn';

// Magic Link (legacy compatibility)
export { MagicLinkProvider } from './magic-link';

