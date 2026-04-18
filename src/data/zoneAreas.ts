// Zone-responsibility polygons for each defender in each defense. Defines
// the area that defender is "responsible for" — the region they primarily
// cover. Polygons are defined on the RIGHT half-court (x in [470, 940]).
// The renderer mirrors to the left half when action is there.
//
// These are a teaching approximation: real zones shift with ball position
// and rules overlap at edges (e.g. paint shared between center and forwards).
// We author them as clean partitions of the right half for readability.

import type { DefenseKey } from "./defenseSlides";
import type { DefenderId } from "../store/useSim";

export type ZonePolygon = [number, number][];

export const ZONE_AREAS: Record<DefenseKey, Record<DefenderId, ZonePolygon>> = {
  // 2-3: two guards above FT line (X1/X2), two forwards at the blocks
  // (X3/X4), center in the paint (X5). Clean partition of the right half.
  "2-3": {
    X1: [[470,0],   [750,0],   [750,250], [470,250]],
    X2: [[470,250], [750,250], [750,500], [470,500]],
    X3: [[750,0],   [940,0],   [940,170], [750,170]],
    X4: [[750,330], [940,330], [940,500], [750,500]],
    X5: [[750,170], [940,170], [940,330], [750,330]],
  },

  // 3-2: top point (X1) pressures ball; X2/X3 are wings; X4/X5 are bigs.
  // Middle is thin — the defense's weakness.
  "3-2": {
    X1: [[470,170], [750,170], [750,330], [470,330]],
    X2: [[470,0],   [750,0],   [750,170], [470,170]],
    X3: [[470,330], [750,330], [750,500], [470,500]],
    X4: [[750,250], [940,250], [940,500], [750,500]],
    X5: [[750,0],   [940,0],   [940,250], [750,250]],
  },

  // 1-3-1: point (X1), three across FT line (X2/X3/X4), baseline rover (X5).
  "1-3-1": {
    X1: [[470,180], [700,180], [700,320], [470,320]],
    X2: [[470,0],   [850,0],   [850,180], [470,180]],
    X3: [[700,180], [850,180], [850,320], [700,320]],
    X4: [[470,320], [850,320], [850,500], [470,500]],
    X5: [[850,0],   [940,0],   [940,500], [850,500]],
  },

  // 2-1-2: two top guards, middle rover, two block defenders.
  "2-1-2": {
    X1: [[470,0],   [750,0],   [750,250], [470,250]],
    X2: [[470,250], [750,250], [750,500], [470,500]],
    X3: [[700,170], [850,170], [850,330], [700,330]],
    X4: [[750,0],   [940,0],   [940,250], [750,250]],
    X5: [[750,250], [940,250], [940,500], [750,500]],
  },

  // Matchup keeps the 2-3 shell but m2m-style closeouts — same areas.
  "matchup": {
    X1: [[470,0],   [750,0],   [750,250], [470,250]],
    X2: [[470,250], [750,250], [750,500], [470,500]],
    X3: [[750,0],   [940,0],   [940,170], [750,170]],
    X4: [[750,330], [940,330], [940,500], [750,500]],
    X5: [[750,170], [940,170], [940,330], [750,330]],
  },
};

// Distinct hue per defender so overlapping regions are still readable.
export const ZONE_COLORS: Record<DefenderId, string> = {
  X1: "#ef4444", // red
  X2: "#f97316", // orange
  X3: "#eab308", // yellow
  X4: "#14b8a6", // teal
  X5: "#8b5cf6", // violet
};

export function mirrorPolygon(poly: ZonePolygon): ZonePolygon {
  return poly.map(([x, y]) => [940 - x, y] as [number, number]);
}

export function polygonCentroid(poly: ZonePolygon): [number, number] {
  let sx = 0, sy = 0;
  for (const [x, y] of poly) { sx += x; sy += y; }
  return [sx / poly.length, sy / poly.length];
}
