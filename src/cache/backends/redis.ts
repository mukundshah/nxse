import { createClient, RedisClientType } from 'redis';
import type { CacheBackend } from './base.js';

export interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  url?: string;
}

export class RedisCache implements CacheBackend {
  private client: RedisClientType;
  private connected: boolean = false;

  constructor(config: RedisConfig = {}) {
    const url = config.url || `redis://${config.host || 'localhost'}:${config.port || 6379}`;
    this.client = createClient({
      url,
      password: config.password,
      database: config.db
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
  }

  private async ensureConnection(): Promise<void> {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.ensureConnection();
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.ensureConnection();
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.ensureConnection();
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    await this.ensureConnection();
    await this.client.flushDb();
  }

  async has(key: string): Promise<boolean> {
    await this.ensureConnection();
    return (await this.client.exists(key)) === 1;
  }

  async increment(key: string, delta: number = 1): Promise<number> {
    await this.ensureConnection();
    return await this.client.incrBy(key, delta);
  }

  async decrement(key: string, delta: number = 1): Promise<number> {
    return this.increment(key, -delta);
  }

  async touch(key: string, ttl: number): Promise<boolean> {
    await this.ensureConnection();
    return (await this.client.expire(key, ttl)) === 1;
  }

  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    await this.ensureConnection();
    const values = await this.client.mGet(keys);
    return values.map(value => value ? JSON.parse(value) : null);
  }

  async setMany<T>(entries: Array<[string, T]>, ttl?: number): Promise<void> {
    await this.ensureConnection();
    const multi = this.client.multi();

    for (const [key, value] of entries) {
      const serialized = JSON.stringify(value);
      if (ttl) {
        multi.setEx(key, ttl, serialized);
      } else {
        multi.set(key, serialized);
      }
    }

    await multi.exec();
  }

  async deleteMany(keys: string[]): Promise<void> {
    await this.ensureConnection();
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  async close(): Promise<void> {
    if (this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }
}
