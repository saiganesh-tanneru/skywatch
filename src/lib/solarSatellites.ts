import * as THREE from 'three';
import { SkyObject } from '../types';
import { scaleHelioAU } from '../components/SolarSystem3D';

export interface SolarSystemMission {
  id: string;
  name: string;
  agency: string;
  target: 'Sun' | 'Mercury' | 'Venus' | 'Earth' | 'Moon' | 'Mars' | 'Jupiter' | 'Saturn' | 'Deep Space' | 'Asteroid Belt';
  parentPlanet?: 'Mercury' | 'Venus' | 'Earth' | 'Moon' | 'Mars' | 'Jupiter' | 'Saturn';
  orbitRadius: number; // visual offset units around parent planet (or AU for heliocentric)
  isHeliocentric: boolean;
  semiMajorAxisAU?: number;
  orbitalPeriodDays?: number;
  initialAngle: number;
  inclination: number; // visual tilt radians
  launchYear: number;
  velocityKmS: number;
  distanceKm: number;
  description: string;
}

export const SOLAR_MISSIONS: SolarSystemMission[] = [
  // --- 1. MERCURY ORBITERS ---
  {
    id: 'mission-bepicolombo',
    name: 'BepiColombo (MPO)',
    agency: 'ESA / JAXA',
    target: 'Mercury',
    parentPlanet: 'Mercury',
    orbitRadius: 2.2,
    isHeliocentric: false,
    initialAngle: 0.8,
    inclination: 0.25,
    launchYear: 2018,
    velocityKmS: 38.4,
    distanceKm: 77000000,
    description: 'Joint ESA/JAXA dual-orbiter mission studying Mercury\'s magnetic field, magnetosphere, and internal structure.',
  },
  {
    id: 'mission-messenger',
    name: 'MESSENGER',
    agency: 'NASA',
    target: 'Mercury',
    parentPlanet: 'Mercury',
    orbitRadius: 2.7,
    isHeliocentric: false,
    initialAngle: 2.4,
    inclination: -0.3,
    launchYear: 2004,
    velocityKmS: 36.2,
    distanceKm: 82000000,
    description: 'First probe to orbit Mercury; mapped 100% of the planet and discovered water ice deposits in permanently shadowed polar craters.',
  },

  // --- 2. VENUS ORBITERS ---
  {
    id: 'mission-akatsuki',
    name: 'Akatsuki (Planet-C)',
    agency: 'JAXA',
    target: 'Venus',
    parentPlanet: 'Venus',
    orbitRadius: 2.6,
    isHeliocentric: false,
    initialAngle: 1.4,
    inclination: 0.15,
    launchYear: 2010,
    velocityKmS: 35.0,
    distanceKm: 41000000,
    description: 'Japanese climate orbiter studying Venusian cloud stratification, atmospheric super-rotation, and lightning discharges.',
  },
  {
    id: 'mission-venus-express',
    name: 'Venus Express',
    agency: 'ESA',
    target: 'Venus',
    parentPlanet: 'Venus',
    orbitRadius: 3.2,
    isHeliocentric: false,
    initialAngle: 4.1,
    inclination: 0.45,
    launchYear: 2005,
    velocityKmS: 34.2,
    distanceKm: 43000000,
    description: 'ESA orbiter that performed long-term atmospheric dynamics profiling and discovered colossal spinning polar double-vortices.',
  },

  // --- 3. LUNAR SATELLITES & MOON PROBES ---
  {
    id: 'mission-lro',
    name: 'Lunar Reconnaissance Orbiter (LRO)',
    agency: 'NASA',
    target: 'Moon',
    parentPlanet: 'Moon',
    orbitRadius: 1.5,
    isHeliocentric: false,
    initialAngle: 0.6,
    inclination: 0.85, // Polar lunar orbit
    launchYear: 2009,
    velocityKmS: 1.6,
    distanceKm: 384400,
    description: 'NASA\'s flagship active lunar orbiter mapping lunar surface topography with laser altimetry (LOLA) and high-resolution cameras (LROC) imaging polar water ice and landing sites.',
  },
  {
    id: 'mission-chandrayaan2',
    name: 'Chandrayaan-2 Orbiter',
    agency: 'ISRO',
    target: 'Moon',
    parentPlanet: 'Moon',
    orbitRadius: 1.9,
    isHeliocentric: false,
    initialAngle: 2.2,
    inclination: 0.9, // Polar lunar orbit
    launchYear: 2019,
    velocityKmS: 1.6,
    distanceKm: 384400,
    description: 'ISRO\'s premier lunar orbiter carrying the highest-resolution camera in lunar orbit (OHRC at 25 cm/pixel) and Dual Frequency Synthetic Aperture Radar (DFSAR) mapping lunar water ice.',
  },
  {
    id: 'mission-chandrayaan3-pm',
    name: 'Chandrayaan-3 Propulsion Module',
    agency: 'ISRO',
    target: 'Moon',
    parentPlanet: 'Moon',
    orbitRadius: 2.3,
    isHeliocentric: false,
    initialAngle: 3.9,
    inclination: 0.35,
    launchYear: 2023,
    velocityKmS: 1.55,
    distanceKm: 384400,
    description: 'Delivered the Vikram lander and Pragyan rover to the lunar south pole, and actively conducts exoplanet-analogue spectro-polarimetry of Earth via the SHAPE payload from lunar orbit.',
  },
  {
    id: 'mission-danuri',
    name: 'Danuri (KPLO)',
    agency: 'KARI / NASA',
    target: 'Moon',
    parentPlanet: 'Moon',
    orbitRadius: 2.7,
    isHeliocentric: false,
    initialAngle: 5.1,
    inclination: 0.75,
    launchYear: 2022,
    velocityKmS: 1.6,
    distanceKm: 384400,
    description: 'South Korea\'s first lunar orbiter equipped with NASA\'s ultra-sensitive ShadowCam, imaging inside permanently shadowed polar craters 200 times more sensitively than LRO.',
  },
  {
    id: 'mission-capstone',
    name: 'CAPSTONE',
    agency: 'NASA',
    target: 'Moon',
    parentPlanet: 'Moon',
    orbitRadius: 3.2,
    isHeliocentric: false,
    initialAngle: 1.4,
    inclination: 1.15, // Near-Rectilinear Halo Orbit (NRHO)
    launchYear: 2022,
    velocityKmS: 1.4,
    distanceKm: 384400,
    description: 'Pioneering lunar cubesat that verified and validated the unique Near-Rectilinear Halo Orbit (NRHO) designated for NASA\'s Artemis Gateway lunar space station.',
  },
  {
    id: 'mission-queqiao2',
    name: 'Queqiao-2 (Magpie Bridge 2)',
    agency: 'CNSA',
    target: 'Moon',
    parentPlanet: 'Moon',
    orbitRadius: 3.7,
    isHeliocentric: false,
    initialAngle: 3.2,
    inclination: 0.95, // Highly elliptical frozen lunar orbit
    launchYear: 2024,
    velocityKmS: 1.3,
    distanceKm: 384400,
    description: 'Lunar far-side relay satellite equipped with a 4.2-meter parabolic mesh antenna supporting the historic Chang\'e-6 far-side sample return mission.',
  },
  {
    id: 'mission-apollo11',
    name: 'Apollo 11 CSM (Columbia)',
    agency: 'NASA',
    target: 'Moon',
    parentPlanet: 'Moon',
    orbitRadius: 1.25,
    isHeliocentric: false,
    initialAngle: 0.2,
    inclination: 0.1, // Equatorial circular lunar orbit
    launchYear: 1969,
    velocityKmS: 1.63,
    distanceKm: 384400,
    description: 'The historic mother ship piloted by Michael Collins while Neil Armstrong and Buzz Aldrin conducted humanity\'s first crewed lunar landing in the Sea of Tranquility.',
  },

  // --- 3. MARS FLEET ---
  {
    id: 'mission-mro',
    name: 'Mars Reconnaissance Orbiter (MRO)',
    agency: 'NASA',
    target: 'Mars',
    parentPlanet: 'Mars',
    orbitRadius: 2.4,
    isHeliocentric: false,
    initialAngle: 0.5,
    inclination: 0.4,
    launchYear: 2005,
    velocityKmS: 24.1,
    distanceKm: 78340000,
    description: 'Carries the ultra-high-resolution HiRISE camera imaging the Martian surface at 30 cm/pixel and serves as primary telecommunications relay.',
  },
  {
    id: 'mission-mars-express',
    name: 'Mars Express',
    agency: 'ESA',
    target: 'Mars',
    parentPlanet: 'Mars',
    orbitRadius: 3.0,
    isHeliocentric: false,
    initialAngle: 2.1,
    inclination: -0.2,
    launchYear: 2003,
    velocityKmS: 23.8,
    distanceKm: 79200000,
    description: 'Europe\'s veteran Mars orbiter equipped with MARSIS subsurface radar which discovered massive subterranean water ice reservoirs.',
  },
  {
    id: 'mission-maven',
    name: 'MAVEN',
    agency: 'NASA',
    target: 'Mars',
    parentPlanet: 'Mars',
    orbitRadius: 3.6,
    isHeliocentric: false,
    initialAngle: 3.8,
    inclination: 0.6,
    launchYear: 2013,
    velocityKmS: 22.9,
    distanceKm: 81000000,
    description: 'Mars Atmosphere and Volatile EvolutioN spacecraft measuring how solar wind stripped away the ancient Martian atmosphere.',
  },
  {
    id: 'mission-hope',
    name: 'Hope Probe (Al-Amal)',
    agency: 'UAESA',
    target: 'Mars',
    parentPlanet: 'Mars',
    orbitRadius: 4.2,
    isHeliocentric: false,
    initialAngle: 5.1,
    inclination: 0.35,
    launchYear: 2020,
    velocityKmS: 21.5,
    distanceKm: 82500000,
    description: 'United Arab Emirates orbiter providing the first complete, synchronized picture of Martian atmospheric weather layers.',
  },
  {
    id: 'mission-tgo',
    name: 'ExoMars Trace Gas Orbiter (TGO)',
    agency: 'ESA / Roscosmos',
    target: 'Mars',
    parentPlanet: 'Mars',
    orbitRadius: 2.8,
    isHeliocentric: false,
    initialAngle: 1.1,
    inclination: -0.5,
    launchYear: 2016,
    velocityKmS: 24.3,
    distanceKm: 79800000,
    description: 'Atmospheric research platform searching for biological or geological atmospheric methane signatures and mapping subsurface hydrogen.',
  },
  {
    id: 'mission-mom',
    name: 'Mangalyaan (Mars Orbiter Mission / MOM)',
    agency: 'ISRO',
    target: 'Mars',
    parentPlanet: 'Mars',
    orbitRadius: 3.4,
    isHeliocentric: false,
    initialAngle: 4.4,
    inclination: 0.35,
    launchYear: 2013,
    velocityKmS: 23.2,
    distanceKm: 80500000,
    description: 'ISRO\'s historic interplanetary probe that made India the first Asian nation to reach Martian orbit and the first in the world to succeed on its maiden attempt.',
  },

  // --- 4. JUPITER ORBITERS ---
  {
    id: 'mission-juno',
    name: 'Juno',
    agency: 'NASA',
    target: 'Jupiter',
    parentPlanet: 'Jupiter',
    orbitRadius: 4.6,
    isHeliocentric: false,
    initialAngle: 1.2,
    inclination: 0.85, // Polar orbit
    launchYear: 2011,
    velocityKmS: 42.0,
    distanceKm: 628730000,
    description: 'Solar-powered spacecraft in a polar orbit probing Jupiter\'s deep internal composition, gravitational dynamo, and violent polar cyclones.',
  },
  {
    id: 'mission-juice',
    name: 'JUICE (JUpiter ICy Moons Explorer)',
    agency: 'ESA',
    target: 'Jupiter',
    parentPlanet: 'Jupiter',
    orbitRadius: 5.8,
    isHeliocentric: false,
    initialAngle: 3.4,
    inclination: 0.2,
    launchYear: 2023,
    velocityKmS: 18.5,
    distanceKm: 635000000,
    description: 'European mission conducting detailed investigations of Jupiter\'s giant water-bearing moons: Ganymede, Callisto, and Europa.',
  },
  {
    id: 'mission-europa-clipper',
    name: 'Europa Clipper',
    agency: 'NASA',
    target: 'Jupiter',
    parentPlanet: 'Jupiter',
    orbitRadius: 6.8,
    isHeliocentric: false,
    initialAngle: 4.9,
    inclination: 0.3,
    launchYear: 2024,
    velocityKmS: 21.0,
    distanceKm: 642000000,
    description: 'Flagship NASA astrobiology mission performing dozens of low-altitude flybys to determine if Europa harbors conditions suitable for life.',
  },

  // --- 5. SATURN ORBITERS ---
  {
    id: 'mission-cassini',
    name: 'Cassini-Huygens',
    agency: 'NASA / ESA / ASI',
    target: 'Saturn',
    parentPlanet: 'Saturn',
    orbitRadius: 5.5,
    isHeliocentric: false,
    initialAngle: 2.2,
    inclination: 0.45,
    launchYear: 1997,
    velocityKmS: 15.2,
    distanceKm: 1275000000,
    description: 'Revolutionary flagship orbiter that revealed Enceladus\' active geysers, Titan\'s liquid methane lakes, and the internal dynamics of Saturn\'s rings.',
  },

  // --- 6. HELIOCENTRIC SOLAR CRUISERS & DEEP SPACE MISSIONS ---
  {
    id: 'mission-parker',
    name: 'Parker Solar Probe',
    agency: 'NASA',
    target: 'Sun',
    orbitRadius: 0,
    isHeliocentric: true,
    semiMajorAxisAU: 0.18,
    initialAngle: 0.7,
    inclination: 0.08,
    launchYear: 2018,
    velocityKmS: 176.0,
    distanceKm: 27000000,
    description: 'Humanity\'s closest observer to a star; swoops through the Sun\'s scorching corona at record speeds exceeding 600,000 km/h.',
  },
  {
    id: 'mission-solar-orbiter',
    name: 'Solar Orbiter',
    agency: 'ESA / NASA',
    target: 'Sun',
    orbitRadius: 0,
    isHeliocentric: true,
    semiMajorAxisAU: 0.48,
    initialAngle: 2.5,
    inclination: 0.35,
    launchYear: 2020,
    velocityKmS: 44.5,
    distanceKm: 72000000,
    description: 'Operates in a high-inclination heliocentric orbit capturing the first telescope images of the Sun\'s uncharted polar regions.',
  },
  {
    id: 'mission-aditya-l1',
    name: 'Aditya-L1',
    agency: 'ISRO',
    target: 'Sun',
    orbitRadius: 0,
    isHeliocentric: true,
    semiMajorAxisAU: 0.99, // Sun-Earth L1 halo orbit (~1.5M km from Earth toward Sun)
    initialAngle: 0.05,
    inclination: 0.04,
    launchYear: 2023,
    velocityKmS: 30.2,
    distanceKm: 1500000,
    description: 'India\'s first dedicated solar observatory stationed at Sun-Earth Lagrange Point 1 (L1) studying chromospheric and coronal heating, solar flares, and coronal mass ejections.',
  },
  {
    id: 'mission-jwst',
    name: 'James Webb Space Telescope (JWST)',
    agency: 'NASA / ESA / CSA',
    target: 'Deep Space',
    orbitRadius: 0,
    isHeliocentric: true,
    semiMajorAxisAU: 1.025, // Sun-Earth L2 halo orbit (~1.5M km outward from Earth)
    initialAngle: 0.0, // Aligned near Earth
    inclination: 0.05,
    launchYear: 2021,
    velocityKmS: 29.5,
    distanceKm: 1500000,
    description: 'Premier deep-space infrared observatory stationed at Sun-Earth Lagrange Point 2 peering back to the universe\'s first luminous galaxies.',
  },
  {
    id: 'mission-psyche',
    name: 'Psyche',
    agency: 'NASA',
    target: 'Asteroid Belt',
    orbitRadius: 0,
    isHeliocentric: true,
    semiMajorAxisAU: 2.65,
    initialAngle: 1.8,
    inclination: 0.12,
    launchYear: 2023,
    velocityKmS: 19.8,
    distanceKm: 396000000,
    description: 'En route to explore 16 Psyche, a unique metal-rich M-type asteroid hypothesized to be the exposed iron-nickel core of an early protoplanet.',
  },
  {
    id: 'mission-lucy',
    name: 'Lucy',
    agency: 'NASA',
    target: 'Asteroid Belt',
    orbitRadius: 0,
    isHeliocentric: true,
    semiMajorAxisAU: 3.8,
    initialAngle: 3.7,
    inclination: 0.18,
    launchYear: 2021,
    velocityKmS: 16.4,
    distanceKm: 570000000,
    description: 'NASA mission touring a record 10 Jupiter Trojan asteroids—ancient fossil remnants from the formation of our outer planets.',
  },
  {
    id: 'mission-new-horizons',
    name: 'New Horizons',
    agency: 'NASA',
    target: 'Deep Space',
    orbitRadius: 0,
    isHeliocentric: true,
    semiMajorAxisAU: 36.5,
    initialAngle: 4.8,
    inclination: 0.22,
    launchYear: 2006,
    velocityKmS: 13.8,
    distanceKm: 5460000000,
    description: 'First reconnaissance mission to fly past dwarf planet Pluto, revealing nitrogen glaciers, followed by contact binary Arrokoth in the Kuiper Belt.',
  },
  {
    id: 'mission-voyager1',
    name: 'Voyager 1',
    agency: 'NASA',
    target: 'Deep Space',
    orbitRadius: 0,
    isHeliocentric: true,
    semiMajorAxisAU: 52.0, // Scaled for visible boundary in Orrery
    initialAngle: 5.6,
    inclination: 0.35,
    launchYear: 1977,
    velocityKmS: 17.0,
    distanceKm: 24000000000,
    description: 'The most distant human-made artifact in history; actively transmitting scientific measurements from interstellar space beyond the heliosphere.',
  },
];

/**
 * Computes 3D position of an interplanetary mission
 */
export function getMissionSolarPos(
  m: SolarSystemMission,
  planetPositions: Map<string, THREE.Vector3>
): THREE.Vector3 {
  if (m.isHeliocentric && m.semiMajorAxisAU) {
    const au = m.semiMajorAxisAU;
    const angle = m.initialAngle;
    const x = au * Math.cos(angle);
    const y = au * Math.sin(angle);
    const z = y * Math.sin(m.inclination);
    return scaleHelioAU(x, y * Math.cos(m.inclination), z);
  }

  // Planetary Orbiter
  if (m.parentPlanet && planetPositions.has(m.parentPlanet)) {
    const pPos = planetPositions.get(m.parentPlanet)!;
    const r = m.orbitRadius;
    const angle = m.initialAngle;
    const lx = r * Math.cos(angle);
    const ly = r * Math.sin(m.inclination) * Math.sin(angle);
    const lz = r * Math.cos(m.inclination) * Math.sin(angle);

    return new THREE.Vector3(pPos.x + lx, pPos.y + ly, pPos.z + lz);
  }

  return new THREE.Vector3(0, 0, 0);
}

/**
 * Converts a SolarSystemMission into a full SkyObject for selection & DetailDrawer
 */
export function missionToSkyObject(m: SolarSystemMission): SkyObject {
  return {
    id: m.id,
    name: m.name,
    type: 'satellite',
    azimuth: Number(((m.initialAngle * 180) / Math.PI).toFixed(1)),
    altitude: 15,
    distanceKm: m.distanceKm,
    velocityKmS: m.velocityKmS,
    color: '#38bdf8',
    description: `[${m.agency} • Target: ${m.target} • Launched ${m.launchYear}] ${m.description}`,
  };
}
