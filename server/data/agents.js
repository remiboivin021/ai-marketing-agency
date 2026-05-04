// Agent projects data (read from JSON for persistence)
// Handles LLM-based agent spawning with sub-agent execution tracking
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { callLLM, sanitizeTask } from '../llm/openrouter.js';
import { buildSystemPrompt, SKILL_PIPELINE } from '../llm/prompt.js';
import { getQueue, addJob, isRedisConnected } from '../queue/index.js';
import { createWorker } from '../queue/workers.js';
import { executeAgentSync } from '../queue/fallback.js';
import { topologicalSort, generatePipelineDot } from '../queue/dag.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, 'agents.json');

// Initialize queue and worker if Redis is available
let worker = null;
if (isRedisConnected()) {
  worker = createWorker();
}

/** Read all projects from agents.json. */
export function readProjects() {
  const raw = readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(raw);
  // Ensure new fields exist for legacy entries
  if (data.projects) {
    data.projects = data.projects.map(p => ({
      ...p,
      dependsOn: p.dependsOn || [],
      pipelineDot: p.pipelineDot || '',
      subAgents: (p.subAgents || []).map(sa => ({
        ...sa,
        dependsOn: sa.dependsOn || [],
        queueJobId: sa.queueJobId || null,
        cost: sa.cost || null,
      })),
    }));
  }
  return data;
}

/** Write projects array to agents.json. */
export function writeProjects(projects) {
  writeFileSync(DATA_FILE, JSON.stringify({ projects }, null, 2));
}

/**
 * Spawn a new agent project and execute the skill pipeline via LLM.
 * Uses Bull queue if Redis available, otherwise falls back to sync execution.
 * @param {Object} data
 * @param {string} data.name - agent name
 * @param {string} [data.task] - task description (optional, triggers LLM execution)
 * @param {string} [data.model] - LLM model (default: anthropic/claude-3.5-sonnet)
 * @param {string} [data.x] - x position (default: random 0.2–0.8)
 * @param {string} [data.y] - y position (default: random 0.2–0.8)
 * @param {string} [data.description] - agent description
 * @param {string[]} [data.dependsOn] - array of agent IDs this agent depends on
 * @returns {Promise<Object>} the created project with subAgents
 */
export async function spawnProject(data) {
  const store = readProjects();
  const timestamp = Date.now();
  const projectId = data.id || `p${timestamp}`;
  const model = data.model || 'anthropic/claude-3.5-sonnet';
  const task = sanitizeTask(data.task || '');
  const dependsOn = Array.isArray(data.dependsOn) ? data.dependsOn : [];

  // Log agent spawned (INFO)
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({
    level: 'INFO',
    ts: new Date().toISOString(),
    event: 'agent.spawned',
    agent_id: projectId,
    depends_on: dependsOn,
  }));

  // Create sub-agents for each skill in the pipeline
  const subAgents = SKILL_PIPELINE.map((skill, index) => ({
    id: `s${timestamp}_${index}`,
    task: `[${skill.toUpperCase()}] Execute skill: ${skill}`,
    skill,
    status: 'pending',
    model,
    dependsOn: [], // Sub-agents don't have dependencies in this MVP
    queueJobId: null, // Will be set when job is added to queue
    cost: null, // Will be populated after LLM execution
    created_at: new Date().toISOString(),
    completed_at: null,
    result: null,
    error: null,
    logs: [`Skill queued: ${skill}`],
  }));

  // Generate pipeline DOT from dependsOn
  const allAgents = store.projects.concat([{ id: projectId, dependsOn, subAgents }]);
  const pipelineDot = generatePipelineDot(allAgents.filter(a => a.id === projectId || dependsOn.includes(a.id)));

  const newProject = {
    id: projectId,
    name: data.name || 'New Agent',
    task,
    dependsOn,
    pipelineDot,
    x: data.x ?? (0.2 + Math.random() * 0.6),
    y: data.y ?? (0.2 + Math.random() * 0.6),
    description: data.description || '',
    metrics: { uptime: '—', latency: '—' },
    subAgents,
  };

  store.projects.push(newProject);
  writeProjects(store.projects);

  // Execute LLM pipeline if a task was provided
  if (task) {
    if (isRedisConnected() && worker) {
      // Use Bull queue for execution
      await executeSkillPipelineQueue(newProject, subAgents, task, model);
    } else {
      // Fallback to synchronous execution
      const { executeAgentSync } = require('../queue/fallback.js');
      // eslint-disable-next-line no-console
      console.warn('[agents] Redis unavailable, using synchronous execution (fallback mode)');
      await executeAgentSync(newProject);
    }
  }

  return newProject;
}

  return newProject;
}

/**
 * Execute the skill pipeline using Bull queue (if available) or fallback sync.
 * Adds sub-agent tasks to queue with proper dependency handling.
 * @param {Object} project - the agent project
 * @param {Object[]} subAgents - sub-agent array from project
 * @param {string} task - user task description
 * @param {string} model - LLM model
 */
async function executeSkillPipelineQueue(project, subAgents, task, model) {
  const queue = getQueue();
  
  if (!queue) {
    // Fallback to sync execution is handled in spawnProject
    return;
  }

  // Mark all sub-agents as queued
  for (const subAgent of subAgents) {
    subAgent.status = 'queued';
    subAgent.logs.push('Added to Bull queue');
    persistProject(project);
  }

  // Add each sub-agent as a job to the queue
  for (const subAgent of subAgents) {
    try {
      const job = await addJob(
        {
          agentId: project.id,
          subAgentId: subAgent.id,
          task: subAgent.task,
          model: subAgent.model || model,
          skill: subAgent.skill,
        },
        {
          jobId: `job_${subAgent.id}`, // Use sub-agent ID as job ID for easy tracking
          // Note: Bull doesn't natively support job dependencies across separate jobs
          // Dependencies are handled by the worker checking sub-agent status
        }
      );

      subAgent.queueJobId = job.id;
      persistProject(project);
      logStatusChange(project.id, subAgent.id, 'queued', `Job ID: ${job.id}`);
    } catch (err) {
      console.error(`[agents] Failed to add job for ${subAgent.id}:`, err.message);
      subAgent.status = 'error';
      subAgent.error = `Queue error: ${err.message}`;
      persistProject(project);
    }
  }
}

/**
 * Legacy synchronous skill pipeline (kept for reference, use Queue version instead).
 */
async function executeSkillPipeline(project, subAgents, task, model) {
  for (const subAgent of subAgents) {
    // Transition: pending → running
    subAgent.status = 'running';
    subAgent.logs.push('LLM call initiated');
    persistProject(project);
    logStatusChange(project.id, subAgent.id, 'running');

    // Build skill-specific prompt
    const systemPrompt = buildSystemPrompt({ skill: subAgent.skill, task });

    // Call LLM
    const startMs = Date.now();
    const llmResult = await callLLM({
      systemPrompt,
      userTask: task,
      model,
      agentId: project.id,
      skill: subAgent.skill,
    });
    const durationMs = Date.now() - startMs;

    if (llmResult.error) {
      // Transition: running → error
      subAgent.status = 'error';
      subAgent.error = llmResult.error;
      subAgent.completed_at = new Date().toISOString();
      subAgent.logs.push(`Error: ${llmResult.error} (${durationMs}ms)`);
    } else {
      // Transition: running → done
      subAgent.status = 'done';
      subAgent.result = llmResult.result;
      subAgent.cost = {
        tokens_in: llmResult.tokens_in || 0,
        tokens_out: llmResult.tokens_out || 0,
        time_ms: durationMs,
        model: subAgent.model || model,
      };
      subAgent.completed_at = new Date().toISOString();
      subAgent.logs.push(`Completed in ${durationMs}ms`);
    }

    // Truncate logs if > 50 entries
    if (subAgent.logs.length > 50) {
      subAgent.logs = subAgent.logs.slice(-50);
    }

    persistProject(project);
    logStatusChange(project.id, subAgent.id, subAgent.status);

    // Stop pipeline on first error
    if (subAgent.status === 'error') break;
  }
}

/** Write the project back to agents.json (in-place update). */
function persistProject(project) {
  const store = readProjects();
  const idx = store.projects.findIndex(p => p.id === project.id);
  if (idx !== -1) {
    store.projects[idx] = project;
    writeProjects(store.projects);
  }
}

/** Log sub-agent status change (INFO). */
function logStatusChange(agentId, subAgentId, status) {
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({
    level: 'INFO',
    ts: new Date().toISOString(),
    event: 'subagent.status_changed',
    agent_id: agentId,
    subagent_id: subAgentId,
    status,
  }));
}