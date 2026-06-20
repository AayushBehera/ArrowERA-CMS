/**
 * Enterprise RBAC (Role-Based Access Control) System
 * Implements hierarchical roles with granular permissions
 */

import { z } from 'zod';

// Permission definitions
export const PERMISSIONS = {
  // Content permissions
  CONTENT_READ: 'content:read',
  CONTENT_WRITE: 'content:write',
  CONTENT_UPDATE: 'content:update',
  CONTENT_DELETE: 'content:delete',
  CONTENT_PUBLISH: 'content:publish',
  
  // User management
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_INVITE: 'user:invite',
  USER_MANAGE_ROLES: 'user:manage_roles',
  
  // Organization management
  ORG_READ: 'org:read',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',
  ORG_MANAGE_MEMBERS: 'org:manage_members',
  ORG_MANAGE_BILLING: 'org:manage_billing',
  
  // Team management
  TEAM_READ: 'team:read',
  TEAM_CREATE: 'team:create',
  TEAM_UPDATE: 'team:update',
  TEAM_DELETE: 'team:delete',
  TEAM_MANAGE_MEMBERS: 'team:manage_members',
  
  // AI features
  AI_READ: 'ai:read',
  AI_USE: 'ai:use',
  AI_MANAGE_MODELS: 'ai:manage_models',
  AI_MANAGE_PROMPTS: 'ai:manage_prompts',
  
  // System administration
  SYSTEM_READ: 'system:read',
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_AUDIT: 'system:audit',
  SYSTEM_MANAGE_INTEGRATIONS: 'system:manage_integrations',
  
  // Plugin management
  PLUGIN_READ: 'plugin:read',
  PLUGIN_INSTALL: 'plugin:install',
  PLUGIN_UNINSTALL: 'plugin:uninstall',
  PLUGIN_CONFIGURE: 'plugin:configure',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role definitions with hierarchy
export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  inherits?: string[]; // Parent role IDs for permission inheritance
  isSystem: boolean; // Cannot be deleted
  level: number; // Hierarchy level (higher = more powerful)
}

export const DEFAULT_ROLES: Record<string, RoleDefinition> = {
  SUPER_ADMIN: {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access across all organizations',
    permissions: Object.values(PERMISSIONS),
    isSystem: true,
    level: 100,
  },
  OWNER: {
    id: 'owner',
    name: 'Organization Owner',
    description: 'Full ownership and administrative rights',
    permissions: [
      PERMISSIONS.ORG_READ,
      PERMISSIONS.ORG_UPDATE,
      PERMISSIONS.ORG_DELETE,
      PERMISSIONS.ORG_MANAGE_MEMBERS,
      PERMISSIONS.ORG_MANAGE_BILLING,
      PERMISSIONS.USER_MANAGE_ROLES,
      PERMISSIONS.TEAM_CREATE,
      PERMISSIONS.TEAM_UPDATE,
      PERMISSIONS.TEAM_DELETE,
      PERMISSIONS.TEAM_MANAGE_MEMBERS,
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_WRITE,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_DELETE,
      PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.AI_READ,
      PERMISSIONS.AI_USE,
      PERMISSIONS.AI_MANAGE_MODELS,
      PERMISSIONS.AI_MANAGE_PROMPTS,
      PERMISSIONS.SYSTEM_READ,
      PERMISSIONS.SYSTEM_CONFIG,
      PERMISSIONS.SYSTEM_AUDIT,
      PERMISSIONS.PLUGIN_READ,
      PERMISSIONS.PLUGIN_INSTALL,
      PERMISSIONS.PLUGIN_UNINSTALL,
      PERMISSIONS.PLUGIN_CONFIGURE,
    ],
    isSystem: true,
    level: 90,
  },
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    description: 'Administrative access within organization',
    permissions: [
      PERMISSIONS.ORG_READ,
      PERMISSIONS.ORG_MANAGE_MEMBERS,
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_CREATE,
      PERMISSIONS.USER_UPDATE,
      PERMISSIONS.USER_INVITE,
      PERMISSIONS.TEAM_READ,
      PERMISSIONS.TEAM_CREATE,
      PERMISSIONS.TEAM_UPDATE,
      PERMISSIONS.TEAM_MANAGE_MEMBERS,
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_WRITE,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_DELETE,
      PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.AI_READ,
      PERMISSIONS.AI_USE,
      PERMISSIONS.AI_MANAGE_MODELS,
      PERMISSIONS.AI_MANAGE_PROMPTS,
      PERMISSIONS.SYSTEM_READ,
      PERMISSIONS.SYSTEM_AUDIT,
      PERMISSIONS.PLUGIN_READ,
      PERMISSIONS.PLUGIN_INSTALL,
      PERMISSIONS.PLUGIN_CONFIGURE,
    ],
    isSystem: true,
    level: 80,
  },
  MANAGER: {
    id: 'manager',
    name: 'Team Manager',
    description: 'Manage teams and content',
    permissions: [
      PERMISSIONS.TEAM_READ,
      PERMISSIONS.TEAM_MANAGE_MEMBERS,
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_WRITE,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.AI_READ,
      PERMISSIONS.AI_USE,
      PERMISSIONS.USER_READ,
      PERMISSIONS.USER_INVITE,
    ],
    isSystem: true,
    level: 70,
  },
  EDITOR: {
    id: 'editor',
    name: 'Editor',
    description: 'Create and edit content',
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.CONTENT_WRITE,
      PERMISSIONS.CONTENT_UPDATE,
      PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.AI_READ,
      PERMISSIONS.AI_USE,
      PERMISSIONS.AI_MANAGE_PROMPTS,
    ],
    isSystem: true,
    level: 60,
  },
  DEVELOPER: {
    id: 'developer',
    name: 'Developer',
    description: 'Technical access for integrations',
    permissions: [
      PERMISSIONS.SYSTEM_READ,
      PERMISSIONS.SYSTEM_AUDIT,
      PERMISSIONS.PLUGIN_READ,
      PERMISSIONS.PLUGIN_INSTALL,
      PERMISSIONS.PLUGIN_CONFIGURE,
      PERMISSIONS.AI_READ,
      PERMISSIONS.AI_USE,
      PERMISSIONS.AI_MANAGE_MODELS,
      PERMISSIONS.CONTENT_READ,
    ],
    isSystem: true,
    level: 65,
  },
  VIEWER: {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access',
    permissions: [
      PERMISSIONS.CONTENT_READ,
      PERMISSIONS.AI_READ,
      PERMISSIONS.TEAM_READ,
      PERMISSIONS.ORG_READ,
    ],
    isSystem: true,
    level: 50,
  },
  GUEST: {
    id: 'guest',
    name: 'Guest',
    description: 'Limited temporary access',
    permissions: [
      PERMISSIONS.CONTENT_READ,
    ],
    isSystem: true,
    level: 40,
  },
};

// Validation schemas
export const PermissionSchema = z.enum(Object.values(PERMISSIONS) as [string, ...string[]]);
export const RoleIdSchema = z.string().min(1).max(50);

export class RBACService {
  private roles: Map<string, RoleDefinition>;
  private customRoles: Map<string, RoleDefinition>;

  constructor() {
    this.roles = new Map(Object.entries(DEFAULT_ROLES));
    this.customRoles = new Map();
  }

  /**
   * Get a role by ID
   */
  getRole(roleId: string): RoleDefinition | undefined {
    return this.roles.get(roleId) || this.customRoles.get(roleId);
  }

  /**
   * Get all available roles
   */
  getAllRoles(): RoleDefinition[] {
    return [...this.roles.values(), ...this.customRoles.values()];
  }

  /**
   * Check if a role exists
   */
  hasRole(roleId: string): boolean {
    return this.roles.has(roleId) || this.customRoles.has(roleId);
  }

  /**
   * Create a custom role
   */
  createCustomRole(role: Omit<RoleDefinition, 'isSystem'>): RoleDefinition {
    if (this.roles.has(role.id)) {
      throw new Error(`Role '${role.id}' already exists as a system role`);
    }

    const fullRole: RoleDefinition = {
      ...role,
      isSystem: false,
    };

    this.customRoles.set(role.id, fullRole);
    return fullRole;
  }

  /**
   * Delete a custom role
   */
  deleteCustomRole(roleId: string): boolean {
    const role = this.customRoles.get(roleId);
    if (!role) {
      return false;
    }
    if (role.isSystem) {
      throw new Error('Cannot delete system roles');
    }
    return this.customRoles.delete(roleId);
  }

  /**
   * Get all permissions for a role (including inherited)
   */
  getRolePermissions(roleId: string): Set<Permission> {
    const role = this.getRole(roleId);
    if (!role) {
      return new Set();
    }

    const permissions = new Set<Permission>(role.permissions);

    // Add inherited permissions
    if (role.inherits) {
      for (const parentRoleId of role.inherits) {
        const parentPermissions = this.getRolePermissions(parentRoleId);
        parentPermissions.forEach(p => permissions.add(p));
      }
    }

    return permissions;
  }

  /**
   * Check if a role has a specific permission
   */
  hasPermission(roleId: string, permission: Permission): boolean {
    const permissions = this.getRolePermissions(roleId);
    return permissions.has(permission);
  }

  /**
   * Check if a role can perform an action on a resource
   */
  can(roleId: string, action: string, resource: string): boolean {
    const permission = `${action}:${resource}` as Permission;
    return this.hasPermission(roleId, permission);
  }

  /**
   * Compare two roles by hierarchy level
   */
  compareRoles(role1Id: string, role2Id: string): number {
    const role1 = this.getRole(role1Id);
    const role2 = this.getRole(role2Id);

    if (!role1 || !role2) {
      return 0;
    }

    return role1.level - role2.level;
  }

  /**
   * Check if role1 is higher or equal to role2 in hierarchy
   */
  isRoleHigherOrEqual(higherRoleId: string, lowerRoleId: string): boolean {
    return this.compareRoles(higherRoleId, lowerRoleId) >= 0;
  }

  /**
   * Validate permissions array
   */
  validatePermissions(permissions: string[]): Permission[] {
    const result: Permission[] = [];
    
    for (const perm of permissions) {
      const parsed = PermissionSchema.safeParse(perm);
      if (parsed.success) {
        result.push(parsed.data as Permission);
      }
    }

    return result;
  }

  /**
   * Get roles by level range
   */
  getRolesByLevel(minLevel: number, maxLevel: number): RoleDefinition[] {
    return this.getAllRoles().filter(
      role => role.level >= minLevel && role.level <= maxLevel
    );
  }

  /**
   * Export roles configuration
   */
  exportRoles(): Record<string, RoleDefinition> {
    const exportData: Record<string, RoleDefinition> = {};
    
    for (const [id, role] of this.roles) {
      exportData[id] = role;
    }
    for (const [id, role] of this.customRoles) {
      exportData[id] = role;
    }

    return exportData;
  }

  /**
   * Import roles configuration
   */
  importRoles(rolesData: Record<string, Omit<RoleDefinition, 'isSystem'>>): void {
    for (const [id, roleData] of Object.entries(rolesData)) {
      if (!this.roles.has(id)) {
        this.createCustomRole({ ...roleData, id });
      }
    }
  }
}

// Singleton instance
export const rbacService = new RBACService();
