export interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

export const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000; // 12 hours TTL

export class StorageCache {
  private prefix: string;

  constructor(prefix = 'skywatch_cache_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set<T>(key: string, data: T, ttlMs: number = TWELVE_HOURS_MS): boolean {
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

  has(key: string): boolean {
    const item = this.get(key);
    return item !== null && !item.isExpired;
  }

  getRemainingTtl(key: string): number | null {
    try {
      const raw = localStorage.getItem(this.getKey(key));
      if (!raw) return null;
      const envelope: CacheEnvelope<any> = JSON.parse(raw);
      if (!envelope || typeof envelope.timestamp !== 'number') return null;
      const remaining = envelope.ttlMs - (Date.now() - envelope.timestamp);
      return remaining > 0 ? remaining : 0;
    } catch {
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
