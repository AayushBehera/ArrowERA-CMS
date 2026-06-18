export interface Invitation {
  id: string;
  email: string;
  organizationId: string | null;
  workspaceId: string | null;
  teamId: string | null;
  roleId: string | null;
  invitedBy: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';
  expiresAt: Date;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface CreateInvitationInput {
  email: string;
  organizationId?: string;
  workspaceId?: string;
  teamId?: string;
  roleId?: string;
}

export interface InvitationEmailData {
  invitationToken: string;
  inviterName: string;
  inviterEmail: string;
  organizationName: string;
  invitationUrl: string;
  expiresAt: Date;
}
