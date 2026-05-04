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
function topologicalSort(agents) {
  // Build adjacency list and in-degree count
  const adjacency = new Map(); // agentId -> list of agents that depend on it
  const inDegree = new Map(); // agentId -> number of dependencies
  const agentMap = new Map(); // agentId -> agent object

  // Initialize
  agents.forEach(agent => {
    agentMap.set(agent.id, agent);
    inDegree.set(agent.id, (agent.dependsOn || []).length);
    adjacency.set(agent.id, []);
  });

  // Build adjacency list: if A dependsOn B, then B -> A
  agents.forEach(agent => {
    if (agent.dependsOn && Array.isArray(agent.dependsOn)) {
      agent.dependsOn.forEach(depId => {
        if (agentMap.has(depId)) {
          adjacency.get(depId).push(agent.id);
        }
      });
    }
  });

  // Kahn's algorithm
  const queue = [];
  const sorted = [];
  const visited = new Set();

  // Find nodes with no dependencies (in-degree 0)
  agents.forEach(agent => {
    if (inDegree.get(agent.id) === 0) {
      queue.push(agent.id);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    sorted.push(agentMap.get(current));

    // For each agent that depends on current, reduce in-degree
    adjacency.get(current).forEach(nextId => {
      inDegree.set(nextId, inDegree.get(nextId) - 1);
      if (inDegree.get(nextId) === 0) {
        queue.push(nextId);
      }
    });
  }

  // Check for cycle: if not all agents are sorted, there's a cycle
  const hasCycle = sorted.length !== agents.length;
  let cyclePath = [];
  
  if (hasCycle) {
    cyclePath = findCycle(agents);
  }

  return { sorted, hasCycle, cyclePath };
}

/**
 * Detect if there's a cycle in the dependency graph
 * Uses DFS-based cycle detection
 * @param {Array} dependsOnMap - Object mapping agentId to dependsOn array
 * @param {Array} allAgentIds - All agent IDs to check
 * @returns {boolean}
 */
function detectCycle(dependsOnMap, allAgentIds) {
  const visited = new Set();
  const recursionStack = new Set();

  function hasCycleDFS(node, path = []) {
    if (recursionStack.has(node)) {
      return true; // Cycle detected
    }
    if (visited.has(node)) {
      return false;
    }

    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const dependencies = dependsOnMap[node] || [];
    for (const dep of dependencies) {
      if (hasCycleDFS(dep, path)) {
        return true;
      }
    }

    recursionStack.delete(node);
    path.pop();
    return false;
  }

  for (const agentId of allAgentIds) {
    if (!visited.has(agentId)) {
      if (hasCycleDFS(agentId)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Find the actual cycle path for error reporting
 * @param {Array} agents - Array of agent objects
 * @returns {Array} Cycle path
 */
function findCycle(agents) {
  const dependsOnMap = {};
  const agentIds = [];
  
  agents.forEach(agent => {
    dependsOnMap[agent.id] = agent.dependsOn || [];
    agentIds.push(agent.id);
  });

  const visited = new Set();
  const recursionStack = new Set();
  let cyclePath = [];
  let foundCycle = false;

  function dfs(node, path) {
    if (foundCycle) return;
    
    if (recursionStack.has(node)) {
      // Found cycle - extract the cycle path
      const cycleStart = path.indexOf(node);
      cyclePath = path.slice(cycleStart).concat([node]);
      foundCycle = true;
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const deps = dependsOnMap[node] || [];
    for (const dep of deps) {
      dfs(dep, path);
      if (foundCycle) return;
    }

    recursionStack.delete(node);
    path.pop();
  }

  for (const agentId of agentIds) {
    if (!visited.has(agentId)) {
      dfs(agentId, []);
      if (foundCycle) break;
    }
  }

  return cyclePath;
}

/**
 * Generate DOT representation of the pipeline based on dependsOn relationships
 * @param {Array} dependsOnMap - Object mapping agentId to dependsOn array
 * @param {string} pipelineName - Name for the digraph
 * @returns {string} DOT format string
 */
function generatePipelineDot(agents) {
  const lines = ['digraph Pipeline {'];
  
  agents.forEach(agent => {
    const deps = agent.dependsOn || [];
    deps.forEach(depId => {
      // Find the skill name for better labels
      const depAgent = agents.find(a => a.id === depId);
      const currentAgent = agent;
      const from = depAgent ? depAgent.skill || depId : depId;
      const to = currentAgent.skill || agent.id;
      lines.push(`  ${from} -> ${to};`);
    });
  });

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

module.exports = {
  topologicalSort,
  detectCycle,
  findCycle,
  generatePipelineDot
};
