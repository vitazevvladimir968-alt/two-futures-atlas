import { createFileRoute } from "@tanstack/react-router";
import { Crosshair, MapPin, X } from "lucide-react";
import { useMemo } from "react";
import { GlobeStage } from "@/components/globe/GlobeStage";
import { HorizonPicker, ScenarioToggle } from "@/components/futures/ScenarioControls";
import { MetricBars } from "@/components/futures/MetricBars";
import { DemoNotice, DemoTag } from "@/components/futures/DemoNotice";
import { CITIES, REGIONS } from "@/lib/data";
import { allIndices, SCENARIOS, START_YEAR } from "@/lib/model";
import { useFutures } from "@/store/futures";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TWO FUTURES — интерактивная 3D Земля и два сценария" },
      {
        name: "description",
        content:
          "Вращайте реалистичную 3D Землю, сравнивайте «Мир сотрудничества» и «Мир противостояния» на горизонтах 10–100 лет. Демонстрационные индексы, не прогноз.",
      },
      { property: "og:title", content: "TWO FUTURES — интерактивная 3D Земля" },
      {
        property: "og:description",
        content: "Два демонстрационных сценария будущего на 3D глобусе: регионы, города, показатели и неопределённость.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const scenario = useFutures((s) => s.scenario);
  const horizon = useFutures((s) => s.horizon);
  const regionId = useFutures((s) => s.regionId);
  const cityId = useFutures((s) => s.cityId);
  const selectRegion = useFutures((s) => s.selectRegion);
  const selectCity = useFutures((s) => s.selectCity);
  const year = START_YEAR + horizon;
  const region = REGIONS.find((r) => r.id === regionId) ?? null;

  const rows = useMemo(() => allIndices(scenario, year, region?.modifier), [scenario, year, region]);
  const baseline = useMemo(() => allIndices(scenario, START_YEAR, region?.modifier), [scenario, region]);

  return (
    <div className="mx-auto grid w-full max-w-[1720px] gap-0 lg:h-[calc(100svh-4rem)] lg:grid-cols-[minmax(0,1fr)_400px]">
      <section aria-label="3D глобус" className="relative h-[64svh] min-h-[420px] overflow-hidden border-b border-border bg-[#050a12] lg:h-full lg:min-h-[680px] lg:rounded-br-2xl lg:border-r">
        <GlobeStage />
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 sm:left-4 sm:top-4">
          <span className="eyebrow">Сценарий · {year}</span>
          <span className="font-display text-lg font-semibold text-scenario sm:text-2xl">{SCENARIOS[scenario].name}</span>
          <span className="hidden text-xs text-muted-foreground sm:block">
            Перетащите — вращение · колесо или щипок — масштаб
          </span>
        </div>
      </section>

      <aside className="flex flex-col gap-3 border-border bg-background/70 p-3 sm:p-4 lg:overflow-y-auto lg:border-l lg:bg-background/50">
        <div className="panel flex flex-col gap-3 p-4 shadow-[0_16px_48px_-28px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Сценарий</h2>
            <DemoTag>Модельное допущение</DemoTag>
          </div>
          <ScenarioToggle />
          <p className="text-xs text-muted-foreground">{SCENARIOS[scenario].summary}</p>
          <h2 className="mt-1 text-sm font-semibold">Горизонт</h2>
          <HorizonPicker />
        </div>

        <div className="panel flex flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Показатели · {year}</h2>
              <p className="text-xs text-muted-foreground">
                {region ? `Регион: ${region.name}` : "Весь мир"} · черта — уровень {START_YEAR}
              </p>
            </div>
            <DemoTag />
          </div>
          <MetricBars rows={rows} baseline={baseline} compact />
          <DemoNotice />
        </div>

        <div className="panel flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Регионы</h2>
            {region && (
              <button
                onClick={() => selectRegion(null)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" /> Весь мир
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => selectRegion(r.id, r.lat, r.lon, r.zoom)}
                aria-pressed={r.id === regionId}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors sm:text-sm",
                  r.id === regionId
                    ? "border-scenario bg-scenario/15 text-foreground"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Crosshair className="h-3.5 w-3.5 shrink-0 text-scenario" />
                {r.name}
              </button>
            ))}
          </div>
          {region && (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-3">
              <p className="text-sm">{region.fact}</p>
              <p className="text-xs text-muted-foreground">
                <span className="demo-tag mr-1.5">Сценарный нарратив</span>
                {region.story[scenario]}
              </p>
            </div>
          )}
        </div>

        <div className="panel flex flex-col gap-3 p-4">
          <h2 className="text-sm font-semibold">Города</h2>
          <div className="flex flex-wrap gap-1.5">
            {CITIES.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCity(c.id, c.lat, c.lon)}
                aria-pressed={c.id === cityId}
                className={cn(
                  "inline-flex min-h-9 items-center gap-1 rounded-full border px-3 text-xs transition-colors",
                  c.id === cityId
                    ? "border-scenario bg-scenario text-scenario-foreground"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <MapPin className="h-3 w-3" />
                {c.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Маркеры показывают расположение городов; индексы для городов не рассчитываются.</p>
        </div>
      </aside>
    </div>
  );
}