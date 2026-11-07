import { RawSatelliteItem, propagateSatellite } from './satelliteMath';
import { ObserverLocation, SatellitePass } from '../types';

/**
 * Predicts upcoming satellite passes over an observer's location within a time window.
 * Computed entirely client-side with SGP4 propagation.
 *
 * @param satellite The raw satellite item with initialized satrec
 * @param observer Observer's vantage point
 * @param startTime Starting date/time for prediction (default now)
 * @param windowHours Prediction window in hours (default 24h)
 * @param stepSeconds Sampling step in seconds (default 20s for fast, accurate detection)
 * @param minPeakElevation Minimum peak altitude in degrees to be counted as a notable pass (default 10°)
 */
export function predictPasses(
  satellite: RawSatelliteItem,
  observer: ObserverLocation,
  startTime: Date = new Date(),
  windowHours = 24,
  stepSeconds = 20,
  minPeakElevation = 10
): SatellitePass[] {
  const passes: SatellitePass[] = [];
  const startMs = startTime.getTime();
  const endMs = startMs + windowHours * 3600 * 1000;
  const stepMs = stepSeconds * 1000;

  let inPass = false;
  let riseTime: Date | null = null;
  let startAzimuth = 0;
  let maxAltitude = -90;
  let peakAzimuth = 0;
  let peakTime: Date | null = null;

  for (let t = startMs; t <= endMs; t += stepMs) {
    const curDate = new Date(t);
    const pos = propagateSatellite(satellite, curDate, observer);

    if (pos && pos.altitude > 0) {
      // Satellite is above the horizon
      if (!inPass) {
        // Pass starts (Rise)
        inPass = true;
        riseTime = curDate;
        startAzimuth = pos.azimuth;
        maxAltitude = pos.altitude;
        peakAzimuth = pos.azimuth;
        peakTime = curDate;
      } else {
        // In pass: track peak elevation
        if (pos.altitude > maxAltitude) {
          maxAltitude = pos.altitude;
          peakAzimuth = pos.azimuth;
          peakTime = curDate;
        }
      }
    } else {
      // Satellite is below the horizon
      if (inPass && riseTime && peakTime) {
        // Pass finishes (Set)
        const setTime = curDate;
        const endAzimuth = pos ? pos.azimuth : peakAzimuth;
        const durationSeconds = Math.round((setTime.getTime() - riseTime.getTime()) / 1000);

        if (maxAltitude >= minPeakElevation) {
          passes.push({
            satelliteId: satellite.id,
            satelliteName: satellite.name,
            noradId: satellite.noradId,
            riseTime,
            peakTime,
            setTime,
            maxAltitude: Number(maxAltitude.toFixed(1)),
            startAzimuth: Number(startAzimuth.toFixed(1)),
            peakAzimuth: Number(peakAzimuth.toFixed(1)),
            endAzimuth: Number(endAzimuth.toFixed(1)),
            durationSeconds,
            visible: maxAltitude >= 20, // easily visible to the naked eye
          });
        }

        // Reset for next pass
        inPass = false;
        riseTime = null;
        maxAltitude = -90;
        peakTime = null;
      }
    }
  }

  return passes;
}

/**
 * Predicts passes across an array of priority satellites (e.g. Space Stations, Brightest Sats).
 */
export function predictMultipleSatellitePasses(
  satellites: RawSatelliteItem[],
  observer: ObserverLocation,
  startTime: Date = new Date(),
  windowHours = 24
): SatellitePass[] {
  const allPasses: SatellitePass[] = [];

  for (const sat of satellites) {
    const satPasses = predictPasses(sat, observer, startTime, windowHours, 25, 12);
    allPasses.push(...satPasses);
  }

  // Sort chronologically by rise time
  return allPasses.sort((a, b) => a.riseTime.getTime() - b.riseTime.getTime());
}
