import React, { useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useSkyStore } from '../store/useSkyStore';
import { SkyObject } from '../types';
import { textureFactory } from '../lib/celestialTextures';
import {
  SOLAR_MISSIONS,
  getMissionSolarPos,
  missionToSkyObject,
} from '../lib/solarSatellites';
import {
  SOLAR_ASTEROIDS,
  calculateAsteroidPosition,
  asteroidToSkyObject,
  SolarSystemAsteroid,
} from '../lib/solarAsteroids';

export interface SolarSystem3DRef {
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToObject: (obj: SkyObject) => void;
}

/**
 * Logarithmic / compressed distance scaling so inner & outer planets are visible together.
 * 1 AU (Earth) = 28 units
 */
export function scaleHelioAU(x: number, y: number, z: number): THREE.Vector3 {
  const distAU = Math.sqrt(x * x + y * y + z * z);
  if (distAU === 0) return new THREE.Vector3(0, 0, 0);

  // Scaled distance: Mercury (0.39 AU) ~18 units, Earth (1 AU) = 28 units, Jupiter (5.2 AU) = 62 units, Neptune (30 AU) = 135 units
  const scaledDist = 28 * Math.pow(distAU, 0.46);
  const factor = scaledDist / distAU;

  // X and Y are in the ecliptic plane, Z is normal to ecliptic
  return new THREE.Vector3(x * factor, z * factor, -y * factor);
}

/**
 * Computes 3D position of an object in the Solar System Orrery
 */
function getSolarSystemPosition(obj: SkyObject, earthPos: THREE.Vector3): THREE.Vector3 {
  if (obj.type === 'moon') {
    // Moon orbit around Earth at ~5.2 units in orrery scale
    const mAngle = ((obj.azimuth || 45) * Math.PI) / 180;
    return new THREE.Vector3(
      earthPos.x + 5.2 * Math.cos(mAngle),
      earthPos.y + 0.8 * Math.sin(mAngle * 2),
      earthPos.z + 5.2 * Math.sin(mAngle)
    );
  }

  if (obj.helioX !== undefined && obj.helioY !== undefined && obj.helioZ !== undefined) {
    return scaleHelioAU(obj.helioX, obj.helioY, obj.helioZ);
  }

  return scaleHelioAU(1, 0, 0);
}

/**
 * Main Asteroid Belt (Between Mars and Jupiter: 2.2 to 3.2 AU)
 * Combines fine particle dust and textured asteroid boulders
 */
const AsteroidBelt: React.FC<{ asteroidTex: THREE.Texture }> = ({ asteroidTex }) => {
  const points = useMemo(() => {
    const count = 1800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const au = 2.2 + Math.random() * 1.1; // 2.2 to 3.3 AU
      const angle = Math.random() * Math.PI * 2;
      const incl = (Math.random() - 0.5) * 0.15; // slight orbital inclination

      const scaled = scaleHelioAU(
        au * Math.cos(angle),
        au * Math.sin(angle),
        au * incl
      );

      positions[i * 3] = scaled.x + (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = scaled.y + (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 2] = scaled.z + (Math.random() - 0.5) * 1.5;

      colors[i * 3] = 0.7;
      colors[i * 3 + 1] = 0.65;
      colors[i * 3 + 2] = 0.55;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  // Clustered textured asteroid boulders scattered in the belt
  const beltBoulders = useMemo(() => {
    const boulders: { pos: THREE.Vector3; size: number }[] = [];
    const count = 60;
    for (let i = 0; i < count; i++) {
      const au = 2.2 + Math.random() * 1.1;
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const incl = (Math.random() - 0.5) * 0.12;
      const scaled = scaleHelioAU(
        au * Math.cos(angle),
        au * Math.sin(angle),
        au * incl
      );
      boulders.push({
        pos: new THREE.Vector3(
          scaled.x + (Math.random() - 0.5) * 1.5,
          scaled.y + (Math.random() - 0.5) * 1.5,
          scaled.z + (Math.random() - 0.5) * 1.5
        ),
        size: 0.5 + Math.random() * 0.8,
      });
    }
    return boulders;
  }, []);

  return (
    <group>
      <points geometry={points}>
        <pointsMaterial
          size={1.1}
          vertexColors
          transparent
          opacity={0.65}
          sizeAttenuation={false}
        />
      </points>

      {/* Scattered textured asteroid boulders */}
      {beltBoulders.map((b, i) => (
        <Billboard key={`belt-boulder-${i}`} position={b.pos} follow={true}>
          <mesh>
            <planeGeometry args={[b.size, b.size]} />
            <meshBasicMaterial map={asteroidTex} transparent opacity={0.75} depthWrite={false} />
          </mesh>
        </Billboard>
      ))}
    </group>
  );
};

/**
 * Major Meteor Shower Debris Streams (Torus orbits crossing Earth's path)
 */
const MeteorShowerStreams: React.FC = () => {
  const streams = useMemo(() => {
    const list: { name: string; line: THREE.Line; color: string }[] = [];

    const streamConfigs = [
      { name: 'Perseids (109P/Swift-Tuttle)', q: 0.96, Q: 5.1, incl: 0.35, color: '#a855f7' },
      { name: 'Geminids (3200 Phaethon)', q: 0.14, Q: 2.4, incl: 0.22, color: '#c084fc' },
      { name: 'Leonids (55P/Tempel-Tuttle)', q: 0.98, Q: 4.8, incl: 0.28, color: '#e879f9' },
    ];

    streamConfigs.forEach((cfg) => {
      const pts: THREE.Vector3[] = [];
      const steps = 96;
      const a = (cfg.q + cfg.Q) / 2;
      const e = (cfg.Q - cfg.q) / (cfg.Q + cfg.q);

      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const z = y * Math.sin(cfg.incl);

        pts.push(scaleHelioAU(x, y * Math.cos(cfg.incl), z));
      }

      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.45,
      });

      list.push({ name: cfg.name, line: new THREE.Line(geom, mat), color: cfg.color });
    });

    return list;
  }, []);

  return (
    <group>
      {streams.map((s) => (
        <primitive key={s.name} object={s.line} />
      ))}
    </group>
  );
};

interface SolarSystem3DProps {
  objects: SkyObject[];
}

const SolarSystemCameraController: React.FC<{
  controlsRef: React.RefObject<any>;
  earthPos: THREE.Vector3;
  missionObjects: { mission: any; pos: THREE.Vector3; skyObj: SkyObject }[];
  asteroidObjects: { ast: SolarSystemAsteroid; pos: THREE.Vector3; skyObj: SkyObject }[];
  isInteractingRef: React.MutableRefObject<boolean>;
}> = ({ controlsRef, earthPos, missionObjects, asteroidObjects, isInteractingRef }) => {
  const { selectedObject } = useSkyStore();
  const animatingRef = useRef<boolean>(false);
  const targetCamPos = useRef(new THREE.Vector3(0, 85, 140));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const prevSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentId = selectedObject?.id || null;
    if (currentId === prevSelectedIdRef.current) {
      // Don't re-trigger camera animation if selection hasn't changed!
      return;
    }
    prevSelectedIdRef.current = currentId;
    isInteractingRef.current = false;

    if (selectedObject) {
      if (selectedObject.id === 'sun' || selectedObject.type === 'sun') {
        targetLookAt.current.set(0, 0, 0);
        targetCamPos.current.set(0, 16, 26);
        animatingRef.current = true;
        return;
      }

      // Check if selectedObject matches an interplanetary mission
      const missionMatch = missionObjects.find((m) => m.skyObj.id === selectedObject.id);
      if (missionMatch) {
        targetLookAt.current.copy(missionMatch.pos);
        targetCamPos.current.set(
          missionMatch.pos.x,
          missionMatch.pos.y + 1.8,
          missionMatch.pos.z + 3.2
        );
        animatingRef.current = true;
        return;
      }

      // Check if selectedObject matches a mapped asteroid
      const asteroidMatch = asteroidObjects.find((a) => a.skyObj.id === selectedObject.id);
      if (asteroidMatch) {
        targetLookAt.current.copy(asteroidMatch.pos);
        targetCamPos.current.set(
          asteroidMatch.pos.x,
          asteroidMatch.pos.y + Math.max(1.8, asteroidMatch.ast.visualSize * 1.5),
          asteroidMatch.pos.z + Math.max(2.6, asteroidMatch.ast.visualSize * 2.2)
        );
        animatingRef.current = true;
        return;
      }

      // Planetary / Moon target
      const pos = getSolarSystemPosition(selectedObject, earthPos);
      targetLookAt.current.copy(pos);
      if (selectedObject.name === 'Earth' || selectedObject.type === 'moon') {
        targetCamPos.current.set(pos.x, pos.y + 4.5, pos.z + 7.5);
      } else {
        targetCamPos.current.set(pos.x, pos.y + 8, pos.z + 14);
      }
      animatingRef.current = true;
    } else {
      targetLookAt.current.set(0, 0, 0);
      targetCamPos.current.set(0, 85, 140);
      animatingRef.current = true;
    }
  }, [selectedObject, earthPos, missionObjects, asteroidObjects, isInteractingRef]);

  useFrame((_, delta) => {
    // If user is actively dragging/zooming, stop programmatic animation
    if (isInteractingRef.current) {
      animatingRef.current = false;
      return;
    }

    if (!animatingRef.current || !controlsRef.current) return;
    const controls = controlsRef.current;
    const cam = controls.object;

    cam.position.lerp(targetCamPos.current, Math.min(1, delta * 3.5));
    controls.target.lerp(targetLookAt.current, Math.min(1, delta * 3.5));
    controls.update();

    if (
      cam.position.distanceTo(targetCamPos.current) < 0.2 &&
      controls.target.distanceTo(targetLookAt.current) < 0.2
    ) {
      animatingRef.current = false;
    }
  });

  return null;
};

export const SolarSystem3D = forwardRef<SolarSystem3DRef, SolarSystem3DProps>(({ objects }, ref) => {
  const { selectedObject, setSelectedObject, filters, timeOffsetSeconds } = useSkyStore();
  const controlsRef = useRef<any>(null);
  const isInteractingRef = useRef<boolean>(false);

  // Planetary Textures
  const sunTex = useMemo(() => textureFactory.getSunTexture(), []);
  const mercuryTex = useMemo(() => textureFactory.getMercuryTexture(), []);
  const venusTex = useMemo(() => textureFactory.getVenusTexture(), []);
  const earthTex = useMemo(() => textureFactory.getEarthTexture(), []);
  const moonTex = useMemo(() => textureFactory.getMoonTexture(), []);
  const marsTex = useMemo(() => textureFactory.getMarsTexture(), []);
  const jupiterTex = useMemo(() => textureFactory.getJupiterTexture(), []);
  const saturnTex = useMemo(() => textureFactory.getSaturnTexture(), []);
  const uranusTex = useMemo(() => textureFactory.getUranusTexture(), []);
  const neptuneTex = useMemo(() => textureFactory.getNeptuneTexture(), []);
  const plutoTex = useMemo(() => textureFactory.getPlutoTexture(), []);

  // Spacecraft Textures
  const hubbleTex = useMemo(() => textureFactory.getSpacecraftTexture('hubble'), []);
  const commsTex = useMemo(() => textureFactory.getSpacecraftTexture('satellite'), []);

  // Asteroid Textures with Authentic Imagery
  const ceresTex = useMemo(() => textureFactory.getAsteroidTexture('ceres'), []);
  const vestaTex = useMemo(() => textureFactory.getAsteroidTexture('vesta'), []);
  const psycheTex = useMemo(() => textureFactory.getAsteroidTexture('psyche'), []);
  const bennuTex = useMemo(() => textureFactory.getAsteroidTexture('bennu'), []);
  const ryuguTex = useMemo(() => textureFactory.getAsteroidTexture('ryugu'), []);
  const erosTex = useMemo(() => textureFactory.getAsteroidTexture('eros'), []);
  const apophisTex = useMemo(() => textureFactory.getAsteroidTexture('apophis'), []);
  const genericAsteroidTex = useMemo(() => textureFactory.getAsteroidTexture('generic'), []);

  const getTextureForAsteroid = (id: string) => {
    if (id.includes('ceres')) return ceresTex;
    if (id.includes('vesta')) return vestaTex;
    if (id.includes('psyche')) return psycheTex;
    if (id.includes('bennu')) return bennuTex;
    if (id.includes('ryugu')) return ryuguTex;
    if (id.includes('eros')) return erosTex;
    if (id.includes('apophis')) return apophisTex;
    return genericAsteroidTex;
  };

  // Sun Object for interactive selection
  const sunObj = useMemo(() => {
    return (
      objects.find((o) => o.type === 'sun' || o.id === 'sun') || {
        id: 'sun',
        name: 'Sun',
        type: 'sun' as const,
        azimuth: 0,
        altitude: 90,
        distanceKm: 149597870,
        magnitude: -26.74,
        color: '#f59e0b',
        description:
          'The yellow dwarf star (G2V) at the center of our Solar System, containing 99.86% of all system mass.',
      }
    );
  }, [objects]);

  // Separate Earth, Planets & Moons (Ignore Earth satellites swarm in Solar option)
  const { earthObj, planetsAndMoons } = useMemo(() => {
    let earth: SkyObject | null = null;
    const bodies: SkyObject[] = [];

    const query = filters.searchQuery.trim().toLowerCase();

    for (const obj of objects) {
      if (obj.type === 'satellite') continue; // Ignore Earth satellites swarm in Solar view

      if (query) {
        const matches =
          obj.name.toLowerCase().includes(query) ||
          (obj.description && obj.description.toLowerCase().includes(query));
        if (!matches) continue;
      }

      if (obj.name === 'Earth' || obj.id === 'planet-earth') {
        earth = obj;
        if (filters.planets) {
          bodies.push(obj);
        }
      } else if (obj.type === 'planet' && filters.planets) {
        bodies.push(obj);
      } else if (obj.type === 'moon' && filters.moon) {
        bodies.push(obj);
      }
    }

    return { earthObj: earth, planetsAndMoons: bodies };
  }, [objects, filters.searchQuery, filters.planets, filters.moon]);

  // Compute Earth's heliocentric position
  const earthPos = useMemo(() => {
    if (
      earthObj &&
      earthObj.helioX !== undefined &&
      earthObj.helioY !== undefined &&
      earthObj.helioZ !== undefined
    ) {
      return scaleHelioAU(earthObj.helioX, earthObj.helioY, earthObj.helioZ);
    }
    return scaleHelioAU(1, 0, 0); // 1 AU default
  }, [earthObj]);

  // Planet & Moon positions map for placing orbiting satellites
  const planetPositions = useMemo(() => {
    const map = new Map<string, THREE.Vector3>();
    let moonFound = false;
    for (const body of planetsAndMoons) {
      if (body.type === 'planet' || body.type === 'moon') {
        const pPos = getSolarSystemPosition(body, earthPos);
        map.set(body.name, pPos);
        if (body.type === 'moon' || body.name.includes('Moon')) {
          moonFound = true;
          map.set('Moon', pPos);
        }
      }
    }
    if (!moonFound) {
      const defaultMoonPos = new THREE.Vector3(
        earthPos.x + 5.2 * Math.cos(Math.PI / 4),
        earthPos.y + 0.8 * Math.sin(Math.PI / 2),
        earthPos.z + 5.2 * Math.sin(Math.PI / 4)
      );
      map.set('Moon', defaultMoonPos);
    }
    return map;
  }, [planetsAndMoons, earthPos]);

  // Interplanetary probes & planetary orbiters (around Mercury, Venus, Mars, Jupiter, Saturn & heliocentric)
  const missionObjects = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase();

    return SOLAR_MISSIONS.filter((m) => {
      if (!filters.satellites || !filters.probes) return false;
      if (!query) return true;
      return (
        m.name.toLowerCase().includes(query) ||
        m.agency.toLowerCase().includes(query) ||
        m.target.toLowerCase().includes(query)
      );
    }).map((m) => {
      const pos = getMissionSolarPos(m, planetPositions);
      const skyObj = missionToSkyObject(m);
      return { mission: m, pos, skyObj };
    });
  }, [planetPositions, filters.satellites, filters.probes, filters.searchQuery]);

  // Mapped Asteroids with Keplerian positions & orbits
  const asteroidObjects = useMemo(() => {
    const simEpoch = Date.now() + timeOffsetSeconds * 1000;
    const query = filters.searchQuery.trim().toLowerCase();

    return SOLAR_ASTEROIDS.filter((ast) => {
      if (!filters.asteroids) return false;
      if (!query) return true;
      return (
        ast.name.toLowerCase().includes(query) ||
        ast.orbitClass.toLowerCase().includes(query) ||
        ast.spectralType.toLowerCase().includes(query) ||
        ast.description.toLowerCase().includes(query)
      );
    }).map((ast) => {
      const pos = calculateAsteroidPosition(ast, simEpoch);
      const skyObj = asteroidToSkyObject(ast, pos, earthPos);

      // Compute orbital path line
      const orbitPts: THREE.Vector3[] = [];
      const steps = 72;
      const msInYear = 365.25 * 86400 * 1000;
      for (let s = 0; s <= steps; s++) {
        const dummyEpoch = simEpoch + (s / steps) * (ast.orbitalPeriodYears * msInYear);
        orbitPts.push(calculateAsteroidPosition(ast, dummyEpoch));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(orbitPts);
      const mat = new THREE.LineBasicMaterial({
        color: ast.color,
        transparent: true,
        opacity: 0.35,
      });
      const orbitLine = new THREE.Line(geom, mat);

      return { ast, pos, skyObj, orbitLine };
    });
  }, [timeOffsetSeconds, filters.asteroids, filters.searchQuery, earthPos]);

  useImperativeHandle(ref, () => ({
    resetView: () => {
      isInteractingRef.current = false;
      if (controlsRef.current) {
        controlsRef.current.reset();
        controlsRef.current.object.position.set(0, 85, 140);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    },
    zoomIn: () => {
      isInteractingRef.current = true;
      if (controlsRef.current) {
        const controls = controlsRef.current;
        const cam = controls.object;
        const offset = new THREE.Vector3().subVectors(cam.position, controls.target);
        if (offset.length() > 2.0) {
          cam.position.copy(controls.target).addScaledVector(offset, 0.72);
          controls.update();
        }
      }
    },
    zoomOut: () => {
      isInteractingRef.current = true;
      if (controlsRef.current) {
        const controls = controlsRef.current;
        const cam = controls.object;
        const offset = new THREE.Vector3().subVectors(cam.position, controls.target);
        if (offset.length() < 1200) {
          cam.position.copy(controls.target).addScaledVector(offset, 1.35);
          controls.update();
        }
      }
    },
    zoomToObject: (obj: SkyObject) => {
      if (!controlsRef.current) return;
      isInteractingRef.current = false;

      if (obj.id === 'sun' || obj.type === 'sun') {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.object.position.set(0, 16, 26);
        controlsRef.current.update();
        return;
      }

      // Check if interplanetary mission
      const missionMatch = missionObjects.find((m) => m.skyObj.id === obj.id);
      if (missionMatch) {
        controlsRef.current.target.copy(missionMatch.pos);
        controlsRef.current.object.position.set(
          missionMatch.pos.x,
          missionMatch.pos.y + 1.8,
          missionMatch.pos.z + 3.2
        );
        controlsRef.current.update();
        return;
      }

      // Check if mapped asteroid
      const asteroidMatch = asteroidObjects.find((a) => a.skyObj.id === obj.id);
      if (asteroidMatch) {
        controlsRef.current.target.copy(asteroidMatch.pos);
        controlsRef.current.object.position.set(
          asteroidMatch.pos.x,
          asteroidMatch.pos.y + Math.max(1.8, asteroidMatch.ast.visualSize * 1.5),
          asteroidMatch.pos.z + Math.max(2.6, asteroidMatch.ast.visualSize * 2.2)
        );
        controlsRef.current.update();
        return;
      }

      // Planet / Moon
      const pos = getSolarSystemPosition(obj, earthPos);
      controlsRef.current.target.copy(pos);
      if (obj.name === 'Earth' || obj.type === 'moon') {
        controlsRef.current.object.position.set(pos.x, pos.y + 4.5, pos.z + 7.5);
      } else {
        controlsRef.current.object.position.set(pos.x, pos.y + 8, pos.z + 14);
      }
      controlsRef.current.update();
    },
  }));

  // Generate circular planetary orbit lines around the Sun
  const orbitLines = useMemo(() => {
    const list: { name: string; line: THREE.Line }[] = [];
    const distancesAU = [
      { name: 'Mercury', au: 0.387, color: 0x94a3b8 },
      { name: 'Venus', au: 0.723, color: 0xfef08a },
      { name: 'Earth', au: 1.000, color: 0x0284c7 },
      { name: 'Mars', au: 1.524, color: 0xc2410c },
      { name: 'Jupiter', au: 5.204, color: 0xd97706 },
      { name: 'Saturn', au: 9.582, color: 0xca8a04 },
      { name: 'Uranus', au: 19.20, color: 0x0891b2 },
      { name: 'Neptune', au: 30.05, color: 0x2563eb },
      { name: 'Pluto', au: 39.48, color: 0x78716c },
    ];

    distancesAU.forEach((item) => {
      const pts: THREE.Vector3[] = [];
      const steps = 96;
      for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * Math.PI * 2;
        const x = item.au * Math.cos(theta);
        const y = item.au * Math.sin(theta);
        pts.push(scaleHelioAU(x, y, 0));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: item.color,
        transparent: true,
        opacity: 0.35,
      });
      list.push({ name: item.name, line: new THREE.Line(geom, mat) });
    });

    return list;
  }, []);

  const isSunSelected = selectedObject?.id === 'sun' || selectedObject?.type === 'sun';

  return (
    <div className="relative w-full h-full bg-space-950 select-none">
      <Canvas
        camera={{ position: [0, 85, 140], fov: 45, near: 0.1, far: 5000 }}
        onPointerMissed={() => setSelectedObject(null)}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={2.5} distance={1000} decay={1} />
        <SolarSystemCameraController
          controlsRef={controlsRef}
          earthPos={earthPos}
          missionObjects={missionObjects}
          asteroidObjects={asteroidObjects}
          isInteractingRef={isInteractingRef}
        />

        {/* 1. THE SUN (At Heliocentric Center [0, 0, 0]) */}
        {filters.sun && (
          <group
            position={[0, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedObject(sunObj);
            }}
          >
            <Billboard follow={true}>
              <mesh>
                <planeGeometry args={[14, 14]} />
                <meshBasicMaterial map={sunTex} transparent depthWrite={false} />
              </mesh>
            </Billboard>

            {/* Selection Halo around Sun */}
            {isSunSelected && (
              <mesh>
                <ringGeometry args={[8.0, 9.4, 48]} />
                <meshBasicMaterial color="#f59e0b" side={THREE.DoubleSide} />
              </mesh>
            )}

            {/* Clean "Sun" Name Badge */}
            <Billboard position={[0, 7.8, 0]}>
              <Html center distanceFactor={130} zIndexRange={[10, 0]}>
                <div
                  className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                    isSunSelected
                      ? 'bg-amber-400 text-space-950 shadow-lg shadow-amber-400/50'
                      : 'bg-space-900/90 text-amber-300 border border-amber-500/60 hover:border-amber-300'
                  }`}
                >
                  Sun
                </div>
              </Html>
            </Billboard>
          </group>
        )}

        {/* 2. PLANETARY ORBIT RINGS */}
        {filters.orbits &&
          orbitLines.map((o) => (
            <primitive key={`orbit-${o.name}`} object={o.line} />
          ))}

        {/* 3. MAPPED ASTEROIDS WITH AUTHENTIC IMAGES & ORBITAL PATHS */}
        {filters.asteroids && (
          <group>
            {/* Background Belt Particle Field + Scattered Textured Boulders */}
            {filters.beltBoulders && <AsteroidBelt asteroidTex={genericAsteroidTex} />}

            {/* Asteroid Orbit Paths */}
            {filters.orbits &&
              asteroidObjects.map((a) => (
                <primitive key={`orbit-${a.ast.id}`} object={a.orbitLine} />
              ))}

            {/* Mapped Asteroids with Authentic Imagery */}
            {asteroidObjects.map(({ ast, pos, skyObj }) => {
              const isSelected = selectedObject?.id === ast.id;
              const tex = getTextureForAsteroid(ast.id);

              return (
                <group
                  key={ast.id}
                  position={pos}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedObject(skyObj);
                  }}
                >
                  {/* Asteroid 3D Image Billboard */}
                  <Billboard follow={true}>
                    <mesh>
                      <planeGeometry args={[ast.visualSize, ast.visualSize]} />
                      <meshBasicMaterial map={tex} transparent depthWrite={false} />
                    </mesh>
                  </Billboard>

                  {/* Selection Indicator Ring */}
                  {isSelected && (
                    <mesh>
                      <ringGeometry
                        args={[ast.visualSize * 0.7, ast.visualSize * 1.05, 32]}
                      />
                      <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
                    </mesh>
                  )}

                  {/* Name & Diameter Badge */}
                  <Billboard position={[0, ast.visualSize * 0.75 + 0.5, 0]}>
                    <Html center distanceFactor={85} zIndexRange={[10, 0]}>
                      <div
                        className={`px-1.5 py-0.5 rounded font-mono text-[9px] whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-400 text-space-950 font-bold shadow-md shadow-amber-400/50'
                            : 'bg-space-950/90 text-amber-200 border border-amber-600/70 hover:border-amber-300'
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: ast.color }}
                        />
                        <span className="font-semibold">{ast.name}</span>
                        <span className="text-[8px] text-slate-400">({ast.diameter})</span>
                      </div>
                    </Html>
                  </Billboard>
                </group>
              );
            })}
          </group>
        )}

        {/* 4. METEOR SHOWER DEBRIS STREAMS */}
        {filters.meteors && <MeteorShowerStreams />}

        {/* 5. ALL PLANETS & MOON IN HELIOCENTRIC POSITIONS */}
        {planetsAndMoons.map((body) => {
          if (body.type === 'sun') return null;

          const isSelected = selectedObject?.id === body.id;
          const pos = getSolarSystemPosition(body, earthPos);

          return (
            <group
              key={body.id}
              position={pos}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject(body);
              }}
            >
              <Billboard follow={true}>
                {body.name === 'Mercury' ? (
                  <mesh>
                    <circleGeometry args={[1.4, 32]} />
                    <meshBasicMaterial map={mercuryTex} />
                  </mesh>
                ) : body.name === 'Venus' ? (
                  <mesh>
                    <circleGeometry args={[2.2, 32]} />
                    <meshBasicMaterial map={venusTex} />
                  </mesh>
                ) : body.name === 'Earth' ? (
                  <mesh>
                    <circleGeometry args={[2.4, 32]} />
                    <meshBasicMaterial map={earthTex} />
                  </mesh>
                ) : body.name.includes('Moon') ? (
                  <mesh>
                    <circleGeometry args={[1.1, 32]} />
                    <meshBasicMaterial map={moonTex} />
                  </mesh>
                ) : body.name === 'Mars' ? (
                  <mesh>
                    <circleGeometry args={[1.8, 32]} />
                    <meshBasicMaterial map={marsTex} />
                  </mesh>
                ) : body.name === 'Jupiter' ? (
                  <mesh>
                    <circleGeometry args={[3.8, 32]} />
                    <meshBasicMaterial map={jupiterTex} />
                  </mesh>
                ) : body.name === 'Saturn' ? (
                  <group>
                    <mesh>
                      <circleGeometry args={[2.8, 32]} />
                      <meshBasicMaterial map={saturnTex} />
                    </mesh>
                    <mesh rotation={[0, 0, Math.PI / 6]}>
                      <ringGeometry args={[3.4, 5.8, 48]} />
                      <meshBasicMaterial color="#d4b478" side={THREE.DoubleSide} transparent opacity={0.85} />
                    </mesh>
                  </group>
                ) : body.name === 'Uranus' ? (
                  <mesh>
                    <circleGeometry args={[2.2, 32]} />
                    <meshBasicMaterial map={uranusTex} />
                  </mesh>
                ) : body.name === 'Neptune' ? (
                  <mesh>
                    <circleGeometry args={[2.2, 32]} />
                    <meshBasicMaterial map={neptuneTex} />
                  </mesh>
                ) : body.name === 'Pluto' ? (
                  <mesh>
                    <circleGeometry args={[1.2, 32]} />
                    <meshBasicMaterial map={plutoTex} />
                  </mesh>
                ) : (
                  <mesh>
                    <circleGeometry args={[2.0, 32]} />
                    <meshBasicMaterial color={body.color || '#f59e0b'} />
                  </mesh>
                )}
              </Billboard>

              {/* Selection Halo */}
              {isSelected && (
                <mesh>
                  <ringGeometry args={[3.2, 4.0, 32]} />
                  <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
                </mesh>
              )}

              {/* Planet Label */}
              <Billboard position={[0, 3.2, 0]}>
                <Html center distanceFactor={110} zIndexRange={[10, 0]}>
                  <div
                    className={`px-1.5 py-0.5 rounded font-mono text-[9px] whitespace-nowrap cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-space-950 font-bold shadow-lg shadow-cyan-500/50'
                        : 'bg-space-900/90 text-slate-200 border border-slate-700/80 hover:border-cyan-400'
                    }`}
                  >
                    {body.name}
                  </div>
                </Html>
              </Billboard>
            </group>
          );
        })}

        {/* 6. ORBITAL TRACKS FOR PLANETARY & LUNAR PROBES */}
        {filters.orbits && filters.satellites && (
          <group>
            {missionObjects.map(({ mission }) => {
              if (!mission.parentPlanet || !planetPositions.has(mission.parentPlanet)) return null;
              const pPos = planetPositions.get(mission.parentPlanet)!;
              const pts: THREE.Vector3[] = [];
              const steps = 40;
              const r = mission.orbitRadius;
              const inc = mission.inclination;
              for (let i = 0; i <= steps; i++) {
                const theta = (i / steps) * Math.PI * 2;
                const lx = r * Math.cos(theta);
                const ly = r * Math.sin(inc) * Math.sin(theta);
                const lz = r * Math.cos(inc) * Math.sin(theta);
                pts.push(new THREE.Vector3(pPos.x + lx, pPos.y + ly, pPos.z + lz));
              }
              const geom = new THREE.BufferGeometry().setFromPoints(pts);
              const mat = new THREE.LineBasicMaterial({
                color: mission.target === 'Moon' ? 0x93c5fd : 0x06b6d4,
                transparent: true,
                opacity: 0.35,
              });
              return (
                <primitive
                  key={`probe-orbit-${mission.id}`}
                  object={new THREE.Line(geom, mat)}
                />
              );
            })}
          </group>
        )}

        {/* 7. SATELLITES AROUND OTHER PLANETS, MOON & INSIDE SOLAR SYSTEM */}
        {filters.satellites && (
          <group>
            {missionObjects.map(({ mission, pos, skyObj }) => {
              const isSelected = selectedObject?.id === skyObj.id;
              const isFlagship =
                mission.target === 'Moon' ||
                mission.name.includes('Parker') ||
                mission.name.includes('JWST') ||
                mission.name.includes('MRO') ||
                mission.name.includes('Juno') ||
                mission.name.includes('Cassini') ||
                mission.name.includes('BepiColombo');

              return (
                <group
                  key={mission.id}
                  position={pos}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedObject(skyObj);
                  }}
                >
                  <Billboard follow={true}>
                    <mesh>
                      <planeGeometry args={[isFlagship ? 1.5 : 1.1, isFlagship ? 1.5 : 1.1]} />
                      <meshBasicMaterial
                        map={mission.name.includes('JWST') ? hubbleTex : commsTex}
                        transparent
                        depthWrite={false}
                      />
                    </mesh>
                  </Billboard>

                  {/* Selection Ring for Satellite */}
                  {isSelected && (
                    <mesh>
                      <ringGeometry args={[1.4, 1.8, 24]} />
                      <meshBasicMaterial
                        color={mission.target === 'Moon' ? '#93c5fd' : '#38bdf8'}
                        side={THREE.DoubleSide}
                      />
                    </mesh>
                  )}

                  {/* Satellite Label */}
                  <Billboard position={[0, isFlagship ? 1.5 : 1.2, 0]}>
                    <Html center distanceFactor={85} zIndexRange={[10, 0]}>
                      <div
                        className={`px-1.5 py-0.2 rounded font-mono text-[8px] whitespace-nowrap cursor-pointer transition-all ${
                          isSelected
                            ? mission.target === 'Moon'
                              ? 'bg-blue-400 text-space-950 font-bold shadow-md shadow-blue-400/50'
                              : 'bg-cyan-500 text-space-950 font-bold shadow-md shadow-cyan-500/50'
                            : mission.target === 'Moon'
                            ? 'bg-space-950/90 text-blue-200 border border-blue-600/70 hover:border-blue-300'
                            : 'bg-space-950/90 text-cyan-300 border border-cyan-800/80 hover:border-cyan-400'
                        }`}
                      >
                        {mission.target === 'Moon' ? '🌕 ' : ''}{mission.name.split(' (')[0]}
                      </div>
                    </Html>
                  </Billboard>
                </group>
              );
            })}
          </group>
        )}

        {/* Orbit Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.7}
          zoomSpeed={1.2}
          panSpeed={0.8}
          minDistance={1.5}
          maxDistance={1200}
          onStart={() => {
            isInteractingRef.current = true;
          }}
          onEnd={() => {
            isInteractingRef.current = true;
          }}
        />
      </Canvas>

      {/* Floating HUD info */}
      <div className="absolute bottom-10 left-4 pointer-events-none flex flex-col gap-1 text-[11px] font-mono text-slate-400 bg-space-900/80 p-2.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>3D Solar System (Heliocentric Orrery)</span>
        </div>
        <div className="text-slate-400">
          Tracking Sun, All 9 Planets, Moon, Planetary Orbiters (Mars, Jupiter, Venus, Saturn, Mercury), Heliocentric Probes & Mapped Asteroids with Authentic Imagery (Ceres, Vesta, Psyche, Bennu, Ryugu, Eros, Apophis)
        </div>
        <div className="text-slate-500">
          Rotate: Left Click + Drag | Zoom: Scroll | Click any planet, asteroid, or probe to inspect
        </div>
      </div>
    </div>
  );
});
