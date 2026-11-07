import React from 'react';
import { Compass, Plus, Minus } from 'lucide-react';

interface GoogleEarthControlsProps {
  onResetNorth: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onTiltUp?: () => void;
  onTiltDown?: () => void;
}

export const GoogleEarthControls: React.FC<GoogleEarthControlsProps> = ({
  onResetNorth,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="absolute right-5 bottom-14 z-20 flex flex-col items-center gap-2.5 pointer-events-auto select-none">
      {/* 3D Compass Widget */}
      <button
        onClick={onResetNorth}
        className="group relative w-12 h-12 rounded-full bg-space-900/85 hover:bg-space-850 border border-slate-700/80 hover:border-cyan-400 backdrop-blur-md shadow-2xl flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
        title="Reset camera facing North (0°)"
      >
        <div className="relative flex items-center justify-center">
          <Compass className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          {/* North indicator needle tip */}
          <span className="absolute -top-1 w-1.5 h-2 bg-red-500 rounded-full" />
        </div>
        <span className="absolute -top-6 px-1.5 py-0.5 rounded bg-space-950/90 border border-slate-800 text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Face North
        </span>
      </button>

      {/* Zoom In / Out Controls */}
      <div className="flex flex-col rounded-xl bg-space-900/85 border border-slate-700/80 backdrop-blur-md shadow-xl overflow-hidden divide-y divide-slate-800">
        <button
          onClick={onZoomIn}
          className="p-2.5 hover:bg-space-800 text-slate-300 hover:text-cyan-400 transition-colors focus:outline-none"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2.5 hover:bg-space-800 text-slate-300 hover:text-cyan-400 transition-colors focus:outline-none"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
