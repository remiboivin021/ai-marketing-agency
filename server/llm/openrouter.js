// LLM client for OpenRouter API
// API key validated at startup only, never re-read during session
// No external dependencies — uses built-in fetch + AbortSignal.timeout() (Node 18+)

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';
const TIMEOUT_MS = 60_000;

// --- Startup validation (fail-fast except in dev without key) ---
const NODE_ENV = process.env.NODE_ENV || 'development';
const SKIP_LLM_CHECK = NODE_ENV === 'development' && !OPENROUTER_API_KEY;

if (!SKIP_LLM_CHECK) {
  if (!OPENROUTER_API_KEY) {
    console.error(JSON.stringify({ level: 'WARN', ts: new Date().toISOString(), event: 'llm.startup.no_key', message: 'OPENROUTER_API_KEY not set — LLM will not be available' }));
  } else if (!OPENROUTER_API_KEY.startsWith('sk-')) {
    console.error(JSON.stringify({ level: 'FATAL', ts: new Date().toISOString(), event: 'llm.startup.failed', error: 'OPENROUTER_API_KEY must start with sk-' }));
    process.exit(1);
  }
}

/**
 * Call OpenRouter with system prompt + user task.
 * @param {Object} opts
 * @param {string} opts.systemPrompt - system prompt (skill pipeline)
 * @param {string} opts.userTask - user task description
 * @param {string} [opts.model] - model identifier
 * @param {string} [opts.agentId] - agent project id for logging
 * @param {string} [opts.skill] - current skill name for logging
 * @returns {Promise<{result: string}>}
 */
export async function callLLM({ systemPrompt, userTask, model = DEFAULT_MODEL, agentId, skill }) {
  if (!OPENROUTER_API_KEY || SKIP_LLM_CHECK) {
    // Mode local sans API key - générateur de réponse simple
    const responses = [
      "Intéressant! Pouvez-vous m'en dire plus sur ce sujet?",
      "Je prends note de votre demande. Voici quelques éléments à considérer...",
      "Merci pour cette question. Laissez-moi réfléchir à la meilleure réponse.",
      "Je vous comprends. Cependant, j'aurais besoin de plus d'informations pour vous aider efficacement.",
      "C'est une question pertinente. Voici mon analyse..."
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return { result: `[Mode local] ${randomResponse}`, duration_ms: 500 };
  }

  const startMs = Date.now();
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ level: 'INFO', ts: new Date().toISOString(), event: 'llm.call.started', agentId, skill, model }));

  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      // eslint-disable-next-line no-console
      console.error(JSON.stringify({ level: 'WARN', ts: new Date().toISOString(), event: 'llm.call.retry', agentId, skill, attempt }));
    }

    try {
      // AbortSignal.timeout() is built-in in Node 18+
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const response = await fetch(BASE_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userTask },
          ],
        }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        const errMsg = `OpenRouter HTTP ${response.status}: ${body}`.slice(0, 200);
        // eslint-disable-next-line no-console
        console.error(JSON.stringify({ level: 'ERROR', ts: new Date().toISOString(), event: 'llm.call.failed', agentId, skill, error: errMsg }));
        lastError = errMsg;
        continue; // retry on non-2xx
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content ?? '';

      if (!result) {
        // eslint-disable-next-line no-console
        console.error(JSON.stringify({ level: 'WARN', ts: new Date().toISOString(), event: 'llm.call.empty', agentId, skill }));
      }

      const durationMs = Date.now() - startMs;
      // eslint-disable-next-line no-console
      console.error(JSON.stringify({ level: 'INFO', ts: new Date().toISOString(), event: 'llm.call.completed', agentId, skill, duration_ms: durationMs }));

      return { result };
    } catch (err) {
      const isTimeout = err.name === 'AbortError' ||
        (err.type === 'request-abort') ||
        (err.message && err.message.toLowerCase().includes('aborted')) ||
        (err.message && err.message.toLowerCase().includes('timeout'));

      if (isTimeout) {
        // eslint-disable-next-line no-console
        console.error(JSON.stringify({ level: 'WARN', ts: new Date().toISOString(), event: 'llm.call.timeout', agentId, skill, duration_ms: TIMEOUT_MS }));
        lastError = 'LLM call timed out after 60000ms';
        break; // don't retry on timeout
      }

      lastError = err.message?.slice(0, 200) ?? 'Unknown error';
      // eslint-disable-next-line no-console
      console.error(JSON.stringify({ level: 'ERROR', ts: new Date().toISOString(), event: 'llm.call.failed', agentId, skill, error: lastError }));
    }
  }

  // Exhausted retries or timeout
  const durationMs = Date.now() - startMs;
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ level: 'ERROR', ts: new Date().toISOString(), event: 'llm.call.failed', agentId, skill, error: lastError }));
  return { error: lastError, duration_ms: durationMs };
}

/** Strip control characters from task string (S1 mitigation). */
export function sanitizeTask(task) {
  if (!task) return '';
  return task
    .split('')
    .filter(c => {
      const code = c.charCodeAt(0);
      return code >= 0x20 || code === 0x09 || code === 0x0a || code === 0x0d;
    })
    .join('')
    .slice(0, 4000);
}