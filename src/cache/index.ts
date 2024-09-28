export type { CacheBackend } from './backends/base.js';
export { MemcacheBackend } from './backends/memcache.js';
export { RedisCache } from './backends/redis.js';

// Default cache instance
let defaultCache: CacheBackend | null = null;

export function getCache(): CacheBackend {
  if (!defaultCache) {
    defaultCache = new MemcacheBackend();
  }
  return defaultCache;
}

export function setCache(cache: CacheBackend): void {
  defaultCache = cache;
}
