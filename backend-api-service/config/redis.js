const Redis = require('ioredis');

// Fallback in-memory storage if Redis server is not running
const memoryStore = new Map();

let isRedisConnected = false;

const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) {
      // Stop retrying after 3 attempts so the process doesn't hang
      return null;
    }
    return Math.min(times * 200, 1000);
  }
});

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('⚡ [REDIS] Connected successfully to Redis Cache Server.');
});

redisClient.on('error', (err) => {
  if (isRedisConnected) {
    console.warn(`⚠️ [REDIS WARNING] Connection error: ${err.message}`);
  }
  isRedisConnected = false;
});

// Attempt initial connection without blocking app startup
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.log('💡 [REDIS INFO] Redis server not detected at port 6379. Operating with seamless in-memory cache fallback.');
  }
})();

/**
 * Universal Key-Value Set with TTL
 */
async function set(key, value, ttlSeconds = 600) {
  if (isRedisConnected) {
    try {
      return await redisClient.set(key, value, 'EX', ttlSeconds);
    } catch (err) {
      console.warn('[REDIS SET ERROR, falling back to memory]:', err.message);
    }
  }
  
  // In-Memory Fallback
  memoryStore.set(key, {
    val: value,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
  return 'OK';
}

/**
 * Universal Key-Value Get
 */
async function get(key) {
  if (isRedisConnected) {
    try {
      return await redisClient.get(key);
    } catch (err) {
      console.warn('[REDIS GET ERROR, falling back to memory]:', err.message);
    }
  }

  // In-Memory Fallback
  const item = memoryStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return item.val;
}

/**
 * Universal Key Delete
 */
async function del(key) {
  if (isRedisConnected) {
    try {
      return await redisClient.del(key);
    } catch (err) {
      console.warn('[REDIS DEL ERROR]:', err.message);
    }
  }
  memoryStore.delete(key);
  return 1;
}

/**
 * Distributed Lock for Ballots (prevents race-condition double voting)
 * Returns true if lock was acquired, false if already locked
 */
async function acquireVoteLock(electionId, walletAddress, ttlSeconds = 15) {
  const lockKey = `lock:vote:${electionId}:${walletAddress.toLowerCase()}`;
  
  if (isRedisConnected) {
    try {
      const result = await redisClient.set(lockKey, '1', 'NX', 'EX', ttlSeconds);
      return result === 'OK';
    } catch (err) {
      console.warn('[REDIS LOCK ERROR]:', err.message);
    }
  }

  // In-memory atomic lock check
  const existing = memoryStore.get(lockKey);
  if (existing && Date.now() < existing.expiresAt) {
    return false; // Already locked
  }
  memoryStore.set(lockKey, {
    val: '1',
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
  return true;
}

/**
 * Release Distributed Ballot Lock
 */
async function releaseVoteLock(electionId, walletAddress) {
  const lockKey = `lock:vote:${electionId}:${walletAddress.toLowerCase()}`;
  return await del(lockKey);
}

module.exports = {
  redisClient,
  isRedisConnected: () => isRedisConnected,
  set,
  get,
  del,
  acquireVoteLock,
  releaseVoteLock
};
