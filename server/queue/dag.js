/**
 * DAG (Directed Acyclic Graph) utilities for agent dependency management
 * Provides topological sort and cycle detection for agent dependencies
 */

/**
 * Perform topological sort on agents based on their dependsOn relationships
 * Uses Kahn's algorithm
 * @param {Array} agents - Array of agent objects with dependsOn field
 * @returns {Object} { sorted: Array, hasCycle: boolean, cyclePath: Array }
 */
export function topologicalSort(agents) {
  // Build adjacency list and in-degree count
  const adjacency = new Map(); // agentId -> list of agents that depend on it
  const inDegree = new Map(); // agentId -> number of dependencies
  const agentMap = new Map(); // agentId -> agent object

  // Initialize
  agents.forEach(agent => {
    agentMap.set(agent.id, agent);
    inDegree.set(agent.id, 0);
    adjacency.set(agent.id, []);
  });

  // Build graph
  agents.forEach(agent => {
    const deps = agent.dependsOn || [];
    deps.forEach(depId => {
      if (adjacency.has(depId)) {
        adjacency.get(depId).push(agent.id);
        inDegree.set(agent.id, inDegree.get(agent.id) + 1);
      }
    });
  });

  // Find nodes with no dependencies (in-degree = 0)
  const queue = [];
  inDegree.forEach((degree, agentId) => {
    if (degree === 0) {
      queue.push(agentId);
    }
  });

  const sorted = [];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);

    const agent = agentMap.get(current);
    if (agent) {
      sorted.push(agent);
    }

    // Reduce in-degree of neighbors
    const neighbors = adjacency.get(current) || [];
    neighbors.forEach(neighborId => {
      inDegree.set(neighborId, inDegree.get(neighborId) - 1);
      if (inDegree.get(neighborId) === 0) {
        queue.push(neighborId);
      }
    });
  }

  // Check for cycles
  const hasCycle = sorted.length !== agents.length;
  const cyclePath = hasCycle ? findCycle(agents) : [];

  return { sorted, hasCycle, cyclePath };
}

/**
 * Detect if there's a cycle in the dependency graph
 * @param {Object} dependsOnMap - Map of agentId -> dependsOn array
 * @param {Array} allAgentIds - List of all agent IDs
 * @returns {boolean} True if cycle detected
 */
export function detectCycle(dependsOnMap, allAgentIds) {
  const visited = new Set();
  const recStack = new Set();

  function hasCycleDFS(node, path) {
    visited.add(node);
    recStack.add(node);

    const deps = dependsOnMap[node] || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        if (hasCycleDFS(dep, [...path, dep])) {
          return true;
        }
      } else if (recStack.has(dep)) {
        return true;
      }
    }

    recStack.delete(node);
    return false;
  }

  for (const agentId of allAgentIds) {
    if (!visited.has(agentId)) {
      if (hasCycleDFS(agentId, [agentId])) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Find the cycle path in the dependency graph
 * @param {Array} agents - Array of agent objects
 * @returns {Array} The cycle path (empty if no cycle)
 */
function findCycle(agents) {
  const dependsOnMap = {};
  agents.forEach(p => { dependsOnMap[p.id] = p.dependsOn || []; });

  const visited = new Set();
  const recStack = new Set();
  const path = [];

  function dfs(node) {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const deps = dependsOnMap[node] || [];
    for (const dep of deps) {
      if (!visited.has(dep)) {
        const result = dfs(dep);
        if (result) return result;
      } else if (recStack.has(dep)) {
        // Found cycle - return the cycle path
        const cycleStart = path.indexOf(dep);
        return path.slice(cycleStart);
      }
    }

    path.pop();
    recStack.delete(node);
    return null;
  }

  for (const agent of agents) {
    if (!visited.has(agent.id)) {
      const cycle = dfs(agent.id);
      if (cycle) return cycle;
    }
  }

  return [];
}

/**
 * Generate DOT representation of the pipeline for visualization
 * @param {Array} agents - Array of agent objects with dependsOn
 * @returns {string} DOT language string
 */
export function generatePipelineDot(agents) {
  const lines = ['digraph Pipeline {'];
  lines.push('  node [shape=box, style=filled, fillcolor="#e0f2fe"];');
  lines.push('  edge [color="#3b82f6", penwidth=2];');
  lines.push('');

  // Add nodes
  agents.forEach(agent => {
    const nodeName = agent.skill || agent.id;
    const label = `${nodeName}\\n(${agent.status || 'idle'})`;
    const color = agent.status === 'done' ? '#bbf7d0' : 
                 agent.status === 'running' ? '#fef08a' :
                 agent.status === 'error' ? '#fecaca' : '#e0f2fe';
    lines.push(`  ${nodeName} [label="${label}", fillcolor="${color}"];`);
  });

  lines.push('');

  // Add edges based on dependsOn
  agents.forEach(agent => {
    const fromNode = agent.skill || agent.id;
    const deps = agent.dependsOn || [];
    deps.forEach(depId => {
      const depAgent = agents.find(a => a.id === depId);
      if (depAgent) {
        const toNode = depAgent.skill || depAgent.id;
        lines.push(`  ${toNode} -> ${fromNode};`);
      }
    });
  });

  lines.push('');

  // Add nodes without dependencies
  agents.forEach(agent => {
    const hasIncoming = agents.some(a => (a.dependsOn || []).includes(agent.id));
    if (!hasIncoming && (!agent.dependsOn || agent.dependsOn.length === 0)) {
      const nodeName = agent.skill || agent.id;
      lines.push(`  ${nodeName};`);
    }
  });

  lines.push('}');
  return lines.join('\n');
}
