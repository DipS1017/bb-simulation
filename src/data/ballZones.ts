// Discretizes ball (x,y) into one of 7 named regions on the right half-court.
// If the ball is on the left half (x < 470), the caller should mirror to the
// right half (x' = 940 - x) before classifying, then mirror defender slides back.

export type BallZone =
  | "top"
  | "wing-top"    // upper sideline side (y low)
  | "wing-bot"    // lower sideline side (y high)
  | "corner-top"
  | "corner-bot"
  | "high-post"
  | "low-post";

export const BALL_ZONES: BallZone[] = [
  "top", "wing-top", "wing-bot", "corner-top", "corner-bot", "high-post", "low-post",
];

// Right-half anchor points for each zone (x,y). Used for nearest-zone lookup.
const ANCHORS: Record<BallZone, [number, number]> = {
  "top":        [720, 250],
  "wing-top":   [720, 120],
  "wing-bot":   [720, 380],
  "corner-top": [880, 50],
  "corner-bot": [880, 450],
  "high-post":  [800, 250],
  "low-post":   [865, 250],
};

export function classifyBall(x: number, y: number): BallZone {
  // Caller mirrors to right half first; still guard against x<470 for safety.
  const rx = x < 470 ? 940 - x : x;
  let best: BallZone = "top";
  let bestD = Infinity;
  for (const z of BALL_ZONES) {
    const [ax, ay] = ANCHORS[z];
    const d = (rx - ax) ** 2 + (y - ay) ** 2;
    if (d < bestD) { bestD = d; best = z; }
  }
  return best;
}

export function isLeftHalf(x: number): boolean {
  return x < 470;
}

// Mirror an (x,y) across the half-court line (x=470).
export function mirrorX(x: number): number {
  return 940 - x;
}
