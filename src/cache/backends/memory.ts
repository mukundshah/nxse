import { CacheBackend } from './base.js';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

export class MemoryCache implements CacheBackend {
  private cache: Map<string, CacheEntry<any>> = new Map();

  private isExpired(entry: CacheEntry<any>): boolean {
    return entry.expiresAt !== null && entry.expiresAt < Date.now();
  }

  private cleanExpired(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
    this.cache.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return false;
    }
    return true;
  }

  async increment(key: string, delta: number = 1): Promise<number> {
    const value = await this.get<number>(key);
    const newValue = (value || 0) + delta;
    await this.set(key, newValue);
    return newValue;
  }

  async decrement(key: string, delta: number = 1): Promise<number> {
    return this.increment(key, -delta);
  }

  async touch(key: string, ttl: number): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return false;
    }
    entry.expiresAt = Date.now() + ttl * 1000;
    return true;
  }

  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  async setMany<T>(entries: Array<[string, T]>, ttl?: number): Promise<void> {
    await Promise.all(entries.map(([key, value]) => this.set(key, value, ttl)));
  }

  async deleteMany(keys: string[]): Promise<void> {
    keys.forEach(key => this.cache.delete(key));
  }
}
