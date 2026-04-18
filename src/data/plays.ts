// Playbook: scripted offensive plays that demonstrate how specific defenses
// are beaten (offenseWins) or held (defenseWins). The runner applies each
// step's `actions` through the existing `moveOffense` and `passTo` store
// actions, so defenders auto-slide using the zone engine.
//
// Coordinates match the sandbox convention (940x500, 1ft=10u). Right-basket
// attack for all plays; the mirror logic in the store handles display if
// action later lands on the left half.

import type { DefenseKey } from "./defenseSlides";
import type { FormationKey } from "./formations";

export type ActionMove = { kind: "move"; id: string; x: number; y: number };
export type ActionPass = { kind: "pass"; to: string };
export type Action = ActionMove | ActionPass;

export type Step = {
  description: string;
  actions: Action[];
  duration: number; // ms before auto-advance (scaled by playSpeed)
};

export type PlayOutcome = "offenseWins" | "defenseWins";

export type Play = {
  id: string;
  name: string;
  vsDefense: DefenseKey;
  formation: FormationKey;
  synopsis: string;
  offenseWins: Step[];
  defenseWins: Step[];
};

// ---------- authoring helpers ----------
const S = (description: string, duration: number, ...actions: Action[]): Step =>
  ({ description, duration, actions });
const pass = (to: string): ActionPass => ({ kind: "pass", to });
const move = (id: string, x: number, y: number): ActionMove => ({ kind: "move", id, x, y });

// ---------- 8 plays ----------
export const PLAYS: Play[] = [
  {
    id: "horns-flare",
    name: "Horns Flare",
    vsDefense: "2-3",
    formation: "horns",
    synopsis: "Elbow-to-elbow swing + flare screen for skip-corner 3.",
    offenseWins: [
      S("Horns set: 2 elbows + 2 corners. Ball with O1 at the top.", 1300),
      S("O1 enters to O2 at the upper elbow — X1 shows, X5 pinches.", 1200, pass("O2")),
      S("O2 swings middle to O3 at the opposite elbow — X5 must cross the paint.", 1300, pass("O3")),
      S("O3 kicks to O5 in the weak-side corner — X4 closes out, late.", 1400, pass("O5")),
      S("Skip cross-court back to O4 strong-corner — X3 can't recover in time.", 1500, pass("O4")),
      S("✓ Wide-open corner 3 for O4. 2-3 can't cover both corners on a fast skip.", 2000),
    ],
    defenseWins: [
      S("Horns set vs 2-3. Ball with O1.", 1300),
      S("O1 → O2 upper elbow.", 1200, pass("O2")),
      S("O2 swings to O3 — X5 stays disciplined, X4 pre-rotates help-side.", 1300, pass("O3")),
      S("O3 looks for the weak corner — X4 has bumped over, skip is denied.", 1300),
      S("O3 reverses back to O2 — defense resets shell.", 1100, pass("O2")),
      S("O2 → O1. Shot clock burning, still in horns.", 1200, pass("O1")),
      S("✗ 2-3 held: early X4 rotation killed the skip.", 1800),
    ],
  },

  {
    id: "flex-cut",
    name: "Flex Cut",
    vsDefense: "2-3",
    formation: "5-out",
    synopsis: "Corner pass then baseline flex cut for a block catch.",
    offenseWins: [
      S("5-out vs 2-3. Ball with O1 at the top.", 1200),
      S("O1 enters to O2 on the upper wing — X1 closes out.", 1100, pass("O2")),
      S("O2 delivers to O4 in the strong corner — X3 rotates down.", 1300, pass("O4")),
      S("O2 flex-cuts baseline; O3 lifts to fill the vacated wing.",
        1400, move("O2", 870, 230), move("O3", 675, 250)),
      S("O4 feeds O2 on the ball-side block — X5 is late bumping.", 1300, pass("O2")),
      S("✓ Layup at the rim. 2-3's center couldn't bump in time.", 1800),
    ],
    defenseWins: [
      S("5-out vs 2-3. Ball with O1.", 1200),
      S("O1 → O2 wing.", 1100, pass("O2")),
      S("O2 → O4 corner. X3 closes.", 1300, pass("O4")),
      S("O2 flex-cuts — X5 reads it early and bumps into the lane.",
        1400, move("O2", 870, 230)),
      S("O4 looks for O2 — X5 has fronted. Kick back out.",
        1300, move("O2", 680, 180), pass("O1")),
      S("✗ X5's early bump killed the backdoor. Offense resets.", 1800),
    ],
  },

  {
    id: "high-post-flash",
    name: "High-Post Flash",
    vsDefense: "3-2",
    formation: "5-out",
    synopsis: "Flash a big to the FT line to attack the 3-2's soft middle.",
    offenseWins: [
      S("5-out vs 3-2. X1 pressures the ball.", 1200),
      S("O1 dribbles right to pull X1; O5 flashes from corner to the FT line.",
        1400, move("O1", 680, 220), move("O5", 790, 250)),
      S("O1 feeds O5 at the free-throw line — dead center of the 3-2's soft spot.",
        1300, pass("O5")),
      S("X5 steps up to contest; weak-side wing is now unguarded.", 1100),
      S("O5 kicks out to O3, wide-open on the lower wing.", 1200, pass("O3")),
      S("✓ Open 3 for O3. The 3-2's middle gap opened the whole wing.", 1800),
    ],
    defenseWins: [
      S("5-out vs 3-2.", 1200),
      S("O1 dribbles; O5 flashes to FT line.",
        1400, move("O1", 680, 220), move("O5", 790, 250)),
      S("O1 looks for O5 — X4 and X5 pinch hard, denying the catch.", 1300),
      S("Ball holds; O1 resets to O2 on top.", 1200, pass("O2")),
      S("O5 recovers out to the corner.",
        1200, move("O5", 920, 475), move("O1", 625, 250)),
      S("✗ Pinched middle killed the flash. No penetration.", 1700),
    ],
  },

  {
    id: "baseline-runner",
    name: "Baseline Runner",
    vsDefense: "3-2",
    formation: "5-out",
    synopsis: "Wing runs baseline between the 3-2's two bigs.",
    offenseWins: [
      S("5-out vs 3-2. Two bigs at the blocks.", 1200),
      S("O1 swings to O2 on the upper wing — X2 closes.", 1100, pass("O2")),
      S("O3 runs the baseline from weak corner toward strong side.",
        1200, move("O3", 860, 250)),
      S("O2 lobs over the top — O3 catches on the move between X4 and X5.",
        1300, pass("O3")),
      S("✓ Runner splits the 3-2's back line for a midrange finish.", 1800),
    ],
    defenseWins: [
      S("5-out vs 3-2.", 1200),
      S("O1 → O2 wing.", 1100, pass("O2")),
      S("O3 starts baseline runner.", 1200, move("O3", 860, 250)),
      S("X5 jumps the cut, X4 rotates into the lane — the ball can't get there.", 1300),
      S("O2 kicks back to O1; O3 resets to the corner.",
        1300, move("O3", 675, 370), pass("O1")),
      S("✗ X5's bump on the runner shut the action down.", 1700),
    ],
  },

  {
    id: "short-corner-overload",
    name: "Short-Corner Overload",
    vsDefense: "1-3-1",
    formation: "5-out",
    synopsis: "Overload strong side, drag the baseline rover, then skip weak corner.",
    offenseWins: [
      S("5-out vs 1-3-1. O5 still in weak corner.", 1200),
      S("Overload: O3 flashes to the strong-side short corner.",
        1400, move("O3", 900, 95)),
      S("O1 enters to O2 on the upper wing.", 1100, pass("O2")),
      S("O2 feeds O3 in the short corner — X5 (baseline rover) has to jump up.",
        1300, pass("O3")),
      S("With X5 pulled high, O3 skips cross-court to O5 in the weak corner.",
        1500, pass("O5")),
      S("✓ X5 can't recover cross-court in time — open corner 3.", 1800),
    ],
    defenseWins: [
      S("5-out vs 1-3-1.", 1200),
      S("O3 flashes to short corner.", 1400, move("O3", 900, 95)),
      S("O1 → O2 wing.", 1100, pass("O2")),
      S("O2 looks inside to O3 — X5 shades ball-side early, X2 traps.", 1300),
      S("Feed denied; O2 resets to O1.", 1200, pass("O1")),
      S("✗ Aggressive trap + early rotation choked the overload.", 1800),
    ],
  },

  {
    id: "skip-and-reverse",
    name: "Skip-and-Reverse",
    vsDefense: "1-3-1",
    formation: "5-out",
    synopsis: "Rapid two-pass reversal to exploit the baseline rover's recovery.",
    offenseWins: [
      S("5-out vs 1-3-1. Trap-heavy at the wings.", 1200),
      S("O1 → O2 upper wing. X2 traps hard.", 1100, pass("O2")),
      S("O2 swings back out to O1 — X1 re-engages.", 1000, pass("O1")),
      S("O1 immediately reverses to O3 on the lower wing.", 1000, pass("O3")),
      S("O3 whips a skip to O4 in the far corner — X5 still recovering.",
        1300, pass("O4")),
      S("✓ Rapid reversal opens the weak corner. Clean 3.", 1800),
    ],
    defenseWins: [
      S("5-out vs 1-3-1.", 1200),
      S("O1 → O2 upper wing. Trap.", 1100, pass("O2")),
      S("O2 → O1.", 1000, pass("O1")),
      S("O1 → O3 lower wing.", 1000, pass("O3")),
      S("O3 looks for the corner skip — X5 sprinted baseline, arrives in time.", 1300),
      S("O3 holds, then resets to O1.", 1200, pass("O1")),
      S("✗ X5's baseline sprint is the 1-3-1's saving play.", 1800),
    ],
  },

  {
    id: "pick-and-roll",
    name: "Pick-and-Roll",
    vsDefense: "matchup",
    formation: "5-out",
    synopsis: "Classic top ball-screen with roll read against a matchup zone.",
    offenseWins: [
      S("5-out vs matchup. Ball with O1 up top.", 1200),
      S("O5 steps up from weak corner to set a ball-screen for O1.",
        1200, move("O5", 680, 230)),
      S("O1 uses the screen driving right; X1 trails over the top.",
        1100, move("O1", 680, 180)),
      S("O5 rolls to the rim immediately after the screen.",
        1200, move("O5", 850, 250)),
      S("X5 shows briefly then recovers to the roller — a beat late.",
        1300, pass("O5")),
      S("✓ O5 finishes at the rim off the roll.", 1800),
    ],
    defenseWins: [
      S("5-out vs matchup. Ball with O1.", 1200),
      S("O5 sets the ball-screen.", 1200, move("O5", 680, 230)),
      S("O1 uses screen — X5 HARD hedges high, X1 recovers under.",
        1100, move("O1", 680, 180)),
      S("O5 rolls — X5 stays attached, weak-side X4 tags the roll.",
        1300, move("O5", 850, 250)),
      S("No roll pass. O1 forced to reset to the wing.",
        1200, move("O1", 675, 130), pass("O2")),
      S("✗ Hard hedge + tag killed the roll pocket.", 1800),
    ],
  },

  {
    id: "ucla-cut",
    name: "UCLA Cut",
    vsDefense: "matchup",
    formation: "1-4-high",
    synopsis: "Wing entry then high-post back-screen for a layup cut.",
    offenseWins: [
      S("1-4 high set vs matchup. O1 surveys.", 1200),
      S("O1 enters to O4 on the upper wing.", 1100, pass("O4")),
      S("O2 drifts down from the elbow to set a back-screen at the elbow.",
        1000, move("O2", 760, 235)),
      S("O1 cuts hard off the screen to the rim — X1 runs into O2.",
        1200, move("O1", 870, 230)),
      S("O4 delivers over the top — O1 at the rim.", 1300, pass("O1")),
      S("✓ UCLA cut gets a clean layup off the back-screen.", 1800),
    ],
    defenseWins: [
      S("1-4 high vs matchup.", 1200),
      S("O1 → O4 wing.", 1100, pass("O4")),
      S("O2 drops to back-screen — X1 sees it coming and jams under.",
        1000, move("O2", 760, 235)),
      S("O1 cuts anyway; X5 tags hard in the lane.",
        1200, move("O1", 870, 230)),
      S("Nothing open. O4 holds.", 1300),
      S("O1 flares back out; O4 resets to O1.",
        1300, move("O1", 625, 250), move("O2", 770, 195), pass("O1")),
      S("✗ Alert X1 + X5 tag kills the UCLA layup.", 1800),
    ],
  },
];

export function findPlay(id: string): Play | undefined {
  return PLAYS.find((p) => p.id === id);
}
