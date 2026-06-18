/**
 * Multi-Factor Authentication (MFA) Service
 * Implements TOTP (Time-based One-Time Password) and Backup Codes
 */

import * as OTPAuth from 'otpauth';
import * as QRCode from 'qrcode';
import { randomBytes } from 'crypto';

export interface MFASetupResult {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUri: string;
  backupCodes: string[];
}

export interface MFAVerificationResult {
  valid: boolean;
  used?: boolean;
}

export class MFAService {
  private static readonly BACKUP_CODE_COUNT = 10;
  private static readonly BACKUP_CODE_LENGTH = 8;
  private static readonly TOTP_DIGITS = 6;
  private static readonly TOTP_PERIOD = 30;
  private static readonly TOTP_WINDOW = 1; // Allow 1 step before/after for clock skew

  /**
   * Generate a cryptographically secure random secret
   */
  generateSecret(): string {
    const secret = new OTPAuth.Secret({
      size: 20, // 160 bits
    });
    return secret.base32;
  }

  /**
   * Setup MFA for a user
   * Returns secret, OTPAuth URL, QR code, and backup codes
   */
  async setupMFA(userId: string, issuer: string = 'ArrowERA CMS'): Promise<MFASetupResult> {
    const secret = this.generateSecret();
    
    const totp = new OTPAuth.TOTP({
      issuer,
      label: userId,
      algorithm: 'SHA1',
      digits: this.TOTP_DIGITS,
      period: this.TOTP_PERIOD,
      secret,
    });

    const otpauthUrl = totp.toString();
    const qrCodeDataUri = await QRCode.toDataURL(otpauthUrl, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'M',
    });

    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      otpauthUrl,
      qrCodeDataUri,
      backupCodes,
    };
  }

  /**
   * Verify a TOTP code
   */
  verifyTOTP(secret: string, token: string): MFAVerificationResult {
    try {
      const totp = new OTPAuth.TOTP({
        secret,
        algorithm: 'SHA1',
        digits: this.TOTP_DIGITS,
        period: this.TOTP_PERIOD,
      });

      const delta = totp.validate({ token, window: this.TOTP_WINDOW });
      
      if (delta === null) {
        return { valid: false };
      }

      // If delta is 0, the token is for the current period
      // If delta is non-zero, it's for a previous/future period (clock skew)
      return { 
        valid: true,
        used: false, // TOTP codes can be reused within the window
      };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < MFAService.BACKUP_CODE_COUNT; i++) {
      const code = randomBytes(MFAService.BACKUP_CODE_LENGTH)
        .toString('hex')
        .slice(0, MFAService.BACKUP_CODE_LENGTH)
        .match(/.{1,4}/g)!
        .join('-');
      
      codes.push(code);
    }

    return codes;
  }

  /**
   * Verify a backup code
   */
  verifyBackupCode(backupCodes: string[], code: string): MFAVerificationResult {
    const normalizedCode = code.replace(/[-\s]/g, '').toLowerCase();
    
    const index = backupCodes.findIndex(
      c => c.replace(/[-\s]/g, '').toLowerCase() === normalizedCode
    );

    if (index === -1) {
      return { valid: false };
    }

    // Remove used code
    backupCodes.splice(index, 1);

    return {
      valid: true,
      used: true,
    };
  }

  /**
   * Hash backup codes for secure storage
   */
  async hashBackupCodes(codes: string[]): Promise<string[]> {
    const bcrypt = await import('bcryptjs');
    return Promise.all(codes.map(code => bcrypt.hash(code.replace(/-/g, ''), 10)));
  }

  /**
   * Verify a backup code against hashed codes
   */
  async verifyHashedBackupCode(hashedCodes: string[], code: string): Promise<MFAVerificationResult> {
    const bcrypt = await import('bcryptjs');
    const normalizedCode = code.replace(/[-\s]/g, '');
    
    for (let i = 0; i < hashedCodes.length; i++) {
      const matches = await bcrypt.compare(normalizedCode, hashedCodes[i]);
      if (matches) {
        // Remove used code
        hashedCodes.splice(i, 1);
        return {
          valid: true,
          used: true,
        };
      }
    }

    return { valid: false };
  }

  /**
   * Validate MFA setup by verifying a test token
   */
  validateSetup(secret: string, token: string): boolean {
    const result = this.verifyTOTP(secret, token);
    return result.valid;
  }

  /**
   * Get remaining time for current TOTP code
   */
  getRemainingTime(): number {
    const now = Date.now();
    const period = this.TOTP_PERIOD * 1000;
    return period - (now % period);
  }
}

// Singleton instance
export const mfaService = new MFAService();
