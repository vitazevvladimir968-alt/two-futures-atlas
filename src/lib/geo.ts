/** Pure geographic helpers shared by the 3D scene and tests. No three.js import. */

export type Vec3 = [number, number, number];

const DEG = Math.PI / 180;

/**
 * Converts latitude/longitude (degrees) to a point on a sphere of `radius`,
 * matching three.js SphereGeometry UV mapping of an equirectangular texture
 * (u = 0 at longitude -180°, north pole at +Y).
 */
export function latLonToVec3(lat: number, lon: number, radius = 1): Vec3 {
  const phi = (lon + 180) * DEG;
  const theta = (90 - lat) * DEG;
  return [
    -radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function normDeg(x: number) {
  return ((x % 360) + 360) % 360;
}

/**
 * Approximate subsolar point (where the Sun is at zenith) for a UTC date.
 * Low-precision solar formulas (accuracy roughly ±0.5° in latitude/longitude),
 * good enough to place the day/night terminator for visualisation.
 */
export function subsolarPoint(date: Date): { lat: number; lon: number } {
  const d = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
  const g = normDeg(357.529 + 0.98560028 * d) * DEG;
  const q = normDeg(280.459 + 0.98564736 * d);
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
  const e = (23.439 - 0.00000036 * d) * DEG;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / DEG;
  const decl = Math.asin(Math.sin(e) * Math.sin(L)) / DEG;
  let eqDeg = q - normDeg(ra);
  if (eqDeg > 180) eqDeg -= 360;
  if (eqDeg < -180) eqDeg += 360;
  const eqHours = eqDeg / 15;
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  let lon = 15 * (12 - utcHours - eqHours);
  lon = ((((lon + 180) % 360) + 360) % 360) - 180;
  return { lat: decl, lon };
}