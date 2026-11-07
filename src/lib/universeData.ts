import * as THREE from 'three';
import { SkyObject } from '../types';

export interface CosmicObject {
  id: string;
  name: string;
  category: 'galaxy' | 'black_hole' | 'dead_star' | 'wormhole';
  subType: string;
  distanceLy: number; // Light-years from Earth
  distanceDesc: string;
  massSolar?: string; // Solar masses (M☉)
  diameterDesc?: string;
  temperatureK?: number;
  redshift?: number;
  raHours?: number;
  decDeg?: number;
  color: string;
  size: number; // 3D visual scale
  // Scaled 3D position in the cosmic map
  cosmicPos: THREE.Vector3;
  description: string;
  astrophysicsFacts: string[];
}

/**
 * Logarithmic cosmic distance scale
 * Maps distance in light-years (0 to 46.5 Billion ly) to 3D scene units (0 to 190)
 */
export function scaleCosmicLy(distLy: number, thetaRad: number, phiRad: number): THREE.Vector3 {
  if (distLy === 0) return new THREE.Vector3(0, 0, 0);

  // Logarithmic distance curve: Earth (0), Local Stars (12-25), Milky Way (45), Local Group (70), Virgo (105), Quasars (155), CMB (~185)
  const logDist = Math.log10(Math.max(10, distLy));
  const scaledR = Math.max(12, Math.pow(logDist, 2.2) * 1.0);

  const x = scaledR * Math.cos(phiRad) * Math.sin(thetaRad);
  const y = scaledR * Math.sin(phiRad);
  const z = -scaledR * Math.cos(phiRad) * Math.cos(thetaRad);

  return new THREE.Vector3(x, y, z);
}

export const COSMIC_OBJECTS: CosmicObject[] = [
  // ==========================================
  // 1. GALAXIES & SUPERCLUSTERS
  // ==========================================
  {
    id: 'galaxy-milky-way',
    name: 'Milky Way Galaxy',
    category: 'galaxy',
    subType: 'Barred Spiral Galaxy (SBbc)',
    distanceLy: 0,
    distanceDesc: 'Our Home Galaxy',
    massSolar: '1.5 Trillion M☉',
    diameterDesc: '100,000 light-years',
    color: '#38bdf8',
    size: 5.5,
    cosmicPos: new THREE.Vector3(0, 0, 0),
    description: 'Our home barred spiral galaxy consisting of 100–400 billion stars, gas clouds, and dark matter scaffolding rotating around Sagittarius A*.',
    astrophysicsFacts: [
      'The Solar System is located on the inner edge of the Orion-Cygnus Arm, ~26,000 ly from the galactic core.',
      'Takes ~230 million years to complete one galactic orbit (one cosmic year).',
      'Collision trajectory with Andromeda Galaxy in ~4.5 billion years to form "Milkdromeda".',
    ],
  },
  {
    id: 'galaxy-andromeda',
    name: 'Andromeda Galaxy (M31)',
    category: 'galaxy',
    subType: 'Barred Spiral Galaxy (SA(s)b)',
    distanceLy: 2500000,
    distanceDesc: '2.5 Million light-years',
    massSolar: '1.2 Trillion M☉',
    diameterDesc: '220,000 light-years',
    color: '#60a5fa',
    size: 5.8,
    cosmicPos: scaleCosmicLy(2500000, 0.42, 0.35),
    description: 'The largest galaxy in the Local Group, containing over 1 trillion stars and moving toward the Milky Way at 110 km/s.',
    astrophysicsFacts: [
      'Visible to the naked eye under dark skies as a faint smudge in the Andromeda constellation.',
      'Houses a double galactic nucleus harboring a supermassive black hole of 140 million M☉.',
      'Surrounded by a giant stellar halo spanning nearly a million light-years.',
    ],
  },
  {
    id: 'galaxy-triangulum',
    name: 'Triangulum Galaxy (M33)',
    category: 'galaxy',
    subType: 'Spiral Galaxy (SA(s)cd)',
    distanceLy: 2730000,
    distanceDesc: '2.73 Million light-years',
    massSolar: '50 Billion M☉',
    diameterDesc: '60,000 light-years',
    color: '#818cf8',
    size: 4.2,
    cosmicPos: scaleCosmicLy(2730000, 0.85, 0.18),
    description: 'Third-largest member of the Local Group; an active spiral galaxy undergoing rapid, vigorous star formation.',
    astrophysicsFacts: [
      'Contains NGC 604, one of the largest known H II starburst emission regions in the universe.',
      'Gravitationally bound companion satellite to the Andromeda Galaxy.',
      'Lacks a prominent central supermassive black hole, putting an upper limit of ~1,500 M☉ on its core.',
    ],
  },
  {
    id: 'galaxy-lmc',
    name: 'Large Magellanic Cloud (LMC)',
    category: 'galaxy',
    subType: 'Magellanic Spiral / Dwarf Galaxy',
    distanceLy: 163000,
    distanceDesc: '163,000 light-years',
    massSolar: '10 Billion M☉',
    diameterDesc: '14,000 light-years',
    color: '#a78bfa',
    size: 3.8,
    cosmicPos: scaleCosmicLy(163000, 2.15, -0.65),
    description: 'Prominent satellite dwarf galaxy orbiting the Milky Way, visible to the naked eye from the Southern Hemisphere.',
    astrophysicsFacts: [
      'Home to the Tarantula Nebula (30 Doradus), the most active starburst nursery in the Local Group.',
      'Site of Supernova 1987A, the closest observed modern core-collapse supernova.',
      'Currently on its first close passage around the Milky Way.',
    ],
  },
  {
    id: 'galaxy-smc',
    name: 'Small Magellanic Cloud (SMC)',
    category: 'galaxy',
    subType: 'Dwarf Irregular Galaxy',
    distanceLy: 204000,
    distanceDesc: '204,000 light-years',
    massSolar: '6.5 Billion M☉',
    diameterDesc: '7,000 light-years',
    color: '#c084fc',
    size: 3.2,
    cosmicPos: scaleCosmicLy(204000, 2.35, -0.72),
    description: 'Dwarf irregular satellite galaxy interacting with both the LMC and the Milky Way via the Magellanic Stream.',
    astrophysicsFacts: [
      'Connected to the LMC by the Magellanic Bridge of gas and young stars.',
      'Recent high-precision astrometry indicates the SMC may actually be two distinct dwarf structures along the line of sight.',
      'Used by Henrietta Leavitt in 1908 to discover the Cepheid variable period-luminosity relation.',
    ],
  },
  {
    id: 'galaxy-whirlpool',
    name: 'Whirlpool Galaxy (M51)',
    category: 'galaxy',
    subType: 'Grand-Design Spiral Galaxy',
    distanceLy: 23000000,
    distanceDesc: '23 Million light-years',
    massSolar: '160 Billion M☉',
    diameterDesc: '76,000 light-years',
    color: '#38bdf8',
    size: 4.8,
    cosmicPos: scaleCosmicLy(23000000, -1.2, 0.55),
    description: 'Iconic grand-design spiral galaxy with sweeping spiral arms, actively interacting and stripping material from companion NGC 5195.',
    astrophysicsFacts: [
      'First galaxy identified with spiral structure by Lord Rosse using the Leviathan of Parsonstown in 1845.',
      'Hosts a low-luminosity Seyfert 2 Active Galactic Nucleus (AGN).',
      'The gravitational tidal interaction compresses gas, triggering immense bursts of star formation.',
    ],
  },
  {
    id: 'galaxy-sombrero',
    name: 'Sombrero Galaxy (M104)',
    category: 'galaxy',
    subType: 'Unbarred Spiral / Lenticular',
    distanceLy: 31000000,
    distanceDesc: '31 Million light-years',
    massSolar: '800 Billion M☉',
    diameterDesc: '50,000 light-years',
    color: '#facc15',
    size: 4.6,
    cosmicPos: scaleCosmicLy(31000000, 1.75, -0.2),
    description: 'Extraordinary galaxy characterized by an unusually large central stellar bulge and a dark, prominent dust lane ring.',
    astrophysicsFacts: [
      'Harbors a supermassive black hole of 1 billion solar masses at its center.',
      'Possesses an unusually rich system of globuler clusters (nearly 2,000).',
      'High rotational velocity of 370 km/s provided early evidence of dark matter.',
    ],
  },
  {
    id: 'galaxy-m87',
    name: 'Messier 87 (Virgo A)',
    category: 'galaxy',
    subType: 'Supergiant Elliptical Galaxy (cD)',
    distanceLy: 53500000,
    distanceDesc: '53.5 Million light-years',
    massSolar: '2.4 Trillion M☉',
    diameterDesc: '240,000 light-years',
    color: '#fb923c',
    size: 6.2,
    cosmicPos: scaleCosmicLy(53500000, 0.25, 0.45),
    description: 'One of the most massive galaxies in the observable universe, dominating the center of the Virgo Galaxy Cluster.',
    astrophysicsFacts: [
      'Contains over 12,000 globular clusters (compared to ~150 in the Milky Way).',
      'Shoots out a relativistic plasma jet spanning over 5,000 light-years at near light-speed.',
      'Hosts the legendary central supermassive black hole M87*.',
    ],
  },
  {
    id: 'galaxy-centaurus-a',
    name: 'Centaurus A (NGC 5128)',
    category: 'galaxy',
    subType: 'Radio Galaxy / Lenticular',
    distanceLy: 13000000,
    distanceDesc: '13 Million light-years',
    massSolar: '1 Trillion M☉',
    diameterDesc: '60,000 light-years',
    color: '#f43f5e',
    size: 4.8,
    cosmicPos: scaleCosmicLy(13000000, -2.1, -0.45),
    description: 'Fifth-brightest galaxy in the night sky; a violent post-merger galaxy ejecting gigantic relativistic radio and X-ray jets.',
    astrophysicsFacts: [
      'One of the closest radio galaxies to Earth, emitting powerful synchrotron radiation.',
      'Bisected by a dense, warped dust lane resulting from a major galactic collision ~200 million years ago.',
      'Central black hole mass measured at 55 million M☉.',
    ],
  },

  // ==========================================
  // 2. BLACK HOLES & QUASARS
  // ==========================================
  {
    id: 'bh-sagittarius-a',
    name: 'Sagittarius A* (Sgr A*)',
    category: 'black_hole',
    subType: 'Supermassive Black Hole',
    distanceLy: 26000,
    distanceDesc: '26,000 light-years',
    massSolar: '4.3 Million M☉',
    diameterDesc: 'Event Horizon: 24 Million km (~17 Sun diameters)',
    color: '#f59e0b',
    size: 3.8,
    cosmicPos: scaleCosmicLy(26000, 3.14, -0.1),
    description: 'The supermassive black hole anchoring the center of our Milky Way galaxy, directly imaged by the Event Horizon Telescope in 2022.',
    astrophysicsFacts: [
      'Stars like S2 orbit Sgr A* at speeds up to 7,700 km/s (nearly 3% of the speed of light!).',
      'Its discovery and orbital verification won Reinhard Genzel and Andrea Ghez the 2020 Nobel Prize in Physics.',
      'Currently in a relatively quiet accretion state, feeding primarily on solar wind from nearby Wolf-Rayet stars.',
    ],
  },
  {
    id: 'bh-m87-star',
    name: 'M87* (Pōwehi)',
    category: 'black_hole',
    subType: 'Supermassive Black Hole',
    distanceLy: 53500000,
    distanceDesc: '53.5 Million light-years',
    massSolar: '6.5 Billion M☉',
    diameterDesc: 'Event Horizon: 38 Billion km (Larger than Pluto\'s orbit)',
    color: '#ea580c',
    size: 5.2,
    cosmicPos: scaleCosmicLy(53500000, 0.26, 0.46),
    description: 'The historic first black hole ever directly imaged in human history by the Event Horizon Telescope in April 2019.',
    astrophysicsFacts: [
      'Its shadow is surrounded by a glowing ring of magnetized plasma swirling at relativistic speeds.',
      'Powers a colossal relativistic jet ejecting matter out across intergalactic space.',
      'Its event horizon has a circumference of ~120 billion km.',
    ],
  },
  {
    id: 'bh-ton-618',
    name: 'TON 618',
    category: 'black_hole',
    subType: 'Ultramassive Black Hole / Quasar',
    distanceLy: 10400000000,
    distanceDesc: '10.4 Billion light-years (z = 2.219)',
    massSolar: '66 Billion M☉',
    diameterDesc: 'Schwarzschild Radius: 390 Billion km (~2,600 AU)',
    redshift: 2.219,
    color: '#8b5cf6',
    size: 6.5,
    cosmicPos: scaleCosmicLy(10400000000, 1.15, 0.65),
    description: 'One of the most gargantuan ultramassive black holes known in existence, outshining its host galaxy with the luminosity of 140 trillion Suns.',
    astrophysicsFacts: [
      'Its event horizon is over 40 times wider than the entire orbit of Neptune.',
      'Light took 10.4 billion years to reach us; we view it during cosmic noon.',
      'Accretion disk radiates immense electromagnetic radiation from infrared to hard X-rays.',
    ],
  },
  {
    id: 'bh-cygnus-x1',
    name: 'Cygnus X-1',
    category: 'black_hole',
    subType: 'Stellar-Mass Black Hole Binary',
    distanceLy: 7200,
    distanceDesc: '7,200 light-years',
    massSolar: '21.2 M☉',
    diameterDesc: 'Event Horizon: ~125 km',
    color: '#06b6d4',
    size: 2.8,
    cosmicPos: scaleCosmicLy(7200, -0.65, 0.25),
    description: 'The first widely accepted black hole candidate discovered in astronomy (1964), pulling stellar material from companion blue supergiant HDE 226868.',
    astrophysicsFacts: [
      'Subject of a famous 1974 friendly wager between Stephen Hawking and Kip Thorne.',
      'The black hole spins at over 95% of the theoretical speed-of-light maximum.',
      'Generates intense relativistic X-ray emissions as in-falling gas reaches millions of Kelvin.',
    ],
  },
  {
    id: 'bh-v404-cygni',
    name: 'V404 Cygni',
    category: 'black_hole',
    subType: 'Microquasar Black Hole',
    distanceLy: 7800,
    distanceDesc: '7,800 light-years',
    massSolar: '9.0 M☉',
    diameterDesc: 'Event Horizon: ~54 km',
    color: '#ec4899',
    size: 2.6,
    cosmicPos: scaleCosmicLy(7800, -0.55, 0.38),
    description: 'A microquasar binary displaying rapid, violent flaring as its misaligned relativistic jets precess in minutes due to frame dragging.',
    astrophysicsFacts: [
      'Frame-dragging (Lense-Thirring precession) warps the inner accretion disk into a wobbling vortex.',
      'Undergoes violent outburst cycles documented in 1938, 1956, 1989, and 2015.',
      'Emits high-energy gamma rays during sudden mass-transfer accretion surges.',
    ],
  },
  {
    id: 'bh-gaia-bh1',
    name: 'Gaia BH1',
    category: 'black_hole',
    subType: 'Dormant Stellar-Mass Black Hole',
    distanceLy: 1560,
    distanceDesc: '1,560 light-years',
    massSolar: '9.62 M☉',
    diameterDesc: 'Event Horizon: ~57 km',
    color: '#64748b',
    size: 2.4,
    cosmicPos: scaleCosmicLy(1560, 2.8, -0.15),
    description: 'The closest known black hole to Earth, discovered by ESA\'s Gaia astrometric spacecraft orbiting a Sun-like star at 1.4 AU.',
    astrophysicsFacts: [
      'Completely dormant and dark; discovered purely through gravitational wobble of its companion.',
      'Its separation from its companion challenges binary star evolution models.',
      'Proves that a vast population of quiet, non-accreting black holes exists throughout our galaxy.',
    ],
  },

  // ==========================================
  // 3. DEAD & DYING STARS
  // ==========================================
  {
    id: 'star-crab-pulsar',
    name: 'Crab Nebula & Pulsar (M1)',
    category: 'dead_star',
    subType: 'Supernova Remnant & Neutron Star Pulsar',
    distanceLy: 6500,
    distanceDesc: '6,500 light-years',
    massSolar: '1.4 M☉ (Core) / 4.6 M☉ (Nebula)',
    diameterDesc: 'Nebula: 11 light-years | Pulsar: 20 km',
    color: '#22d3ee',
    size: 3.4,
    cosmicPos: scaleCosmicLy(6500, -2.4, 0.12),
    description: 'Supernova remnant from SN 1054 recorded by Chinese and Arab astronomers, housing a neutron star spinning 30 times every second.',
    astrophysicsFacts: [
      'The central pulsar (PSR B0531+21) has an ultra-dense density: a single teaspoon weighs over 1 billion tons.',
      'Acts as a cosmic particle accelerator powering synchrotron radiation across all wavelengths.',
      'The outer gaseous filament shell is expanding outwards at 1,500 km/s.',
    ],
  },
  {
    id: 'star-betelgeuse',
    name: 'Betelgeuse (α Orionis)',
    category: 'dead_star',
    subType: 'Dying Red Supergiant (Pre-Supernova)',
    distanceLy: 642,
    distanceDesc: '642 light-years',
    massSolar: '16.5–19 M☉',
    diameterDesc: '1.2 Billion km (~880 Sun diameters, engulfs Jupiter)',
    color: '#ef4444',
    size: 3.6,
    cosmicPos: scaleCosmicLy(642, -1.8, 0.08),
    description: 'Colossal dying red supergiant in Orion on the threshold of core collapse; when it detonates as a supernova, it will outshine the full Moon.',
    astrophysicsFacts: [
      'Experienced the "Great Dimming" in 2019-2020 caused by a colossal surface mass ejection forming dust.',
      'Has exhausted core hydrogen and is currently fusing heavier elements in concentric burning shells.',
      'Expected core-collapse supernova within the next 100,000 years.',
    ],
  },
  {
    id: 'star-eta-carinae',
    name: 'Eta Carinae',
    category: 'dead_star',
    subType: 'Luminous Blue Variable / Pre-Hypernova',
    distanceLy: 7500,
    distanceDesc: '7,500 light-years',
    massSolar: '100–120 M☉ (Primary) + 30 M☉ (Secondary)',
    diameterDesc: 'Homunculus Nebula: 0.5 light-years',
    color: '#f97316',
    size: 3.8,
    cosmicPos: scaleCosmicLy(7500, 2.65, -0.58),
    description: 'Extremely volatile hypergiant binary system that erupted in the 1843 "Great Eruption", generating the bipolar Homunculus Nebula.',
    astrophysicsFacts: [
      'Luminosity is over 5 million times that of the Sun.',
      'A prime candidate for a future pair-instability supernova or gamma-ray burst progenitor.',
      'Constantly exceeds the Eddington luminosity limit, blowing off stellar winds at 2,000 km/s.',
    ],
  },
  {
    id: 'star-helix-nebula',
    name: 'Helix Nebula (NGC 7293)',
    category: 'dead_star',
    subType: 'Planetary Nebula ("Eye of God")',
    distanceLy: 655,
    distanceDesc: '655 light-years',
    massSolar: 'White Dwarf: 0.7 M☉',
    diameterDesc: '5.7 light-years across',
    color: '#06b6d4',
    size: 3.5,
    cosmicPos: scaleCosmicLy(655, 0.9, -0.32),
    description: 'One of the closest and most spectacular planetary nebulae to Earth, formed when an intermediate-mass dying star shed its glowing outer envelopes.',
    astrophysicsFacts: [
      'The central core has collapsed into a hot white dwarf with a surface temperature exceeding 120,000 K.',
      'Gaseous ring expands into interstellar space at 40 km/s.',
      'Represents the future fate of our own Sun in approximately 5 billion years.',
    ],
  },
  {
    id: 'star-ring-nebula',
    name: 'Ring Nebula (M57)',
    category: 'dead_star',
    subType: 'Planetary Nebula',
    distanceLy: 2570,
    distanceDesc: '2,570 light-years',
    massSolar: 'Central White Dwarf: 0.61 M☉',
    diameterDesc: '2.6 light-years',
    color: '#10b981',
    size: 3.2,
    cosmicPos: scaleCosmicLy(2570, -0.45, 0.48),
    description: 'Classic smoke-ring shaped barrel nebula illuminated by intense ultraviolet radiation from its dead core white dwarf.',
    astrophysicsFacts: [
      'Discovered in 1779 by French astronomers Antoine Darquier de Pellepoix and Charles Messier.',
      'Inner blue-green glow is caused by doubly-ionized oxygen [O III], and outer red boundary by hydrogen alpha [H-α].',
      'Age estimated at approximately 4,000 to 7,000 years.',
    ],
  },
  {
    id: 'star-sirius-b',
    name: 'Sirius B ("The Pup")',
    category: 'dead_star',
    subType: 'Degenerate White Dwarf',
    distanceLy: 8.6,
    distanceDesc: '8.6 light-years',
    massSolar: '1.02 M☉ (Carbon-Oxygen degenerate core)',
    diameterDesc: '12,000 km (Slightly smaller than Earth)',
    color: '#93c5fd',
    size: 2.2,
    cosmicPos: scaleCosmicLy(8.6, -1.95, -0.22),
    description: 'The closest white dwarf star to Earth, packing an entire solar mass into a degenerate sphere roughly the volume of Earth.',
    astrophysicsFacts: [
      'Discovered in 1862 by Alvan Graham Clark; supported entirely by electron degeneracy pressure.',
      'Surface gravity is 350,000 times stronger than Earth\'s; escape velocity is 5,200 km/s.',
      'Its immense gravitational field provided one of the first observational proofs of gravitational redshift.',
    ],
  },
  {
    id: 'star-sgr-1806',
    name: 'Magnetar SGR 1806-20',
    category: 'dead_star',
    subType: 'Ultra-Magnetic Neutron Star (Magnetar)',
    distanceLy: 50000,
    distanceDesc: '50,000 light-years',
    massSolar: '1.5 M☉',
    diameterDesc: '20 km',
    color: '#f43f5e',
    size: 3.0,
    cosmicPos: scaleCosmicLy(50000, 3.05, -0.05),
    description: 'Ultra-dense neutron star with a magnetic field exceeding 10¹⁵ Gauss (100 billion Tesla), capable of destroying matter at atomic scale.',
    astrophysicsFacts: [
      'In December 2004, a starquake released more energy in 0.1 seconds than the Sun produces in 150,000 years!',
      'The giant gamma flare physically altered Earth\'s upper ionosphere from 50,000 light-years away.',
      'Its magnetic field is so fierce that it would tear atoms into needle-thin cylinders at 1,000 km distance.',
    ],
  },

  // ==========================================
  // 4. WORMHOLES & THEORETICAL SPACETIME BRIDGES
  // ==========================================
  {
    id: 'wormhole-einstein-rosen',
    name: 'Einstein-Rosen Bridge (Nexus Alpha)',
    category: 'wormhole',
    subType: 'Topological Spacetime Shortcut (General Relativity)',
    distanceLy: 4500000,
    distanceDesc: 'Intergalactic Topology Nexus',
    diameterDesc: 'Throat Radius: ~15,000 km',
    color: '#c084fc',
    size: 4.5,
    cosmicPos: scaleCosmicLy(4500000, -0.85, -0.35),
    description: 'A theoretical geometric tunnel through four-dimensional spacetime connecting two distant regions of the cosmos, predicted by Albert Einstein and Nathan Rosen in 1935.',
    astrophysicsFacts: [
      'Derived directly from Schwarzschild geometry solutions: ds² = -(1 - 2M/r)dt² + (1 - 2M/r)⁻¹dr² + r²dΩ².',
      'Non-traversable without negative energy: the throat pinches shut faster than light can cross.',
      'Under quantum entanglement (ER = EPR conjecture), wormholes may be the geometric manifestation of entangled particles.',
    ],
  },
  {
    id: 'wormhole-morris-thorne',
    name: 'Morris-Thorne Traversable Wormhole',
    category: 'wormhole',
    subType: 'Traversable Lorentzian Wormhole',
    distanceLy: 8500000,
    distanceDesc: 'Deep Spacetime Throat',
    diameterDesc: 'Throat Diameter: 100 km',
    color: '#a855f7',
    size: 4.6,
    cosmicPos: scaleCosmicLy(8500000, 1.45, 0.42),
    description: 'A theoretical traversable wormhole engineered with exotic matter possessing negative mass-energy density, enabling instantaneous interstellar transit.',
    astrophysicsFacts: [
      'Proposed by Michael Morris and Kip Thorne in 1988 as a physically traversable spacetime conduit.',
      'Requires violation of the Null Energy Condition (NEC): T_μν k^μ k^ν < 0.',
      'Can theoretically be converted into a closed timelike curve (time machine) by accelerating one throat.',
    ],
  },
  {
    id: 'wormhole-kerr-ring',
    name: 'Kerr Ring Singularity Portal',
    category: 'wormhole',
    subType: 'Rotating Spacetime Gateway',
    distanceLy: 12000000,
    distanceDesc: 'Ergosphere Singularity Gateway',
    diameterDesc: 'Ring Radius: ~250 km',
    color: '#e879f9',
    size: 4.2,
    cosmicPos: scaleCosmicLy(12000000, -2.45, 0.38),
    description: 'The ring-shaped singularity inside a spinning Kerr black hole; mathematically, passing through the ring opens into an antigravity timelike spacetime continuum.',
    astrophysicsFacts: [
      'Discovered by Roy Kerr in 1963 as the exact vacuum solution for rotating massive bodies.',
      'Surrounded by two event horizons and an outer ergosphere where spacetime itself is dragged faster than light.',
      'Inside the inner Cauchy horizon, geodesic paths allow passage through the ring without hitting infinite density.',
    ],
  },

  // ==========================================
  // 5. OBSERVABLE UNIVERSE BOUNDARY
  // ==========================================
  {
    id: 'cosmos-cmb-horizon',
    name: 'Cosmic Microwave Background (CMB)',
    category: 'galaxy',
    subType: 'Observable Universe Horizon',
    distanceLy: 46500000000,
    distanceDesc: '46.5 Billion light-years (Cosmic Edge)',
    redshift: 1089,
    temperatureK: 2.7255,
    color: '#f43f5e',
    size: 8.0,
    cosmicPos: scaleCosmicLy(46500000000, 0, 0),
    description: 'The ancient thermal echo of the Big Bang; the oldest electromagnetic radiation in the universe, released 380,000 years after creation.',
    astrophysicsFacts: [
      'Defines the outer observable boundary of our cosmic horizon, now expanded to a co-moving radius of 46.5 billion light-years.',
      'Thermal blackbody temperature measured at 2.7255 Kelvin with microscopic quantum fluctuations of ~1 part in 100,000.',
      'Those primordial density ripples seeded all galaxies, clusters, and filaments in the cosmic web today.',
    ],
  },
];

/**
 * Converts a CosmicObject into a full SkyObject for selection & DetailDrawer
 */
export function cosmicToSkyObject(c: CosmicObject): SkyObject {
  return {
    id: c.id,
    name: c.name,
    type: (c.category === 'galaxy'
      ? 'galaxy'
      : c.category === 'black_hole'
      ? 'black_hole'
      : c.category === 'wormhole'
      ? 'wormhole'
      : 'dead_star') as any,
    azimuth: Number(((c.cosmicPos.x + 180) % 360).toFixed(1)),
    altitude: Number(((c.cosmicPos.y / 2) % 90).toFixed(1)),
    distanceLy: c.distanceLy,
    distanceKm: c.distanceLy * 9.461e12,
    massSolar: c.massSolar,
    redshift: c.redshift,
    color: c.color,
    size: c.size,
    description: `[${c.subType} • Distance: ${c.distanceDesc}${c.massSolar ? ` • Mass: ${c.massSolar}` : ''}] ${c.description}`,
  };
}
