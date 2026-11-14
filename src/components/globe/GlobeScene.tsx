import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { cityLabelEls } from "./labels";
import * as THREE from "three";
import { latLonToVec3, subsolarPoint } from "@/lib/geo";
import { CITIES, REGIONS } from "@/lib/data";
import { HORIZONS } from "@/lib/model";
import { useFutures } from "@/store/futures";
import { atmoFragment, atmoVertex, cloudFragment, earthFragment, surfaceVertex } from "./shaders";
import { useEarthTextures } from "./useEarthTextures";

const ATMO_COOP = new THREE.Color("#6fb6ff");
const ATMO_CONF = new THREE.Color("#e0a070");
const CLOUD_COOP = new THREE.Color("#ffffff");
const CLOUD_CONF = new THREE.Color("#efe2cf");
const SCENARIO_COOP = new THREE.Color("#5fe0e6");
const SCENARIO_CONF = new THREE.Color("#f2a24b");

type SunRef = { value: THREE.Vector3 };

function useSun(): SunRef {
  const sun = useMemo<SunRef>(() => ({ value: new THREE.Vector3(1, 0, 0) }), []);
  useEffect(() => {
    const update = () => {
      const p = subsolarPoint(new Date());
      sun.value.set(...latLonToVec3(p.lat, p.lon)).normalize();
    };
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [sun]);
  return sun;
}

/** Scenario intensity eased toward its target so switching animates smoothly. */
function scenarioTargets() {
  const { scenario, horizon } = useFutures.getState();
  const t = horizon / (HORIZONS[HORIZONS.length - 1] ?? 100);
  return {
    stress: scenario === "confrontation" ? 0.25 + 0.75 * t : 0,
    thrive: scenario === "cooperation" ? 0.2 + 0.8 * t : 0,
    conf: scenario === "confrontation" ? 1 : 0,
  };
}

function Earth({ sun, onFirstFrame }: { sun: SunRef; onFirstFrame: () => void }) {
  const tex = useEarthTextures();
  const cloudRef = useRef<THREE.Mesh>(null);

  const frames = useRef(0);
  const mobile = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);
  const seg = mobile ? 96 : 128;

  const earthUniforms = useMemo(
    () => ({
      ...tex,
      uSunDir: sun,
      uAtmo: { value: ATMO_COOP.clone() },
      uNormalStrength: { value: 2.2 },
      uNightBoost: { value: 1.6 },
      uStress: { value: 0 },
      uThrive: { value: 0 },
      uCloudRot: { value: 0 },
      uCloudShadow: { value: 0.45 },
    }),
    [tex, sun],
  );
  const cloudUniforms = useMemo(
    () => ({
      uClouds: tex.uClouds,
      uSunDir: sun,
      uOpacity: { value: 0.85 },
      uTint: { value: CLOUD_COOP.clone() },
    }),
    [tex, sun],
  );
  const atmoUniforms = useMemo(
    () => ({ uAtmo: earthUniforms.uAtmo, uSunDir: sun, uStrength: { value: 1.35 } }),
    [earthUniforms, sun],
  );

  // Materials are built here (not as JSX props) so uniforms stay shared by reference:
  // R3F clones a `uniforms` prop, which would freeze the fallback textures in place.
  const materials = useMemo(
    () => ({
      earth: new THREE.ShaderMaterial({ vertexShader: surfaceVertex, fragmentShader: earthFragment, uniforms: earthUniforms }),
      clouds: new THREE.ShaderMaterial({
        vertexShader: surfaceVertex,
        fragmentShader: cloudFragment,
        uniforms: cloudUniforms,
        transparent: true,
        depthWrite: false,
      }),
      atmo: new THREE.ShaderMaterial({
        vertexShader: atmoVertex,
        fragmentShader: atmoFragment,
        uniforms: atmoUniforms,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    }),
    [earthUniforms, cloudUniforms, atmoUniforms],
  );
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const target = scenarioTargets();
    const k = 1 - Math.exp(-3 * dt);
    earthUniforms.uStress.value += (target.stress - earthUniforms.uStress.value) * k;
    earthUniforms.uThrive.value += (target.thrive - earthUniforms.uThrive.value) * k;
    earthUniforms.uAtmo.value.lerp(target.conf ? ATMO_CONF : ATMO_COOP, k);
    cloudUniforms.uTint.value.lerp(target.conf ? CLOUD_CONF : CLOUD_COOP, k);
    if (cloudRef.current) {
      cloudRef.current.rotation.y += dt * 0.004;
      earthUniforms.uCloudRot.value = (cloudRef.current.rotation.y / (Math.PI * 2)) % 1;
    }
    frames.current += 1;
    if (frames.current === 3) onFirstFrame();
  });

  return (
    <group>
      <mesh material={materials.earth}>
        <sphereGeometry args={[1, seg, seg / 2]} />
      </mesh>
      <mesh ref={cloudRef} renderOrder={1} material={materials.clouds}>
        <sphereGeometry args={[1.008, seg, seg / 2]} />
      </mesh>
      <mesh renderOrder={2} scale={1.1} material={materials.atmo}>
        <sphereGeometry args={[1, 64, 32]} />
      </mesh>
    </group>
  );
}

type OrbitControlsImpl = THREE.EventDispatcher<{ start: object; end: object; change: object }> & {
  autoRotate: boolean;
  rotateSpeed: number;
};

const _v = new THREE.Vector3();
const _c = new THREE.Vector3();

function CityMarkers() {
  const cityId = useFutures((s) => s.cityId);
  const size = useThree((s) => s.size);
  const cities = useMemo(() => CITIES.map((c) => ({ c, p: new THREE.Vector3(...latLonToVec3(c.lat, c.lon, 1.004)) })), []);
  const proj = useMemo(() => new THREE.Vector3(), []);

  // Labels are plain DOM nodes in an overlay; positioned here by projecting each city.
  useFrame(({ camera }) => {
    _c.copy(camera.position).normalize();
    cities.forEach(({ c, p }) => {
      const el = cityLabelEls.get(c.id);
      if (!el) return;
      const facing = _v.copy(p).normalize().dot(_c);
      const visible = facing > 0.25;
      proj.copy(p).project(camera);
      const x = (proj.x * 0.5 + 0.5) * size.width;
      const y = (-proj.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(8px, -50%)`;
      el.style.opacity = visible ? String(Math.min(1, (facing - 0.25) * 4)) : "0";
      el.style.pointerEvents = visible ? "auto" : "none";
    });
  });

  return (
    <group>
      {cities.map(({ c, p }) => (
        <mesh key={c.id} position={p}>
          <sphereGeometry args={[c.id === cityId ? 0.011 : 0.0075, 12, 8]} />
          <meshBasicMaterial color={c.id === cityId ? "#ffffff" : "#ffd9a0"} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function RegionMarkers() {
  const regionId = useFutures((s) => s.regionId);
  const scenario = useFutures((s) => s.scenario);
  const selectRegion = useFutures((s) => s.selectRegion);
  const pulse = useRef<THREE.Mesh>(null);
  const color = scenario === "confrontation" ? SCENARIO_CONF : SCENARIO_COOP;

  const placed = useMemo(
    () =>
      REGIONS.map((r) => {
        const p = new THREE.Vector3(...latLonToVec3(r.lat, r.lon, 1.006));
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize());
        return { r, p, q };
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!pulse.current) return;
    const t = (clock.elapsedTime % 1.8) / 1.8;
    pulse.current.scale.setScalar(1 + t * 1.4);
    (pulse.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - t);
  });

  return (
    <group>
      {placed.map(({ r, p, q }) => {
        const active = r.id === regionId;
        return (
          <group key={r.id} position={p} quaternion={q}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                selectRegion(r.id, r.lat, r.lon, r.zoom);
              }}
            >
              <ringGeometry args={[active ? 0.045 : 0.032, active ? 0.056 : 0.04, 48]} />
              <meshBasicMaterial color={color} transparent opacity={active ? 1 : 0.75} depthWrite={false} toneMapped={false} />
            </mesh>
            {active && (
              <mesh ref={pulse}>
                <ringGeometry args={[0.05, 0.056, 48]} />
                <meshBasicMaterial color={color} transparent opacity={0.6} depthWrite={false} toneMapped={false} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function fitDistance(aspect: number, fov: number) {
  const vHalf = (fov * Math.PI) / 360;
  const hHalf = Math.atan(Math.tan(vHalf) * aspect);
  const half = Math.min(vHalf, hHalf);
  return (1.18 / Math.sin(half)) * 1.0;
}

function CameraRig({ sun }: { sun: SunRef }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const anim = useRef<{ from: THREE.Vector3; to: THREE.Vector3; d0: number; d1: number; t: number } | null>(null);
  const idleTimer = useRef<number | undefined>(undefined);
  const placed = useRef(false);

  // Initial framing: lit hemisphere, distance fitted to the viewport aspect.
  useEffect(() => {
    if (placed.current || size.width === 0) return;
    placed.current = true;
    const p = subsolarPoint(new Date());
    const dir = new THREE.Vector3(...latLonToVec3(18, p.lon - 40)).normalize();
    camera.position.copy(dir.multiplyScalar(fitDistance(size.width / size.height, camera.fov)));
    camera.lookAt(0, 0, 0);
  }, [camera, size, sun]);

  useEffect(() => {
    return useFutures.subscribe((s, prev) => {
      if (!s.focus || s.focus === prev.focus) return;
      const d0 = camera.position.length();
      const to = new THREE.Vector3(...latLonToVec3(s.focus.lat, s.focus.lon)).normalize();
      const minD = fitDistance(size.width / size.height, camera.fov) * 0.62;
      anim.current = {
        from: camera.position.clone().normalize(),
        to,
        d0,
        d1: Math.max(s.focus.zoom, Math.min(minD, 3.2)),
        t: 0,
      };
      if (controls) controls.autoRotate = false;
    });
  }, [camera, controls, size]);

  useEffect(() => {
    if (!controls) return;
    const onStart = () => {
      anim.current = null;
      controls.autoRotate = false;
      window.clearTimeout(idleTimer.current);
    };
    const onEnd = () => {
      window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        if (!useFutures.getState().focus) controls.autoRotate = true;
      }, 9000);
    };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);
    return () => {
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      window.clearTimeout(idleTimer.current);
    };
  }, [controls]);

  const q = useMemo(() => new THREE.Quaternion(), []);
  const qi = useMemo(() => new THREE.Quaternion(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const a = anim.current;
    if (a) {
      a.t = Math.min(1, a.t + dt / 1.6);
      const e = a.t < 0.5 ? 4 * a.t * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 3) / 2;
      q.setFromUnitVectors(a.from, a.to);
      qi.identity().slerp(q, e);
      tmp.copy(a.from).applyQuaternion(qi).multiplyScalar(a.d0 + (a.d1 - a.d0) * e);
      camera.position.copy(tmp);
      camera.lookAt(0, 0, 0);
      if (a.t >= 1) anim.current = null;
    }
    if (controls) {
      const d = camera.position.length();
      controls.rotateSpeed = 0.5 * Math.min(1, Math.max(0.12, (d - 1) / 2.2));
    }
  });

  return null;
}

export interface GlobeSceneProps {
  onReady: () => void;
  onContextLost: () => void;
}

export default function GlobeScene({ onReady, onContextLost }: GlobeSceneProps) {
  const [dpr] = useState(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    return Math.min(window.devicePixelRatio || 1, coarse ? 1.75 : 2);
  });
  const [mobile] = useState(() => window.matchMedia("(pointer: coarse)").matches);

  return (
    <Canvas
      dpr={dpr}
      camera={{ fov: 40, near: 0.05, far: 200, position: [0, 0.8, 3.6] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
      aria-label="Интерактивная 3D модель Земли"
    >
      <Scene onReady={onReady} mobile={mobile} />
    </Canvas>
  );
}

function Scene({ onReady, mobile }: { onReady: () => void; mobile: boolean }) {
  const sun = useSun();
  return (
    <>
      <color attach="background" args={["#070a12"]} />
      <Stars radius={80} depth={40} count={mobile ? 2500 : 5000} factor={3.2} saturation={0} fade speed={0.25} />
      <Earth sun={sun} onFirstFrame={onReady} />
      <RegionMarkers />
      <CityMarkers />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        zoomSpeed={0.7}
        minDistance={1.3}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={0.3}
      />
      <CameraRig sun={sun} />
    </>
  );
}