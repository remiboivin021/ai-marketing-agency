import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gatewaySignals } from './data/gateway.js';
import { readProjects, spawnProject } from './data/agents.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

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