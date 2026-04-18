import { AnimatePresence, motion } from "framer-motion";
import { useSim } from "../store/useSim";

// SVG overlay that renders the in-flight shot: an orange ball arcing from the
// shooter to the nearest rim, plus a result badge that pops on top. Keyed on
// `shotId` so each new shot remounts fresh keyframes.

const RIM_RIGHT: [number, number] = [887, 250];
const RIM_LEFT: [number, number] = [53, 250];

// Arc lift scales by shot type; 2D top-down so we bow the midpoint PERPENDICULAR
// to the shot line, toward the "front" of the court (away from the baseline).
const LIFT_BY_KIND: Record<"3pt" | "mid" | "layup" | "dunk", number> = {
  "3pt":   55,
  "mid":   38,
  "layup": 18,
  "dunk":  12,
};

const KIND_LABEL = {
  "3pt": "3 PT",
  "mid": "MID",
  "layup": "LAYUP",
  "dunk": "DUNK",
} as const;

const POINTS = { "3pt": 3, "mid": 2, "layup": 2, "dunk": 2 } as const;

export function ShotAnimation() {
  const activeShot = useSim((s) => s.activeShot);
  const shotId = useSim((s) => s.shotId);
  const offense = useSim((s) => s.offense);

  return (
    <AnimatePresence>
      {activeShot && (
        <ShotVisual
          key={shotId}
          shooter={offense.find((p) => p.id === activeShot.shooter)}
          kind={activeShot.kind}
          result={activeShot.result}
        />
      )}
    </AnimatePresence>
  );
}

function ShotVisual({
  shooter, kind, result,
}: {
  shooter: { x: number; y: number } | undefined;
  kind: keyof typeof KIND_LABEL;
  result: "make" | "miss";
}) {
  if (!shooter) return null;

  const startX = shooter.x + 18;
  const startY = shooter.y - 10;
  const [rimX, rimY] = shooter.x > 470 ? RIM_RIGHT : RIM_LEFT;

  // Miss lands slightly off-rim for a soft visual cue.
  const endX = result === "make" ? rimX : rimX + (shooter.x > 470 ? 14 : -14);
  const endY = result === "make" ? rimY : rimY - 10;

  // Arc: bow the midpoint PERPENDICULAR to the shot line, toward the center of
  // the court (away from whichever baseline the shooter is near). Works for
  // any angle including corner 3s, which a naive "midpoint minus lift" blows
  // off-screen.
  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.hypot(dx, dy) || 1;
  let nx = -dy / dist;
  let ny = dx / dist;
  // Pick the normal pointing toward the court center (away from the baseline
  // the shooter is attacking). For right-rim, baseline is x=940 → want nx<0.
  const wantNegNx = shooter.x > 470;
  if ((wantNegNx && nx > 0) || (!wantNegNx && nx < 0)) { nx = -nx; ny = -ny; }
  const lift = LIFT_BY_KIND[kind];
  const midX = (startX + endX) / 2 + nx * lift;
  const midY = Math.max(15, Math.min(485, (startY + endY) / 2 + ny * lift));

  const makeColor = "#22c55e";
  const missColor = "#ef4444";
  const badgeColor = result === "make" ? makeColor : missColor;
  const pts = POINTS[kind];
  const badgeText = result === "make" ? `+${pts} ${KIND_LABEL[kind]}` : `MISS · ${KIND_LABEL[kind]}`;

  // Badge sits above the shooter (or flips to below if near the top edge).
  const badgeY = shooter.y < 120 ? shooter.y + 46 : shooter.y - 34;

  return (
    <g pointerEvents="none">
      {/* flying ball */}
      <motion.circle
        r={8}
        fill="#ea580c"
        stroke="#7c2d12"
        strokeWidth={1.5}
        initial={{ cx: startX, cy: startY, opacity: 1 }}
        animate={{
          cx: [startX, midX, endX],
          cy: [startY, midY, endY],
          opacity: result === "make" ? [1, 1, 0] : [1, 1, 1],
        }}
        transition={{ duration: 0.75, times: [0, 0.55, 1], ease: "easeOut" }}
      />

      {/* make: rim flash ring */}
      {result === "make" && (
        <motion.circle
          cx={rimX}
          cy={rimY}
          r={18}
          fill="none"
          stroke={makeColor}
          strokeWidth={3}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0.6, 1.4, 1.6] }}
          transition={{ duration: 0.55, delay: 0.65, times: [0, 0.35, 1] }}
        />
      )}

      {/* badge pop */}
      <motion.g
        initial={{ opacity: 0, scale: 0.7, y: 0 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.7, 1.2, 1, 0.95],
          y: [0, -6, -8, -14],
        }}
        transition={{ duration: 1.7, delay: 0.6, times: [0, 0.12, 0.7, 1] }}
      >
        <rect
          x={shooter.x - 48}
          y={badgeY - 18}
          width={96}
          height={26}
          rx={13}
          fill="#0b1220"
          stroke={badgeColor}
          strokeWidth={2}
        />
        <text
          x={shooter.x}
          y={badgeY}
          textAnchor="middle"
          fill={badgeColor}
          fontSize={14}
          fontWeight={900}
          style={{ userSelect: "none" }}
        >
          {badgeText}
        </text>
      </motion.g>
    </g>
  );
}
