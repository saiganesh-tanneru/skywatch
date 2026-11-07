import { MeteorShower } from '../types';

export const METEOR_SHOWERS: MeteorShower[] = [
  {
    id: 'quadrantids',
    name: 'Quadrantids',
    peakDate: 'Jan 3-4',
    zhr: 120,
    radiantConstellation: 'Boötes',
    velocityKmS: 41,
    parentBody: 'Asteroid 2003 EH1',
    peakMonth: 1,
    peakDay: 3,
  },
  {
    id: 'lyrids',
    name: 'Lyrids',
    peakDate: 'Apr 21-22',
    zhr: 18,
    radiantConstellation: 'Lyra',
    velocityKmS: 49,
    parentBody: 'Comet C/1861 G1 (Thatcher)',
    peakMonth: 4,
    peakDay: 22,
  },
  {
    id: 'eta-aquariids',
    name: 'Eta Aquariids',
    peakDate: 'May 5-6',
    zhr: 50,
    radiantConstellation: 'Aquarius',
    velocityKmS: 66,
    parentBody: '1P/Halley',
    peakMonth: 5,
    peakDay: 5,
  },
  {
    id: 'arietids',
    name: 'Daytime Arietids',
    peakDate: 'Jun 7-8',
    zhr: 30,
    radiantConstellation: 'Aries',
    velocityKmS: 38,
    parentBody: 'Comet 96P/Machholz',
    peakMonth: 6,
    peakDay: 7,
  },
  {
    id: 'perseids',
    name: 'Perseids',
    peakDate: 'Aug 12-13',
    zhr: 100,
    radiantConstellation: 'Perseus',
    velocityKmS: 59,
    parentBody: '109P/Swift-Tuttle',
    peakMonth: 8,
    peakDay: 12,
  },
  {
    id: 'orionids',
    name: 'Orionids',
    peakDate: 'Oct 21-22',
    zhr: 20,
    radiantConstellation: 'Orion',
    velocityKmS: 66,
    parentBody: '1P/Halley',
    peakMonth: 10,
    peakDay: 21,
  },
  {
    id: 'leonids',
    name: 'Leonids',
    peakDate: 'Nov 17-18',
    zhr: 15,
    radiantConstellation: 'Leo',
    velocityKmS: 71,
    parentBody: '55P/Tempel-Tuttle',
    peakMonth: 11,
    peakDay: 17,
  },
  {
    id: 'geminids',
    name: 'Geminids',
    peakDate: 'Dec 13-14',
    zhr: 150,
    radiantConstellation: 'Gemini',
    velocityKmS: 35,
    parentBody: '3200 Phaethon',
    peakMonth: 12,
    peakDay: 13,
  },
  {
    id: 'ursids',
    name: 'Ursids',
    peakDate: 'Dec 21-22',
    zhr: 10,
    radiantConstellation: 'Ursa Minor',
    velocityKmS: 33,
    parentBody: '8P/Tuttle',
    peakMonth: 12,
    peakDay: 21,
  },
];

/**
 * Returns the upcoming meteor shower closest to the provided date,
 * along with the number of days remaining until peak.
 */
export function getNextMeteorShower(currentDate: Date = new Date()): {
  shower: MeteorShower;
  daysRemaining: number;
  isPeakingToday: boolean;
} {
  const curYear = currentDate.getFullYear();
  let candidate: MeteorShower = METEOR_SHOWERS[0];
  let minDaysDiff = Infinity;
  let isPeaking = false;

  for (const shower of METEOR_SHOWERS) {
    // Peak date in current calendar year
    let peak = new Date(curYear, shower.peakMonth - 1, shower.peakDay);
    // If peak already passed this year, check next year
    if (peak.getTime() < currentDate.getTime() - 24 * 3600 * 1000) {
      peak = new Date(curYear + 1, shower.peakMonth - 1, shower.peakDay);
    }

    const diffDays = Math.ceil((peak.getTime() - currentDate.getTime()) / (24 * 3600 * 1000));
    if (diffDays >= 0 && diffDays < minDaysDiff) {
      minDaysDiff = diffDays;
      candidate = shower;
      isPeaking = diffDays === 0;
    }
  }

  return {
    shower: candidate,
    daysRemaining: minDaysDiff,
    isPeakingToday: isPeaking,
  };
}
