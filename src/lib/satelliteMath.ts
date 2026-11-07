import * as satellite from 'satellite.js';
import { ObserverLocation, SkyObject, SatelliteGroup } from '../types';

export interface RawSatelliteItem {
  id: string;
  name: string;
  noradId: number;
  line1: string;
  line2: string;
  group: SatelliteGroup;
  satrec: satellite.SatRec;
}

/**
 * Parses raw 3-line or 2-line TLE text from CelesTrak into parsed satellite objects with initialized satrecs.
 */
export function parseTleText(text: string, group: SatelliteGroup = 'visual'): RawSatelliteItem[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: RawSatelliteItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is line 1 of TLE (starts with '1 ')
    if (line.startsWith('1 ') && i + 1 < lines.length && lines[i + 1].startsWith('2 ')) {
      const line1 = line;
      const line2 = lines[i + 1];

      // Validate standard minimum TLE length and structure
      if (line1.length >= 50 && line2.length >= 50) {
        const name = i > 0 && !lines[i - 1].startsWith('1 ') && !lines[i - 1].startsWith('2 ')
          ? lines[i - 1].replace(/^0\s+/, '')
          : `NORAD ${line.substring(2, 7).trim()}`;

        try {
          const satrec = satellite.twoline2satrec(line1, line2);
          if (satrec && !satrec.error && !isNaN(satrec.inclo) && !isNaN(satrec.ecco)) {
            const noradId = parseInt(line1.substring(2, 7).trim(), 10);
            if (!isNaN(noradId)) {
              results.push({
                id: `sat-${noradId}`,
                name,
                noradId,
                line1,
                line2,
                group,
                satrec,
              });
            }
          }
        } catch {
          // Skip bad records
        }
      }
      i++; // Skip line 2
    }
  }

  return results;
}

/**
 * Parses CelesTrak OMM JSON array into RawSatelliteItem objects
 */
export function parseOmmJson(data: any[], group: SatelliteGroup = 'visual'): RawSatelliteItem[] {
  if (!Array.isArray(data)) return [];

  const results: RawSatelliteItem[] = [];

  for (const item of data) {
    if (!item.NORAD_CAT_ID || !item.EPOCH) continue;

    // Convert OMM fields to standard TLE lines
    const { line1, line2 } = ommToTle(item);
    if (!line1 || !line2) continue;

    try {
      const satrec = satellite.twoline2satrec(line1, line2);
      if (satrec && !satrec.error) {
        const noradId = item.NORAD_CAT_ID;
        results.push({
          id: `sat-${noradId}`,
          name: item.OBJECT_NAME || `SAT-${noradId}`,
          noradId,
          line1,
          line2,
          group,
          satrec,
        });
      }
    } catch {
      // Ignore conversion failures
    }
  }

  return results;
}

function checksum(line: string): number {
  let sum = 0;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c >= '0' && c <= '9') sum += parseInt(c, 10);
    else if (c === '-') sum += 1;
  }
  return sum % 10;
}

function formatExp(num: number): string {
  if (!num || num === 0) return ' 00000-0';
  const str = num.toExponential(4);
  const [mantissa, exp] = str.split('e');
  const m = Math.round(parseFloat(mantissa) * 10000).toString().padStart(5, '0');
  const e = parseInt(exp, 10);
  const sign = e < 0 ? '-' : '+';
  return (num < 0 ? '-' : ' ') + m.slice(num < 0 ? 1 : 0, 5) + sign + Math.abs(e);
}

export function ommToTle(omm: any): { line1: string; line2: string } {
  try {
    const norad = String(omm.NORAD_CAT_ID).padStart(5, ' ');
    const classType = omm.CLASSIFICATION_TYPE || 'U';
    const objId = (omm.OBJECT_ID || '').padEnd(8, ' ');

    const epochDate = new Date(omm.EPOCH);
    const year = epochDate.getUTCFullYear() % 100;
    const startOfYear = new Date(Date.UTC(epochDate.getUTCFullYear(), 0, 1));
    const dayOfYear = (epochDate.getTime() - startOfYear.getTime()) / 86400000 + 1;
    const epochStr = String(year).padStart(2, '0') + dayOfYear.toFixed(8).padStart(12, '0');

    const nDot = (omm.MEAN_MOTION_DOT || 0).toFixed(8);
    const nDotStr = (omm.MEAN_MOTION_DOT < 0 ? '-' : ' ') + nDot.replace(/^-?0?\./, '.').padEnd(9, '0').slice(0, 9);

    const nDDotStr = ' 00000-0';
    const bstarStr = formatExp(omm.BSTAR || 0).padEnd(8, ' ');
    const elemSet = String(omm.ELEMENT_SET_NO || 999).padStart(4, ' ');

    let l1 = '1 ' + norad + classType + ' ' + objId + ' ' + epochStr + ' ' + nDotStr + ' ' + nDDotStr + ' ' + bstarStr + ' 0 ' + elemSet;
    l1 = l1.slice(0, 68);
    l1 += checksum(l1);

    const inc = (omm.INCLINATION || 0).toFixed(4).padStart(8, ' ');
    const raan = (omm.RA_OF_ASC_NODE || 0).toFixed(4).padStart(8, ' ');
    const ecc = String(Math.round((omm.ECCENTRICITY || 0) * 1e7)).padStart(7, '0');
    const argp = (omm.ARG_OF_PERICENTER || 0).toFixed(4).padStart(8, ' ');
    const ma = (omm.MEAN_ANOMALY || 0).toFixed(4).padStart(8, ' ');
    const mm = (omm.MEAN_MOTION || 0).toFixed(8).padStart(11, ' ');
    const rev = String(omm.REV_AT_EPOCH || 0).padStart(5, ' ');

    let l2 = '2 ' + norad + ' ' + inc + ' ' + raan + ' ' + ecc + ' ' + argp + ' ' + ma + ' ' + mm + rev;
    l2 = l2.slice(0, 68);
    l2 += checksum(l2);

    return { line1: l1, line2: l2 };
  } catch {
    return { line1: '', line2: '' };
  }
}

/**
 * Propagates a single satellite to calculate Altitude, Azimuth, Distance and Velocity.
 * Returns null if the satellite position cannot be calculated (e.g. decayed) or is invalid.
 */
export function propagateSatellite(
  sat: RawSatelliteItem,
  date: Date,
  observer: ObserverLocation
): SkyObject | null {
  try {
    const positionAndVelocity = satellite.propagate(sat.satrec, date);
    if (!positionAndVelocity || !positionAndVelocity.position || !positionAndVelocity.velocity) {
      return null;
    }

    const posEci = positionAndVelocity.position as satellite.EciVec3<number>;
    const velEci = positionAndVelocity.velocity as satellite.EciVec3<number>;

    if (isNaN(posEci.x) || isNaN(posEci.y) || isNaN(posEci.z)) {
      return null;
    }

    const deg2rad = (deg: number) => (deg * Math.PI) / 180;
    const rad2deg = (rad: number) => (rad * 180) / Math.PI;

    const gmst = satellite.gstime(date);
    const observerGd: satellite.GeodeticLocation = {
      latitude: deg2rad(observer.latitude),
      longitude: deg2rad(observer.longitude),
      height: Math.max(0, observer.elevationMeters) / 1000, // in km
    };

    const posEcf = satellite.eciToEcf(posEci, gmst);
    const lookAngles = satellite.ecfToLookAngles(observerGd, posEcf);
    const geodetic = satellite.eciToGeodetic(posEci, gmst);

    let azimuthDeg = rad2deg(lookAngles.azimuth);
    if (azimuthDeg < 0) azimuthDeg += 360;
    const altitudeDeg = rad2deg(lookAngles.elevation);

    if (isNaN(azimuthDeg) || isNaN(altitudeDeg)) {
      return null;
    }

    const subLat = rad2deg(geodetic.latitude);
    const subLon = rad2deg(geodetic.longitude);
    const altKm = Math.round(geodetic.height);

    // Velocity magnitude in km/s
    const speed = Math.sqrt(velEci.x * velEci.x + velEci.y * velEci.y + velEci.z * velEci.z);

    // Approximate visual magnitude based on range & size
    const rangeKm = Math.round(lookAngles.rangeSat);
    let approxMag = sat.noradId === 25544 ? -1.8 : 3.5;
    if (sat.group === 'stations') approxMag = 0.5;

    return {
      id: sat.id,
      name: sat.name,
      type: 'satellite',
      azimuth: Number(azimuthDeg.toFixed(2)),
      altitude: Number(altitudeDeg.toFixed(2)),
      distanceKm: rangeKm,
      velocityKmS: Number(speed.toFixed(2)),
      magnitude: approxMag,
      category: sat.group,
      noradId: sat.noradId,
      line1: sat.line1,
      line2: sat.line2,
      ecfX: posEcf.x,
      ecfY: posEcf.y,
      ecfZ: posEcf.z,
      subLat: Number(subLat.toFixed(2)),
      subLon: Number(subLon.toFixed(2)),
      altKm,
      description: `${sat.name} (NORAD #${sat.noradId}) orbiting at ${(speed).toFixed(1)} km/s at an orbital altitude of ${altKm} km above Earth.`,
    };
  } catch {
    return null;
  }
}

/**
 * Batched satellite propagation. Only returns satellites above the specified horizon threshold.
 */
export function propagateAllSatellites(
  satellites: RawSatelliteItem[],
  date: Date,
  observer: ObserverLocation,
  minAltitude = 0,
  onlyAboveHorizon = true
): SkyObject[] {
  const visible: SkyObject[] = [];
  for (let i = 0; i < satellites.length; i++) {
    const obj = propagateSatellite(satellites[i], date, observer);
    if (obj) {
      if (!onlyAboveHorizon || obj.altitude >= minAltitude) {
        visible.push(obj);
      }
    }
  }
  return visible;
}

/**
 * Filter satellites by active satellite groups (e.g. Starlink, Space Stations, Active, Visual).
 * Specifically guarantees that when Starlink is deselected, any satellite with 'STARLINK'
 * in its name, category, or description is reliably excluded from all 2D, 3D and Globe maps.
 */
export function isSatelliteVisibleByFilter(
  sat: { name: string; category?: string; noradId?: number; description?: string; group?: SatelliteGroup },
  satelliteGroups: Record<SatelliteGroup, boolean>
): boolean {
  if (!satelliteGroups) return true;

  const isStarlink =
    sat.category === 'starlink' ||
    sat.group === 'starlink' ||
    sat.name.toUpperCase().includes('STARLINK') ||
    (Boolean(sat.description) && sat.description!.toUpperCase().includes('STARLINK'));

  if (isStarlink) {
    return Boolean(satelliteGroups.starlink);
  }

  const isStation =
    sat.category === 'stations' ||
    sat.group === 'stations' ||
    sat.noradId === 25544 ||
    sat.noradId === 48274 ||
    sat.name.toUpperCase().includes('ISS') ||
    sat.name.toUpperCase().includes('ZARYA') ||
    sat.name.toUpperCase().includes('TIANGONG') ||
    sat.name.toUpperCase().includes('CSS');

  if (isStation) {
    return Boolean(satelliteGroups.stations || satelliteGroups.visual);
  }

  if (sat.category === 'active' || sat.group === 'active') {
    return Boolean(satelliteGroups.active);
  }
  if (sat.category === 'visual' || sat.group === 'visual') {
    return Boolean(satelliteGroups.visual);
  }

  return true;
}
