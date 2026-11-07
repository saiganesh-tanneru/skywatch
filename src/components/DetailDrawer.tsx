import React from 'react';
import { useSkyStore } from '../store/useSkyStore';
import {
  X,
  Compass,
  Radio,
  Eye,
  Crosshair,
  Calendar,
  Sparkles,
  Info,
  Maximize2,
  Orbit,
} from 'lucide-react';

interface DetailDrawerProps {
  onZoomToObject?: () => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({ onZoomToObject }) => {
  const {
    selectedObject,
    setSelectedObject,
    isDetailDrawerOpen,
    setDetailDrawerOpen,
    setActivePanel,
  } = useSkyStore();

  if (!isDetailDrawerOpen || !selectedObject) {
    return null;
  }

  const handleClose = () => {
    setDetailDrawerOpen(false);
    setSelectedObject(null);
  };

  const handleOpenPasses = () => {
    setActivePanel('passes');
  };

  // Cardinal direction helper
  const getCardinal = (az: number) => {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(az / 22.5) % 16;
    return dirs[idx];
  };

  // Speed estimation based on type
  const estimatedSpeed = () => {
    if (selectedObject.type === 'black_hole') return 'Relativistic Accretion (c ≈ 0.95)';
    if (selectedObject.type === 'wormhole') return 'Theoretical Superluminal (Traversable)';
    if (selectedObject.type === 'galaxy') {
      return selectedObject.redshift
        ? `Hubble Expansion (z = ${selectedObject.redshift})`
        : 'Galactic Drift (~110-600 km/s)';
    }
    if (selectedObject.type === 'dead_star') {
      return selectedObject.name.includes('Pulsar')
        ? 'Pulsar Spin (~30 rev/sec)'
        : 'Remnant Expansion (~1,500 km/s)';
    }
    if (selectedObject.type === 'satellite') {
      // Standard Low Earth Orbit speed ~7.6 km/s, Geostationary ~3.1 km/s
      if (selectedObject.altKm && selectedObject.altKm > 30000) return '3.07 km/s (Geostationary)';
      if (selectedObject.velocityKmS) return `${selectedObject.velocityKmS} km/s`;
      return '7.66 km/s (~27,600 km/h)';
    }
    if (selectedObject.type === 'moon') return '1.02 km/s (Orbital)';
    if (selectedObject.type === 'planet') {
      const name = selectedObject.name.toLowerCase();
      if (name.includes('mercury')) return '47.4 km/s';
      if (name.includes('venus')) return '35.0 km/s';
      if (name.includes('mars')) return '24.1 km/s';
      if (name.includes('jupiter')) return '13.1 km/s';
      if (name.includes('saturn')) return '9.7 km/s';
      if (name.includes('uranus')) return '6.8 km/s';
      if (name.includes('neptune')) return '5.4 km/s';
      return '29.8 km/s (Heliocentric)';
    }
    if (selectedObject.type === 'sun') return '220 km/s (Galactic Orbit)';
    return 'N/A (Apparent sidereal motion)';
  };

  // Format distance
  const formatDistance = (distKm?: number, distLy?: number) => {
    if (distLy !== undefined) {
      if (distLy === 0) return '0 ly (Solar System)';
      if (distLy >= 1e9) return `${(distLy / 1e9).toFixed(2)} Billion ly`;
      if (distLy >= 1e6) return `${(distLy / 1e6).toFixed(2)} Million ly`;
      return `${distLy.toLocaleString()} light-years`;
    }
    if (!distKm) return 'Unknown';
    if (distKm > 149597870) {
      const au = distKm / 149597870.7;
      return `${au.toFixed(2)} AU (${(distKm / 1e6).toFixed(1)}M km)`;
    }
    return `${distKm.toLocaleString()} km`;
  };

  // Spacecraft & Asteroid SVG / texture banner
  const getPreviewImage = () => {
    if (selectedObject.imageUrl) {
      return selectedObject.imageUrl;
    }
    if (selectedObject.noradId === 25544 || selectedObject.name.includes('ISS')) {
      return '/images/satellites/iss.svg';
    }
    if (selectedObject.noradId === 48274 || selectedObject.name.includes('TIANGONG') || selectedObject.name.includes('CSS')) {
      return '/images/satellites/tiangong.svg';
    }
    if (selectedObject.noradId === 20580 || selectedObject.name.includes('HST') || selectedObject.name.includes('HUBBLE')) {
      return '/images/satellites/hubble.svg';
    }
    if (selectedObject.type === 'satellite') {
      return '/images/satellites/satellite_comms.svg';
    }
    if (selectedObject.type === 'asteroid') {
      const name = selectedObject.name.toLowerCase();
      if (name.includes('ceres')) return '/images/asteroids/ceres.svg';
      if (name.includes('vesta')) return '/images/asteroids/vesta.svg';
      if (name.includes('psyche')) return '/images/asteroids/psyche.svg';
      if (name.includes('bennu')) return '/images/asteroids/bennu.svg';
      if (name.includes('ryugu')) return '/images/asteroids/ryugu.svg';
      if (name.includes('eros')) return '/images/asteroids/eros.svg';
      if (name.includes('apophis')) return '/images/asteroids/apophis.svg';
      return '/images/asteroids/generic_asteroid.svg';
    }
    return null;
  };

  const previewImg = getPreviewImage();

  return (
    <aside
      aria-label="Object Details Panel"
      className="absolute top-14 right-4 z-[60] w-84 sm:w-96 max-h-[calc(100vh-8.5rem)] bg-space-900/95 border border-slate-700/80 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200 select-none font-mono"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between gap-3 bg-space-950/40">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
            style={{
              backgroundColor: `${selectedObject.color || '#38bdf8'}15`,
              borderColor: `${selectedObject.color || '#38bdf8'}40`,
              color: selectedObject.color || '#38bdf8',
            }}
          >
            {selectedObject.type === 'satellite' ? (
              <Radio className="w-5 h-5 animate-pulse" />
            ) : selectedObject.type === 'asteroid' ? (
              <Orbit className="w-5 h-5 text-amber-400" />
            ) : selectedObject.type === 'sun' || selectedObject.type === 'star' ? (
              <Sparkles className="w-5 h-5" />
            ) : (
              <Compass className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 leading-tight">
              {selectedObject.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: `${selectedObject.color || '#38bdf8'}15`,
                  borderColor: `${selectedObject.color || '#38bdf8'}30`,
                  color: selectedObject.color || '#38bdf8',
                }}
              >
                {selectedObject.type}
              </span>
              {selectedObject.noradId && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  NORAD #{selectedObject.noradId}
                </span>
              )}
              {(selectedObject.category === 'isro' ||
                selectedObject.name.toUpperCase().includes('ISRO') ||
                selectedObject.name.toUpperCase().includes('ASTROSAT') ||
                selectedObject.name.toUpperCase().includes('XPOSAT') ||
                selectedObject.name.toUpperCase().includes('CARTOSAT') ||
                selectedObject.name.toUpperCase().includes('RISAT') ||
                selectedObject.name.toUpperCase().includes('EOS-') ||
                selectedObject.name.toUpperCase().includes('IRNSS') ||
                selectedObject.name.toUpperCase().includes('NAVIC') ||
                selectedObject.name.toUpperCase().includes('NVS-') ||
                selectedObject.name.toUpperCase().includes('GSAT') ||
                selectedObject.name.toUpperCase().includes('INSAT') ||
                selectedObject.name.toUpperCase().includes('CHANDRAYAAN') ||
                selectedObject.name.toUpperCase().includes('ADITYA') ||
                selectedObject.name.toUpperCase().includes('MANGALYAAN') ||
                (Boolean(selectedObject.description) && selectedObject.description!.includes('ISRO'))) && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                  🇮🇳 ISRO
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close detail drawer (zooms camera back out)"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Visual Image Preview (when available) */}
      {previewImg && (
        <div className="relative w-full h-28 bg-radial from-cyan-950/40 to-space-950 border-b border-slate-800 flex items-center justify-center p-3 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          <img
            src={previewImg}
            alt={selectedObject.name}
            className="h-20 w-auto object-contain filter drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]"
          />
          <span className="absolute bottom-1 right-2 text-[9px] text-cyan-400/80">
            {selectedObject.type === 'asteroid' ? 'Asteroid Imagery' : 'Telemetry Model'}
          </span>
        </div>
      )}

      {/* Main Details Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Real-Time Horizon Coordinates */}
        <div>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Observer Vantage Position</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase">Altitude</span>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">
                {selectedObject.altitude.toFixed(1)}°
              </div>
              <div className="text-[10px] text-slate-400">
                {selectedObject.altitude >= 0 ? 'Above Horizon' : 'Below Horizon'}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase">Azimuth</span>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {selectedObject.azimuth.toFixed(1)}° {getCardinal(selectedObject.azimuth)}
              </div>
              <div className="text-[10px] text-slate-400">Compass Bearing</div>
            </div>
          </div>
        </div>

        {/* Equatorial & Orbital Metrics */}
        <div>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span>Telemetry & Orbit</span>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase">Distance</span>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">
                {formatDistance(selectedObject.distanceKm, selectedObject.distanceLy)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase">Velocity</span>
              <div className="text-xs font-semibold text-slate-200 mt-0.5">
                {estimatedSpeed()}
              </div>
            </div>

            {selectedObject.diameterKm !== undefined && (
              <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Mean Diameter</span>
                <div className="text-xs font-semibold text-amber-300 mt-0.5">
                  {selectedObject.diameterKm >= 1
                    ? `${selectedObject.diameterKm} km`
                    : `${Math.round(selectedObject.diameterKm * 1000)} meters`}
                </div>
              </div>
            )}

            {selectedObject.spectralType && (
              <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Spectral Class</span>
                <div className="text-xs font-semibold text-emerald-300 mt-0.5 truncate">
                  {selectedObject.spectralType}
                </div>
              </div>
            )}

            {selectedObject.orbitClass && (
              <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800 col-span-2">
                <span className="text-[10px] text-slate-500 uppercase">Orbital Family</span>
                <div className="text-xs font-semibold text-cyan-300 mt-0.5">
                  {selectedObject.orbitClass}
                </div>
              </div>
            )}

            {selectedObject.massSolar && (
              <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Estimated Mass</span>
                <div className="text-xs font-semibold text-amber-300 mt-0.5">
                  {selectedObject.massSolar}
                </div>
              </div>
            )}

            {selectedObject.redshift !== undefined && (
              <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Cosmological Redshift</span>
                <div className="text-xs font-semibold text-purple-300 mt-0.5">
                  z = {selectedObject.redshift}
                </div>
              </div>
            )}

            {selectedObject.ra !== undefined && (
              <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Right Ascension</span>
                <div className="text-xs font-semibold text-slate-300 mt-0.5">
                  {selectedObject.ra.toFixed(2)}h
                </div>
              </div>
            )}

            {selectedObject.dec !== undefined && (
              <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Declination</span>
                <div className="text-xs font-semibold text-slate-300 mt-0.5">
                  {selectedObject.dec >= 0 ? '+' : ''}{selectedObject.dec.toFixed(2)}°
                </div>
              </div>
            )}

            {selectedObject.magnitude !== undefined && (
              <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Visual Mag</span>
                <div className="text-xs font-semibold text-amber-300 mt-0.5">
                  {selectedObject.magnitude.toFixed(1)} mag
                </div>
              </div>
            )}

            {selectedObject.altKm !== undefined && (
              <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase">Orbit Altitude</span>
                <div className="text-xs font-semibold text-cyan-300 mt-0.5">
                  {selectedObject.altKm} km
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Satellite Geographic Footprint (for satellites) */}
        {selectedObject.subLat !== undefined && selectedObject.subLon !== undefined && (
          <div className="p-2.5 rounded-xl bg-space-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase">Ground Footprint (Sub-Point)</span>
            <div className="text-xs font-semibold text-slate-300 mt-0.5">
              Lat: {selectedObject.subLat}° | Lon: {selectedObject.subLon}°
            </div>
          </div>
        )}

        {/* Visited Spacecraft Missions */}
        {selectedObject.missions && selectedObject.missions.length > 0 && (
          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exploration Missions</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {selectedObject.missions.map((m, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-cyan-300 text-[10px] font-semibold"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description / Mission context */}
        {selectedObject.description && (
          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Description & Facts</span>
            </h3>
            <p className="p-3 rounded-xl bg-space-950/40 border border-slate-800 text-slate-300 leading-relaxed text-[11px]">
              {selectedObject.description}
            </p>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t border-slate-800 bg-space-950/60 flex items-center justify-between gap-2">
        {onZoomToObject && (
          <button
            onClick={onZoomToObject}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/30 transition-all"
            title="Animate camera to target object"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Zoom In</span>
          </button>
        )}

        {selectedObject.type === 'satellite' && (
          <button
            onClick={handleOpenPasses}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition-colors"
            title="Calculate upcoming visible passes over observer location"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Passes</span>
          </button>
        )}

        <button
          onClick={handleClose}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs transition-colors"
          title="Close drawer and zoom out"
        >
          Close
        </button>
      </div>
    </aside>
  );
};
