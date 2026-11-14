import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { DemoNotice, DemoTag } from "@/components/futures/DemoNotice";
import { REGIONS } from "@/lib/data";
import {
  END_YEAR,
  indexValue,
  METRICS,
  SCENARIOS,
  START_YEAR,
  uncertainty,
  type MetricId,
  type Scenario,
} from "@/lib/model";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "Лаборатория будущего 2025–2125 — TWO FUTURES" },
      {
        name: "description",
        content: "Временная шкала 2025–2125: сравните демонстрационные индексы двух сценариев по миру и шести регионам с полосой неопределённости.",
      },
      { property: "og:title", content: "Лаборатория будущего 2025–2125 — TWO FUTURES" },
      { property: "og:description", content: "Сравнение двух демонстрационных сценариев на временной шкале в 100 лет." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Lab,
});

const W = 640;
const H = 280;
const PAD = { l: 36, r: 12, t: 12, b: 28 };
const x = (year: number) => PAD.l + ((year - START_YEAR) / (END_YEAR - START_YEAR)) * (W - PAD.l - PAD.r);
const y = (v: number) => PAD.t + (1 - v / 100) * (H - PAD.t - PAD.b);

const STORY: { year: number; text: Record<Scenario, string> }[] = [
  {
    year: 2035,
    text: {
      cooperation: "Допущение: совместные научные программы и открытые данные расширяются.",
      confrontation: "Допущение: часть международных программ заморожена, данные закрываются.",
    },
  },
  {
    year: 2050,
    text: {
      cooperation: "Допущение: скоординированные меры по климату и здоровью дают накопительный эффект.",
      confrontation: "Допущение: ресурсы смещаются к соперничеству, адаптация отстаёт.",
    },
  },
  {
    year: 2075,
    text: {
      cooperation: "Допущение: экосистемы восстанавливаются медленнее, чем растёт наука, — природа инерционна.",
      confrontation: "Допущение: накопленные потери экосистем трудно обратить.",
    },
  },
  {
    year: 2100,
    text: {
      cooperation: "Неопределённость велика: даже благоприятный сценарий допускает широкий разброс.",
      confrontation: "Неопределённость ещё больше: модель допускает больше потрясений.",
    },
  },
];

function band(s: Scenario, metric: MetricId, regionId: string) {
  const mod = REGIONS.find((r) => r.id === regionId)?.modifier;
  const pts: { yr: number; v: number; u: number }[] = [];
  for (let yr = START_YEAR; yr <= END_YEAR; yr += 2) {
    pts.push({ yr, v: indexValue(s, metric, yr, mod), u: uncertainty(s, yr) });
  }
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(p.yr).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const upper = pts.map((p) => `${x(p.yr).toFixed(1)},${y(Math.min(100, p.v + p.u)).toFixed(1)}`);
  const lower = pts.map((p) => `${x(p.yr).toFixed(1)},${y(Math.max(0, p.v - p.u)).toFixed(1)}`).reverse();
  return { line, area: `M${upper.join(" L")} L${lower.join(" L")} Z` };
}

function Lab() {
  const [year, setYear] = useState(2050);
  const [metric, setMetric] = useState<MetricId>("quality");
  const [regionId, setRegionId] = useState("world");
  const mod = REGIONS.find((r) => r.id === regionId)?.modifier;

  const coop = useMemo(() => band("cooperation", metric, regionId), [metric, regionId]);
  const conf = useMemo(() => band("confrontation", metric, regionId), [metric, regionId]);

  const values = (["cooperation", "confrontation"] as Scenario[]).map((s) => ({
    s,
    v: indexValue(s, metric, year, mod),
    u: uncertainty(s, year),
  }));

  return (
    <div className="grid-bg">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:py-12">
        <header className="flex flex-col gap-3">
          <span className="eyebrow">Лаборатория будущего</span>
          <h1 className="text-2xl font-semibold sm:text-4xl">2025 → 2125: где расходятся пути</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Двигайте шкалу времени и сравнивайте два сценария. Это учебная модель: она показывает логику расхождения
            сценариев, а не предсказывает конкретные значения.
          </p>
        </header>

        <div className="panel flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {METRICS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMetric(m.id)}
                aria-pressed={metric === m.id}
                className={cn(
                  "min-h-9 rounded-full border px-3 text-xs sm:text-sm",
                  metric === m.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {m.name}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              Область
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="min-h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
              >
                <option value="world">Весь мир</option>
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <figure className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <figcaption className="text-xs text-muted-foreground">
                {METRICS.find((m) => m.id === metric)?.hint} · линия — центральное значение, полоса — иллюстративная
                неопределённость
              </figcaption>
              <DemoTag />
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="График двух сценариев">
              {[0, 25, 50, 75, 100].map((v) => (
                <g key={v}>
                  <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="stroke-border" />
                  <text x={PAD.l - 6} y={y(v) + 3} textAnchor="end" className="fill-muted-foreground font-mono text-[9px]">
                    {v}
                  </text>
                </g>
              ))}
              {[2025, 2050, 2075, 2100, 2125].map((yr) => (
                <text key={yr} x={x(yr)} y={H - 8} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                  {yr}
                </text>
              ))}
              <path d={coop.area} className="fill-coop/15" />
              <path d={conf.area} className="fill-conf/15" />
              <path d={coop.line} className="fill-none stroke-coop" strokeWidth={2} />
              <path d={conf.line} className="fill-none stroke-conf" strokeWidth={2} />
              <line x1={x(year)} x2={x(year)} y1={PAD.t} y2={H - PAD.b} className="stroke-foreground/70" strokeDasharray="3 3" />
              {values.map(({ s, v }) => (
                <circle key={s} cx={x(year)} cy={y(v)} r={4} className={s === "cooperation" ? "fill-coop" : "fill-conf"} />
              ))}
            </svg>
          </figure>

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="eyebrow">Год</span>
              <span className="font-display text-2xl font-semibold tabular-nums">{year}</span>
            </div>
            <Slider
              min={START_YEAR}
              max={END_YEAR}
              step={1}
              value={[year]}
              onValueChange={([v]) => v !== undefined && setYear(v)}
              aria-label="Год на временной шкале"
              className="py-3"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {values.map(({ s, v, u }) => (
              <div
                key={s}
                className={cn("rounded-lg border p-4", s === "cooperation" ? "border-coop/40 bg-coop/5" : "border-conf/40 bg-conf/5")}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-semibold", s === "cooperation" ? "text-coop" : "text-conf")}>
                    {SCENARIOS[s].name}
                  </span>
                  <DemoTag />
                </div>
                <p className="mt-2 font-mono text-3xl tabular-nums">
                  {v.toFixed(0)}
                  <span className="text-base text-muted-foreground"> ±{u.toFixed(0)}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Диапазон {Math.max(0, v - u).toFixed(0)}–{Math.min(100, v + u).toFixed(0)} из 100
                </p>
              </div>
            ))}
          </div>
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Развилки сценариев</h2>
            <DemoTag>Вымышленный нарратив</DemoTag>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2">
            {STORY.map((st) => (
              <li
                key={st.year}
                className={cn("panel p-4 transition-opacity", year >= st.year ? "opacity-100" : "opacity-50")}
              >
                <span className="font-mono text-sm text-muted-foreground">{st.year}</span>
                <p className="mt-2 text-sm">
                  <span className="text-coop">Сотрудничество: </span>
                  {st.text.cooperation}
                </p>
                <p className="mt-1 text-sm">
                  <span className="text-conf">Противостояние: </span>
                  {st.text.confrontation}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <DemoNotice />
      </div>
    </div>
  );
}