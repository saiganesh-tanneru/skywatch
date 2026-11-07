import { storageCache, TWELVE_HOURS_MS } from './storageCache';
import { NearEarthAsteroid } from '../types';

const NEOWS_TTL_MS = TWELVE_HOURS_MS; // 12 hours TTL for NASA NeoWs close-approach asteroids

// Realistic fallback close-approach asteroids if offline or rate-limited
const FALLBACK_ASTEROIDS: NearEarthAsteroid[] = [
  {
    id: 'neo-2024-yr4',
    name: '2024 YR4',
    estimatedDiameterMinM: 40,
    estimatedDiameterMaxM: 90,
    isPotentiallyHazardous: true,
    closeApproachDate: '2026-Nov-08 14:22',
    missDistanceKm: 1420500,
    missDistanceLunar: 3.69,
    relativeVelocityKmH: 48200,
    absoluteMagnitude: 24.1,
  },
  {
    id: 'neo-apophis',
    name: '99942 Apophis',
    estimatedDiameterMinM: 340,
    estimatedDiameterMaxM: 375,
    isPotentiallyHazardous: true,
    closeApproachDate: '2026-Nov-10 08:45',
    missDistanceKm: 4210000,
    missDistanceLunar: 10.95,
    relativeVelocityKmH: 30720,
    absoluteMagnitude: 19.7,
  },
  {
    id: 'neo-2024-on',
    name: '2024 ON',
    estimatedDiameterMinM: 220,
    estimatedDiameterMaxM: 350,
    isPotentiallyHazardous: false,
    closeApproachDate: '2026-Nov-11 19:15',
    missDistanceKm: 1000000,
    missDistanceLunar: 2.6,
    relativeVelocityKmH: 31920,
    absoluteMagnitude: 21.3,
  },
  {
    id: 'neo-bennu',
    name: '101955 Bennu',
    estimatedDiameterMinM: 490,
    estimatedDiameterMaxM: 510,
    isPotentiallyHazardous: true,
    closeApproachDate: '2026-Nov-12 11:30',
    missDistanceKm: 18500000,
    missDistanceLunar: 48.1,
    relativeVelocityKmH: 27800,
    absoluteMagnitude: 20.9,
  },
];

export interface NeoWsResult {
  asteroids: NearEarthAsteroid[];
  source: 'live' | 'cache' | 'fallback';
  rateLimitNotice?: string;
}

export class NeoWsService {
  private getApiKey(): string {
    return import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
  }

  async fetchCloseApproachAsteroids(): Promise<NeoWsResult> {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];

    // 7 days window (NASA NeoWs limit is 7 days per feed request)
    const end = new Date(today.getTime() + 6 * 24 * 3600 * 1000);
    const endDate = end.toISOString().split('T')[0];

    const cacheKey = `neows_${startDate}_${endDate}`;

    // 1. Check local cache (TTL 6h)
    const cached = storageCache.get<NearEarthAsteroid[]>(cacheKey);
    if (cached && !cached.isExpired) {
      return {
        asteroids: cached.data,
        source: 'cache',
      };
    }

    const apiKey = this.getApiKey();
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

    // 2. Fetch live data
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.status === 429) {
        // Rate limit reached
        const notice =
          apiKey === 'DEMO_KEY'
            ? 'NASA DEMO_KEY hourly rate limit reached (30 requests/hr). Showing cached/saved asteroid data. Add your free key in .env for higher limits.'
            : 'NASA API rate limit exceeded. Showing cached asteroid data.';

        const stale = storageCache.get<NearEarthAsteroid[]>(cacheKey, { ignoreExpiry: true });
        return {
          asteroids: stale ? stale.data : FALLBACK_ASTEROIDS,
          source: stale ? 'cache' : 'fallback',
          rateLimitNotice: notice,
        };
      }

      if (res.ok) {
        const data = await res.json();
        const parsed: NearEarthAsteroid[] = [];

        if (data.near_earth_objects) {
          for (const dateKey of Object.keys(data.near_earth_objects)) {
            const list = data.near_earth_objects[dateKey];
            for (const item of list) {
              const approach = item.close_approach_data?.[0];
              if (!approach) continue;

              parsed.push({
                id: item.id,
                name: item.name.replace(/[()]/g, ''),
                estimatedDiameterMinM: Math.round(item.estimated_diameter?.meters?.estimated_diameter_min || 0),
                estimatedDiameterMaxM: Math.round(item.estimated_diameter?.meters?.estimated_diameter_max || 0),
                isPotentiallyHazardous: Boolean(item.is_potentially_hazardous_asteroid),
                closeApproachDate: approach.close_approach_date_full || approach.close_approach_date,
                missDistanceKm: Math.round(parseFloat(approach.miss_distance?.kilometers || '0')),
                missDistanceLunar: Number(parseFloat(approach.miss_distance?.lunar || '0').toFixed(2)),
                relativeVelocityKmH: Math.round(parseFloat(approach.relative_velocity?.kilometers_per_hour || '0')),
                absoluteMagnitude: item.absolute_magnitude_h || 20,
              });
            }
          }
        }

        // Sort by closest approach date / miss distance
        parsed.sort((a, b) => a.missDistanceKm - b.missDistanceKm);

        storageCache.set(cacheKey, parsed, NEOWS_TTL_MS);
        return {
          asteroids: parsed,
          source: 'live',
        };
      }
    } catch (err) {
      console.warn('[NeoWsService] Network fetch failed, falling back to cache:', err);
    }

    // 3. Fallback to stale cache
    const stale = storageCache.get<NearEarthAsteroid[]>(cacheKey, { ignoreExpiry: true });
    if (stale) {
      return {
        asteroids: stale.data,
        source: 'cache',
      };
    }

    // 4. Default fallback
    return {
      asteroids: FALLBACK_ASTEROIDS,
      source: 'fallback',
    };
  }
}

export const neowsService = new NeoWsService();
