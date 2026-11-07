import React, { useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useSkyStore } from '../store/useSkyStore';
import { SkyObject } from '../types';
import {
  MILKY_WAY_OBJECTS,
  SPIRAL_ARMS_CONFIG,
  getArmPoint,
  milkyWayToSkyObject,
} from '../lib/milkyWayData';

export interface MilkyWay3DRef {
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToObject: (obj: SkyObject) => void;
}

/**
 * Procedural Astronomically Accurate Milky Way Spiral Disk
 * Generates 14,000 stars distributed across:
 * 1. The Central Barred Bulge (oriented at 28° around Sagittarius A*)
 * 2. The 5 Major Spiral Arms & Spurs (Perseus, Scutum-Centaurus, Sagittarius-Carina, Orion Spur, and Outer Arm)
 * using IAU Galactocentric logarithmic spiral equations: R(theta) = r0 * exp(theta * tan(pitch)).
 */
const MilkyWaySpiralDisk: React.FC = () => {
  const points = useMemo(() => {
    const starCount = 15000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    let idx = 0;

    // 1. Central Barred Bulge (3,500 stars)
    const bulgeCount = 3500;
    for (let i = 0; i < bulgeCount; i++) {
      const u = Math.random();
      const r = Math.pow(u, 2.0) * 18; // inner 9 kly
      const theta = Math.random() * Math.PI * 2;
      // Elliptical bar elongation at 28 degrees
      const barAngle = (28 * Math.PI) / 180;
      const xLocal = r * Math.sin(theta) * 1.7;
      const zLocal = r * Math.cos(theta) * 0.8;

      const x = xLocal * Math.cos(barAngle) - zLocal * Math.sin(barAngle);
      const z = xLocal * Math.sin(barAngle) + zLocal * Math.cos(barAngle);
      // Vertical bulge thickness
      const y = (Math.random() - 0.5) * Math.max(0.4, (1 - r / 20) * 6.0);

      positions[idx * 3] = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = z;

      // Warm older Population II stars (gold, amber, peach)
      const colorSpread = Math.random();
      if (colorSpread > 0.6) {
        colors[idx * 3] = 0.98; colors[idx * 3 + 1] = 0.82; colors[idx * 3 + 2] = 0.45; // Warm gold
      } else if (colorSpread > 0.25) {
        colors[idx * 3] = 0.95; colors[idx * 3 + 1] = 0.62; colors[idx * 3 + 2] = 0.30; // Amber
      } else {
        colors[idx * 3] = 1.0; colors[idx * 3 + 1] = 0.94; colors[idx * 3 + 2] = 0.82; // Warm white
      }
      idx++;
    }

    // 2. Spiral Arms generated from the exact same SPIRAL_ARMS_CONFIG
    const armStarCount = starCount - bulgeCount;
    const starsPerArm = Math.floor(armStarCount / SPIRAL_ARMS_CONFIG.length);

    SPIRAL_ARMS_CONFIG.forEach((arm) => {
      const tanPsi = Math.tan((arm.pitchDeg * Math.PI) / 180);

      for (let i = 0; i < starsPerArm; i++) {
        // Sample theta across the arm's extent
        const t = arm.thetaMin + Math.random() * (arm.thetaMax - arm.thetaMin);
        const baseR = arm.r0 * Math.exp(t * tanPsi);

        // Dispersion across the arm width (grows with radius)
        const widthSpread = (baseR / 50) * 3.2 + 1.2;
        const rJitter = (Math.random() - 0.5) * widthSpread;
        const thetaJitter = ((Math.random() - 0.5) * widthSpread) / Math.max(1, baseR);

        const r = Math.min(105, Math.max(10, baseR + rJitter));
        const theta = t + thetaJitter;

        const x = r * Math.sin(theta);
        const z = r * Math.cos(theta);
        // Galactic warp: Outer disk curves slightly upwards on one side
        const warpFactor = Math.sin(theta) * Math.pow(r / 100, 2) * 3.5;
        const y = (Math.random() - 0.5) * (1.5 + (r / 100) * 1.8) + warpFactor;

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        // Spiral arm young Population I stars (blue-white giants, O/B stars, and pink H II starburst regions)
        const starType = Math.random();
        if (starType > 0.82) {
          // Pink/magenta H II emission nebulae knots
          colors[idx * 3] = 0.95; colors[idx * 3 + 1] = 0.40; colors[idx * 3 + 2] = 0.68;
        } else if (starType > 0.45) {
          // Bright cyan/blue OB stellar associations
          colors[idx * 3] = 0.42; colors[idx * 3 + 1] = 0.76; colors[idx * 3 + 2] = 1.0;
        } else if (starType > 0.18) {
          // Crisp white stellar glow
          colors[idx * 3] = 0.88; colors[idx * 3 + 1] = 0.92; colors[idx * 3 + 2] = 1.0;
        } else {
          // Dust lane dimmed amber/orange
          colors[idx * 3] = 0.85; colors[idx * 3 + 1] = 0.52; colors[idx * 3 + 2] = 0.22;
        }
        idx++;
      }
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  return (
    <points geometry={points}>
      <pointsMaterial
        size={1.6}
        vertexColors
        transparent
        opacity={0.82}
        sizeAttenuation={false}
      />
    </points>
  );
};

/**
 * Visual Continuous Guide Traces for the 5 Spiral Arms
 * Renders glowing translucent curves along each arm backbone so the user can easily see
 * the spiral geometry and how every star and landmark rests on its respective arm.
 */
const SpiralArmCurves: React.FC = () => {
  const lineObjects = useMemo(() => {
    return SPIRAL_ARMS_CONFIG.map((arm) => {
      const steps = 60;
      const points: THREE.Vector3[] = [];
      for (let s = 0; s <= steps; s++) {
        const theta = arm.thetaMin + (s / steps) * (arm.thetaMax - arm.thetaMin);
        points.push(getArmPoint(arm, theta));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: arm.color,
        transparent: true,
        opacity: 0.35,
      });
      return { id: arm.id, line: new THREE.Line(geom, mat) };
    });
  }, []);

  return (
    <group>
      {lineObjects.map(({ id, line }) => (
        <primitive key={`trace-${id}`} object={line} />
      ))}
    </group>
  );
};

/**
 * Concentric Galactic Radius Markers (Galactic Center, 10 kly, 26.67 kly Solar Circle, 50 kly Edge)
 */
const GalacticDistanceGuides: React.FC = () => {
  return (
    <group>
      {/* 10 kly Inner Ring (Radius = 20 units) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[19.8, 20.2, 64]} />
        <meshBasicMaterial color="#64748b" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <Billboard position={[20, 0, 0]}>
        <Html center distanceFactor={140} zIndexRange={[10, 0]}>
          <div className="font-mono text-[8px] text-slate-400 bg-space-950/80 px-1 py-0.5 rounded border border-slate-700/40">
            10 kly (Inner Disk)
          </div>
        </Html>
      </Billboard>

      {/* 26.67 kly Solar Circle Ring (Radius = 53.34 units) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[53.1, 53.5, 96]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <Billboard position={[0, 0, -53.34]}>
        <Html center distanceFactor={160} zIndexRange={[10, 0]}>
          <div className="font-mono text-[9px] text-amber-300 font-semibold bg-space-950/90 px-1.5 py-0.5 rounded border border-amber-500/50 shadow-md">
            Solar Circle (26.67 kly from Core • Orbit: 230 km/s)
          </div>
        </Html>
      </Billboard>

      {/* 50 kly Outer Galactic Edge (Radius = 100 units) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[99.7, 100.3, 128]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <Billboard position={[-100, 0, 0]}>
        <Html center distanceFactor={180} zIndexRange={[10, 0]}>
          <div className="font-mono text-[8px] text-sky-400 bg-space-950/80 px-1.5 py-0.5 rounded border border-sky-600/40">
            Galactic Edge (50 kly Radius • 100,000 ly Diameter)
          </div>
        </Html>
      </Billboard>
    </group>
  );
};

/**
 * Fermi Bubbles: Giant twin 25,000 light-year high-energy gamma-ray lobes
 * extending North (+Y) and South (-Y) from Sagittarius A*.
 */
const FermiBubblesMesh: React.FC = () => {
  return (
    <group>
      {/* North Fermi Bubble */}
      <mesh position={[0, 24, 0]} scale={[13, 24, 13]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.09}
          wireframe
        />
      </mesh>
      {/* South Fermi Bubble */}
      <mesh position={[0, -24, 0]} scale={[13, 24, 13]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.09}
          wireframe
        />
      </mesh>
    </group>
  );
};

/**
 * Sagittarius A* Core Accretion & Relativistic Polar Jets
 */
const SagittariusACore: React.FC = () => {
  return (
    <group position={[0, 0, 0]}>
      {/* Event Horizon Black Core */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Glowing Accretion Disk */}
      <mesh rotation={[-Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[1.4, 4.2, 48]} />
        <meshBasicMaterial
          color="#f97316"
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Accretion Outer Halo */}
      <mesh rotation={[-Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[4.2, 6.8, 48]} />
        <meshBasicMaterial
          color="#fbbf24"
          side={THREE.DoubleSide}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Relativistic Jet North */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.08, 0.45, 10, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>
      {/* Relativistic Jet South */}
      <mesh position={[0, -5, 0]}>
        <cylinderGeometry args={[0.45, 0.08, 10, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

/**
 * Camera Controller for Milky Way 3D
 */
const MilkyWayCameraController: React.FC<{
  controlsRef: React.RefObject<any>;
  isInteractingRef: React.MutableRefObject<boolean>;
}> = ({ controlsRef, isInteractingRef }) => {
  const { selectedObject } = useSkyStore();
  const animatingRef = useRef<boolean>(false);
  const targetCamPos = useRef(new THREE.Vector3(0, 95, 120));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 20));
  const prevSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentId = selectedObject?.id || null;
    if (currentId === prevSelectedIdRef.current) return;
    prevSelectedIdRef.current = currentId;
    isInteractingRef.current = false;

    if (selectedObject) {
      const match = MILKY_WAY_OBJECTS.find((m) => m.id === selectedObject.id);
      if (match) {
        targetLookAt.current.copy(match.galPos);
        const distOffset = Math.max(4.0, match.size * 2.2);
        targetCamPos.current.set(
          match.galPos.x,
          match.galPos.y + distOffset * 0.8,
          match.galPos.z + distOffset * 1.3
        );
        animatingRef.current = true;
        return;
      }
    } else {
      // Default high-altitude overview vantage
      targetLookAt.current.set(0, 0, 20);
      targetCamPos.current.set(0, 95, 120);
      animatingRef.current = true;
    }
  }, [selectedObject, isInteractingRef]);

  useFrame((_, delta) => {
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

interface MilkyWay3DProps {
  objects?: SkyObject[];
}

export const MilkyWay3D = forwardRef<MilkyWay3DRef, MilkyWay3DProps>((_, ref) => {
  const { selectedObject, setSelectedObject, filters } = useSkyStore();
  const controlsRef = useRef<any>(null);
  const isInteractingRef = useRef<boolean>(false);

  // Filter objects by Milky Way category
  const filteredObjects = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    return MILKY_WAY_OBJECTS.filter((obj) => {
      // Category isolation & selection filters
      if (obj.category === 'core' && !filters.mwCore) return false;
      if (obj.category === 'arm' && !filters.mwArms) return false;
      if (obj.category === 'star' && !filters.mwStars) return false;
      if (obj.category === 'nebula' && !filters.mwNebulae) return false;
      if (obj.category === 'cluster' && !filters.mwClusters) return false;
      if (obj.category === 'black_hole' && !filters.mwBlackHoles) return false;
      if (obj.category === 'exoplanet' && !filters.mwExoplanets) return false;
      if (obj.category === 'fermi_bubble' && !filters.mwFermiBubbles) return false;

      if (q) {
        const match =
          obj.name.toLowerCase().includes(q) ||
          obj.subType.toLowerCase().includes(q) ||
          obj.category.toLowerCase().includes(q) ||
          obj.description.toLowerCase().includes(q) ||
          (obj.constellation && obj.constellation.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [
    filters.searchQuery,
    filters.mwCore,
    filters.mwArms,
    filters.mwStars,
    filters.mwNebulae,
    filters.mwClusters,
    filters.mwBlackHoles,
    filters.mwExoplanets,
    filters.mwFermiBubbles,
  ]);

  useImperativeHandle(ref, () => ({
    resetView: () => {
      isInteractingRef.current = false;
      if (controlsRef.current) {
        controlsRef.current.reset();
        controlsRef.current.object.position.set(0, 95, 120);
        controlsRef.current.target.set(0, 0, 20);
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
        if (offset.length() < 300) {
          cam.position.copy(controls.target).addScaledVector(offset, 1.35);
          controls.update();
        }
      }
    },
    zoomToObject: (obj: SkyObject) => {
      const match = MILKY_WAY_OBJECTS.find((m) => m.id === obj.id);
      if (match && controlsRef.current) {
        isInteractingRef.current = false;
        const controls = controlsRef.current;
        controls.target.copy(match.galPos);
        const distOffset = Math.max(4.0, match.size * 2.2);
        controls.object.position.set(
          match.galPos.x,
          match.galPos.y + distOffset * 0.8,
          match.galPos.z + distOffset * 1.3
        );
        controls.update();
      }
    },
  }));

  return (
    <div className="w-full h-full relative bg-space-950">
      <Canvas
        camera={{ position: [0, 95, 120], fov: 45, near: 0.1, far: 800 }}
        className="w-full h-full"
        onPointerDown={() => {
          isInteractingRef.current = true;
        }}
        onClick={(e) => {
          // Deselect when clicking empty space
          if (e.defaultPrevented) return;
          setSelectedObject(null);
        }}
      >
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 10, 0]} intensity={1.8} color="#fef08a" />
        <pointLight position={[0, -10, 0]} intensity={1.8} color="#fef08a" />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={2}
          maxDistance={350}
          maxPolarAngle={Math.PI / 1.85}
        />

        <MilkyWayCameraController
          controlsRef={controlsRef}
          isInteractingRef={isInteractingRef}
        />

        {/* 1. Procedural Logarithmic Spiral Disk (Matches SPIRAL_ARMS_CONFIG) */}
        <MilkyWaySpiralDisk />

        {/* 2. Visual Arm Backbone Guide Curves */}
        {filters.mwArms && <SpiralArmCurves />}

        {/* 3. Concentric Distance Rings & Labels */}
        <GalacticDistanceGuides />

        {/* 4. Sagittarius A* Accretion Disk & Jets */}
        {filters.mwCore && <SagittariusACore />}

        {/* 5. Fermi Bubbles */}
        {filters.mwFermiBubbles && <FermiBubblesMesh />}

        {/* 6. Mapped Known Objects in the Milky Way */}
        {filteredObjects.map((obj) => {
          const isSelected = selectedObject?.id === obj.id;
          const isSun = obj.id === 'mw-solar-system';
          const isArm = obj.category === 'arm';

          return (
            <group key={obj.id} position={obj.galPos}>
              {/* Invisible touch/click generous target hitbox */}
              <mesh
                visible={false}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedObject(milkyWayToSkyObject(obj));
                }}
              >
                <sphereGeometry args={[Math.max(2.5, obj.size * 1.3), 16, 16]} />
                <meshBasicMaterial />
              </mesh>

              {/* Selection Pulsing Ring */}
              {isSelected && (
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[obj.size * 1.2, obj.size * 1.38, 32]} />
                  <meshBasicMaterial
                    color="#38bdf8"
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.9}
                  />
                </mesh>
              )}

              {/* Solar System Unique Golden Marker */}
              {isSun && (
                <group>
                  <mesh>
                    <sphereGeometry args={[1.0, 24, 24]} />
                    <meshBasicMaterial color="#facc15" />
                  </mesh>
                  {/* Outer yellow halo ring */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.4, 1.7, 32]} />
                    <meshBasicMaterial
                      color="#f59e0b"
                      side={THREE.DoubleSide}
                      transparent
                      opacity={0.85}
                    />
                  </mesh>
                </group>
              )}

              {/* Nebula Glow Cloud */}
              {obj.category === 'nebula' && (
                <mesh>
                  <sphereGeometry args={[obj.size * 0.75, 16, 16]} />
                  <meshBasicMaterial
                    color={obj.color}
                    transparent
                    opacity={0.35}
                    wireframe
                  />
                </mesh>
              )}

              {/* Globular Cluster Halo Spheres */}
              {obj.category === 'cluster' && (
                <group>
                  <mesh>
                    <sphereGeometry args={[obj.size * 0.5, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.65} />
                  </mesh>
                  <mesh>
                    <sphereGeometry args={[obj.size * 0.85, 16, 16]} />
                    <meshBasicMaterial
                      color={obj.color}
                      transparent
                      opacity={0.2}
                      wireframe
                    />
                  </mesh>
                </group>
              )}

              {/* Standard Star / Black Hole / Exoplanet Marker */}
              {!isSun && !isArm && obj.category !== 'cluster' && obj.category !== 'core' && (
                <mesh>
                  <sphereGeometry args={[Math.max(0.4, obj.size * 0.35), 16, 16]} />
                  <meshBasicMaterial color={obj.color} />
                </mesh>
              )}

              {/* Spiral Arm Marker Node */}
              {isArm && (
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.8, 1.3, 24]} />
                  <meshBasicMaterial
                    color={obj.color}
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.6}
                  />
                </mesh>
              )}

              {/* 3D Billboard Interactive Label */}
              <Billboard
                position={[
                  0,
                  obj.size * 0.7 + (isSun ? 1.4 : isArm ? 1.0 : 0.8),
                  0,
                ]}
              >
                <Html center distanceFactor={110} zIndexRange={[20, 0]}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedObject(milkyWayToSkyObject(obj));
                    }}
                    className={`group flex flex-col items-center cursor-pointer pointer-events-auto transition-transform ${
                      isSelected ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border backdrop-blur-md shadow-lg transition-all ${
                        isSun
                          ? 'bg-amber-950/95 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 font-bold'
                          : isArm
                          ? 'bg-space-950/95 border-sky-500/70 text-sky-200 font-semibold'
                          : isSelected
                          ? 'bg-cyan-950/95 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/50 font-bold'
                          : 'bg-space-950/90 border-slate-700/80 text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: obj.color }}
                      />
                      <span className="text-[10px] font-sans whitespace-nowrap">
                        {obj.name}
                      </span>
                    </div>
                    {/* Distance Sub-label */}
                    <span className="text-[8px] font-mono text-slate-400 mt-0.5 whitespace-nowrap bg-space-950/80 px-1 rounded">
                      {isSun ? 'YOU ARE HERE' : obj.distanceDesc}
                    </span>
                  </button>
                </Html>
              </Billboard>
            </group>
          );
        })}
      </Canvas>

      {/* Floating Milky Way Compass / Legend at Bottom-Left */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none flex flex-col gap-1.5 bg-space-900/85 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-2xl max-w-xs text-xs font-mono">
        <div className="flex items-center justify-between text-cyan-300 font-bold uppercase tracking-wider text-[11px]">
          <span>Milky Way Galaxy Cartography</span>
          <span className="text-slate-400 text-[10px]">SBbc Type</span>
        </div>
        <div className="text-[10px] text-slate-300 space-y-0.5 pt-1 border-t border-slate-800">
          <div>• Diameter: <span className="text-slate-100">100,000 light-years</span></div>
          <div>• Galactic Core: <span className="text-orange-400 font-semibold">Sagittarius A* (4.3M M☉)</span></div>
          <div>• Sun's Location: <span className="text-amber-300 font-semibold">Orion Spur (26,670 ly from core)</span></div>
          <div>• Cosmic Year: <span className="text-slate-100">230 Million Earth Years</span></div>
        </div>
      </div>
    </div>
  );
});
