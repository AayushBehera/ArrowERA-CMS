# ArrowERA CMS - Deployment Guide

## Overview

This guide covers deployment options for ArrowERA CMS across various environments.

---

## Prerequisites

### System Requirements

- **CPU**: 2+ cores (4+ recommended for production)
- **RAM**: 2GB minimum (4GB+ recommended)
- **Storage**: 10GB+ SSD
- **OS**: Linux (Ubuntu 20.04+, Debian 11+, Alpine), macOS, Windows (WSL2)

### Software Requirements

- Node.js 20+
- pnpm 8+
- Docker 20+ (for containerized deployments)
- PostgreSQL 15+ (or SQLite for development)
- Redis 7+ (optional but recommended)

---

## Deployment Options

### Option 1: Docker Compose (Recommended)

#### Quick Start

```bash
# Clone repository
git clone https://github.com/arrowera/cms.git
cd cms

# Copy environment file
cp .env.example .env

# Generate secrets
openssl rand -hex 32 > /tmp/auth_secret
echo "AUTH_SECRET=$(cat /tmp/auth_secret)" >> .env
openssl rand -hex 32 > /tmp/csrf_secret
echo "CSRF_SECRET=$(cat /tmp/csrf_secret)" >> .env

# Start services
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d
```

#### Verify Deployment

```bash
# Check service health
curl http://localhost:3000/health

# View logs
docker-compose -f infrastructure/docker/docker-compose.prod.yml logs -f app
```

#### Configuration

Edit `.env` file:

```env
# Application
NODE_ENV=production
APP_URL=https://your-domain.com
PORT=3000

# Database
POSTGRES_USER=arrowera
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=arrowera_cms
DATABASE_URL=postgresql://arrowera:<password>@postgres:5432/arrowera_cms

# Redis
REDIS_PASSWORD=<secure-password>
REDIS_URL=redis://:<password>@redis:6379

# Authentication
AUTH_SECRET=<32-char-secret>
CSRF_SECRET=<32-char-secret>

# Optional: SSL/TLS
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

---

### Option 2: VPS Deployment (Traditional)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx
```

#### Step 2: Database Setup

```bash
# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE arrowera_cms;
CREATE USER arrowera WITH PASSWORD '<secure-password>';
GRANT ALL PRIVILEGES ON DATABASE arrowera_cms TO arrowera;
EOF
```

#### Step 3: Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/arrowera-cms
sudo chown $USER:$USER /var/www/arrowera-cms

# Clone repository
cd /var/www/arrowera-cms
git clone <repository-url> .

# Install dependencies
pnpm install --frozen-lockfile

# Build application
pnpm build

# Configure environment
cp .env.example .env
# Edit .env with production values
```

#### Step 4: Systemd Service

Create `/etc/systemd/system/arrowera-cms.service`:

```ini
[Unit]
Description=ArrowERA CMS
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/arrowera-cms/apps/emdash-demo
ExecStart=/usr/bin/node dist/server/entry.mjs
Restart=always
RestartSec=10
Environment=NODE_ENV=production
EnvironmentFile=/var/www/arrowera-cms/.env

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/var/www/arrowera-cms/data

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable arrowera-cms
sudo systemctl start arrowera-cms
sudo systemctl status arrowera-cms
```

#### Step 5: Nginx Configuration

Create `/etc/nginx/sites-available/arrowera-cms`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static assets
    location /assets {
        alias /var/www/arrowera-cms/apps/emdash-demo/dist/client/assets;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/arrowera-cms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 6: SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 3: Cloud Deployment

#### AWS Deployment

Using ECS Fargate:

1. **Containerize** (already done via Dockerfile)
2. **Push to ECR**:
   ```bash
   aws ecr create-repository --repository-name arrowera-cms
   docker tag arrowera-cms:latest <account>.dkr.ecr.region.amazonaws.com/arrowera-cms:latest
   docker push <account>.dkr.ecr.region.amazonaws.com/arrowera-cms:latest
   ```
3. **Create Task Definition** in ECS
4. **Create Service** with load balancer
5. **Use RDS** for PostgreSQL
6. **Use ElastiCache** for Redis

#### Google Cloud Platform

Using Cloud Run:

1. **Build container**:
   ```bash
   gcloud builds submit --tag gcr.io/project-id/arrowera-cms
   ```
2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy arrowera-cms \
     --image gcr.io/project-id/arrowera-cms \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```
3. **Use Cloud SQL** for PostgreSQL
4. **Use Memorystore** for Redis

#### Azure

Using Azure Container Apps:

1. **Push to ACR**
2. **Create Container App Environment**
3. **Deploy Container App**
4. **Use Azure Database for PostgreSQL**
5. **Use Azure Cache for Redis**

---

### Option 4: Kubernetes Deployment

#### Prerequisites

- Kubernetes cluster (v1.25+)
- kubectl configured
- Helm 3+

#### Installation

```bash
# Add Helm repository (if available)
helm repo add arrowera https://charts.arrowera.com
helm repo update

# Install with Helm
helm install arrowera-cms arrowera/cms \
  --namespace arrowera \
  --create-namespace \
  -f values.yaml
```

#### Manual Deployment

Apply manifests from `infrastructure/kubernetes/`:

```bash
kubectl apply -f infrastructure/kubernetes/configmap.yaml
kubectl apply -f infrastructure/kubernetes/secrets.yaml
kubectl apply -f infrastructure/kubernetes/deployment.yaml
kubectl apply -f infrastructure/kubernetes/service.yaml
kubectl apply -f infrastructure/kubernetes/ingress.yaml
```

---

## Health Checks

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `/health` | Overall health |
| `/health/db` | Database connectivity |
| `/health/cache` | Cache connectivity |
| `/health/auth` | Authentication service |

### Kubernetes Probes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Monitoring

### Metrics Endpoints

- Prometheus metrics: `/metrics`

### Key Metrics

- Request rate
- Response latency (p50, p95, p99)
- Error rate
- Memory usage
- CPU usage
- Database query times

### Alerting

Configure alerts for:
- Error rate > 1%
- p95 latency > 500ms
- Memory usage > 80%
- Disk usage > 80%
- Service down

---

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump -U arrowera arrowera_cms > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -U arrowera arrowera_cms < backup_YYYYMMDD_HHMMSS.sql
```

### Automated Backups

Use cron job:

```bash
# /etc/cron.daily/arrowera-backup
#!/bin/bash
BACKUP_DIR="/backups/arrowera"
mkdir -p $BACKUP_DIR
pg_dump -U arrowera arrowera_cms | gzip > $BACKUP_DIR/db_$(date +%Y%m%d).sql.gz
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

---

## Scaling

### Horizontal Scaling

```bash
# Docker Swarm
docker service scale arrowera_app=3

# Kubernetes
kubectl scale deployment arrowera-cms --replicas=3
```

### Vertical Scaling

Increase resources in deployment configuration:

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "2000m"
```

---

## Troubleshooting

### Common Issues

#### Application won't start

```bash
# Check logs
docker-compose logs app
journalctl -u arrowera-cms -f

# Verify environment
node -e "console.log(process.env)"
```

#### Database connection failed

```bash
# Test connection
psql -h localhost -U arrowera -d arrowera_cms

# Check PostgreSQL status
systemctl status postgresql
```

#### High memory usage

```bash
# Check memory
docker stats
kubectl top pods

# Increase limits or optimize queries
```

---

## Support

For deployment issues:
- Documentation: https://docs.arrowera.com
- GitHub Issues: https://github.com/arrowera/cms/issues
- Discord: https://discord.gg/arrowera
