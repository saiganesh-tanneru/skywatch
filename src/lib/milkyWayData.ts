import * as THREE from 'three';
import { SkyObject } from '../types';

export type MilkyWayCategory =
  | 'core'
  | 'arm'
  | 'star'
  | 'nebula'
  | 'cluster'
  | 'black_hole'
  | 'exoplanet'
  | 'fermi_bubble';

export interface MilkyWayObject {
  id: string;
  name: string;
  category: MilkyWayCategory;
  subType: string;
  distanceLyFromEarth: number;
  distanceLyFromCore: number;
  distanceDesc: string;
  constellation?: string;
  spectralType?: string;
  massSolar?: string;
  diameterDesc?: string;
  color: string;
  size: number; // 3D visual scale
  galPos: THREE.Vector3; // Galactic coordinates (1 kly = 2 units, Sun at (0, 0.1, 53.34))
  description: string;
  astrophysicsFacts: string[];
}

/**
 * Standard Milky Way Cartography Parameters:
 * Scale: 1,000 light-years (1 kly) = 2.0 Three.js scene units
 * Distance from Sagittarius A* (0, 0, 0) to Sun = 26,670 ly (26.67 kly) -> 53.34 units along +Z
 */
export const SUN_GAL_POS = new THREE.Vector3(0, 0.1, 53.34);

/**
 * Spiral Arm Definition in Galactocentric Coordinates:
 * R(theta) = r0 * exp(theta * tan(pitch))
 * where theta = 0 at the Sun's azimuth (Z = +r0, X = 0).
 */
export interface SpiralArmDef {
  id: string;
  name: string;
  subType: string;
  r0: number; // radius in scene units at theta = 0
  pitchDeg: number; // pitch angle in degrees
  thetaMin: number; // radians
  thetaMax: number;
  color: string;
  description: string;
}

export const SPIRAL_ARMS_CONFIG: SpiralArmDef[] = [
  {
    id: 'mw-arm-orion',
    name: 'Orion-Cygnus Arm (Local Spur)',
    subType: 'Local Arm Bridge • Hosts Sun & Earth',
    r0: 53.34, // Passes directly through the Sun at theta = 0!
    pitchDeg: 12.0,
    thetaMin: -0.55,
    thetaMax: 0.75,
    color: '#38bdf8',
    description: 'The local spiral arm bridge where our Solar System, Betelgeuse, Rigel, and the Orion Nebula reside.',
  },
  {
    id: 'mw-arm-sagittarius',
    name: 'Sagittarius-Carina Arm',
    subType: 'Inner Major Arm • H II Emission Nurseries',
    r0: 42.0, // 21 kly from core
    pitchDeg: 12.5,
    thetaMin: -1.2,
    thetaMax: 1.8,
    color: '#10b981',
    description: 'An inner spiral arm dense with massive star-forming clouds, including the Carina Nebula and Eagle Nebula (Pillars of Creation).',
  },
  {
    id: 'mw-arm-scutum-centaurus',
    name: 'Scutum-Centaurus Arm',
    subType: 'Inner Major Arm • Red Supergiant Clusters',
    r0: 28.0, // 14 kly from core
    pitchDeg: 12.5,
    thetaMin: -1.1,
    thetaMax: 2.2,
    color: '#6366f1',
    description: 'A major arm anchored to the end of the central bar, hosting massive red supergiant clusters like Stephenson 2-18 and UY Scuti.',
  },
  {
    id: 'mw-arm-perseus',
    name: 'Perseus Arm',
    subType: 'Outer Major Spiral Arm',
    r0: 66.0, // 33 kly from core
    pitchDeg: 12.5,
    thetaMin: -1.4,
    thetaMax: 1.5,
    color: '#06b6d4',
    description: 'One of the primary major arms of the Milky Way, wrapping outside the Solar System and hosting the Crab Nebula and Double Cluster.',
  },
  {
    id: 'mw-arm-norma-outer',
    name: 'Norma & Outer Arm',
    subType: 'Distant Outer Spiral Arm & Flared Perimeter',
    r0: 84.0, // 42 kly from core
    pitchDeg: 12.5,
    thetaMin: -1.5,
    thetaMax: 1.4,
    color: '#a855f7',
    description: 'The outermost spiral arm tracing the warped gaseous rim of the Milky Way disk.',
  },
];

/**
 * Computes a point on a spiral arm given theta
 */
export function getArmPoint(arm: SpiralArmDef, theta: number): THREE.Vector3 {
  const tanPsi = Math.tan((arm.pitchDeg * Math.PI) / 180);
  const r = arm.r0 * Math.exp(theta * tanPsi);
  const x = r * Math.sin(theta);
  const z = r * Math.cos(theta);
  // Galactic warp
  const y = Math.sin(theta) * Math.pow(r / 100, 2) * 3.5;
  return new THREE.Vector3(x, y, z);
}

/**
 * Standard IAU Galactic Coordinate Conversion:
 * Maps an astronomical object given by:
 * - Galactic Longitude (lDeg, 0° to 360°, where 0° = Galactic Center, 90° = Cygnus direction of rotation)
 * - Galactic Latitude (bDeg, -90° to +90°, where +90° = North Galactic Pole)
 * - Distance from Earth (distLy in light-years)
 * into Galactocentric 3D Cartesian coordinates (X, Y, Z).
 */
export function galacticToScene(
  lDeg: number,
  bDeg: number,
  distLy: number
): THREE.Vector3 {
  const lRad = (lDeg * Math.PI) / 180;
  const bRad = (bDeg * Math.PI) / 180;
  const scale = 2.0 / 1000; // 2 units per 1,000 ly

  // Relative to Sun in galactic cartesian frame:
  // l = 0 is toward Galactic Center (-Z direction)
  // l = 90 is in direction of galactic rotation (+X direction)
  // b > 0 is toward North Galactic Pole (+Y direction)
  const dScaled = distLy * scale;
  const dx = dScaled * Math.cos(bRad) * Math.sin(lRad);
  const dy = dScaled * Math.sin(bRad);
  const dz = -dScaled * Math.cos(bRad) * Math.cos(lRad);

  return new THREE.Vector3(
    SUN_GAL_POS.x + dx,
    SUN_GAL_POS.y + dy,
    SUN_GAL_POS.z + dz
  );
}

/**
 * Legacy backwards compatibility helper
 */
export function offsetFromSunLy(
  distLy: number,
  angleDeg: number,
  heightLy: number = 0
): THREE.Vector3 {
  const bDeg = (heightLy / Math.max(1, distLy)) * (180 / Math.PI);
  return galacticToScene(angleDeg, bDeg, distLy);
}

export const MILKY_WAY_OBJECTS: MilkyWayObject[] = [
  // ==========================================
  // 1. GALACTIC CORE & SAGITTARIUS A*
  // ==========================================
  {
    id: 'mw-sagittarius-a-star',
    name: 'Sagittarius A* (Galactic Core)',
    category: 'core',
    subType: 'Supermassive Black Hole',
    distanceLyFromEarth: 26670,
    distanceLyFromCore: 0,
    distanceDesc: '26,670 light-years (Galactic Center)',
    constellation: 'Sagittarius',
    massSolar: '4.297 Million M☉',
    diameterDesc: '51.8 Million km (Schwarzschild: 0.35 AU)',
    color: '#f97316',
    size: 4.8,
    galPos: new THREE.Vector3(0, 0, 0),
    description:
      'The central gravitational anchor of the Milky Way galaxy. Sagittarius A* is a supermassive black hole around which hundreds of billions of stars, gas clouds, and dark matter rotate once every 230 million years (one Cosmic Year). Imaged directly by the Event Horizon Telescope (EHT).',
    astrophysicsFacts: [
      'Event horizon diameter of ~25.4 million km, with shadow size of ~52 microarcseconds as observed from Earth.',
      'S-stars (like S2) orbit Sgr A* at speeds exceeding 7,700 km/s (almost 3% speed of light) proving general relativistic Schwarzschild precession.',
      'Dormant quasar: Currently feeds on a very low accretion rate (quiescent state) compared to active galactic nuclei.',
      'Directly imaged by the Event Horizon Telescope (EHT) collaboration in May 2022.',
    ],
  },
  {
    id: 'mw-central-molecular-zone',
    name: 'Central Molecular Zone (CMZ)',
    category: 'core',
    subType: 'Galactic Bar & Nuclear Molecular Cloud Ring',
    distanceLyFromEarth: 26600,
    distanceLyFromCore: 800,
    distanceDesc: '26,600 light-years',
    constellation: 'Sagittarius',
    massSolar: '30 Million M☉',
    diameterDesc: '1,500 light-years',
    color: '#ea580c',
    size: 3.2,
    galPos: new THREE.Vector3(1.6, 0.2, 0.4),
    description:
      'A dense ring-like reservoir of cold molecular gas and extreme star-forming conditions surrounding the Galactic Center. Contains massive cloud complexes like Sagittarius B2 and Arches.',
    astrophysicsFacts: [
      'Contains 10% of all molecular gas in the entire Milky Way inside less than 1% of the galaxy’s volume.',
      'Rich in complex organic molecules, ethanol, ethyl formate, and glycine precursors detected by radio telescopes.',
      'Hosts the Arches and Quintuplet clusters, the densest young massive star clusters in the Galaxy.',
    ],
  },

  // ==========================================
  // 2. THE SOLAR SYSTEM & EARTH
  // ==========================================
  {
    id: 'mw-solar-system',
    name: 'Solar System (Sun & Earth)',
    category: 'star',
    subType: 'Yellow Dwarf (G2V) & Planetary System',
    distanceLyFromEarth: 0,
    distanceLyFromCore: 26670,
    distanceDesc: 'YOU ARE HERE (Home System)',
    constellation: 'Solar Apex: Hercules',
    spectralType: 'G2V',
    massSolar: '1.0 M☉',
    diameterDesc: '1.392 Million km (Sun)',
    color: '#facc15',
    size: 3.6,
    galPos: SUN_GAL_POS.clone(),
    description:
      'Our home planetary system located in the Orion-Cygnus Spur (Local Arm) of the Milky Way, approximately 26,670 light-years from the galactic core. The Sun travels around the galaxy at 230 km/s, completing an orbit every 225–250 million years.',
    astrophysicsFacts: [
      'Galactocentric orbital velocity: ~828,000 km/h (~230 km/s).',
      'The Solar System has completed approximately 20-25 orbits around the Milky Way since the Sun formed 4.6 billion years ago.',
      'Currently situated inside the Local Interstellar Cloud, within the Local Bubble cavity carved by past supernovae.',
      'Tilted at an angle of ~63° relative to the Milky Way galactic plane.',
    ],
  },

  // ==========================================
  // 3. SPIRAL ARMS (LANDMARKS POSITIONED EXACTLY ON THE ARM CURVES)
  // ==========================================
  {
    id: 'mw-arm-orion',
    name: 'Orion-Cygnus Arm (Local Spur)',
    category: 'arm',
    subType: 'Spiral Arm Bridge / Local Branch',
    distanceLyFromEarth: 1000,
    distanceLyFromCore: 26670,
    distanceDesc: 'Encompasses Local Solar Neighborhood',
    diameterDesc: '10,000 light-years long, 3,500 ly wide',
    color: '#38bdf8',
    size: 3.0,
    galPos: getArmPoint(SPIRAL_ARMS_CONFIG[0], 0.18), // sits directly on the Orion arm curve
    description:
      'The local spiral arm bridge connecting the Sagittarius Arm and the Perseus Arm. Hosts the Solar System, the Orion Nebula, the Pleiades, Rigel, Betelgeuse, and the Cygnus OB star complexes.',
    astrophysicsFacts: [
      'Bridge structure spanning between the Sagittarius Arm (inward) and Perseus Arm (outward).',
      'Contains the Gould Belt and the 9,000-light-year Radcliffe Wave stellar ribbon.',
      'Dense with massive OB associations and luminous young star-forming complexes.',
    ],
  },
  {
    id: 'mw-arm-perseus',
    name: 'Perseus Arm',
    category: 'arm',
    subType: 'Major Galactic Spiral Arm',
    distanceLyFromEarth: 6400,
    distanceLyFromCore: 33000,
    distanceDesc: '6,400 light-years outward from Earth',
    diameterDesc: 'Spans >100,000 light-years arc',
    color: '#06b6d4',
    size: 3.2,
    galPos: getArmPoint(SPIRAL_ARMS_CONFIG[3], -0.20), // sits directly on the Perseus arm curve
    description:
      'One of the two primary major spiral arms of the Milky Way (along with Scutum-Centaurus). Originates from the distal tip of the galactic central bar and wraps around the outer disk.',
    astrophysicsFacts: [
      'Contains iconic deep-sky objects including the Double Cluster in Perseus and the Heart & Soul Nebulae (IC 1805 / IC 1848).',
      'High concentration of interstellar gas, molecular clouds, and active starburst pockets.',
    ],
  },
  {
    id: 'mw-arm-sagittarius',
    name: 'Sagittarius Arm (Carina-Sagittarius)',
    category: 'arm',
    subType: 'Inner Galactic Spiral Arm',
    distanceLyFromEarth: 5000,
    distanceLyFromCore: 21000,
    distanceDesc: '5,000 light-years inward from Earth',
    diameterDesc: 'Inner dense spiral arc',
    color: '#10b981',
    size: 3.2,
    galPos: getArmPoint(SPIRAL_ARMS_CONFIG[1], 0.25), // sits directly on the Sagittarius arm curve
    description:
      'A luminous spiral arm located inward toward the Galactic Center from the Orion Spur. Rich in massive H II emission nebulae including the Carina Nebula, Eagle Nebula, Lagoon Nebula, and Trifid Nebula.',
    astrophysicsFacts: [
      'Contains some of the most luminous young stellar clusters in the Milky Way, including Trumpler 16.',
      'Hosts the giant molecular cloud nurseries responsible for our galaxy’s peak star formation.',
    ],
  },
  {
    id: 'mw-arm-scutum-centaurus',
    name: 'Scutum-Centaurus Arm',
    category: 'arm',
    subType: 'Major Galactic Spiral Arm',
    distanceLyFromEarth: 12000,
    distanceLyFromCore: 16000,
    distanceDesc: '12,000 light-years inward',
    diameterDesc: 'Dense primary spiral branch',
    color: '#6366f1',
    size: 3.2,
    galPos: getArmPoint(SPIRAL_ARMS_CONFIG[2], 0.60), // sits directly on the Scutum arm curve
    description:
      'The second major spiral arm of the Milky Way originating from the near end of the galactic central bar. Contains the largest concentration of red supergiants in the galaxy, including Stephenson 2-18 and UY Scuti.',
    astrophysicsFacts: [
      'Anchored directly to the bar-end where gas infall triggers ferocious starburst clusters.',
      'Hosts the massive RSGC1, RSGC2 (Stephenson 2), and RSGC3 red supergiant clusters.',
    ],
  },
  {
    id: 'mw-arm-norma-outer',
    name: 'Norma & Outer Arm',
    category: 'arm',
    subType: 'Outer Spiral Arm & Bar Inception',
    distanceLyFromEarth: 25000,
    distanceLyFromCore: 45000,
    distanceDesc: '25,000–45,000 light-years',
    diameterDesc: 'Distant outer galactic perimeter',
    color: '#a855f7',
    size: 3.0,
    galPos: getArmPoint(SPIRAL_ARMS_CONFIG[4], -0.40), // sits directly on the Outer arm curve
    description:
      'The Norma arm starts near the inner bar and wraps outward as the Outer Arm, defining the outer boundary of the Milky Way’s star-forming gaseous disk.',
    astrophysicsFacts: [
      'Traces the warp of the Milky Way disk, where the outer edge bends upward toward the North Galactic Pole.',
      'Shows lower metallicity and older stellar populations than the inner spiral arms.',
    ],
  },

  // ==========================================
  // 4. ICONIC GIANTS & EXTREME STARS
  // ==========================================
  {
    id: 'mw-stephenson-2-18',
    name: 'Stephenson 2-18 (RSGC2-18)',
    category: 'star',
    subType: 'Extreme Red Hypergiant',
    distanceLyFromEarth: 18900,
    distanceLyFromCore: 17500,
    distanceDesc: '18,900 light-years',
    constellation: 'Scutum',
    spectralType: 'M6',
    massSolar: '~30-50 M☉',
    diameterDesc: '2,150 Solar Radii (3 Billion km)',
    color: '#ef4444',
    size: 4.2,
    galPos: galacticToScene(26.1, -0.1, 18900), // In Scutum arm
    description:
      'One of the largest known stars in the universe. If placed at the center of our Solar System, its photosphere would engulf the orbit of Saturn (nearly 10 AU radius) and displace 10 billion times the volume of the Sun.',
    astrophysicsFacts: [
      'Radius of ~2,150 R☉ (~10 AU), exceeding the theoretical Hayashi limit for stellar stability.',
      'Luminosity of ~440,000 L☉, losing massive amounts of mass via extreme stellar wind.',
      'Member of the Stephenson 2 open cluster, which contains 26 massive red supergiants.',
    ],
  },
  {
    id: 'mw-uy-scuti',
    name: 'UY Scuti',
    category: 'star',
    subType: 'Pulsating Red Supergiant',
    distanceLyFromEarth: 9500,
    distanceLyFromCore: 19000,
    distanceDesc: '9,500 light-years',
    constellation: 'Scutum',
    spectralType: 'M2-M4Ia-Iab',
    massSolar: '~7-10 M☉',
    diameterDesc: '1,708 Solar Radii (2.38 Billion km)',
    color: '#f97316',
    size: 3.8,
    galPos: galacticToScene(19.0, -0.1, 9500), // In Scutum arm
    description:
      'A pulsating red hypergiant in the Scutum constellation. Surrounded by a vast circumstellar envelope of dust ejected by past eruption episodes.',
    astrophysicsFacts: [
      'Pulsates with a primary period of approximately 740 days.',
      'Surrounded by a shell of gas and dust ejected during catastrophic mass-loss events.',
      'Expected to end its life in a core-collapse Type II supernova within the next million years.',
    ],
  },
  {
    id: 'mw-betelgeuse',
    name: 'Betelgeuse (Alpha Orionis)',
    category: 'star',
    subType: 'Red Supergiant',
    distanceLyFromEarth: 642,
    distanceLyFromCore: 26800,
    distanceDesc: '642 light-years',
    constellation: 'Orion',
    spectralType: 'M1-2 Ia-ab',
    massSolar: '16.5-19 M☉',
    diameterDesc: '764 Solar Radii (1.06 Billion km)',
    color: '#f87171',
    size: 2.8,
    galPos: galacticToScene(199.8, -8.9, 642), // In Orion Spur next to Sun
    description:
      'The iconic bright red supergiant marking the right shoulder of Orion. Near the end of its stellar life, Betelgeuse is destined to detonate in a spectacular core-collapse supernova visible in broad daylight on Earth.',
    astrophysicsFacts: [
      'Underwent the famous "Great Dimming" in late 2019 / early 2020 caused by a huge surface mass ejection that condensed into obscuring dust.',
      'If placed at the center of the Solar System, it would extend past the orbit of Mars and approach Jupiter.',
      'Emits a stellar bow shock 3 light-years wide colliding with the interstellar medium at 30 km/s.',
    ],
  },
  {
    id: 'mw-rigel',
    name: 'Rigel (Beta Orionis)',
    category: 'star',
    subType: 'Blue-White Supergiant',
    distanceLyFromEarth: 860,
    distanceLyFromCore: 26900,
    distanceDesc: '860 light-years',
    constellation: 'Orion',
    spectralType: 'B8Ia',
    massSolar: '21 M☉',
    diameterDesc: '78.9 Solar Radii (110 Million km)',
    color: '#93c5fd',
    size: 2.6,
    galPos: galacticToScene(209.2, -25.2, 860), // In Orion Spur
    description:
      'The brightest star in Orion and the seventh-brightest star in the night sky. Rigel shines with the intense luminosity of 120,000 Suns and illuminates nearby reflection clouds like the Witch Head Nebula.',
    astrophysicsFacts: [
      'Luminosity of ~120,000 L☉ radiates massive ultraviolet ionizing flux.',
      'Part of a quadruple star system with companion stars Rigel Ba, Bb, and C.',
      'Will likely explode as a Type II supernova leaving behind a neutron star or black hole.',
    ],
  },
  {
    id: 'mw-eta-carinae',
    name: 'Eta Carinae',
    category: 'star',
    subType: 'Luminous Blue Variable (LBV) Binary',
    distanceLyFromEarth: 7500,
    distanceLyFromCore: 24500,
    distanceDesc: '7,500 light-years',
    constellation: 'Carina',
    spectralType: 'LBV + O-type',
    massSolar: '100 + 30 M☉',
    diameterDesc: 'Homunculus Nebula: 0.5 light-years',
    color: '#38bdf8',
    size: 3.4,
    galPos: galacticToScene(287.6, -0.6, 7500), // In Carina arm
    description:
      'One of the most massive and violently unstable stellar systems in the Milky Way. During the "Great Eruption" of 1843, Eta Carinae briefly became the second-brightest star in the night sky while ejecting the twin-lobed Homunculus Nebula.',
    astrophysicsFacts: [
      'Total system luminosity exceeds 5 million Suns (5,000,000 L☉).',
      'The Homunculus Nebula was created by the ejection of >10-40 solar masses of gas and dust moving at 650 km/s.',
      'Prime candidate for a future core-collapse hypernova or pair-instability supernova with a gamma-ray burst.',
    ],
  },
  {
    id: 'mw-pistol-star',
    name: 'Pistol Star',
    category: 'star',
    subType: 'Hypergiant Luminous Blue Variable',
    distanceLyFromEarth: 25000,
    distanceLyFromCore: 100,
    distanceDesc: '25,000 light-years (Galactic Center)',
    constellation: 'Sagittarius',
    spectralType: 'LBV',
    massSolar: '80-150 M☉',
    diameterDesc: '306 Solar Radii (426 Million km)',
    color: '#67e8f9',
    size: 3.2,
    galPos: new THREE.Vector3(0.2, 0.05, 0.3), // Near Sagittarius A*
    description:
      'A hypergiant star in the Quintuplet cluster near Sagittarius A*. Radiates as much energy in 20 seconds as the Sun does in an entire year, surrounded by the 10-solar-mass Pistol Nebula.',
    astrophysicsFacts: [
      'One of the most luminous stars known, radiating ~3.3 million times more energy than the Sun.',
      'Ejected the Pistol Nebula (a 10 M☉ shell) during giant eruptions 4,000 to 6,000 years ago.',
      'Heavily obscured by interstellar dust in optical wavelengths, observable primarily in infrared.',
    ],
  },
  {
    id: 'mw-wr-102',
    name: 'WR 102 (Oxygen Wolf-Rayet)',
    category: 'star',
    subType: 'WO-type Wolf-Rayet Star',
    distanceLyFromEarth: 9800,
    distanceLyFromCore: 18000,
    distanceDesc: '9,800 light-years',
    constellation: 'Sagittarius',
    spectralType: 'WO2',
    massSolar: '16.1 M☉',
    diameterDesc: '0.52 Solar Radii (Core exposed)',
    color: '#ec4899',
    size: 2.2,
    galPos: galacticToScene(16.1, 0.8, 9800),
    description:
      'One of the hottest known stars in the universe with a blistering surface temperature of 210,000 Kelvin (over 35 times hotter than the Sun). WR 102 has stripped away its hydrogen and helium envelopes, exposing its glowing oxygen-carbon fusion core.',
    astrophysicsFacts: [
      'Blistering surface temperature of ~210,000 K, radiating intense ionizing hard UV flux.',
      'Stellar wind speeds reach an incredible 5,000 km/s (over 1% speed of light).',
      'In the final oxygen-burning phase of stellar evolution; predicted to explode in a Type Ic supernova/GRB within 1,500 years.',
    ],
  },
  {
    id: 'mw-alpha-centauri',
    name: 'Alpha Centauri System (Rigil Kentaurus)',
    category: 'star',
    subType: 'Triple Star System',
    distanceLyFromEarth: 4.37,
    distanceLyFromCore: 26670,
    distanceDesc: '4.37 light-years (Closest Star System)',
    constellation: 'Centaurus',
    spectralType: 'G2V + K1V + M5.5Ve',
    massSolar: '1.1 + 0.9 + 0.12 M☉',
    diameterDesc: 'Alpha Cen A: 1.22 R☉',
    color: '#fbbf24',
    size: 2.4,
    galPos: galacticToScene(315.7, -0.7, 4.37),
    description:
      'The closest star system to our Solar System, consisting of a binary pair of Sun-like stars (Alpha Centauri A and B) and the red dwarf Proxima Centauri, which hosts the Earth-mass exoplanet Proxima b in its habitable zone.',
    astrophysicsFacts: [
      'Proxima Centauri is the single nearest individual star to Earth at 4.2465 light-years.',
      'Proxima b is an Earth-sized planet orbiting in the habitable zone at 0.0485 AU.',
      'Target of the Breakthrough Starshot interstellar laser-sail nanocraft exploration initiative.',
    ],
  },

  // ==========================================
  // 5. ICONIC NEBULAE & STELLAR NURSERIES
  // ==========================================
  {
    id: 'mw-orion-nebula',
    name: 'Orion Nebula (Messier 42)',
    category: 'nebula',
    subType: 'Diffuse H II Starburst Nursery',
    distanceLyFromEarth: 1344,
    distanceLyFromCore: 26900,
    distanceDesc: '1,344 light-years',
    constellation: 'Orion',
    massSolar: '2,000 M☉',
    diameterDesc: '24 light-years',
    color: '#f472b6',
    size: 3.2,
    galPos: galacticToScene(209.0, -19.4, 1344), // In Orion Spur
    description:
      'The closest massive star-forming region to Earth, visible to the naked eye as the middle star of Orion’s Sword. Powered by the ultraviolet radiation of the young, massive stars of the Trapezium Cluster.',
    astrophysicsFacts: [
      'Contains over 700 young stars in various stages of formation, along with protoplanetary disks ("proplyds").',
      'The Trapezium cluster’s primary star, Theta-1 Orionis C, produces most of the ionizing UV glow.',
      'Cavity bubble expanding at 10-20 km/s due to intense stellar winds and radiation pressure.',
    ],
  },
  {
    id: 'mw-carina-nebula',
    name: 'Carina Nebula (NGC 3372)',
    category: 'nebula',
    subType: 'Giant H II Emission Nebula',
    distanceLyFromEarth: 7500,
    distanceLyFromCore: 24500,
    distanceDesc: '7,500 light-years',
    constellation: 'Carina',
    massSolar: '900,000 M☉',
    diameterDesc: '460 light-years',
    color: '#fb7185',
    size: 3.8,
    galPos: galacticToScene(287.6, -0.6, 7500), // In Carina Arm
    description:
      'One of the largest and brightest diffuse nebulae in the sky, four times larger and much brighter than Orion. Houses Eta Carinae and the Trumpler 14 and 16 star clusters with dozens of O- and B-type supergiants.',
    astrophysicsFacts: [
      'Contains the iconic "Mystic Mountain" three-light-year-tall pillar of gas and dust imaged by Hubble.',
      'Hosts at least eight known O3-type supergiant stars, among the hottest stars known in our galaxy.',
      'Active site of induced secondary star formation triggered by supersonic stellar winds.',
    ],
  },
  {
    id: 'mw-eagle-nebula',
    name: 'Eagle Nebula & Pillars of Creation (M16)',
    category: 'nebula',
    subType: 'Open Star Cluster & Emission Nebula',
    distanceLyFromEarth: 7000,
    distanceLyFromCore: 21500,
    distanceDesc: '7,000 light-years',
    constellation: 'Serpens',
    diameterDesc: '70 x 55 light-years',
    color: '#06b6d4',
    size: 3.4,
    galPos: galacticToScene(17.0, 0.8, 7000), // In Sagittarius Arm
    description:
      'Famous for the "Pillars of Creation", three towering finger-like structures of dense interstellar gas and dust where new stars are emerging from evaporating gaseous globules (EGGs).',
    astrophysicsFacts: [
      'The tallest pillar is approximately 4 light-years (38 trillion km) tall.',
      'Ultraviolet radiation from young O- and B-type stars is eroding the pillars via photoevaporation.',
      'JWST infrared observations pierced the dust in 2022 to reveal thousands of newly formed protostars.',
    ],
  },
  {
    id: 'mw-crab-nebula',
    name: 'Crab Nebula (Messier 1)',
    category: 'nebula',
    subType: 'Supernova Remnant (Plerion)',
    distanceLyFromEarth: 6500,
    distanceLyFromCore: 33170,
    distanceDesc: '6,500 light-years',
    constellation: 'Taurus',
    diameterDesc: '11 light-years (Expanding at 1,500 km/s)',
    color: '#34d399',
    size: 2.8,
    galPos: galacticToScene(184.6, -5.8, 6500), // Outward in Perseus Arm
    description:
      'The expanding debris remnant of supernova SN 1054, recorded by Chinese, Japanese, and Arab astronomers in 1054 AD. Driven by synchrotron radiation from the central Crab Pulsar.',
    astrophysicsFacts: [
      'Debris shell expanding outward into interstellar space at approximately 1,500 km/s.',
      'Powered by the central Crab Pulsar, a 1.4 M☉ neutron star spinning 30.2 times per second.',
      'First astronomical object identified with a historical supernova explosion.',
    ],
  },
  {
    id: 'mw-helix-nebula',
    name: 'Helix Nebula (NGC 7293)',
    category: 'nebula',
    subType: 'Planetary Nebula ("Eye of God")',
    distanceLyFromEarth: 655,
    distanceLyFromCore: 26500,
    distanceDesc: '655 light-years (Closest Bright Planetary Nebula)',
    constellation: 'Aquarius',
    diameterDesc: '5.74 light-years',
    color: '#38bdf8',
    size: 2.6,
    galPos: galacticToScene(36.0, -57.2, 655),
    description:
      'Often called the "Eye of God", the Helix Nebula is one of the closest planetary nebulae to Earth, formed when a Sun-like star shed its outer layers near the end of its life, leaving a glowing white dwarf at its core.',
    astrophysicsFacts: [
      'Contains thousands of cometary knots of cold molecular gas shielded from ionizing radiation.',
      'Central white dwarf star has a surface temperature of ~120,000 K and a mass of ~0.6 M☉.',
      'Offers a glimpse into the distant future of our own Sun in 5 billion years.',
    ],
  },
  {
    id: 'mw-radcliffe-wave',
    name: 'Radcliffe Wave',
    category: 'nebula',
    subType: '9,000-Light-Year Coherent Gas Wave',
    distanceLyFromEarth: 500,
    distanceLyFromCore: 26600,
    distanceDesc: '500–5,000 light-years',
    constellation: 'Monoceros, Orion, Taurus, Perseus, Cepheus',
    massSolar: '3 Million M☉',
    diameterDesc: '9,000 light-years long, 400 ly wide',
    color: '#818cf8',
    size: 3.5,
    galPos: galacticToScene(200.0, 2.0, 2000), // Along the local arm
    description:
      'A vast, undulating ribbon of interconnected gas clouds and star nurseries spanning 9,000 light-years in the Milky Way’s Local Arm. Discovered in 2020 by 3D stellar cartography.',
    astrophysicsFacts: [
      'Oscillates vertically through the galactic plane with a wavelength of ~8,000 light-years and amplitude of ~500 light-years.',
      'Links iconic regions: Orion, Taurus, Perseus, and Cepheus into a single continuous sinusoidal structure.',
      'Our Sun crossed the wave approximately 13 million years ago.',
    ],
  },

  // ==========================================
  // 6. GLOBULAR CLUSTERS IN GALACTIC HALO
  // ==========================================
  {
    id: 'mw-omega-centauri',
    name: 'Omega Centauri (NGC 5139)',
    category: 'cluster',
    subType: 'Massive Globular Cluster / Dwarf Remnant',
    distanceLyFromEarth: 15800,
    distanceLyFromCore: 21000,
    distanceDesc: '15,800 light-years (Halo)',
    constellation: 'Centaurus',
    massSolar: '4 Million M☉',
    diameterDesc: '150 light-years (10 Million Stars)',
    color: '#e0e7ff',
    size: 3.6,
    galPos: galacticToScene(309.1, 15.0, 15800), // High halo
    description:
      'The largest, most massive, and brightest globular cluster in the Milky Way, containing roughly 10 million stars. Many astronomers believe Omega Centauri is the surviving stripped nucleus of an ancient dwarf galaxy consumed by the Milky Way billions of years ago.',
    astrophysicsFacts: [
      'Contains multiple distinct stellar populations with varying ages and metallicities, unlike standard globular clusters.',
      'Candidate intermediate-mass black hole (~40,000 M☉) detected at its core via high-velocity stellar motions.',
      'Stellar density at the core is thousands of times greater than the solar neighborhood.',
    ],
  },
  {
    id: 'mw-messier-13',
    name: 'Great Hercules Cluster (Messier 13)',
    category: 'cluster',
    subType: 'Halo Globular Cluster',
    distanceLyFromEarth: 22200,
    distanceLyFromCore: 28000,
    distanceDesc: '22,200 light-years (High Galactic Latitude)',
    constellation: 'Hercules',
    massSolar: '600,000 M☉',
    diameterDesc: '145 light-years (~300,000 Stars)',
    color: '#c7d2fe',
    size: 3.2,
    galPos: galacticToScene(59.0, 40.9, 22200), // High north halo
    description:
      'One of the most prominent globular clusters in the northern sky. In 1974, the Arecibo radio message was beamed toward M13 carrying information about humanity and DNA.',
    astrophysicsFacts: [
      'Age estimated at 11.65 billion years, containing pristine Population II stars.',
      'Destination of the famous 1974 Arecibo Message (will arrive in ~22,000 years).',
      'Located 14,500 light-years above the galactic disk in the Milky Way halo.',
    ],
  },
  {
    id: 'mw-47-tucanae',
    name: '47 Tucanae (NGC 104)',
    category: 'cluster',
    subType: 'Dense Core Globular Cluster',
    distanceLyFromEarth: 13000,
    distanceLyFromCore: 24000,
    distanceDesc: '13,000 light-years',
    constellation: 'Tucana',
    massSolar: '1 Million M☉',
    diameterDesc: '120 light-years (~1 Million Stars)',
    color: '#ddd6fe',
    size: 3.2,
    galPos: galacticToScene(305.9, -44.9, 13000), // South halo
    description:
      'The second-brightest globular cluster in the night sky. Famous for its extremely dense, brilliant core and the highest known population of millisecond pulsars.',
    astrophysicsFacts: [
      'Hosts at least 29 known millisecond pulsars spun up by accretion in stellar collisions.',
      'Demonstrates severe mass segregation, where heavier white dwarfs and binaries sink toward the center.',
    ],
  },

  // ==========================================
  // 7. STELLAR BLACK HOLES, MAGNETARS & PULSARS
  // ==========================================
  {
    id: 'mw-gaia-bh1',
    name: 'Gaia BH1',
    category: 'black_hole',
    subType: 'Quiescent Stellar-Mass Black Hole',
    distanceLyFromEarth: 1560,
    distanceLyFromCore: 26000,
    distanceDesc: '1,560 light-years (Closest Known Black Hole)',
    constellation: 'Ophiuchus',
    massSolar: '9.62 M☉',
    diameterDesc: 'Schwarzschild: 57 km',
    color: '#f97316',
    size: 2.8,
    galPos: galacticToScene(19.5, 7.8, 1560),
    description:
      'The closest known black hole to Earth, discovered by the ESA Gaia space telescope in 2022. It orbits a Sun-like G-type star with a period of 185.6 days in a dormant, non-accreting state.',
    astrophysicsFacts: [
      'Discovered entirely through astrometric wobbles of its companion star rather than X-ray emissions.',
      'Its dormant state implies an enormous population of undiscovered quiet stellar-mass black holes in the galaxy.',
      'Separation from companion star is approximately 1.4 AU (similar to Mars’s distance from the Sun).',
    ],
  },
  {
    id: 'mw-gaia-bh3',
    name: 'Gaia BH3',
    category: 'black_hole',
    subType: 'Massive Stellar-Origin Black Hole',
    distanceLyFromEarth: 1926,
    distanceLyFromCore: 25500,
    distanceDesc: '1,926 light-years',
    constellation: 'Aquila',
    massSolar: '32.7 M☉',
    diameterDesc: 'Schwarzschild: 193 km',
    color: '#ea580c',
    size: 3.0,
    galPos: galacticToScene(45.1, -8.2, 1926),
    description:
      'The most massive stellar-origin black hole known in the Milky Way, discovered in April 2024 by Gaia. Formed from the collapse of a very low-metallicity metal-poor giant star.',
    astrophysicsFacts: [
      'At 33 M☉, it is more than 50% more massive than Cygnus X-1 (21 M☉).',
      'Orbits a metal-poor giant star with a period of 11.6 years at an orbital distance of ~16 AU.',
      'Confirms that metal-poor stars preserve their mass without losing it to stellar winds, allowing very heavy black holes to form.',
    ],
  },
  {
    id: 'mw-cygnus-x1',
    name: 'Cygnus X-1 (HDE 226868)',
    category: 'black_hole',
    subType: 'High-Mass X-ray Binary (Microquasar)',
    distanceLyFromEarth: 7300,
    distanceLyFromCore: 26000,
    distanceDesc: '7,300 light-years',
    constellation: 'Cygnus',
    massSolar: '21.2 M☉',
    diameterDesc: 'Schwarzschild: 125 km',
    color: '#fb923c',
    size: 3.2,
    galPos: galacticToScene(71.3, 3.1, 7300), // Along Cygnus rotation direction
    description:
      'The first widely accepted black hole candidate in history (confirmed in the 1970s). Pulls superheated matter from the blue supergiant star HDE 226868 into a roaring accretion disk emitting hard X-rays.',
    astrophysicsFacts: [
      'Accretion disk spins at over 95% of the speed of light (near-extremal Kerr metric).',
      'Famous 1975 bet between Stephen Hawking and Kip Thorne over whether Cygnus X-1 was a true black hole (Hawking conceded in 1990).',
      'Launches relativistic radio-emitting plasma jets interacting with the interstellar gas.',
    ],
  },
  {
    id: 'mw-sgr-1806-20',
    name: 'SGR 1806-20 (Super-Magnetar)',
    category: 'black_hole',
    subType: 'Soft Gamma Repeater / Magnetar',
    distanceLyFromEarth: 50000,
    distanceLyFromCore: 25000,
    distanceDesc: '50,000 light-years (Far Side of Galaxy)',
    constellation: 'Sagittarius',
    massSolar: '~1.4-2.0 M☉',
    diameterDesc: '20 km (Neutron Star Core)',
    color: '#a855f7',
    size: 2.8,
    galPos: galacticToScene(10.0, -0.2, 50000), // Far side of the galaxy
    description:
      'An ultra-magnetic neutron star possessing a magnetic field of $10^{15}$ Gauss (100 billion Tesla). On December 27, 2004, a starquake on SGR 1806-20 produced a giant flare that saturated all satellite detectors and ionized Earth’s upper atmosphere from 50,000 light-years away.',
    astrophysicsFacts: [
      'Magnetic field is $10^{11}$ times stronger than a typical neodymium magnet on Earth.',
      'The 2004 burst released more energy in 0.1 seconds than the Sun has emitted in the last 150,000 years.',
      'Crust rupture shifted the magnetic field lines, creating an ultra-relativistic electron-positron fireball.',
    ],
  },
  {
    id: 'mw-psr-j1748',
    name: 'PSR J1748-2446ad',
    category: 'black_hole',
    subType: 'Fastest Known Millisecond Pulsar',
    distanceLyFromEarth: 18000,
    distanceLyFromCore: 9000,
    distanceDesc: '18,000 light-years (Terzan 5 Cluster)',
    constellation: 'Sagittarius',
    massSolar: '~1.4 M☉',
    diameterDesc: '32 km (Equator spins at 24% c)',
    color: '#c084fc',
    size: 2.6,
    galPos: galacticToScene(3.8, 1.7, 18000), // Terzan 5
    description:
      'The fastest-spinning known pulsar in the universe, rotating 716 times per second (716 Hz). Its equator travels at nearly 70,000 km/s (almost a quarter the speed of light).',
    astrophysicsFacts: [
      'Rotates at 42,960 RPM, creating intense frame-dragging of spacetime around it.',
      'Located inside the dense Terzan 5 globular cluster near the galactic bulge.',
      'Oblate spheroid: Centrifugal forces stretch its equator by ~10% despite extreme gravity.',
    ],
  },

  // ==========================================
  // 8. NOTABLE EXOPLANET SYSTEMS
  // ==========================================
  {
    id: 'mw-trappist-1',
    name: 'TRAPPIST-1 System',
    category: 'exoplanet',
    subType: 'Ultra-Cool Red Dwarf & 7 Terrestrial Worlds',
    distanceLyFromEarth: 40.7,
    distanceLyFromCore: 26670,
    distanceDesc: '40.7 light-years',
    constellation: 'Aquarius',
    spectralType: 'M8V',
    massSolar: '0.089 M☉',
    diameterDesc: 'Star: 0.121 R☉ (Size of Jupiter)',
    color: '#f59e0b',
    size: 2.6,
    galPos: galacticToScene(55.0, -15.0, 40.7),
    description:
      'A remarkably compact planetary system of seven temperate Earth-sized rocky exoplanets orbiting an ultra-cool red dwarf. Three of the planets (e, f, and g) reside within the star’s habitable zone where liquid water could exist.',
    astrophysicsFacts: [
      'All seven planets are locked in a complex resonant orbital chain (24:15:9:6:4:3:2).',
      'The entire system would fit well inside the orbit of Mercury.',
      'Primary target of the James Webb Space Telescope (JWST) for atmospheric spectroscopic searches.',
    ],
  },
  {
    id: 'mw-kepler-452b',
    name: 'Kepler-452 System ("Earth 2.0")',
    category: 'exoplanet',
    subType: 'Sun-like Star & Habitable Super-Earth',
    distanceLyFromEarth: 1800,
    distanceLyFromCore: 26000,
    distanceDesc: '1,800 light-years',
    constellation: 'Cygnus',
    spectralType: 'G2V',
    massSolar: '1.037 M☉',
    diameterDesc: 'Kepler-452b: 1.63 Earth Radii',
    color: '#34d399',
    size: 2.4,
    galPos: galacticToScene(78.0, 12.0, 1800), // In Cygnus field
    description:
      'Often called "Earth’s older, bigger cousin", Kepler-452b is the first near-Earth-size planet discovered in the habitable zone of a star very similar to our Sun, completing an orbit every 385 days.',
    astrophysicsFacts: [
      'Orbits a G2V star nearly identical in temperature and type to our Sun.',
      'Has spent 6 billion years in the habitable zone (1.5 billion years longer than Earth).',
      'Mass estimated at ~5 Earth masses, likely maintaining active geology and volcanism.',
    ],
  },
  {
    id: 'mw-51-pegasi',
    name: '51 Pegasi (Helvetios & Dimidium)',
    category: 'exoplanet',
    subType: 'First Discovered Hot Jupiter',
    distanceLyFromEarth: 50.45,
    distanceLyFromCore: 26670,
    distanceDesc: '50.45 light-years',
    constellation: 'Pegasus',
    spectralType: 'G5V',
    massSolar: '1.11 M☉',
    diameterDesc: 'Dimidium: 0.47 Jupiter Masses',
    color: '#60a5fa',
    size: 2.2,
    galPos: galacticToScene(95.0, -25.0, 50.45),
    description:
      'Historical milestone: The first confirmed exoplanet orbiting a main-sequence Sun-like star, discovered by Michel Mayor and Didier Queloz in 1995 (for which they won the 2019 Nobel Prize in Physics).',
    astrophysicsFacts: [
      'Orbits its host star in just 4.2 days at an extreme distance of 0.0527 AU.',
      'Surface temperature exceeds 1,000°C, proving planetary migration theories.',
      'Ushered in the modern golden age of exoplanet discovery.',
    ],
  },

  // ==========================================
  // 9. FERMI BUBBLES
  // ==========================================
  {
    id: 'mw-fermi-bubbles',
    name: 'Fermi Bubbles (Relic Galactic Outflow)',
    category: 'fermi_bubble',
    subType: 'Giant High-Energy Plasma Lobes',
    distanceLyFromEarth: 26670,
    distanceLyFromCore: 25000,
    distanceDesc: 'Extend 25,000 ly above & below Core',
    constellation: 'Galactic Center Bipolar',
    diameterDesc: '50,000 light-years tip-to-tip',
    color: '#c084fc',
    size: 4.5,
    galPos: new THREE.Vector3(0, 25.0, 0),
    description:
      'Two colossal, symmetric bubbles of high-energy gamma-ray and X-ray emitting plasma extending 25,000 light-years North and South from the center of the Milky Way. Discovered in 2010 by NASA’s Fermi Gamma-ray Space Telescope.',
    astrophysicsFacts: [
      'Formed approximately 2.6 to 6 million years ago by a titanic jet eruption from Sagittarius A* or a hyper-starburst episode.',
      'Expanding through the Milky Way halo at supersonic speeds of >1,000 km/s.',
      'Contain relativistic cosmic rays and magnetic fields emitting synchrotron and inverse Compton radiation.',
    ],
  },
];

/**
 * Convert a MilkyWayObject into a standardized SkyObject
 * so the DetailDrawer and UI displays all information seamlessly.
 */
export function milkyWayToSkyObject(mw: MilkyWayObject): SkyObject {
  return {
    id: mw.id,
    name: mw.name,
    type:
      mw.category === 'core' || mw.category === 'black_hole'
        ? 'black_hole'
        : mw.category === 'nebula'
        ? 'nebula'
        : mw.category === 'star'
        ? 'star'
        : mw.category === 'cluster'
        ? 'galaxy'
        : 'star',
    color: mw.color,
    distanceLy: mw.distanceLyFromEarth,
    massSolar: mw.massSolar,
    diameterKm: undefined,
    spectralType: mw.spectralType,
    azimuth: 180,
    altitude: 45,
    description: `${mw.subType} • ${mw.distanceDesc}\n\n${mw.description}\n\nKey Astrophysics:\n• ${mw.astrophysicsFacts.join('\n• ')}`,
    cosmicX: mw.galPos.x,
    cosmicY: mw.galPos.y,
    cosmicZ: mw.galPos.z,
  };
}
