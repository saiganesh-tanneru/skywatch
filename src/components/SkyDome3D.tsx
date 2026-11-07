import React, { useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useSkyStore } from '../store/useSkyStore';
import { SkyObject } from '../types';
import { altAzToCartesian } from '../lib/coordinates';
import { textureFactory } from '../lib/celestialTextures';

const DOME_RADIUS = 90;

export interface SkyDome3DRef {
  resetNorth: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToObject: (obj: SkyObject) => void;
}

const CARDINALS = [
  { label: 'N', az: 0, primary: true, color: '#38bdf8' },
  { label: 'NE', az: 45, primary: false, color: '#94a3b8' },
  { label: 'E', az: 90, primary: true, color: '#f1f5f9' },
  { label: 'SE', az: 135, primary: false, color: '#94a3b8' },
  { label: 'S', az: 180, primary: true, color: '#f1f5f9' },
  { label: 'SW', az: 225, primary: false, color: '#94a3b8' },
  { label: 'W', az: 270, primary: true, color: '#f1f5f9' },
  { label: 'NW', az: 315, primary: false, color: '#94a3b8' },
];

/**
 * Deep space background starfield with 2,500 background stars
 */
const DeepSpaceStarfield: React.FC = () => {
  const points = useMemo(() => {
    const count = 2500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const r = DOME_RADIUS * 1.8;

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.95 + 0.05);

      positions[i * 3] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = -r * Math.sin(phi) * Math.cos(theta);

      const tint = Math.random();
      if (tint > 0.85) {
        colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 1.0;
      } else if (tint > 0.7) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.9; colors[i * 3 + 2] = 0.7;
      } else {
        colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0;
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
        size={1.2}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={false}
      />
    </points>
  );
};

const AtmosphereGlow: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <ringGeometry args={[DOME_RADIUS * 0.98, DOME_RADIUS * 1.03, 64]} />
      <meshBasicMaterial
        color="#06b6d4"
        transparent
        opacity={0.25}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const DomeGrid: React.FC = () => {
  const altitudeRings = useMemo(() => {
    return [0, 30, 60].map((alt) => {
      const isHorizon = alt === 0;
      const altRad = (alt * Math.PI) / 180;
      const r = DOME_RADIUS * Math.cos(altRad);
      const y = DOME_RADIUS * Math.sin(altRad);

      const points: THREE.Vector3[] = [];
      const segments = 96;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(r * Math.sin(theta), y, -r * Math.cos(theta)));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: isHorizon ? 0x06b6d4 : 0x1e293b,
        transparent: true,
        opacity: isHorizon ? 0.9 : 0.4,
      });
      return { alt, line: new THREE.Line(geometry, material) };
    });
  }, []);

  const meridianArcs = useMemo(() => {
    const lines: THREE.Line[] = [];
    const material = new THREE.LineBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.35,
    });

    for (let az = 0; az < 360; az += 30) {
      const azRad = (az * Math.PI) / 180;
      const points: THREE.Vector3[] = [];
      const steps = 32;
      for (let i = 0; i <= steps; i++) {
        const alt = (i / steps) * 90;
        const altRad = (alt * Math.PI) / 180;
        const r = DOME_RADIUS * Math.cos(altRad);
        const y = DOME_RADIUS * Math.sin(altRad);
        points.push(new THREE.Vector3(r * Math.sin(azRad), y, -r * Math.cos(azRad)));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(new THREE.Line(geometry, material));
    }
    return lines;
  }, []);

  return (
    <group>
      {/* Google Earth Dark Surface Ground Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.3, 0]}>
        <circleGeometry args={[DOME_RADIUS * 1.06, 64]} />
        <meshBasicMaterial color="#030712" opacity={0.94} transparent />
      </mesh>

      {/* Ground compass radial grid */}
      <polarGridHelper
        args={[DOME_RADIUS, 16, 4, 64, 0x1e293b, 0x0b1329]}
        position={[0, 0, 0]}
      />

      <AtmosphereGlow />

      {altitudeRings.map(({ alt, line }) => (
        <primitive key={`alt-ring-${alt}`} object={line} />
      ))}

      {meridianArcs.map((line, idx) => (
        <primitive key={`meridian-${idx}`} object={line} />
      ))}

      {CARDINALS.map(({ label, az, primary, color }) => {
        const pos = altAzToCartesian(0, az, DOME_RADIUS * 1.04);
        return (
          <Billboard key={`cardinal-${label}`} position={[pos.x, 0.5, pos.z]} follow={true}>
            <Html center distanceFactor={140} zIndexRange={[10, 0]}>
              <div
                className={`font-mono font-bold select-none cursor-default transition-transform ${
                  primary
                    ? 'text-xs px-2 py-0.5 rounded-lg bg-space-900/90 border border-slate-700/80 shadow-lg'
                    : 'text-[10px] text-slate-500'
                }`}
                style={{ color }}
              >
                {label}
              </div>
            </Html>
          </Billboard>
        );
      })}

      {[30, 60].map((alt) => {
        const pos = altAzToCartesian(alt, 0, DOME_RADIUS);
        return (
          <Billboard key={`alt-label-${alt}`} position={[pos.x, pos.y, pos.z]} follow={true}>
            <Html center distanceFactor={150} zIndexRange={[10, 0]}>
              <span className="font-mono text-[9px] text-cyan-400/80 bg-space-950/80 px-1 py-0.5 rounded border border-cyan-900/50">
                +{alt}°
              </span>
            </Html>
          </Billboard>
        );
      })}

      <mesh position={[0, DOME_RADIUS, 0]}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <Billboard position={[0, DOME_RADIUS + 2.5, 0]}>
        <Html center distanceFactor={150} zIndexRange={[10, 0]}>
          <span className="font-mono text-[9px] font-bold text-sky-400 bg-space-950/90 px-1.5 py-0.5 rounded border border-sky-800/60">
            Zenith (90°)
          </span>
        </Html>
      </Billboard>
    </group>
  );
};

interface SkyObjects3DProps {
  objects: SkyObject[];
}

/**
 * Renders celestial objects with rich textures, planetary disks, rings, solar flares and starbursts.
 */
const SkyObjects3D: React.FC<SkyObjects3DProps> = ({ objects }) => {
  const { selectedObject, setSelectedObject } = useSkyStore();

  const sunTex = useMemo(() => textureFactory.getSunTexture(), []);
  const moonTex = useMemo(() => textureFactory.getMoonTexture(), []);
  const marsTex = useMemo(() => textureFactory.getMarsTexture(), []);
  const jupiterTex = useMemo(() => textureFactory.getJupiterTexture(), []);
  const saturnTex = useMemo(() => textureFactory.getSaturnTexture(), []);
  const starburstTex = useMemo(() => textureFactory.getStarStarburstTexture(), []);

  const issTex = useMemo(() => textureFactory.getSpacecraftTexture('iss'), []);
  const tiangongTex = useMemo(() => textureFactory.getSpacecraftTexture('tiangong'), []);
  const hubbleTex = useMemo(() => textureFactory.getSpacecraftTexture('hubble'), []);
  const genericSatTex = useMemo(() => textureFactory.getSpacecraftTexture('satellite'), []);

  return (
    <group>
      {objects.map((obj) => {
        if (obj.altitude < 0) return null;

        const isSelected = selectedObject?.id === obj.id;
        const pos = altAzToCartesian(obj.altitude, obj.azimuth, DOME_RADIUS * 0.98);

        // Render appropriate visual graphic according to body type
        return (
          <group
            key={obj.id}
            position={[pos.x, pos.y, pos.z]}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedObject(obj);
            }}
          >
            {/* SUN: Photorealistic glowing corona disc */}
            {obj.type === 'sun' && (
              <Billboard follow={true}>
                <mesh>
                  <planeGeometry args={[9.0, 9.0]} />
                  <meshBasicMaterial map={sunTex} transparent depthWrite={false} />
                </mesh>
              </Billboard>
            )}

            {/* MOON: Textured lunar globe */}
            {obj.type === 'moon' && (
              <Billboard follow={true}>
                <mesh>
                  <circleGeometry args={[2.8, 32]} />
                  <meshBasicMaterial map={moonTex} />
                </mesh>
              </Billboard>
            )}

            {/* PLANETS */}
            {obj.type === 'planet' && (
              <Billboard follow={true}>
                {obj.name === 'Mars' && (
                  <mesh>
                    <circleGeometry args={[1.8, 32]} />
                    <meshBasicMaterial map={marsTex} />
                  </mesh>
                )}

                {obj.name === 'Jupiter' && (
                  <mesh>
                    <circleGeometry args={[2.5, 32]} />
                    <meshBasicMaterial map={jupiterTex} />
                  </mesh>
                )}

                {obj.name === 'Saturn' && (
                  <group>
                    {/* Saturn Planet Body */}
                    <mesh>
                      <circleGeometry args={[1.9, 32]} />
                      <meshBasicMaterial map={saturnTex} />
                    </mesh>
                    {/* Saturn Ring System */}
                    <mesh rotation={[0, 0, Math.PI / 6]}>
                      <ringGeometry args={[2.4, 4.4, 48]} />
                      <meshBasicMaterial color="#d4b478" side={THREE.DoubleSide} transparent opacity={0.85} />
                    </mesh>
                  </group>
                )}

                {obj.name !== 'Mars' && obj.name !== 'Jupiter' && obj.name !== 'Saturn' && (
                  <mesh>
                    <circleGeometry args={[1.6, 24]} />
                    <meshBasicMaterial color={obj.color || '#f59e0b'} />
                  </mesh>
                )}
              </Billboard>
            )}

            {/* SATELLITES & SPACECRAFT WITH AUTHENTIC CRAFT IMAGES */}
            {obj.type === 'satellite' && (
              <Billboard follow={true}>
                {/* ISS: International Space Station */}
                {obj.noradId === 25544 || obj.name.includes('ISS') ? (
                  <mesh>
                    <planeGeometry args={[4.2, 4.2]} />
                    <meshBasicMaterial map={issTex} transparent depthWrite={false} />
                  </mesh>
                ) : obj.noradId === 48274 || obj.name.includes('TIANGONG') || obj.name.includes('CSS') ? (
                  /* Tiangong Chinese Space Station */
                  <mesh>
                    <planeGeometry args={[3.8, 3.8]} />
                    <meshBasicMaterial map={tiangongTex} transparent depthWrite={false} />
                  </mesh>
                ) : obj.noradId === 20580 || obj.name.includes('HUBBLE') || obj.name.includes('HST') ? (
                  /* Hubble Space Telescope */
                  <mesh>
                    <planeGeometry args={[3.4, 3.4]} />
                    <meshBasicMaterial map={hubbleTex} transparent depthWrite={false} />
                  </mesh>
                ) : (
                  /* Communications / Observation Satellite */
                  <mesh>
                    <planeGeometry args={[2.5, 2.5]} />
                    <meshBasicMaterial map={genericSatTex} transparent depthWrite={false} />
                  </mesh>
                )}
              </Billboard>
            )}

            {/* STARS: 4-Point Starburst Diffraction Spikes */}
            {obj.type === 'star' && (
              <Billboard follow={true}>
                <mesh>
                  <planeGeometry args={[Math.max(1.6, 3.2 - (obj.magnitude ?? 3) * 0.4), Math.max(1.6, 3.2 - (obj.magnitude ?? 3) * 0.4)]} />
                  <meshBasicMaterial
                    map={starburstTex}
                    color={obj.color || '#ffffff'}
                    transparent
                    depthWrite={false}
                  />
                </mesh>
              </Billboard>
            )}

            {/* Pulsing Selection Halo */}
            {isSelected && (
              <mesh>
                <ringGeometry args={[3.6, 4.2, 32]} />
                <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
              </mesh>
            )}

            {/* Smart Billboard Label for Prominent Objects or Selection */}
            {(isSelected ||
              obj.type === 'sun' ||
              obj.type === 'moon' ||
              obj.type === 'planet' ||
              obj.noradId === 25544 ||
              (obj.magnitude !== undefined && obj.magnitude < 2.5)) && (
              <Billboard position={[0, 2.6, 0]}>
                <Html center distanceFactor={140} zIndexRange={[10, 0]}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedObject(obj);
                    }}
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] whitespace-nowrap cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-space-950 font-bold shadow-lg shadow-cyan-500/50'
                        : 'bg-space-900/90 text-slate-200 border border-slate-700/80 hover:border-cyan-400'
                    }`}
                  >
                    {obj.name}
                  </div>
                </Html>
              </Billboard>
            )}
          </group>
        );
      })}
    </group>
  );
};

interface SkyDome3DProps {
  objects: SkyObject[];
}

const CameraController: React.FC<{
  controlsRef: React.RefObject<any>;
}> = ({ controlsRef }) => {
  const { selectedObject } = useSkyStore();
  const animatingRef = useRef<boolean>(false);
  const targetCamPos = useRef(new THREE.Vector3(0, 22, 115));
  const targetLookAt = useRef(new THREE.Vector3(0, 5, 0));

  useEffect(() => {
    if (selectedObject) {
      const objPos = altAzToCartesian(selectedObject.altitude, selectedObject.azimuth, DOME_RADIUS);
      targetLookAt.current.set(objPos.x, objPos.y, objPos.z);
      targetCamPos.current.set(objPos.x * 0.45, objPos.y * 0.45, objPos.z * 0.45);
      animatingRef.current = true;
    } else {
      targetLookAt.current.set(0, 5, 0);
      targetCamPos.current.set(0, 22, 115);
      animatingRef.current = true;
    }
  }, [selectedObject]);

  useFrame((_, delta) => {
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

export const SkyDome3D = forwardRef<SkyDome3DRef, SkyDome3DProps>(({ objects }, ref) => {
  const { setSelectedObject } = useSkyStore();
  const controlsRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    resetNorth: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
        controlsRef.current.object.position.set(0, 22, 115);
        controlsRef.current.target.set(0, 5, 0);
        controlsRef.current.update();
      }
    },
    zoomIn: () => {
      if (controlsRef.current) {
        const controls = controlsRef.current;
        const cam = controls.object;
        const offset = new THREE.Vector3().subVectors(cam.position, controls.target);
        if (offset.length() > 15) {
          cam.position.copy(controls.target).addScaledVector(offset, 0.78);
          controls.update();
        }
      }
    },
    zoomOut: () => {
      if (controlsRef.current) {
        const controls = controlsRef.current;
        const cam = controls.object;
        const offset = new THREE.Vector3().subVectors(cam.position, controls.target);
        if (offset.length() < 350) {
          cam.position.copy(controls.target).addScaledVector(offset, 1.28);
          controls.update();
        }
      }
    },
    zoomToObject: (obj: SkyObject) => {
      const objPos = altAzToCartesian(obj.altitude, obj.azimuth, DOME_RADIUS);
      if (controlsRef.current) {
        controlsRef.current.target.set(objPos.x, objPos.y, objPos.z);
        controlsRef.current.object.position.set(objPos.x * 0.45, objPos.y * 0.45, objPos.z * 0.45);
        controlsRef.current.update();
      }
    },
  }));

  return (
    <div className="relative w-full h-full bg-space-950 select-none">
      <Canvas
        camera={{ position: [0, 22, 115], fov: 50, near: 0.1, far: 1000 }}
        onPointerMissed={() => setSelectedObject(null)}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.4} />

        <DeepSpaceStarfield />
        <DomeGrid />
        <SkyObjects3D objects={objects} />
        <CameraController controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          panSpeed={0.5}
          minDistance={15}
          maxDistance={280}
          maxPolarAngle={Math.PI / 2 + 0.05}
        />
      </Canvas>
    </div>
  );
});
