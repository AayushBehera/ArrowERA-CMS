import { RateLimiter } from '../../security/src/rate-limit';
import { ApiKeyManager } from '../../security/src/api-keys';
import { PermissionChecker } from '../../security/src/permissions';
import { AuditLogger } from '../../security/src/audit-log';

const rateLimiter = new RateLimiter();
const apiKeyManager = new ApiKeyManager();
const permissionChecker = new PermissionChecker();
const auditLogger = new AuditLogger();

export interface AuthenticatedRequest {
  userId?: string;
  userRoles?: string[];
  apiKeyId?: string;
}

export const apiMiddleware = (req: any, res: any, next: any) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const endpoint = req.path || req.url || 'unknown';
  
  // Rate limiting check
  const rateLimitResult = rateLimiter.checkRateLimit(ip, endpoint);
  if (!rateLimitResult.allowed) {
    auditLogger.logAuditAction(
      'rate_limit_exceeded',
      'anonymous',
      { ip, endpoint },
      { severity: 'medium', ipAddress: ip }
    );
    
    res.setHeader('Retry-After', rateLimitResult.retryAfter);
    res.setHeader('X-RateLimit-Limit', 100);
    res.setHeader('X-RateLimit-Remaining', 0);
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', 100);
  res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining || 0);
  
  // API Key validation (if present)
  const apiKey = req.headers['x-api-key'];
  if (apiKey) {
    const validation = apiKeyManager.validateApiKey(apiKey);
    if (!validation.valid) {
      auditLogger.logAuditAction(
        'invalid_api_key',
        'anonymous',
        { ip, endpoint },
        { severity: 'high', ipAddress: ip }
      );
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Attach user info to request
    (req as AuthenticatedRequest).userId = validation.userId;
    (req as AuthenticatedRequest).apiKeyId = apiKey;
  }
  
  console.log(`[API] Middleware intercepting request from ${ip} to ${endpoint}`);
  next();
};

/**
 * Authorization middleware - checks permissions
 */
export const authorizeMiddleware = (requiredPermission: { resource: string; action: string }) => {
  return (req: any, res: any, next: any) => {
    const authenticatedReq = req as AuthenticatedRequest;
    const userRoles = authenticatedReq.userRoles || ['viewer']; // Default role
    
    const hasPermission = permissionChecker.checkPermission(
      userRoles,
      requiredPermission.resource,
      requiredPermission.action
    );
    
    if (!hasPermission) {
      auditLogger.logAuditAction(
        'permission_denied',
        authenticatedReq.userId || 'anonymous',
        {
          resource: requiredPermission.resource,
          action: requiredPermission.action,
          roles: userRoles
        },
        { severity: 'medium' }
      );
      
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

/**
 * Audit logging middleware
 */
export const auditMiddleware = (action: string) => {
  return (req: any, res: any, next: any) => {
    const authenticatedReq = req as AuthenticatedRequest;
    
    // Log after response is sent
    res.on('finish', () => {
      auditLogger.logAuditAction(
        action,
        authenticatedReq.userId || 'anonymous',
        {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode
        },
        {
          resource: req.path,
          ipAddress: req.ip,
          severity: res.statusCode >= 400 ? 'medium' : 'low'
        }
      );
    });
    
    next();
  };
};

export { rateLimiter, apiKeyManager, permissionChecker, auditLogger };
