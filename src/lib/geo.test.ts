import { describe, expect, it } from "vitest";
import { latLonToVec3, subsolarPoint } from "./geo";

describe("geo helpers", () => {
  it("puts the north pole at +Y and lon 0 / lat 0 at +X", () => {
    const [nx, ny, nz] = latLonToVec3(90, 0);
    expect(ny).toBeCloseTo(1);
    expect(Math.abs(nx) + Math.abs(nz)).toBeLessThan(1e-6);
    const [x, y, z] = latLonToVec3(0, 0);
    expect(x).toBeCloseTo(1);
    expect(y).toBeCloseTo(0);
    expect(z).toBeCloseTo(0);
  });

  it("places the subsolar point near the Tropic of Cancer at the June solstice", () => {
    expect(subsolarPoint(new Date(Date.UTC(2026, 5, 21, 12))).lat).toBeCloseTo(23.4, 0);
  });

  it("places the subsolar point near the equator and prime meridian at the March equinox noon UTC", () => {
    const p = subsolarPoint(new Date(Date.UTC(2026, 2, 20, 12)));
    expect(Math.abs(p.lat)).toBeLessThan(1);
    expect(Math.abs(p.lon)).toBeLessThan(4);
  });
});