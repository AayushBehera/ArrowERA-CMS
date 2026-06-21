import { createHash, randomBytes, timingSafeEqual } from 'crypto';

interface ApiKeyRecord {
  keyHash: string;
  userId: string;
  name: string;
  scopes: string[];
  createdAt: number;
  lastUsedAt?: number;
  expiresAt?: number;
  revoked: boolean;
}

export class ApiKeyManager {
  private apiKeys: Map<string, ApiKeyRecord> = new Map();
  private readonly KEY_PREFIX = 'emdk_';
  private readonly KEY_LENGTH = 32;

  /**
   * Generate a new API key with proper entropy and store its hash
   */
  async generateApiKey(userId: string, name: string, scopes: string[], expiresAt?: number): Promise<{ key: string; keyId: string }> {
    // Generate cryptographically secure random bytes
    const randomPart = randomBytes(this.KEY_LENGTH).toString('hex');
    const fullKey = `${this.KEY_PREFIX}${randomPart}`;
    
    // Create a hash for storage (never store the raw key)
    const keyHash = this.hashKey(fullKey);
    const keyId = this.generateKeyId(keyHash);
    
    const record: ApiKeyRecord = {
      keyHash,
      userId,
      name,
      scopes,
      createdAt: Date.now(),
      expiresAt,
      revoked: false
    };
    
    this.apiKeys.set(keyId, record);
    
    console.log(`[Security] Generated API key "${name}" for user ${userId}`);
    
    // Return the full key only once - it cannot be retrieved later
    return { key: fullKey, keyId };
  }

  /**
   * Validate an API key and check permissions
   */
  validateApiKey(key: string, requiredScope?: string): { valid: boolean; userId?: string; scopes?: string[] } {
    if (!key || typeof key !== 'string' || !key.startsWith(this.KEY_PREFIX)) {
      return { valid: false };
    }

    const keyHash = this.hashKey(key);
    
    // Find the key record by searching (in production, use keyHash as map key)
    let record: ApiKeyRecord | undefined;
    for (const [keyId, rec] of this.apiKeys.entries()) {
      if (rec.keyHash === keyHash) {
        record = rec;
        break;
      }
    }

    if (!record || record.revoked) {
      return { valid: false };
    }

    // Check expiration
    if (record.expiresAt && Date.now() > record.expiresAt) {
      return { valid: false };
    }

    // Check scope if required
    if (requiredScope && !record.scopes.includes(requiredScope) && !record.scopes.includes('*')) {
      return { valid: false };
    }

    // Update last used timestamp
    record.lastUsedAt = Date.now();
    const keyId = this.findKeyId(keyHash);
    if (keyId) {
      this.apiKeys.set(keyId, record);
    }

    return { valid: true, userId: record.userId, scopes: record.scopes };
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: string): Promise<boolean> {
    const record = this.apiKeys.get(keyId);
    if (!record) {
      return false;
    }
    record.revoked = true;
    this.apiKeys.set(keyId, record);
    console.log(`[Security] Revoked API key ${keyId}`);
    return true;
  }

  /**
   * List all API keys for a user (without exposing the actual keys)
   */
  listUserApiKeys(userId: string): Array<{ keyId: string; name: string; scopes: string[]; createdAt: number; lastUsedAt?: number }> {
    const result: Array<{ keyId: string; name: string; scopes: string[]; createdAt: number; lastUsedAt?: number }> = [];
    
    for (const [keyId, record] of this.apiKeys.entries()) {
      if (record.userId === userId && !record.revoked) {
        result.push({
          keyId,
          name: record.name,
          scopes: record.scopes,
          createdAt: record.createdAt,
          lastUsedAt: record.lastUsedAt
        });
      }
    }
    
    return result;
  }

  /**
   * Rotate an API key - revoke old one and create new one
   */
  async rotateApiKey(keyId: string, name: string, scopes: string[], expiresAt?: number): Promise<{ key: string; keyId: string } | null> {
    const oldRecord = this.apiKeys.get(keyId);
    if (!oldRecord) {
      return null;
    }

    // Revoke old key
    oldRecord.revoked = true;
    this.apiKeys.set(keyId, oldRecord);

    // Generate new key
    return this.generateApiKey(oldRecord.userId, name, scopes, expiresAt);
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  private generateKeyId(hash: string): string {
    // Use first 16 chars of hash as key ID
    return hash.substring(0, 16);
  }

  private findKeyId(keyHash: string): string | undefined {
    for (const [keyId, record] of this.apiKeys.entries()) {
      if (record.keyHash === keyHash) {
        return keyId;
      }
    }
    return undefined;
  }
}

// Legacy function wrapper for backward compatibility
export const validateApiKey = (key: string): boolean => {
  const manager = new ApiKeyManager();
  return manager.validateApiKey(key).valid;
};
