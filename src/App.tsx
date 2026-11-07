import React, { useRef } from 'react';
import { useSkyStore } from './store/useSkyStore';
import { useGeolocation } from './hooks/useGeolocation';
import { useSkyObjects } from './hooks/useSkyObjects';
import { Header } from './components/Header';
import { LocationModal } from './components/LocationModal';
import { SkyDome3D, SkyDome3DRef } from './components/SkyDome3D';
import { SkyPolar2D } from './components/SkyPolar2D';
import { EarthGlobe3D, EarthGlobe3DRef } from './components/EarthGlobe3D';
import { SolarSystem3D, SolarSystem3DRef } from './components/SolarSystem3D';
import { Universe3D, Universe3DRef } from './components/Universe3D';
import { MilkyWay3D, MilkyWay3DRef } from './components/MilkyWay3D';
import { GoogleEarthLayers } from './components/GoogleEarthLayers';
import { GoogleEarthControls } from './components/GoogleEarthControls';
import { GoogleEarthStatusBar } from './components/GoogleEarthStatusBar';
import { TimeSlider } from './components/TimeSlider';
import { DetailDrawer } from './components/DetailDrawer';
import { PassesPanel } from './components/PassesPanel';
import { AsteroidsPanel } from './components/AsteroidsPanel';
import { MeteorShowerPanel } from './components/MeteorShowerPanel';
import { LoadingAlert } from './components/LoadingAlert';

export const App: React.FC = () => {
  const {
    isLocationModalOpen,
    setLocationModalOpen,
    viewMode,
    selectedObject,
    activePanel,
    setActivePanel,
  } = useSkyStore();

  const { isLocating, requestCurrentLocation } = useGeolocation();
  const {
    allObjects,
    satelliteCount,
    catalogCount,
    isSatellitesLoading,
    isDataLoading,
    loadingMessage,
    loadingSubMessage,
    lastUpdated,
  } = useSkyObjects();

  const domeRef = useRef<SkyDome3DRef>(null);
  const globeRef = useRef<EarthGlobe3DRef>(null);
  const solarRef = useRef<SolarSystem3DRef>(null);
  const milkywayRef = useRef<MilkyWay3DRef>(null);
  const universeRef = useRef<Universe3DRef>(null);

  const handleResetCamera = () => {
    if (viewMode === '3d') {
      domeRef.current?.resetNorth();
    } else if (viewMode === 'globe') {
      globeRef.current?.resetView();
    } else if (viewMode === 'solar') {
      solarRef.current?.resetView();
    } else if (viewMode === 'milkyway') {
      milkywayRef.current?.resetView();
    } else if (viewMode === 'universe') {
      universeRef.current?.resetView();
    }
  };

  const handleZoomIn = () => {
    if (viewMode === '3d') {
      domeRef.current?.zoomIn();
    } else if (viewMode === 'globe') {
      globeRef.current?.zoomIn();
    } else if (viewMode === 'solar') {
      solarRef.current?.zoomIn();
    } else if (viewMode === 'milkyway') {
      milkywayRef.current?.zoomIn();
    } else if (viewMode === 'universe') {
      universeRef.current?.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (viewMode === '3d') {
      domeRef.current?.zoomOut();
    } else if (viewMode === 'globe') {
      globeRef.current?.zoomOut();
    } else if (viewMode === 'solar') {
      solarRef.current?.zoomOut();
    } else if (viewMode === 'milkyway') {
      milkywayRef.current?.zoomOut();
    } else if (viewMode === 'universe') {
      universeRef.current?.zoomOut();
    }
  };

  const handleZoomToObject = () => {
    if (!selectedObject) return;
    if (viewMode === '3d') {
      domeRef.current?.zoomToObject(selectedObject);
    } else if (viewMode === 'globe') {
      globeRef.current?.zoomToObject(selectedObject);
    } else if (viewMode === 'solar') {
      solarRef.current?.zoomToObject(selectedObject);
    } else if (viewMode === 'milkyway') {
      milkywayRef.current?.zoomToObject(selectedObject);
    } else if (viewMode === 'universe') {
      universeRef.current?.zoomToObject(selectedObject);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-space-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <Header
        onOpenLocationModal={() => setLocationModalOpen(true)}
        isLocating={isLocating}
      />

      {/* Main Viewport Stage: 3D Dome vs 2D Polar vs Earth Orbit vs Solar System vs Vast Universe */}
      <main className="relative flex-1 w-full h-[calc(100vh-6rem)] overflow-hidden bg-space-950">
        {/* Global Fetching Loading Alert & Shimmer Beam */}
        <LoadingAlert
          isLoading={isDataLoading || isLocating}
          message={isLocating ? 'Locating Observer Position...' : loadingMessage}
          subMessage={isLocating ? 'Acquiring GPS / IP geolocation coordinates' : loadingSubMessage}
          loadedCount={allObjects.length}
        />

        {viewMode === '3d' && <SkyDome3D ref={domeRef} objects={allObjects} />}
        {viewMode === '2d' && <SkyPolar2D objects={allObjects} />}
        {viewMode === 'globe' && <EarthGlobe3D ref={globeRef} objects={allObjects} />}
        {viewMode === 'solar' && <SolarSystem3D ref={solarRef} objects={allObjects} />}
        {viewMode === 'milkyway' && <MilkyWay3D ref={milkywayRef} objects={allObjects} />}
        {viewMode === 'universe' && <Universe3D ref={universeRef} objects={allObjects} />}

        {/* Google Earth Floating Search & Satellite Layers */}
        <GoogleEarthLayers
          totalLoaded={catalogCount}
          totalVisible={satelliteCount}
          isLoading={isSatellitesLoading}
        />

        {/* Google Earth Navigation & Compass Controls */}
        {viewMode !== '2d' && (
          <GoogleEarthControls
            onResetNorth={handleResetCamera}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />
        )}

        {/* Object Detail Drawer (Zoom-in & Telemetry) */}
        <DetailDrawer onZoomToObject={handleZoomToObject} />

        {/* Time Slider (-2h to +48h simulation scrub with playback & "Now" reset) */}
        <TimeSlider />

        {/* Google Earth Bottom Telemetry Status Bar */}
        <GoogleEarthStatusBar
          lastUpdated={lastUpdated}
          visibleCount={allObjects.length}
          isLoading={isDataLoading}
        />

        {/* Feature Side Panels */}
        <PassesPanel
          isOpen={activePanel === 'passes'}
          onClose={() => setActivePanel(null)}
        />
        <AsteroidsPanel
          isOpen={activePanel === 'asteroids'}
          onClose={() => setActivePanel(null)}
        />
        <MeteorShowerPanel
          isOpen={activePanel === 'meteors'}
          onClose={() => setActivePanel(null)}
        />
      </main>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onRequestGps={() => requestCurrentLocation()}
        isLocating={isLocating}
      />
    </div>
  );
};
