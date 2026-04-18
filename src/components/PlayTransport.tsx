import { useSim } from "../store/useSim";
import { findPlay } from "../data/plays";

export function PlayTransport() {
  const activePlayId = useSim((s) => s.activePlayId);
  const outcome = useSim((s) => s.outcome);
  const currentStep = useSim((s) => s.currentStep);
  const isPlaying = useSim((s) => s.isPlaying);
  const playSpeed = useSim((s) => s.playSpeed);
  const play = useSim((s) => s.play);
  const pause = useSim((s) => s.pause);
  const stepForward = useSim((s) => s.stepForward);
  const stepBack = useSim((s) => s.stepBack);
  const rewindPlay = useSim((s) => s.rewindPlay);
  const setPlaySpeed = useSim((s) => s.setPlaySpeed);

  if (!activePlayId) return null;
  const p = findPlay(activePlayId);
  if (!p) return null;

  const steps = p[outcome];
  const total = steps.length;
  const pos = Math.max(0, Math.min(currentStep + 1, total));
  const ended = currentStep >= total - 1;

  return (
    <div style={barStyle}>
      <button style={iconBtn} title="Rewind" onClick={rewindPlay}>⏮</button>
      <button style={iconBtn} title="Step back" onClick={stepBack} disabled={currentStep < 0}>◀◀</button>
      <button
        style={{ ...iconBtn, background: isPlaying ? "#b91c1c" : "#16a34a", borderColor: "transparent", color: "white", minWidth: 52 }}
        title={isPlaying ? "Pause" : "Play"}
        onClick={() => (isPlaying ? pause() : play())}
      >
        {isPlaying ? "❚❚" : ended ? "↺" : "▶"}
      </button>
      <button style={iconBtn} title="Step forward" onClick={stepForward} disabled={ended}>▶▶</button>

      <div style={progressStyle}>
        <div style={progressFillStyle(pos / total)} />
      </div>
      <div style={posLabelStyle}>
        Step {Math.max(0, currentStep + 1)} / {total}
      </div>

      <div style={{ display: "flex", gap: 4, marginLeft: 12 }}>
        {([0.5, 1, 2] as const).map((s) => (
          <button
            key={s}
            onClick={() => setPlaySpeed(s)}
            style={{
              ...speedBtn,
              background: playSpeed === s ? "#2563eb" : "#1f2937",
              color: playSpeed === s ? "white" : "#d1d5db",
              borderColor: playSpeed === s ? "#60a5fa" : "#374151",
            }}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}

const barStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 8,
  marginTop: 10,
  width: "100%",
};
const iconBtn: React.CSSProperties = {
  minWidth: 36,
  height: 32,
  padding: "0 10px",
  background: "#1f2937",
  color: "#e5e7eb",
  border: "1px solid #374151",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 700,
};
const progressStyle: React.CSSProperties = {
  flex: 1,
  height: 6,
  background: "#1f2937",
  borderRadius: 999,
  marginLeft: 12,
  overflow: "hidden",
};
const progressFillStyle = (frac: number): React.CSSProperties => ({
  width: `${Math.max(0, Math.min(1, frac)) * 100}%`,
  height: "100%",
  background: "#60a5fa",
  transition: "width 160ms ease-out",
});
const posLabelStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 12,
  marginLeft: 8,
  whiteSpace: "nowrap",
  minWidth: 78,
  textAlign: "right",
};
const speedBtn: React.CSSProperties = {
  padding: "4px 8px",
  border: "1px solid",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
};
