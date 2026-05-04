const Queue = require('bull');
const IORedis = require('ioredis');
const fs = require('fs');
const path = require('path');

// Redis connection configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_CONCURRENCY = parseInt(process.env.QUEUE_CONCURRENCY) || 5;

let redisClient = null;
let redisConnected = false;
let queue = null;

/**
 * Initialize Redis connection using IORedis
 */
function initRedis() {
  try {
    redisClient = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          console.warn('[queue] Redis connection failed after 3 retries, falling back to sync mode');
          redisConnected = false;
          return null; // Stop retrying
        }
        return Math.min(times * 100, 3000); // Exponential backoff
      }
    });

    redisClient.on('connect', () => {
      console.log('[queue] Redis connected');
      redisConnected = true;
    });

    redisClient.on('error', (err) => {
      console.warn('[queue] Redis error:', err.message);
      redisConnected = false;
    });

    redisClient.on('close', () => {
      console.warn('[queue] Redis connection closed');
      redisConnected = false;
    });

    return redisClient;
  } catch (err) {
    console.warn('[queue] Failed to initialize Redis:', err.message);
    console.warn('[queue] Falling back to synchronous execution mode');
    return null;
  }
}

/**
 * Initialize Bull queue for agent tasks
 */
function initQueue() {
  if (!redisClient || !redisConnected) {
    console.warn('[queue] Redis not available, queue will not be initialized');
    return null;
  }

  try {
    queue = new Queue('agent-tasks', {
      createClient: () => redisClient,
      defaultJobOptions: {
        attempts: 1, // No automatic retries (handled in worker)
        removeOnComplete: false, // Keep completed jobs for monitoring
        removeOnFail: false // Keep failed jobs for debugging
      }
    });

    queue.on('error', (err) => {
      console.error('[queue] Bull queue error:', err.message);
    });

    queue.on('failed', (job, err) => {
      console.error(`[queue] Job ${job.id} failed:`, err.message);
    });

    queue.on('completed', (job, result) => {
      console.log(`[queue] Job ${job.id} completed in ${result?.duration || '?'}ms`);
    });

    console.log('[queue] Bull queue initialized');
    return queue;
  } catch (err) {
    console.error('[queue] Failed to initialize Bull queue:', err.message);
    return null;
  }
}

/**
 * Get queue instance (lazy initialization)
 */
function getQueue() {
  if (!queue) {
    initRedis();
    initQueue();
  }
  return queue;
}

/**
 * Check if Redis is connected
 */
function isRedisConnected() {
  return redisConnected;
}

/**
 * Get queue statistics
 */
async function getQueueStats() {
  if (!queue) {
    return {
      status: 'unavailable',
      redis: redisConnected ? 'connected' : 'disconnected',
      jobs: { waiting: 0, active: 0, completed: 0, failed: 0 }
    };
  }

  try {
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount()
    ]);

    return {
      status: 'ok',
      redis: redisConnected ? 'connected' : 'disconnected',
      concurrency: QUEUE_CONCURRENCY,
      jobs: { waiting, active, completed, failed }
    };
  } catch (err) {
    console.error('[queue] Failed to get queue stats:', err.message);
    return {
      status: 'error',
      redis: redisConnected ? 'connected' : 'disconnected',
      jobs: { waiting: 0, active: 0, completed: 0, failed: 0 }
    };
  }
}

/**
 * Add a job to the queue
 * @param {Object} data - Job data
 * @param {Object} opts - Job options (optional)
 */
async function addJob(data, opts = {}) {
  if (!queue) {
    throw new Error('Queue not initialized');
  }

  try {
    const job = await queue.add(data, {
      ...opts,
      jobId: opts.jobId || undefined // Let Bull generate if not provided
    });
    console.log(`[queue] Job ${job.id} added for agent ${data.agentId}, subAgent ${data.subAgentId}`);
    return job;
  } catch (err) {
    console.error('[queue] Failed to add job:', err.message);
    throw err;
  }
}

/**
 * Stop the queue and Redis connection
 */
async function closeQueue() {
  try {
    if (queue) {
      await queue.close();
      queue = null;
      console.log('[queue] Bull queue closed');
    }
    if (redisClient) {
      redisClient.disconnect();
      redisClient = null;
      console.log('[queue] Redis disconnected');
    }
    redisConnected = false;
  } catch (err) {
    console.error('[queue] Error closing queue:', err.message);
  }
}

module.exports = {
  initRedis,
  initQueue,
  getQueue,
  isRedisConnected,
  getQueueStats,
  addJob,
  closeQueue
};
