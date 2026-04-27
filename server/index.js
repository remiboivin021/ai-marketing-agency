import express from 'express';
import { gatewaySignals } from './data/gateway.js';
import { readProjects, spawnProject } from './data/agents.js';

const app = express();
const PORT = 3001;

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

// Send message to an agent and get response
app.post('/api/agents/:id/message', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  
  // TODO: Integrate with LLM agent when feature/agentic-llm is merged
  // For now, return a placeholder response
  const response = {
    id: `resp_${Date.now()}`,
    projectId: id,
    message: message,
    response: `[Agent ${id}] Received: ${message}. (LLM integration pending)`,
    timestamp: new Date().toISOString()
  };
  
  res.json(response);
});

// Spawn a new agent project
app.post('/api/agents', (req, res) => {
  try {
    const newProject = spawnProject(req.body);
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});