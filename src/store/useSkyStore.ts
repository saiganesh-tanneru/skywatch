import { create } from 'zustand';
import { ObserverLocation, SkyObject, ViewMode, FilterState, SatelliteGroup } from '../types';

const LOCATION_STORAGE_KEY = 'skywatch_observer_location';

export const DEFAULT_LOCATIONS: ObserverLocation[] = [
  {
    name: 'Greenwich, UK',
    latitude: 51.4769,
    longitude: 0.0005,
    elevationMeters: 46,
    source: 'preset',
    updatedAt: Date.now(),
  },
  {
    name: 'New York, USA',
    latitude: 40.7128,
    longitude: -74.006,
    elevationMeters: 10,
    source: 'preset',
    updatedAt: Date.now(),
  },
  {
    name: 'San Francisco, USA',
    latitude: 37.7749,
    longitude: -122.4194,
    elevationMeters: 16,
    source: 'preset',
    updatedAt: Date.now(),
  },
  {
    name: 'Tokyo, Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    elevationMeters: 40,
    source: 'preset',
    updatedAt: Date.now(),
  },
  {
    name: 'Sydney, Australia',
    latitude: -33.8688,
    longitude: 151.2093,
    elevationMeters: 19,
    source: 'preset',
    updatedAt: Date.now(),
  },
  {
    name: 'Bengaluru, India',
    latitude: 12.9716,
    longitude: 77.5946,
    elevationMeters: 920,
    source: 'preset',
    updatedAt: Date.now(),
  },
  {
    name: 'Paris, France',
    latitude: 48.8566,
    longitude: 2.3522,
    elevationMeters: 35,
    source: 'preset',
    updatedAt: Date.now(),
  },
  {
    name: 'Honolulu, USA',
    latitude: 21.3069,
    longitude: -157.8583,
    elevationMeters: 6,
    source: 'preset',
    updatedAt: Date.now(),
  },
];

export function loadSavedLocation(): ObserverLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ObserverLocation;
    if (
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number' &&
      !isNaN(parsed.latitude) &&
      !isNaN(parsed.longitude)
    ) {
      return parsed;
    }
  } catch (err) {
    console.warn('[SkyStore] Could not parse saved location:', err);
  }
  return null;
}

export function saveLocationToStorage(location: ObserverLocation): void {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch (err) {
    console.warn('[SkyStore] Failed to save location to storage:', err);
  }
}

interface SkyState {
  // Location
  location: ObserverLocation;
  isLocationModalOpen: boolean;
  locationError: string | null;
  setLocation: (loc: ObserverLocation) => void;
  setLocationModalOpen: (open: boolean) => void;
  setLocationError: (error: string | null) => void;

  // Time & Simulation
  timeOffsetSeconds: number; // offset from real time
  isLive: boolean; // true if running at 1s real-time tick
  setTimeOffsetSeconds: (offset: number) => void;
  resetToNow: () => void;
  setLive: (live: boolean) => void;
  isTimeSliderVisible: boolean;
  setTimeSliderVisible: (visible: boolean) => void;
  toggleTimeSlider: () => void;

  // View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Selection & Inspector
  selectedObject: SkyObject | null;
  setSelectedObject: (obj: SkyObject | null) => void;
  isDetailDrawerOpen: boolean;
  setDetailDrawerOpen: (open: boolean) => void;

  // Active Panel Overlays
  activePanel: 'passes' | 'asteroids' | 'meteors' | null;
  setActivePanel: (panel: 'passes' | 'asteroids' | 'meteors' | null) => void;

  // Filters
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  toggleSatelliteGroup: (group: SatelliteGroup) => void;
  setSearchQuery: (query: string) => void;
  isolateCategory: (category: keyof FilterState, viewMode?: ViewMode) => void;
  selectAllForView: (viewMode?: ViewMode) => void;
  deselectAllForView: (viewMode?: ViewMode) => void;
}

const defaultSaved = loadSavedLocation();

export const useSkyStore = create<SkyState>((set) => ({
  location: defaultSaved || DEFAULT_LOCATIONS[0],
  isLocationModalOpen: false,
  locationError: null,

  setLocation: (loc: ObserverLocation) => {
    saveLocationToStorage(loc);
    set({ location: loc, locationError: null });
  },

  setLocationModalOpen: (open: boolean) => set({ isLocationModalOpen: open }),
  setLocationError: (error: string | null) => set({ locationError: error }),

  timeOffsetSeconds: 0,
  isLive: true,
  setTimeOffsetSeconds: (offset: number) =>
    set({ timeOffsetSeconds: offset, isLive: offset === 0 }),
  resetToNow: () => set({ timeOffsetSeconds: 0, isLive: true }),
  setLive: (live: boolean) => set({ isLive: live }),

  isTimeSliderVisible: true,
  setTimeSliderVisible: (visible: boolean) => set({ isTimeSliderVisible: visible }),
  toggleTimeSlider: () => set((state) => ({ isTimeSliderVisible: !state.isTimeSliderVisible })),

  viewMode: '3d',
  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  selectedObject: null,
  setSelectedObject: (obj: SkyObject | null) =>
    set({
      selectedObject: obj,
      isDetailDrawerOpen: obj !== null,
    }),
  isDetailDrawerOpen: false,
  setDetailDrawerOpen: (open: boolean) =>
    set((state) => ({
      isDetailDrawerOpen: open,
      selectedObject: open ? state.selectedObject : null,
    })),

  activePanel: null,
  setActivePanel: (panel) =>
    set((state) => ({ activePanel: state.activePanel === panel ? null : panel })),

  filters: {
    satellites: true,
    sun: true,
    moon: true,
    planets: true,
    stars: true,
    asteroids: true,
    meteors: true,
    orbits: true,
    probes: true,
    beltBoulders: true,
    galaxies: true,
    blackHoles: true,
    deadStars: true,
    wormholes: true,
    cosmicHorizon: true,
    mwCore: true,
    mwArms: true,
    mwStars: true,
    mwNebulae: true,
    mwClusters: true,
    mwBlackHoles: true,
    mwExoplanets: true,
    mwFermiBubbles: true,
    satelliteGroups: {
      visual: true,
      stations: true,
      active: false,
      starlink: false,
    },
    searchQuery: '',
    minAltitude: 0,
  },

  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),

  toggleSatelliteGroup: (group: SatelliteGroup) =>
    set((state) => ({
      filters: {
        ...state.filters,
        satelliteGroups: {
          ...state.filters.satelliteGroups,
          [group]: !state.filters.satelliteGroups[group],
        },
      },
    })),

  setSearchQuery: (query: string) =>
    set((state) => ({
      filters: {
        ...state.filters,
        searchQuery: query,
      },
    })),

  isolateCategory: (category: keyof FilterState, viewMode?: ViewMode) =>
    set((state) => {
      const mode = viewMode || state.viewMode;
      const f = { ...state.filters };

      if (mode === 'solar') {
        const solarKeys: (keyof FilterState)[] = [
          'sun',
          'planets',
          'moon',
          'satellites',
          'probes',
          'asteroids',
          'beltBoulders',
          'meteors',
          'orbits',
        ];
        solarKeys.forEach((k) => {
          (f[k] as any) = k === category;
        });
        if (category === 'satellites' || category === 'probes') {
          f.satellites = true;
          f.probes = true;
        }
        if (category === 'asteroids' || category === 'beltBoulders') {
          f.asteroids = true;
          f.beltBoulders = true;
        }
      } else if (mode === 'universe') {
        const universeKeys: (keyof FilterState)[] = [
          'galaxies',
          'blackHoles',
          'deadStars',
          'wormholes',
          'cosmicHorizon',
        ];
        universeKeys.forEach((k) => {
          (f[k] as any) = k === category;
        });
      } else if (mode === 'milkyway') {
        const mwKeys: (keyof FilterState)[] = [
          'mwCore',
          'mwArms',
          'mwStars',
          'mwNebulae',
          'mwClusters',
          'mwBlackHoles',
          'mwExoplanets',
          'mwFermiBubbles',
        ];
        mwKeys.forEach((k) => {
          (f[k] as any) = k === category;
        });
      } else if (mode === 'globe') {
        f.satelliteGroups = {
          stations: category === ('stations' as any),
          visual: category === ('visual' as any),
          active: category === ('active' as any),
          starlink: category === ('starlink' as any),
        };
        f.satellites = true;
      } else {
        const domeKeys: (keyof FilterState)[] = [
          'satellites',
          'planets',
          'moon',
          'sun',
          'stars',
          'asteroids',
          'meteors',
        ];
        domeKeys.forEach((k) => {
          (f[k] as any) = k === category;
        });
      }

      return { filters: f };
    }),

  selectAllForView: (viewMode?: ViewMode) =>
    set((state) => {
      const mode = viewMode || state.viewMode;
      const f = { ...state.filters };

      if (mode === 'solar') {
        f.sun = true;
        f.planets = true;
        f.moon = true;
        f.satellites = true;
        f.probes = true;
        f.asteroids = true;
        f.beltBoulders = true;
        f.meteors = true;
        f.orbits = true;
      } else if (mode === 'universe') {
        f.galaxies = true;
        f.blackHoles = true;
        f.deadStars = true;
        f.wormholes = true;
        f.cosmicHorizon = true;
      } else if (mode === 'milkyway') {
        f.mwCore = true;
        f.mwArms = true;
        f.mwStars = true;
        f.mwNebulae = true;
        f.mwClusters = true;
        f.mwBlackHoles = true;
        f.mwExoplanets = true;
        f.mwFermiBubbles = true;
      } else if (mode === 'globe') {
        f.satellites = true;
        f.satelliteGroups = {
          stations: true,
          visual: true,
          active: true,
          starlink: true,
        };
      } else {
        f.satellites = true;
        f.sun = true;
        f.moon = true;
        f.planets = true;
        f.stars = true;
        f.asteroids = true;
        f.meteors = true;
      }

      return { filters: f };
    }),

  deselectAllForView: (viewMode?: ViewMode) =>
    set((state) => {
      const mode = viewMode || state.viewMode;
      const f = { ...state.filters };

      if (mode === 'solar') {
        f.sun = false;
        f.planets = false;
        f.moon = false;
        f.satellites = false;
        f.probes = false;
        f.asteroids = false;
        f.beltBoulders = false;
        f.meteors = false;
        f.orbits = false;
      } else if (mode === 'universe') {
        f.galaxies = false;
        f.blackHoles = false;
        f.deadStars = false;
        f.wormholes = false;
        f.cosmicHorizon = false;
      } else if (mode === 'milkyway') {
        f.mwCore = false;
        f.mwArms = false;
        f.mwStars = false;
        f.mwNebulae = false;
        f.mwClusters = false;
        f.mwBlackHoles = false;
        f.mwExoplanets = false;
        f.mwFermiBubbles = false;
      } else if (mode === 'globe') {
        f.satellites = false;
        f.satelliteGroups = {
          stations: false,
          visual: false,
          active: false,
          starlink: false,
        };
      } else {
        f.satellites = false;
        f.sun = false;
        f.moon = false;
        f.planets = false;
        f.stars = false;
        f.asteroids = false;
        f.meteors = false;
      }

      return { filters: f };
    }),
}));
