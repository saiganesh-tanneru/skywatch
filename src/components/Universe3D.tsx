import React, { useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useSkyStore } from '../store/useSkyStore';
import { SkyObject } from '../types';
import { textureFactory } from '../lib/celestialTextures';
import {
  COSMIC_OBJECTS,
  cosmicToSkyObject,
} from '../lib/universeData';

export interface Universe3DRef {
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToObject: (obj: SkyObject) => void;
}

/**
 * Cosmic Web: Scaffolding of 3,200 galaxy clusters & dark matter filaments
 */
const CosmicWeb: React.FC = () => {
  const points = useMemo(() => {
    const count = 3200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Clustered along cosmic filaments
      const r = 18 + Math.pow(Math.random(), 0.65) * 160;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.9;

      // Add filament clustering wave
      const filamentJitter = Math.sin(theta * 3) * Math.cos(phi * 3) * 15;
      const radius = r + filamentJitter;

      positions[i * 3] = radius * Math.cos(phi) * Math.sin(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi);
      positions[i * 3 + 2] = -radius * Math.cos(phi) * Math.cos(theta);

      // Deep field galaxy color temperatures
      const type = Math.random();
      if (type > 0.8) {
        colors[i * 3] = 0.38; colors[i * 3 + 1] = 0.74; colors[i * 3 + 2] = 0.97; // Cyan blue
      } else if (type > 0.5) {
        colors[i * 3] = 0.98; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.38; // Golden yellow
      } else if (type > 0.25) {
        colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.45; colors[i * 3 + 2] = 0.25; // Redshift orange
      } else {
        colors[i * 3] = 0.75; colors[i * 3 + 1] = 0.45; colors[i * 3 + 2] = 0.95; // Deep violet
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  return (
    <points geometry={points}>
      <pointsMaterial
        size={1.3}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation={false}
      />
    </points>
  );
};

/**
 * Cosmic Microwave Background (CMB): The outer horizon of the observable universe
 */
const ObservableUniverseCMB: React.FC = () => {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[185, 48, 48]} />
        <meshBasicMaterial
          color="#f43f5e"
          transparent
          opacity={0.07}
          wireframe
          side={THREE.BackSide}
        />
      </mesh>
      <Billboard position={[0, 185, 0]}>
        <Html center distanceFactor={260} zIndexRange={[10, 0]}>
          <div className="font-mono text-[9px] uppercase tracking-wider text-rose-400 bg-space-950/90 px-2 py-0.5 rounded border border-rose-500/40 shadow-lg">
            Cosmic Horizon (z ≈ 1100 • 46.5 Billion ly)
          </div>
        </Html>
      </Billboard>
    </group>
  );
};

/**
 * Relativistic Bipolar Jets for active Black Holes and Quasars
 */
const RelativisticJets: React.FC<{ length?: number; color?: string }> = ({
  length = 8,
  color = '#38bdf8',
}) => {
  return (
    <group>
      {/* North Jet */}
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[0.08, 0.4, length, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} />
      </mesh>
      {/* South Jet */}
      <mesh position={[0, -length / 2, 0]}>
        <cylinderGeometry args={[0.4, 0.08, length, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} />
      </mesh>
    </group>
  );
};

interface Universe3DProps {
  objects?: SkyObject[];
}

const UniverseCameraController: React.FC<{
  controlsRef: React.RefObject<any>;
  isInteractingRef: React.MutableRefObject<boolean>;
}> = ({ controlsRef, isInteractingRef }) => {
  const { selectedObject } = useSkyStore();
  const animatingRef = useRef<boolean>(false);
  const targetCamPos = useRef(new THREE.Vector3(0, 95, 150));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const prevSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentId = selectedObject?.id || null;
    if (currentId === prevSelectedIdRef.current) return;
    prevSelectedIdRef.current = currentId;
    isInteractingRef.current = false;

    if (selectedObject) {
      const match = COSMIC_OBJECTS.find((c) => c.id === selectedObject.id);
      if (match) {
        targetLookAt.current.copy(match.cosmicPos);
        const distOffset = Math.max(3.5, match.size * 1.8);
        targetCamPos.current.set(
          match.cosmicPos.x,
          match.cosmicPos.y + distOffset * 0.7,
          match.cosmicPos.z + distOffset * 1.2
        );
        animatingRef.current = true;
        return;
      }
    } else {
      // Default universe vantage view
      targetLookAt.current.set(0, 0, 0);
      targetCamPos.current.set(0, 95, 150);
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

export const Universe3D = forwardRef<Universe3DRef, Universe3DProps>((_, ref) => {
  const { selectedObject, setSelectedObject, filters } = useSkyStore();
  const controlsRef = useRef<any>(null);
  const isInteractingRef = useRef<boolean>(false);

  // Textures
  const galaxyTex = useMemo(() => textureFactory.getGalaxyTexture(), []);
  const blackHoleTex = useMemo(() => textureFactory.getBlackHoleTexture(), []);
  const wormholeTex = useMemo(() => textureFactory.getWormholeTexture(), []);
  const nebulaTex = useMemo(() => textureFactory.getNebulaTexture(), []);

  // Filter cosmic objects
  const filteredCosmicObjects = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    return COSMIC_OBJECTS.filter((obj) => {
      // Category isolation & selection filters
      if (obj.category === 'galaxy' && !filters.galaxies) return false;
      if (obj.category === 'black_hole' && !filters.blackHoles) return false;
      if (obj.category === 'wormhole' && !filters.wormholes) return false;
      if (obj.category === 'dead_star' && !filters.deadStars) return false;

      if (q) {
        const match =
          obj.name.toLowerCase().includes(q) ||
          obj.subType.toLowerCase().includes(q) ||
          obj.category.toLowerCase().includes(q) ||
          obj.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [filters.searchQuery, filters.galaxies, filters.blackHoles, filters.wormholes, filters.deadStars]);

  useImperativeHandle(ref, () => ({
    resetView: () => {
      isInteractingRef.current = false;
      if (controlsRef.current) {
        controlsRef.current.reset();
        controlsRef.current.object.position.set(0, 95, 150);
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
        if (offset.length() < 1500) {
          cam.position.copy(controls.target).addScaledVector(offset, 1.35);
          controls.update();
        }
      }
    },
    zoomToObject: (obj: SkyObject) => {
      if (!controlsRef.current) return;
      isInteractingRef.current = false;

      const match = COSMIC_OBJECTS.find((c) => c.id === obj.id);
      if (match) {
        controlsRef.current.target.copy(match.cosmicPos);
        const distOffset = Math.max(3.5, match.size * 1.8);
        controlsRef.current.object.position.set(
          match.cosmicPos.x,
          match.cosmicPos.y + distOffset * 0.7,
          match.cosmicPos.z + distOffset * 1.2
        );
        controlsRef.current.update();
      }
    },
  }));

  return (
    <div className="relative w-full h-full bg-space-950 select-none">
      <Canvas
        camera={{ position: [0, 95, 150], fov: 45, near: 0.1, far: 8000 }}
        onPointerMissed={() => setSelectedObject(null)}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#02040a']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={2.0} distance={400} decay={1} />
        <UniverseCameraController
          controlsRef={controlsRef}
          isInteractingRef={isInteractingRef}
        />

        {/* 1. COSMIC WEB FILAMENTS & DARK MATTER SCAFFOLDING */}
        <CosmicWeb />

        {/* 2. OBSERVABLE UNIVERSE CMB HORIZON (46.5 Billion ly) */}
        {filters.cosmicHorizon && <ObservableUniverseCMB />}

        {/* 3. MAPPED COSMIC OBJECTS */}
        {filteredCosmicObjects.map((c) => {
          const isSelected = selectedObject?.id === c.id;
          const isBlackHole = c.category === 'black_hole';
          const isWormhole = c.category === 'wormhole';
          const isDeadStar = c.category === 'dead_star';
          const isGalaxy = c.category === 'galaxy';

          return (
            <group
              key={c.id}
              position={c.cosmicPos}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject(cosmicToSkyObject(c));
              }}
            >
              {/* Relativistic Jets for Supermassive Black Holes & Quasars */}
              {isBlackHole && (c.id === 'bh-m87-star' || c.id === 'bh-ton-618' || c.id === 'bh-cygnus-x1') && (
                <RelativisticJets length={c.size * 2.2} color={c.color} />
              )}

              {/* Main Object Billboard Visual Representation */}
              <Billboard follow={true}>
                {isGalaxy ? (
                  <mesh>
                    <circleGeometry args={[c.size, 48]} />
                    <meshBasicMaterial map={galaxyTex} transparent depthWrite={false} />
                  </mesh>
                ) : isBlackHole ? (
                  <mesh>
                    <circleGeometry args={[c.size, 48]} />
                    <meshBasicMaterial map={blackHoleTex} transparent depthWrite={false} />
                  </mesh>
                ) : isWormhole ? (
                  <mesh>
                    <circleGeometry args={[c.size, 48]} />
                    <meshBasicMaterial map={wormholeTex} transparent depthWrite={false} />
                  </mesh>
                ) : isDeadStar ? (
                  <mesh>
                    <circleGeometry args={[c.size, 48]} />
                    <meshBasicMaterial map={nebulaTex} transparent depthWrite={false} />
                  </mesh>
                ) : (
                  <mesh>
                    <circleGeometry args={[c.size, 32]} />
                    <meshBasicMaterial color={c.color} />
                  </mesh>
                )}
              </Billboard>

              {/* Selection Ring Halo */}
              {isSelected && (
                <mesh>
                  <ringGeometry args={[c.size * 1.25, c.size * 1.5, 48]} />
                  <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
                </mesh>
              )}

              {/* Interactive Label Badge */}
              <Billboard position={[0, c.size * 1.25 + 0.8, 0]}>
                <Html center distanceFactor={100} zIndexRange={[10, 0]}>
                  <div
                    className={`px-2 py-0.5 rounded font-mono text-[9px] whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 shadow-lg ${
                      isSelected
                        ? 'bg-cyan-500 text-space-950 font-bold shadow-cyan-500/50 scale-105'
                        : isBlackHole
                        ? 'bg-space-900/90 text-amber-300 border border-amber-600/70 hover:border-amber-400'
                        : isWormhole
                        ? 'bg-space-900/90 text-purple-300 border border-purple-600/70 hover:border-purple-400'
                        : isDeadStar
                        ? 'bg-space-900/90 text-rose-300 border border-rose-600/70 hover:border-rose-400'
                        : 'bg-space-900/90 text-blue-300 border border-blue-600/70 hover:border-blue-400'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[7.5px] opacity-75">
                      ({c.distanceDesc.includes('light-years') ? c.distanceDesc.replace(' light-years', ' ly') : c.distanceDesc})
                    </span>
                  </div>
                </Html>
              </Billboard>
            </group>
          );
        })}

        {/* Orbit Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.7}
          zoomSpeed={1.2}
          panSpeed={0.8}
          minDistance={1.8}
          maxDistance={1500}
          onStart={() => {
            isInteractingRef.current = true;
          }}
          onEnd={() => {
            isInteractingRef.current = true;
          }}
        />
      </Canvas>

      {/* Floating HUD info */}
      <div className="absolute bottom-10 left-4 pointer-events-none flex flex-col gap-1 text-[11px] font-mono text-slate-400 bg-space-900/85 p-3 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Vast Known Universe (Cosmic Web & Deep Space)</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-300 mt-0.5">
          <span className="flex items-center gap-1 text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Galaxies
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Black Holes
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Dead / Dying Stars
          </span>
          <span className="flex items-center gap-1 text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Wormholes
          </span>
          <span className="flex items-center gap-1 text-rose-500">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> CMB Cosmic Edge
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Rotate: Left Click + Drag | Zoom: Scroll / Buttons | Click any celestial structure to inspect
        </div>
      </div>
    </div>
  );
});
