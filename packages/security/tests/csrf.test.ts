import { describe, it, expect, beforeEach } from 'vitest';
import { CsrfProtection } from '../src/csrf';

describe('CsrfProtection', () => {
  let csrf: CsrfProtection;

  beforeEach(() => {
    csrf = new CsrfProtection();
  });

  describe('generateToken', () => {
    it('should generate a hex token of correct length', () => {
      const token = csrf.generateToken();
      // 32 bytes = 64 hex characters
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate unique tokens each time', () => {
      const token1 = csrf.generateToken();
      const token2 = csrf.generateToken();
      expect(token1).not.toBe(token2);
    });

    it('should respect custom token length', () => {
      const csrf16 = new CsrfProtection({ tokenLength: 16 });
      const token = csrf16.generateToken();
      expect(token).toMatch(/^[a-f0-9]{32}$/); // 16 bytes = 32 hex
    });
  });

  describe('generateCookieHeader', () => {
    it('should generate a valid Set-Cookie header', () => {
      const token = csrf.generateToken();
      const header = csrf.generateCookieHeader(token);

      expect(header).toContain('x-csrf-token=');
      expect(header).toContain('Path=/');
      expect(header).toContain('Max-Age=86400');
      expect(header).toContain('SameSite=Strict');
      expect(header).toContain('Secure');
    });

    it('should use custom cookie name', () => {
      const custom = new CsrfProtection({ cookieName: 'custom-csrf' });
      const header = custom.generateCookieHeader('test-token');
      expect(header).toContain('custom-csrf=test-token');
    });

    it('should include HttpOnly when configured', () => {
      const httpOnly = new CsrfProtection({
        cookieOptions: { httpOnly: true },
      });
      const header = httpOnly.generateCookieHeader('test');
      expect(header).toContain('HttpOnly');
    });

    it('should support lax SameSite', () => {
      const lax = new CsrfProtection({
        cookieOptions: { sameSite: 'lax' },
      });
      const header = lax.generateCookieHeader('test');
      expect(header).toContain('SameSite=Lax');
    });

    it('should support custom max age', () => {
      const custom = new CsrfProtection({
        cookieOptions: { maxAge: 3600 },
      });
      const header = custom.generateCookieHeader('test');
      expect(header).toContain('Max-Age=3600');
    });
  });

  describe('validateToken', () => {
    it('should validate matching tokens', () => {
      const token = csrf.generateToken();
      const result = csrf.validateToken(token, token);
      expect(result.valid).toBe(true);
    });

    it('should reject non-matching tokens', () => {
      const token = csrf.generateToken();
      const otherToken = csrf.generateToken();
      const result = csrf.validateToken(token, otherToken);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject missing cookie token', () => {
      const result = csrf.validateToken(undefined, 'header-token');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('CSRF cookie not found');
    });

    it('should reject missing header token', () => {
      const result = csrf.validateToken('cookie-token', undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('CSRF header not found');
    });

    it('should reject tokens of different lengths', () => {
      const result = csrf.validateToken('abc', 'def123');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('CSRF token mismatch');
    });
  });

  describe('isPathExcluded', () => {
    it('should identify excluded paths', () => {
      const csrf = new CsrfProtection({
        excludePaths: ['/api/webhooks', '/api/health'],
      });
      expect(csrf.isPathExcluded('/api/webhooks')).toBe(true);
      expect(csrf.isPathExcluded('/api/webhooks/stripe')).toBe(true);
      expect(csrf.isPathExcluded('/api/health')).toBe(true);
      expect(csrf.isPathExcluded('/api/users')).toBe(false);
    });

    it('should return false when no paths excluded', () => {
      expect(csrf.isPathExcluded('/api/any')).toBe(false);
    });
  });

  describe('createMiddleware', () => {
    it('should pass through GET requests and set tokens', () => {
      const middleware = csrf.createMiddleware();
      const mockRes: { setHeader: (name: string, value: string) => void; headers: Record<string, string>; status?: (code: number) => { json: (body: unknown) => unknown } } = {
        setHeader(name: string, value: string) {
          this.headers[name] = value;
        },
        headers: {},
      };

      let nextCalled = false;
      middleware(
        { method: 'GET', path: '/api/test', cookies: {}, headers: {} },
        mockRes,
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(true);
      expect(mockRes.headers['Set-Cookie']).toBeDefined();
      expect(mockRes.headers['x-csrf-token']).toBeDefined();
    });

    it('should pass through HEAD requests', () => {
      const middleware = csrf.createMiddleware();
      let nextCalled = false;

      middleware(
        { method: 'HEAD', path: '/api/test', cookies: {}, headers: {} },
        { setHeader: () => {} },
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(true);
    });

    it('should pass through OPTIONS requests', () => {
      const middleware = csrf.createMiddleware();
      let nextCalled = false;

      middleware(
        { method: 'OPTIONS', path: '/api/test', cookies: {}, headers: {} },
        { setHeader: () => {} },
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(true);
    });

    it('should block POST without valid CSRF tokens', () => {
      const middleware = csrf.createMiddleware();
      let nextCalled = false;
      const mockRes: { statusCode?: number; body?: unknown; setHeader?: (name: string, value: string) => void; status: (code: number) => { json: (body: unknown) => unknown } } = {
        status(code: number) {
          this.statusCode = code;
          return {
            json: (body: unknown) => {
              mockRes.body = body;
              return body;
            },
          };
        },
      };

      middleware(
        { method: 'POST', path: '/api/test', cookies: {}, headers: {} },
        mockRes,
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(false);
      expect(mockRes.statusCode).toBe(403);
      expect((mockRes.body as Record<string, unknown>)?.code).toBe('CSRF_INVALID');
    });

    it('should skip excluded paths for POST requests', () => {
      const csrf = new CsrfProtection({ excludePaths: ['/api/webhooks'] });
      const middleware = csrf.createMiddleware();
      let nextCalled = false;

      middleware(
        { method: 'POST', path: '/api/webhooks/stripe', cookies: {}, headers: {} },
        { setHeader: () => {} },
        () => { nextCalled = true; },
      );

      expect(nextCalled).toBe(true);
    });
  });
});
