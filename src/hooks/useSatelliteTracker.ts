import { useState, useEffect, useRef } from 'react';
import { useSkyStore } from '../store/useSkyStore';
import { celestrakService } from '../services/celestrakService';
import { RawSatelliteItem, propagateAllSatellites, isSatelliteVisibleByFilter } from '../lib/satelliteMath';
import { SkyObject, SatelliteGroup } from '../types';

export function useSatelliteTracker() {
  const { location, timeOffsetSeconds, filters, viewMode } = useSkyStore();
  const [catalog, setCatalog] = useState<RawSatelliteItem[]>([]);
  const [visibleSatellites, setVisibleSatellites] = useState<SkyObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const catalogRef = useRef<RawSatelliteItem[]>([]);
  catalogRef.current = catalog;

  // 1. Fetch satellite catalogs for active groups
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    async function loadCatalogs() {
      const activeGroups = (Object.keys(filters.satelliteGroups) as SatelliteGroup[]).filter(
        (g) => filters.satelliteGroups[g]
      );

      const items: RawSatelliteItem[] = [];
      const seenIds = new Set<number>();

      for (const group of activeGroups) {
        try {
          const list = await celestrakService.fetchSatellites(group);
          for (const item of list) {
            // Strictly exclude starlink if starlink group is deselected
            if (!isSatelliteVisibleByFilter(item, filters.satelliteGroups)) {
              continue;
            }
            if (!seenIds.has(item.noradId)) {
              seenIds.add(item.noradId);
              items.push(item);
            }
          }
        } catch (err) {
          console.warn(`Error loading group ${group}:`, err);
        }
      }

      if (isMounted) {
        setCatalog(items);
        setIsLoading(false);
      }
    }

    loadCatalogs();

    return () => {
      isMounted = false;
    };
  }, [filters.satelliteGroups]);

  // 2. Propagate positions every second (or when timeOffset/location/groups change)
  useEffect(() => {
    function updatePositions() {
      if (catalogRef.current.length === 0) {
        setVisibleSatellites([]);
        return;
      }

      const simTime = new Date(Date.now() + timeOffsetSeconds * 1000);
      const visible = propagateAllSatellites(
        catalogRef.current,
        simTime,
        location,
        filters.minAltitude || 0,
        viewMode !== 'globe' && viewMode !== 'solar' // show all satellites when in 3D Earth Globe or Solar System mode
      );

      // Apply satellite group filters (e.g. remove Starlink immediately upon deselecting)
      const filtered = visible.filter((sat) => isSatelliteVisibleByFilter(sat, filters.satelliteGroups));

      setVisibleSatellites(filtered);
      setLastUpdated(simTime);
    }

    updatePositions();

    const interval = setInterval(updatePositions, 1000);
    return () => clearInterval(interval);
  }, [location, timeOffsetSeconds, filters.minAltitude, filters.satelliteGroups, catalog, viewMode]);

  return {
    visibleSatellites,
    catalogCount: catalog.length,
    isLoading,
    lastUpdated,
  };
}
