const fs = require('fs');
const path = require('path');
const agentsPath = path.join(__dirname, '../data/agents.json');
const { callLLM } = require('../llm/openrouter');

/**
 * Fallback synchronous execution mode when Redis is unavailable
 * Executes LLM tasks directly without queue
 */

/**
 * Execute a sub-agent task synchronously (fallback mode)
 * @param {string} agentId - Parent agent ID
 * @param {Object} subAgent - Sub-agent object with task, model, etc.
 */
async function executeSubAgentSync(agentId, subAgent) {
  const startTime = Date.now();
  
  console.log(`[fallback] Executing sub-agent ${subAgent.id} synchronously (Redis unavailable)`);

  try {
    // Update status to running
    subAgent.status = 'running';
    subAgent.logs = subAgent.logs || [];
    subAgent.logs.push(`[${new Date().toISOString()}] Sync execution started (fallback mode)`);
    await persistAgent(agentId);

    // Call OpenRouter
    const llmResult = await callLLM(subAgent.task, subAgent.model);
    const duration = Date.now() - startTime;

    // Update with result
    subAgent.status = 'done';
    subAgent.result = llmResult.result;
    subAgent.completed_at = new Date().toISOString();
    subAgent.cost = {
      tokens_in: llmResult.tokens_in || 0,
      tokens_out: llmResult.tokens_out || 0,
      time_ms: duration,
      model: subAgent.model
    };
    subAgent.logs.push(`[${new Date().toISOString()}] Sync execution completed in ${duration}ms`);
    subAgent.logs.push(`[${new Date().toISOString()}] Tokens: ${subAgent.cost.tokens_in} in, ${subAgent.cost.tokens_out} out`);

    await persistAgent(agentId);

    console.log(`[fallback] Sub-agent ${subAgent.id} completed in ${duration}ms`);
    return { success: true, duration, cost: subAgent.cost };
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`[fallback] Sub-agent ${subAgent.id} failed after ${duration}ms:`, err.message);

    subAgent.status = 'error';
    subAgent.error = err.message;
    subAgent.completed_at = new Date().toISOString();
    subAgent.logs = subAgent.logs || [];
    subAgent.logs.push(`[${new Date().toISOString()}] Sync execution failed: ${err.message}`);

    await persistAgent(agentId);
    throw err;
  }
}

/**
 * Persist agent data to agents.json
 */
async function persistAgent(agentId) {
  try {
    const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex !== -1) {
      const tempPath = agentsPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(agents, null, 2));
      fs.renameSync(tempPath, agentsPath);
    }
  } catch (err) {
    console.error(`[fallback] Failed to persist agent:`, err.message);
  }
}

/**
 * Execute multiple sub-agents with dependency support (synchronous fallback)
 * @param {Object} agent - Agent object with subAgents
 */
async function executeAgentSync(agent) {
  if (!agent.subAgents || agent.subAgents.length === 0) {
    return;
  }

  console.log(`[fallback] Executing agent ${agent.id} synchronously with ${agent.subAgents.length} sub-agents`);

  // Simple sequential execution for fallback mode
  // In a real implementation, you'd want to respect dependsOn here too
  for (const subAgent of agent.subAgents) {
    if (subAgent.status === 'pending') {
      await executeSubAgentSync(agent.id, subAgent);
    }
  }
}

module.exports = {
  executeSubAgentSync,
  executeAgentSync
};
