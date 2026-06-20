import { eq, and, desc, isNull } from 'drizzle-orm';
import { db } from '@arrowera/db';
import { organizations, workspaces, memberships, users } from '@arrowera/db/schema';
import type { Organization, CreateOrganizationInput, OrganizationWithMembers } from './organization.types';

export class OrganizationService {
  /**
   * Create a new organization
   */
  static async createOrganization(input: CreateOrganizationInput, ownerId: string): Promise<Organization> {
    // Start transaction
    const [org] = await db.insert(organizations).values({
      name: input.name,
      slug: input.slug,
      billingEmail: input.billingEmail,
      technicalEmail: input.technicalEmail,
      settings: input.settings,
    }).returning();

    if (!org) {
      throw new Error('Failed to create organization');
    }

    // Create owner membership
    await db.insert(memberships).values({
      userId: ownerId,
      organizationId: org.id,
      status: 'active',
      joinedAt: new Date(),
      // Role will be assigned by RBAC system
    });

    return this.mapToOrganization(org);
  }

  /**
   * Get organization by ID
   */
  static async getOrganizationById(id: string): Promise<OrganizationWithMembers | null> {
    const [org] = await db.select().from(organizations).where(and(eq(organizations.id, id), isNull(organizations.deletedAt))).limit(1);

    if (!org) {
      return null;
    }

    // Get members
    const members = await db
      .select({
        user: users,
        membership: memberships,
      })
      .from(memberships)
      .leftJoin(users, eq(memberships.userId, users.id))
      .where(and(eq(memberships.organizationId, org.id), eq(memberships.status, 'active')));

    return {
      ...this.mapToOrganization(org),
      members: members.map((m) => ({
        user: m.user,
        membership: m.membership,
      })),
    };
  }

  /**
   * Get organization by slug
   */
  static async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    const [org] = await db.select().from(organizations).where(and(eq(organizations.slug, slug))).limit(1);

    if (!org || org.deletedAt) {
      return null;
    }

    return this.mapToOrganization(org);
  }

  /**
   * Get all organizations for a user
   */
  static async getUserOrganizations(userId: string): Promise<Organization[]> {
    const userOrgs = await db
      .select({ organization: organizations })
      .from(memberships)
      .leftJoin(organizations, eq(memberships.organizationId, organizations.id))
      .where(and(eq(memberships.userId, userId), eq(memberships.status, 'active')))
      .orderBy(desc(organizations.createdAt));

    return userOrgs.filter((o) => o.organization && !o.organization.deletedAt).map((o) => this.mapToOrganization(o.organization!));
  }

  /**
   * Update organization
   */
  static async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization> {
    const [org] = await db
      .update(organizations)
      .set({
        name: updates.name,
        slug: updates.slug,
        logoUrl: updates.logoUrl,
        billingEmail: updates.billingEmail,
        technicalEmail: updates.technicalEmail,
        settings: updates.settings,
        updatedAt: new Date(),
      })
      .where(and(eq(organizations.id, id)))
      .returning();

    if (!org) {
      throw new Error('Organization not found');
    }

    return this.mapToOrganization(org);
  }

  /**
   * Delete organization (soft delete)
   */
  static async deleteOrganization(id: string): Promise<void> {
    await db.update(organizations).set({ deletedAt: new Date() }).where(eq(organizations.id, id));
  }

  /**
   * Get organization statistics
   */
  static async getOrganizationStats(id: string): Promise<{
    memberCount: number;
    workspaceCount: number;
    teamCount: number;
  }> {
    const memberCount = await db.$count(memberships, and(eq(memberships.organizationId, id), eq(memberships.status, 'active')));
    
    const workspaceCount = await db.$count(workspaces, and(eq(workspaces.organizationId, id)));

    return {
      memberCount,
      workspaceCount,
      teamCount: 0, // Would need to join with teams
    };
  }

  private static mapToOrganization(row: typeof organizations.$inferSelect): Organization {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      logoUrl: row.logoUrl,
      billingEmail: row.billingEmail,
      technicalEmail: row.technicalEmail,
      settings: row.settings as Record<string, unknown>,
      subscriptionTier: row.subscriptionTier as 'community' | 'professional' | 'enterprise',
      subscriptionStatus: row.subscriptionStatus as 'active' | 'trialing' | 'past_due' | 'canceled' | 'deleted',
      trialEndsAt: row.trialEndsAt,
      subscriptionEndsAt: row.subscriptionEndsAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}
