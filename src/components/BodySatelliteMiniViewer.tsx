import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Billboard, Html } from '@react-three/drei';
import { textureFactory } from '../lib/celestialTextures';
import { SOLAR_MISSIONS, missionToSkyObject } from '../lib/solarSatellites';
import { SkyObject } from '../types';

export interface BodySatelliteItem {
  id: string;
  name: string;
  agency: string;
  orbitRadius: number;
  inclination: number;
  speed: number;
  launchYear: number;
  description: string;
  skyObject: SkyObject;
}

// Curated Earth flagships for Earth Mini-Viewer
const EARTH_FLAGSHIP_MISSIONS: {
  id: string;
  name: string;
  agency: string;
  orbitRadius: number;
  inclination: number;
  speed: number;
  launchYear: number;
  description: string;
}[] = [
  {
    id: 'sat-25544',
    name: 'ISS (International Space Station)',
    agency: 'NASA / International',
    orbitRadius: 1.6,
    inclination: 0.52,
    speed: 0.8,
    launchYear: 1998,
    description: 'Humanity’s premier crewed orbital laboratory orbiting Earth at 420 km altitude.',
  },
  {
    id: 'sat-48274',
    name: 'CSS (Tiangong Space Station)',
    agency: 'CNSA',
    orbitRadius: 1.7,
    inclination: 0.42,
    speed: 0.78,
    launchYear: 2021,
    description: 'China’s modular permanent space station orbiting in low Earth orbit.',
  },
  {
    id: 'sat-20580',
    name: 'Hubble Space Telescope',
    agency: 'NASA / ESA',
    orbitRadius: 1.85,
    inclination: 0.28,
    speed: 0.75,
    launchYear: 1990,
    description: 'Veteran optical observatory that revolutionized our understanding of the cosmos.',
  },
  {
    id: 'sat-40930',
    name: 'AstroSat',
    agency: 'ISRO',
    orbitRadius: 1.95,
    inclination: 0.1,
    speed: 0.74,
    launchYear: 2015,
    description: 'India’s multi-wavelength space astronomy observatory studying high-energy celestial sources.',
  },
  {
    id: 'sat-58694',
    name: 'XPoSat',
    agency: 'ISRO',
    orbitRadius: 2.1,
    inclination: 0.12,
    speed: 0.72,
    launchYear: 2024,
    description: 'ISRO X-ray Polarimeter Satellite analyzing polarized cosmic emissions from black holes.',
  },
  {
    id: 'sat-43286',
    name: 'NavIC (IRNSS-1I)',
    agency: 'ISRO',
    orbitRadius: 2.35,
    inclination: 0.35,
    speed: 0.4,
    launchYear: 2018,
    description: 'Indian Regional Navigation Satellite System providing sovereign satellite positioning.',
  },
];

/**
 * Resolves the parent celestial body name from an object (planet, moon, sun, or satellite).
 */
export function resolveParentBody(obj: SkyObject): {
  bodyName: string;
  isSatellite: boolean;
} {
  const nameUpper = obj.name.toUpperCase();
  const descUpper = obj.description ? obj.description.toUpperCase() : '';

  if (obj.type === 'satellite') {
    if (descUpper.includes('TARGET: MOON') || nameUpper.includes('CHANDRAYAAN') || nameUpper.includes('LRO') || nameUpper.includes('DANURI') || nameUpper.includes('CAPSTONE') || nameUpper.includes('QUEQIAO') || nameUpper.includes('APOLLO 11')) {
      return { bodyName: 'Moon', isSatellite: true };
    }
    if (descUpper.includes('TARGET: MARS') || nameUpper.includes('MRO') || nameUpper.includes('MANGALYAAN') || nameUpper.includes('MAVEN') || nameUpper.includes('EXOMARS') || nameUpper.includes('HOPE')) {
      return { bodyName: 'Mars', isSatellite: true };
    }
    if (descUpper.includes('TARGET: JUPITER') || nameUpper.includes('JUNO') || nameUpper.includes('JUICE') || nameUpper.includes('EUROPA CLIPPER')) {
      return { bodyName: 'Jupiter', isSatellite: true };
    }
    if (descUpper.includes('TARGET: SATURN') || nameUpper.includes('CASSINI')) {
      return { bodyName: 'Saturn', isSatellite: true };
    }
    if (descUpper.includes('TARGET: MERCURY') || nameUpper.includes('BEPICOLOMBO') || nameUpper.includes('MESSENGER')) {
      return { bodyName: 'Mercury', isSatellite: true };
    }
    if (descUpper.includes('TARGET: VENUS') || nameUpper.includes('AKATSUKI') || nameUpper.includes('VENUS EXPRESS')) {
      return { bodyName: 'Venus', isSatellite: true };
    }
    if (descUpper.includes('TARGET: SUN') || nameUpper.includes('PARKER') || nameUpper.includes('ADITYA') || nameUpper.includes('SOLAR ORBITER')) {
      return { bodyName: 'Sun', isSatellite: true };
    }
    // Default Earth for general LEO/GEO satellites
    return { bodyName: 'Earth', isSatellite: true };
  }

  if (obj.type === 'moon' || nameUpper.includes('MOON')) {
    return { bodyName: 'Moon', isSatellite: false };
  }
  if (nameUpper.includes('SUN')) {
    return { bodyName: 'Sun', isSatellite: false };
  }
  if (nameUpper.includes('MERCURY')) {
    return { bodyName: 'Mercury', isSatellite: false };
  }
  if (nameUpper.includes('VENUS')) {
    return { bodyName: 'Venus', isSatellite: false };
  }
  if (nameUpper.includes('EARTH')) {
    return { bodyName: 'Earth', isSatellite: false };
  }
  if (nameUpper.includes('MARS')) {
    return { bodyName: 'Mars', isSatellite: false };
  }
  if (nameUpper.includes('JUPITER')) {
    return { bodyName: 'Jupiter', isSatellite: false };
  }
  if (nameUpper.includes('SATURN')) {
    return { bodyName: 'Saturn', isSatellite: false };
  }
  if (nameUpper.includes('URANUS')) {
    return { bodyName: 'Uranus', isSatellite: false };
  }
  if (nameUpper.includes('NEPTUNE')) {
    return { bodyName: 'Neptune', isSatellite: false };
  }

  return { bodyName: obj.name, isSatellite: false };
}

/**
 * Returns all active/historic satellites and orbiters around the given body.
 */
export function getSatellitesForBody(bodyName: string): BodySatelliteItem[] {
  const norm = bodyName.toLowerCase();

  if (norm.includes('earth')) {
    return EARTH_FLAGSHIP_MISSIONS.map((m) => ({
      ...m,
      skyObject: {
        id: m.id,
        name: m.name,
        type: 'satellite',
        azimuth: 180,
        altitude: 45,
        velocityKmS: 7.6,
        distanceKm: 420,
        description: `[${m.agency} • Orbiting Earth • Launched ${m.launchYear}] ${m.description}`,
      },
    }));
  }

  // Interplanetary & Lunar missions from SOLAR_MISSIONS
  return SOLAR_MISSIONS.filter(
    (m) =>
      (m.parentPlanet && m.parentPlanet.toLowerCase() === norm) ||
      (m.target && m.target.toLowerCase() === norm)
  ).map((m, idx) => ({
    id: m.id,
    name: m.name,
    agency: m.agency,
    orbitRadius: m.orbitRadius > 0 ? 1.5 + (idx % 4) * 0.35 : 1.6 + idx * 0.4,
    inclination: m.inclination || 0.2 + idx * 0.15,
    speed: 0.6 - idx * 0.05,
    launchYear: m.launchYear,
    description: m.description,
    skyObject: missionToSkyObject(m),
  }));
}

interface OrbitingSatelliteNodeProps {
  item: BodySatelliteItem;
  index: number;
  isSelected: boolean;
  onSelect: (skyObj: SkyObject) => void;
  commsTex: THREE.Texture;
  hubbleTex: THREE.Texture;
}

const OrbitingSatelliteNode: React.FC<OrbitingSatelliteNodeProps> = ({
  item,
  index,
  isSelected,
  onSelect,
  commsTex,
  hubbleTex,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const initialOffset = useMemo(() => (index * Math.PI * 2) / 6, [index]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * item.speed + initialOffset;
    const r = item.orbitRadius;
    const inc = item.inclination;

    const x = r * Math.cos(t);
    const y = r * Math.sin(inc) * Math.sin(t);
    const z = r * Math.cos(inc) * Math.sin(t);
    groupRef.current.position.set(x, y, z);
  });

  // Pre-generate orbit ring geometry
  const orbitLine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const steps = 48;
    const r = item.orbitRadius;
    const inc = item.inclination;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          r * Math.cos(theta),
          r * Math.sin(inc) * Math.sin(theta),
          r * Math.cos(inc) * Math.sin(theta)
        )
      );
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const isIsro = item.agency.includes('ISRO');
    const mat = new THREE.LineBasicMaterial({
      color: isIsro ? 0xf97316 : 0x38bdf8,
      transparent: true,
      opacity: isSelected ? 0.65 : 0.22,
    });
    return new THREE.Line(geom, mat);
  }, [item.orbitRadius, item.inclination, item.agency, isSelected]);

  const isHubbleType = item.name.includes('Hubble') || item.name.includes('AstroSat');

  return (
    <>
      {/* 3D Orbit Track */}
      <primitive object={orbitLine} />

      {/* Orbiting Spacecraft Node */}
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.skyObject);
        }}
      >
        <Billboard follow={true}>
          <mesh>
            <planeGeometry args={[0.34, 0.34]} />
            <meshBasicMaterial
              map={isHubbleType ? hubbleTex : commsTex}
              transparent
              depthWrite={false}
            />
          </mesh>
        </Billboard>

        {/* Selection / Highlight Halo */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[0.26, 0.38, 24]} />
            <meshBasicMaterial
              color={item.agency.includes('ISRO') ? '#f97316' : '#38bdf8'}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Floating Mini-Tag */}
        <Billboard position={[0, 0.36, 0]}>
          <Html center distanceFactor={8} zIndexRange={[10, 0]}>
            <div
              className={`px-1 py-0.2 rounded font-mono text-[8px] whitespace-nowrap cursor-pointer transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-space-950 font-bold shadow-md shadow-cyan-500/50'
                  : 'bg-space-950/85 text-slate-300 border border-slate-700/80 hover:text-cyan-300 hover:border-cyan-500'
              }`}
            >
              {item.agency.includes('ISRO') ? '🇮🇳 ' : ''}
              {item.name.split(' (')[0]}
            </div>
          </Html>
        </Billboard>
      </group>
    </>
  );
};

interface BodySatelliteMiniViewerProps {
  selectedObject: SkyObject;
  onSelectSatellite: (skyObj: SkyObject) => void;
}

export const BodySatelliteMiniViewer: React.FC<BodySatelliteMiniViewerProps> = ({
  selectedObject,
  onSelectSatellite,
}) => {
  const { bodyName } = resolveParentBody(selectedObject);
  const satellites = useMemo(() => getSatellitesForBody(bodyName), [bodyName]);

  // Textures
  const earthTex = useMemo(() => textureFactory.getEarthTexture(), []);
  const moonTex = useMemo(() => textureFactory.getMoonTexture(), []);
  const marsTex = useMemo(() => textureFactory.getMarsTexture(), []);
  const jupiterTex = useMemo(() => textureFactory.getJupiterTexture(), []);
  const saturnTex = useMemo(() => textureFactory.getSaturnTexture(), []);
  const sunTex = useMemo(() => textureFactory.getSunTexture(), []);
  const mercuryTex = useMemo(() => textureFactory.getMercuryTexture(), []);
  const venusTex = useMemo(() => textureFactory.getVenusTexture(), []);

  const commsTex = useMemo(() => textureFactory.getSpacecraftTexture('satellite'), []);
  const hubbleTex = useMemo(() => textureFactory.getSpacecraftTexture('hubble'), []);

  // Determine central texture
  const centerTex = useMemo(() => {
    const norm = bodyName.toLowerCase();
    if (norm.includes('moon')) return moonTex;
    if (norm.includes('mars')) return marsTex;
    if (norm.includes('jupiter')) return jupiterTex;
    if (norm.includes('saturn')) return saturnTex;
    if (norm.includes('sun')) return sunTex;
    if (norm.includes('mercury')) return mercuryTex;
    if (norm.includes('venus')) return venusTex;
    return earthTex;
  }, [bodyName, earthTex, moonTex, marsTex, jupiterTex, saturnTex, sunTex, mercuryTex, venusTex]);

  const isSaturn = bodyName.toLowerCase().includes('saturn');

  return (
    <div className="relative w-full h-44 bg-gradient-to-b from-space-900 to-space-950 border-b border-slate-800 overflow-hidden select-none">
      {/* Background Starfield Sparkle */}
      <div className="absolute inset-0 bg-radial from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Top Left Status Badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-space-950/80 border border-slate-700/80 backdrop-blur-md text-[10px] text-slate-300 font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-semibold text-cyan-200">{bodyName}</span>
        {satellites.length > 0 && (
          <span className="text-slate-400">
            • {satellites.length} Satellite{satellites.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Interactive Drag Hint */}
      <div className="absolute bottom-1 right-2 z-10 text-[9px] text-slate-500 font-mono pointer-events-none">
        Drag to rotate • Click satellite
      </div>

      {/* 3D Interactive Canvas */}
      <Canvas
        camera={{ position: [0, 1.4, 4.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 4, 6]} intensity={1.5} />
        <pointLight position={[-4, -2, -2]} intensity={0.4} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(3 * Math.PI) / 4}
        />

        {/* Central 3D Celestial Body */}
        <group>
          <mesh>
            <sphereGeometry args={[1.05, 36, 36]} />
            <meshStandardMaterial
              map={centerTex}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Saturn's Rings */}
          {isSaturn && (
            <mesh rotation={[-Math.PI / 2.3, 0.2, 0]}>
              <ringGeometry args={[1.35, 2.2, 48]} />
              <meshBasicMaterial
                color="#e2d4b7"
                side={THREE.DoubleSide}
                transparent
                opacity={0.75}
              />
            </mesh>
          )}
        </group>

        {/* Orbiting Satellites Swarm */}
        {satellites.map((sat, i) => (
          <OrbitingSatelliteNode
            key={sat.id}
            item={sat}
            index={i}
            isSelected={selectedObject.id === sat.id || selectedObject.name.includes(sat.name.split(' (')[0])}
            onSelect={onSelectSatellite}
            commsTex={commsTex}
            hubbleTex={hubbleTex}
          />
        ))}
      </Canvas>
    </div>
  );
};
