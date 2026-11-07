import React, { useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useSkyStore } from '../store/useSkyStore';
import { SkyObject } from '../types';
import { textureFactory } from '../lib/celestialTextures';
import { isSatelliteVisibleByFilter } from '../lib/satelliteMath';

export interface EarthGlobe3DRef {
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToObject: (obj: SkyObject) => void;
}

const EARTH_RADIUS = 22; // Globe scale units
const REAL_EARTH_RADIUS_KM = 6371;

/**
 * Converts Geodetic (Lat, Lon) to 3D Cartesian on the Earth Globe
 */
function latLonToGlobe(latDeg: number, lonDeg: number, radius: number): THREE.Vector3 {
  const latRad = (latDeg * Math.PI) / 180;
  const lonRad = (lonDeg * Math.PI) / 180;

  // Y is North pole, X/Z is equatorial plane
  return new THREE.Vector3(
    radius * Math.cos(latRad) * Math.sin(lonRad),
    radius * Math.sin(latRad),
    radius * Math.cos(latRad) * Math.cos(lonRad)
  );
}

/**
 * Earth Atmosphere Glow Layer
 */
const EarthAtmosphere: React.FC = () => {
  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS * 1.025, 64, 64]} />
      <meshBasicMaterial
        color="#38bdf8"
        transparent
        opacity={0.18}
        side={THREE.BackSide}
      />
    </mesh>
  );
};

/**
 * Observer Location Pin on Earth's Surface
 */
const ObserverMarker: React.FC = () => {
  const { location } = useSkyStore();

  const pos = useMemo(
    () => latLonToGlobe(location.latitude, location.longitude, EARTH_RADIUS * 1.01),
    [location.latitude, location.longitude]
  );

  return (
    <group position={pos}>
      {/* Glowing Pin Point */}
      <mesh>
        <sphereGeometry args={[0.55, 16, 16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* Pulsing beacon ring */}
      <mesh>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshBasicMaterial color="#22d3ee" side={THREE.DoubleSide} />
      </mesh>

      {/* Label */}
      <Billboard position={[0, 1.2, 0]}>
        <Html center distanceFactor={80} zIndexRange={[10, 0]}>
          <div className="px-2 py-0.5 rounded-lg bg-cyan-950/90 border border-cyan-500/80 shadow-lg font-mono text-[10px] text-cyan-200 whitespace-nowrap">
            📍 {location.name.split(',')[0]} (Observer)
          </div>
        </Html>
      </Billboard>
    </group>
  );
};

interface EarthGlobe3DProps {
  objects: SkyObject[];
}

const GlobeCameraController: React.FC<{ controlsRef: React.RefObject<any> }> = ({ controlsRef }) => {
  const { selectedObject } = useSkyStore();
  const animatingRef = useRef<boolean>(false);
  const targetCamPos = useRef(new THREE.Vector3(0, 25, 75));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (selectedObject && selectedObject.subLat !== undefined && selectedObject.subLon !== undefined) {
      const satRadius = EARTH_RADIUS + ((selectedObject.altKm || 400) / REAL_EARTH_RADIUS_KM) * EARTH_RADIUS;
      const satPos = latLonToGlobe(selectedObject.subLat, selectedObject.subLon, satRadius);
      targetLookAt.current.copy(satPos);
      targetCamPos.current.copy(satPos).multiplyScalar(1.4);
      animatingRef.current = true;
    } else if (!selectedObject) {
      targetLookAt.current.set(0, 0, 0);
      targetCamPos.current.set(0, 25, 75);
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

export const EarthGlobe3D = forwardRef<EarthGlobe3DRef, EarthGlobe3DProps>(({ objects }, ref) => {
  const { location, selectedObject, setSelectedObject, filters } = useSkyStore();
  const controlsRef = useRef<any>(null);

  const earthTex = useMemo(() => textureFactory.getEarthTexture(), []);
  const issTex = useMemo(() => textureFactory.getSpacecraftTexture('iss'), []);
  const tiangongTex = useMemo(() => textureFactory.getSpacecraftTexture('tiangong'), []);
  const hubbleTex = useMemo(() => textureFactory.getSpacecraftTexture('hubble'), []);
  const genericSatTex = useMemo(() => textureFactory.getSpacecraftTexture('satellite'), []);

  useImperativeHandle(ref, () => ({
    resetView: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
        controlsRef.current.object.position.set(0, 25, 75);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    },
    zoomIn: () => {
      if (controlsRef.current) {
        const controls = controlsRef.current;
        const cam = controls.object;
        const offset = new THREE.Vector3().subVectors(cam.position, controls.target);
        if (offset.length() > 24) {
          cam.position.copy(controls.target).addScaledVector(offset, 0.75);
          controls.update();
        }
      }
    },
    zoomOut: () => {
      if (controlsRef.current) {
        const controls = controlsRef.current;
        const cam = controls.object;
        const offset = new THREE.Vector3().subVectors(cam.position, controls.target);
        if (offset.length() < 300) {
          cam.position.copy(controls.target).addScaledVector(offset, 1.3);
          controls.update();
        }
      }
    },
    zoomToObject: (obj: SkyObject) => {
      if (controlsRef.current && obj.subLat !== undefined && obj.subLon !== undefined) {
        const satRadius = EARTH_RADIUS + ((obj.altKm || 400) / REAL_EARTH_RADIUS_KM) * EARTH_RADIUS;
        const satPos = latLonToGlobe(obj.subLat, obj.subLon, satRadius);
        controlsRef.current.target.copy(satPos);
        controlsRef.current.object.position.copy(satPos).multiplyScalar(1.4);
        controlsRef.current.update();
      }
    },
  }));

  // Filter satellites
  const satellites = useMemo(() => {
    if (!filters.satellites) return [];
    let list = objects.filter(
      (o) => o.type === 'satellite' && isSatelliteVisibleByFilter(o, filters.satelliteGroups)
    );
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          (o.noradId && String(o.noradId).includes(q))
      );
    }
    return list;
  }, [objects, filters.satellites, filters.satelliteGroups, filters.searchQuery]);

  const observerPos = useMemo(
    () => latLonToGlobe(location.latitude, location.longitude, EARTH_RADIUS * 1.01),
    [location.latitude, location.longitude]
  );

  return (
    <div className="relative w-full h-full bg-space-950 select-none">
      <Canvas
        camera={{ position: [0, 25, 75], fov: 45, near: 0.1, far: 2000 }}
        onPointerMissed={() => setSelectedObject(null)}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#030712']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[100, 40, 80]} intensity={1.2} />
        <GlobeCameraController controlsRef={controlsRef} />

        {/* 3D EARTH GLOBE */}
        <mesh>
          <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
          <meshStandardMaterial
            map={earthTex}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>

        {/* Atmosphere Limb */}
        <EarthAtmosphere />

        {/* Observer Vantage Marker */}
        <ObserverMarker />

        {/* SATELLITES ORBITING EARTH */}
        {satellites.map((sat) => {
          const lat = sat.subLat ?? 0;
          const lon = sat.subLon ?? 0;
          const altKm = sat.altKm ?? 450;
          const orbitR = EARTH_RADIUS * ((REAL_EARTH_RADIUS_KM + altKm) / REAL_EARTH_RADIUS_KM);
          const satPos = latLonToGlobe(lat, lon, orbitR);

          const isSelected = selectedObject?.id === sat.id;
          const isAboveHorizon = sat.altitude >= 0;
          const isIsro =
            sat.category === 'isro' ||
            sat.name.toUpperCase().includes('NAVIC') ||
            sat.name.toUpperCase().includes('IRNSS') ||
            sat.name.toUpperCase().includes('ASTROSAT') ||
            sat.name.toUpperCase().includes('XPOSAT') ||
            sat.name.toUpperCase().includes('CARTOSAT') ||
            sat.name.toUpperCase().includes('EOS-') ||
            sat.name.toUpperCase().includes('GSAT') ||
            sat.name.toUpperCase().includes('INSAT');

          return (
            <group key={sat.id}>
              {/* Satellite Spacecraft Node */}
              <group
                position={satPos}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedObject(sat);
                }}
              >
                <Billboard follow={true}>
                  {sat.noradId === 25544 || sat.name.includes('ISS') ? (
                    <mesh>
                      <planeGeometry args={[2.8, 2.8]} />
                      <meshBasicMaterial map={issTex} transparent depthWrite={false} />
                    </mesh>
                  ) : sat.noradId === 48274 || sat.name.includes('TIANGONG') || sat.name.includes('CSS') ? (
                    <mesh>
                      <planeGeometry args={[2.5, 2.5]} />
                      <meshBasicMaterial map={tiangongTex} transparent depthWrite={false} />
                    </mesh>
                  ) : sat.noradId === 20580 || sat.name.includes('HUBBLE') || sat.name.includes('HST') ? (
                    <mesh>
                      <planeGeometry args={[2.2, 2.2]} />
                      <meshBasicMaterial map={hubbleTex} transparent depthWrite={false} />
                    </mesh>
                  ) : (
                    <mesh>
                      <planeGeometry args={[1.6, 1.6]} />
                      <meshBasicMaterial map={genericSatTex} transparent depthWrite={false} />
                    </mesh>
                  )}
                </Billboard>

                {/* Selection Halo */}
                {isSelected && (
                  <mesh>
                    <ringGeometry args={[1.8, 2.3, 32]} />
                    <meshBasicMaterial color={isIsro ? '#f97316' : '#38bdf8'} side={THREE.DoubleSide} />
                  </mesh>
                )}

                {/* Satellite Name Tag */}
                {(isSelected || sat.noradId === 25544 || isAboveHorizon || isIsro) && (
                  <Billboard position={[0, 1.6, 0]}>
                    <Html center distanceFactor={70} zIndexRange={[10, 0]}>
                      <div
                        className={`px-1.5 py-0.5 rounded font-mono text-[9px] whitespace-nowrap cursor-pointer transition-all ${
                          isSelected
                            ? isIsro
                              ? 'bg-amber-500 text-space-950 font-bold shadow-lg shadow-amber-500/50'
                              : 'bg-cyan-500 text-space-950 font-bold shadow-lg shadow-cyan-500/50'
                            : isIsro
                            ? 'bg-amber-950/90 text-amber-300 border border-amber-600/70 shadow-sm shadow-amber-500/20'
                            : isAboveHorizon
                            ? 'bg-space-900/90 text-cyan-200 border border-cyan-800'
                            : 'bg-space-950/80 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {isIsro ? '🇮🇳 ' : ''}{sat.name} ({altKm}km)
                      </div>
                    </Html>
                  </Billboard>
                )}
              </group>

              {/* Line-of-sight to observer if currently above horizon */}
              {isAboveHorizon && isSelected && (
                <primitive
                  object={
                    new THREE.Line(
                      new THREE.BufferGeometry().setFromPoints([observerPos, satPos]),
                      new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.6 })
                    )
                  }
                />
              )}
            </group>
          );
        })}

        {/* Orbit Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          minDistance={26}
          maxDistance={220}
        />
      </Canvas>

      {/* Floating HUD info */}
      <div className="absolute bottom-10 left-4 pointer-events-none flex flex-col gap-1 text-[11px] font-mono text-slate-400 bg-space-900/80 p-2.5 rounded-xl border border-slate-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>3D Earth Orbit View (Geocentric Perspective)</span>
        </div>
        <div className="text-slate-400">
          Viewing Earth & satellite constellations relative to Earth center
        </div>
        <div className="text-slate-500">
          Rotate: Left Click + Drag | Zoom: Scroll | Click any satellite to inspect
        </div>
      </div>
    </div>
  );
});
