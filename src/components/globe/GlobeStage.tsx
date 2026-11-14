import { Component, lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useFutures, type TextureLayer } from "@/store/futures";
import { subsolarPoint } from "@/lib/geo";
import { CityLabels } from "./labels";

const GlobeScene = lazy(() => import("./GlobeScene"));

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch(error: unknown) {
    console.error("Globe scene failed", error);
  }
  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function Loading({ text = "Загрузка 3D сцены…" }: { text?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-28 w-28 rounded-full border border-border">
          <div className="absolute inset-0 rounded-full border border-scenario/60 animate-pulse-ring" />
        </div>
        <p className="eyebrow">{text}</p>
      </div>
    </div>
  );
}

function StaticFallback({ reason, onRetry }: { reason: string; onRetry?: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <img
        src="https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/january/world.topo.bathy.200401.3x5400x2700.jpg"
        alt="Плоская карта Земли (NASA Blue Marble, 2002)"
        className="w-full max-w-xl rounded-lg border border-border opacity-80"
      />
      <div className="flex items-start gap-2 text-sm text-muted-foreground max-w-md">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <span>{reason}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <RotateCcw className="h-4 w-4" /> Перезапустить 3D
        </button>
      )}
    </div>
  );
}

const LAYER_NAMES: Record<TextureLayer, string> = {
  day: "поверхность",
  night: "ночные огни",
  normal: "рельеф",
  ocean: "блеск океана",
  clouds: "облака",
};

function TextureStatus() {
  const textures = useFutures((s) => s.textures);
  const entries = Object.entries(textures) as [TextureLayer, string][];
  const errors = entries.filter(([, v]) => v === "error");
  const loading = entries.filter(([, v]) => v === "loading");
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1" aria-live="polite">
      {errors.length > 0 ? (
        <span className="text-warning">
          Не загрузились: {errors.map(([k]) => LAYER_NAMES[k]).join(", ")} — показан упрощённый резервный слой
        </span>
      ) : loading.length > 0 ? (
        <span>Загрузка текстур: {loading.map(([k]) => LAYER_NAMES[k]).join(", ")}…</span>
      ) : (
        <span className="text-success">Текстуры загружены · NASA Blue Marble 5.4K</span>
      )}
    </div>
  );
}

function SunInfo() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date();
    const p = subsolarPoint(d);
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    setLabel(`Освещение — приблизительное положение Солнца на ${hh}:${mm} UTC (${p.lat.toFixed(1)}°, ${p.lon.toFixed(1)}°)`);
  }, []);
  return label ? <span>{label}</span> : null;
}

export function GlobeStage() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => setWebgl(hasWebGL()), []);
  const onReady = useCallback(() => setReady(true), []);
  const onLost = useCallback(() => setLost(true), []);
  const restart = () => {
    setLost(false);
    setReady(false);
    setKey((k) => k + 1);
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ touchAction: "none", overscrollBehavior: "contain" }}
      data-scene-ready={ready ? "true" : undefined}
    >
      <ClientOnly fallback={<Loading />}>
        {webgl === false ? (
          <StaticFallback reason="Ваш браузер не поддерживает WebGL, поэтому показана статичная карта вместо 3D глобуса." />
        ) : webgl === null ? (
          <Loading />
        ) : lost ? (
          <StaticFallback reason="Графический контекст был потерян (часто из-за нехватки памяти GPU)." onRetry={restart} />
        ) : (
          <SceneBoundary
            key={key}
            fallback={<StaticFallback reason="Не удалось запустить 3D сцену." onRetry={restart} />}
          >
            <Suspense fallback={<Loading />}>
              <GlobeScene onReady={onReady} onContextLost={onLost} />
            </Suspense>
            <CityLabels />
            {!ready && <Loading text="Подготовка глобуса…" />}
          </SceneBoundary>
        )}
      </ClientOnly>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-background/90 to-transparent px-4 pb-3 pt-10 font-mono text-[10px] leading-relaxed text-muted-foreground sm:text-[11px]">
        <ClientOnly>
          <TextureStatus />
          <SunInfo />
        </ClientOnly>
        <span>
          NASA Blue Marble Next Generation (январь 2004, 5.4K) — архивная мозаика с рельефом, не live-съёмка. Ночные огни — архивная карта 2012 года. Облака —
          иллюстративный слой (Solar System Scope, CC BY 4.0).
        </span>
      </div>
    </div>
  );
}