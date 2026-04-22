// Express entry point
// Handles API routes, input validation, rate limiting, and startup checks
import express from 'express';
import { gatewaySignals } from './data/gateway.js';
import { readProjects, spawnProject } from './data/agents.js';

// --- Config ---
const PORT = 3001;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

// --- In-memory rate limit store (resets on restart) ---
const rateLimitStore = new Map();

// --- Middleware: rate limiting per IP ---
function rateLimitMiddleware(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Clean expired entries for this IP
  const timestamps = rateLimitStore.get(ip) || [];
  const recentTimestamps = timestamps.filter(t => t > windowStart);

  if (recentTimestamps.length >= RATE_LIMIT_MAX) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level: 'WARN', ts: new Date().toISOString(), event: 'rate.limit.exceeded', ip }));
    return res.status(429).json({ error: 'Too many requests. Please wait before spawning again.' });
  }

  recentTimestamps.push(now);
  rateLimitStore.set(ip, recentTimestamps);
  next();
}

// --- Middleware: input validation for POST /api/agents ---
function validateSpawnRequest(req, res, next) {
  const { name, task } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string') {
    errors.push('name is required and must be a string');
  } else if (name.length > 64) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level: 'WARN', ts: new Date().toISOString(), event: 'validation.failed', field: 'name', error: 'exceeds max length' }));
    return res.status(400).json({ error: 'name exceeds max length (64 chars)' });
  }

  if (task !== undefined && task !== null) {
    if (typeof task !== 'string') {
      errors.push('task must be a string');
    } else if (task.length > 4000) {
      // eslint-disable-next-line no-console
      console.error(JSON.stringify({ level: 'WARN', ts: new Date().toISOString(), event: 'validation.failed', field: 'task', error: 'exceeds max length' }));
      return res.status(400).json({ error: 'task exceeds max length (4000 chars)' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  next();
}

// --- App setup ---
const app = express();

app.use(express.json());

app.get('/api/gateway', (_req, res) => {
  res.json(gatewaySignals);
});

app.get('/api/agents', (_req, res) => {
  res.json(readProjects().projects);
});

app.get('/api/projects', (_req, res) => {
  res.json(readProjects().projects);
});

app.post('/api/agents', rateLimitMiddleware, validateSpawnRequest, async (req, res) => {
  try {
    const newProject = await spawnProject(req.body);
    res.status(201).json(newProject);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify({ level: 'ERROR', ts: new Date().toISOString(), event: 'agent.spawn.failed', error: err.message?.slice(0, 200) }));
    res.status(500).json({ error: 'Agent spawn failed' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// --- Start server ---
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ level: 'INFO', ts: new Date().toISOString(), event: 'server.started', port: PORT }));
});