-- Migration 010: Permissions table

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    is_wildcard BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_permissions_slug ON permissions(slug);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Insert default permissions
INSERT INTO permissions (name, slug, description, resource, action, is_wildcard) VALUES
('Read Content', 'content:read', 'Read content items', 'content', 'read', FALSE),
('Write Content', 'content:write', 'Create content items', 'content', 'write', FALSE),
('Update Content', 'content:update', 'Update content items', 'content', 'update', FALSE),
('Delete Content', 'content:delete', 'Delete content items', 'content', 'delete', FALSE),
('Manage Content', 'content:*', 'Full content management', 'content', '*', TRUE),

('Read Users', 'users:read', 'View user information', 'users', 'read', FALSE),
('Write Users', 'users:write', 'Create users', 'users', 'write', FALSE),
('Update Users', 'users:update', 'Update user information', 'users', 'update', FALSE),
('Delete Users', 'users:delete', 'Delete users', 'users', 'delete', FALSE),
('Manage Users', 'users:*', 'Full user management', 'users', '*', TRUE),

('Read Roles', 'roles:read', 'View roles', 'roles', 'read', FALSE),
('Write Roles', 'roles:write', 'Create roles', 'roles', 'write', FALSE),
('Update Roles', 'roles:update', 'Update roles', 'roles', 'update', FALSE),
('Delete Roles', 'roles:delete', 'Delete roles', 'roles', 'delete', FALSE),
('Manage Roles', 'roles:*', 'Full role management', 'roles', '*', TRUE),

('Read Settings', 'settings:read', 'View settings', 'settings', 'read', FALSE),
('Update Settings', 'settings:update', 'Update settings', 'settings', 'update', FALSE),
('Manage Settings', 'settings:*', 'Full settings management', 'settings', '*', TRUE),

('Invite Users', 'invitations:create', 'Send invitations', 'invitations', 'create', FALSE),
('Manage Invitations', 'invitations:*', 'Full invitation management', 'invitations', '*', TRUE),

('Read Audit Logs', 'audit:read', 'View audit logs', 'audit', 'read', FALSE),
('Export Audit Logs', 'audit:export', 'Export audit logs', 'audit', 'export', FALSE),

('Manage Billing', 'billing:*', 'Full billing management', 'billing', '*', TRUE),
('Manage AI', 'ai:*', 'AI features access', 'ai', '*', TRUE),
('Manage System', 'system:*', 'System administration', 'system', '*', TRUE);

-- Assign permissions to default roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'super_admin' AND p.is_wildcard = TRUE;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'owner' AND p.resource IN ('content', 'users', 'roles', 'settings', 'invitations', 'billing', 'ai');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'admin' AND p.resource IN ('content', 'users', 'roles', 'settings', 'invitations');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'manager' AND p.resource IN ('content', 'users', 'invitations');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'editor' AND p.resource = 'content';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'developer' AND p.resource IN ('content', 'settings');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.slug = 'viewer' AND p.action = 'read';
