import React, { useState, useRef, useEffect } from 'react';
import { useSkyStore } from '../store/useSkyStore';
import { ViewMode } from '../types';
import {
  MapPin,
  Compass,
  CircleDot,
  Radio,
  Clock,
  Orbit,
  Flame,
  Globe2,
  Sun,
  Sparkles,
  Disc,
  LayoutGrid,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  onOpenLocationModal: () => void;
  isLocating: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLocationModal, isLocating }) => {
  const {
    location,
    viewMode,
    setViewMode,
    timeOffsetSeconds,
    resetToNow,
    activePanel,
    setActivePanel,
    isTimeSliderVisible,
    toggleTimeSlider,
  } = useSkyStore();

  const [isPanelsMenuOpen, setIsPanelsMenuOpen] = useState(false);
  const panelsMenuRef = useRef<HTMLDivElement>(null);

  // Close panels dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelsMenuRef.current && !panelsMenuRef.current.contains(e.target as Node)) {
        setIsPanelsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isScrubbed = timeOffsetSeconds !== 0;

  const formatCoord = (deg: number, posChar: string, negChar: string) => {
    const dir = deg >= 0 ? posChar : negChar;
    return `${Math.abs(deg).toFixed(2)}° ${dir}`;
  };

  const viewTabs: {
    id: ViewMode;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
  }[] = [
    { id: '3d', shortLabel: 'Dome', icon: Compass, title: '3D Alt-Azimuth Observer Dome' },
    { id: '2d', shortLabel: 'Polar', icon: CircleDot, title: '2D Flat Polar Sky Chart (Zenith centered)' },
    { id: 'globe', shortLabel: 'Earth', icon: Globe2, title: '3D Earth Orbit View (Relative to Earth)' },
    { id: 'solar', shortLabel: 'Solar', icon: Sun, title: 'Heliocentric Solar System' },
    { id: 'milkyway', shortLabel: 'Milky Way', icon: Disc, title: 'Milky Way Galaxy Cartography' },
    { id: 'universe', shortLabel: 'Universe', icon: Sparkles, title: 'Vast Known Universe' },
  ];

  return (
    <header className="relative z-30 h-16 bg-space-900/95 border-b border-slate-800/80 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between shrink-0 select-none gap-2">
      {/* Left: Brand & Observer Location */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-950/60 flex items-center justify-center">
            <div className="w-full h-full bg-space-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-sm sm:text-base bg-gradient-to-r from-slate-100 via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                SKYWATCH
              </span>
              <span className="hidden xl:inline-block px-1 py-0.2 text-[9px] uppercase font-mono font-bold tracking-widest rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                Live
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden 2xl:block">
              Alt-Azimuth Dome
            </p>
          </div>
        </div>

        {/* Location Pill */}
        <button
          onClick={onOpenLocationModal}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-space-850/90 border border-slate-700/80 hover:border-cyan-500/60 hover:bg-space-800 text-xs transition-all group focus:outline-none focus:ring-1 focus:ring-cyan-500 min-w-0"
          title="Click to change observer location"
        >
          <MapPin
            className={`w-3.5 h-3.5 shrink-0 ${
              isLocating
                ? 'text-amber-400 animate-spin'
                : 'text-cyan-400 group-hover:scale-110 transition-transform'
            }`}
          />
          <div className="text-left flex flex-col min-w-0">
            <span className="font-medium text-slate-200 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
              <span className="truncate max-w-[90px] sm:max-w-[130px] md:max-w-[160px] text-xs">
                {location.name}
              </span>
            </span>
            <span className="text-[9px] font-mono text-slate-400 hidden sm:inline truncate">
              {formatCoord(location.latitude, 'N', 'S')}, {formatCoord(location.longitude, 'E', 'W')}
            </span>
          </div>
        </button>
      </div>

      {/* Center & Right: Compact Navigation & Panel Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Time Status / Scrub Indicator */}
        {isScrubbed ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-950/70 border border-amber-600/50 text-amber-300 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <button
              onClick={resetToNow}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-space-950 font-sans font-bold text-[10px] transition-colors whitespace-nowrap"
              title="Reset time simulation to real-time"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>Reset</span>
            </button>
          </div>
        ) : (
          <div className="hidden 2xl:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-teal-950/40 border border-teal-700/40 text-teal-300 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
            <span>REAL-TIME</span>
          </div>
        )}

        {/* View Switcher: Segmented Control (6 Views) */}
        <div className="flex items-center p-0.5 rounded-lg bg-space-850 border border-slate-700/80">
          {viewTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = viewMode === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 via-sky-600 to-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/50'
                }`}
                title={tab.title}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
                <span className={isActive ? 'inline' : 'hidden xl:inline'}>
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Timeline Slider Toggle Button */}
        <button
          onClick={toggleTimeSlider}
          className={`p-1.5 sm:px-2 sm:py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isTimeSliderVisible
              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
              : 'bg-space-850 border-slate-700/70 text-slate-400 hover:text-slate-200 hover:bg-space-800'
          }`}
          title={isTimeSliderVisible ? 'Hide timeline slider' : 'Show timeline slider'}
          aria-label="Toggle Timeline Slider"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden xl:inline text-[11px]">Timeline</span>
        </button>

        {/* Consolidated Events & Observation Panels Dropdown */}
        <div className="relative" ref={panelsMenuRef}>
          <button
            onClick={() => setIsPanelsMenuOpen((prev) => !prev)}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
              activePanel !== null || isPanelsMenuOpen
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200 shadow-sm'
                : 'bg-space-850 border-slate-700/70 text-slate-300 hover:bg-space-800 hover:text-white'
            }`}
            title="Celestial Events & Observation Panels"
            aria-expanded={isPanelsMenuOpen}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium hidden sm:inline">
              {activePanel === 'passes'
                ? 'Passes'
                : activePanel === 'asteroids'
                ? 'Asteroids'
                : activePanel === 'meteors'
                ? 'Meteors'
                : 'Events'}
            </span>
            {activePanel !== null && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
            <ChevronDown
              className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                isPanelsMenuOpen ? 'rotate-180 text-cyan-300' : ''
              }`}
            />
          </button>

          {/* Floating Dropdown Card */}
          {isPanelsMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-space-900/95 border border-slate-700/90 backdrop-blur-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800 flex items-center justify-between">
                <span>Observation Panels</span>
                {activePanel && (
                  <span className="text-cyan-400 font-sans normal-case text-[10px]">
                    1 Open
                  </span>
                )}
              </div>

              <div className="space-y-1 pt-1.5">
                {/* 1. Satellite Passes */}
                <button
                  onClick={() => {
                    setActivePanel('passes');
                    setIsPanelsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                    activePanel === 'passes'
                      ? 'bg-cyan-950/80 border border-cyan-700/60 text-cyan-200'
                      : 'hover:bg-space-800 text-slate-200'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center shrink-0">
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-100 flex items-center justify-between">
                      <span>Satellite Passes</span>
                      {activePanel === 'passes' && (
                        <span className="text-[9px] text-cyan-400 font-mono">Active</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      ISS & overhead flyby predictions
                    </span>
                  </div>
                </button>

                {/* 2. Asteroids */}
                <button
                  onClick={() => {
                    setActivePanel('asteroids');
                    setIsPanelsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                    activePanel === 'asteroids'
                      ? 'bg-amber-950/80 border border-amber-700/60 text-amber-200'
                      : 'hover:bg-space-800 text-slate-200'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center shrink-0">
                    <Orbit className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-100 flex items-center justify-between">
                      <span>Near-Earth Asteroids</span>
                      {activePanel === 'asteroids' && (
                        <span className="text-[9px] text-amber-400 font-mono">Active</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      NASA NeoWs close encounters
                    </span>
                  </div>
                </button>

                {/* 3. Meteor Showers */}
                <button
                  onClick={() => {
                    setActivePanel('meteors');
                    setIsPanelsMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                    activePanel === 'meteors'
                      ? 'bg-purple-950/80 border border-purple-700/60 text-purple-200'
                      : 'hover:bg-space-800 text-slate-200'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-800/50 flex items-center justify-center shrink-0">
                    <Flame className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-100 flex items-center justify-between">
                      <span>Meteor Showers</span>
                      {activePanel === 'meteors' && (
                        <span className="text-[9px] text-purple-400 font-mono">Active</span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">
                      Peak activity & radiants
                    </span>
                  </div>
                </button>
              </div>

              {/* Close active panel button if one is open */}
              {activePanel && (
                <div className="pt-1.5 mt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setActivePanel(activePanel); // toggles off
                      setIsPanelsMenuOpen(false);
                    }}
                    className="w-full py-1 text-center text-[10px] font-mono text-slate-400 hover:text-slate-200 bg-space-950/60 hover:bg-space-950 rounded border border-slate-800 transition-colors"
                  >
                    Close active panel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
