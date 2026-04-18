import { create } from "zustand";
import { FORMATIONS, type FormationKey, type PlayerPos } from "../data/formations";
import { SLIDES, type DefenseKey, type Slide } from "../data/defenseSlides";
import { classifyBall, isLeftHalf, mirrorX, type BallZone } from "../data/ballZones";
import { PLAYS, type PlayOutcome, findPlay } from "../data/plays";

export type DefenderId = "X1" | "X2" | "X3" | "X4" | "X5";
const DEFENDER_IDS: DefenderId[] = ["X1", "X2", "X3", "X4", "X5"];

export type DefenderPos = { id: DefenderId; x: number; y: number };

type SimState = {
  offense: PlayerPos[];
  ballHolder: string;
  activeDefense: DefenseKey;
  activeFormation: FormationKey;
  ballZone: BallZone;
  onLeftHalf: boolean;
  defenders: DefenderPos[];
  prevDefenders: DefenderPos[] | null;
  passId: number;
  showShotQuality: boolean;
  showZones: boolean;

  // Playbook state
  activePlayId: string | null;
  outcome: PlayOutcome;
  currentStep: number;       // index of the step that has been (or is being) applied
  isPlaying: boolean;
  playSpeed: 0.5 | 1 | 2;

  // Sandbox actions
  passTo: (playerId: string) => void;
  moveOffense: (playerId: string, x: number, y: number) => void;
  setDefense: (d: DefenseKey) => void;
  setFormation: (f: FormationKey) => void;
  reset: () => void;
  toggleShotQuality: () => void;
  toggleZones: () => void;

  // Playbook actions
  loadPlay: (playId: string, outcome?: PlayOutcome) => void;
  setOutcome: (o: PlayOutcome) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBack: () => void;
  rewindPlay: () => void;
  setPlaySpeed: (n: 0.5 | 1 | 2) => void;
  exitPlay: () => void;
};

let closeoutTimer: ReturnType<typeof setTimeout> | null = null;
const CLOSEOUT_MS = 420;
const CLOSEOUT_OFFSET = 22;

function clearCloseout() {
  if (closeoutTimer) {
    clearTimeout(closeoutTimer);
    closeoutTimer = null;
  }
}

function lookupDefenders(defense: DefenseKey, zone: BallZone, left: boolean): DefenderPos[] {
  const slide: Slide = SLIDES[defense][zone];
  return DEFENDER_IDS.map((id) => {
    const [x, y] = slide[id];
    return { id, x: left ? mirrorX(x) : x, y };
  });
}

function deriveFromBall(ball: PlayerPos, defense: DefenseKey) {
  const left = isLeftHalf(ball.x);
  const zone = classifyBall(ball.x, ball.y);
  const defenders = lookupDefenders(defense, zone, left);
  return { ballZone: zone, onLeftHalf: left, defenders };
}

function withCloseout(homeDefenders: DefenderPos[], receiver: PlayerPos) {
  let nearestIdx = 0;
  let minD = Infinity;
  for (let i = 0; i < homeDefenders.length; i++) {
    const d = homeDefenders[i];
    const dist = Math.hypot(d.x - receiver.x, d.y - receiver.y);
    if (dist < minD) { minD = dist; nearestIdx = i; }
  }
  const home = homeDefenders[nearestIdx];
  const dx = home.x - receiver.x;
  const dy = home.y - receiver.y;
  const len = Math.hypot(dx, dy) || 1;
  const closed: DefenderPos = {
    id: home.id,
    x: receiver.x + (dx / len) * CLOSEOUT_OFFSET,
    y: receiver.y + (dy / len) * CLOSEOUT_OFFSET,
  };
  const closeoutState = homeDefenders.map((d, i) => (i === nearestIdx ? closed : d));
  return { closeoutState, homeState: homeDefenders };
}

function initialState(formation: FormationKey, defense: DefenseKey) {
  const offense = FORMATIONS[formation].map((p) => ({ ...p }));
  const ballHolder = offense[0].id;
  const ball = offense[0];
  return {
    offense,
    ballHolder,
    activeDefense: defense,
    activeFormation: formation,
    ...deriveFromBall(ball, defense),
  };
}

// Simulate applying steps 0..targetStep non-animated and return the resulting
// offensive positions + ball holder. Used by rewindToStep to snap back without
// replaying animations.
function simulateUpTo(playId: string, outcome: PlayOutcome, targetStep: number) {
  const play = findPlay(playId);
  if (!play) return null;
  const steps = play[outcome];
  let offense = FORMATIONS[play.formation].map((p) => ({ ...p }));
  let ballHolder = offense[0].id;
  for (let i = 0; i <= targetStep && i < steps.length; i++) {
    for (const a of steps[i].actions) {
      if (a.kind === "move") {
        offense = offense.map((p) => (p.id === a.id ? { ...p, x: a.x, y: a.y } : p));
      } else if (a.kind === "pass") {
        ballHolder = a.to;
      }
    }
  }
  return { offense, ballHolder, play };
}

export const useSim = create<SimState>((set, get) => ({
  ...initialState("5-out", "2-3"),
  prevDefenders: null,
  passId: 0,
  showShotQuality: false,
  showZones: false,

  activePlayId: null,
  outcome: "offenseWins",
  currentStep: -1,
  isPlaying: false,
  playSpeed: 1,

  passTo: (playerId) => {
    const { offense, activeDefense, defenders: currentDefenders, passId } = get();
    const p = offense.find((o) => o.id === playerId);
    if (!p) return;
    clearCloseout();
    const left = isLeftHalf(p.x);
    const zone = classifyBall(p.x, p.y);
    const homeDefenders = lookupDefenders(activeDefense, zone, left);
    const { closeoutState, homeState } = withCloseout(homeDefenders, p);
    set({
      ballHolder: playerId,
      ballZone: zone,
      onLeftHalf: left,
      defenders: closeoutState,
      prevDefenders: currentDefenders,
      passId: passId + 1,
    });
    closeoutTimer = setTimeout(() => {
      closeoutTimer = null;
      set({ defenders: homeState });
    }, CLOSEOUT_MS);
  },

  moveOffense: (playerId, x, y) => {
    const { offense, ballHolder, activeDefense } = get();
    const next = offense.map((o) => (o.id === playerId ? { ...o, x, y } : o));
    const patch: Partial<SimState> = { offense: next };
    if (playerId === ballHolder) {
      clearCloseout();
      Object.assign(patch, deriveFromBall({ id: playerId, x, y }, activeDefense));
    }
    set(patch);
  },

  setDefense: (d) => {
    if (get().activePlayId) return; // locked during a play
    const { offense, ballHolder } = get();
    clearCloseout();
    const holder = offense.find((o) => o.id === ballHolder) ?? offense[0];
    set({ activeDefense: d, prevDefenders: null, ...deriveFromBall(holder, d) });
  },

  setFormation: (f) => {
    if (get().activePlayId) return;
    clearCloseout();
    set({ ...initialState(f, get().activeDefense), prevDefenders: null });
  },

  reset: () => {
    clearCloseout();
    const { activeDefense, activeFormation, activePlayId } = get();
    if (activePlayId) {
      // While a play is loaded, reset means "rewind play to start"
      get().rewindPlay();
      return;
    }
    set({ ...initialState(activeFormation, activeDefense), prevDefenders: null });
  },

  toggleShotQuality: () => set((s) => ({ showShotQuality: !s.showShotQuality })),
  toggleZones: () => set((s) => ({ showZones: !s.showZones })),

  // ---------- Playbook ----------

  loadPlay: (playId, outcome = "offenseWins") => {
    const play = findPlay(playId);
    if (!play) return;
    clearCloseout();
    const offense = FORMATIONS[play.formation].map((p) => ({ ...p }));
    const ballHolder = offense[0].id;
    const ball = offense[0];
    set({
      offense,
      ballHolder,
      activeFormation: play.formation,
      activeDefense: play.vsDefense,
      ...deriveFromBall(ball, play.vsDefense),
      prevDefenders: null,
      passId: 0,
      activePlayId: playId,
      outcome,
      currentStep: -1,
      isPlaying: false,
    });
  },

  setOutcome: (o) => {
    const { activePlayId } = get();
    if (!activePlayId) return;
    get().loadPlay(activePlayId, o);
  },

  play: () => {
    const { activePlayId, outcome, currentStep } = get();
    if (!activePlayId) return;
    const p = findPlay(activePlayId);
    if (!p) return;
    const steps = p[outcome];
    if (currentStep >= steps.length - 1 && currentStep >= 0) {
      // Ended — restart from step 0
      get().loadPlay(activePlayId, outcome);
      set({ isPlaying: true, currentStep: 0 });
      return;
    }
    if (currentStep < 0) {
      // Not started — kick off at step 0
      set({ isPlaying: true, currentStep: 0 });
      return;
    }
    // Mid-play resume
    set({ isPlaying: true });
  },
  pause: () => set({ isPlaying: false }),
  togglePlay: () => {
    const { isPlaying } = get();
    if (isPlaying) get().pause();
    else get().play();
  },

  stepForward: () => {
    const { activePlayId, outcome, currentStep } = get();
    const play = activePlayId ? findPlay(activePlayId) : null;
    if (!play) return;
    const steps = play[outcome];
    if (currentStep + 1 >= steps.length) return;
    set({ currentStep: currentStep + 1, isPlaying: false });
  },

  stepBack: () => {
    const { activePlayId, outcome, currentStep } = get();
    if (!activePlayId || currentStep < 0) return;
    const target = currentStep - 1;
    if (target < -1) return;
    if (target === -1) {
      get().rewindPlay();
      return;
    }
    const sim = simulateUpTo(activePlayId, outcome, target);
    if (!sim) return;
    const holder = sim.offense.find((p) => p.id === sim.ballHolder) ?? sim.offense[0];
    clearCloseout();
    set({
      offense: sim.offense,
      ballHolder: sim.ballHolder,
      ...deriveFromBall(holder, sim.play.vsDefense),
      prevDefenders: null,
      currentStep: target,
      isPlaying: false,
    });
  },

  rewindPlay: () => {
    const { activePlayId, outcome } = get();
    if (!activePlayId) return;
    get().loadPlay(activePlayId, outcome);
  },

  setPlaySpeed: (n) => set({ playSpeed: n }),

  exitPlay: () => {
    clearCloseout();
    set({
      activePlayId: null,
      isPlaying: false,
      currentStep: -1,
      outcome: "offenseWins",
    });
  },
}));

export { PLAYS };
