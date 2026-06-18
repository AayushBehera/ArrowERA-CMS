import { createHash } from 'crypto';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: string;
  userId: string;
  resource?: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private readonly MAX_LOGS = 10000; // Keep last 10k logs in memory

  /**
   * Log an audit event with full context
   */
  logAuditAction(
    action: string,
    userId: string,
    details: any,
    options?: {
      resource?: string;
      resourceId?: string;
      ipAddress?: string;
      userAgent?: string;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    }
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: Date.now(),
      action,
      userId,
      resource: options?.resource,
      resourceId: options?.resourceId,
      details: this.sanitizeDetails(details),
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      severity: options?.severity || 'low'
    };

    this.logs.push(entry);

    // Trim old logs if exceeding max
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(this.logs.length - this.MAX_LOGS);
    }

    console.log(`[Security] Audit: ${action} by user ${userId}`);
    return entry;
  }

  /**
   * Get audit logs with filtering and pagination
   */
  getLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: number;
    endDate?: number;
    severity?: string;
  }, pagination?: { limit: number; offset: number }): AuditLogEntry[] {
    let filtered = [...this.logs];

    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        filtered = filtered.filter(log => log.action === filters.action);
      }
      if (filters.resource) {
        filtered = filtered.filter(log => log.resource === filters.resource);
      }
      if (filters.startDate) {
        filtered = filtered.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filtered = filtered.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.severity) {
        filtered = filtered.filter(log => log.severity === filters.severity);
      }
    }

    // Sort by timestamp descending (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // Apply pagination
    if (pagination) {
      const { limit, offset } = pagination;
      filtered = filtered.slice(offset, offset + limit);
    }

    return filtered;
  }

  /**
   * Get high-severity events for alerting
   */
  getHighSeverityEvents(hours: number = 24): AuditLogEntry[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    return this.logs.filter(
      log => (log.severity === 'high' || log.severity === 'critical') && log.timestamp >= cutoff
    );
  }

  /**
   * Export logs for external storage
   */
  exportLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs (use with caution)
   */
  clearLogs(): void {
    this.logs = [];
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  private sanitizeDetails(details: any): Record<string, any> {
    // Remove sensitive fields from audit log
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...details };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

// Legacy function wrapper for backward compatibility
export const logAuditAction = (action: string, user: string, details: any): void => {
  const logger = new AuditLogger();
  logger.logAuditAction(action, user, details);
};
