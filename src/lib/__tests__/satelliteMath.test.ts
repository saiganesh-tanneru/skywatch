import { describe, it, expect } from 'vitest';
import {
  parseTleText,
  propagateSatellite,
  propagateAllSatellites,
  isSatelliteVisibleByFilter,
} from '../satelliteMath';
import { ObserverLocation } from '../../types';

describe('satelliteMath library', () => {
  const sampleTle = `
ISS (ZARYA)
1 25544U 98067A   26311.20783432  .00014294  00000+0  26479-3 0  9992
2 25544  51.6321 312.3516 0007247 357.8301   2.2655 15.49235271593925
CSS (TIANGONG)
1 48274U 21035A   26311.19842104  .00021540  00000+0  28412-3 0  9998
2 48274  41.4725 154.2150 0005412 112.4512 247.8105 15.60214510204128
`;

  const observer: ObserverLocation = {
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    elevationMeters: 10,
    source: 'preset',
    updatedAt: Date.now(),
  };

  it('parses raw TLE text into valid satellite records', () => {
    const list = parseTleText(sampleTle, 'stations');
    expect(list.length).toBe(2);
    expect(list[0].name).toBe('ISS (ZARYA)');
    expect(list[0].noradId).toBe(25544);
    expect(list[0].satrec).toBeDefined();
    expect(list[1].name).toBe('CSS (TIANGONG)');
    expect(list[1].noradId).toBe(48274);
  });

  it('computes valid azimuth, altitude, distance and velocity', () => {
    const list = parseTleText(sampleTle, 'stations');
    const iss = list[0];
    const testDate = new Date('2026-11-07T12:00:00Z');

    const result = propagateSatellite(iss, testDate, observer);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.id).toBe('sat-25544');
      expect(result.azimuth).toBeGreaterThanOrEqual(0);
      expect(result.azimuth).toBeLessThanOrEqual(360);
      expect(result.altitude).toBeGreaterThanOrEqual(-90);
      expect(result.altitude).toBeLessThanOrEqual(90);
      expect(result.distanceKm).toBeGreaterThan(100);
      expect(result.velocityKmS).toBeGreaterThan(6.0); // Orbital speed ~7.6 km/s
      expect(result.velocityKmS).toBeLessThan(9.0);
    }
  });

  it('filters out satellites below horizon with propagateAllSatellites', () => {
    const list = parseTleText(sampleTle, 'stations');
    const testDate = new Date('2026-11-07T12:00:00Z');

    // Filter with minAltitude = 0
    const visible = propagateAllSatellites(list, testDate, observer, 0);
    visible.forEach((obj) => {
      expect(obj.altitude).toBeGreaterThanOrEqual(0);
    });
  });

  it('gracefully handles bad or corrupt TLE lines without crashing', () => {
    const corruptTle = `
GHOST SAT
1 99999U corrupt   data here
2 99999  bad  numbers
`;
    const parsed = parseTleText(corruptTle, 'active');
    expect(parsed.length).toBe(0);
  });

  it('correctly filters Starlink satellites on and off via isSatelliteVisibleByFilter', () => {
    const starlinkSat = {
      name: 'STARLINK-1007',
      category: 'starlink',
      noradId: 44713,
      description: 'Starlink constellation satellite',
    };

    const starlinkInVisual = {
      name: 'STARLINK-30124',
      category: 'visual',
      noradId: 58000,
    };

    const iss = {
      name: 'ISS (ZARYA)',
      category: 'stations',
      noradId: 25544,
    };

    // When starlink group is false
    const groupsNoStarlink = {
      stations: true,
      visual: true,
      active: false,
      starlink: false,
      isro: true,
    };

    expect(isSatelliteVisibleByFilter(starlinkSat, groupsNoStarlink)).toBe(false);
    expect(isSatelliteVisibleByFilter(starlinkInVisual, groupsNoStarlink)).toBe(false);
    expect(isSatelliteVisibleByFilter(iss, groupsNoStarlink)).toBe(true);

    // When starlink group is true
    const groupsWithStarlink = {
      stations: true,
      visual: true,
      active: false,
      starlink: true,
      isro: true,
    };

    expect(isSatelliteVisibleByFilter(starlinkSat, groupsWithStarlink)).toBe(true);
    expect(isSatelliteVisibleByFilter(starlinkInVisual, groupsWithStarlink)).toBe(true);
  });

  it('correctly filters ISRO satellites on and off via isSatelliteVisibleByFilter', () => {
    const astrosat = {
      name: 'ASTROSAT',
      category: 'isro',
      noradId: 40930,
    };

    const navic = {
      name: 'IRNSS-1I (NAVIC)',
      category: 'active',
      noradId: 43286,
    };

    const cartosat = {
      name: 'CARTOSAT-3',
      category: 'visual',
      noradId: 44804,
    };

    const iss = {
      name: 'ISS (ZARYA)',
      category: 'stations',
      noradId: 25544,
    };

    // When ISRO group is enabled
    const groupsWithIsro = {
      stations: true,
      visual: true,
      active: false,
      starlink: false,
      isro: true,
    };

    expect(isSatelliteVisibleByFilter(astrosat, groupsWithIsro)).toBe(true);
    expect(isSatelliteVisibleByFilter(navic, groupsWithIsro)).toBe(true);
    expect(isSatelliteVisibleByFilter(cartosat, groupsWithIsro)).toBe(true);
    expect(isSatelliteVisibleByFilter(iss, groupsWithIsro)).toBe(true);

    // When ISRO group is disabled
    const groupsNoIsro = {
      stations: true,
      visual: true,
      active: false,
      starlink: false,
      isro: false,
    };

    expect(isSatelliteVisibleByFilter(astrosat, groupsNoIsro)).toBe(false);
    expect(isSatelliteVisibleByFilter(navic, groupsNoIsro)).toBe(false);
    expect(isSatelliteVisibleByFilter(cartosat, groupsNoIsro)).toBe(false);
    expect(isSatelliteVisibleByFilter(iss, groupsNoIsro)).toBe(true);
  });
});
