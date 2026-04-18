import { AnimatePresence, motion } from "framer-motion";
import { useSim } from "../store/useSim";
import { findPlay } from "../data/plays";

export function PlayBanner() {
  const activePlayId = useSim((s) => s.activePlayId);
  const outcome = useSim((s) => s.outcome);
  const currentStep = useSim((s) => s.currentStep);

  if (!activePlayId) return null;
  const play = findPlay(activePlayId);
  if (!play) return null;

  const steps = play[outcome];
  const description =
    currentStep < 0
      ? "Press Play to run the sequence."
      : currentStep < steps.length
        ? steps[currentStep].description
        : "— end of sequence —";

  const branchLabel = outcome === "offenseWins" ? "Offense wins" : "Defense wins";

  return (
    <div style={bannerStyle}>
      <div style={headerStyle}>
        <span style={nameStyle}>{play.name}</span>
        <span style={separatorStyle}>•</span>
        <span style={branchStyle(outcome)}>{branchLabel}</span>
        <span style={separatorStyle}>•</span>
        <span style={vsStyle}>vs {play.vsDefense}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activePlayId}-${outcome}-${currentStep}`}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.22 }}
          style={descriptionStyle}
        >
          {description}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const bannerStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 8,
  padding: "10px 16px",
  marginBottom: 10,
  minHeight: 62,
  width: "100%",
};
const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#94a3b8",
  fontSize: 12,
  marginBottom: 4,
};
const nameStyle: React.CSSProperties = {
  color: "#e5e7eb",
  fontWeight: 700,
  fontSize: 13,
  letterSpacing: 0.3,
};
const separatorStyle: React.CSSProperties = { color: "#334155" };
const vsStyle: React.CSSProperties = { color: "#60a5fa", fontWeight: 600 };
const branchStyle = (o: string): React.CSSProperties => ({
  color: o === "offenseWins" ? "#22c55e" : "#f97316",
  fontWeight: 600,
});
const descriptionStyle: React.CSSProperties = {
  color: "#f1f5f9",
  fontSize: 16,
  lineHeight: 1.35,
  fontWeight: 500,
};
