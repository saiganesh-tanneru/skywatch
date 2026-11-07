import React, { useEffect, useRef, useState } from 'react';
import { useSkyStore } from '../store/useSkyStore';
import { Play, Pause, RotateCcw, FastForward, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const MIN_OFFSET = -2 * 3600; // -2 hours
const MAX_OFFSET = 48 * 3600; // +48 hours

export const TimeSlider: React.FC = () => {
  const {
    timeOffsetSeconds,
    setTimeOffsetSeconds,
    resetToNow,
    setLive,
    isTimeSliderVisible,
    setTimeSliderVisible,
  } = useSkyStore();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(60); // 60x default (1 minute per second)
  const animFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Scrub offset formatting
  const formatOffset = (offset: number) => {
    if (Math.abs(offset) < 30) return 'NOW (Real-Time)';
    const sign = offset > 0 ? '+' : '-';
    const abs = Math.abs(offset);
    const hours = Math.floor(abs / 3600);
    const minutes = Math.floor((abs % 3600) / 60);
    if (hours === 0) return `${sign}${minutes}m`;
    if (minutes === 0) return `${sign}${hours}h`;
    return `${sign}${hours}h ${minutes}m`;
  };

  // Target simulation time
  const simDate = new Date(Date.now() + timeOffsetSeconds * 1000);

  // Playback animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    lastTickRef.current = Date.now();

    const loop = () => {
      const now = Date.now();
      const deltaSec = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      const nextOffset = Math.min(
        MAX_OFFSET,
        timeOffsetSeconds + deltaSec * playbackSpeed
      );

      if (nextOffset >= MAX_OFFSET) {
        setIsPlaying(false);
        setTimeOffsetSeconds(MAX_OFFSET);
      } else {
        setTimeOffsetSeconds(nextOffset);
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, timeOffsetSeconds, setTimeOffsetSeconds]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setIsPlaying(false);
    setTimeOffsetSeconds(val);
  };

  const handleResetNow = () => {
    setIsPlaying(false);
    resetToNow();
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setLive(false);
      setIsPlaying(true);
    }
  };

  const cycleSpeed = () => {
    const speeds = [10, 60, 300, 1800];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  if (!isTimeSliderVisible) {
    return (
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          onClick={() => setTimeSliderVisible(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-space-900/90 hover:bg-space-850 border border-slate-700/80 hover:border-cyan-500/50 backdrop-blur-md shadow-xl shadow-black/50 text-slate-300 hover:text-white font-mono text-xs transition-all group focus:outline-none focus:ring-1 focus:ring-cyan-400"
          title="Show timeline slider"
          aria-label="Show timeline slider"
        >
          <Clock className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-slate-200">Timeline</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors ${
              Math.abs(timeOffsetSeconds) < 30
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            {formatOffset(timeOffsetSeconds)}
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-3xl pointer-events-auto">
      <div className="bg-space-900/90 border border-slate-700/80 backdrop-blur-md rounded-2xl shadow-2xl p-3 px-4 font-mono text-xs select-none">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-3 mb-2">
          {/* Left: Simulation Time & Delta */}
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-100 text-[13px]">
              {simDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}{' '}
              {simDate.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase transition-colors ${
                Math.abs(timeOffsetSeconds) < 30
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {formatOffset(timeOffsetSeconds)}
            </span>
          </div>

          {/* Right: Quick actions & Playback controls */}
          <div className="flex items-center gap-1.5">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                isPlaying
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
              }`}
              title={isPlaying ? 'Pause simulation' : 'Play time forward'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3 h-3 fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" /> Play
                </>
              )}
            </button>

            {/* Speed Multiplier Button */}
            <button
              onClick={cycleSpeed}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white text-[10px] hover:border-slate-600 transition-colors"
              title="Change simulation speed"
            >
              <FastForward className="w-3 h-3" />
              <span>{playbackSpeed}x</span>
            </button>

            {/* Quick Jumps */}
            <div className="hidden sm:flex items-center gap-1 ml-1 border-l border-slate-700/80 pl-2">
              <button
                onClick={() => setTimeOffsetSeconds(Math.max(MIN_OFFSET, timeOffsetSeconds - 3600))}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                title="Back 1 hour"
              >
                -1h
              </button>
              <button
                onClick={() => setTimeOffsetSeconds(Math.min(MAX_OFFSET, timeOffsetSeconds + 3600))}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                title="Forward 1 hour"
              >
                +1h
              </button>
              <button
                onClick={() => setTimeOffsetSeconds(Math.min(MAX_OFFSET, timeOffsetSeconds + 24 * 3600))}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                title="Forward 24 hours"
              >
                +24h
              </button>
            </div>

            {/* Reset to Now */}
            <button
              onClick={handleResetNow}
              disabled={timeOffsetSeconds === 0 && !isPlaying}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ml-1 ${
                timeOffsetSeconds !== 0 || isPlaying
                  ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-400 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Reset to current live time"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Now</span>
            </button>

            {/* Hide / Minimize Button */}
            <button
              onClick={() => setTimeSliderVisible(false)}
              className="flex items-center justify-center p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-colors ml-1"
              title="Hide timeline slider"
              aria-label="Hide timeline slider"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Range Slider Track */}
        <div className="relative flex items-center w-full mt-1">
          <input
            type="range"
            min={MIN_OFFSET}
            max={MAX_OFFSET}
            step={60} // 1 minute per step
            value={timeOffsetSeconds}
            onChange={handleSliderChange}
            aria-label="Time scrub slider (-2h to +48h)"
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all"
          />
        </div>

        {/* Graduation Timeline Marks */}
        <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1 px-0.5">
          <span className="hover:text-slate-300 cursor-pointer" onClick={() => setTimeOffsetSeconds(-7200)}>
            -2h
          </span>
          <span
            className={`font-semibold cursor-pointer ${
              Math.abs(timeOffsetSeconds) < 60 ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={handleResetNow}
          >
            Now
          </span>
          <span className="hover:text-slate-300 cursor-pointer" onClick={() => setTimeOffsetSeconds(6 * 3600)}>
            +6h
          </span>
          <span className="hover:text-slate-300 cursor-pointer" onClick={() => setTimeOffsetSeconds(12 * 3600)}>
            +12h
          </span>
          <span className="hover:text-slate-300 cursor-pointer" onClick={() => setTimeOffsetSeconds(24 * 3600)}>
            +24h (Tomorrow)
          </span>
          <span className="hover:text-slate-300 cursor-pointer" onClick={() => setTimeOffsetSeconds(36 * 3600)}>
            +36h
          </span>
          <span className="hover:text-slate-300 cursor-pointer" onClick={() => setTimeOffsetSeconds(48 * 3600)}>
            +48h
          </span>
        </div>
      </div>
    </div>
  );
};
