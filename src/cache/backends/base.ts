export interface CacheBackend {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  increment(key: string, delta?: number): Promise<number>;
  decrement(key: string, delta?: number): Promise<number>;
  touch(key: string, ttl: number): Promise<boolean>;
  getMany<T>(keys: string[]): Promise<(T | null)[]>;
  setMany<T>(entries: Array<[string, T]>, ttl?: number): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;
}
