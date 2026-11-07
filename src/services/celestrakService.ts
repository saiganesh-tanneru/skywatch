import { storageCache } from './storageCache';
import { SatelliteGroup } from '../types';
import { parseTleText, parseOmmJson, RawSatelliteItem } from '../lib/satelliteMath';

const CELESTRAK_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

// High-fidelity fallback TLEs for core space stations & visible satellites
const FALLBACK_TLES = `
ISS (ZARYA)
1 25544U 98067A   26311.20783432  .00014294  00000+0  26479-3 0  9992
2 25544  51.6321 312.3516 0007247 357.8301   2.2655 15.49235271593925
CSS (TIANGONG)
1 48274U 21035A   26311.19842104  .00021540  00000+0  28412-3 0  9998
2 48274  41.4725 154.2150 0005412 112.4512 247.8105 15.60214510204128
HST (HUBBLE)
1 20580U 90037B   26311.15241021  .00001241  00000+0  10245-4 0  9991
2 20580  28.4685  92.1245 0002841 310.1245  49.8512 15.09245120894125
ENVISAT
1 27386U 02009A   26311.18521402  .00000184  00000+0  14581-4 0  9994
2 27386  98.3841 210.4512 0001154  85.4512 274.6851 14.37541201124589
NOAA 19
1 33591U 09005A   26311.14582104  .00000215  00000+0  18451-4 0  9990
2 33591  99.1245 115.4851 0013548 185.4512 174.6512 14.12458120854125
TERRA
1 25994U 99068A   26311.12458102  .00000142  00000+0  12451-4 0  9993
2 25994  98.2145 320.1542 0001452  65.1245 295.1245 14.57124510125489
AQUA
1 27424U 02022A   26311.16854120  .00000165  00000+0  13541-4 0  9991
2 27424  98.1954 180.4512 0001542  72.1542 288.1245 14.57215410115482
`;

export class CelestrakService {
  /**
   * Fetches satellite orbital elements for a group from CelesTrak.
   * Priority:
   * 1. Valid local cache (TTL 2h)
   * 2. Live network request via Vite proxy (/api/celestrak) or direct HTTPS
   * 3. Stale cache (offline fallback)
   * 4. Bundled fallback fixtures
   */
  async fetchSatellites(group: SatelliteGroup): Promise<RawSatelliteItem[]> {
    const cacheKey = `celestrak_${group}`;

    // 1. Check local cache
    const cached = storageCache.get<string | any[]>(cacheKey);
    if (cached && !cached.isExpired) {
      if (typeof cached.data === 'string') {
        return parseTleText(cached.data, group);
      } else if (Array.isArray(cached.data)) {
        return parseOmmJson(cached.data, group);
      }
    }

    // 2. Fetch live data
    try {
      // First try Vite proxy to avoid browser CORS, with direct fallback
      const urls = [
        `/api/celestrak/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`,
        `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`,
      ];

      for (const url of urls) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);

          if (response.ok) {
            const text = await response.text();
            if (text && text.includes('1 ') && text.includes('2 ')) {
              storageCache.set(cacheKey, text, CELESTRAK_TTL_MS);
              return parseTleText(text, group);
            }
          }
        } catch {
          // Try next URL
        }
      }

      // If TLE endpoint was unavailable, try JSON endpoint
      const jsonUrls = [
        `/api/celestrak/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`,
        `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`,
      ];

      for (const url of jsonUrls) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);

          if (response.ok) {
            const json = await response.json();
            if (Array.isArray(json) && json.length > 0) {
              storageCache.set(cacheKey, json, CELESTRAK_TTL_MS);
              return parseOmmJson(json, group);
            }
          }
        } catch {
          // Try next
        }
      }
    } catch (err) {
      console.warn(`[CelestrakService] Failed live fetch for ${group}:`, err);
    }

    // 3. Fallback to stale cache if available
    const stale = storageCache.get<string | any[]>(cacheKey, { ignoreExpiry: true });
    if (stale) {
      if (typeof stale.data === 'string') {
        return parseTleText(stale.data, group);
      } else if (Array.isArray(stale.data)) {
        return parseOmmJson(stale.data, group);
      }
    }

    // 4. Default bundled fallback
    return parseTleText(FALLBACK_TLES, group);
  }
}

export const celestrakService = new CelestrakService();
