export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date | null;
  lastActiveAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceId: string | null;
  isRevoked: boolean | null;
  revokedAt: Date | null;
  revokeReason: string | null;
}

export interface SessionWithUser extends Session {
  user: {
    id: string;
    email: string;
    status: string | null;
  } | null;
}

export interface CreateSessionInput {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceId?: string | null;
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
