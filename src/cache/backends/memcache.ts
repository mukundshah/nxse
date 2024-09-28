import type { CacheBackend } from './base.js';
import { createClient } from 'memjs';
import type { Client, MemJSClient } from 'memjs';

export interface MemcacheConfig {
  servers?: string[];
  username?: string;
  password?: string;
  expires?: number;
  failover?: boolean;
  retries?: number;
  retryDelay?: number;
  reconnect?: boolean;
  timeout?: number;
  keepAlive?: boolean;
}

export class MemcacheBackend implements CacheBackend {
  private client: MemJSClient;

  constructor(config: MemcacheConfig = {}) {
    const servers = config.servers?.join(',') || process.env.MEMCACHIER_SERVERS || 'localhost:11211';
    const options = {
      username: config.username || process.env.MEMCACHIER_USERNAME,
      password: config.password || process.env.MEMCACHIER_PASSWORD,
      expires: config.expires,
      failover: config.failover ?? true,
      retries: config.retries ?? 2,
      retry_delay: config.retryDelay ?? 0.2,
      reconnect: config.reconnect ?? true,
      timeout: config.timeout ?? 0.5,
      keepAlive: config.keepAlive ?? true
    };

    this.client = createClient(servers, options);
  }

  private getExpiry(ttl?: number): number {
    if (!ttl) return 0; // 0 means no expiration
    return Math.floor(Date.now() / 1000) + ttl;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const { value } = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value.toString()) as T;
    } catch (error) {
      console.error('Memcache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.client.set(key, serialized, { expires: this.getExpiry(ttl) });
    } catch (error) {
      console.error('Memcache set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.delete(key);
    } catch (error) {
      console.error('Memcache delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flush();
    } catch (error) {
      console.error('Memcache clear error:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const { value } = await this.client.get(key);
      return value !== null;
    } catch (error) {
      console.error('Memcache has error:', error);
      return false;
    }
  }

  async increment(key: string, delta: number = 1): Promise<number> {
    try {
      const { value } = await this.client.increment(key, delta);
      return value;
    } catch (error) {
      // If key doesn't exist, initialize it
      await this.set(key, delta);
      return delta;
    }
  }

  async decrement(key: string, delta: number = 1): Promise<number> {
    try {
      const { value } = await this.client.decrement(key, delta);
      return value;
    } catch (error) {
      // If key doesn't exist, initialize it with 0
      await this.set(key, 0);
      return 0;
    }
  }

  async touch(key: string, ttl: number): Promise<boolean> {
    try {
      const { value } = await this.client.get(key);
      if (!value) return false;

      await this.client.set(key, value, { expires: this.getExpiry(ttl) });
      return true;
    } catch (error) {
      console.error('Memcache touch error:', error);
      return false;
    }
  }

  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const results = await Promise.all(keys.map(key => this.client.get(key)));
      return results.map(({ value }) =>
        value ? JSON.parse(value.toString()) as T : null
      );
    } catch (error) {
      console.error('Memcache getMany error:', error);
      return keys.map(() => null);
    }
  }

  async setMany<T>(entries: Array<[string, T]>, ttl?: number): Promise<void> {
    try {
      await Promise.all(
        entries.map(([key, value]) =>
          this.client.set(key, JSON.stringify(value), { expires: this.getExpiry(ttl) })
        )
      );
    } catch (error) {
      console.error('Memcache setMany error:', error);
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(key => this.client.delete(key)));
    } catch (error) {
      console.error('Memcache deleteMany error:', error);
    }
  }

  async close(): Promise<void> {
    try {
      await this.client.quit();
    } catch (error) {
      console.error('Memcache close error:', error);
    }
  }
}
