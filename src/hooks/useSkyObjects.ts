import { useState, useEffect, useMemo } from 'react';
import { useSkyStore } from '../store/useSkyStore';
import { useSatelliteTracker } from './useSatelliteTracker';
import { computeSolarSystem, computeStars, YaleStar } from '../lib/astronomy';
import { isSatelliteVisibleByFilter } from '../lib/satelliteMath';
import { SkyObject } from '../types';

export function useSkyObjects() {
  const { location, timeOffsetSeconds, filters, viewMode } = useSkyStore();
  const { visibleSatellites, catalogCount, isLoading: isSatellitesLoading, lastUpdated } = useSatelliteTracker();

  const [starCatalog, setStarCatalog] = useState<YaleStar[]>([]);
  const [isStarsLoading, setIsStarsLoading] = useState<boolean>(true);
  const [solarBodies, setSolarBodies] = useState<SkyObject[]>([]);
  const [visibleStars, setVisibleStars] = useState<SkyObject[]>([]);

  // 1. Fetch Yale Bright Star Catalog once on mount
  useEffect(() => {
    let isMounted = true;
    async function loadStars() {
      try {
        setIsStarsLoading(true);
        const res = await fetch('/data/yale_bright_stars.json');
        if (res.ok) {
          const data: YaleStar[] = await res.json();
          if (isMounted) {
            setStarCatalog(data);
          }
        }
      } catch (err) {
        console.warn('Failed to load Yale Star catalog:', err);
      } finally {
        if (isMounted) {
          setIsStarsLoading(false);
        }
      }
    }
    loadStars();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Re-compute solar system bodies and stars whenever time or location changes
  useEffect(() => {
    const simTime = new Date(Date.now() + timeOffsetSeconds * 1000);

    // Compute Sun, Moon, Planets
    const bodies = computeSolarSystem(simTime, location);
    setSolarBodies(bodies);

    // Compute visible Stars from catalog
    if (starCatalog.length > 0) {
      const stars = computeStars(starCatalog, simTime, location, filters.minAltitude || 0);
      setVisibleStars(stars);
    }
  }, [location, timeOffsetSeconds, starCatalog, filters.minAltitude]);

  // 3. Merge and apply user filters
  const allObjects = useMemo(() => {
    const list: SkyObject[] = [];

    // Satellites
    if (filters.satellites) {
      const allowedSats = visibleSatellites.filter((sat) =>
        isSatelliteVisibleByFilter(sat, filters.satelliteGroups)
      );
      list.push(...allowedSats);
    }

    // Solar system bodies
    for (const body of solarBodies) {
      if (body.type === 'sun' && !filters.sun) continue;
      if (body.type === 'moon' && !filters.moon) continue;
      if (body.type === 'planet' && !filters.planets) continue;

      // In Solar and Globe view, show all solar system bodies (they exist in space regardless of whether they are above or below the local observer's horizon on Earth!)
      if (viewMode === 'solar' || viewMode === 'globe' || body.altitude >= (filters.minAltitude || 0)) {
        list.push(body);
      }
    }

    // Stars
    if (filters.stars) {
      list.push(...visibleStars);
    }

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      return list.filter(
        (obj) =>
          obj.name.toLowerCase().includes(q) ||
          (obj.noradId && String(obj.noradId).includes(q)) ||
          (obj.description && obj.description.toLowerCase().includes(q))
      );
    }

    return list;
  }, [
    visibleSatellites,
    solarBodies,
    visibleStars,
    filters.satellites,
    filters.satelliteGroups,
    filters.sun,
    filters.moon,
    filters.planets,
    filters.stars,
    filters.searchQuery,
    filters.minAltitude,
    viewMode,
  ]);

  const isDataLoading = isSatellitesLoading || isStarsLoading;

  const loadingMessage = isStarsLoading
    ? 'Loading Bright Stars Catalog...'
    : filters.satelliteGroups.starlink
    ? 'Fetching Starlink Orbit Elements...'
    : filters.satelliteGroups.active
    ? 'Fetching Active Satellite Telemetry...'
    : 'Syncing Satellite Telemetry...';

  const loadingSubMessage = isStarsLoading
    ? 'Reading 9,000+ Yale Bright Star coordinates'
    : filters.satelliteGroups.starlink
    ? 'Downloading live CelesTrak Starlink megaconstellation TLEs'
    : filters.satelliteGroups.active
    ? 'Connecting to CelesTrak operational payloads feed'
    : 'Connecting to CelesTrak orbital elements';

  return {
    allObjects,
    satelliteCount: visibleSatellites.length,
    catalogCount,
    isSatellitesLoading,
    isStarsLoading,
    isDataLoading,
    loadingMessage,
    loadingSubMessage,
    lastUpdated,
  };
}
