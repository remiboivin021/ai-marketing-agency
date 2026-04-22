// Agent projects data (matches AgentNetworkGraph.jsx mock data)
export const agentsProjects = [
  {
    id: 'p1',
    name: 'Jarvis Main',
    x: 0.3,
    y: 0.4,
    description: "Cœur de l'IA. Gère l'ordonnancement.",
    metrics: { uptime: '99%', latency: '12ms' },
    subAgents: [
      { id: 's1', status: 'done', type: 'PARSER' },
      { id: 's2', status: 'done', type: 'INDEXER' },
    ],
  },
  {
    id: 'p2',
    name: 'Auto-GPT Ops',
    x: 0.7,
    y: 0.3,
    description: 'Pipeline de ejecución autónoma.',
    metrics: { uptime: '92%', latency: '240ms' },
    subAgents: [
      { id: 's4', status: 'working', type: 'DEPLOY' },
      { id: 's5', status: 'alert', type: 'SECURE' },
    ],
  },
  {
    id: 'p3',
    name: 'Data Scraper',
    x: 0.5,
    y: 0.7,
    description: 'Extracción de datos tiempo real.',
    metrics: { uptime: '98%', latency: '45ms' },
    subAgents: [
      { id: 's7', status: 'working', type: 'SCANNER' },
    ],
  },
];

// Projects list (summary for /api/projects)
export const projectsList = agentsProjects.map(({ id, name, x, y, description, metrics, subAgents }) => ({
  id, name, x, y, description, metrics, subAgents
}));