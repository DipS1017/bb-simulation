// Defender slide tables. Each defense has 5 defenders (X1..X5); for every
// ball-zone on the right half-court we store the (x,y) each defender should
// occupy. Principles encoded here follow standard coaching resources
// (breakthroughbasketball, coachesclipboard, basketballforcoaches):
//
// - 2-3: top 2 guards (X1/X2) handle top + wings; forwards (X3/X4) stay
//   HOME on the block on wing passes and only rotate to the corner when the
//   ball actually reaches the corner. Center (X5) protects the rim and slides
//   to the vacated block on corner rotations ("bump down"). Weak-side
//   forward pinches paint-ward on ball-side action.
//
// - 3-2: 3 perimeter defenders pressure shooters; 2 bigs rebound. On wing
//   pass the ball-side big "pinches the middle" to deny high-post/drive.
//
// - 1-3-1: top (X1) pressures ball; ball-side wing (X2/X4) + baseline rover
//   (X5) TRAP on the wing and in the corner. FT-line defender (X3) fronts
//   the high post and splits middle help. Skip passes to the opposite corner
//   are the defense's main weakness.
//
// - 2-1-2: 2 top guards, rover (X3) at FT line who shades ball-side, 2 bigs
//   at the blocks. Balanced between paint protection and perimeter coverage.
//
// - matchup: keeps zone shell but defenders play MAN-LIKE close-outs on
//   ball-side; weak-side sags into help position like good m2m.
//
// Coordinates are on the RIGHT half-court (x in [470, 940]); the store
// mirrors them to x' = 940 - x when the ball is on the left half.

import type { BallZone } from "./ballZones";

export type DefenseKey = "2-3" | "3-2" | "1-3-1" | "2-1-2" | "matchup";

export type Slide = { X1: [number, number]; X2: [number, number]; X3: [number, number]; X4: [number, number]; X5: [number, number] };
export type SlideTable = Record<BallZone, Slide>;

const P = (x: number, y: number): [number, number] => [x, y];

export const SLIDES: Record<DefenseKey, SlideTable> = {
  // X1 top-left guard, X2 top-right guard, X3 upper-block forward,
  // X4 lower-block forward, X5 center.
  "2-3": {
    "top":        { X1: P(700,210), X2: P(700,290), X3: P(870,175), X4: P(870,325), X5: P(860,250) },
    "wing-top":   { X1: P(730,140), X2: P(700,270), X3: P(865,180), X4: P(840,325), X5: P(835,220) }, // X3 HOME on block; X4 pinches paint; X5 ball-side
    "wing-bot":   { X1: P(700,230), X2: P(730,360), X3: P(840,175), X4: P(865,320), X5: P(835,280) },
    "corner-top": { X1: P(800,135), X2: P(700,270), X3: P(860,70),  X4: P(850,320), X5: P(855,180) }, // X3 to corner; X5 BUMPS to vacated block
    "corner-bot": { X1: P(700,230), X2: P(800,365), X3: P(850,180), X4: P(860,430), X5: P(855,320) },
    "high-post":  { X1: P(760,220), X2: P(760,280), X3: P(855,205), X4: P(855,295), X5: P(795,250) }, // X5 steps up and FRONTS high post
    "low-post":   { X1: P(750,225), X2: P(750,275), X3: P(870,220), X4: P(870,280), X5: P(850,250) }, // X5 fronts; X3/X4 3/4 behind from both sides
  },

  // X1 top point, X2 upper-side wing, X3 lower-side wing, X4 lower block,
  // X5 upper block.
  "3-2": {
    "top":        { X1: P(720,250), X2: P(770,160), X3: P(770,340), X4: P(855,330), X5: P(855,170) },
    "wing-top":   { X1: P(730,220), X2: P(720,130), X3: P(780,320), X4: P(855,340), X5: P(825,195) }, // X5 pinches middle HARD ball-side
    "wing-bot":   { X1: P(730,280), X2: P(780,180), X3: P(720,370), X4: P(825,305), X5: P(855,160) },
    "corner-top": { X1: P(775,175), X2: P(820,85),  X3: P(775,320), X4: P(850,340), X5: P(845,195) }, // X2 closes to corner, X5 shows high
    "corner-bot": { X1: P(775,325), X2: P(775,180), X3: P(820,415), X4: P(845,305), X5: P(850,160) },
    "high-post":  { X1: P(765,250), X2: P(800,200), X3: P(800,300), X4: P(855,305), X5: P(855,195) },
    "low-post":   { X1: P(770,250), X2: P(820,200), X3: P(820,300), X4: P(870,290), X5: P(870,210) },
  },

  // X1 point, X2 upper wing, X3 FT-line middle, X4 lower wing, X5 baseline rover.
  "1-3-1": {
    "top":        { X1: P(720,250), X2: P(765,170), X3: P(805,250), X4: P(765,330), X5: P(880,250) },
    "wing-top":   { X1: P(735,180), X2: P(730,135), X3: P(775,210), X4: P(770,335), X5: P(860,135) }, // X1 + X2 TRAP; X5 comes up ball-side
    "wing-bot":   { X1: P(735,320), X2: P(765,165), X3: P(775,290), X4: P(730,365), X5: P(860,365) },
    "corner-top": { X1: P(780,175), X2: P(825,85),  X3: P(810,220), X4: P(770,335), X5: P(860,85)  }, // X2 + X5 TRAP corner
    "corner-bot": { X1: P(780,325), X2: P(765,165), X3: P(810,280), X4: P(825,415), X5: P(860,415) },
    "high-post":  { X1: P(765,250), X2: P(790,205), X3: P(800,250), X4: P(790,295), X5: P(865,250) }, // X3 fronts high post
    "low-post":   { X1: P(760,250), X2: P(820,200), X3: P(830,250), X4: P(820,300), X5: P(870,250) }, // X3 fronts; X5 behind
  },

  // X1 top-left, X2 top-right, X3 middle rover, X4 upper block, X5 lower block.
  "2-1-2": {
    "top":        { X1: P(700,220), X2: P(700,280), X3: P(800,250), X4: P(855,170), X5: P(855,330) },
    "wing-top":   { X1: P(725,140), X2: P(700,275), X3: P(790,200), X4: P(845,185), X5: P(855,330) }, // X3 shades ball-side; X4 pinches up
    "wing-bot":   { X1: P(700,225), X2: P(725,360), X3: P(790,300), X4: P(855,170), X5: P(845,315) },
    "corner-top": { X1: P(790,140), X2: P(700,275), X3: P(820,195), X4: P(855,75),  X5: P(855,330) }, // X4 closes corner; X3 shows high
    "corner-bot": { X1: P(700,225), X2: P(790,360), X3: P(820,305), X4: P(855,170), X5: P(855,425) },
    "high-post":  { X1: P(750,220), X2: P(750,280), X3: P(780,250), X4: P(850,195), X5: P(850,305) }, // X3 fronts high post
    "low-post":   { X1: P(745,225), X2: P(745,275), X3: P(840,250), X4: P(865,215), X5: P(865,285) }, // X3 dig from top; bigs trap
  },

  // 2-3 shell with noticeably tighter ball-side closeouts and deeper weak-side help.
  "matchup": {
    "top":        { X1: P(690,220), X2: P(690,280), X3: P(865,175), X4: P(865,325), X5: P(855,250) },
    "wing-top":   { X1: P(715,125), X2: P(705,265), X3: P(855,185), X4: P(820,310), X5: P(820,210) }, // X1 TIGHT on ball; X4 weak help deeper
    "wing-bot":   { X1: P(705,235), X2: P(715,375), X3: P(820,190), X4: P(855,315), X5: P(820,290) },
    "corner-top": { X1: P(775,150), X2: P(710,270), X3: P(855,65),  X4: P(835,310), X5: P(845,175) },
    "corner-bot": { X1: P(710,230), X2: P(775,350), X3: P(835,190), X4: P(855,435), X5: P(845,325) },
    "high-post":  { X1: P(745,220), X2: P(745,280), X3: P(845,205), X4: P(845,295), X5: P(785,250) },
    "low-post":   { X1: P(745,225), X2: P(745,275), X3: P(865,220), X4: P(865,280), X5: P(848,250) },
  },
};

export const DEFENSE_KEYS: DefenseKey[] = ["2-3", "3-2", "1-3-1", "2-1-2", "matchup"];

export const DEFENSE_LABEL: Record<DefenseKey, string> = {
  "2-3":     "2-3 Zone",
  "3-2":     "3-2 Zone",
  "1-3-1":   "1-3-1 Zone",
  "2-1-2":   "2-1-2 Zone",
  "matchup": "Matchup Zone",
};
