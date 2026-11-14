import { Handshake, Swords } from "lucide-react";
import { HORIZONS, SCENARIOS, START_YEAR, type Scenario } from "@/lib/model";
import { useFutures } from "@/store/futures";
import { cn } from "@/lib/utils";

const ICONS: Record<Scenario, typeof Handshake> = { cooperation: Handshake, confrontation: Swords };

export function ScenarioToggle() {
  const scenario = useFutures((s) => s.scenario);
  const setScenario = useFutures((s) => s.setScenario);
  return (
    <div role="radiogroup" aria-label="Сценарий" className="grid grid-cols-2 gap-2">
      {(Object.keys(SCENARIOS) as Scenario[]).map((id) => {
        const Icon = ICONS[id];
        const active = scenario === id;
        return (
          <button
            key={id}
            role="radio"
            aria-checked={active}
            onClick={() => setScenario(id)}
            className={cn(
              "flex min-h-12 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
              active
                ? id === "cooperation"
                  ? "border-coop bg-coop/15 text-foreground shadow-[var(--shadow-glow)]"
                  : "border-conf bg-conf/15 text-foreground shadow-[var(--shadow-glow)]"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", id === "cooperation" ? "text-coop" : "text-conf")} />
            <span className="leading-tight">{SCENARIOS[id].name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function HorizonPicker() {
  const horizon = useFutures((s) => s.horizon);
  const setHorizon = useFutures((s) => s.setHorizon);
  return (
    <div role="radiogroup" aria-label="Горизонт" className="grid grid-cols-4 gap-1.5">
      {HORIZONS.map((h) => (
        <button
          key={h}
          role="radio"
          aria-checked={horizon === h}
          onClick={() => setHorizon(h)}
          className={cn(
            "flex min-h-11 flex-col items-center justify-center rounded-md border font-mono transition-colors",
            horizon === h
              ? "border-scenario bg-scenario text-scenario-foreground"
              : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <span className="text-sm font-semibold">{h} лет</span>
          <span className="text-[10px] opacity-80">{START_YEAR + h}</span>
        </button>
      ))}
    </div>
  );
}