import express from 'express';
import { gatewaySignals } from './data/gateway.js';
import { agentsProjects, projectsList } from './data/agents.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// Routes
app.get('/api/gateway', (_req, res) => {
  res.json(gatewaySignals);
});

app.get('/api/agents', (_req, res) => {
  res.json(agentsProjects);
});

app.get('/api/projects', (_req, res) => {
  res.json(projectsList);
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});