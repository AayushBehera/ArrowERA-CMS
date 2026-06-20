import { describe, it, expect, beforeEach } from 'vitest';
import { ApiKeyManager } from '../src/api-keys';

describe('ApiKeyManager', () => {
  let manager: ApiKeyManager;

  beforeEach(() => {
    manager = new ApiKeyManager();
  });

  describe('generateApiKey', () => {
    it('should generate a key with the correct prefix', async () => {
      const { key, keyId } = await manager.generateApiKey('user-1', 'Test Key', ['read']);
      expect(key).toMatch(/^emdk_[a-f0-9]{64}$/);
      expect(keyId).toBeDefined();
      expect(keyId.length).toBe(16);
    });

    it('should generate unique keys each time', async () => {
      const key1 = await manager.generateApiKey('user-1', 'Key 1', ['read']);
      const key2 = await manager.generateApiKey('user-1', 'Key 2', ['read']);
      expect(key1.key).not.toBe(key2.key);
      expect(key1.keyId).not.toBe(key2.keyId);
    });

    it('should accept expiration timestamp', async () => {
      const futureExpiry = Date.now() + 86400000; // 1 day
      const { key } = await manager.generateApiKey('user-1', 'Expiring Key', ['read'], futureExpiry);
      expect(key).toMatch(/^emdk_/);
    });
  });

  describe('validateApiKey', () => {
    it('should validate a valid key', async () => {
      const { key } = await manager.generateApiKey('user-1', 'Valid Key', ['read']);
      const result = manager.validateApiKey(key);
      expect(result.valid).toBe(true);
      expect(result.userId).toBe('user-1');
      expect(result.scopes).toEqual(['read']);
    });

    it('should reject an invalid key', () => {
      const result = manager.validateApiKey('invalid_key_here');
      expect(result.valid).toBe(false);
    });

    it('should reject a key without the correct prefix', () => {
      const result = manager.validateApiKey('bad_prefix_abc123');
      expect(result.valid).toBe(false);
    });

    it('should reject an empty key', () => {
      const result = manager.validateApiKey('');
      expect(result.valid).toBe(false);
    });

    it('should reject a key with empty string', () => {
      const result = manager.validateApiKey('');
      expect(result.valid).toBe(false);
    });

    it('should validate scope requirements', async () => {
      const { key } = await manager.generateApiKey('user-1', 'Read Key', ['read']);
      // Requires 'write' scope but key only has 'read'
      const result = manager.validateApiKey(key, 'write');
      expect(result.valid).toBe(false);
    });

    it('should accept wildcard scope', async () => {
      const { key } = await manager.generateApiKey('user-1', 'Admin Key', ['*']);
      const result = manager.validateApiKey(key, 'admin');
      expect(result.valid).toBe(true);
    });

    it('should accept matching scope', async () => {
      const { key } = await manager.generateApiKey('user-1', 'ReadWrite Key', ['read', 'write']);
      const result = manager.validateApiKey(key, 'read');
      expect(result.valid).toBe(true);
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke a valid key', async () => {
      const { key, keyId } = await manager.generateApiKey('user-1', 'Revocable Key', ['read']);
      const revoked = await manager.revokeApiKey(keyId);
      expect(revoked).toBe(true);

      // Key should no longer be valid
      const result = manager.validateApiKey(key);
      expect(result.valid).toBe(false);
    });

    it('should return false for non-existent key ID', async () => {
      const result = await manager.revokeApiKey('nonexistent-id');
      expect(result).toBe(false);
    });
  });

  describe('listUserApiKeys', () => {
    it('should list all keys for a user', async () => {
      await manager.generateApiKey('user-1', 'Key A', ['read']);
      await manager.generateApiKey('user-1', 'Key B', ['write']);
      await manager.generateApiKey('user-2', 'Key C', ['read']);

      const user1Keys = manager.listUserApiKeys('user-1');
      expect(user1Keys.length).toBe(2);
      expect(user1Keys.map((k) => k.name)).toContain('Key A');
      expect(user1Keys.map((k) => k.name)).toContain('Key B');
    });

    it('should not include revoked keys', async () => {
      const { keyId } = await manager.generateApiKey('user-1', 'Revoked Key', ['read']);
      await manager.revokeApiKey(keyId);

      const keys = manager.listUserApiKeys('user-1');
      expect(keys.length).toBe(0);
    });

    it('should return empty array for user with no keys', () => {
      const keys = manager.listUserApiKeys('nonexistent-user');
      expect(keys).toEqual([]);
    });
  });

  describe('rotateApiKey', () => {
    it('should rotate a key (revoke old, create new)', async () => {
      const { key: oldKey, keyId } = await manager.generateApiKey('user-1', 'Rotatable', ['read']);
      const result = await manager.rotateApiKey(keyId, 'Rotated Key', ['read', 'write']);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.key).not.toBe(oldKey);
        expect(result.keyId).not.toBe(keyId);
        expect(result.key).toMatch(/^emdk_/);
      }

      // Old key should be invalid
      expect(manager.validateApiKey(oldKey).valid).toBe(false);

      // New key should be valid
      if (result) {
        const validateResult = manager.validateApiKey(result.key);
        expect(validateResult.valid).toBe(true);
        expect(validateResult.scopes).toContain('write');
      }
    });

    it('should return null for non-existent key ID', async () => {
      const result = await manager.rotateApiKey('nonexistent', 'New', ['read']);
      expect(result).toBeNull();
    });
  });
});
