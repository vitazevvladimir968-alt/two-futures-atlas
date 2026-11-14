import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFutures, type TextureLayer } from "@/store/futures";

// Public Three.js example assets are used so the project can build without
// carrying large binary texture files in the repository.
const TEXTURE_BASE = "https://threejs.org/examples/textures/planets";
export const TEXTURE_URLS: Record<TextureLayer, string> = {
  day: `${TEXTURE_BASE}/earth_atmos_2048.jpg`,
  night: `${TEXTURE_BASE}/earth_lights_2048.png`,
  normal: `${TEXTURE_BASE}/earth_normal_2048.jpg`,
  ocean: `${TEXTURE_BASE}/earth_specular_2048.jpg`,
  clouds: `${TEXTURE_BASE}/earth_clouds_1024.png`,
};
export const DAY_HI_RES_URL = TEXTURE_URLS.day;

export type EarthUniforms = {
  [K in "uDay" | "uNight" | "uNormal" | "uOcean" | "uClouds"]: { value: THREE.Texture };
};

function solid(r: number, g: number, b: number) {
  const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1, THREE.RGBAFormat);
  t.needsUpdate = true;
  return t;
}

/** Simple procedural fallback so the globe still reads as a planet without imagery. */
function fallbackDay() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext("2d");
  if (!ctx) return solid(30, 60, 110);
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, "#e8eef2");
  g.addColorStop(0.1, "#1d3f6e");
  g.addColorStop(0.5, "#173a69");
  g.addColorStop(0.9, "#1d3f6e");
  g.addColorStop(1, "#e8eef2");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Loads the Earth textures without Suspense: the globe renders immediately with
 * fallbacks and each layer swaps in when (and if) it arrives. Status per layer
 * is written to the store so the UI can show loading / fallback honestly.
 */
export function useEarthTextures(): EarthUniforms {
  const gl = useThree((s) => s.gl);
  const setStatus = useFutures((s) => s.setTextureStatus);
  const setHiRes = useFutures((s) => s.setHiResDay);

  const uniforms = useMemo<EarthUniforms>(
    () => ({
      uDay: { value: fallbackDay() },
      uNight: { value: solid(0, 0, 0) },
      uNormal: { value: solid(128, 128, 255) },
      uOcean: { value: solid(120, 120, 120) },
      uClouds: { value: solid(0, 0, 0) },
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    const owned: THREE.Texture[] = [];

    const apply = (key: keyof EarthUniforms, tex: THREE.Texture, srgb: boolean) => {
      tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      tex.anisotropy = aniso;
      tex.wrapS = THREE.RepeatWrapping;
      const prev = uniforms[key].value;
      uniforms[key].value = tex;
      owned.push(tex);
      prev.dispose();
    };

    const load = (layer: TextureLayer, key: keyof EarthUniforms, srgb: boolean) => {
      setStatus(layer, "loading");
      loader.load(
        TEXTURE_URLS[layer],
        (tex) => {
          if (cancelled) return tex.dispose();
          apply(key, tex, srgb);
          setStatus(layer, "ok");
          if (layer === "day") maybeUpgradeDay();
        },
        undefined,
        () => {
          if (!cancelled) setStatus(layer, "error");
        },
      );
    };

    const maybeUpgradeDay = () => {
      // The public source is already 2K; avoid downloading the same image twice.
      setHiRes(false);
    };

    load("day", "uDay", true);
    load("night", "uNight", true);
    load("normal", "uNormal", false);
    load("ocean", "uOcean", false);
    load("clouds", "uClouds", false);

    return () => {
      cancelled = true;
      owned.forEach((t) => t.dispose());
    };
  }, [gl, uniforms, setStatus, setHiRes]);

  return uniforms;
}
