import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { db } from '@arrowera/db';
import { sessions, devices, users } from '@arrowera/db/schema';
import { randomBytes, createHash } from 'crypto';
import type { Session, CreateSessionInput, SessionWithUser } from './session.types';

export class SessionService {
  private static readonly TOKEN_LENGTH = 64;
  private static readonly REFRESH_TOKEN_LENGTH = 64;
  private static readonly SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

  /**
   * Hash a token for secure storage
   */
  private static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate a secure random token
   */
  private static generateToken(length: number = this.TOKEN_LENGTH): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Create a new session for a user
   */
  static async createSession(input: CreateSessionInput): Promise<{ session: Session; token: string; refreshToken: string }> {
    const token = this.generateToken();
    const refreshToken = this.generateToken(this.REFRESH_TOKEN_LENGTH);
    const tokenHash = this.hashToken(token);
    const refreshTokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + this.SESSION_EXPIRY);

    const [session] = await db
      .insert(sessions)
      .values({
        userId: input.userId,
        tokenHash,
        refreshTokenHash,
        expiresAt,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceId: input.deviceId,
      })
      .returning();

    if (!session) {
      throw new Error('Failed to create session');
    }

    // Update user's last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, input.userId));

    return {
      session: this.mapToSession(session),
      token,
      refreshToken,
    };
  }

  /**
   * Validate a session token
   */
  static async validateSession(token: string): Promise<SessionWithUser | null> {
    const tokenHash = this.hashToken(token);

    const [session] = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .leftJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, tokenHash),
          eq(sessions.isRevoked, false),
          gte(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) {
      return null;
    }

    // Update last active time
    await db
      .update(sessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(sessions.id, session.session.id));

    return {
      ...this.mapToSession(session.session),
      user: session.user,
    };
  }

  /**
   * Refresh a session using refresh token
   */
  static async refreshSession(refreshToken: string): Promise<{ session: Session; token: string; refreshToken: string } | null> {
    const refreshTokenHash = this.hashToken(refreshToken);

    const [existingSession] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.refreshTokenHash, refreshTokenHash),
          eq(sessions.isRevoked, false),
          gte(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!existingSession) {
      return null;
    }

    // Revoke old session
    await db.update(sessions).set({ isRevoked: true, revokedAt: new Date(), revokeReason: 'refreshed' }).where(eq(sessions.id, existingSession.id));

    // Create new session
    return this.createSession({
      userId: existingSession.userId,
      ipAddress: existingSession.ipAddress,
      userAgent: existingSession.userAgent,
      deviceId: existingSession.deviceId,
    });
  }

  /**
   * Revoke a session
   */
  static async revokeSession(sessionId: string, reason?: string): Promise<void> {
    await db
      .update(sessions)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
        revokeReason: reason,
      })
      .where(eq(sessions.id, sessionId));
  }

  /**
   * Revoke all sessions for a user
   */
  static async revokeAllSessions(userId: string, reason?: string): Promise<void> {
    await db
      .update(sessions)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
        revokeReason: reason,
      })
      .where(and(eq(sessions.userId, userId), eq(sessions.isRevoked, false)));
  }

  /**
   * Get all active sessions for a user
   */
  static async getUserSessions(userId: string): Promise<Session[]> {
    const userSessions = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.isRevoked, false), gte(sessions.expiresAt, new Date())))
      .orderBy(desc(sessions.createdAt));

    return userSessions.map((s) => this.mapToSession(s));
  }

  /**
   * Get session by ID
   */
  static async getSessionById(sessionId: string): Promise<SessionWithUser | null> {
    const [session] = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .leftJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!session) {
      return null;
    }

    return {
      ...this.mapToSession(session.session),
      user: session.user,
    };
  }

  /**
   * Clean up expired sessions
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const result = await db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
    return result.rowCount || 0;
  }

  /**
   * Map database row to Session type
   */
  private static mapToSession(row: typeof sessions.$inferSelect): Session {
    return {
      id: row.id,
      userId: row.userId,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
      lastActiveAt: row.lastActiveAt,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      deviceId: row.deviceId,
      isRevoked: row.isRevoked,
      revokedAt: row.revokedAt,
      revokeReason: row.revokeReason,
    };
  }
}
