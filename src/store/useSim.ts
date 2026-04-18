import { create } from "zustand";
import { FORMATIONS, type FormationKey, type PlayerPos } from "../data/formations";
import { SLIDES, type DefenseKey, type Slide } from "../data/defenseSlides";
import { classifyBall, isLeftHalf, mirrorX, type BallZone } from "../data/ballZones";

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

  passTo: (playerId: string) => void;
  moveOffense: (playerId: string, x: number, y: number) => void;
  setDefense: (d: DefenseKey) => void;
  setFormation: (f: FormationKey) => void;
  reset: () => void;
  toggleShotQuality: () => void;
  toggleZones: () => void;
};

// Timer for the "closeout then recover" animation; cleared whenever state
// that invalidates the in-flight closeout changes.
let closeoutTimer: ReturnType<typeof setTimeout> | null = null;
const CLOSEOUT_MS = 420;
const CLOSEOUT_OFFSET = 22; // defender stops ~22u from the receiver on closeout

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

// Build the defenders array with the nearest defender to `receiver` lunging
// into a closeout position. Returns both the closeout-state defenders and the
// home-state defenders so the caller can schedule the recovery.
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

export const useSim = create<SimState>((set, get) => ({
  ...initialState("5-out", "2-3"),
  prevDefenders: null,
  passId: 0,
  showShotQuality: false,
  showZones: false,

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
    const { offense, ballHolder } = get();
    clearCloseout();
    const holder = offense.find((o) => o.id === ballHolder) ?? offense[0];
    set({ activeDefense: d, prevDefenders: null, ...deriveFromBall(holder, d) });
  },

  setFormation: (f) => {
    clearCloseout();
    set({ ...initialState(f, get().activeDefense), prevDefenders: null });
  },

  reset: () => {
    clearCloseout();
    const { activeDefense, activeFormation } = get();
    set({ ...initialState(activeFormation, activeDefense), prevDefenders: null });
  },

  toggleShotQuality: () => set((s) => ({ showShotQuality: !s.showShotQuality })),
  toggleZones: () => set((s) => ({ showZones: !s.showZones })),
}));
