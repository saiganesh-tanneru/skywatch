import { describe, it, expect, beforeEach } from 'vitest';
import { useSkyStore, DEFAULT_LOCATIONS, saveLocationToStorage, loadSavedLocation } from '../useSkyStore';
import { ObserverLocation } from '../../types';

describe('useSkyStore - Location Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads location from localStorage correctly', () => {
    const testLocation: ObserverLocation = {
      name: 'Philadelphia, PA',
      latitude: 39.9526,
      longitude: -75.1652,
      elevationMeters: 12,
      source: 'manual',
      updatedAt: Date.now(),
    };

    saveLocationToStorage(testLocation);
    const loaded = loadSavedLocation();

    expect(loaded).not.toBeNull();
    expect(loaded?.name).toBe('Philadelphia, PA');
    expect(loaded?.latitude).toBe(39.9526);
    expect(loaded?.longitude).toBe(-75.1652);
    expect(loaded?.source).toBe('manual');
  });

  it('updates store state and persists when setLocation is called', () => {
    const preset = DEFAULT_LOCATIONS[1]; // New York
    useSkyStore.getState().setLocation(preset);

    const currentState = useSkyStore.getState().location;
    expect(currentState.latitude).toBe(preset.latitude);
    expect(currentState.longitude).toBe(preset.longitude);

    const persisted = loadSavedLocation();
    expect(persisted?.latitude).toBe(preset.latitude);
  });

  it('handles time scrubbing and resets to live now', () => {
    const store = useSkyStore.getState();
    expect(store.timeOffsetSeconds).toBe(0);

    store.setTimeOffsetSeconds(7200); // +2 hours
    expect(useSkyStore.getState().timeOffsetSeconds).toBe(7200);
    expect(useSkyStore.getState().isLive).toBe(false);

    store.resetToNow();
    expect(useSkyStore.getState().timeOffsetSeconds).toBe(0);
    expect(useSkyStore.getState().isLive).toBe(true);
  });

  it('manages viewMode transitions and object selection', () => {
    const store = useSkyStore.getState();
    store.setViewMode('2d');
    expect(useSkyStore.getState().viewMode).toBe('2d');

    store.setViewMode('globe');
    expect(useSkyStore.getState().viewMode).toBe('globe');

    store.setViewMode('solar');
    expect(useSkyStore.getState().viewMode).toBe('solar');

    // Selecting an object opens the drawer
    store.setSelectedObject({
      id: 'iss-test',
      name: 'ISS (ZARYA)',
      type: 'satellite',
      azimuth: 180,
      altitude: 45,
    });

    expect(useSkyStore.getState().selectedObject?.name).toBe('ISS (ZARYA)');
    expect(useSkyStore.getState().isDetailDrawerOpen).toBe(true);

    // Closing the drawer clears selection
    store.setDetailDrawerOpen(false);
    expect(useSkyStore.getState().isDetailDrawerOpen).toBe(false);
    expect(useSkyStore.getState().selectedObject).toBeNull();
  });

  it('toggles filters and satellite groups', () => {
    const store = useSkyStore.getState();
    expect(store.filters.satellites).toBe(true);

    store.setFilter('satellites', false);
    expect(useSkyStore.getState().filters.satellites).toBe(false);

    store.toggleSatelliteGroup('starlink');
    expect(useSkyStore.getState().filters.satelliteGroups.starlink).toBe(true);

    store.setSearchQuery('Hubble');
    expect(useSkyStore.getState().filters.searchQuery).toBe('Hubble');
  });

  it('manages timeline slider visibility toggle', () => {
    const store = useSkyStore.getState();
    expect(store.isTimeSliderVisible).toBe(true);

    store.setTimeSliderVisible(false);
    expect(useSkyStore.getState().isTimeSliderVisible).toBe(false);

    store.toggleTimeSlider();
    expect(useSkyStore.getState().isTimeSliderVisible).toBe(true);

    store.toggleTimeSlider();
    expect(useSkyStore.getState().isTimeSliderVisible).toBe(false);
  });

  it('supports category isolation (solo) and select/deselect all across view sections', () => {
    const store = useSkyStore.getState();

    // 1. Solar View Isolation
    store.setViewMode('solar');
    store.isolateCategory('asteroids', 'solar');
    const solarFilters = useSkyStore.getState().filters;
    expect(solarFilters.asteroids).toBe(true);
    expect(solarFilters.beltBoulders).toBe(true);
    expect(solarFilters.planets).toBe(false);
    expect(solarFilters.sun).toBe(false);
    expect(solarFilters.meteors).toBe(false);

    // Select all for solar
    store.selectAllForView('solar');
    expect(useSkyStore.getState().filters.planets).toBe(true);
    expect(useSkyStore.getState().filters.sun).toBe(true);
    expect(useSkyStore.getState().filters.asteroids).toBe(true);

    // Deselect all for solar
    store.deselectAllForView('solar');
    expect(useSkyStore.getState().filters.planets).toBe(false);
    expect(useSkyStore.getState().filters.sun).toBe(false);
    expect(useSkyStore.getState().filters.asteroids).toBe(false);

    // 2. Universe View Isolation
    store.setViewMode('universe');
    store.isolateCategory('blackHoles', 'universe');
    const univFilters = useSkyStore.getState().filters;
    expect(univFilters.blackHoles).toBe(true);
    expect(univFilters.galaxies).toBe(false);
    expect(univFilters.wormholes).toBe(false);
    expect(univFilters.deadStars).toBe(false);

    // Select all for universe
    store.selectAllForView('universe');
    expect(useSkyStore.getState().filters.galaxies).toBe(true);
    expect(useSkyStore.getState().filters.blackHoles).toBe(true);
    expect(useSkyStore.getState().filters.wormholes).toBe(true);

    // 3. Milky Way View Isolation & Select All
    store.setViewMode('milkyway');
    store.isolateCategory('mwCore', 'milkyway');
    const mwFilters = useSkyStore.getState().filters;
    expect(mwFilters.mwCore).toBe(true);
    expect(mwFilters.mwArms).toBe(false);
    expect(mwFilters.mwStars).toBe(false);
    expect(mwFilters.mwNebulae).toBe(false);
    expect(mwFilters.mwClusters).toBe(false);

    // Select all for Milky Way
    store.selectAllForView('milkyway');
    expect(useSkyStore.getState().filters.mwCore).toBe(true);
    expect(useSkyStore.getState().filters.mwArms).toBe(true);
    expect(useSkyStore.getState().filters.mwStars).toBe(true);
    expect(useSkyStore.getState().filters.mwClusters).toBe(true);

    // Deselect all for Milky Way
    store.deselectAllForView('milkyway');
    expect(useSkyStore.getState().filters.mwCore).toBe(false);
    expect(useSkyStore.getState().filters.mwArms).toBe(false);
  });
});
