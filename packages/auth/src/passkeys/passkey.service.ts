/**
 * Passkey (WebAuthn) Service for Passwordless Authentication
 * Implements FIDO2/WebAuthn registration and authentication
 */

import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  CredentialDeviceType,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';

export interface PasskeyRegistrationOptions {
  userId: string;
  userName: string;
  userDisplayName?: string;
}

export interface PasskeyRegistrationResult {
  options: PublicKeyCredentialCreationOptions;
  challenge: string;
}

export interface PasskeyVerificationResult {
  verified: boolean;
  credential?: StoredCredential;
  error?: string;
}

export interface StoredCredential {
  id: string;
  publicKey: string;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
  createdAt: Date;
  lastUsedAt?: Date;
}

export class PasskeyService {
  private rpName: string;
  private rpID: string;
  private origin: string;

  constructor(rpName: string, rpID: string, origin: string) {
    this.rpName = rpName;
    this.rpID = rpID;
    this.origin = origin;
  }

  /**
   * Generate registration options for a new passkey
   */
  async generateRegistrationOptions(
    options: PasskeyRegistrationOptions,
    existingCredentials: StoredCredential[] = []
  ): Promise<PasskeyRegistrationResult> {
    const regOptions = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: options.userId,
      userName: options.userName,
      userDisplayName: options.userDisplayName,
      attestationType: 'none',
      excludeCredentials: existingCredentials.map(cred => ({
        id: cred.id,
        type: 'public-key',
        transports: cred.transports,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    return {
      options: regOptions,
      challenge: regOptions.challenge,
    };
  }

  /**
   * Verify registration response and create stored credential
   */
  async verifyRegistration(
    response: RegistrationResponseJSON,
    expectedChallenge: string
  ): Promise<PasskeyVerificationResult> {
    try {
      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        requireUserVerification: true,
      });

      if (!verification.verified || !verification.registrationInfo) {
        return {
          verified: false,
          error: 'Registration verification failed',
        };
      }

      const { credential, aaguid } = verification.registrationInfo;

      const storedCredential: StoredCredential = {
        id: credential.id,
        publicKey: Buffer.from(credential.publicKey).toString('base64'),
        counter: credential.counter,
        deviceType: credential.deviceType,
        backedUp: credential.backedUp,
        transports: response.response.transports,
        createdAt: new Date(),
      };

      return {
        verified: true,
        credential: storedCredential,
      };
    } catch (error) {
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate authentication options for existing passkey
   */
  async generateAuthenticationOptions(
    allowedCredentials: StoredCredential[] = [],
    userVerification: 'required' | 'preferred' | 'discouraged' = 'preferred'
  ): Promise<{
    options: PublicKeyCredentialRequestOptions;
    challenge: string;
  }> {
    const authOptions = await generateAuthenticationOptions({
      rpID: this.rpID,
      allowCredentials: allowedCredentials.map(cred => ({
        id: cred.id,
        type: 'public-key',
        transports: cred.transports,
      })),
      userVerification,
    });

    return {
      options: authOptions,
      challenge: authOptions.challenge,
    };
  }

  /**
   * Verify authentication response
   */
  async verifyAuthentication(
    response: AuthenticationResponseJSON,
    expectedChallenge: string,
    credential: StoredCredential
  ): Promise<PasskeyVerificationResult> {
    try {
      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
        credential: {
          id: credential.id,
          publicKey: Buffer.from(credential.publicKey, 'base64'),
          counter: credential.counter,
          transports: credential.transports,
        },
        requireUserVerification: true,
      });

      if (!verification.verified) {
        return {
          verified: false,
          error: 'Authentication verification failed',
        };
      }

      // Update credential counter
      const updatedCredential: StoredCredential = {
        ...credential,
        counter: verification.authenticationInfo.newCounter,
        lastUsedAt: new Date(),
      };

      return {
        verified: true,
        credential: updatedCredential,
      };
    } catch (error) {
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check if a credential is from a single-device or multi-device authenticator
   */
  isSingleDevice(deviceType: CredentialDeviceType): boolean {
    return deviceType === 'singleDevice';
  }

  /**
   * Check if a credential supports backup
   */
  supportsBackup(backedUp: boolean): boolean {
    return backedUp;
  }
}

// Factory function to create passkey service instance
export function createPasskeyService(
  rpName: string,
  rpID: string,
  origin: string
): PasskeyService {
  return new PasskeyService(rpName, rpID, origin);
}
