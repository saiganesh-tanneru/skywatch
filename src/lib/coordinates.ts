/**
 * Pure mathematical functions for astronomical coordinate systems.
 * Alt-Azimuth to 3D Cartesian coordinates and 2D Polar Chart coordinates.
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Converts spherical Alt-Azimuth coordinates to 3D Cartesian coordinates for Three.js.
 * Convention:
 * - Y is UP (Zenith at alt=90 -> [0, radius, 0])
 * - North (az=0) is along -Z
 * - East (az=90) is along +X
 * - South (az=180) is along +Z
 * - West (az=270) is along -X
 *
 * @param altitude Altitude in degrees (-90 to +90)
 * @param azimuth Azimuth in degrees (0 to 360, 0 = North, 90 = East)
 * @param radius Sphere radius (default 100)
 */
export function altAzToCartesian(
  altitude: number,
  azimuth: number,
  radius = 100
): Vector3D {
  const altRad = (altitude * Math.PI) / 180;
  const azRad = (azimuth * Math.PI) / 180;

  const cosAlt = Math.cos(altRad);
  const sinAlt = Math.sin(altRad);
  const sinAz = Math.sin(azRad);
  const cosAz = Math.cos(azRad);

  return {
    x: radius * cosAlt * sinAz,
    y: radius * sinAlt,
    z: -radius * cosAlt * cosAz,
  };
}

/**
 * Converts Alt-Azimuth coordinates to 2D Polar Chart (Planisphere) projection.
 * Convention (standard sky chart looking up):
 * - Center is Zenith (alt=90, r=0)
 * - Outer edge is Horizon (alt=0, r=chartRadius)
 * - North (az=0) is at TOP (y = centerY - r)
 * - East (az=90) is at LEFT (x = centerX - r)
 * - South (az=180) is at BOTTOM (y = centerY + r)
 * - West (az=270) is at RIGHT (x = centerX + r)
 *
 * @param altitude Altitude in degrees
 * @param azimuth Azimuth in degrees
 * @param centerX Center X of SVG/Canvas
 * @param centerY Center Y of SVG/Canvas
 * @param chartRadius Radius of horizon circle
 */
export function altAzToPolar2D(
  altitude: number,
  azimuth: number,
  centerX: number,
  centerY: number,
  chartRadius: number
): Point2D {
  // Clamp altitude to horizon (0 to 90) for dome representation
  const clampedAlt = Math.max(0, Math.min(90, altitude));
  const zenithDistanceDeg = 90 - clampedAlt;
  const r = (zenithDistanceDeg / 90) * chartRadius;

  const azRad = (azimuth * Math.PI) / 180;

  // In astronomical charts viewed looking up, East is left and West is right
  const x = centerX - r * Math.sin(azRad);
  const y = centerY - r * Math.cos(azRad);

  return { x, y };
}

/**
 * Normalizes azimuth angle to [0, 360) range
 */
export function normalizeAzimuth(degrees: number): number {
  let normalized = degrees % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

/**
 * Formats degrees into clean DMS or decimal representation
 */
export function formatDegrees(deg: number, precision = 1): string {
  return `${deg.toFixed(precision)}°`;
}

/**
 * Returns cardinal compass direction name for an azimuth angle (e.g. N, NNE, NE...)
 */
export function azimuthToCompass(azimuth: number): string {
  const normalized = normalizeAzimuth(azimuth);
  const sectors = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(normalized / 22.5) % 16;
  return sectors[index];
}
