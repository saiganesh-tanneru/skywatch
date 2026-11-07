import React, { useState } from 'react';
import { useSkyStore } from '../store/useSkyStore';
import { SatelliteGroup, ViewMode, FilterState } from '../types';
import {
  Search,
  Layers,
  SlidersHorizontal,
  Check,
  X,
  Sun,
  Moon,
  Orbit,
  Sparkles,
  Radio,
  Flame,
  Compass,
  CircleDot,
  CheckCheck,
  Ban,
  Disc,
} from 'lucide-react';

interface GoogleEarthLayersProps {
  totalLoaded: number;
  totalVisible: number;
  isLoading: boolean;
}

interface FilterCategoryOption {
  key: keyof FilterState | SatelliteGroup;
  isGroup?: boolean;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export const GoogleEarthLayers: React.FC<GoogleEarthLayersProps> = ({
  totalLoaded,
  totalVisible,
  isLoading,
}) => {
  const {
    filters,
    setFilter,
    toggleSatelliteGroup,
    setSearchQuery,
    viewMode,
    setViewMode,
    isolateCategory,
    selectAllForView,
    deselectAllForView,
  } = useSkyStore();

  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewMode>(viewMode);

  // Keep activeTab synced with viewMode when view changes
  React.useEffect(() => {
    setActiveTab(viewMode);
  }, [viewMode]);

  // Section categories definition
  const solarCategories: FilterCategoryOption[] = [
    {
      key: 'planets',
      label: 'All Planets',
      desc: 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto',
      icon: Compass,
      color: '#38bdf8',
    },
    {
      key: 'sun',
      label: 'The Sun',
      desc: 'Yellow dwarf star (G2V) at heliocentric center',
      icon: Sun,
      color: '#f59e0b',
    },
    {
      key: 'moon',
      label: 'Moons',
      desc: 'Earth’s Moon and planetary satellites',
      icon: Moon,
      color: '#cbd5e1',
    },
    {
      key: 'asteroids',
      label: 'Mapped Asteroids',
      desc: 'Ceres, Vesta, Psyche, Bennu, Ryugu, Eros, Apophis with authentic imagery',
      icon: Orbit,
      color: '#fbbf24',
    },
    {
      key: 'beltBoulders',
      label: 'Main Belt Boulders',
      desc: 'Dust field and 60+ textured floating asteroids between 2.2 and 3.3 AU',
      icon: CircleDot,
      color: '#d97706',
    },
    {
      key: 'probes',
      label: 'Lunar Probes & Interplanetary Fleet',
      desc: 'Moon orbiters (LRO, Chandrayaan-2/3, Danuri, CAPSTONE, Apollo 11), Parker, JWST, Mars fleet',
      icon: Radio,
      color: '#06b6d4',
    },
    {
      key: 'meteors',
      label: 'Meteor Streams',
      desc: 'Perseids, Geminids, Leonids debris stream toruses',
      icon: Flame,
      color: '#c084fc',
    },
    {
      key: 'orbits',
      label: 'Orbital Paths',
      desc: 'Planetary and asteroid Keplerian orbit tracks',
      icon: Orbit,
      color: '#94a3b8',
    },
  ];

  const universeCategories: FilterCategoryOption[] = [
    {
      key: 'galaxies',
      label: 'Galaxies',
      desc: 'Andromeda, Triangulum, Sombrero, Whirlpool, Centaurus A',
      icon: Sparkles,
      color: '#38bdf8',
    },
    {
      key: 'blackHoles',
      label: 'Black Holes',
      desc: 'Sagittarius A*, M87*, TON 618 with relativistic jets',
      icon: CircleDot,
      color: '#f97316',
    },
    {
      key: 'deadStars',
      label: 'Dead / Dying Stars',
      desc: 'Planetary nebulae, white dwarfs & supernova remnants (Crab, Ring)',
      icon: Sparkles,
      color: '#f43f5e',
    },
    {
      key: 'wormholes',
      label: 'Wormholes',
      desc: 'Theoretical Einstein-Rosen & Ellis-Bronnikov spacetime bridges',
      icon: Orbit,
      color: '#a855f7',
    },
    {
      key: 'cosmicHorizon',
      label: 'Cosmic Horizon (CMB)',
      desc: 'Observable Universe sphere at z ≈ 1100 (46.5 Billion ly)',
      icon: Radio,
      color: '#fb7185',
    },
  ];

  const milkyWayCategories: FilterCategoryOption[] = [
    {
      key: 'mwCore',
      label: 'Galactic Core & Sgr A*',
      desc: 'Sagittarius A* supermassive black hole, Central Molecular Zone & Bulge',
      icon: CircleDot,
      color: '#f97316',
    },
    {
      key: 'mwArms',
      label: 'Spiral Arms',
      desc: 'Perseus, Orion-Cygnus Spur, Sagittarius, Scutum-Centaurus & Outer Arms',
      icon: Disc,
      color: '#38bdf8',
    },
    {
      key: 'mwStars',
      label: 'Giants & Extreme Stars',
      desc: 'Sun (Earth), Stephenson 2-18, Betelgeuse, Rigel, UY Scuti, Pistol Star, WR 102',
      icon: Sun,
      color: '#facc15',
    },
    {
      key: 'mwNebulae',
      label: 'Nebulae & Nurseries',
      desc: 'Orion M42, Carina, Eagle M16 Pillars, Crab Remnant, Helix, Radcliffe Wave',
      icon: Sparkles,
      color: '#f472b6',
    },
    {
      key: 'mwClusters',
      label: 'Globular Clusters (Halo)',
      desc: 'Omega Centauri (10M stars), M13 Hercules, 47 Tucanae in the Galactic halo',
      icon: Compass,
      color: '#c7d2fe',
    },
    {
      key: 'mwBlackHoles',
      label: 'Black Holes & Pulsars',
      desc: 'Gaia BH1, Gaia BH3, Cygnus X-1, SGR 1806-20 Magnetar, PSR J1748-2446ad',
      icon: Radio,
      color: '#ea580c',
    },
    {
      key: 'mwExoplanets',
      label: 'Exoplanet Systems',
      desc: 'TRAPPIST-1 (7 rocky worlds), Kepler-452b, 51 Pegasi, Proxima Centauri b',
      icon: Orbit,
      color: '#34d399',
    },
    {
      key: 'mwFermiBubbles',
      label: 'Fermi Bubbles',
      desc: 'Colossal 25,000 ly high-energy gamma-ray plasma lobes extending from core',
      icon: Flame,
      color: '#c084fc',
    },
  ];

  const domeCategories: FilterCategoryOption[] = [
    {
      key: 'planets',
      label: 'Visible Planets',
      desc: 'Mercury, Venus, Mars, Jupiter, Saturn',
      icon: Compass,
      color: '#38bdf8',
    },
    {
      key: 'moon',
      label: 'The Moon',
      desc: 'Observer topocentric lunar phase and altitude',
      icon: Moon,
      color: '#cbd5e1',
    },
    {
      key: 'sun',
      label: 'The Sun',
      desc: 'Real-time solar position & daylight track',
      icon: Sun,
      color: '#f59e0b',
    },
    {
      key: 'stars',
      label: 'Bright Stars',
      desc: 'Navigational star catalog & compass azimuths',
      icon: Sparkles,
      color: '#fde047',
    },
    {
      key: 'satellites',
      label: 'Satellites Overhead',
      desc: 'Space stations, visual payloads & Starlink passes',
      icon: Radio,
      color: '#22d3ee',
    },
    {
      key: 'asteroids',
      label: 'Near-Earth Asteroids',
      desc: 'NASA close-approach objects',
      icon: Orbit,
      color: '#fbbf24',
    },
    {
      key: 'meteors',
      label: 'Meteor Showers',
      desc: 'Active meteor shower radiants & peaks',
      icon: Flame,
      color: '#c084fc',
    },
  ];

  const globeCategories: FilterCategoryOption[] = [
    {
      key: 'stations',
      isGroup: true,
      label: 'Space Stations',
      desc: 'ISS, Tiangong & crewed orbital complexes',
      icon: Radio,
      color: '#38bdf8',
    },
    {
      key: 'visual',
      isGroup: true,
      label: 'Bright Visual Satellites',
      desc: 'Hubble, NOAA, Terra, naked-eye visible',
      icon: Sparkles,
      color: '#22d3ee',
    },
    {
      key: 'active',
      isGroup: true,
      label: 'Active Payloads',
      desc: 'Operational communications & weather satellites (~1,500)',
      icon: Compass,
      color: '#10b981',
    },
    {
      key: 'starlink',
      isGroup: true,
      label: 'Starlink Constellation',
      desc: 'Low-Earth orbit mega-constellation swarm',
      icon: Orbit,
      color: '#f59e0b',
    },
    {
      key: 'isro',
      isGroup: true,
      label: 'ISRO Satellites & Fleet',
      desc: 'AstroSat, XPoSat, NavIC constellation, EOS-04/06 radar & Cartosat',
      icon: Compass,
      color: '#f97316',
    },
  ];

  const getCategoriesForTab = (tab: ViewMode): FilterCategoryOption[] => {
    switch (tab) {
      case 'solar':
        return solarCategories;
      case 'milkyway':
        return milkyWayCategories;
      case 'universe':
        return universeCategories;
      case 'globe':
        return globeCategories;
      case '3d':
      case '2d':
      default:
        return domeCategories;
    }
  };

  const currentCategories = getCategoriesForTab(activeTab);

  // Check if a category is active
  const isCategoryActive = (cat: FilterCategoryOption): boolean => {
    if (cat.isGroup) {
      return Boolean(filters.satelliteGroups[cat.key as SatelliteGroup]);
    }
    return Boolean(filters[cat.key as keyof FilterState]);
  };

  // Toggle category on/off
  const handleToggle = (cat: FilterCategoryOption) => {
    if (cat.isGroup) {
      toggleSatelliteGroup(cat.key as SatelliteGroup);
    } else {
      const currentVal = Boolean(filters[cat.key as keyof FilterState]);
      setFilter(cat.key as keyof FilterState, !currentVal as any);
    }
  };

  // Isolate a category (solo mode: turn all others off)
  const handleIsolate = (cat: FilterCategoryOption, e: React.MouseEvent) => {
    e.stopPropagation();
    isolateCategory(cat.key as any, activeTab);
  };

  // Count active categories in this section
  const activeCount = currentCategories.filter(isCategoryActive).length;

  return (
    <div className="absolute top-4 left-4 z-40 flex flex-col gap-2 pointer-events-auto select-none max-w-sm sm:max-w-md w-full">
      {/* Floating Search Bar */}
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-space-900/90 border border-slate-700/80 backdrop-blur-md shadow-2xl transition-all focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500">
        <Search className="w-4 h-4 text-cyan-400 shrink-0" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeTab === 'solar'
              ? 'Filter Solar: Sun, Ceres, Mars, JWST...'
              : activeTab === 'milkyway'
              ? 'Filter Milky Way: Sgr A*, Betelgeuse, Orion...'
              : activeTab === 'universe'
              ? 'Filter Universe: Andromeda, TON 618...'
              : activeTab === 'globe'
              ? 'Filter Earth: ISS, Hubble, Starlink...'
              : 'Filter Dome: planets, stars, ISS, meteors...'
          }
          className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        {filters.searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-slate-400 hover:text-white"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="h-4 w-px bg-slate-700" />
        <button
          onClick={() => setIsLayersOpen(!isLayersOpen)}
          className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors ${
            isLayersOpen
              ? 'text-cyan-300 bg-cyan-950/70 border border-cyan-700/80'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Toggle Category Filters & Isolation"
          aria-label="Category Filters"
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-mono font-semibold hidden sm:inline">Filters</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
        </button>
      </div>

      {/* Floating Status / Overhead Pill */}
      <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-space-900/80 border border-slate-800/80 backdrop-blur-sm text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-300">
            {isLoading ? 'Propagating orbits...' : `${totalVisible} Objects Visible`}
          </span>
        </div>
        <span className="text-slate-500 text-[10px]">
          ({totalLoaded > 0 ? `${totalLoaded} tracked • ` : ''}{activeCount}/{currentCategories.length} Categories On)
        </span>
      </div>

      {/* Enhanced Multi-Section Filter Card */}
      {isLayersOpen && (
        <div className="p-4 rounded-2xl bg-space-900/95 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-xs space-y-3.5 animate-in fade-in slide-in-from-top-2">
          {/* Header & Quick Action Buttons */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-100 text-[13px]">
                Category Filters & Isolation
              </span>
            </div>
            <button
              onClick={() => setIsLayersOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close filter panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section Mode Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-space-950/80 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('3d');
                if (viewMode !== '3d' && viewMode !== '2d') setViewMode('3d');
              }}
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-medium transition-all text-center ${
                activeTab === '3d' || activeTab === '2d'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sky Dome
            </button>
            <button
              onClick={() => {
                setActiveTab('globe');
                if (viewMode !== 'globe') setViewMode('globe');
              }}
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-medium transition-all text-center ${
                activeTab === 'globe'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Earth
            </button>
            <button
              onClick={() => {
                setActiveTab('solar');
                if (viewMode !== 'solar') setViewMode('solar');
              }}
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-medium transition-all text-center ${
                activeTab === 'solar'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Solar
            </button>
            <button
              onClick={() => {
                setActiveTab('milkyway');
                if (viewMode !== 'milkyway') setViewMode('milkyway');
              }}
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-medium transition-all text-center ${
                activeTab === 'milkyway'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Milky Way
            </button>
            <button
              onClick={() => {
                setActiveTab('universe');
                if (viewMode !== 'universe') setViewMode('universe');
              }}
              className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-mono font-medium transition-all text-center ${
                activeTab === 'universe'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Universe
            </button>
          </div>

          {/* Section Action Bar: Select All / Deselect All */}
          <div className="flex items-center justify-between text-[11px] font-mono pt-0.5">
            <span className="text-slate-400 font-semibold">
              {activeCount} of {currentCategories.length} active
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => selectAllForView(activeTab)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800 text-cyan-300 text-[10px] transition-colors"
                title="Select all items in this section"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Select All</span>
              </button>
              <button
                onClick={() => deselectAllForView(activeTab)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 text-[10px] transition-colors"
                title="Deselect all items in this section"
              >
                <Ban className="w-3 h-3" />
                <span>Deselect All</span>
              </button>
            </div>
          </div>

          {/* Category List */}
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
            {currentCategories.map((cat) => {
              const active = isCategoryActive(cat);
              const IconComp = cat.icon;

              return (
                <div
                  key={String(cat.key)}
                  onClick={() => handleToggle(cat)}
                  className={`w-full p-2 rounded-xl text-left border transition-all flex items-center justify-between gap-2.5 cursor-pointer group ${
                    active
                      ? 'bg-space-850/90 border-slate-700/80 text-slate-100 hover:border-cyan-500/50'
                      : 'bg-space-950/50 border-slate-850 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Checkbox */}
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                        active
                          ? 'bg-cyan-500 border-cyan-400 text-space-950'
                          : 'border-slate-700 bg-space-900'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    {/* Icon with Color */}
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        borderColor: `${cat.color}35`,
                        color: cat.color,
                      }}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>

                    {/* Label & Description */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-xs truncate ${active ? 'text-slate-100' : 'text-slate-400'}`}>
                          {cat.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate leading-snug">
                        {cat.desc}
                      </p>
                    </div>
                  </div>

                  {/* Isolate Button */}
                  <button
                    onClick={(e) => handleIsolate(cat, e)}
                    className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-mono uppercase font-bold tracking-wider transition-all border bg-space-900 hover:bg-cyan-500 hover:text-space-950 hover:border-cyan-400 text-slate-400 border-slate-700"
                    title={`Isolate ${cat.label} (turn all other categories off)`}
                  >
                    Isolate
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
