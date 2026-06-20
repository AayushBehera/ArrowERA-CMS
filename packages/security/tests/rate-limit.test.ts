import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RateLimiter } from '../src/rate-limit';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within the limit', () => {
      const result = limiter.checkRateLimit('user-1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it('should block requests exceeding the limit', () => {
      for (let i = 0; i < 100; i++) {
        limiter.checkRateLimit('user-1');
      }
      const result = limiter.checkRateLimit('user-1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after the time window expires', () => {
      for (let i = 0; i < 100; i++) {
        limiter.checkRateLimit('user-1');
      }
      // Advance time past the window
      vi.advanceTimersByTime(61 * 1000);

      const result = limiter.checkRateLimit('user-1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it('should isolate different identifiers', () => {
      for (let i = 0; i < 100; i++) {
        limiter.checkRateLimit('user-1');
      }
      // User-2 should still be allowed
      const result = limiter.checkRateLimit('user-2');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it('should support endpoint-specific configurations', () => {
      limiter.configure('/api/login', { windowMs: 1000, maxRequests: 3 });

      for (let i = 0; i < 3; i++) {
        limiter.checkRateLimit('user-1', '/api/login');
      }
      const result = limiter.checkRateLimit('user-1', '/api/login');
      expect(result.allowed).toBe(false);
    });

    it('should use default config for unconfigured endpoints', () => {
      limiter.configure('/api/login', { windowMs: 1000, maxRequests: 3 });

      for (let i = 0; i < 100; i++) {
        limiter.checkRateLimit('user-1', '/api/data');
      }
      const result = limiter.checkRateLimit('user-1', '/api/data');
      expect(result.allowed).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return remaining and limit for new identifier', () => {
      const status = limiter.getStatus('new-user');
      expect(status.remaining).toBe(100);
      expect(status.limit).toBe(100);
      expect(status.resetAt).toBeGreaterThan(0);
    });

    it('should reflect used capacity', () => {
      limiter.checkRateLimit('user-1');
      limiter.checkRateLimit('user-1');
      const status = limiter.getStatus('user-1');
      expect(status.remaining).toBe(98);
    });

    it('should show 0 remaining when exhausted', () => {
      for (let i = 0; i < 100; i++) {
        limiter.checkRateLimit('user-1');
      }
      const status = limiter.getStatus('user-1');
      expect(status.remaining).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear rate limit for a specific identifier', () => {
      for (let i = 0; i < 100; i++) {
        limiter.checkRateLimit('user-1');
      }
      limiter.reset('user-1');
      const result = limiter.checkRateLimit('user-1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });
  });

  describe('cleanup', () => {
    it('should clean up expired records', () => {
      limiter.checkRateLimit('user-1');
      limiter.startCleanup(1000);

      // After window expires, cleanup should remove the record
      vi.advanceTimersByTime(61 * 1000);
      // Run cleanup interval
      vi.advanceTimersByTime(2000);

      // User-1 should be treated as new
      const result = limiter.checkRateLimit('user-1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });
  });
});
