import { create } from "zustand";
import type { Horizon, Scenario } from "@/lib/model";

export type LoadStatus = "loading" | "ok" | "error";
export type TextureLayer = "day" | "night" | "normal" | "ocean" | "clouds";

export interface Focus {
  lat: number;
  lon: number;
  zoom: number;
  /** Increments on every request so re-selecting the same place flies again. */
  nonce: number;
}

interface FuturesState {
  scenario: Scenario;
  horizon: Horizon;
  regionId: string | null;
  cityId: string | null;
  focus: Focus | null;
  textures: Record<TextureLayer, LoadStatus>;
  hiResDay: boolean;
  setScenario: (s: Scenario) => void;
  setHorizon: (h: Horizon) => void;
  selectRegion: (id: string | null, lat?: number, lon?: number, zoom?: number) => void;
  selectCity: (id: string | null, lat?: number, lon?: number) => void;
  setTextureStatus: (layer: TextureLayer, s: LoadStatus) => void;
  setHiResDay: (v: boolean) => void;
}

let nonce = 0;

export const useFutures = create<FuturesState>((set) => ({
  scenario: "cooperation",
  horizon: 25,
  regionId: null,
  cityId: null,
  focus: null,
  textures: { day: "loading", night: "loading", normal: "loading", ocean: "loading", clouds: "loading" },
  hiResDay: false,
  setScenario: (scenario) => set({ scenario }),
  setHorizon: (horizon) => set({ horizon }),
  selectRegion: (id, lat, lon, zoom = 2.4) =>
    set(
      id && lat !== undefined && lon !== undefined
        ? { regionId: id, cityId: null, focus: { lat, lon, zoom, nonce: ++nonce } }
        : { regionId: null },
    ),
  selectCity: (id, lat, lon) =>
    set(
      id && lat !== undefined && lon !== undefined
        ? { cityId: id, focus: { lat, lon, zoom: 2.2, nonce: ++nonce } }
        : { cityId: null },
    ),
  setTextureStatus: (layer, s) => set((st) => ({ textures: { ...st.textures, [layer]: s } })),
  setHiResDay: (hiResDay) => set({ hiResDay }),
}));