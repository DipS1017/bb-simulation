import { useSim } from "../store/useSim";
import { PLAYS, type Play } from "../data/plays";
import type { DefenseKey } from "../data/defenseSlides";

const DEFENSES_IN_ORDER: DefenseKey[] = ["2-3", "3-2", "1-3-1", "matchup"];

const DEFENSE_HEADING: Record<DefenseKey, string> = {
  "2-3": "vs 2-3 Zone",
  "3-2": "vs 3-2 Zone",
  "1-3-1": "vs 1-3-1 Zone",
  "2-1-2": "vs 2-1-2 Zone",
  "matchup": "vs Matchup / m2m",
};

export function Playbook() {
  const activePlayId = useSim((s) => s.activePlayId);
  const outcome = useSim((s) => s.outcome);
  const loadPlay = useSim((s) => s.loadPlay);
  const setOutcome = useSim((s) => s.setOutcome);
  const exitPlay = useSim((s) => s.exitPlay);

  const grouped: Partial<Record<DefenseKey, Play[]>> = {};
  for (const p of PLAYS) {
    (grouped[p.vsDefense] ??= []).push(p);
  }

  return (
    <section style={{ marginBottom: 18 }}>
      <h3 style={h3Style}>Playbook</h3>

      {activePlayId && (
        <div style={activeBlockStyle}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <OutcomePill
              active={outcome === "offenseWins"}
              label="Offense wins"
              onClick={() => setOutcome("offenseWins")}
            />
            <OutcomePill
              active={outcome === "defenseWins"}
              label="Defense wins"
              onClick={() => setOutcome("defenseWins")}
            />
          </div>
          <button onClick={exitPlay} style={exitStyle}>
            ← Exit Play (back to sandbox)
          </button>
        </div>
      )}

      {DEFENSES_IN_ORDER.map((def) => {
        const plays = grouped[def];
        if (!plays || plays.length === 0) return null;
        return (
          <div key={def} style={{ marginTop: 10 }}>
            <div style={groupTitleStyle}>{DEFENSE_HEADING[def]}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {plays.map((p) => (
                <button
                  key={p.id}
                  title={p.synopsis}
                  onClick={() => loadPlay(p.id)}
                  style={{
                    ...playButtonStyle,
                    background: activePlayId === p.id ? "#2563eb" : "#1f2937",
                    color: activePlayId === p.id ? "white" : "#d1d5db",
                    borderColor: activePlayId === p.id ? "#60a5fa" : "#374151",
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  <span style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
                    {p.synopsis}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function OutcomePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "6px 8px",
        borderRadius: 6,
        border: "1px solid",
        borderColor: active ? "#60a5fa" : "#374151",
        background: active ? "#2563eb" : "#1f2937",
        color: active ? "white" : "#d1d5db",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}

const h3Style: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1,
  color: "#94a3b8",
  margin: "0 0 8px",
};
const groupTitleStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#64748b",
  margin: "4px 0 6px",
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
const playButtonStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid",
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  textAlign: "left",
  fontSize: 13,
};
const activeBlockStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #1f2937",
  borderRadius: 6,
  padding: 8,
  marginBottom: 10,
};
const exitStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  background: "#1f2937",
  color: "#d1d5db",
  border: "1px solid #374151",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
};
