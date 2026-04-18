// Playbook: scripted offensive plays. Each play is keyed on its SIGNATURE
// ACTION — the specific mechanic that defines the play. If the signature
// action (flare screen, flex cut, hammer back-screen, UCLA back-screen,
// elevator doors closing, etc.) isn't visibly happening in the step list,
// the play isn't accurate.
//
// Step actions are applied via the existing `moveOffense` / `passTo` store
// actions so defenders auto-slide. A `shot` on a step triggers the shot-arc
// animation.
//
// Coordinates: 940x500 viewBox, 1ft = 10u. Right-basket attack; the store
// mirrors if play ever lands on the left half.

import type { DefenseKey } from "./defenseSlides";
import type { FormationKey } from "./formations";

export type ActionMove = { kind: "move"; id: string; x: number; y: number };
export type ActionPass = { kind: "pass"; to: string };
export type Action = ActionMove | ActionPass;

export type ShotKind = "3pt" | "mid" | "layup" | "dunk";
export type ShotResult = "make" | "miss";
export type ShotInfo = { shooter: string; kind: ShotKind; result: ShotResult };

export type Step = {
  description: string;
  actions: Action[];
  duration: number;
  shot?: ShotInfo;
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

const S = (description: string, duration: number, ...actions: Action[]): Step =>
  ({ description, duration, actions });
const pass = (to: string): ActionPass => ({ kind: "pass", to });
const move = (id: string, x: number, y: number): ActionMove => ({ kind: "move", id, x, y });
const shotStep = (description: string, shot: ShotInfo, duration = 2400, ...actions: Action[]): Step =>
  ({ description, duration, actions, shot });

// ================================================================
// PLAYS
// ================================================================
export const PLAYS: Play[] = [
  // ===================== vs 2-3 =====================

  // HORNS FLARE — ball-screener becomes the flare-receiver.
  // O1 uses O2's horns ball-screen; O3 flare-screens for O2 (the original
  // ball-screener), who fades to the opposite wing for a skip-pass 3.
  // Reference: "Horns Flare" — The Basketball Dictionary.
  {
    id: "horns-flare",
    name: "Horns Flare",
    vsDefense: "2-3",
    formation: "horns",
    synopsis: "Ball-screener flares off second big's screen — skip 3.",
    offenseWins: [
      S("Horns set vs 2-3. Ball with O1 at the top.", 1300),
      S("O1 comes off O2's horns ball-screen, driving to the right wing.",
        1300, move("O1", 700, 200)),
      S("O3 sprints up from the opposite elbow to flare-screen for the planted O2.",
        1100, move("O3", 735, 220)),
      S("O2 fades along the 3-point line to the upper wing off O3's flare.",
        1200, move("O2", 680, 135)),
      S("O1 rips a skip pass back over the top to O2.",
        1000, pass("O2")),
      shotStep("✓ Flare screen lands — O2 catches and fires over a late X1.",
        { shooter: "O2", kind: "3pt", result: "make" }),
    ],
    defenseWins: [
      S("Horns set vs 2-3.", 1300),
      S("O1 uses O2's ball-screen going right.",
        1300, move("O1", 700, 200)),
      S("O3 comes up to flare-screen — X1 tops the flare, staying ball-side.",
        1100, move("O3", 735, 220)),
      S("O2 fades to the wing but X1 is attached; no skip window.",
        1200, move("O2", 680, 135)),
      S("O1 swings back to O4 in the corner to reset.",
        1100, pass("O4")),
      S("✗ Good top-side flare navigation by X1 stops the catch.", 1800),
    ],
  },

  // FLEX CUT — weak-side wing cuts baseline off a big's screen at the
  // strong-side block. Requires bigs placed on the blocks; step 1 relocates
  // O4/O5 from the 5-out corners to the blocks.
  // Reference: Flex Offense — Breakthrough Basketball.
  {
    id: "flex-cut",
    name: "Flex Cut",
    vsDefense: "2-3",
    formation: "5-out",
    synopsis: "Weak-side wing cuts baseline off a block-screen for a layup.",
    offenseWins: [
      S("5-out vs 2-3. Bigs re-station on the blocks for Flex alignment.",
        1300, move("O4", 860, 195), move("O5", 860, 305)),
      S("O1 swings to O2 on the upper wing — X1 closes out.",
        1100, pass("O2")),
      S("O3 drops toward the baseline to start the flex cut.",
        500, move("O3", 700, 450)),
      S("O3 runs the baseline across to the strong-side block, using O4's screen.",
        900, move("O3", 855, 220)),
      S("O2 delivers to O3 on the ball-side block — X5 is late bumping.",
        1100, pass("O3")),
      shotStep("✓ Flex cut finishes at the rim.",
        { shooter: "O3", kind: "layup", result: "make" }),
    ],
    defenseWins: [
      S("5-out vs 2-3. Bigs to blocks for Flex alignment.",
        1300, move("O4", 860, 195), move("O5", 860, 305)),
      S("O1 → O2 upper wing.", 1100, pass("O2")),
      S("O3 drops to the baseline.",
        500, move("O3", 700, 450)),
      S("O3 flex-cuts across — X5 reads it and bumps hard into the lane.",
        900, move("O3", 855, 220)),
      S("O2 looks inside — X5 has fronted O3; no clean entry.", 1100),
      S("O3 clears back out; O2 resets to O1.",
        1200, move("O3", 675, 370), pass("O1")),
      S("✗ X5's early bump stops the flex cut.", 1800),
    ],
  },

  // HIGH-LOW — two posts in play; ball into high post, low post seals on
  // X5 and ducks in, high post dumps down.
  {
    id: "high-low",
    name: "High-Low",
    vsDefense: "2-3",
    formation: "1-3-1",
    synopsis: "High-post entry + low-post duck-in seal over X5.",
    offenseWins: [
      S("1-3-1 offense vs 2-3. O3 at the high post, O5 at the low post.", 1300),
      S("O1 enters to O2 on the upper wing to move the zone.",
        1100, pass("O2")),
      S("O2 feeds O3 flashing into the high post at the free-throw line.",
        1200, pass("O3")),
      S("With X5 stepping up, O5 ducks in and seals X5 on the high side.",
        1300, move("O5", 865, 270)),
      S("O3 reads the seal and drops a high-low pass to O5 on the block.",
        1200, pass("O5")),
      shotStep("✓ High-low finish — nobody behind O5 once X5 came up.",
        { shooter: "O5", kind: "layup", result: "make" }),
    ],
    defenseWins: [
      S("1-3-1 vs 2-3.", 1300),
      S("O1 → O2 wing.", 1100, pass("O2")),
      S("O2 → O3 high post.", 1200, pass("O3")),
      S("O5 tries to duck in — X4 pre-rotates and fronts the seal.",
        1300, move("O5", 865, 270)),
      S("O3 has no angle to dump down; kicks out to O1.",
        1300, pass("O1")),
      S("✗ Early X4 bump on the duck-in denies the high-low.", 1800),
    ],
  },

  // ===================== vs 3-2 =====================

  // HIGH-POST FLASH — 5 flashes from a block to the FT line (the 3-2's
  // soft middle), catches, then kicks out to the opened weak-side wing.
  {
    id: "high-post-flash",
    name: "High-Post Flash",
    vsDefense: "3-2",
    formation: "5-out",
    synopsis: "Big flashes to FT line (3-2's soft middle) and kicks out.",
    offenseWins: [
      S("5-out vs 3-2. O5 relocates from corner to lower block to set up the flash.",
        1200, move("O5", 860, 305)),
      S("O1 enters to O2 on the upper wing.",
        1100, pass("O2")),
      S("O5 flashes from the block to the free-throw line — dead center of the 3-2's soft spot.",
        1200, move("O5", 790, 250)),
      S("O2 feeds O5 at the high post.",
        1200, pass("O5")),
      S("X4 and X5 collapse on O5 — weak-side wing is now open.", 1100),
      S("O5 kicks out to O3 on the lower wing.",
        1100, pass("O3")),
      shotStep("✓ O3 rises for a clean 3. The soft middle opened the whole wing.",
        { shooter: "O3", kind: "3pt", result: "make" }),
    ],
    defenseWins: [
      S("5-out vs 3-2. O5 to lower block.", 1200, move("O5", 860, 305)),
      S("O1 → O2 wing.", 1100, pass("O2")),
      S("O5 flashes to the FT line.", 1200, move("O5", 790, 250)),
      S("O2 looks inside — X4 and X5 pinch hard, the catch is denied.", 1300),
      S("O2 resets to O1; O5 clears back out.",
        1200, move("O5", 920, 475), pass("O1")),
      S("✗ Pinched middle killed the high-post flash.", 1700),
    ],
  },

  // BASELINE RUNNER — wing cuts baseline on the move, catching between
  // the 3-2's two block defenders.
  {
    id: "baseline-runner",
    name: "Baseline Runner",
    vsDefense: "3-2",
    formation: "5-out",
    synopsis: "Wing runs baseline between the 3-2's two bigs.",
    offenseWins: [
      S("5-out vs 3-2.", 1200),
      S("O1 swings to O2 on the upper wing — X2 closes out.",
        1100, pass("O2")),
      S("O3 runs the baseline from weak corner toward the strong side.",
        1200, move("O3", 860, 250)),
      S("O2 lobs over the top — O3 catches on the move between X4 and X5.",
        1200, pass("O3")),
      shotStep("✓ O3 finishes in the lane, splitting the 3-2's back line.",
        { shooter: "O3", kind: "mid", result: "make" }),
    ],
    defenseWins: [
      S("5-out vs 3-2.", 1200),
      S("O1 → O2 wing.", 1100, pass("O2")),
      S("O3 runs the baseline.", 1200, move("O3", 860, 250)),
      S("X5 jumps the cut, X4 rotates into the lane — the ball can't get there.", 1300),
      S("O2 kicks back to O1; O3 resets.",
        1300, move("O3", 675, 370), pass("O1")),
      S("✗ X5's bump on the runner shut it down.", 1700),
    ],
  },

  // ===================== vs 1-3-1 =====================

  // SHORT-CORNER OVERLOAD — overload ball-side, drag the baseline rover
  // up to the short corner, then skip cross-court to weak corner.
  {
    id: "short-corner-overload",
    name: "Short-Corner Overload",
    vsDefense: "1-3-1",
    formation: "5-out",
    synopsis: "Overload strong side, drag rover, skip to weak corner.",
    offenseWins: [
      S("5-out vs 1-3-1.", 1200),
      S("Overload: O3 lifts into the strong-side short corner.",
        1300, move("O3", 900, 95)),
      S("O1 enters to O2 on the upper wing.",
        1100, pass("O2")),
      S("O2 feeds O3 in the short corner — X5 (baseline rover) must jump up.",
        1300, pass("O3")),
      S("With X5 pulled ball-side, O3 skips cross-court to O5 in the weak corner.",
        1400, pass("O5")),
      shotStep("✓ O5 drains the open corner 3. X5 can't recover across the court in time.",
        { shooter: "O5", kind: "3pt", result: "make" }),
    ],
    defenseWins: [
      S("5-out vs 1-3-1.", 1200),
      S("O3 lifts to short corner.", 1300, move("O3", 900, 95)),
      S("O1 → O2 wing.", 1100, pass("O2")),
      S("O2 looks inside — X5 shades ball-side early, X2 traps hard on the wing.", 1300),
      S("Feed denied; O2 resets to O1.", 1200, pass("O1")),
      S("✗ Aggressive trap + early rotation choked the overload.", 1800),
    ],
  },

  // SKIP-AND-REVERSE — rapid two-pass reversal to beat X5 recovering.
  {
    id: "skip-and-reverse",
    name: "Skip-and-Reverse",
    vsDefense: "1-3-1",
    formation: "5-out",
    synopsis: "Rapid reversal to exploit the baseline rover's recovery.",
    offenseWins: [
      S("5-out vs 1-3-1.", 1200),
      S("O1 → O2 upper wing. X2 traps.", 1100, pass("O2")),
      S("O2 swings back out to O1 — X1 re-engages.", 1000, pass("O1")),
      S("O1 immediately reverses to O3 on the lower wing.", 1000, pass("O3")),
      S("O3 whips a skip to O4 in the far corner — X5 still recovering.",
        1200, pass("O4")),
      shotStep("✓ Rapid reversal beats X5 back across — clean 3.",
        { shooter: "O4", kind: "3pt", result: "make" }),
    ],
    defenseWins: [
      S("5-out vs 1-3-1.", 1200),
      S("O1 → O2 upper wing. Trap.", 1100, pass("O2")),
      S("O2 → O1.", 1000, pass("O1")),
      S("O1 → O3 lower wing.", 1000, pass("O3")),
      S("O3 looks for the corner — X5 sprinted baseline and arrives in time.", 1300),
      S("O3 resets to O1.", 1200, pass("O1")),
      S("✗ X5's baseline sprint is the 1-3-1's saving play.", 1800),
    ],
  },

  // ===================== vs Matchup / m2m =====================

  // PICK-AND-ROLL — canonical top ball-screen, roller finishes.
  {
    id: "pick-and-roll",
    name: "Pick-and-Roll",
    vsDefense: "matchup",
    formation: "5-out",
    synopsis: "Top ball-screen, roller hits the pocket for a layup.",
    offenseWins: [
      S("5-out vs matchup. Ball with O1.", 1200),
      S("O5 steps up from the lower corner to set a ball-screen.",
        1200, move("O5", 680, 230)),
      S("O1 uses the screen driving right; X1 trails over the top.",
        1100, move("O1", 680, 180)),
      S("O5 rolls hard to the rim after setting the screen.",
        1100, move("O5", 850, 250)),
      S("X5 shows then recovers — a beat too late.",
        1100, pass("O5")),
      shotStep("✓ O5 finishes at the rim off the roll.",
        { shooter: "O5", kind: "layup", result: "make" }),
    ],
    defenseWins: [
      S("5-out vs matchup.", 1200),
      S("O5 sets the ball-screen.", 1200, move("O5", 680, 230)),
      S("O1 uses the screen — X5 HARD hedges, X1 recovers under.",
        1100, move("O1", 680, 180)),
      S("O5 rolls — X5 stays attached, weak-side X4 tags the roll.",
        1300, move("O5", 850, 250)),
      S("No pocket. O1 forced to reset via the wing.",
        1200, move("O1", 675, 130), pass("O2")),
      S("✗ Hard hedge + tag killed the roll.", 1800),
    ],
  },

  // UCLA CUT — wing entry, big at elbow back-screens the passer cutting
  // to the rim. Back-screen is set IN THE CUT PATH (elbow toward rim).
  {
    id: "ucla-cut",
    name: "UCLA Cut",
    vsDefense: "matchup",
    formation: "1-4-high",
    synopsis: "Wing entry + back-screen at the elbow — cutter gets a layup.",
    offenseWins: [
      S("1-4 high set vs matchup. Two bigs at the elbows.", 1200),
      S("O1 enters to O4 on the upper wing.",
        1100, pass("O4")),
      S("O2 holds at the upper elbow — ready to back-screen X1 in O1's cut path.",
        900, move("O2", 765, 230)),
      S("O1 cuts hard off the back-screen to the rim; X1 gets hung up on O2.",
        1100, move("O1", 870, 225)),
      S("O4 delivers over the top — O1 catches at the rim.",
        1000, pass("O1")),
      shotStep("✓ UCLA cut — clean layup off the elbow back-screen.",
        { shooter: "O1", kind: "layup", result: "make" }),
    ],
    defenseWins: [
      S("1-4 high vs matchup.", 1200),
      S("O1 → O4 wing.", 1100, pass("O4")),
      S("O2 slides to back-screen — X1 sees it coming and jams under.",
        900, move("O2", 765, 230)),
      S("O1 cuts anyway; X5 tags hard in the paint.",
        1100, move("O1", 870, 225)),
      S("Nothing open. O4 holds, then resets as O1 clears back out.",
        1400, move("O1", 625, 250), move("O2", 770, 195), pass("O1")),
      S("✗ Alert X1 + X5 tag kills the UCLA layup.", 1800),
    ],
  },

  // HAMMER — strong-side baseline drive; weak-side big back-screens the
  // weak-side shooter's defender (the hammer); shooter flares to the
  // weak-side corner for a skip-pass 3. (Popovich's signature action.)
  {
    id: "hammer",
    name: "Hammer Action",
    vsDefense: "matchup",
    formation: "5-out",
    synopsis: "Baseline drive + weak-side back-screen for opposite-corner 3.",
    offenseWins: [
      S("5-out vs matchup. O5 drops from lower corner to the weak-side block — ready to hammer.",
        1300, move("O5", 860, 360)),
      S("O1 enters to O2 on the upper wing.",
        1100, pass("O2")),
      S("O2 drives hard baseline to the strong-side corner — X2 pinned on the drive.",
        1200, move("O2", 875, 75)),
      S("O3 drops toward the baseline as O5 sets the hammer back-screen.",
        500, move("O3", 700, 440)),
      S("O3 flares along the baseline to the lower corner off the hammer screen.",
        900, move("O3", 920, 470)),
      S("O2 whips a skip pass cross-court to O3 in the corner.",
        1100, pass("O3")),
      shotStep("✓ Hammer lands — O3 splashes the opposite-corner 3.",
        { shooter: "O3", kind: "3pt", result: "make" }),
    ],
    defenseWins: [
      S("5-out vs matchup. O5 stations weak-side block.",
        1300, move("O5", 860, 360)),
      S("O1 → O2 wing.", 1100, pass("O2")),
      S("O2 drives baseline.", 1200, move("O2", 875, 75)),
      S("O3 drops to the baseline; O5 sets the hammer.",
        500, move("O3", 700, 440)),
      S("O3 flares — but X3 fights through top-side of the screen and stays attached.",
        900, move("O3", 920, 470)),
      S("O2 has no skip window; O3 is tightly contested.", 1200),
      S("Ball reverses up top; offense resets.",
        1300, move("O3", 675, 370), move("O5", 920, 475), pass("O1")),
      S("✗ Tight hammer navigation by X3 takes away the corner 3.", 1800),
    ],
  },

  // SPAIN PICK-AND-ROLL — ball-screen, then weak-side shooter BACK-SCREENS
  // the roller's defender and pops out for 3. Two reads: roll or pop.
  {
    id: "spain-pnr",
    name: "Spain Pick-and-Roll",
    vsDefense: "matchup",
    formation: "5-out",
    synopsis: "Back-screen on the roller's defender — screener pops for 3.",
    offenseWins: [
      S("5-out vs matchup. O4 lifts from the upper corner to the strong-side slot for Spain.",
        1300, move("O4", 690, 200)),
      S("O5 steps up from the lower corner to set the ball-screen for O1.",
        1100, move("O5", 680, 240)),
      S("O1 uses the screen, driving right.",
        900, move("O1", 700, 190)),
      S("O5 rolls; O4 slips in to back-screen X5 (the roller's defender).",
        1000, move("O5", 820, 245), move("O4", 760, 240)),
      S("X5 gets caught on O4. O4 pops back up to the top of the key.",
        900, move("O4", 650, 250)),
      S("O1 kicks to O4 wide open.",
        900, pass("O4")),
      shotStep("✓ Spain action — O4 rises for a clean top-of-the-key 3.",
        { shooter: "O4", kind: "3pt", result: "make" }),
    ],
    defenseWins: [
      S("5-out vs matchup. O4 lifts for Spain setup.",
        1300, move("O4", 690, 200)),
      S("O5 sets the ball-screen.", 1100, move("O5", 680, 240)),
      S("O1 uses screen.", 900, move("O1", 700, 190)),
      S("O4 slips in to back-screen — defense SWITCHES: X4 picks up O4, X5 stays on the roll.",
        1000, move("O5", 820, 245), move("O4", 760, 240)),
      S("O4 pops — X4 closes out cleanly; no open 3.",
        900, move("O4", 650, 250)),
      S("O1 looks for O4; contested, resets.",
        1200, pass("O4")),
      S("✗ Switch-and-communicate defuses Spain.", 1800),
    ],
  },

  // IVERSON CUT — shooter cuts wing-to-wing across TWO elbow screens to
  // catch in rhythm. Here O4 (upper wing) cuts across O2 + O3 elbow bigs.
  {
    id: "iverson-cut",
    name: "Iverson Cut",
    vsDefense: "matchup",
    formation: "1-4-high",
    synopsis: "Shooter cuts wing-to-wing off two elbow screens.",
    offenseWins: [
      S("1-4 high vs matchup. Two elbow bigs; O4/O5 on the wings.", 1200),
      S("O5 clears from the lower wing to the deep corner to open the landing spot.",
        1000, move("O5", 920, 475)),
      S("O4 starts the Iverson — cuts up to the upper elbow and brushes O2's screen.",
        600, move("O4", 760, 215)),
      S("O4 continues across and down, using O3's screen to emerge on the lower wing.",
        900, move("O4", 680, 365)),
      S("O1 delivers to O4 catching in rhythm on the lower wing.",
        900, pass("O4")),
      shotStep("✓ O4 hits the catch-and-shoot 3 off the two-screen cut.",
        { shooter: "O4", kind: "3pt", result: "make" }),
    ],
    defenseWins: [
      S("1-4 high vs matchup.", 1200),
      S("O5 clears to the deep corner.", 1000, move("O5", 920, 475)),
      S("O4 starts the Iverson cut to the upper elbow.",
        600, move("O4", 760, 215)),
      S("O4 continues across — switching defense: X3 picks up O4 cleanly off the second screen.",
        900, move("O4", 680, 365)),
      S("O1 looks for O4 — tightly contested, pulls it back.", 1000),
      S("Kick to O5 in the corner to reset.", 1000, pass("O5")),
      S("✗ Switch on the Iverson kills the rhythm catch.", 1800),
    ],
  },

  // FLOPPY — shooter starts under the rim, reads the defense, and chooses
  // either a double-screen side or a single-screen side. Here shooter
  // takes the double for the quick catch-and-shoot.
  {
    id: "floppy",
    name: "Floppy",
    vsDefense: "matchup",
    formation: "5-out",
    synopsis: "Shooter dives low, then reads the defense and emerges off a screen.",
    offenseWins: [
      S("Reset to Floppy alignment: O5 under the rim; O2/O3 double on the upper side; O4 single lower side.",
        1400,
        move("O5", 880, 250), move("O2", 820, 195), move("O3", 780, 195),
        move("O4", 810, 305)),
      S("O5 reads the defense and chooses the upper (double-screen) side.",
        1000),
      S("O5 sprints from the rim up through the double screen to the upper wing.",
        1200, move("O5", 680, 130)),
      S("O1 delivers to O5 catching in rhythm on the upper wing.",
        1100, pass("O5")),
      shotStep("✓ Double screen springs O5 for a clean 3.",
        { shooter: "O5", kind: "3pt", result: "make" }),
    ],
    defenseWins: [
      S("Floppy alignment.",
        1400,
        move("O5", 880, 250), move("O2", 820, 195), move("O3", 780, 195),
        move("O4", 810, 305)),
      S("O5 picks the double-screen side.", 1000),
      S("O5 comes off the screens — defender chases hard and top-locks the curl.",
        1200, move("O5", 680, 130)),
      S("O1 looks for O5 — tightly contested, no clean window.", 1200),
      S("O5 recycles back under; O1 resets.",
        1300, move("O5", 880, 250)),
      S("✗ Top-locking the Floppy curl denies the shooter.", 1800),
    ],
  },

  // ELEVATOR DOORS — two screeners open to let a shooter sprint through,
  // then STEP TOGETHER to seal the defender behind them.
  {
    id: "elevator",
    name: "Elevator Doors",
    vsDefense: "matchup",
    formation: "box",
    synopsis: "Two screeners close behind a sprinting shooter for a top-of-key 3.",
    offenseWins: [
      S("Box set. O1 relocates to the wing with the ball; O4 is the shooter at the lower block.",
        1300, move("O1", 675, 150)),
      S("O4 sprints from the lower block up through the elbow gap between O2 and O3.",
        1100, move("O4", 760, 250)),
      S("O2 and O3 step TOGETHER to close the elevator doors behind O4.",
        800, move("O2", 760, 235), move("O3", 760, 265)),
      S("O4 pops out to the top of the key — defender sealed behind the doors.",
        900, move("O4", 650, 250)),
      S("O1 delivers to O4 wide open at the top.",
        1000, pass("O4")),
      shotStep("✓ Elevator doors slam shut — O4 drains a top-of-the-key 3.",
        { shooter: "O4", kind: "3pt", result: "make" }),
    ],
    defenseWins: [
      S("Box set; O1 to wing, O4 as shooter.",
        1300, move("O1", 675, 150)),
      S("O4 sprints up through the elbow gap.",
        1100, move("O4", 760, 250)),
      S("O2 and O3 close the doors — but X4 SPLITS between them before they seal.",
        800, move("O2", 760, 235), move("O3", 760, 265)),
      S("O4 pops — X4 is right on his hip, closeout is clean.",
        900, move("O4", 650, 250)),
      S("O1 looks for O4 — contested, pulls it back.",
        1200),
      S("✗ Splitting the doors before they close beats the elevator.", 1800),
    ],
  },
];

export function findPlay(id: string): Play | undefined {
  return PLAYS.find((p) => p.id === id);
}
