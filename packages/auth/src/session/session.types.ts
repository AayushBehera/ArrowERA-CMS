export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  deviceId: string | null;
  isRevoked: boolean;
  revokedAt: Date | null;
  revokeReason: string | null;
}

export interface SessionWithUser extends Session {
  user: {
    id: string;
    email: string;
    status: string;
  };
}

export interface CreateSessionInput {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  os: string | null;
  browser: string | null;
  ipAddress: string | null;
  lastActiveAt: Date;
  createdAt: Date;
  isTrusted: boolean;
  pushToken: string | null;
}
