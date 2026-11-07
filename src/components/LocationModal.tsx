import React, { useState, useEffect } from 'react';
import { useSkyStore, DEFAULT_LOCATIONS } from '../store/useSkyStore';
import { ObserverLocation } from '../types';
import { MapPin, Navigation, X, Check, AlertCircle, Compass, Building, Globe } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestGps: () => void;
  isLocating: boolean;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onRequestGps,
  isLocating,
}) => {
  const { location, setLocation, locationError } = useSkyStore();

  const [latInput, setLatInput] = useState('');
  const [lonInput, setLonInput] = useState('');
  const [elevationInput, setElevationInput] = useState('20');
  const [nameInput, setNameInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLatInput(location.latitude.toString());
      setLonInput(location.longitude.toString());
      setElevationInput(location.elevationMeters.toString());
      setNameInput(location.name);
      setFormError(null);
      setSaveSuccess(null);
    }
  }, [isOpen, location]);

  if (!isOpen) return null;

  // Direct 1-click preset selection & save
  const handlePresetSelect = (preset: ObserverLocation) => {
    const updated: ObserverLocation = {
      ...preset,
      updatedAt: Date.now(),
    };
    setLocation(updated);
    setSaveSuccess(`Applied: ${preset.name}`);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();

    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);
    const elev = parseFloat(elevationInput) || 0;

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setFormError('Latitude must be a number between -90° and +90°');
      return;
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      setFormError('Longitude must be a number between -180° and +180°');
      return;
    }

    const customLocation: ObserverLocation = {
      name: nameInput.trim() || `Custom (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
      latitude: Number(lat.toFixed(4)),
      longitude: Number(lon.toFixed(4)),
      elevationMeters: Math.max(0, Math.round(elev)),
      source: 'manual',
      updatedAt: Date.now(),
    };

    setLocation(customLocation);
    setSaveSuccess(`Saved location: ${customLocation.name}`);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-space-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-space-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 id="location-modal-title" className="text-base font-semibold text-slate-100">
                Observer Location
              </h2>
              <p className="text-xs text-slate-400">
                Calculates horizon, altitude rings, and pass times for your vantage point.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close location settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-teal-950/60 border border-teal-500/50 text-teal-200 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* Warning / Error banner */}
          {locationError && !saveSuccess && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-300">Location Notice</p>
                <p className="mt-0.5 leading-relaxed text-amber-200/90">{locationError}</p>
              </div>
            </div>
          )}

          {/* Current Active Location Display */}
          <div className="p-3 rounded-xl bg-space-850/80 border border-slate-700/60 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="text-slate-400">Current: </span>
                <span className="font-semibold text-slate-200">{location.name}</span>
                <span className="text-[10px] font-mono text-slate-400 ml-2">
                  ({location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°)
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
              {location.source}
            </span>
          </div>

          {/* Auto-Detect Action */}
          <div>
            <button
              type="button"
              onClick={onRequestGps}
              disabled={isLocating}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-lg shadow-cyan-950/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              {isLocating ? 'Detecting Location (GPS / IP)...' : 'Auto-Detect My Location (GPS / IP)'}
            </button>
          </div>

          {/* Preset Cities - 1-Click Apply */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-cyan-400" />
                Quick Preset Cities
              </span>
              <span className="text-[11px] text-cyan-400 font-medium">Click to apply instantly</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEFAULT_LOCATIONS.map((preset) => {
                const isSelected =
                  location.latitude === preset.latitude &&
                  location.longitude === preset.longitude;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-3 py-2 text-left rounded-lg text-xs font-medium border transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500/50'
                        : 'bg-space-850 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-cyan-500/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate font-semibold">{preset.name.split(',')[0]}</span>
                      {isSelected && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {preset.name.split(',')[1]?.trim() || ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleManualSave} className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Or Enter Custom Coordinates
              </span>
            </div>

            {formError && (
              <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Location Label (optional)
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. My Observatory, Philadelphia, Backyard"
                  className="w-full px-3 py-1.5 rounded-lg bg-space-850 border border-slate-700 text-slate-100 text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Latitude (-90° to +90°) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    required
                    value={latInput}
                    onChange={(e) => setLatInput(e.target.value)}
                    placeholder="e.g. 39.9526"
                    className="w-full px-3 py-1.5 rounded-lg bg-space-850 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none placeholder:text-slate-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">+ North, - South</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Longitude (-180° to +180°) <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    required
                    value={lonInput}
                    onChange={(e) => setLonInput(e.target.value)}
                    placeholder="e.g. -75.1652"
                    className="w-full px-3 py-1.5 rounded-lg bg-space-850 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none placeholder:text-slate-600"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">+ East, - West</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Elevation above sea level (meters)
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="8848"
                  value={elevationInput}
                  onChange={(e) => setElevationInput(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full px-3 py-1.5 rounded-lg bg-space-850 border border-slate-700 text-slate-100 font-mono text-xs focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-space-950 flex items-center gap-1.5 shadow-md shadow-cyan-950 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Coordinates
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
