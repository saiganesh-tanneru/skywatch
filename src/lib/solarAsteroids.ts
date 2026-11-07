import * as THREE from 'three';
import { SkyObject } from '../types';
import { scaleHelioAU } from '../components/SolarSystem3D';

export interface SolarSystemAsteroid {
  id: string;
  name: string;
  diameter: string;
  diameterKm: number;
  spectralType: string;
  orbitClass: 'Dwarf Planet' | 'Main Belt' | 'Near-Earth (Apollo)' | 'Near-Earth (Aten)' | 'Near-Earth (Amor)' | 'Jupiter Trojan';
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  orbitalPeriodYears: number;
  perihelionAU: number;
  aphelionAU: number;
  discovery: string;
  missions: string[];
  imageUrl: string;
  color: string;
  initialMeanAnomalyDeg: number;
  visualSize: number; // Three.js billboard size in world units
  description: string;
}

export const SOLAR_ASTEROIDS: SolarSystemAsteroid[] = [
  // --- 1. DWARF PLANET & MAJOR MAIN BELT ASTEROIDS ---
  {
    id: 'asteroid-ceres',
    name: '1 Ceres',
    diameter: '939.4 km',
    diameterKm: 939.4,
    spectralType: 'G-type (Carbonaceous / Ice-rich)',
    orbitClass: 'Dwarf Planet',
    semiMajorAxisAU: 2.767,
    eccentricity: 0.076,
    inclinationDeg: 10.6,
    orbitalPeriodYears: 4.6,
    perihelionAU: 2.557,
    aphelionAU: 2.977,
    discovery: 'Giuseppe Piazzi (1801)',
    missions: ['NASA Dawn (Orbited 2015–2018)'],
    imageUrl: '/images/asteroids/ceres.svg',
    color: '#38bdf8',
    initialMeanAnomalyDeg: 45,
    visualSize: 3.2,
    description:
      'Largest object in the asteroid belt and only dwarf planet in the inner Solar System. Contains an ice-rock mantle, subsurface brine reservoirs, and dazzling bright sodium-carbonate salt faculae in Occator Crater.',
  },
  {
    id: 'asteroid-vesta',
    name: '4 Vesta',
    diameter: '525.4 km',
    diameterKm: 525.4,
    spectralType: 'V-type (Basaltic / Differentiated)',
    orbitClass: 'Main Belt',
    semiMajorAxisAU: 2.362,
    eccentricity: 0.089,
    inclinationDeg: 7.14,
    orbitalPeriodYears: 3.63,
    perihelionAU: 2.152,
    aphelionAU: 2.572,
    discovery: 'Heinrich Olbers (1807)',
    missions: ['NASA Dawn (Orbited 2011–2012)'],
    imageUrl: '/images/asteroids/vesta.svg',
    color: '#fbbf24',
    initialMeanAnomalyDeg: 120,
    visualSize: 2.7,
    description:
      'Second most massive asteroid, retaining a differentiated iron core and basaltic volcanic crust like terrestrial planets. Features the monumental Rheasilvia south polar crater with a 22 km central peak.',
  },
  {
    id: 'asteroid-pallas',
    name: '2 Pallas',
    diameter: '512 km',
    diameterKm: 512,
    spectralType: 'B-type (Primitive Carbonaceous)',
    orbitClass: 'Main Belt',
    semiMajorAxisAU: 2.773,
    eccentricity: 0.231,
    inclinationDeg: 34.8,
    orbitalPeriodYears: 4.62,
    perihelionAU: 2.132,
    aphelionAU: 3.414,
    discovery: 'Heinrich Olbers (1802)',
    missions: ['Hubble / VLT SPHERE Imaging'],
    imageUrl: '/images/asteroids/generic_asteroid.svg',
    color: '#a3e635',
    initialMeanAnomalyDeg: 200,
    visualSize: 2.5,
    description:
      'Third largest asteroid with an unusually high orbital inclination of 34.8°, keeping it inclined far above and below the planetary ecliptic plane. Highly cratered surface resembles a golf ball.',
  },
  {
    id: 'asteroid-hygiea',
    name: '10 Hygiea',
    diameter: '434 km',
    diameterKm: 434,
    spectralType: 'C-type (Carbonaceous Chondrite)',
    orbitClass: 'Main Belt',
    semiMajorAxisAU: 3.142,
    eccentricity: 0.117,
    inclinationDeg: 3.84,
    orbitalPeriodYears: 5.57,
    perihelionAU: 2.775,
    aphelionAU: 3.509,
    discovery: 'Annibale de Gasparis (1849)',
    missions: ['ESO VLT SPHERE Adaptive Optics'],
    imageUrl: '/images/asteroids/generic_asteroid.svg',
    color: '#94a3b8',
    initialMeanAnomalyDeg: 310,
    visualSize: 2.3,
    description:
      'Fourth largest asteroid and candidate dwarf planet in the outer asteroid belt. Very dark, primitive carbonaceous surface that appears surprisingly spherical in high-resolution VLT images.',
  },
  {
    id: 'asteroid-psyche',
    name: '16 Psyche',
    diameter: '226 km',
    diameterKm: 226,
    spectralType: 'M-type (Metallic Nickel-Iron)',
    orbitClass: 'Main Belt',
    semiMajorAxisAU: 2.924,
    eccentricity: 0.140,
    inclinationDeg: 3.10,
    orbitalPeriodYears: 5.0,
    perihelionAU: 2.515,
    aphelionAU: 3.333,
    discovery: 'Annibale de Gasparis (1852)',
    missions: ['NASA Psyche Mission (Orbital Insertion 2029)'],
    imageUrl: '/images/asteroids/psyche.svg',
    color: '#c084fc',
    initialMeanAnomalyDeg: 80,
    visualSize: 2.2,
    description:
      'Giant metal-rich M-type asteroid hypothesized to be the exposed metallic iron-nickel core of a shattered early protoplanet. Target of NASA\'s flagship Psyche spacecraft.',
  },
  {
    id: 'asteroid-ida',
    name: '243 Ida & Dactyl',
    diameter: '31.4 km (Dactyl 1.4 km)',
    diameterKm: 31.4,
    spectralType: 'S-type (Silicaceous Stony)',
    orbitClass: 'Main Belt',
    semiMajorAxisAU: 2.861,
    eccentricity: 0.046,
    inclinationDeg: 1.14,
    orbitalPeriodYears: 4.84,
    perihelionAU: 2.729,
    aphelionAU: 2.993,
    discovery: 'Johann Palisa (1884)',
    missions: ['Galileo Flyby (August 1993)'],
    imageUrl: '/images/asteroids/generic_asteroid.svg',
    color: '#f97316',
    initialMeanAnomalyDeg: 270,
    visualSize: 1.9,
    description:
      'Elongated Koronis family asteroid made famous when NASA\'s Galileo orbiter discovered tiny 1.4-km moonlet Dactyl in 1993, confirming that asteroids can harbor natural satellites.',
  },

  // --- 2. FAMOUS NEAR-EARTH & MARS-CROSSING ASTEROIDS ---
  {
    id: 'asteroid-eros',
    name: '433 Eros',
    diameter: '16.8 km (34 × 11 × 11 km)',
    diameterKm: 16.8,
    spectralType: 'S-type (Silicaceous Stony)',
    orbitClass: 'Near-Earth (Amor)',
    semiMajorAxisAU: 1.458,
    eccentricity: 0.223,
    inclinationDeg: 10.83,
    orbitalPeriodYears: 1.76,
    perihelionAU: 1.133,
    aphelionAU: 1.783,
    discovery: 'Carl Gustav Witt & Auguste Charlois (1898)',
    missions: ['NASA NEAR Shoemaker (Orbited & Landed 2000–2001)'],
    imageUrl: '/images/asteroids/eros.svg',
    color: '#fb923c',
    initialMeanAnomalyDeg: 160,
    visualSize: 2.0,
    description:
      'Elongated peanut-shaped Mars-crosser and first asteroid orbited and landed upon by a robotic probe (NASA NEAR Shoemaker). Rich in olivine, pyroxene, and mysterious ponded electrostatic dust.',
  },
  {
    id: 'asteroid-bennu',
    name: '101955 Bennu',
    diameter: '490 m',
    diameterKm: 0.49,
    spectralType: 'B-type (Carbonaceous Rubble Pile)',
    orbitClass: 'Near-Earth (Apollo)',
    semiMajorAxisAU: 1.126,
    eccentricity: 0.204,
    inclinationDeg: 6.04,
    orbitalPeriodYears: 1.20,
    perihelionAU: 0.897,
    aphelionAU: 1.356,
    discovery: 'LINEAR Survey (1999)',
    missions: ['NASA OSIRIS-REx (Sample Return 2016–2023)'],
    imageUrl: '/images/asteroids/bennu.svg',
    color: '#38bdf8',
    initialMeanAnomalyDeg: 25,
    visualSize: 1.8,
    description:
      'Top-shaped rubble pile asteroid rich in pristine hydrated clays and organic molecules. NASA\'s OSIRIS-REx collected 121.6 grams of pristine regolith and returned it to Earth in Sept 2023.',
  },
  {
    id: 'asteroid-ryugu',
    name: '162173 Ryugu',
    diameter: '900 m',
    diameterKm: 0.9,
    spectralType: 'C-type (Carbonaceous Rubble Pile)',
    orbitClass: 'Near-Earth (Apollo)',
    semiMajorAxisAU: 1.190,
    eccentricity: 0.190,
    inclinationDeg: 5.88,
    orbitalPeriodYears: 1.30,
    perihelionAU: 0.963,
    aphelionAU: 1.416,
    discovery: 'LINEAR Survey (1999)',
    missions: ['JAXA Hayabusa2 (Sample Return 2014–2020)'],
    imageUrl: '/images/asteroids/ryugu.svg',
    color: '#67e8f9',
    initialMeanAnomalyDeg: 190,
    visualSize: 1.8,
    description:
      'Spinning-top asteroid composed of loose boulders and organic carbon compounds. JAXA\'s Hayabusa2 deployed MINERVA-II rovers, blasted an artificial impact crater, and returned samples in 2020.',
  },
  {
    id: 'asteroid-apophis',
    name: '99942 Apophis',
    diameter: '370 m',
    diameterKm: 0.37,
    spectralType: 'Sq-type (Stony Silicate)',
    orbitClass: 'Near-Earth (Aten)',
    semiMajorAxisAU: 0.922,
    eccentricity: 0.191,
    inclinationDeg: 3.33,
    orbitalPeriodYears: 0.89,
    perihelionAU: 0.746,
    aphelionAU: 1.099,
    discovery: 'R. A. Tucker, D. J. Tholen, F. Bernardi (2004)',
    missions: ['NASA OSIRIS-APEX (Rendezvous 2029)', 'ESA RAMSES (Planned)'],
    imageUrl: '/images/asteroids/apophis.svg',
    color: '#f87171',
    initialMeanAnomalyDeg: 300,
    visualSize: 1.7,
    description:
      'Famous Potentially Hazardous Asteroid set for a historic ultra-close flyby on April 13, 2029, passing just 31,600 km above Earth\'s surface—closer than geostationary communication satellites.',
  },
  {
    id: 'asteroid-phaethon',
    name: '3200 Phaethon',
    diameter: '5.8 km',
    diameterKm: 5.8,
    spectralType: 'B-type (Rock Comet)',
    orbitClass: 'Near-Earth (Apollo)',
    semiMajorAxisAU: 1.271,
    eccentricity: 0.890,
    inclinationDeg: 22.2,
    orbitalPeriodYears: 1.43,
    perihelionAU: 0.140, // Closer to Sun than Mercury!
    aphelionAU: 2.403,
    discovery: 'IRAS Satellite (1983)',
    missions: ['JAXA DESTINY+ (Target 2028+)'],
    imageUrl: '/images/asteroids/generic_asteroid.svg',
    color: '#f43f5e',
    initialMeanAnomalyDeg: 340,
    visualSize: 1.9,
    description:
      'Active "rock comet" with an extreme orbit plunging to just 0.14 AU from the Sun (baking to 750°C). Parent body of the dazzling December Geminid meteor shower.',
  },
];

/**
 * Calculates accurate 3D Heliocentric Cartesian position for an asteroid
 * based on Keplerian orbital elements at a given simulation epoch.
 */
export function calculateAsteroidPosition(
  asteroid: SolarSystemAsteroid,
  epochMs: number = Date.now()
): THREE.Vector3 {
  const { semiMajorAxisAU: a, eccentricity: e, inclinationDeg, orbitalPeriodYears, initialMeanAnomalyDeg } = asteroid;

  // Mean anomaly progression: 360 deg per orbital period
  const msInYear = 365.25 * 86400 * 1000;
  const elapsedYears = (epochMs - 1704067200000) / msInYear; // relative to Jan 1, 2024
  const meanAnomalyRad = THREE.MathUtils.degToRad(
    (initialMeanAnomalyDeg + (elapsedYears / orbitalPeriodYears) * 360) % 360
  );

  // Solve Kepler's equation E - e*sin(E) = M with Newton-Raphson
  let E = meanAnomalyRad;
  for (let iter = 0; iter < 5; iter++) {
    const f = E - e * Math.sin(E) - meanAnomalyRad;
    const fPrime = 1 - e * Math.cos(E);
    E = E - f / fPrime;
  }

  // Orbital plane coordinates (x_orb, y_orb)
  const xOrb = a * (Math.cos(E) - e);
  const yOrb = a * Math.sqrt(Math.max(0, 1 - e * e)) * Math.sin(E);

  // Apply orbital inclination tilt
  const incRad = THREE.MathUtils.degToRad(inclinationDeg);
  const helioX = xOrb;
  const helioY = yOrb * Math.cos(incRad);
  const helioZ = yOrb * Math.sin(incRad);

  return scaleHelioAU(helioX, helioY, helioZ);
}

/**
 * Converts a SolarSystemAsteroid into a full interactive SkyObject
 */
export function asteroidToSkyObject(
  asteroid: SolarSystemAsteroid,
  pos: THREE.Vector3,
  earthPos: THREE.Vector3
): SkyObject {
  const distFromEarthUnits = pos.distanceTo(earthPos);
  // Estimate distance in km: 1 unit ~ scaled AU
  const distKm = Math.round(distFromEarthUnits * 149597870.7);

  return {
    id: asteroid.id,
    name: asteroid.name,
    type: 'asteroid',
    azimuth: 0,
    altitude: 10,
    helioX: pos.x,
    helioY: pos.y,
    helioZ: pos.z,
    distanceKm: distKm,
    color: asteroid.color,
    spectralType: asteroid.spectralType,
    diameterKm: asteroid.diameterKm,
    orbitClass: asteroid.orbitClass,
    missions: asteroid.missions,
    imageUrl: asteroid.imageUrl,
    description: `${asteroid.description} [${asteroid.orbitClass} • Diameter: ${asteroid.diameter} • Spectral: ${asteroid.spectralType}]`,
  };
}
