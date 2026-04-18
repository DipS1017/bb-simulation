// Offensive starting formations. Coordinates are on a 940x500 full court.
// All formations assume offense is attacking the RIGHT basket (887, 250).
// Court uses 1ft = 10 SVG units; 3pt arc radius = 237.5 (23'9").
// Corner 3pt line is straight at y=30 / y=470 (between x=798 and x=940).
//
// Positions that should be BEYOND the 3pt line are placed at ~240-260
// distance from the basket (wings/top) or at y<30 / y>470 (corners).
// Positions inside the arc (high post / elbows / low blocks) are intentional
// to the set — they are post / pick spots, not shooters.

export type PlayerPos = { id: string; x: number; y: number };
export type FormationKey = "5-out" | "1-4-high" | "1-3-1" | "horns" | "box";

export const FORMATIONS: Record<FormationKey, PlayerPos[]> = {
  // All 5 players beyond the arc: point, 2 wings, 2 corners.
  "5-out": [
    { id: "O1", x: 625, y: 250 }, // point (~26ft)
    { id: "O2", x: 675, y: 130 }, // wing top (on arc)
    { id: "O3", x: 675, y: 370 }, // wing bot (on arc)
    { id: "O4", x: 920, y: 25 },  // corner top (past line)
    { id: "O5", x: 920, y: 475 }, // corner bot (past line)
  ],

  // Point + 2 elbows (inside arc, post spots) + 2 wings (beyond arc).
  "1-4-high": [
    { id: "O1", x: 635, y: 250 },
    { id: "O2", x: 770, y: 195 }, // upper elbow
    { id: "O3", x: 770, y: 305 }, // lower elbow
    { id: "O4", x: 680, y: 130 }, // upper wing (on arc)
    { id: "O5", x: 680, y: 370 }, // lower wing (on arc)
  ],

  // 1 point + 3 across FT line (wing, HP, wing) + 1 low post.
  "1-3-1": [
    { id: "O1", x: 630, y: 250 }, // point
    { id: "O2", x: 670, y: 150 }, // upper wing (on arc)
    { id: "O3", x: 790, y: 250 }, // high post (inside arc)
    { id: "O4", x: 670, y: 350 }, // lower wing (on arc)
    { id: "O5", x: 880, y: 250 }, // low post
  ],

  // Point + 2 elbows (inside arc, screeners) + 2 corners (past line).
  "horns": [
    { id: "O1", x: 630, y: 250 },
    { id: "O2", x: 775, y: 205 }, // upper elbow
    { id: "O3", x: 775, y: 295 }, // lower elbow
    { id: "O4", x: 920, y: 25 },
    { id: "O5", x: 920, y: 475 },
  ],

  // Point + 4 in the box (2 high elbows, 2 low blocks) — all 4 inside arc.
  "box": [
    { id: "O1", x: 630, y: 250 },
    { id: "O2", x: 770, y: 195 }, // high elbow (upper)
    { id: "O3", x: 770, y: 305 }, // high elbow (lower)
    { id: "O4", x: 860, y: 195 }, // low block (upper)
    { id: "O5", x: 860, y: 305 }, // low block (lower)
  ],
};

export const FORMATION_KEYS: FormationKey[] = [
  "5-out", "1-4-high", "1-3-1", "horns", "box",
];
