import React, { useState, useEffect } from 'react';
import { useSkyStore } from '../store/useSkyStore';
import { celestrakService } from '../services/celestrakService';
import { predictMultipleSatellitePasses } from '../lib/passPredictor';
import { azimuthToCompass } from '../lib/coordinates';
import { SatellitePass } from '../types';
import { Radio, X, Compass, Clock, AlertCircle } from 'lucide-react';

interface PassesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PassesPanel: React.FC<PassesPanelProps> = ({ isOpen, onClose }) => {
  const { location } = useSkyStore();
  const [passes, setPasses] = useState<SatellitePass[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    async function loadPasses() {
      try {
        // Fetch station and bright visual satellite element sets
        const [stations, visual] = await Promise.all([
          celestrakService.fetchSatellites('stations'),
          celestrakService.fetchSatellites('visual'),
        ]);

        const prioritySats = [...stations, ...visual.slice(0, 15)];
        const predicted = predictMultipleSatellitePasses(
          prioritySats,
          location,
          new Date(),
          24 // 24-hour window
        );

        if (isMounted) {
          setPasses(predicted);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Error predicting passes:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadPasses();

    return () => {
      isMounted = false;
    };
  }, [isOpen, location]);

  if (!isOpen) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getRemainingTime = (date: Date) => {
    const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
    if (diffSec <= 0) return 'Passing Now!';
    const mins = Math.floor(diffSec / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `in ${hrs}h ${mins % 60}m`;
    return `in ${mins}m`;
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-space-900/95 border-l border-slate-700/80 backdrop-blur-xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-space-850">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <span>Upcoming Satellite Passes</span>
            </h2>
            <p className="text-xs text-slate-400">
              Next 24h predictions for {location.name.split(',')[0]}
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

      {/* Info Notice */}
      <div className="px-5 py-3 bg-cyan-950/30 border-b border-cyan-900/40 text-[11px] text-cyan-300 flex items-center gap-2">
        <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>Computed locally with SGP4 orbital propagation from your coordinates.</span>
      </div>

      {/* Passes List */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Radio className="w-8 h-8 text-cyan-400 animate-spin" />
            <span className="text-xs font-mono">Calculating SGP4 orbital trajectories...</span>
          </div>
        ) : passes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-500 text-center">
            <AlertCircle className="w-8 h-8 text-slate-600" />
            <p className="text-sm font-semibold">No visible passes in next 24h</p>
            <p className="text-xs max-w-xs">Try increasing the tracking groups in the Layers menu to include active payloads.</p>
          </div>
        ) : (
          passes.map((pass, idx) => {
            const startDir = azimuthToCompass(pass.startAzimuth);
            const peakDir = azimuthToCompass(pass.peakAzimuth);
            const endDir = azimuthToCompass(pass.endAzimuth);
            const isHighPass = pass.maxAltitude >= 40;

            return (
              <div
                key={`${pass.satelliteId}-${idx}`}
                className="p-4 rounded-xl bg-space-850/80 border border-slate-700/80 hover:border-cyan-500/60 transition-all text-xs space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {pass.satelliteName}
                    </span>
                    {pass.noradId && (
                      <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-400">
                        #{pass.noradId}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isHighPass
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/60'
                      : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
                  }`}>
                    Max {pass.maxAltitude}°
                  </span>
                </div>

                {/* Timing row */}
                <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-space-900/60 font-mono text-[11px] text-center border border-slate-800">
                  <div>
                    <span className="text-[9px] uppercase text-slate-500 block">Rise ({startDir})</span>
                    <span className="text-slate-300 font-semibold">{formatTime(pass.riseTime)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-cyan-400 block">Peak ({peakDir})</span>
                    <span className="text-cyan-300 font-bold">{formatTime(pass.peakTime)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase text-slate-500 block">Set ({endDir})</span>
                    <span className="text-slate-300 font-semibold">{formatTime(pass.setTime)}</span>
                  </div>
                </div>

                {/* Footer details */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Duration: {Math.floor(pass.durationSeconds / 60)}m {pass.durationSeconds % 60}s</span>
                  </div>
                  <span className="text-amber-400 font-medium">
                    {getRemainingTime(pass.riseTime)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
