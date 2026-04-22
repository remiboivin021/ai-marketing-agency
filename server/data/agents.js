// Agent projects data (read from JSON for persistence)
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, 'agents.json');

export function readProjects() {
  const raw = readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function writeProjects(projects) {
  writeFileSync(DATA_FILE, JSON.stringify({ projects }, null, 2));
}

export function spawnProject(data) {
  const store = readProjects();
  const newProject = {
    id: data.id || `p${Date.now()}`,
    name: data.name || 'New Agent',
    x: data.x ?? (0.2 + Math.random() * 0.6),
    y: data.y ?? (0.2 + Math.random() * 0.6),
    description: data.description || '',
    metrics: { uptime: '—', latency: '—' },
    subAgents: [],
  };
  store.projects.push(newProject);
  writeProjects(store.projects);
  return newProject;
}