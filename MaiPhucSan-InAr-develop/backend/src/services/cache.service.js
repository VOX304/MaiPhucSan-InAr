const logger = require('../config/logger');

const USE_REDIS = process.env.USE_REDIS_CACHE === 'true';
const REDIS_TTL = Number(process.env.REDIS_CACHE_TTL || 60); // seconds

let redisClient = null;
const memoryCache = new Map();

if (USE_REDIS) {
  try {
    // prefer ioredis if installed
    const IORedis = require('ioredis');
    redisClient = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    redisClient.on('error', (err) => logger.warn('Redis client error', err));
    logger.info('Redis cache enabled');
  } catch (e) {
    logger.warn('Redis requested but ioredis not installed, falling back to memory cache');
  }
}

async function get(key) {
  if (redisClient) {
    try {
      const v = await redisClient.get(key);
      return v ? JSON.parse(v) : null;
    } catch (e) {
      logger.warn('Redis get failed', e.message);
      return null;
    }
  }
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expire) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

async function set(key, value, ttlSeconds = REDIS_TTL) {
  if (redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return true;
    } catch (e) {
      logger.warn('Redis set failed', e.message);
      return false;
    }
  }
  memoryCache.set(key, { value, expire: Date.now() + ttlSeconds * 1000 });
  return true;
}

async function del(key) {
  if (redisClient) {
    try {
      await redisClient.del(key);
      return true;
    } catch (e) {
      logger.warn('Redis del failed', e.message);
      return false;
    }
  }
  memoryCache.delete(key);
  return true;
}

module.exports = { get, set, del };
