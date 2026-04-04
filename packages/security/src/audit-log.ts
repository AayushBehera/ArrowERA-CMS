export const logAuditAction = (action: string, user: string, details: any) => {
  console.log(`[Security] Audit Log: User ${user} performed ${action}`, details);
};
