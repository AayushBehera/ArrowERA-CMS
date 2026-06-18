interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 60 * 1000,    // 1 minute
    maxRequests: 100        // 100 requests per minute
  };

  private configs: Map<string, RateLimitConfig> = new Map();

  /**
   * Configure rate limiting for a specific endpoint or route
   */
  configure(endpoint: string, config: RateLimitConfig): void {
    this.configs.set(endpoint, config);
  }

  /**
   * Check if request is within rate limit
   * Returns { allowed: true } if allowed, { allowed: false, retryAfter } if limited
   */
  checkRateLimit(identifier: string, endpoint?: string): { allowed: boolean; retryAfter?: number; remaining?: number } {
    const config = endpoint ? (this.configs.get(endpoint) || this.defaultConfig) : this.defaultConfig;
    const now = Date.now();
    
    let record = this.records.get(identifier);
    
    // Initialize or reset expired record
    if (!record || now > record.resetAt) {
      record = {
        count: 0,
        resetAt: now + config.windowMs
      };
    }
    
    // Increment counter
    record.count++;
    this.records.set(identifier, record);
    
    // Calculate remaining requests
    const remaining = Math.max(0, config.maxRequests - record.count);
    
    if (record.count > config.maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return { allowed: false, retryAfter, remaining: 0 };
    }
    
    return { allowed: true, remaining };
  }

  /**
   * Get current rate limit status without incrementing counter
   */
  getStatus(identifier: string, endpoint?: string): { remaining: number; resetAt: number; limit: number } {
    const config = endpoint ? (this.configs.get(endpoint) || this.defaultConfig) : this.defaultConfig;
    const record = this.records.get(identifier);
    const now = Date.now();
    
    if (!record || now > record.resetAt) {
      return {
        remaining: config.maxRequests,
        resetAt: now + config.windowMs,
        limit: config.maxRequests
      };
    }
    
    return {
      remaining: Math.max(0, config.maxRequests - record.count),
      resetAt: record.resetAt,
      limit: config.maxRequests
    };
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string): void {
    this.records.delete(identifier);
  }

  /**
   * Cleanup expired records periodically
   */
  startCleanup(intervalMs: number = 60 * 1000): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.records.entries()) {
        if (now > record.resetAt) {
          this.records.delete(key);
        }
      }
    }, intervalMs);
  }
}

// Legacy function wrapper for backward compatibility
export const checkRateLimit = (ip: string): boolean => {
  const limiter = new RateLimiter();
  return limiter.checkRateLimit(ip).allowed;
};
