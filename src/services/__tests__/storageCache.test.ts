import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageCache } from '../storageCache';

describe('StorageCache', () => {
  let cache: StorageCache;

  beforeEach(() => {
    localStorage.clear();
    cache = new StorageCache('test_');
    vi.restoreAllMocks();
  });

  it('stores and retrieves data before TTL expires', () => {
    const data = { hello: 'world' };
    const success = cache.set('item1', data, 5000);
    expect(success).toBe(true);

    const result = cache.get<{ hello: string }>('item1');
    expect(result).not.toBeNull();
    expect(result?.data).toEqual(data);
    expect(result?.isExpired).toBe(false);
  });

  it('considers data expired after TTL passes', () => {
    const data = [1, 2, 3];
    cache.set('list', data, 1000);

    // Fast-forward 1500ms
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now + 1500);

    // By default get returns null if expired and ignoreExpiry is false
    const normal = cache.get('list');
    expect(normal).toBeNull();

    // With ignoreExpiry: true (for stale-while-revalidate / offline)
    const stale = cache.get<number[]>('list', { ignoreExpiry: true });
    expect(stale).not.toBeNull();
    expect(stale?.isExpired).toBe(true);
    expect(stale?.data).toEqual(data);
  });

  it('handles corrupted localStorage data safely', () => {
    localStorage.setItem('test_corrupt', '{not-json');
    const result = cache.get('corrupt');
    expect(result).toBeNull();
  });
});
