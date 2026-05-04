# Docker Setup - Containerization Guide

## Overview

The AI Marketing Agency dashboard is containerized using **Docker** and **docker-compose** for production deployment. This setup includes:

- **app**: Node.js 18-alpine application (multi-stage build)
- **redis**: Redis 7-alpine with AOF persistence
- **nginx**: Reverse proxy with HTTPS (self-signed cert for P0)

---

## Prerequisites

- Docker 20.10+ installed
- Docker Compose v3.8+ installed
- OpenRouter API key (for LLM functionality)

---

## Quick Start

### 1. Clone and Configure

```bash
git clone <repo-url>
cd ai-marketing-agency
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
OPENROUTER_API_KEY=your_actual_api_key_here
ADMIN_USER=admin
ADMIN_PASSWORD=your_secure_password
```

### 2. Build and Run

```bash
# Build the images
docker-compose build

# Start all services (detached mode)
docker-compose up -d

# Check status
docker-compose ps
```

### 3. Access the Dashboard

- **HTTP**: `http://localhost` (redirects to HTTPS)
- **HTTPS**: `https://localhost` (self-signed cert - accept browser warning)
- **Login**: Use `ADMIN_USER` / `ADMIN_PASSWORD` from `.env`

---

## Architecture

### Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| **app** | Built from Dockerfile | 3001 (internal) | Node.js Express backend + Vite frontend |
| **redis** | redis:7-alpine | 6379 (internal) | Task queue + pub/sub |
| **nginx** | nginx:alpine | 80, 443 | Reverse proxy + HTTPS termination |

### Networks

All services communicate on a custom bridge network: `ai-network`

### Volumes

| Volume | Purpose | Host Path |
|---------|---------|-----------|
| `app-data` | Persistent `agents.json` storage | `/app/data` in container |
| `redis-data` | Redis AOF persistence | `/data` in container |

---

## Dockerfile (Multi-stage Build)

The `Dockerfile` uses a multi-stage build for smaller production images:

### Stage 1: Build (node:18-alpine)
- Installs dependencies
- Builds frontend with Vite
- Outputs static files to `dist/`

### Stage 2: Production (node:18-alpine)
- Copies only necessary files (no dev dependencies)
- Copies built frontend from Stage 1
- Runs as non-root user (`nodejs`)
- Exposes port 3001

**Benefits:**
- Smaller image size (no build tools in production)
- Improved security (non-root user)
- Faster deployment

---

## Nginx Configuration

### Reverse Proxy

- Listens on ports 80 (HTTP) and 443 (HTTPS)
- HTTP redirects to HTTPS
- Proxies `/api/*` requests to Node.js app (port 3001)
- Serves frontend static files directly (or proxies to app)

### HTTPS (P0)

- **Self-signed certificate** for P0 (see `nginx/ssl/` directory)
- Browser will show security warning (accept to proceed)
- For production: Replace with Let's Encrypt (see Future Improvements)

### Generating Self-Signed Certs (if needed)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/server.key \
  -out nginx/ssl/server.crt \
  -subj "/CN=localhost"
```

---

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f redis
docker-compose logs -f nginx
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Stop and Clean

```bash
# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Rebuild After Changes

```bash
docker-compose up -d --build
```

---

## Health Checks

All services have health checks configured:

- **app**: `GET /health` (expects 200)
- **redis**: `redis-cli ping` (expects PONG)
- **nginx**: `wget http://localhost/health` (expects 200)

Check health:
```bash
docker-compose ps
# Look for "health: healthy" status
```

---

## Backup and Persistence

### Redis Data

Redis uses AOF (Append Only File) persistence:
- Configured with `--appendonly yes --appendfsync everysec`
- Stored in `redis-data` volume
- Survives container restarts

### agents.json

The application data file (`agents.json`) is backed up via:
- `app-data` volume mounted to `/app/data`
- Written by the Node.js app when changes occur
- Survives container restarts and recreations

**Manual Backup:**
```bash
docker cp ai-marketing-app:/app/data/agents.json ./backup/agents-$(date +%Y%m%d).json
```

---

## Troubleshooting

### App Container Keeps Restarting

Check logs:
```bash
docker-compose logs app
```

Common issues:
- Missing `OPENROUTER_API_KEY` in `.env`
- Redis not ready (set `WAIT_FOR_REDIS=true` in `.env`)
- Port 3001 already in use on host

### Redis Connection Failed

```bash
# Check if Redis is running
docker-compose exec redis redis-cli ping
# Should return "PONG"
```

Verify `REDIS_URL` in `.env`:
```
REDIS_URL=redis://redis:6379
```

### HTTPS Certificate Warning

- Expected for self-signed certificates
- Click "Advanced" → "Proceed to localhost (unsafe)" in Chrome
- For production, use Let's Encrypt (see Future Improvements)

### Nginx 502 Bad Gateway

```bash
# Check if app is healthy
docker-compose ps app
docker-compose logs nginx
```

Usually caused by app not starting or wrong proxy URL.

---

## Future Improvements

1. **Let's Encrypt SSL** - Replace self-signed certs (ADR-004)
2. **Multi-stage docker-compose** - Separate dev/prod profiles
3. **Docker Swarm/Kubernetes** - Orchestration for scaling
4. **Image scanning** - Security scans in CI pipeline
5. **Log aggregation** - Centralized logging (ELK, Loki)

---

## Files Created

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build (node:18-alpine) |
| `docker-compose.yml` | 3-service setup (app + redis + nginx) |
| `nginx/default.conf` | Reverse proxy + HTTPS config |
| `nginx/ssl/` | Self-signed SSL certificates |
| `.dockerignore` | Optimizes Docker build context |

---

## Related ADR

- [ADR-004: Docker Containerization](../../governance/adr/26-05-04_docker-containerization.md)
