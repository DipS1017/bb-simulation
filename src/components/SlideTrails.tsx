import { motion } from "framer-motion";
import { useSim } from "../store/useSim";
import { ZONE_COLORS } from "../data/zoneAreas";

// Fading lines showing where each defender came FROM on the last pass.
// Keyed on passId so each pass unmounts old trails and mounts fresh ones
// that animate opacity 0.7 -> 0 over ~1.4s (starting after a short delay
// so the trail is visible while defenders are still moving).

export function SlideTrails() {
  const passId = useSim((s) => s.passId);
  const prev = useSim((s) => s.prevDefenders);
  const current = useSim((s) => s.defenders);

  if (!prev) return null;

  return (
    <g pointerEvents="none" key={passId}>
      {current.map((d) => {
        const from = prev.find((p) => p.id === d.id);
        if (!from) return null;
        const dx = d.x - from.x;
        const dy = d.y - from.y;
        if (Math.hypot(dx, dy) < 6) return null; // don't render tiny trails
        return (
          <motion.line
            key={d.id}
            x1={from.x}
            y1={from.y}
            x2={d.x}
            y2={d.y}
            stroke={ZONE_COLORS[d.id]}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray="6 5"
            initial={{ opacity: 0.75 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.4, delay: 0.35, ease: "easeOut" }}
          />
        );
      })}
    </g>
  );
}
