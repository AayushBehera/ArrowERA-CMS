export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  billingEmail: string | null;
  technicalEmail: string | null;
  settings: Record<string, unknown>;
  subscriptionTier: 'community' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled' | 'deleted';
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  logoUrl?: string;
  billingEmail?: string;
  technicalEmail?: string;
  settings?: Record<string, unknown>;
}

export interface OrganizationWithMembers extends Organization {
  members: Array<{
    user: {
      id: string;
      email: string;
      status: string;
    };
    membership: {
      id: string;
      role: string | null;
      status: string;
      joinedAt: Date | null;
    };
  }>;
}

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Team {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  slug: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Membership {
  id: string;
  userId: string;
  organizationId: string | null;
  workspaceId: string | null;
  teamId: string | null;
  roleId: string | null;
  invitedBy: string | null;
  status: 'pending' | 'active' | 'suspended' | 'removed';
  joinedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  metadata: Record<string, unknown>;
}
