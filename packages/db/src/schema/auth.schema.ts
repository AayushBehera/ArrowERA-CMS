import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  status: varchar('status', { length: 50 }).default('active'),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  refreshTokenHash: varchar('refresh_token_hash', { length: 255 }).unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  deviceId: uuid('device_id'),
  isRevoked: boolean('is_revoked').default(false),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokeReason: varchar('revoke_reason', { length: 255 }),
});

export const devices = pgTable('devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  deviceType: varchar('device_type', { length: 50 }),
  os: varchar('os', { length: 100 }),
  browser: varchar('browser', { length: 100 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  isTrusted: boolean('is_trusted').default(false),
  pushToken: text('push_token'),
});

export const passkeys = pgTable('passkeys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  credentialId: varchar('credential_id', { length: 512 }).notNull().unique(),
  publicKey: text('public_key').notNull(),
  counter: integer('counter').default(0),
  deviceType: varchar('device_type', { length: 50 }),
  backupEligible: boolean('backup_eligible').default(false),
  backupState: boolean('backup_state').default(false),
  transports: text('transports').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  name: varchar('name', { length: 255 }),
  isActive: boolean('is_active').default(true),
});

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  logoUrl: text('logo_url'),
  billingEmail: varchar('billing_email', { length: 255 }),
  technicalEmail: varchar('technical_email', { length: 255 }),
  settings: jsonb('settings').default({}),
  subscriptionTier: varchar('subscription_tier', { length: 50 }).default('community'),
  subscriptionStatus: varchar('subscription_status', { length: 50 }).default('active'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  subscriptionEndsAt: timestamp('subscription_ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}),
});

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 100 }).notNull(),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: uuid('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 100 }).notNull(),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  hierarchyLevel: integer('hierarchy_level').notNull().default(0),
  isSystemRole: boolean('is_system_role').default(false),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  resource: varchar('resource', { length: 100 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  isWildcard: boolean('is_wildcard').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).default('pending'),
  joinedAt: timestamp('joined_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}),
});

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  actorType: varchar('actor_type', { length: 50 }).default('user'),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 100 }),
  resourceId: uuid('resource_id'),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'set null' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'set null' }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  requestId: uuid('request_id'),
  severity: varchar('severity', { length: 20 }).default('info'),
  statusCode: integer('status_code'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const licenses = pgTable('licenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  licenseKey: varchar('license_key', { length: 255 }).notNull().unique(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  tier: varchar('tier', { length: 50 }).notNull(),
  status: varchar('status', { length: 50 }).default('active'),
  issuedAt: timestamp('issued_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
  deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
  maxUsers: integer('max_users'),
  maxWorkspaces: integer('max_workspaces'),
  maxTeams: integer('max_teams'),
  features: jsonb('features').default([]),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const invitations = pgTable('invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }),
  teamId: uuid('team_id').references(() => teams.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 50 }).default('pending'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  declinedAt: timestamp('declined_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const mfaSettings = pgTable('mfa_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  totpEnabled: boolean('totp_enabled').default(false),
  totpSecret: varchar('totp_secret', { length: 255 }),
  backupCodes: text('backup_codes').array(),
  backupCodesRemaining: integer('backup_codes_remaining').default(0),
  recoveryEmail: varchar('recovery_email', { length: 255 }),
  trustedDevices: jsonb('trusted_devices').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
});

export const oauthAccounts = pgTable('oauth_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at', { withTimezone: true }),
  scopes: text('scopes').array(),
  idToken: text('id_token'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const ssoConfigurations = pgTable('sso_configurations', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  providerType: varchar('provider_type', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  enabled: boolean('enabled').default(true),
  idpEntityId: text('idp_entity_id'),
  idpSsoUrl: text('idp_sso_url'),
  idpSloUrl: text('idp_slo_url'),
  idpCertificate: text('idp_certificate'),
  spEntityId: text('sp_entity_id'),
  spCertificate: text('sp_certificate'),
  spPrivateKey: text('sp_private_key'),
  oidcIssuer: text('oidc_issuer'),
  oidcClientId: text('oidc_client_id'),
  oidcClientSecret: text('oidc_client_secret'),
  oidcRedirectUri: text('oidc_redirect_uri'),
  oidcScopes: text('oidc_scopes').array(),
  defaultRoleId: uuid('default_role_id').references(() => roles.id, { onDelete: 'set null' }),
  autoProvision: boolean('auto_provision').default(true),
  domainWhitelist: text('domain_whitelist').array(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  devices: many(devices),
  passkeys: many(passkeys),
  memberships: many(memberships),
  auditLogs: many(auditLogs),
  oauthAccounts: many(oauthAccounts),
  mfaSettings: many(mfaSettings),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  workspaces: many(workspaces),
  memberships: many(memberships),
  licenses: many(licenses),
  auditLogs: many(auditLogs),
  ssoConfigurations: many(ssoConfigurations),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [workspaces.organizationId],
    references: [organizations.id],
  }),
  teams: many(teams),
  memberships: many(memberships),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [teams.workspaceId],
    references: [workspaces.id],
  }),
  memberships: many(memberships),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
  workspace: one(workspaces, {
    fields: [memberships.workspaceId],
    references: [workspaces.id],
  }),
  team: one(teams, {
    fields: [memberships.teamId],
    references: [teams.id],
  }),
  role: one(roles, {
    fields: [memberships.roleId],
    references: [roles.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many, one }) => ({
  permissions: many(rolePermissions),
  organization: one(organizations, {
    fields: [roles.organizationId],
    references: [organizations.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));
