import type { allIndices } from "@/lib/model";
import { cn } from "@/lib/utils";

type Row = ReturnType<typeof allIndices>[number];

/** Index bar with an illustrative uncertainty band. Values are demonstration indices. */
export function MetricBars({ rows, baseline, compact }: { rows: Row[]; baseline?: Row[]; compact?: boolean }) {
  return (
    <ul className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
      {rows.map((r, i) => {
        const base = baseline?.[i]?.value;
        const diff = base !== undefined ? r.value - base : undefined;
        return (
          <li key={r.id}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm" title={r.hint}>
                {r.name}
              </span>
              <span className="font-mono text-sm tabular-nums">
                {r.value.toFixed(0)}
                <span className="text-muted-foreground"> ±{r.u.toFixed(0)}</span>
                {diff !== undefined && (
                  <span className={cn("ml-2 text-xs", diff >= 0 ? "text-success" : "text-conf")}>
                    {diff >= 0 ? "+" : ""}
                    {diff.toFixed(0)}
                  </span>
                )}
              </span>
            </div>
            <div className="relative mt-1.5 h-2 rounded-full bg-muted" aria-hidden>
              <div
                className="absolute inset-y-0 rounded-full bg-scenario/25"
                style={{ left: `${r.low}%`, width: `${r.high - r.low}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-scenario transition-[width] duration-500"
                style={{ width: `${r.value}%` }}
              />
              {base !== undefined && (
                <div className="absolute -inset-y-0.5 w-px bg-foreground/60" style={{ left: `${base}%` }} />
              )}
            </div>
            {!compact && <p className="mt-1 text-xs text-muted-foreground">{r.hint}</p>}
          </li>
        );
      })}
    </ul>
  );
}