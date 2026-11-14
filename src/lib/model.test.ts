import { describe, expect, it } from "vitest";
import { allIndices, indexValue, METRICS, uncertainty } from "./model";
import { REGIONS } from "./data";

describe("demonstration model", () => {
  it("starts both scenarios from the same 2025 baseline", () => {
    for (const m of METRICS) {
      expect(indexValue("cooperation", m.id, 2025)).toBe(indexValue("confrontation", m.id, 2025));
    }
  });

  it("keeps cooperation at or above confrontation after 2025 for every metric and region", () => {
    for (const region of [undefined, ...REGIONS.map((r) => r.modifier)]) {
      for (const m of METRICS) {
        for (const year of [2035, 2050, 2075, 2125]) {
          expect(indexValue("cooperation", m.id, year, region)).toBeGreaterThan(
            indexValue("confrontation", m.id, year, region),
          );
        }
      }
    }
  });

  it("keeps every index and band inside 0–100", () => {
    for (const r of [undefined, ...REGIONS.map((x) => x.modifier)]) {
      for (const row of allIndices("confrontation", 2125, r)) {
        expect(row.low).toBeGreaterThanOrEqual(0);
        expect(row.high).toBeLessThanOrEqual(100);
      }
    }
  });

  it("widens uncertainty from ±2 in 2025 to ±18 in 2125 (×1.25 for confrontation)", () => {
    expect(uncertainty("cooperation", 2025)).toBe(2);
    expect(uncertainty("cooperation", 2125)).toBe(18);
    expect(uncertainty("confrontation", 2125)).toBe(22.5);
  });
});