// Agent projects data (read from JSON for persistence)
// Handles LLM-based agent spawning with sub-agent execution tracking
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { callLLM, sanitizeTask } from '../llm/openrouter.js';
import { buildSystemPrompt, SKILL_PIPELINE } from '../llm/prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, 'agents.json');

/** Read all projects from agents.json. */
export function readProjects() {
  const raw = readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(raw);
  // Ensure subAgents exists for legacy entries
  if (data.projects) {
    data.projects = data.projects.map(p => ({
      ...p,
      subAgents: p.subAgents || [],
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
 * Synchronous MVP — each LLM call blocks until completion or timeout.
 * @param {Object} data
 * @param {string} data.name - agent name
 * @param {string} [data.task] - task description (optional, triggers LLM execution)
 * @param {string} [data.model] - LLM model (default: anthropic/claude-3.5-sonnet)
 * @param {string} [data.x] - x position (default: random 0.2–0.8)
 * @param {string} [data.y] - y position (default: random 0.2–0.8)
 * @param {string} [data.description] - agent description
 * @returns {Promise<Object>} the created project with subAgents
 */
export async function spawnProject(data) {
  const store = readProjects();
  const timestamp = Date.now();
  const projectId = data.id || `p${timestamp}`;

  const model = data.model || 'anthropic/claude-3.5-sonnet';
  const task = sanitizeTask(data.task || '');

  // Log agent spawned (INFO)
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({
    level: 'INFO',
    ts: new Date().toISOString(),
    event: 'agent.spawned',
    agent_id: projectId,
  }));

  // Create sub-agents for each skill in the pipeline
  const subAgents = SKILL_PIPELINE.map((skill, index) => ({
    id: `s${timestamp}_${index}`,
    task: `[${skill.toUpperCase()}] Execute skill: ${skill}`,
    skill,
    status: 'pending',
    model,
    created_at: new Date().toISOString(),
    completed_at: null,
    result: null,
    error: null,
    logs: [`Skill queued: ${skill}`],
  }));

  const newProject = {
    id: projectId,
    name: data.name || 'New Agent',
    task,
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
    await executeSkillPipeline(newProject, subAgents, task, model);
  }

  return newProject;
}

/**
 * Execute the skill pipeline for each sub-agent.
 * Updates sub-agent status and persists after each step.
 * @param {Object} project - the agent project (mutated in place)
 * @param {Object[]} subAgents - sub-agent array from project
 * @param {string} task - user task description
 * @param {string} model - LLM model
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