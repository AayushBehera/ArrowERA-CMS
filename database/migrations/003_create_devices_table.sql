-- Migration 003: Devices table

CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
    os VARCHAR(100),
    browser VARCHAR(100),
    ip_address INET,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_trusted BOOLEAN DEFAULT FALSE,
    push_token TEXT
);

CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_devices_device_type ON devices(device_type);
CREATE INDEX idx_devices_is_trusted ON devices(is_trusted);
