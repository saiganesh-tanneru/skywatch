import React, { useMemo } from 'react';
import { METEOR_SHOWERS, getNextMeteorShower } from '../lib/meteorData';
import { Flame, X, Sparkles, Calendar, Clock } from 'lucide-react';

interface MeteorShowerPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeteorShowerPanel: React.FC<MeteorShowerPanelProps> = ({ isOpen, onClose }) => {
  const nextInfo = useMemo(() => getNextMeteorShower(new Date()), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-space-900/95 border-l border-slate-700/80 backdrop-blur-xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-space-850">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Meteor Showers Calendar
            </h2>
            <p className="text-xs text-slate-400">
              Major annual celestial debris streams
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

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Next Active / Upcoming Shower Highlight Hero Card */}
        {nextInfo && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/80 via-space-900 to-space-850 border border-purple-500/50 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-15">
              <Flame className="w-24 h-24 text-purple-400" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Next Major Shower
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {nextInfo.isPeakingToday
                    ? 'Peaking Tonight!'
                    : `Peak in ${nextInfo.daysRemaining} days`}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {nextInfo.shower.name}
                </h3>
                <p className="text-xs text-slate-300">
                  Peak activity: <span className="font-semibold text-purple-200">{nextInfo.shower.peakDate}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-center">
                <div className="p-2 rounded-lg bg-space-950/60 border border-purple-900/40">
                  <span className="text-[9px] uppercase text-slate-400 block">ZHR Rate</span>
                  <span className="text-purple-300 font-bold text-sm">~{nextInfo.shower.zhr}/hr</span>
                </div>
                <div className="p-2 rounded-lg bg-space-950/60 border border-purple-900/40">
                  <span className="text-[9px] uppercase text-slate-400 block">Radiant</span>
                  <span className="text-slate-200 font-semibold">{nextInfo.shower.radiantConstellation}</span>
                </div>
                <div className="p-2 rounded-lg bg-space-950/60 border border-purple-900/40">
                  <span className="text-[9px] uppercase text-slate-400 block">Velocity</span>
                  <span className="text-slate-200 font-semibold">{nextInfo.shower.velocityKmS} km/s</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-mono">
                Parent body: {nextInfo.shower.parentBody}
              </p>
            </div>
          </div>
        )}

        {/* Complete Annual Calendar Table */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            Annual Meteor Shower Calendar
          </span>

          <div className="space-y-2">
            {METEOR_SHOWERS.map((shower) => {
              const isNext = shower.id === nextInfo?.shower.id;

              return (
                <div
                  key={shower.id}
                  className={`p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    isNext
                      ? 'bg-purple-950/30 border-purple-500/60 ring-1 ring-purple-500/30'
                      : 'bg-space-850/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{shower.name}</span>
                      {isNext && (
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          Next Up
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                      <span>Peak: {shower.peakDate}</span>
                      <span>•</span>
                      <span>Radiant: {shower.radiantConstellation}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-purple-400 font-bold text-sm block">
                      ~{shower.zhr}
                    </span>
                    <span className="text-[9px] text-slate-500 uppercase">meteors/hr</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
