import React, { useState, useEffect } from 'react';
import { neowsService, NeoWsResult } from '../services/neowsService';
import { useSkyStore } from '../store/useSkyStore';
import { Orbit, X, AlertTriangle, ShieldCheck, Gauge, Info, Ruler, Calendar, ExternalLink } from 'lucide-react';

interface AsteroidsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AsteroidsPanel: React.FC<AsteroidsPanelProps> = ({ isOpen, onClose }) => {
  const { setSelectedObject, setViewMode } = useSkyStore();
  const [data, setData] = useState<NeoWsResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getAsteroidImage = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('apophis')) return '/images/asteroids/apophis.svg';
    if (n.includes('bennu')) return '/images/asteroids/bennu.svg';
    if (n.includes('ryugu')) return '/images/asteroids/ryugu.svg';
    if (n.includes('eros')) return '/images/asteroids/eros.svg';
    return '/images/asteroids/generic_asteroid.svg';
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    async function loadAsteroids() {
      try {
        const result = await neowsService.fetchCloseApproachAsteroids();
        if (isMounted) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Failed loading asteroids:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadAsteroids();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-space-900/95 border-l border-slate-700/80 backdrop-blur-xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-space-850">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Orbit className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Near-Earth Asteroids
            </h2>
            <p className="text-xs text-slate-400">
              NASA NeoWs close-approaches this week
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Limitation Disclosure Banner */}
      <div className="p-3.5 bg-amber-950/30 border-b border-amber-900/40 text-[11px] text-amber-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          <span className="font-semibold text-amber-200">Astronomical Note: </span>
          NASA NeoWs returns close-approach orbital parameters (date, miss distance, velocity, size), not observer Alt-Azimuth sky coordinates. Displayed here for situational awareness.
        </p>
      </div>

      {/* Rate Limit Notice (if triggered) */}
      {data?.rateLimitNotice && (
        <div className="p-3 bg-cyan-950/40 border-b border-cyan-800/40 text-[11px] text-cyan-200 flex items-start gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{data.rateLimitNotice}</span>
        </div>
      )}

      {/* Asteroids List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Orbit className="w-8 h-8 text-amber-400 animate-spin" />
            <span className="text-xs font-mono">Fetching NASA NeoWs close-approach feed...</span>
          </div>
        ) : !data || data.asteroids.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-center">
            <p className="text-sm font-semibold">No close-approach asteroids recorded</p>
          </div>
        ) : (
          data.asteroids.map((ast) => {
            const isHazard = ast.isPotentiallyHazardous;
            const imgUrl = getAsteroidImage(ast.name);

            const handleSelectInSolar = () => {
              const avgDiameterM = Math.round((ast.estimatedDiameterMinM + ast.estimatedDiameterMaxM) / 2);
              setSelectedObject({
                id: `neo-${ast.id}`,
                name: ast.name,
                type: 'asteroid',
                azimuth: 180,
                altitude: 25,
                distanceKm: ast.missDistanceKm,
                diameterKm: avgDiameterM / 1000,
                orbitClass: isHazard ? 'Potentially Hazardous NEO' : 'Near-Earth Asteroid',
                imageUrl: imgUrl,
                color: isHazard ? '#ef4444' : '#fbbf24',
                description: `Close-approaching Near-Earth Asteroid detected by NASA NeoWs. Estimated diameter: ${ast.estimatedDiameterMinM}–${ast.estimatedDiameterMaxM} m. Close approach date: ${ast.closeApproachDate} at a miss distance of ${(ast.missDistanceKm / 1e6).toFixed(2)}M km (${ast.missDistanceLunar} Lunar Distances) traveling at ${(ast.relativeVelocityKmH / 3600).toFixed(1)} km/s relative to Earth. Absolute magnitude H = ${ast.absoluteMagnitude}.`,
              });
              setViewMode('solar');
              onClose();
            };

            return (
              <div
                key={ast.id}
                className="p-4 rounded-xl bg-space-850/80 border border-slate-700/80 hover:border-amber-500/60 transition-all text-xs space-y-3"
              >
                {/* Title, Image Thumbnail & Hazard Badge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-space-950/80 border border-slate-800 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={imgUrl}
                        alt={ast.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(251,191,36,0.25)]"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-100 text-sm block">
                        {ast.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isHazard ? 'Apollo/Aten PHA' : 'Near-Earth Asteroid'}
                      </span>
                    </div>
                  </div>
                  {isHazard ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-700 flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      Hazardous
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-emerald-400 border border-slate-700 flex items-center gap-1 shrink-0">
                      <ShieldCheck className="w-3 h-3" />
                      Safe
                    </span>
                  )}
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-space-900/60 font-mono text-[11px] border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> Size Est.
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {ast.estimatedDiameterMinM} - {ast.estimatedDiameterMaxM} m
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Gauge className="w-3 h-3" /> Rel. Velocity
                    </span>
                    <span className="text-slate-200 font-semibold">
                      {(ast.relativeVelocityKmH / 3600).toFixed(1)} km/s
                    </span>
                  </div>

                  <div className="col-span-2 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Miss Distance</span>
                      <span className="text-amber-300 font-bold">
                        {(ast.missDistanceKm / 1e6).toFixed(2)}M km ({ast.missDistanceLunar} Lunar Distances)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Date & 3D Orrery Button */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Approach: {ast.closeApproachDate}</span>
                  </span>
                  <button
                    onClick={handleSelectInSolar}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-semibold transition-colors"
                    title="Inspect in 3D Solar System Orrery"
                  >
                    <span>View in 3D</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
