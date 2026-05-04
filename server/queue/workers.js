import { callLLM } from '../llm/openrouter.js';
import { getQueue } from './index.js';
import fs from 'fs';
import path from 'path';

const agentsPath = path.join(path.dirname(new URL(import.meta.url).pathname), '../data/agents.json');

/**
 * Bull worker processor for LLM tasks
 * Processes jobs from the agent-tasks queue
 */
export function createWorker() {
  const queue = getQueue();
  
  if (!queue) {
    console.warn('[queue/workers] Queue not initialized, worker not started');
    return null;
  }

  // Process jobs with concurrency
  queue.process('llm-task', 5, async (job) => {
    const { agentId, subAgentId, task, model, skill } = job.data;
    const startTime = Date.now();
    
    console.log(`[queue/workers] Processing job ${job.id} for agent ${agentId}, sub-agent ${subAgentId}`);
    
    try {
      // Update sub-agent status to running
      await updateSubAgentStatus(agentId, subAgentId, 'running', null, ['Job started']);
      
      // Call OpenRouter LLM
      const llmResult = await callLLM({
        systemPrompt: `You are a sub-agent executing task: ${task}`,
        userTask: task,
        agentId,
        skill: skill || 'agent_message'
      });
      
      const duration = Date.now() - startTime;
      
      // Prepare cost data
      const costData = {
        tokens_in: llmResult.tokens_in || 0,
        tokens_out: llmResult.tokens_out || 0,
        time_ms: duration,
        model: model
      };
      
      // Update sub-agent with result
      await updateSubAgentStatus(agentId, subAgentId, 'done', null, [
        `Job ${job.id} completed in ${duration}ms`,
        `Tokens: ${costData.tokens_in} in, ${costData.tokens_out} out`
      ]);
      
      // Store result and cost in agents.json
      await updateSubAgentResult(agentId, subAgentId, llmResult.result || 'No result', costData);
      
      return { duration, cost: costData };
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error(`[queue/workers] Job ${job.id} failed after ${duration}ms:`, err.message);
      
      await updateSubAgentStatus(agentId, subAgentId, 'error', err.message, [
        `Job ${job.id} failed: ${err.message}`
      ]);
      
      throw err; // Let Bull handle retry/failure
    }
  });
  
  console.log('[queue/workers] Worker created for llm-task');
  return queue;
}

/**
 * Update sub-agent status in agents.json
 */
async function updateSubAgentStatus(agentId, subAgentId, status, error, logs) {
  try {
    const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex === -1) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    const agent = agents[agentIndex];
    const subAgentIndex = agent.subAgents ? agent.subAgents.findIndex(sa => sa.id === subAgentId) : -1;
    
    if (subAgentIndex === -1) {
      throw new Error(`Sub-agent ${subAgentId} not found in agent ${agentId}`);
    }
    
    const subAgent = agent.subAgents[subAgentIndex];
    subAgent.status = status;
    
    if (error) {
      subAgent.error = error;
    }
    
    if (status === 'done' || status === 'error') {
      subAgent.completed_at = new Date().toISOString();
    }
    
    if (logs && Array.isArray(logs)) {
      if (!subAgent.logs) subAgent.logs = [];
      subAgent.logs.push(...logs.map(log => `[${new Date().toISOString()}] ${log}`));
    }
    
    // Write back to file (atomic write)
    const tempPath = agentsPath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(agents, null, 2));
    fs.renameSync(tempPath, agentsPath);
    
    console.log(`[queue/workers] Updated sub-agent ${subAgentId} status to ${status}`);
  } catch (err) {
    console.error(`[queue/workers] Failed to update sub-agent status:`, err.message);
    throw err;
  }
}

/**
 * Update sub-agent with LLM result and cost data
 */
async function updateSubAgentResult(agentId, subAgentId, result, costData) {
  try {
    const agents = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex === -1) {
      throw new Error(`Agent ${agentId} not found`);
    }
    
    const agent = agents[agentIndex];
    const subAgentIndex = agent.subAgents ? agent.subAgents.findIndex(sa => sa.id === subAgentId) : -1;
    
    if (subAgentIndex === -1) {
      throw new Error(`Sub-agent ${subAgentId} not found in agent ${agentId}`);
    }
    
    const subAgent = agent.subAgents[subAgentIndex];
    subAgent.result = result;
    subAgent.cost = costData;
    
    // Write back to file (atomic write)
    const tempPath = agentsPath + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(agents, null, 2));
    fs.renameSync(tempPath, agentsPath);
    
    console.log(`[queue/workers] Updated sub-agent ${subAgentId} with result and cost data`);
  } catch (err) {
    console.error(`[queue/workers] Failed to update sub-agent result:`, err.message);
    throw err;
  }
}
