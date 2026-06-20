/**
 * Security Headers Middleware for ArrowERA CMS
 * Applies defense-in-depth HTTP security headers to all responses.
 */

export interface SecurityHeadersConfig {
  /** Content-Security-Policy value */
  contentSecurityPolicy?: string | false;
  /** X-Frame-Options value */
  frameOptions?: 'DENY' | 'SAMEORIGIN' | false;
  /** X-Content-Type-Options */
  contentTypeOptions?: 'nosniff' | false;
  /** Strict-Transport-Security */
  strictTransportSecurity?: string | false;
  /** Referrer-Policy */
  referrerPolicy?: string | false;
  /** X-XSS-Protection */
  xssProtection?: string | false;
  /** Permissions-Policy */
  permissionsPolicy?: string | false;
  /** Cross-Origin-Embedder-Policy */
  crossOriginEmbedderPolicy?: string | false;
  /** Cross-Origin-Opener-Policy */
  crossOriginOpenerPolicy?: string | false;
  /** Cross-Origin-Resource-Policy */
  crossOriginResourcePolicy?: string | false;
}

export interface SecurityHeadersResult {
  /** Map of header name to header value */
  headers: Record<string, string>;
}

const DEFAULT_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https: wss:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/**
 * Security headers service for generating response headers
 */
export class SecurityHeaders {
  private readonly config: SecurityHeadersConfig;

  constructor(config: SecurityHeadersConfig = {}) {
    this.config = config;
  }

  /**
   * Generate all security headers as a record
   */
  generate(): SecurityHeadersResult {
    const headers: Record<string, string> = {};

    // Content-Security-Policy
    if (this.config.contentSecurityPolicy !== false) {
      headers['Content-Security-Policy'] = this.config.contentSecurityPolicy || DEFAULT_CSP;
    }

    // X-Frame-Options (clickjacking protection)
    if (this.config.frameOptions !== false) {
      headers['X-Frame-Options'] = this.config.frameOptions || 'DENY';
    }

    // X-Content-Type-Options (MIME sniffing protection)
    if (this.config.contentTypeOptions !== false) {
      headers['X-Content-Type-Options'] = this.config.contentTypeOptions || 'nosniff';
    }

    // Strict-Transport-Security (enforce HTTPS)
    if (this.config.strictTransportSecurity !== false) {
      headers['Strict-Transport-Security'] =
        this.config.strictTransportSecurity || 'max-age=31536000; includeSubDomains';
    }

    // Referrer-Policy
    if (this.config.referrerPolicy !== false) {
      headers['Referrer-Policy'] = this.config.referrerPolicy || 'strict-origin-when-cross-origin';
    }

    // X-XSS-Protection (legacy, but still useful for older browsers)
    if (this.config.xssProtection !== false) {
      headers['X-XSS-Protection'] = this.config.xssProtection || '1; mode=block';
    }

    // Permissions-Policy (restrict browser features)
    if (this.config.permissionsPolicy !== false) {
      headers['Permissions-Policy'] =
        this.config.permissionsPolicy ||
        [
          'camera=()',
          'microphone=()',
          'geolocation=(self)',
          'payment=()',
          'usb=()',
        ].join(', ');
    }

    // Cross-Origin-Embedder-Policy
    if (this.config.crossOriginEmbedderPolicy !== false) {
      headers['Cross-Origin-Embedder-Policy'] =
        this.config.crossOriginEmbedderPolicy || 'require-corp';
    }

    // Cross-Origin-Opener-Policy
    if (this.config.crossOriginOpenerPolicy !== false) {
      headers['Cross-Origin-Opener-Policy'] =
        this.config.crossOriginOpenerPolicy || 'same-origin';
    }

    // Cross-Origin-Resource-Policy
    if (this.config.crossOriginResourcePolicy !== false) {
      headers['Cross-Origin-Resource-Policy'] =
        this.config.crossOriginResourcePolicy || 'same-origin';
    }

    return { headers };
  }

  /**
   * Create middleware that applies security headers to every response
   */
  createMiddleware() {
    const self = this;

    return function securityHeadersMiddleware(
      _req: unknown,
      res: { setHeader?: (name: string, value: string) => void },
      next: () => void,
    ): void {
      const { headers } = self.generate();

      if (res.setHeader) {
        for (const [name, value] of Object.entries(headers)) {
          res.setHeader(name, value);
        }
      }

      next();
    };
  }
}

/**
 * Pre-configured security headers for development
 */
export const developmentSecurityHeaders = new SecurityHeaders({
  strictTransportSecurity: false, // Disabled for localhost
  contentSecurityPolicy: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' http://localhost:* ws://localhost:* https: wss:",
    "frame-ancestors 'self'",
  ].join('; '),
});

/**
 * Pre-configured security headers for production
 */
export const productionSecurityHeaders = new SecurityHeaders();
