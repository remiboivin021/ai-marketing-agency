// Express entry point
// Handles API routes, input validation, rate limiting, and startup checks
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gatewaySignals } from './data/gateway.js';
import { readProjects, spawnProject } from './data/agents.js';
import { callLLM, sanitizeTask } from './llm/openrouter.js';
import { getQueueStats, isRedisConnected } from './queue/index.js';
import { topologicalSort, detectCycle } from './queue/dag.js';
import { basicAuth } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const { name, task, dependsOn } = req.body || {};
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

  // Validate dependsOn (must be array of strings if provided)
  if (dependsOn !== undefined) {
    if (!Array.isArray(dependsOn)) {
      errors.push('dependsOn must be an array');
    } else {
      // Check all entries are strings
      const invalidEntries = dependsOn.filter(d => typeof d !== 'string');
      if (invalidEntries.length > 0) {
        errors.push('dependsOn must contain only strings');
      }

      // Check for cycles (if we have existing agents)
      if (dependsOn.length > 0) {
        const projects = readProjects().projects || [];
        const allAgentIds = projects.map(p => p.id);
        
        // Add the new agent ID temporarily for cycle detection
        const tempId = `p${Date.now()}`;
        const dependsOnMap = {};
        projects.forEach(p => { dependsOnMap[p.id] = p.dependsOn || []; });
        dependsOnMap[tempId] = dependsOn;

        if (detectCycle(dependsOnMap, [...allAgentIds, tempId])) {
          errors.push('Cycle detected in dependsOn');
          // eslint-disable-next-line no-console
          console.error(JSON.stringify({ level: 'ERROR', ts: new Date().toISOString(), event: 'validation.cycle', dependsOn }));
        }
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join('; ') });
  }

  next();
}

// --- App setup ---
const app = express();

// Trust proxy (nginx reverse proxy)
app.set('trust proxy', true);

// Apply Basic Auth to all /api/* routes
app.use('/api', basicAuth);

// Charger les agents depuis les fichiers JSON
function loadAgentsFromJSON() {
  const agentsDir = path.join(__dirname, 'data', 'agents');
  const agents = [];
  
  if (!fs.existsSync(agentsDir)) {
    console.log('[Agents] Dossier server/data/agents/ non trouvé');
    return agents;
  }
  
  const files = fs.readdirSync(agentsDir).filter(f => f.endsWith('.json'));
  console.log(`[Agents] Chargement de ${files.length} fichier(s) JSON...`);
  
  for (const file of files) {
    try {
      const filePath = path.join(agentsDir, file);
      const agentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Convertir le format JSON en format agent projet
      const project = {
        id: agentData.id,
        name: agentData.name,
        description: agentData.description,
        prompt: agentData.prompt,
        x: 0.2 + Math.random() * 0.6,
        y: 0.2 + Math.random() * 0.6,
        metrics: { uptime: '—', latency: '—' },
        subAgents: agentData.tasks.map(task => ({
          id: task.id,
          description: task.description,
          tools: task.tools,
          status: 'idle'
        }))
      };
      
      agents.push(project);
      console.log(`[Agents] Chargé: ${agentData.name} (${agentData.tasks.length} tâches)`);
    } catch (err) {
      console.error(`[Agents] Erreur chargement ${file}:`, err.message);
    }
  }
  
  return agents;
}

// Charger les agents au démarrage
const jsonAgents = loadAgentsFromJSON();

app.use(express.json());

app.get('/api/gateway', (_req, res) => {
  res.json(gatewaySignals);
});

app.get('/api/agents', (_req, res) => {
  const projects = readProjects().projects;
  // Fusionner les agents JSON avec les projects existants
  const allAgents = [...jsonAgents, ...projects];
  res.json(allAgents);
});

app.get('/api/projects', (_req, res) => {
  const projects = readProjects().projects;
  const allAgents = [...jsonAgents, ...projects];
  res.json(allAgents);
});

// Send message to an agent and get response
app.post('/api/agents/:id/message', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  
  try {
    // Get agent config from JSON file if exists
    let systemPrompt = `Tu es un agent IA名为 ${id}. Tu répond de manière utile et concise.`;
    
    // Try to load agent from JSON
    const agentsDir = path.join(__dirname, 'data', 'agents');
    if (fs.existsSync(agentsDir)) {
      const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.json'));
      for (const file of agentFiles) {
        try {
          const agentData = JSON.parse(fs.readFileSync(path.join(agentsDir, file), 'utf-8'));
          if (agentData.id === id) {
            systemPrompt = agentData.prompt || systemPrompt;
            break;
          }
        } catch (e) {
          // ignore
        }
      }
    }
    
    // Call LLM
    const llmResult = await callLLM({
      systemPrompt,
      userTask: sanitizeTask(message),
      agentId: id,
      skill: 'agent_message'
    });
    
    const responseText = llmResult.error || llmResult.result || ' Désolé, une erreur est survenue.';
    
    const response = {
      id: `resp_${Date.now()}`,
      projectId: id,
      message: message,
      response: responseText,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
  } catch (err) {
    console.error('[Message] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
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
  const redisStatus = isRedisConnected() ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    redis: redisStatus,
    timestamp: new Date().toISOString()
  });
});

// Get queue statistics
app.get('/api/queue', async (_req, res) => {
  try {
    const stats = await getQueueStats();
    res.json(stats);
  } catch (err) {
    console.error('[api/queue] Error:', err.message);
    res.status(500).json({ error: 'Failed to get queue stats' });
  }
});

// Stop an agent (cancel pending/queued jobs)
app.post('/api/agents/:id/stop', async (req, res) => {
  const { id } = req.params;
  
  try {
    const store = readProjects();
    const project = store.projects.find(p => p.id === id);
    
    if (!project) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Get queue if available
    const { getQueue } = require('./queue/index.js');
    const queue = getQueue();
    
    let stoppedCount = 0;
    
    if (queue && isRedisConnected()) {
      // Remove pending jobs for this agent's sub-agents
      const jobs = await queue.getJobs(['waiting', 'delayed']);
      for (const job of jobs) {
        if (job.data.agentId === id) {
          await job.remove();
          stoppedCount++;
          
          // Update sub-agent status
          if (project.subAgents) {
            const subAgent = project.subAgents.find(sa => sa.queueJobId === job.id);
            if (subAgent) {
              subAgent.status = 'error';
              subAgent.error = 'Stopped by user';
              subAgent.completed_at = new Date().toISOString();
            }
          }
        }
      }
    }
    
    // Update any running sub-agents to error
    if (project.subAgents) {
      project.subAgents.forEach(sa => {
        if (sa.status === 'running' || sa.status === 'queued') {
          sa.status = 'error';
          sa.error = 'Stopped by user';
          sa.completed_at = new Date().toISOString();
          stoppedCount++;
        }
      });
    }
    
    // Persist changes
    const idx = store.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      store.projects[idx] = project;
      writeProjects(store.projects);
    }
    
    res.json({ status: 'stopped', agentId: id, stoppedCount });
  } catch (err) {
    console.error('[api/agents/stop] Error:', err.message);
    res.status(500).json({ error: 'Failed to stop agent' });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ level: 'INFO', ts: new Date().toISOString(), event: 'server.started', port: PORT }));
});