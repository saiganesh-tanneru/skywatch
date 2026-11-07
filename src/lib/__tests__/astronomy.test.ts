import { describe, it, expect } from 'vitest';
import { computeSolarSystem, computeStars, getStarColor, YaleStar } from '../astronomy';
import { ObserverLocation } from '../../types';

describe('astronomy library', () => {
  const observer: ObserverLocation = {
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    elevationMeters: 10,
    source: 'preset',
    updatedAt: Date.now(),
  };

  const testDate = new Date('2026-11-07T18:00:00Z');

  it('computes Sun, Moon, and planets with physical properties', () => {
    const bodies = computeSolarSystem(testDate, observer);

    const sun = bodies.find((b) => b.type === 'sun');
    const moon = bodies.find((b) => b.type === 'moon');
    const jupiter = bodies.find((b) => b.name === 'Jupiter');

    expect(sun).toBeDefined();
    expect(sun?.distanceKm).toBeGreaterThan(140000000);
    expect(sun?.distanceKm).toBeLessThan(160000000);

    expect(moon).toBeDefined();
    expect(moon?.distanceKm).toBeGreaterThan(350000);
    expect(moon?.distanceKm).toBeLessThan(420000);

    expect(jupiter).toBeDefined();
    expect(jupiter?.type).toBe('planet');
    expect(jupiter?.azimuth).toBeGreaterThanOrEqual(0);
    expect(jupiter?.azimuth).toBeLessThanOrEqual(360);
  });

  it('computes Polaris at North within ~1° of observer latitude', () => {
    const polaris: YaleStar = {
      name: 'Polaris',
      bayer: 'α UMi',
      constellation: 'Ursa Minor',
      ra: 2.5303,
      dec: 89.2641,
      mag: 1.98,
      spectral: 'F7Ib',
    };

    const stars = computeStars([polaris], testDate, observer, 0);
    expect(stars.length).toBe(1);

    const p = stars[0];
    // Azimuth should be within 2 degrees of True North (0° or 360°)
    const azDiff = Math.min(p.azimuth, 360 - p.azimuth);
    expect(azDiff).toBeLessThan(2.5);

    // Altitude should be within ~1° of latitude 40.71°
    expect(Math.abs(p.altitude - observer.latitude)).toBeLessThan(1.5);
  });

  it('maps spectral classes to correct star colors', () => {
    expect(getStarColor('B8Ia')).toBe('#93c5fd'); // Rigel (blue)
    expect(getStarColor('A0V')).toBe('#ffffff');  // Vega (white)
    expect(getStarColor('M1Ia')).toBe('#f87171'); // Betelgeuse (red)
  });
});
