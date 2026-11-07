import { useEffect, useCallback, useState } from 'react';
import { useSkyStore, loadSavedLocation } from '../store/useSkyStore';
import { storageCache, TWELVE_HOURS_MS } from '../services/storageCache';
import { ObserverLocation } from '../types';

async function fetchCityName(lat: number, lon: number): Promise<string | null> {
  const cacheKey = `geo_city_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = storageCache.get<string>(cacheKey);
  if (cached && !cached.isExpired) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.county ||
        data.address?.state;
      const country = data.address?.country_code?.toUpperCase() || '';
      if (city) {
        const fullCity = country ? `${city}, ${country}` : city;
        storageCache.set(cacheKey, fullCity, TWELVE_HOURS_MS);
        return fullCity;
      }
    }
  } catch {
    // Ignore reverse geocoding failure, fallback to coordinates
  }
  return null;
}

async function fetchIpLocation(): Promise<ObserverLocation | null> {
  const cacheKey = 'geo_ip_location';
  const cached = storageCache.get<ObserverLocation>(cacheKey);
  if (cached && !cached.isExpired) {
    return cached.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.success && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        const loc: ObserverLocation = {
          name: `${data.city || 'Local Area'}, ${data.country_code || ''}`,
          latitude: Number(data.latitude.toFixed(4)),
          longitude: Number(data.longitude.toFixed(4)),
          elevationMeters: 20,
          source: 'ip',
          updatedAt: Date.now(),
        };
        storageCache.set(cacheKey, loc, TWELVE_HOURS_MS);
        return loc;
      }
    }
  } catch (err) {
    console.warn('[useGeolocation] IP location fetch error:', err);
  }
  return null;
}

export function useGeolocation() {
  const {
    location,
    setLocation,
    setLocationModalOpen,
    setLocationError,
    locationError,
  } = useSkyStore();

  const [isLocating, setIsLocating] = useState<boolean>(false);

  const detectLocation = useCallback(
    async (isUserInitiated = true) => {
      setIsLocating(true);
      setLocationError(null);

      // Attempt 1: Browser Geolocation
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false, // Much faster & more reliable on desktop/laptops
              timeout: 6000,
              maximumAge: 300000, // 5 min cache
            });
          });

          const { latitude, longitude, altitude } = position.coords;
          const lat = Number(latitude.toFixed(4));
          const lon = Number(longitude.toFixed(4));

          // Try reverse geocoding for a friendly name
          const resolvedName = await fetchCityName(lat, lon);
          const friendlyName =
            resolvedName ||
            `GPS (${lat >= 0 ? lat + '°N' : Math.abs(lat) + '°S'}, ${
              lon >= 0 ? lon + '°E' : Math.abs(lon) + '°W'
            })`;

          const newLocation: ObserverLocation = {
            name: friendlyName,
            latitude: lat,
            longitude: lon,
            elevationMeters: altitude && !isNaN(altitude) ? Math.round(altitude) : 15,
            source: 'gps',
            updatedAt: Date.now(),
          };

          setLocation(newLocation);
          setIsLocating(false);
          setLocationModalOpen(false);
          return;
        } catch (geoError: unknown) {
          const err = geoError as GeolocationPositionError;
          console.warn('[useGeolocation] Browser GPS failed or unavailable:', err?.message);
        }
      }

      // Attempt 2: Fallback to IP Geolocation if browser GPS is unavailable, timed out or denied
      const ipLoc = await fetchIpLocation();
      if (ipLoc) {
        setLocation(ipLoc);
        setIsLocating(false);
        setLocationModalOpen(false);
        return;
      }

      // Attempt 3: If both failed, open manual location configuration modal
      setIsLocating(false);
      const fallbackMsg =
        'Browser geolocation could not be retrieved. Please enter your coordinates or pick a preset city below.';
      setLocationError(fallbackMsg);
      if (isUserInitiated) {
        setLocationModalOpen(true);
      }
    },
    [setLocation, setLocationError, setLocationModalOpen]
  );

  useEffect(() => {
    // Only auto-request if no previous location was saved in localStorage
    const saved = loadSavedLocation();
    if (!saved) {
      detectLocation(false);
    }
  }, [detectLocation]);

  return {
    location,
    isLocating,
    locationError,
    requestCurrentLocation: () => detectLocation(true),
  };
}
