# Bond.Credit Deployment Guide

This document outlines the deployment process for the Bond.Credit Risk Monitor Engine across different environments.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Nginx Proxy    │    │   Next.js App   │
│   (CloudFlare)  │◄──►│   (Rate Limit)   │◄──►│   (3 replicas)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   PostgreSQL     │    │      Redis      │
│   (Prometheus)  │    │   (Primary/Rep)  │    │   (Sessions)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Kubernetes cluster (for production)
- Domain name with SSL certificates

### Local Development
```bash
# Clone repository
git clone https://github.com/bond-dot-credit/risk-monitor-engine.git
cd risk-monitor-engine

# Copy environment template
cp env.template .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

### Docker Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## 📋 Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://host:6379` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-super-secure-jwt-secret-key` |
| `NODE_ENV` | Environment mode | `production` |

### Optional Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `LOG_LEVEL` | Logging level | `info` |
| `API_RATE_LIMIT` | Requests per minute | `100` |

## 🔧 CI/CD Pipeline

### GitHub Actions Workflows

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Runs on: `push` to `main`/`development`, `pull_request` to `main`
   - Steps: Lint → Test → Build → Security Scan → Docker Build

2. **Deploy Pipeline** (`.github/workflows/deploy.yml`)
   - Runs on: `push` to `main` (staging), `tag` push (production)
   - Steps: Build → Deploy → Health Check → Rollback (if needed)

### Pipeline Stages

```mermaid
graph LR
    A[Code Push] --> B[Lint & Test]
    B --> C[Build App]
    C --> D[Security Scan]
    D --> E[Docker Build]
    E --> F[Deploy Staging]
    F --> G[Health Check]
    G --> H[Deploy Production]
    H --> I[Monitor]
```

## 🏭 Production Deployment

### Kubernetes Deployment

1. **Prepare Secrets**
```bash
# Create namespace
kubectl create namespace bond-credit

# Create secrets
kubectl create secret generic bond-credit-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=redis-url="redis://..." \
  --from-literal=jwt-secret="your-jwt-secret" \
  -n bond-credit
```

2. **Deploy Application**
```bash
# Apply manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Check status
kubectl get pods -n bond-credit
kubectl get svc -n bond-credit
```

3. **Configure Ingress**
```bash
# Install nginx-ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Apply ingress configuration
kubectl apply -f k8s/service.yaml
```

### Docker Swarm Deployment

```bash
# Initialize swarm (if not already)
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml bond-credit

# Check services
docker service ls
docker service logs bond-credit_app
```

## 📊 Monitoring & Observability

### Health Checks

- **Application**: `GET /api/health`
- **Kubernetes**: Liveness, Readiness, Startup probes
- **Docker**: Health check in Dockerfile

### Monitoring Stack

1. **Prometheus** - Metrics collection
   - Endpoint: `http://prometheus:9090`
   - Config: `prometheus.yml`

2. **Grafana** - Dashboards
   - Endpoint: `http://grafana:3000`
   - Default: admin/admin

3. **Application Metrics**
   - Response times
   - Error rates
   - Resource usage
   - Business metrics

### Key Metrics to Monitor

| Metric | Threshold | Action |
|--------|-----------|--------|
| Response Time | > 500ms | Scale up |
| Error Rate | > 5% | Alert team |
| Memory Usage | > 80% | Scale up |
| CPU Usage | > 70% | Scale up |

## 🔒 Security

### SSL/TLS Configuration
- Certificates in `/etc/nginx/ssl/`
- Automatic renewal with cert-manager (K8s)
- HSTS headers enabled
- TLS 1.2+ only

### Network Security
- Rate limiting: 100 req/min per IP
- CORS properly configured
- Security headers enabled
- Private networks for inter-service communication

### Secrets Management
- Environment variables for sensitive data
- Kubernetes secrets for production
- Never commit secrets to repository
- Rotate secrets regularly

## 🚨 Troubleshooting

### Common Issues

1. **Application Won't Start**
```bash
# Check logs
docker logs bond-credit-app
kubectl logs -f deployment/bond-credit-app -n bond-credit

# Check environment
docker exec -it bond-credit-app env
```

2. **Database Connection Issues**
```bash
# Test connection
docker exec -it postgres psql -U bondcredit -d bondcredit
kubectl exec -it deployment/postgres -- psql -U bondcredit
```

3. **High Memory Usage**
```bash
# Check processes
docker exec -it bond-credit-app top
kubectl top pod -n bond-credit
```

### Performance Optimization

1. **Database**
   - Add indexes for frequently queried fields
   - Use connection pooling
   - Monitor slow queries

2. **Application**
   - Enable Redis caching
   - Optimize bundle size
   - Use CDN for static assets

3. **Infrastructure**
   - Scale horizontally with replicas
   - Use autoscaling based on metrics
   - Implement circuit breakers

## 📈 Scaling

### Horizontal Scaling
```bash
# Kubernetes
kubectl scale deployment bond-credit-app --replicas=5 -n bond-credit

# Docker Swarm
docker service scale bond-credit_app=5
```

### Auto-scaling
- HPA configured for CPU/Memory thresholds
- Scales between 3-10 replicas
- Metrics-based scaling available

## 🔄 Rollback Procedures

### Kubernetes Rollback
```bash
# Check rollout history
kubectl rollout history deployment/bond-credit-app -n bond-credit

# Rollback to previous version
kubectl rollout undo deployment/bond-credit-app -n bond-credit

# Rollback to specific revision
kubectl rollout undo deployment/bond-credit-app --to-revision=2 -n bond-credit
```

### Docker Rollback
```bash
# Tag and push previous version
docker tag bond-credit:latest bond-credit:rollback
docker push bond-credit:rollback

# Update service
docker service update --image bond-credit:rollback bond-credit_app
```

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: `/docs`
- **Emergency**: Check runbooks in `/docs/runbooks`
- **Team Contact**: DevOps team Slack channel

---

**Last Updated**: 2024-01-01
**Version**: 1.0.0
**Maintainer**: Bond.Credit DevOps Team
