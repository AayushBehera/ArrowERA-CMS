import { randomBytes, createHash } from 'crypto';

interface SessionData {
  userId: string;
  createdAt: number;
  expiresAt: number;
  userAgent?: string;
  ip?: string;
}

export class SessionManager {
  private sessions: Map<string, SessionData> = new Map();
  private readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly TOKEN_LENGTH = 32;

  async createSession(userId: string, userAgent?: string, ip?: string): Promise<string> {
    // Use cryptographically secure random bytes
    const token = randomBytes(this.TOKEN_LENGTH).toString('hex');
    
    const sessionData: SessionData = {
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION,
      userAgent,
      ip
    };
    
    // Store session hash instead of raw token for security
    const tokenHash = this.hashToken(token);
    this.sessions.set(tokenHash, sessionData);
    
    console.log(`[Session] Created session for user ${userId}`);
    return token;
  }
  
  async verifySession(token: string): Promise<{ valid: boolean; userId?: string }> {
    if (!token || typeof token !== 'string') {
      return { valid: false };
    }
    
    const tokenHash = this.hashToken(token);
    const session = this.sessions.get(tokenHash);
    
    if (!session) {
      return { valid: false };
    }
    
    // Check expiration
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(tokenHash);
      return { valid: false };
    }
    
    // Optionally extend session on activity
    session.expiresAt = Date.now() + this.SESSION_DURATION;
    this.sessions.set(tokenHash, session);
    
    return { valid: true, userId: session.userId };
  }
  
  async revokeSession(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    this.sessions.delete(tokenHash);
  }
  
  async revokeAllUserSessions(userId: string): Promise<void> {
    for (const [hash, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(hash);
      }
    }
  }
  
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
  
  // Cleanup expired sessions periodically
  startCleanup(intervalMs: number = 60 * 60 * 1000): void {
    setInterval(() => {
      const now = Date.now();
      for (const [hash, session] of this.sessions.entries()) {
        if (now > session.expiresAt) {
          this.sessions.delete(hash);
        }
      }
    }, intervalMs);
  }
}
