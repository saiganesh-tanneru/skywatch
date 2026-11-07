export interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

export class StorageCache {
  private prefix: string;

  constructor(prefix = 'skywatch_cache_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, data: T, ttlMs: number): boolean {
    try {
      const envelope: CacheEnvelope<T> = {
        data,
        timestamp: Date.now(),
        ttlMs,
      };
      localStorage.setItem(this.getKey(key), JSON.stringify(envelope));
      return true;
    } catch (err) {
      console.warn(`[StorageCache] Failed to write cache for key "${key}":`, err);
      return false;
    }
  }

  get<T>(key: string, options: { ignoreExpiry?: boolean } = {}): { data: T; isExpired: boolean; timestamp: number } | null {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;

      const envelope: CacheEnvelope<T> = JSON.parse(raw);
      if (!envelope || typeof envelope.timestamp !== 'number') {
        return null;
      }

      const age = Date.now() - envelope.timestamp;
      const isExpired = age > envelope.ttlMs;

      if (isExpired && !options.ignoreExpiry) {
        return null;
      }

      return {
        data: envelope.data,
        isExpired,
        timestamp: envelope.timestamp,
      };
    } catch (err) {
      console.warn(`[StorageCache] Failed to read cache for key "${key}":`, err);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (err) {
      console.warn(`[StorageCache] Failed to delete key "${key}":`, err);
    }
  }

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(this.prefix)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      console.warn('[StorageCache] Failed to clear cache:', err);
    }
  }
}

export const storageCache = new StorageCache();
