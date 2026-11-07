import { describe, it, expect } from 'vitest';
import { parseTleText } from '../satelliteMath';
import { predictPasses } from '../passPredictor';
import { ObserverLocation } from '../../types';

describe('passPredictor library', () => {
  const issTle = `
ISS (ZARYA)
1 25544U 98067A   26311.20783432  .00014294  00000+0  26479-3 0  9992
2 25544  51.6321 312.3516 0007247 357.8301   2.2655 15.49235271593925
`;

  const observer: ObserverLocation = {
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    elevationMeters: 10,
    source: 'preset',
    updatedAt: Date.now(),
  };

  it('predicts upcoming passes over a 24-hour window', () => {
    const list = parseTleText(issTle, 'stations');
    expect(list.length).toBe(1);

    const iss = list[0];
    const startTime = new Date('2026-11-07T00:00:00Z');

    const passes = predictPasses(iss, observer, startTime, 24, 30, 10);
    // Over 24 hours, the ISS completes ~15.5 orbits, several will pass near NYC latitude
    expect(passes.length).toBeGreaterThanOrEqual(1);

    const firstPass = passes[0];
    expect(firstPass.satelliteName).toBe('ISS (ZARYA)');
    expect(firstPass.noradId).toBe(25544);
    expect(firstPass.riseTime.getTime()).toBeLessThan(firstPass.peakTime.getTime());
    expect(firstPass.peakTime.getTime()).toBeLessThan(firstPass.setTime.getTime());
    expect(firstPass.maxAltitude).toBeGreaterThanOrEqual(10);
    expect(firstPass.durationSeconds).toBeGreaterThan(60); // pass lasts several minutes
    expect(firstPass.startAzimuth).toBeGreaterThanOrEqual(0);
    expect(firstPass.startAzimuth).toBeLessThanOrEqual(360);
  });
});
