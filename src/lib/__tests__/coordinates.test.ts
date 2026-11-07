import { describe, it, expect } from 'vitest';
import {
  altAzToCartesian,
  altAzToPolar2D,
  normalizeAzimuth,
  azimuthToCompass,
} from '../coordinates';

describe('coordinates math library', () => {
  const R = 100;

  describe('altAzToCartesian (3D)', () => {
    it('zenith (alt 90) places object straight up at [0, R, 0]', () => {
      const pos = altAzToCartesian(90, 0, R);
      expect(pos.x).toBeCloseTo(0, 4);
      expect(pos.y).toBeCloseTo(R, 4);
      expect(pos.z).toBeCloseTo(0, 4);
    });

    it('horizon North (alt 0, az 0) places object at [0, 0, -R]', () => {
      const pos = altAzToCartesian(0, 0, R);
      expect(pos.x).toBeCloseTo(0, 4);
      expect(pos.y).toBeCloseTo(0, 4);
      expect(pos.z).toBeCloseTo(-R, 4);
    });

    it('horizon East (alt 0, az 90) places object at [R, 0, 0]', () => {
      const pos = altAzToCartesian(0, 90, R);
      expect(pos.x).toBeCloseTo(R, 4);
      expect(pos.y).toBeCloseTo(0, 4);
      expect(pos.z).toBeCloseTo(0, 4);
    });

    it('horizon South (alt 0, az 180) places object at [0, 0, R]', () => {
      const pos = altAzToCartesian(0, 180, R);
      expect(pos.x).toBeCloseTo(0, 4);
      expect(pos.y).toBeCloseTo(0, 4);
      expect(pos.z).toBeCloseTo(R, 4);
    });

    it('horizon West (alt 0, az 270) places object at [-R, 0, 0]', () => {
      const pos = altAzToCartesian(0, 270, R);
      expect(pos.x).toBeCloseTo(-R, 4);
      expect(pos.y).toBeCloseTo(0, 4);
      expect(pos.z).toBeCloseTo(0, 4);
    });

    it('conserves sphere radius for any altitude and azimuth', () => {
      const pos = altAzToCartesian(42.5, 137.2, R);
      const computedRadius = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
      expect(computedRadius).toBeCloseTo(R, 4);
    });
  });

  describe('altAzToPolar2D (Planisphere)', () => {
    const cx = 200;
    const cy = 200;
    const chartR = 150;

    it('zenith (alt 90) maps to center of chart [cx, cy]', () => {
      const pt = altAzToPolar2D(90, 45, cx, cy, chartR);
      expect(pt.x).toBeCloseTo(cx, 4);
      expect(pt.y).toBeCloseTo(cy, 4);
    });

    it('horizon North (alt 0, az 0) maps to top [cx, cy - chartR]', () => {
      const pt = altAzToPolar2D(0, 0, cx, cy, chartR);
      expect(pt.x).toBeCloseTo(cx, 4);
      expect(pt.y).toBeCloseTo(cy - chartR, 4);
    });

    it('horizon East (alt 0, az 90) maps to left [cx - chartR, cy] (sky chart projection)', () => {
      const pt = altAzToPolar2D(0, 90, cx, cy, chartR);
      expect(pt.x).toBeCloseTo(cx - chartR, 4);
      expect(pt.y).toBeCloseTo(cy, 4);
    });

    it('horizon South (alt 0, az 180) maps to bottom [cx, cy + chartR]', () => {
      const pt = altAzToPolar2D(0, 180, cx, cy, chartR);
      expect(pt.x).toBeCloseTo(cx, 4);
      expect(pt.y).toBeCloseTo(cy + chartR, 4);
    });

    it('horizon West (alt 0, az 270) maps to right [cx + chartR, cy]', () => {
      const pt = altAzToPolar2D(0, 270, cx, cy, chartR);
      expect(pt.x).toBeCloseTo(cx + chartR, 4);
      expect(pt.y).toBeCloseTo(cy, 4);
    });
  });

  describe('azimuth helpers', () => {
    it('normalizes angles', () => {
      expect(normalizeAzimuth(370)).toBe(10);
      expect(normalizeAzimuth(-30)).toBe(330);
      expect(normalizeAzimuth(0)).toBe(0);
    });

    it('converts azimuth to compass direction', () => {
      expect(azimuthToCompass(0)).toBe('N');
      expect(azimuthToCompass(90)).toBe('E');
      expect(azimuthToCompass(180)).toBe('S');
      expect(azimuthToCompass(270)).toBe('W');
      expect(azimuthToCompass(45)).toBe('NE');
      expect(azimuthToCompass(315)).toBe('NW');
    });
  });
});
