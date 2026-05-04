# Redis Setup for Agent Orchestration

This document explains how to set up Redis for the agent orchestration system using Bull queue.

## Prerequisites

- Redis server (local or remote)
- Node.js 18+ (for built-in fetch API)

## Local Development Setup

### Option 1: Docker (Recommended)

```bash
# Run Redis with persistence enabled
docker run -d \
  --name ai-marketing-redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes
```

This enables AOF (Append Only File) persistence as required by invariant I-03 ("State persisted - pas de in-memory only").

### Option 2: Native Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl enable redis
sudo systemctl start redis
```

Enable AOF persistence by editing `/etc/redis/redis.conf`:
```
appendonly yes
appendfsync everysec
```

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

Edit `/usr/local/etc/redis.conf` to enable AOF:
```
appendonly yes
```

## Configuration

### Environment Variables

Update `.env` (create from `.env.example`):

```bash
# Required: OpenRouter API key
OPENROUTER_API_KEY=sk-your-key-here

# Redis connection URL (default: redis://localhost:6379)
REDIS_URL=redis://localhost:6379

# Queue concurrency (default: 5)
QUEUE_CONCURRENCY=5
```

### Verifying Redis Connection

```bash
# Test Redis is running
redis-cli ping
# Should return: PONG

# Check AOF persistence
redis-cli CONFIG GET appendonly
# Should return: "appendonly" "yes"
```

## Production Considerations

### Managed Redis Services

- **Redis Cloud**: https://redis.com/cloud/
- **AWS ElastiCache**: Use Redis 6.2+ with AOF enabled
- **Google Cloud Memorystore**: Redis 6.x+ with persistence

### Security

- Always use strong passwords for Redis in production
- Use TLS/SSL for Redis connections (rediss:// URL scheme)
- Restrict Redis port (6379) to application servers only
- Consider using VPC peering for cloud deployments

### Monitoring

Check queue statistics via API:
```bash
curl http://localhost:3001/api/queue
```

Expected response:
```json
{
  "status": "ok",
  "redis": "connected",
  "concurrency": 5,
  "jobs": {
    "waiting": 0,
    "active": 0,
    "completed": 10,
    "failed": 1
  }
}
```

Health check includes Redis status:
```bash
curl http://localhost:3001/health
# Returns: {"status":"ok","redis":"connected","timestamp":"2026-05-04T..."}
```

## Fallback Mode

If Redis is unavailable at startup:

1. Server logs warning: `[queue] Redis unavailable, falling back to synchronous execution mode`
2. Queue not initialized, workers not started
3. Agents spawned with tasks execute synchronously (no parallelism)
4. Health check shows: `"redis":"disconnected"`

This ensures the system remains operational even without Redis (with degraded performance).

## Troubleshooting

### Redis connection fails

```bash
# Check if Redis is running
ps aux | grep redis

# Check logs
docker logs ai-marketing-redis  # Docker
journalctl -u redis  # systemd
```

### Queue not processing jobs

1. Verify Redis is connected: `GET /health`
2. Check queue stats: `GET /api/queue`
3. View Bull Dashboard (optional): Install `@bull-board/express` for UI

### High memory usage

Adjust Redis max memory in `redis.conf`:
```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

## References

- [Redis Documentation](https://redis.io/docs/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)
- [IORedis Documentation](https://github.com/luin/ioredis)
- [ADR-001: Task Queue System with Redis/Bull](../../docs/governance/adr/26-05-04_task-queue-redis-bull.md)
- [ADR-002: Agent Orchestration Model](../../docs/governance/adr/26-05-04_agent-orchestration-model.md)
