import React, { useState, useEffect, useRef } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface LoadingAlertProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
  loadedCount?: number;
}

export const LoadingAlert: React.FC<LoadingAlertProps> = ({
  isLoading,
  message = 'Fetching Celestial Telemetry...',
  subMessage = 'Connecting to CelesTrak orbital feeds & stellar catalogs',
  loadedCount,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const prevLoadingRef = useRef(isLoading);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // When transitioning from loading (true) -> finished (false)
    if (prevLoadingRef.current && !isLoading) {
      setShowSuccess(true);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => {
        setShowSuccess(false);
      }, 2200);
    } else if (isLoading) {
      setShowSuccess(false);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    }
    prevLoadingRef.current = isLoading;

    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, [isLoading]);

  const isVisible = isLoading || showSuccess;

  return (
    <>
      {/* 1. Top Shimmering Gradient Laser Beam (GitHub/YouTube style) */}
      <div
        className={`absolute top-0 inset-x-0 h-[2px] z-50 overflow-hidden pointer-events-none transition-opacity duration-300 ${
          isLoading ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-teal-300 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
      </div>

      {/* 2. Floating High-Tech Glass Alert Pill (Top-Center) */}
      <div
        className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ease-out ${
          isVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
        }`}
      >
        <div
          className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl backdrop-blur-xl border shadow-2xl transition-all duration-300 ${
            showSuccess
              ? 'bg-space-950/90 border-emerald-500/60 shadow-emerald-950/60 text-emerald-200'
              : 'bg-space-950/90 border-cyan-500/60 shadow-cyan-950/80 text-cyan-200'
          }`}
        >
          {/* Animated Icon Pill */}
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${
              showSuccess
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                : 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400'
            }`}
          >
            {showSuccess ? (
              <CheckCircle2 className="w-4 h-4 animate-in zoom-in-50" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            )}
          </div>

          {/* Text Content */}
          <div className="flex flex-col text-left pr-1 min-w-[170px] max-w-[280px] sm:max-w-[360px]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-xs tracking-wide text-slate-100">
                {showSuccess
                  ? 'Telemetry Synchronized'
                  : message}
              </span>
              <span
                className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded font-bold ${
                  showSuccess
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60 animate-pulse'
                }`}
              >
                {showSuccess ? 'Active' : 'Syncing'}
              </span>
            </div>

            <span className="text-[10px] font-mono text-slate-400 truncate">
              {showSuccess
                ? `${loadedCount !== undefined ? `${loadedCount.toLocaleString()} objects loaded` : 'Orbit ephemerides updated'}`
                : subMessage}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
