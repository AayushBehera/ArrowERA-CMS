import { randomBytes, createHash } from 'crypto';
import { eq, and, gte } from 'drizzle-orm';
import { db } from '@arrowera/db';
import { invitations, memberships, roles } from '@arrowera/db/schema';
import type { Invitation, CreateInvitationInput } from './invitation.types';

export class InvitationService {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly INVITATION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Hash an invitation token
   */
  private static hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate a secure random token
   */
  private static generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  /**
   * Create a new invitation
   */
  static async createInvitation(input: CreateInvitationInput, invitedBy: string): Promise<{ invitation: Invitation; token: string }> {
    const token = this.generateToken();
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + this.INVITATION_EXPIRY);

    // Validate role exists
    if (input.roleId) {
      const [role] = await db.select().from(roles).where(eq(roles.id, input.roleId)).limit(1);
      if (!role) {
        throw new Error('Invalid role ID');
      }
    }

    const [invitation] = await db
      .insert(invitations)
      .values({
        email: input.email,
        organizationId: input.organizationId,
        workspaceId: input.workspaceId,
        teamId: input.teamId,
        roleId: input.roleId,
        invitedBy,
        tokenHash,
        expiresAt,
        status: 'pending',
      })
      .returning();

    if (!invitation) {
      throw new Error('Failed to create invitation');
    }

    return {
      invitation: this.mapToInvitation(invitation),
      token,
    };
  }

  /**
   * Accept an invitation
   */
  static async acceptInvitation(token: string, userId: string): Promise<void> {
    const tokenHash = this.hashToken(token);

    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.tokenHash, tokenHash),
          eq(invitations.status, 'pending'),
          gte(invitations.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!invitation) {
      throw new Error('Invalid or expired invitation');
    }

    // Create membership
    await db.insert(memberships).values({
      userId,
      organizationId: invitation.organizationId,
      workspaceId: invitation.workspaceId,
      teamId: invitation.teamId,
      roleId: invitation.roleId,
      invitedBy: invitation.invitedBy,
      status: 'active',
      joinedAt: new Date(),
    });

    // Update invitation status
    await db.update(invitations).set({
      status: 'accepted',
      acceptedAt: new Date(),
    }).where(eq(invitations.id, invitation.id));
  }

  /**
   * Decline an invitation
   */
  static async declineInvitation(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);

    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.tokenHash, tokenHash),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (!invitation) {
      throw new Error('Invalid invitation');
    }

    await db.update(invitations).set({
      status: 'declined',
      declinedAt: new Date(),
    }).where(eq(invitations.id, invitation.id));
  }

  /**
   * Revoke an invitation
   */
  static async revokeInvitation(invitationId: string): Promise<void> {
    await db.update(invitations).set({
      status: 'revoked',
      revokedAt: new Date(),
    }).where(eq(invitations.id, invitationId));
  }

  /**
   * Get pending invitations for an organization
   */
  static async getOrganizationInvitations(organizationId: string): Promise<Invitation[]> {
    const invites = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.organizationId, organizationId),
          eq(invitations.status, 'pending'),
          gte(invitations.expiresAt, new Date())
        )
      );

    return invites.map((i) => this.mapToInvitation(i));
  }

  /**
   * Get invitation by email
   */
  static async getInvitationByEmail(email: string, organizationId: string): Promise<Invitation | null> {
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email.toLowerCase()),
          eq(invitations.organizationId, organizationId),
          eq(invitations.status, 'pending'),
          gte(invitations.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!invitation) {
      return null;
    }

    return this.mapToInvitation(invitation);
  }

  /**
   * Clean up expired invitations
   */
  static async cleanupExpiredInvitations(): Promise<number> {
    const result = await db.delete(invitations).where(eq(invitations.status, 'pending'));
    return result.rowCount || 0;
  }

  private static mapToInvitation(row: typeof invitations.$inferSelect): Invitation {
    return {
      id: row.id,
      email: row.email,
      organizationId: row.organizationId,
      workspaceId: row.workspaceId,
      teamId: row.teamId,
      roleId: row.roleId,
      invitedBy: row.invitedBy,
      status: row.status as 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked',
      expiresAt: row.expiresAt,
      acceptedAt: row.acceptedAt,
      declinedAt: row.declinedAt,
      revokedAt: row.revokedAt,
      createdAt: row.createdAt,
    };
  }
}
