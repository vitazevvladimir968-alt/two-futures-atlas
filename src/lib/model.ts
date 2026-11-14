/**
 * TWO FUTURES demonstration model.
 *
 * IMPORTANT: every number produced here is a DEMONSTRATION MODEL INDEX (0–100),
 * hand-tuned for storytelling. It is NOT a measurement, NOT a forecast and is
 * not calibrated against any dataset. See /methodology.
 */

export type Scenario = "cooperation" | "confrontation";
export type MetricId = "quality" | "nature" | "science" | "resilience";
export type Horizon = 10 | 25 | 50 | 100;

export const START_YEAR = 2025;
export const END_YEAR = 2125;
export const HORIZONS: Horizon[] = [10, 25, 50, 100];

export const SCENARIOS: Record<Scenario, { name: string; short: string; summary: string }> = {
  cooperation: {
    name: "Мир сотрудничества",
    short: "Сотрудничество",
    summary:
      "Допущение модели: страны делятся знаниями, совместно финансируют науку, климат и здравоохранение.",
  },
  confrontation: {
    name: "Мир противостояния",
    short: "Противостояние",
    summary:
      "Допущение модели: ресурсы уходят на соперничество, обмен данными и совместные программы сокращаются.",
  },
};

export const METRICS: { id: MetricId; name: string; hint: string }[] = [
  { id: "quality", name: "Качество жизни", hint: "Условный индекс здоровья, образования и благополучия" },
  { id: "nature", name: "Природа", hint: "Условный индекс состояния экосистем и биоразнообразия" },
  { id: "science", name: "Наука", hint: "Условный индекс темпа открытий и открытости знаний" },
  { id: "resilience", name: "Устойчивость", hint: "Условный индекс способности переживать кризисы" },
];

/** Shared illustrative starting point for both scenarios in 2025. */
export const BASELINE: Record<MetricId, number> = {
  quality: 60,
  nature: 45,
  science: 56,
  resilience: 50,
};

/** Illustrative level each scenario approaches after 100 years. */
export const TARGET_100: Record<Scenario, Record<MetricId, number>> = {
  cooperation: { quality: 86, nature: 70, science: 90, resilience: 82 },
  confrontation: { quality: 38, nature: 24, science: 48, resilience: 28 },
};

/** How quickly each metric responds (higher = earlier change). */
const RATE: Record<MetricId, number> = { quality: 2.2, nature: 1.3, science: 3.0, resilience: 2.0 };

export interface RegionModifier {
  /** Offset of the region's 2025 starting point vs. the global baseline. */
  offset: Partial<Record<MetricId, number>>;
  /** Multiplier of scenario-driven change (1 = same as global). */
  sensitivity: Partial<Record<MetricId, number>>;
}

const clamp = (v: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

function progress(t: number, k: number) {
  if (t <= 0) return 0;
  return (1 - Math.exp(-k * t)) / (1 - Math.exp(-k));
}

export function yearToT(year: number) {
  return clamp((year - START_YEAR) / (END_YEAR - START_YEAR), 0, 1);
}

/** Demonstration index (0–100) for one metric, scenario and year. */
export function indexValue(
  scenario: Scenario,
  metric: MetricId,
  year: number,
  region?: RegionModifier,
): number {
  const t = yearToT(year);
  const base = clamp(BASELINE[metric] + (region?.offset[metric] ?? 0));
  const delta = (TARGET_100[scenario][metric] - BASELINE[metric]) * (region?.sensitivity[metric] ?? 1);
  return Math.round(clamp(base + delta * progress(t, RATE[metric])) * 10) / 10;
}

/**
 * Illustrative ± uncertainty band in index points. It widens with the horizon
 * and is wider for the confrontation scenario (more shocks assumed).
 */
export function uncertainty(scenario: Scenario, year: number): number {
  const t = yearToT(year);
  const u = 2 + 16 * t;
  return Math.round((scenario === "confrontation" ? u * 1.25 : u) * 10) / 10;
}

export function allIndices(scenario: Scenario, year: number, region?: RegionModifier) {
  return METRICS.map((m) => {
    const value = indexValue(scenario, m.id, year, region);
    const u = uncertainty(scenario, year);
    return { ...m, value, low: clamp(value - u), high: clamp(value + u), u };
  });
}