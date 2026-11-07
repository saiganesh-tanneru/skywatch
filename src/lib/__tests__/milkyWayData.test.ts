import { describe, it, expect } from 'vitest';
import {
  MILKY_WAY_OBJECTS,
  SUN_GAL_POS,
  offsetFromSunLy,
  milkyWayToSkyObject,
} from '../milkyWayData';

describe('Milky Way Galaxy Cartography & Data', () => {
  it('contains comprehensive set of core, arms, giants, nebulae, clusters, black holes, and exoplanets', () => {
    expect(MILKY_WAY_OBJECTS.length).toBeGreaterThanOrEqual(20);

    const coreObjects = MILKY_WAY_OBJECTS.filter((m) => m.category === 'core');
    const arms = MILKY_WAY_OBJECTS.filter((m) => m.category === 'arm');
    const stars = MILKY_WAY_OBJECTS.filter((m) => m.category === 'star');
    const nebulae = MILKY_WAY_OBJECTS.filter((m) => m.category === 'nebula');
    const clusters = MILKY_WAY_OBJECTS.filter((m) => m.category === 'cluster');
    const blackHoles = MILKY_WAY_OBJECTS.filter((m) => m.category === 'black_hole');
    const exoplanets = MILKY_WAY_OBJECTS.filter((m) => m.category === 'exoplanet');
    const fermi = MILKY_WAY_OBJECTS.filter((m) => m.category === 'fermi_bubble');

    expect(coreObjects.length).toBeGreaterThanOrEqual(2);
    expect(arms.length).toBeGreaterThanOrEqual(4);
    expect(stars.length).toBeGreaterThanOrEqual(5);
    expect(nebulae.length).toBeGreaterThanOrEqual(4);
    expect(clusters.length).toBeGreaterThanOrEqual(3);
    expect(blackHoles.length).toBeGreaterThanOrEqual(4);
    expect(exoplanets.length).toBeGreaterThanOrEqual(3);
    expect(fermi.length).toBeGreaterThanOrEqual(1);

    // Verify key landmark objects
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-sagittarius-a-star')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-solar-system')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-stephenson-2-18')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-betelgeuse')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-eta-carinae')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-orion-nebula')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-eagle-nebula')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-omega-centauri')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-gaia-bh1')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-gaia-bh3')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-trappist-1')).toBeDefined();
    expect(MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-fermi-bubbles')).toBeDefined();
  });

  it('correctly sets the Solar System location at 26,670 ly from Sagittarius A*', () => {
    const sgrA = MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-sagittarius-a-star')!;
    const sun = MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-solar-system')!;

    // Sagittarius A* is at the origin (0, 0, 0)
    expect(sgrA.galPos.x).toBe(0);
    expect(sgrA.galPos.y).toBe(0);
    expect(sgrA.galPos.z).toBe(0);

    // Sun is at SUN_GAL_POS (~53.34 scene units = 26.67 kly)
    expect(sun.galPos.distanceTo(sgrA.galPos)).toBeCloseTo(53.34, 1);
    expect(sun.distanceLyFromCore).toBe(26670);
    expect(sun.distanceLyFromEarth).toBe(0);
  });

  it('correctly computes relative offset from the Sun', () => {
    // 0 ly offset returns exactly SUN_GAL_POS
    const atSun = offsetFromSunLy(0, 0, 0);
    expect(atSun.x).toBeCloseTo(SUN_GAL_POS.x, 3);
    expect(atSun.y).toBeCloseTo(SUN_GAL_POS.y, 3);
    expect(atSun.z).toBeCloseTo(SUN_GAL_POS.z, 3);

    // 1,000 ly offset produces 2 units delta in distance
    const offset = offsetFromSunLy(1000, 90, 0);
    const distFromSun = offset.distanceTo(SUN_GAL_POS);
    expect(distFromSun).toBeCloseTo(2.0, 2);
  });

  it('converts MilkyWayObject to SkyObject with detailed astrophysics descriptions', () => {
    const sgrA = MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-sagittarius-a-star')!;
    const skyObj = milkyWayToSkyObject(sgrA);

    expect(skyObj.id).toBe('mw-sagittarius-a-star');
    expect(skyObj.name).toContain('Sagittarius A*');
    expect(skyObj.type).toBe('black_hole');
    expect(skyObj.massSolar).toBe('4.297 Million M☉');
    expect(skyObj.description).toContain('Key Astrophysics:');
    expect(skyObj.cosmicX).toBe(sgrA.galPos.x);
    expect(skyObj.cosmicY).toBe(sgrA.galPos.y);
    expect(skyObj.cosmicZ).toBe(sgrA.galPos.z);
  });

  it('verifies that spiral arm configurations and landmark pointers match mathematically', () => {
    // Orion arm at theta = 0 passes through the Sun (r0 = 53.34)
    const orionArm = MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-arm-orion')!;
    const sun = MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-solar-system')!;

    // Distance between Orion arm pointer and Sun along the local spur is close
    expect(orionArm.galPos.distanceTo(sun.galPos)).toBeLessThan(12.0);

    // Perseus arm lies outside the Solar System (r > 53.34)
    const perseusArm = MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-arm-perseus')!;
    const rPerseus = Math.sqrt(perseusArm.galPos.x ** 2 + perseusArm.galPos.z ** 2);
    expect(rPerseus).toBeGreaterThan(53.34);

    // Scutum-Centaurus arm lies inside the Solar System (r < 53.34)
    const scutumArm = MILKY_WAY_OBJECTS.find((m) => m.id === 'mw-arm-scutum-centaurus')!;
    const rScutum = Math.sqrt(scutumArm.galPos.x ** 2 + scutumArm.galPos.z ** 2);
    expect(rScutum).toBeLessThan(53.34);
  });
});
