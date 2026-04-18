import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PlayerPos } from "../data/formations";
import { useSim, type DefenderPos } from "../store/useSim";

type OffenseProps = {
  p: PlayerPos;
  hasBall: boolean;
  interactive: boolean;
  onPass: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
};

const CONTESTED = 35;
const GUARDED = 65;

function qualityColor(dist: number): string {
  if (dist <= CONTESTED) return "#22c55e";
  if (dist <= GUARDED)   return "#eab308";
  return "#ef4444";
}

function screenToSvg(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = pt.matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

export function OffenseDot({ p, hasBall, interactive, onPass, onMove }: OffenseProps) {
  const [dragging, setDragging] = useState(false);
  const movedRef = useRef(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const defenders = useSim((s) => s.defenders);
  const showQuality = useSim((s) => s.showShotQuality);

  let nearestDist = Infinity;
  if (showQuality) {
    for (const d of defenders) {
      const dist = Math.hypot(d.x - p.x, d.y - p.y);
      if (dist < nearestDist) nearestDist = dist;
    }
  }

  const onPointerDown = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!interactive) return;
    (e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId);
    movedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<SVGCircleElement>) => {
    if (!dragging || !startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const { x, y } = screenToSvg(svg, e.clientX, e.clientY);
    onMove(p.id, Math.max(10, Math.min(930, x)), Math.max(10, Math.min(490, y)));
  };

  const onPointerUp = (e: React.PointerEvent<SVGCircleElement>) => {
    const t = e.currentTarget as SVGCircleElement;
    if (t.hasPointerCapture(e.pointerId)) t.releasePointerCapture(e.pointerId);
    setDragging(false);
    if (!movedRef.current && interactive) onPass(p.id);
  };

  const cursor = !interactive ? "default" : dragging ? "grabbing" : "grab";

  return (
    <motion.g
      initial={false}
      animate={{ x: p.x, y: p.y }}
      transition={dragging ? { duration: 0 } : { type: "tween", duration: 0.55, ease: "easeInOut" }}
      style={{ cursor }}
    >
      {showQuality && !hasBall && (
        <circle
          cx={0}
          cy={0}
          r={24}
          fill="none"
          stroke={qualityColor(nearestDist)}
          strokeOpacity={0.9}
          strokeWidth={2.5}
          strokeDasharray="4 3"
          pointerEvents="none"
        />
      )}
      <circle
        cx={0}
        cy={0}
        r={14}
        fill={hasBall ? "#15803d" : "#22c55e"}
        stroke="#052e16"
        strokeWidth={2}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <text
        x={0}
        y={4}
        textAnchor="middle"
        fill="white"
        fontSize={11}
        fontWeight={700}
        pointerEvents="none"
        style={{ userSelect: "none" }}
      >
        {p.id}
      </text>
    </motion.g>
  );
}

export function DefenderDot({ d }: { d: DefenderPos }) {
  return (
    <motion.g
      initial={false}
      animate={{ x: d.x, y: d.y }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
    >
      <circle
        cx={0}
        cy={0}
        r={14}
        fill="#2563eb"
        stroke="#0b1220"
        strokeWidth={2}
      />
      <text
        x={0}
        y={4}
        textAnchor="middle"
        fill="white"
        fontSize={11}
        fontWeight={700}
        pointerEvents="none"
        style={{ userSelect: "none" }}
      >
        {d.id}
      </text>
    </motion.g>
  );
}

export function Ball({ x, y }: { x: number; y: number }) {
  const activeShot = useSim((s) => s.activeShot);
  if (activeShot) return null; // shot animation renders its own ball
  return (
    <motion.circle
      initial={false}
      animate={{ cx: x + 18, cy: y - 10 }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
      r={8}
      fill="#ea580c"
      stroke="#7c2d12"
      strokeWidth={1.5}
      pointerEvents="none"
    />
  );
}
