import { describe, it, expect } from 'vitest';
import { SecurityHeaders, developmentSecurityHeaders, productionSecurityHeaders } from '../src/security-headers';

describe('SecurityHeaders', () => {
  describe('generate', () => {
    it('should generate default security headers', () => {
      const security = new SecurityHeaders();
      const { headers } = security.generate();

      expect(headers['Content-Security-Policy']).toBeDefined();
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Permissions-Policy']).toBeDefined();
      expect(headers['Cross-Origin-Embedder-Policy']).toBe('require-corp');
      expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
      expect(headers['Cross-Origin-Resource-Policy']).toBe('same-origin');
    });

    it('should allow disabling individual headers', () => {
      const security = new SecurityHeaders({
        frameOptions: false,
        strictTransportSecurity: false,
        xssProtection: false,
      });
      const { headers } = security.generate();

      expect(headers['X-Frame-Options']).toBeUndefined();
      expect(headers['Strict-Transport-Security']).toBeUndefined();
      expect(headers['X-XSS-Protection']).toBeUndefined();
      expect(headers['X-Content-Type-Options']).toBe('nosniff'); // Still present
    });

    it('should allow custom CSP value', () => {
      const customCsp = "default-src 'none'";
      const security = new SecurityHeaders({ contentSecurityPolicy: customCsp });
      const { headers } = security.generate();

      expect(headers['Content-Security-Policy']).toBe(customCsp);
    });

    it('should allow custom frame options', () => {
      const security = new SecurityHeaders({ frameOptions: 'SAMEORIGIN' });
      const { headers } = security.generate();

      expect(headers['X-Frame-Options']).toBe('SAMEORIGIN');
    });

    it('should allow custom referrer policy', () => {
      const security = new SecurityHeaders({ referrerPolicy: 'no-referrer' });
      const { headers } = security.generate();

      expect(headers['Referrer-Policy']).toBe('no-referrer');
    });

    it('should allow custom permissions policy', () => {
      const security = new SecurityHeaders({ permissionsPolicy: 'camera=(), geolocation=()' });
      const { headers } = security.generate();

      expect(headers['Permissions-Policy']).toBe('camera=(), geolocation=()');
    });

    it('should allow custom cross-origin policies', () => {
      const security = new SecurityHeaders({
        crossOriginEmbedderPolicy: 'unsafe-none',
        crossOriginOpenerPolicy: 'unsafe-none',
        crossOriginResourcePolicy: 'cross-origin',
      });
      const { headers } = security.generate();

      expect(headers['Cross-Origin-Embedder-Policy']).toBe('unsafe-none');
      expect(headers['Cross-Origin-Opener-Policy']).toBe('unsafe-none');
      expect(headers['Cross-Origin-Resource-Policy']).toBe('cross-origin');
    });

    it('should return headers as a record', () => {
      const security = new SecurityHeaders();
      const result = security.generate();
      expect(result.headers).toBeDefined();
      expect(typeof result.headers).toBe('object');
    });
  });

  describe('createMiddleware', () => {
    it('should set headers on response', () => {
      const security = new SecurityHeaders();
      const middleware = security.createMiddleware();

      const mockRes: { headers: Record<string, string>; setHeader: (name: string, value: string) => void } = {
        headers: {},
        setHeader(name: string, value: string) {
          this.headers[name] = value;
        },
      };

      let nextCalled = false;
      middleware({}, mockRes, () => { nextCalled = true; });

      expect(nextCalled).toBe(true);
      expect(mockRes.headers['X-Frame-Options']).toBe('DENY');
      expect(mockRes.headers['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should handle response without setHeader', () => {
      const security = new SecurityHeaders();
      const middleware = security.createMiddleware();

      let nextCalled = false;
      expect(() => {
        middleware({}, {}, () => { nextCalled = true; });
      }).not.toThrow();
      expect(nextCalled).toBe(true);
    });
  });

  describe('developmentSecurityHeaders', () => {
    it('should disable HSTS in development', () => {
      const { headers } = developmentSecurityHeaders.generate();
      expect(headers['Strict-Transport-Security']).toBeUndefined();
    });

    it('should allow localhost in CSP for development', () => {
      const { headers } = developmentSecurityHeaders.generate();
      expect(headers['Content-Security-Policy']).toContain('localhost');
    });
  });

  describe('productionSecurityHeaders', () => {
    it('should enable HSTS in production', () => {
      const { headers } = productionSecurityHeaders.generate();
      expect(headers['Strict-Transport-Security']).toBeDefined();
      expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
    });
  });
});
