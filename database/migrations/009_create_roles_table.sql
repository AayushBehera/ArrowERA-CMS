-- Migration 009: Roles table

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    hierarchy_level INTEGER NOT NULL DEFAULT 0,
    is_system_role BOOLEAN DEFAULT FALSE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_roles_slug ON roles(slug);
CREATE INDEX idx_roles_hierarchy_level ON roles(hierarchy_level);
CREATE INDEX idx_roles_organization_id ON roles(organization_id);
CREATE INDEX idx_roles_deleted_at ON roles(deleted_at);

-- Insert default system roles
INSERT INTO roles (name, slug, description, hierarchy_level, is_system_role) VALUES
('Super Admin', 'super_admin', 'Full system access', 100, TRUE),
('Owner', 'owner', 'Organization owner with full access', 90, TRUE),
('Admin', 'admin', 'Administrative access', 80, TRUE),
('Manager', 'manager', 'Team management access', 70, TRUE),
('Editor', 'editor', 'Content editing access', 60, TRUE),
('Developer', 'developer', 'Development access', 50, TRUE),
('Viewer', 'viewer', 'Read-only access', 40, TRUE),
('Guest', 'guest', 'Limited guest access', 30, TRUE);
