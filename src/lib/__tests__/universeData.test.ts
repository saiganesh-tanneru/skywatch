import { describe, it, expect } from 'vitest';
import {
  COSMIC_OBJECTS,
  scaleCosmicLy,
  cosmicToSkyObject,
} from '../universeData';

describe('Vast Known Universe Cosmological Data', () => {
  it('contains comprehensive set of galaxies, black holes, dead stars, and wormholes', () => {
    expect(COSMIC_OBJECTS.length).toBeGreaterThanOrEqual(18);

    const galaxies = COSMIC_OBJECTS.filter((c) => c.category === 'galaxy');
    const blackHoles = COSMIC_OBJECTS.filter((c) => c.category === 'black_hole');
    const deadStars = COSMIC_OBJECTS.filter((c) => c.category === 'dead_star');
    const wormholes = COSMIC_OBJECTS.filter((c) => c.category === 'wormhole');

    expect(galaxies.length).toBeGreaterThanOrEqual(6);
    expect(blackHoles.length).toBeGreaterThanOrEqual(5);
    expect(deadStars.length).toBeGreaterThanOrEqual(5);
    expect(wormholes.length).toBeGreaterThanOrEqual(3);

    // Verify key landmark objects
    expect(COSMIC_OBJECTS.find((c) => c.id === 'galaxy-milky-way')).toBeDefined();
    expect(COSMIC_OBJECTS.find((c) => c.id === 'galaxy-andromeda')).toBeDefined();
    expect(COSMIC_OBJECTS.find((c) => c.id === 'bh-sagittarius-a')).toBeDefined();
    expect(COSMIC_OBJECTS.find((c) => c.id === 'bh-m87-star')).toBeDefined();
    expect(COSMIC_OBJECTS.find((c) => c.id === 'bh-ton-618')).toBeDefined();
    expect(COSMIC_OBJECTS.find((c) => c.id === 'star-crab-pulsar')).toBeDefined();
    expect(COSMIC_OBJECTS.find((c) => c.id === 'wormhole-einstein-rosen')).toBeDefined();
  });

  it('correctly maps cosmic distances with logarithmic scaling', () => {
    // 0 ly (Earth/Solar System) is at origin [0, 0, 0]
    const origin = scaleCosmicLy(0, 0, 0);
    expect(origin.x).toBe(0);
    expect(origin.y).toBe(0);
    expect(origin.z).toBe(0);

    // Deep space scaling monotonically increases with distance
    const localStar = scaleCosmicLy(650, 0, 0); // ~650 ly (Betelgeuse / Helix)
    const galacticCenter = scaleCosmicLy(26000, 0, 0); // 26,000 ly (Sgr A*)
    const andromeda = scaleCosmicLy(2500000, 0, 0); // 2.5 M ly
    const cmb = scaleCosmicLy(46500000000, 0, 0); // 46.5 B ly

    const distLocal = localStar.length();
    const distGalactic = galacticCenter.length();
    const distAndromeda = andromeda.length();
    const distCMB = cmb.length();

    expect(distLocal).toBeLessThan(distGalactic);
    expect(distGalactic).toBeLessThan(distAndromeda);
    expect(distAndromeda).toBeLessThan(distCMB);
    expect(distCMB).toBeLessThanOrEqual(200); // within observable sphere boundary
  });

  it('converts CosmicObject into valid SkyObject for inspector and detail drawer', () => {
    const sgrA = COSMIC_OBJECTS.find((c) => c.id === 'bh-sagittarius-a')!;
    const skyObj = cosmicToSkyObject(sgrA);

    expect(skyObj.id).toBe('bh-sagittarius-a');
    expect(skyObj.name).toContain('Sagittarius A*');
    expect(skyObj.type).toBe('black_hole');
    expect(skyObj.distanceLy).toBe(26000);
    expect(skyObj.massSolar).toContain('4.3 Million M☉');
    expect(skyObj.description).toContain('Milky Way');
  });
});
