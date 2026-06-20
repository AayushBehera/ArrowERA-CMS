import { eq, and, sql } from 'drizzle-orm';
import { db } from '@arrowera/db';
import { auditLogs } from '@arrowera/db/schema';
import type { AuditLog, CreateAuditLogInput, AuditLogFilters } from './audit.types';

export class AuditService {
  /**
   * Log an audit event
   */
  static async logEvent(input: CreateAuditLogInput): Promise<AuditLog> {
    const [log] = await db
      .insert(auditLogs)
      .values({
        actorId: input.actorId,
        actorType: input.actorType || 'user',
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        organizationId: input.organizationId,
        workspaceId: input.workspaceId,
        teamId: input.teamId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        requestId: input.requestId,
        severity: input.severity || 'info',
        statusCode: input.statusCode,
        metadata: input.metadata,
      })
      .returning();

    if (!log) {
      throw new Error('Failed to create audit log');
    }

    return this.mapToAuditLog(log);
  }

  /**
   * Get audit logs with filters
   */
  static async getAuditLogs(filters: AuditLogFilters, limit: number = 100, offset: number = 0): Promise<{
    logs: AuditLog[];
    total: number;
  }> {
    const conditions = [];

    if (filters.actorId) {
      conditions.push(eq(auditLogs.actorId, filters.actorId));
    }

    if (filters.organizationId) {
      conditions.push(eq(auditLogs.organizationId, filters.organizationId));
    }

    if (filters.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }

    if (filters.resourceType) {
      conditions.push(eq(auditLogs.resourceType, filters.resourceType));
    }

    if (filters.severity) {
      conditions.push(eq(auditLogs.severity, filters.severity));
    }

    if (filters.startDate) {
      conditions.push(sql`${auditLogs.createdAt} >= ${filters.startDate}`);
    }

    if (filters.endDate) {
      conditions.push(sql`${auditLogs.createdAt} <= ${filters.endDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const logs = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(auditLogs.createdAt)
      .limit(limit)
      .offset(offset);

    // Get total count
    const total = await db.$count(auditLogs, whereClause);

    return {
      logs: logs.map((l) => this.mapToAuditLog(l)),
      total,
    };
  }

  /**
   * Get audit logs for a specific resource
   */
  static async getResourceAuditLogs(
    resourceType: string,
    resourceId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.resourceType, resourceType), eq(auditLogs.resourceId, resourceId)))
      .orderBy(auditLogs.createdAt)
      .limit(limit);

    return logs.map((l) => this.mapToAuditLog(l));
  }

  /**
   * Get audit logs for a user
   */
  static async getUserAuditLogs(userId: string, limit: number = 50): Promise<AuditLog[]> {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.actorId, userId))
      .orderBy(auditLogs.createdAt)
      .limit(limit);

    return logs.map((l) => this.mapToAuditLog(l));
  }

  /**
   * Get audit logs for an organization
   */
  static async getOrganizationAuditLogs(organizationId: string, limit: number = 100): Promise<AuditLog[]> {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.organizationId, organizationId))
      .orderBy(auditLogs.createdAt)
      .limit(limit);

    return logs.map((l) => this.mapToAuditLog(l));
  }

  /**
   * Export audit logs (for compliance)
   */
  static async exportAuditLogs(
    filters: AuditLogFilters,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const { logs } = await this.getAuditLogs(filters, 10000, 0);

    if (format === 'csv') {
      const headers = ['id', 'timestamp', 'actorId', 'action', 'resourceType', 'resourceId', 'severity', 'ipAddress'];
      const rows = logs.map((l) => [
        l.id,
        l.createdAt.toISOString(),
        l.actorId || '',
        l.action,
        l.resourceType || '',
        l.resourceId || '',
        l.severity,
        l.ipAddress || '',
      ]);

      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  /**
   * Clean up old audit logs (retention policy)
   */
  static async cleanupOldAuditLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await db.delete(auditLogs).where(sql`${auditLogs.createdAt} < ${cutoffDate}`);
    return result.rowCount || 0;
  }

  private static mapToAuditLog(row: typeof auditLogs.$inferSelect): AuditLog {
    return {
      id: row.id,
      actorId: row.actorId,
      actorType: row.actorType ?? 'user',
      action: row.action,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      organizationId: row.organizationId,
      workspaceId: row.workspaceId,
      teamId: row.teamId,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      requestId: row.requestId,
      severity: row.severity as 'debug' | 'info' | 'warning' | 'error' | 'critical',
      statusCode: row.statusCode,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt ?? new Date(),
    };
  }
}
