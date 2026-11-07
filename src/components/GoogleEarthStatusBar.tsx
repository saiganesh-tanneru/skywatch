import React from 'react';
import { useSkyStore } from '../store/useSkyStore';
import { Loader2 } from 'lucide-react';

interface GoogleEarthStatusBarProps {
  lastUpdated: Date;
  visibleCount: number;
  isLoading?: boolean;
}

export const GoogleEarthStatusBar: React.FC<GoogleEarthStatusBarProps> = ({
  lastUpdated,
  visibleCount,
  isLoading,
}) => {
  const { location, viewMode, timeOffsetSeconds } = useSkyStore();

  const latStr = `${Math.abs(location.latitude).toFixed(3)}°${location.latitude >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(location.longitude).toFixed(3)}°${location.longitude >= 0 ? 'E' : 'W'}`;

  return (
    <div className="absolute bottom-0 inset-x-0 h-8 bg-space-950/85 border-t border-slate-800/80 backdrop-blur-md px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-20">
      {/* Left: Observer vantage telemetry */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          <span>{location.name.split(',')[0]}</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-400">
          <span>{latStr} {lonStr}</span>
          <span>•</span>
          <span>Elev {location.elevationMeters}m</span>
        </div>
      </div>

      {/* Center: Live Orbit Propagation Tick */}
      <div className="flex items-center gap-2">
        {isLoading ? (
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
            <span>Syncing telemetry...</span>
          </span>
        ) : (
          <span className="text-cyan-400 font-semibold">
            {visibleCount} Objects Overhead
          </span>
        )}
        <span className="hidden md:inline text-slate-600">|</span>
        <span className="hidden md:inline text-slate-400">
          {lastUpdated.toLocaleTimeString()} {timeOffsetSeconds !== 0 ? '(Scrubbed)' : 'UTC/Local'}
        </span>
      </div>

      {/* Right: Technical attribution & view mode */}
      <div className="hidden lg:flex items-center gap-3 text-slate-500 text-[10px]">
        <span>CelesTrak GP (SGP4)</span>
        <span>•</span>
        <span className="uppercase text-slate-400">{viewMode} Mode</span>
      </div>
    </div>
  );
};
