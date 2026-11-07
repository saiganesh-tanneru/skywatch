export type SkyObjectType =
  | 'satellite'
  | 'sun'
  | 'moon'
  | 'planet'
  | 'star'
  | 'galaxy'
  | 'black_hole'
  | 'wormhole'
  | 'dead_star'
  | 'nebula'
  | 'quasar'
  | 'asteroid';

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  elevationMeters: number;
  name: string;
  source: 'gps' | 'manual' | 'preset' | 'default' | 'ip';
  updatedAt: number;
}

export interface CelestialCoordinates {
  azimuth: number; // 0 to 360 degrees (0 = North, 90 = East, 180 = South, 270 = West)
  altitude: number; // -90 to +90 degrees (0 = horizon, 90 = zenith)
  distanceKm?: number;
  distanceLy?: number; // Distance in Light Years
  massSolar?: string; // Mass in solar masses (M☉)
  redshift?: number; // Cosmological redshift z
  velocityKmS?: number;
  ra?: number; // right ascension in hours or degrees
  dec?: number; // declination in degrees
  ecfX?: number; // Earth-centered fixed X coordinate (km)
  ecfY?: number; // Earth-centered fixed Y coordinate (km)
  ecfZ?: number; // Earth-centered fixed Z coordinate (km)
  subLat?: number; // Sub-satellite latitude (-90 to 90)
  subLon?: number; // Sub-satellite longitude (-180 to 180)
  altKm?: number; // Orbital altitude above sea level (km)
  helioX?: number; // Heliocentric X coordinate (AU)
  helioY?: number; // Heliocentric Y coordinate (AU)
  helioZ?: number; // Heliocentric Z coordinate (AU)
  cosmicX?: number; // Cosmic scaled coordinates
  cosmicY?: number;
  cosmicZ?: number;
}

export interface SkyObject extends CelestialCoordinates {
  id: string;
  name: string;
  type: SkyObjectType;
  magnitude?: number;
  description?: string;
  color?: string;
  size?: number;
  category?: string;
  noradId?: number;
  line1?: string;
  line2?: string;
  spectralType?: string;
  diameterKm?: number;
  orbitClass?: string;
  missions?: string[];
  imageUrl?: string;
}

export type SatelliteGroup = 'stations' | 'visual' | 'active' | 'starlink';

export interface SatellitePass {
  satelliteId: string;
  satelliteName: string;
  noradId?: number;
  riseTime: Date;
  peakTime: Date;
  setTime: Date;
  maxAltitude: number; // degrees
  startAzimuth: number; // degrees
  peakAzimuth: number; // degrees
  endAzimuth: number; // degrees
  durationSeconds: number;
  visible: boolean;
}

export interface NearEarthAsteroid {
  id: string;
  name: string;
  estimatedDiameterMinM: number;
  estimatedDiameterMaxM: number;
  isPotentiallyHazardous: boolean;
  closeApproachDate: string;
  missDistanceKm: number;
  missDistanceLunar: number;
  relativeVelocityKmH: number;
  absoluteMagnitude: number;
}

export interface MeteorShower {
  id: string;
  name: string;
  peakDate: string; // e.g. "Aug 12-13"
  zhr: number; // Zenithal Hourly Rate
  radiantConstellation: string;
  velocityKmS: number;
  parentBody: string;
  peakMonth: number; // 1-12
  peakDay: number; // 1-31
}

export type ViewMode = '3d' | '2d' | 'globe' | 'solar' | 'universe' | 'milkyway';

export interface FilterState {
  satellites: boolean;
  sun: boolean;
  moon: boolean;
  planets: boolean;
  stars: boolean;
  asteroids: boolean;
  meteors: boolean;
  orbits: boolean;
  probes: boolean;
  beltBoulders: boolean;
  galaxies: boolean;
  blackHoles: boolean;
  deadStars: boolean;
  wormholes: boolean;
  cosmicHorizon: boolean;
  // Milky Way Galaxy filters
  mwCore: boolean;
  mwArms: boolean;
  mwStars: boolean;
  mwNebulae: boolean;
  mwClusters: boolean;
  mwBlackHoles: boolean;
  mwExoplanets: boolean;
  mwFermiBubbles: boolean;
  satelliteGroups: Record<SatelliteGroup, boolean>;
  searchQuery: string;
  minAltitude: number; // 0 = horizon
}
