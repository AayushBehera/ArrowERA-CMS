export interface Permission {
  resource: string;
  actions: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export class PermissionChecker {
  private roles: Map<string, Role> = new Map();
  
  constructor() {
    // Initialize with default roles
    this.registerRole({
      id: 'admin',
      name: 'Administrator',
      permissions: [{ resource: '*', actions: ['*'] }]
    });
    
    this.registerRole({
      id: 'editor',
      name: 'Editor',
      permissions: [
        { resource: 'content', actions: ['read', 'write', 'delete'] },
        { resource: 'media', actions: ['read', 'write'] }
      ]
    });
    
    this.registerRole({
      id: 'viewer',
      name: 'Viewer',
      permissions: [
        { resource: 'content', actions: ['read'] },
        { resource: 'media', actions: ['read'] }
      ]
    });
  }

  /**
   * Register a custom role with specific permissions
   */
  registerRole(role: Role): void {
    this.roles.set(role.id, role);
  }

  /**
   * Check if user has permission for a specific action on a resource
   */
  checkPermission(userRoles: string[], resource: string, action: string): boolean {
    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      for (const perm of role.permissions) {
        // Wildcard match for resource
        if (perm.resource === '*' || perm.resource === resource) {
          // Wildcard match for action
          if (perm.actions.includes('*') || perm.actions.includes(action)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Get all permissions for a user based on their roles
   */
  getUserPermissions(userRoles: string[]): Permission[] {
    const permissions: Permission[] = [];
    
    for (const roleId of userRoles) {
      const role = this.roles.get(roleId);
      if (role) {
        permissions.push(...role.permissions);
      }
    }
    
    return permissions;
  }

  /**
   * Check multiple permissions at once
   */
  checkPermissions(userRoles: string[], checks: Array<{ resource: string; action: string }>): { resource: string; action: string; allowed: boolean }[] {
    return checks.map(check => ({
      resource: check.resource,
      action: check.action,
      allowed: this.checkPermission(userRoles, check.resource, check.action)
    }));
  }
}

// Legacy function wrapper for backward compatibility
export const checkPermission = (user: string, scope: string): boolean => {
  // Parse scope as "resource:action" format
  const [resource, action] = scope.split(':');
  const checker = new PermissionChecker();
  // Default to admin role for legacy compatibility
  return checker.checkPermission(['admin'], resource || '*', action || '*');
};
