export interface AuditLog {
  id: string;
  actorId: string | null;
  actorType: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  organizationId: string | null;
  workspaceId: string | null;
  teamId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  statusCode: number | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateAuditLogInput {
  actorId?: string;
  actorType?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  organizationId?: string;
  workspaceId?: string;
  teamId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  statusCode?: number;
  metadata?: Record<string, unknown>;
}

export interface AuditLogFilters {
  actorId?: string;
  organizationId?: string;
  workspaceId?: string;
  teamId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  startDate?: Date;
  endDate?: Date;
}

// Predefined audit actions for consistency
export const AuditActions = {
  // Authentication
  AUTH_LOGIN: 'auth.login',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_LOGIN_FAILED: 'auth.login_failed',
  AUTH_PASSWORD_RESET: 'auth.password_reset',
  AUTH_MFA_ENABLED: 'auth.mfa_enabled',
  AUTH_MFA_DISABLED: 'auth.mfa_disabled',
  AUTH_PASSKEY_REGISTERED: 'auth.passkey_registered',
  AUTH_PASSKEY_REMOVED: 'auth.passkey_removed',

  // Session
  SESSION_CREATED: 'session.created',
  SESSION_REVOKED: 'session.revoked',
  SESSION_EXPIRED: 'session.expired',

  // Organization
  ORGANIZATION_CREATED: 'organization.created',
  ORGANIZATION_UPDATED: 'organization.updated',
  ORGANIZATION_DELETED: 'organization.deleted',

  // Workspace
  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  WORKSPACE_DELETED: 'workspace.deleted',

  // Team
  TEAM_CREATED: 'team.created',
  TEAM_UPDATED: 'team.updated',
  TEAM_DELETED: 'team.deleted',

  // Membership
  MEMBER_ADDED: 'member.added',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',

  // Invitation
  INVITATION_SENT: 'invitation.sent',
  INVITATION_ACCEPTED: 'invitation.accepted',
  INVITATION_DECLINED: 'invitation.declined',
  INVITATION_REVOKED: 'invitation.revoked',

  // Role & Permission
  ROLE_CREATED: 'role.created',
  ROLE_UPDATED: 'role.updated',
  ROLE_DELETED: 'role.deleted',
  PERMISSION_GRANTED: 'permission.granted',
  PERMISSION_REVOKED: 'permission.revoked',

  // License
  LICENSE_ACTIVATED: 'license.activated',
  LICENSE_DEACTIVATED: 'license.deactivated',
  LICENSE_EXPIRED: 'license.expired',

  // Security
  SECURITY_ALERT: 'security.alert',
  SECURITY_POLICY_CHANGED: 'security.policy_changed',

  // Data
  DATA_EXPORTED: 'data.exported',
  DATA_IMPORTED: 'data.imported',
  DATA_DELETED: 'data.deleted',
} as const;

export type AuditAction = typeof AuditActions[keyof typeof AuditActions];
