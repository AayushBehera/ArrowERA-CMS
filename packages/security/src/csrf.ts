/**
 * CSRF Protection for ArrowERA CMS
 * Implements the double-submit cookie pattern for stateless CSRF protection.
 */

import { randomBytes, timingSafeEqual } from 'node:crypto';

export interface CsrfConfig {
  /** Cookie name for the CSRF token */
  cookieName?: string;
  /** Header name to read the CSRF token from */
  headerName?: string;
  /** Token length in bytes (before hex encoding) */
  tokenLength?: number;
  /** Cookie options */
  cookieOptions?: CsrfCookieOptions;
  /** Paths to exclude from CSRF protection */
  excludePaths?: string[];
}

export interface CsrfCookieOptions {
  /** Whether the cookie is HTTP-only */
  httpOnly?: boolean;
  /** Whether the cookie is secure (HTTPS only) */
  secure?: boolean;
  /** SameSite policy */
  sameSite?: 'strict' | 'lax' | 'none';
  /** Cookie path */
  path?: string;
  /** Cookie max age in seconds */
  maxAge?: number;
}

export interface CsrfResult {
  /** Whether CSRF validation passed */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
}

/**
 * CSRF Protection using double-submit cookie pattern
 */
export class CsrfProtection {
  private readonly config: Required<Omit<CsrfConfig, 'excludePaths' | 'cookieOptions'>> & {
    excludePaths: string[];
    cookieOptions: Required<NonNullable<CsrfConfig['cookieOptions']>>;
  };

  constructor(config: CsrfConfig = {}) {
    this.config = {
      cookieName: config.cookieName || 'x-csrf-token',
      headerName: config.headerName || 'x-csrf-token',
      tokenLength: config.tokenLength || 32,
      excludePaths: config.excludePaths || [],
      cookieOptions: {
        httpOnly: config.cookieOptions?.httpOnly ?? false,
        secure: config.cookieOptions?.secure ?? true,
        sameSite: config.cookieOptions?.sameSite ?? 'strict',
        path: config.cookieOptions?.path || '/',
        maxAge: config.cookieOptions?.maxAge ?? 86400,
      },
    };
  }

  /**
   * Generate a cryptographically secure CSRF token
   */
  generateToken(): string {
    return randomBytes(this.config.tokenLength).toString('hex');
  }

  /**
   * Generate the Set-Cookie header value for CSRF token
   */
  generateCookieHeader(token: string): string {
    const parts: string[] = [
      `${this.config.cookieName}=${token}`,
      `Path=${this.config.cookieOptions.path}`,
      `Max-Age=${this.config.cookieOptions.maxAge}`,
      `SameSite=${capitalize(this.config.cookieOptions.sameSite)}`,
    ];

    if (this.config.cookieOptions.httpOnly) {
      parts.push('HttpOnly');
    }

    if (this.config.cookieOptions.secure) {
      parts.push('Secure');
    }

    return parts.join('; ');
  }

  /**
   * Validate CSRF token from cookie and header
   */
  validateToken(cookieToken: string | undefined, headerToken: string | undefined): CsrfResult {
    if (!cookieToken) {
      return { valid: false, error: 'CSRF cookie not found' };
    }

    if (!headerToken) {
      return { valid: false, error: 'CSRF header not found' };
    }

    if (cookieToken.length !== headerToken.length) {
      return { valid: false, error: 'CSRF token mismatch' };
    }

    try {
      const cookieBuf = Buffer.from(cookieToken);
      const headerBuf = Buffer.from(headerToken);

      if (!timingSafeEqual(cookieBuf, headerBuf)) {
        return { valid: false, error: 'CSRF token mismatch' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'CSRF token validation failed' };
    }
  }

  /**
   * Check if a path should be excluded from CSRF protection
   */
  isPathExcluded(path: string): boolean {
    return this.config.excludePaths.some(
      (excluded) => path === excluded || path.startsWith(excluded),
    );
  }

  /**
   * Create a CSRF middleware function
   */
  createMiddleware() {
    const self = this;

    return function csrfMiddleware(
      req: {
        method?: string;
        path?: string;
        url?: string;
        cookies?: Record<string, string>;
        headers?: Record<string, string>;
      },
      res: {
        setHeader?: (name: string, value: string) => void;
        status?: (code: number) => { json: (body: unknown) => unknown };
        statusCode?: number;
      },
      next: () => void,
    ): void {
      const method = (req.method || 'GET').toUpperCase();
      const path = req.path || req.url || '/';

      // Only validate state-changing methods
      const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
      if (safeMethods.includes(method)) {
        // Generate and set CSRF token on safe requests
        const token = self.generateToken();
        const cookieHeader = self.generateCookieHeader(token);

        if (res.setHeader) {
          res.setHeader('Set-Cookie', cookieHeader);
        }

        // Also expose via header for SPA clients
        if (res.setHeader) {
          res.setHeader(self.config.headerName, token);
        }

        next();
        return;
      }

      // Skip excluded paths
      if (self.isPathExcluded(path)) {
        next();
        return;
      }

      // Validate CSRF for state-changing methods
      const cookieToken = req.cookies?.[self.config.cookieName];
      const headerToken = req.headers?.[self.config.headerName];

      const result = self.validateToken(cookieToken, headerToken);

      if (!result.valid) {
        if (res.status) {
          res.status(403).json({
            code: 'CSRF_INVALID',
            message: result.error || 'CSRF validation failed',
            status: 403,
            timestamp: new Date().toISOString(),
          });
        }
        return;
      }

      next();
    };
  }
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
