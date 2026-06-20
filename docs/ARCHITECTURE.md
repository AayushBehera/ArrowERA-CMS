# ArrowERA CMS - Architecture Documentation

## System Overview

ArrowERA CMS is an enterprise-grade, AI-ready content management platform built on a modular monorepo architecture.

---

## Architecture Principles

1. **Modularity**: Independent, swappable packages
2. **Type Safety**: Full TypeScript coverage
3. **Security First**: Defense in depth
4. **Scalability**: Horizontal scaling ready
5. **Observability**: Comprehensive logging and metrics
6. **Developer Experience**: Excellent DX with hot reload

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Astro     │  │    React     │  │  WebSocket   │      │
│  │   Frontend   │  │  Dashboard   │  │   Client     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    REST      │  │   GraphQL    │  │   Realtime   │      │
│  │     API      │  │     API      │  │   WebSocket  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Security Middleware                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth & JWT   │  │ Rate Limit   │  │ Audit Log    │      │
│  │              │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CSRF Protect │  │ Input Valid  │  │ CORS Policy  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Content    │  │     AI       │  │   Workflow   │      │
│  │   Manager    │  │   Engine     │  │   Engine     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Plugin    │  │  Team & RBAC │  │  Analytics   │      │
│  │   Runtime    │  │              │  │   Engine     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Access Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Repository  │  │    Cache     │  │   Storage    │      │
│  │   Pattern    │  │    Layer     │  │   Adapters   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Redis     │  │   S3 / R2    │      │
│  │  / D1 / SQLite│  │    Cache     │  │   Storage    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Package Structure

```
/workspace
├── apps/
│   ├── admin/                 # Admin dashboard application
│   ├── dashboard/             # User dashboard
│   ├── api/                   # API server
│   └── docs/                  # Documentation site
│
├── packages/
│   ├── ai/                    # AI engine (local + cloud)
│   ├── analytics/             # Usage analytics
│   ├── api/                   # API gateway
│   ├── auth/                  # Authentication system
│   ├── builder/               # Visual page builder
│   ├── cache/                 # Caching layer
│   ├── config/                # Configuration system
│   ├── db/                    # Database adapters
│   ├── emdash/                # Core CMS engine
│   ├── logging/               # Structured logging
│   ├── monitoring/            # Metrics & observability
│   ├── plugin-marketplace/    # Plugin registry
│   ├── plugin-runtime/        # Plugin sandbox
│   ├── realtime/              # WebSocket server
│   ├── security/              # Security middleware
│   ├── storage/               # Object storage
│   ├── team/                  # Multi-tenant & RBAC
│   └── workflow/              # Automation engine
│
├── infrastructure/
│   ├── docker/                # Docker configurations
│   ├── kubernetes/            # K8s manifests
│   └── nginx/                 # Nginx configs
│
├── database/
│   ├── migrations/            # Database migrations
│   ├── seeds/                 # Seed data
│   └── schema/                # Schema definitions
│
└── docs/                      # Documentation
```

---

## Core Packages

### @arrowera/config

Centralized configuration management with Zod validation.

**Features:**
- Environment validation
- Type-safe configuration
- Environment-specific schemas
- Fail-fast validation

**Usage:**
```typescript
import { config } from '@arrowera/config';

const dbUrl = config.get('DATABASE_URL');
const isProd = config.isProduction();
```

---

### @arrowera/db

Database abstraction layer supporting multiple backends.

**Supported Adapters:**
- PostgreSQL (production)
- SQLite (development)
- Cloudflare D1 (edge)
- Turso (libSQL)

**Features:**
- Repository pattern
- Connection pooling
- Transaction support
- Query caching
- Health checks

**Usage:**
```typescript
import { PostgresAdapter } from '@arrowera/db';

const db = new PostgresAdapter(process.env.DATABASE_URL);
const users = await db.query<User>('SELECT * FROM users');
```

---

### @arrowera/auth

Authentication and authorization system.

**Features:**
- JWT-based authentication
- OAuth providers (Google, GitHub, etc.)
- Session management
- MFA/TOTP support
- Role-based access control

**Usage:**
```typescript
import { AuthService } from '@arrowera/auth';

const auth = new AuthService(config.getAuth());
const session = await auth.createSession(userId);
```

---

### @arrowera/security

Security middleware and utilities.

**Features:**
- Rate limiting (sliding window)
- API key management
- Permission system
- Audit logging
- CSRF protection
- Request validation

**Usage:**
```typescript
import { RateLimiter } from '@arrowera/security';

const limiter = new RateLimiter();
const result = limiter.checkRateLimit(ip, endpoint);
```

---

### @arrowera/logging

Enterprise structured logging with Pino.

**Features:**
- JSON structured logs
- Request correlation IDs
- Sensitive data redaction
- Multiple log levels
- Audit log support

**Usage:**
```typescript
import { logger } from '@arrowera/logging';

logger.info('User logged in', { userId: '123' });
logger.error('Database error', error, { query: sql });
```

---

### @arrowera/monitoring

Metrics and observability.

**Features:**
- Prometheus-compatible metrics
- System metrics collection
- Custom metric creation
- Health check endpoints

**Usage:**
```typescript
import { registry, createApiMetrics } from '@arrowera/monitoring';

const metrics = createApiMetrics(registry);
metrics.requestCount.inc();
```

---

## Data Flow

### Request Processing

1. **Incoming Request** → Nginx/Load Balancer
2. **TLS Termination** → HTTPS
3. **Security Headers** → CSP, HSTS, etc.
4. **Rate Limiting** → Check limits
5. **Authentication** → Validate JWT/session
6. **Authorization** → Check permissions
7. **Request Validation** → Zod schema
8. **Business Logic** → Service layer
9. **Data Access** → Repository pattern
10. **Response** → Standardized format
11. **Logging** → Structured logs
12. **Metrics** → Update counters

---

## Security Architecture

### Defense Layers

1. **Network**: TLS, firewall, DDoS protection
2. **Application**: Auth, rate limiting, input validation
3. **Data**: Encryption, parameterized queries
4. **Operational**: Audit logs, secret management

### Authentication Flow

```
User → Login → Validate Credentials → Generate JWT → 
Set HTTP-only Cookie → Return Session → 
Middleware Validates → Allow Request
```

### Token Structure

```json
{
  "sub": "user_123",
  "iat": 1704067200,
  "exp": 1704068100,
  "roles": ["admin"],
  "permissions": ["content.write"]
}
```

---

## Deployment Architecture

### Development

```
Local Machine
├── Node.js App (port 3000)
├── SQLite (file-based)
└── Memory cache
```

### Production (Docker)

```
Docker Compose
├── App Container (×N for scaling)
├── PostgreSQL Container
├── Redis Container
└── Nginx Container
```

### Production (Kubernetes)

```
Kubernetes Cluster
├── Deployment (app pods ×N)
├── StatefulSet (PostgreSQL)
├── StatefulSet (Redis)
├── Service (load balancing)
├── Ingress (routing)
└── ConfigMap/Secrets
```

---

## Scalability

### Horizontal Scaling

- Stateless application servers
- Shared database (PostgreSQL)
- Distributed cache (Redis)
- Load balancer distribution

### Vertical Scaling

- Increase container resources
- Optimize database queries
- Add database indexes
- Implement query caching

### Caching Strategy

```
Request → Check Cache → Hit: Return
                    ↓ Miss
                Query DB → Store in Cache → Return
```

**Cache TTLs:**
- Session data: 24 hours
- Query results: 5 minutes
- Static assets: 1 year

---

## Observability

### Logging

- Structured JSON logs
- Correlation IDs for tracing
- Centralized log aggregation
- Log levels: debug, info, warn, error, fatal

### Metrics

- Request rates
- Response latencies (p50, p95, p99)
- Error rates
- Resource utilization
- Database performance

### Tracing

- OpenTelemetry integration
- Distributed tracing
- Span instrumentation
- Trace exporters (Jaeger, Zipkin)

---

## Extension Points

### Plugins

```typescript
// Plugin definition
export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  async install(ctx) {
    // Register routes
    ctx.router.get('/api/plugin', handler);
    
    // Register hooks
    ctx.hooks.on('content.create', onCreate);
  }
};
```

### Custom Adapters

```typescript
// Custom storage adapter
export class CustomStorageAdapter implements StorageAdapter {
  async upload(file: File): Promise<string> {
    // Custom implementation
  }
}
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Astro, React | UI rendering |
| Styling | TailwindCSS | CSS framework |
| Backend | Node.js 20 | Runtime |
| Language | TypeScript | Type safety |
| Database | PostgreSQL | Primary storage |
| Cache | Redis | Session/cache |
| Storage | S3/R2 | Object storage |
| Queue | BullMQ | Job processing |
| Monitoring | Prometheus | Metrics |
| Logging | Pino | Structured logs |

---

## Future Architecture (Phase 2+)

### AI Integration

```
AI Gateway
├── Local Models (Ollama, llama.cpp)
├── Cloud Providers (OpenAI, Anthropic)
├── Agent Framework
└── RAG Pipeline
```

### Multi-Tenancy

```
Organization
├── Workspace 1
│   ├── Team A
│   └── Team B
└── Workspace 2
    └── Team C
```

### Event-Driven Architecture

```
Event Bus
├── Content Events
├── User Events
├── System Events
└── Webhook Delivery
```

---

## Decision Records

###ADR-001: Monorepo Structure

**Decision**: Use pnpm workspaces with package isolation

**Rationale**:
- Code sharing between packages
- Atomic commits
- Simplified dependency management
- Independent versioning possible

### ADR-002: Database Abstraction

**Decision**: Adapter pattern for multi-database support

**Rationale**:
- Flexibility for different deployments
- Edge computing support (D1)
- Development simplicity (SQLite)
- Production robustness (PostgreSQL)

### ADR-003: JWT Authentication

**Decision**: Stateless JWT with refresh tokens

**Rationale**:
- Horizontal scaling friendly
- No session storage required
- Built-in expiration
- Refresh token rotation for security

---

## Support

- Documentation: `/docs`
- API Reference: `/docs/API_REFERENCE.md`
- Contributing: `/docs/CONTRIBUTING.md`
- Issues: GitHub Issues
