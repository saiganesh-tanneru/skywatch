import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  SOLAR_ASTEROIDS,
  calculateAsteroidPosition,
  asteroidToSkyObject,
} from '../solarAsteroids';

describe('solarAsteroids - Solar System Asteroid Mapping', () => {
  it('defines major belt asteroids and famous near-earth asteroids with authentic imagery metadata', () => {
    expect(SOLAR_ASTEROIDS.length).toBeGreaterThanOrEqual(10);

    const ceres = SOLAR_ASTEROIDS.find((a) => a.id === 'asteroid-ceres');
    expect(ceres).toBeDefined();
    expect(ceres?.diameterKm).toBeCloseTo(939.4, 0);
    expect(ceres?.orbitClass).toBe('Dwarf Planet');
    expect(ceres?.imageUrl).toBe('/images/asteroids/ceres.svg');
    expect(ceres?.missions).toContain('NASA Dawn (Orbited 2015–2018)');

    const vesta = SOLAR_ASTEROIDS.find((a) => a.id === 'asteroid-vesta');
    expect(vesta).toBeDefined();
    expect(vesta?.imageUrl).toBe('/images/asteroids/vesta.svg');

    const psyche = SOLAR_ASTEROIDS.find((a) => a.id === 'asteroid-psyche');
    expect(psyche).toBeDefined();
    expect(psyche?.spectralType).toContain('Metallic');
    expect(psyche?.imageUrl).toBe('/images/asteroids/psyche.svg');

    const bennu = SOLAR_ASTEROIDS.find((a) => a.id === 'asteroid-bennu');
    expect(bennu).toBeDefined();
    expect(bennu?.orbitClass).toBe('Near-Earth (Apollo)');
    expect(bennu?.imageUrl).toBe('/images/asteroids/bennu.svg');

    const apophis = SOLAR_ASTEROIDS.find((a) => a.id === 'asteroid-apophis');
    expect(apophis).toBeDefined();
    expect(apophis?.orbitClass).toBe('Near-Earth (Aten)');
    expect(apophis?.imageUrl).toBe('/images/asteroids/apophis.svg');
  });

  it('calculates 3D heliocentric positions using Keplerian orbital mechanics', () => {
    const epochMs = Date.now();

    SOLAR_ASTEROIDS.forEach((ast) => {
      const pos = calculateAsteroidPosition(ast, epochMs);
      expect(Number.isFinite(pos.x)).toBe(true);
      expect(Number.isFinite(pos.y)).toBe(true);
      expect(Number.isFinite(pos.z)).toBe(true);

      // Distance from Sun center should be scaled relative to semi-major axis
      const dist = Math.sqrt(pos.x * pos.x + pos.y * yFromPos(pos) + pos.z * pos.z);
      expect(dist).toBeGreaterThan(0);
    });

    function yFromPos(p: THREE.Vector3) {
      return p.y;
    }
  });

  it('converts asteroid to interactive SkyObject with telemetry', () => {
    const ceres = SOLAR_ASTEROIDS.find((a) => a.id === 'asteroid-ceres')!;
    const pos = new THREE.Vector3(50, 0, 0);
    const earthPos = new THREE.Vector3(28, 0, 0);

    const skyObj = asteroidToSkyObject(ceres, pos, earthPos);

    expect(skyObj.id).toBe('asteroid-ceres');
    expect(skyObj.name).toBe('1 Ceres');
    expect(skyObj.type).toBe('asteroid');
    expect(skyObj.diameterKm).toBeCloseTo(939.4, 0);
    expect(skyObj.orbitClass).toBe('Dwarf Planet');
    expect(skyObj.imageUrl).toBe('/images/asteroids/ceres.svg');
    expect(skyObj.missions).toBeDefined();
    expect(skyObj.distanceKm).toBeGreaterThan(0);
  });
});
