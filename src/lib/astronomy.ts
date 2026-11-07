import * as Astronomy from 'astronomy-engine';
import { ObserverLocation, SkyObject } from '../types';

export interface YaleStar {
  name: string;
  bayer: string;
  constellation: string;
  ra: number; // hours
  dec: number; // degrees
  mag: number;
  spectral: string;
}

const KM_PER_AU = 149597870.7;

const PLANET_NAMES: Astronomy.Body[] = [
  Astronomy.Body.Mercury,
  Astronomy.Body.Venus,
  Astronomy.Body.Mars,
  Astronomy.Body.Jupiter,
  Astronomy.Body.Saturn,
  Astronomy.Body.Uranus,
  Astronomy.Body.Neptune,
  Astronomy.Body.Pluto,
];

const PLANET_DESCRIPTIONS: Record<string, string> = {
  Mercury: 'Innermost rocky terrestrial planet, heavily cratered with extreme temperature variations.',
  Venus: 'Second planet from the Sun; enveloped in dense reflective sulfuric acid clouds; hottest planetary surface.',
  Mars: 'The Red Planet; terrestrial body with a thin atmosphere, polar ice caps, and ancient riverbeds.',
  Jupiter: 'The solar system\'s largest gas giant with famous cloud bands, the Great Red Spot, and 95 moons.',
  Saturn: 'Majestic ringed gas giant composed mostly of hydrogen and helium, featuring thousands of individual ringlets.',
  Uranus: 'Ice giant with an axial tilt of 98°, giving it extreme seasons; pale cyan-aquamarine methane atmosphere.',
  Neptune: 'Farthest major planet; deep azure ice giant featuring dynamic supersonic winds up to 2,100 km/h.',
  Pluto: 'Dwarf planet in the Kuiper belt, featuring a nitrogen ice heart (Tombaugh Regio) and five moons.',
};

/**
 * Computes live Alt-Azimuth positions and physical properties for Sun, Moon, and all Planets.
 */
export function computeSolarSystem(date: Date, observerLoc: ObserverLocation): SkyObject[] {
  const obs = new Astronomy.Observer(
    observerLoc.latitude,
    observerLoc.longitude,
    Math.max(0, observerLoc.elevationMeters)
  );

  const objects: SkyObject[] = [];

  // 1. Sun
  try {
    const sunEq = Astronomy.Equator(Astronomy.Body.Sun, date, obs, true, true);
    const sunHor = Astronomy.Horizon(date, obs, sunEq.ra, sunEq.dec, 'normal');
    const sunDistKm = Math.round(sunEq.dist * KM_PER_AU);

    objects.push({
      id: 'sun',
      name: 'Sun',
      type: 'sun',
      azimuth: Number(sunHor.azimuth.toFixed(2)),
      altitude: Number(sunHor.altitude.toFixed(2)),
      ra: Number(sunEq.ra.toFixed(4)),
      dec: Number(sunEq.dec.toFixed(4)),
      distanceKm: sunDistKm,
      magnitude: -26.74,
      color: '#fbbf24',
      size: 4.0,
      helioX: 0,
      helioY: 0,
      helioZ: 0,
      description: `Our home star. Distance: ${(sunDistKm / 1e6).toFixed(2)} million km (1.00 AU).`,
    });
  } catch (err) {
    console.warn('Error calculating Sun position:', err);
  }

  // Calculate Earth heliocentric coordinates for reference
  let earthHelio = { x: 0, y: 0, z: 0 };
  try {
    const eVec = Astronomy.HelioVector(Astronomy.Body.Earth, date);
    earthHelio = { x: eVec.x, y: eVec.y, z: eVec.z };

    objects.push({
      id: 'planet-earth',
      name: 'Earth',
      type: 'planet',
      azimuth: 0,
      altitude: 90,
      distanceKm: 0,
      magnitude: -4.0,
      color: '#06b6d4',
      size: 2.2,
      helioX: eVec.x,
      helioY: eVec.y,
      helioZ: eVec.z,
      description: 'Our home planet Earth orbiting the Sun at 1.00 AU.',
    });
  } catch (err) {
    console.warn('Error calculating Earth heliocentric position:', err);
  }

  // 2. Moon
  try {
    const moonEq = Astronomy.Equator(Astronomy.Body.Moon, date, obs, true, true);
    const moonHor = Astronomy.Horizon(date, obs, moonEq.ra, moonEq.dec, 'normal');
    const moonIllum = Astronomy.Illumination(Astronomy.Body.Moon, date);
    const moonDistKm = Math.round(moonEq.dist * KM_PER_AU);
    const illumPct = Math.round(moonIllum.phase_fraction * 100);

    const mGeo = Astronomy.GeoVector(Astronomy.Body.Moon, date, true);

    // Compute descriptive phase name
    let phaseName = 'Moon';
    const angle = moonIllum.phase_angle;
    if (angle < 15) phaseName = 'Full Moon';
    else if (angle < 75) phaseName = 'Gibbous Moon';
    else if (angle < 105) phaseName = 'Quarter Moon';
    else if (angle < 165) phaseName = 'Crescent Moon';
    else phaseName = 'New Moon';

    objects.push({
      id: 'moon',
      name: `Moon (${phaseName})`,
      type: 'moon',
      azimuth: Number(moonHor.azimuth.toFixed(2)),
      altitude: Number(moonHor.altitude.toFixed(2)),
      ra: Number(moonEq.ra.toFixed(4)),
      dec: Number(moonEq.dec.toFixed(4)),
      distanceKm: moonDistKm,
      magnitude: Number(moonIllum.mag.toFixed(1)),
      color: '#f8fafc',
      size: 3.0,
      helioX: earthHelio.x + mGeo.x,
      helioY: earthHelio.y + mGeo.y,
      helioZ: earthHelio.z + mGeo.z,
      description: `Earth's natural satellite. ${illumPct}% illuminated. Distance: ${moonDistKm.toLocaleString()} km.`,
    });
  } catch (err) {
    console.warn('Error calculating Moon position:', err);
  }

  // 3. Planets (Mercury through Pluto)
  for (const body of PLANET_NAMES) {
    try {
      const eq = Astronomy.Equator(body, date, obs, true, true);
      const hor = Astronomy.Horizon(date, obs, eq.ra, eq.dec, 'normal');
      const illum = Astronomy.Illumination(body, date);
      const distKm = Math.round(eq.dist * KM_PER_AU);
      const hVec = Astronomy.HelioVector(body, date);

      let color = '#f59e0b';
      let size = 2.0;

      switch (body) {
        case 'Mercury': color = '#94a3b8'; size = 1.6; break;
        case 'Venus': color = '#fef08a'; size = 2.4; break;
        case 'Mars': color = '#ef4444'; size = 2.0; break;
        case 'Jupiter': color = '#f59e0b'; size = 2.8; break;
        case 'Saturn': color = '#eab308'; size = 2.6; break;
        case 'Uranus': color = '#22d3ee'; size = 1.8; break;
        case 'Neptune': color = '#3b82f6'; size = 1.8; break;
        case 'Pluto': color = '#a8a29e'; size = 1.2; break;
      }

      objects.push({
        id: `planet-${body.toLowerCase()}`,
        name: body,
        type: 'planet',
        azimuth: Number(hor.azimuth.toFixed(2)),
        altitude: Number(hor.altitude.toFixed(2)),
        ra: Number(eq.ra.toFixed(4)),
        dec: Number(eq.dec.toFixed(4)),
        distanceKm: distKm,
        magnitude: Number(illum.mag.toFixed(2)),
        color,
        size,
        helioX: hVec.x,
        helioY: hVec.y,
        helioZ: hVec.z,
        description: `${PLANET_DESCRIPTIONS[body] || ''} Distance: ${(eq.dist).toFixed(2)} AU (${(distKm / 1e6).toFixed(1)} million km).`,
      });
    } catch {
      // Continue next planet
    }
  }

  return objects;
}

/**
 * Maps stellar spectral class (O, B, A, F, G, K, M) to natural star color
 */
export function getStarColor(spectral: string): string {
  const letter = spectral.charAt(0).toUpperCase();
  switch (letter) {
    case 'O':
    case 'B':
      return '#93c5fd'; // blue / blue-white (hot, ~10,000K - 30,000K)
    case 'A':
      return '#ffffff'; // pure white (e.g. Sirius, Vega ~8,000K)
    case 'F':
      return '#fef9c3'; // yellow-white (e.g. Procyon, Polaris ~6,500K)
    case 'G':
      return '#fde047'; // solar yellow (e.g. Sun, Capella ~5,500K)
    case 'K':
      return '#fb923c'; // orange (e.g. Arcturus, Aldebaran ~4,000K)
    case 'M':
      return '#f87171'; // red-orange (e.g. Betelgeuse, Antares ~3,000K)
    default:
      return '#f1f5f9';
  }
}

/**
 * Computes Alt-Azimuth coordinates for stars from the Yale Bright Star catalog.
 */
export function computeStars(
  stars: YaleStar[],
  date: Date,
  observerLoc: ObserverLocation,
  minAltitude = 0
): SkyObject[] {
  const obs = new Astronomy.Observer(
    observerLoc.latitude,
    observerLoc.longitude,
    Math.max(0, observerLoc.elevationMeters)
  );

  const objects: SkyObject[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    try {
      const starId = `star-${star.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      if (seenIds.has(starId)) continue;

      // Astronomy.Horizon takes ra in HOURS, dec in DEGREES
      const hor = Astronomy.Horizon(date, obs, star.ra, star.dec, 'normal');

      if (hor.altitude >= minAltitude) {
        seenIds.add(starId);
        const color = getStarColor(star.spectral);
        const size = Math.max(0.6, 2.2 - star.mag * 0.35);

        objects.push({
          id: starId,
          name: `${star.name} (${star.bayer})`,
          type: 'star',
          azimuth: Number(hor.azimuth.toFixed(2)),
          altitude: Number(hor.altitude.toFixed(2)),
          ra: star.ra,
          dec: star.dec,
          magnitude: star.mag,
          color,
          size,
          description: `${star.name} is a magnitude ${star.mag} star in the constellation ${star.constellation}. Spectral class: ${star.spectral}.`,
        });
      }
    } catch {
      // Continue next star
    }
  }

  return objects;
}
