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