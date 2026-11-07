import React, { useMemo, useState } from 'react';
import { useSkyStore } from '../store/useSkyStore';
import { SkyObject } from '../types';
import { altAzToPolar2D, azimuthToCompass } from '../lib/coordinates';

interface SkyPolar2DProps {
  objects: SkyObject[];
}

export const SkyPolar2D: React.FC<SkyPolar2DProps> = ({ objects }) => {
  const { selectedObject, setSelectedObject } = useSkyStore();
  const [hoveredObject, setHoveredObject] = useState<SkyObject | null>(null);

  const size = 720;
  const center = size / 2;
  const radius = size * 0.44;

  const cardinals = useMemo(
    () => [
      { label: 'N', az: 0, primary: true },
      { label: 'NE', az: 45, primary: false },
      { label: 'E', az: 90, primary: true },
      { label: 'SE', az: 135, primary: false },
      { label: 'S', az: 180, primary: true },
      { label: 'SW', az: 225, primary: false },
      { label: 'W', az: 270, primary: true },
      { label: 'NW', az: 315, primary: false },
    ],
    []
  );

  const spokes = useMemo(() => {
    const list = [];
    for (let az = 0; az < 360; az += 30) {
      const azRad = (az * Math.PI) / 180;
      const x = center - radius * Math.sin(azRad);
      const y = center - radius * Math.cos(azRad);
      list.push({ az, x, y });
    }
    return list;
  }, [center, radius]);

  const altitudeRings = useMemo(() => {
    return [0, 30, 60].map((alt) => {
      const r = ((90 - alt) / 90) * radius;
      return { alt, r };
    });
  }, [radius]);

  return (
    <div className="relative w-full h-full bg-space-950 flex items-center justify-center p-4 overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full max-w-[85vh] max-h-[85vh] drop-shadow-2xl"
        onClick={() => setSelectedObject(null)}
      >
        <defs>
          <radialGradient id="skyDomeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0b172a" />
            <stop offset="65%" stopColor="#08101e" />
            <stop offset="100%" stopColor="#030712" />
          </radialGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Sky Dome Background Disc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="url(#skyDomeGrad)"
          stroke="#06b6d4"
          strokeWidth="2"
        />

        {/* Spoke Lines */}
        {spokes.map(({ az, x, y }) => (
          <line
            key={`spoke-${az}`}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="#1e293b"
            strokeWidth="1"
            strokeDasharray={az % 90 === 0 ? undefined : '2,4'}
          />
        ))}

        {/* Altitude Rings */}
        {altitudeRings.map(({ alt, r }) => (
          <g key={`ring-${alt}`}>
            <circle
              cx={center}
              cy={center}
              r={r}
              fill="none"
              stroke={alt === 0 ? '#06b6d4' : '#334155'}
              strokeWidth={alt === 0 ? 2 : 1}
              strokeDasharray={alt === 0 ? undefined : '3,3'}
              opacity={alt === 0 ? 0.9 : 0.6}
            />
            {alt > 0 && (
              <text
                x={center}
                y={center - r - 4}
                fill="#38bdf8"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="middle"
                opacity="0.75"
              >
                +{alt}°
              </text>
            )}
          </g>
        ))}

        {/* Zenith Crosshair */}
        <line x1={center - 8} y1={center} x2={center + 8} y2={center} stroke="#38bdf8" strokeWidth="1.5" />
        <line x1={center} y1={center - 8} x2={center} y2={center + 8} stroke="#38bdf8" strokeWidth="1.5" />
        <text x={center + 12} y={center + 4} fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
          Zenith
        </text>

        {/* Cardinal Markers */}
        {cardinals.map(({ label, az, primary }) => {
          const azRad = (az * Math.PI) / 180;
          const labelR = radius + 22;
          const x = center - labelR * Math.sin(azRad);
          const y = center - labelR * Math.cos(azRad);

          return (
            <text
              key={`cardinal-${label}`}
              x={x}
              y={y + 4}
              fill={primary ? (label === 'N' ? '#38bdf8' : '#e2e8f0') : '#64748b'}
              fontSize={primary ? '13' : '10'}
              fontWeight={primary ? 'bold' : 'normal'}
              fontFamily="monospace"
              textAnchor="middle"
            >
              {label}
            </text>
          );
        })}

        {/* Celestial & Satellite Objects Plotted with Illustrative Graphics */}
        {objects.map((obj) => {
          if (obj.altitude < 0) return null;

          const pt = altAzToPolar2D(obj.altitude, obj.azimuth, center, center, radius);
          const isSelected = selectedObject?.id === obj.id;
          const isHovered = hoveredObject?.id === obj.id;

          return (
            <g
              key={obj.id}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject(obj);
              }}
              onMouseEnter={() => setHoveredObject(obj)}
              onMouseLeave={() => setHoveredObject(null)}
            >
              {/* Invisible Generous Click Target Circle */}
              <circle cx={pt.x} cy={pt.y} r={16} fill="transparent" />

              {/* Selection Ring */}
              {isSelected && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={14}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  className="animate-pulse"
                />
              )}

              {/* Hover Highlight */}
              {isHovered && !isSelected && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={12}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />
              )}

              {/* SUN: Radiant starburst with rays */}
              {obj.type === 'sun' && (
                <g>
                  {/* Rays */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                    const rRad = (deg * Math.PI) / 180;
                    return (
                      <line
                        key={`ray-${deg}`}
                        x1={pt.x + 9 * Math.cos(rRad)}
                        y1={pt.y + 9 * Math.sin(rRad)}
                        x2={pt.x + 13 * Math.cos(rRad)}
                        y2={pt.y + 13 * Math.sin(rRad)}
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                    );
                  })}
                  <circle cx={pt.x} cy={pt.y} r={8} fill="#fde047" stroke="#b45309" strokeWidth="1" />
                </g>
              )}

              {/* MOON: Crescent / crater disc */}
              {obj.type === 'moon' && (
                <g>
                  <circle cx={pt.x} cy={pt.y} r={7} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
                  <circle cx={pt.x - 2} cy={pt.y - 1} r={2} fill="#64748b" opacity="0.6" />
                  <circle cx={pt.x + 2} cy={pt.y + 2} r={1.5} fill="#64748b" opacity="0.6" />
                </g>
              )}

              {/* SATURN: Planet with rings */}
              {obj.type === 'planet' && obj.name === 'Saturn' && (
                <g>
                  <ellipse cx={pt.x} cy={pt.y} rx={11} ry={4} fill="none" stroke="#eab308" strokeWidth="2" transform={`rotate(-20 ${pt.x} ${pt.y})`} />
                  <circle cx={pt.x} cy={pt.y} r={5} fill="#ca8a04" />
                </g>
              )}

              {/* JUPITER: Banded planet */}
              {obj.type === 'planet' && obj.name === 'Jupiter' && (
                <g>
                  <circle cx={pt.x} cy={pt.y} r={6.5} fill="#f59e0b" />
                  <line x1={pt.x - 6} y1={pt.y - 1.5} x2={pt.x + 6} y2={pt.y - 1.5} stroke="#78350f" strokeWidth="1.5" />
                  <line x1={pt.x - 6} y1={pt.y + 2} x2={pt.x + 6} y2={pt.y + 2} stroke="#78350f" strokeWidth="1.2" />
                  <circle cx={pt.x + 2} cy={pt.y + 2} r={1.2} fill="#dc2626" />
                </g>
              )}

              {/* MARS: Rust red with white pole */}
              {obj.type === 'planet' && obj.name === 'Mars' && (
                <g>
                  <circle cx={pt.x} cy={pt.y} r={5} fill="#ef4444" />
                  <ellipse cx={pt.x} cy={pt.y - 3.5} rx={2} ry={1} fill="#ffffff" />
                </g>
              )}

              {/* OTHER PLANETS */}
              {obj.type === 'planet' && obj.name !== 'Saturn' && obj.name !== 'Jupiter' && obj.name !== 'Mars' && (
                <circle cx={pt.x} cy={pt.y} r={5} fill={obj.color || '#f59e0b'} />
              )}

              {/* SPACE CRAFT (ISS / TIANGONG / HUBBLE / ACTIVE SATELLITES) */}
              {obj.type === 'satellite' && (
                <g>
                  {obj.noradId === 25544 || obj.name.includes('ISS') ? (
                    <image
                      href="/images/satellites/iss.svg"
                      x={pt.x - 12}
                      y={pt.y - 12}
                      width="24"
                      height="24"
                    />
                  ) : obj.noradId === 48274 || obj.name.includes('TIANGONG') || obj.name.includes('CSS') ? (
                    <image
                      href="/images/satellites/tiangong.svg"
                      x={pt.x - 10}
                      y={pt.y - 10}
                      width="20"
                      height="20"
                    />
                  ) : obj.noradId === 20580 || obj.name.includes('HUBBLE') || obj.name.includes('HST') ? (
                    <image
                      href="/images/satellites/hubble.svg"
                      x={pt.x - 9}
                      y={pt.y - 9}
                      width="18"
                      height="18"
                    />
                  ) : (
                    <image
                      href="/images/satellites/satellite_comms.svg"
                      x={pt.x - 7}
                      y={pt.y - 7}
                      width="14"
                      height="14"
                    />
                  )}
                </g>
              )}

              {/* STAR: 4-Point Diamond Starburst */}
              {obj.type === 'star' && (
                <g>
                  <polygon
                    points={`${pt.x},${pt.y - 4.5} ${pt.x + 1.5},${pt.y} ${pt.x},${pt.y + 4.5} ${pt.x - 1.5},${pt.y}`}
                    fill={obj.color || '#ffffff'}
                  />
                  <polygon
                    points={`${pt.x - 4.5},${pt.y} ${pt.x},${pt.y + 1.5} ${pt.x + 4.5},${pt.y} ${pt.x},${pt.y - 1.5}`}
                    fill={obj.color || '#ffffff'}
                  />
                </g>
              )}

              {/* Object Label Pill Badge */}
              {(isSelected ||
                isHovered ||
                obj.type === 'sun' ||
                obj.type === 'moon' ||
                obj.type === 'planet' ||
                obj.noradId === 25544 ||
                (obj.magnitude !== undefined && obj.magnitude < 2.5)) && (
                <g
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedObject(obj);
                  }}
                  onMouseEnter={() => setHoveredObject(obj)}
                >
                  {/* Subtle label background pill for clear readability and generous click target */}
                  <rect
                    x={pt.x - Math.max(24, obj.name.length * 3.2 + 6)}
                    y={pt.y - 20}
                    width={Math.max(48, obj.name.length * 6.4 + 12)}
                    height={16}
                    rx={4}
                    fill={isSelected ? '#0284c7' : '#090d16'}
                    fillOpacity={0.9}
                    stroke={isSelected ? '#38bdf8' : '#334155'}
                    strokeWidth={isSelected ? 1.5 : 0.8}
                  />
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    fill={isSelected ? '#ffffff' : '#e2e8f0'}
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {obj.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating HUD info */}
      <div className="absolute bottom-10 left-4 pointer-events-none flex flex-col gap-1 text-[11px] font-mono text-slate-400 bg-space-900/80 p-2.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>2D Polar Sky Chart (Planisphere)</span>
        </div>
        <div className="text-slate-400">
          Zenith at center • Outer perimeter is Horizon (0°) • East is Left
        </div>
        {hoveredObject && (
          <div className="text-sky-300 font-semibold pt-1 border-t border-slate-800">
            {hoveredObject.name} ({hoveredObject.type}): Alt {hoveredObject.altitude.toFixed(1)}°, Az {hoveredObject.azimuth.toFixed(1)}° ({azimuthToCompass(hoveredObject.azimuth)})
          </div>
        )}
      </div>
    </div>
  );
};
