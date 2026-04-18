import { useSim } from "../store/useSim";
import { DEFENSE_KEYS, DEFENSE_LABEL, type DefenseKey } from "../data/defenseSlides";
import { FORMATION_KEYS, type FormationKey } from "../data/formations";

const FORMATION_LABEL: Record<FormationKey, string> = {
  "5-out": "5-Out",
  "1-4-high": "1-4 High",
  "1-3-1": "1-3-1",
  "horns": "Horns",
  "box": "Box",
};

export function ControlsPanel() {
  const activeDefense = useSim((s) => s.activeDefense);
  const activeFormation = useSim((s) => s.activeFormation);
  const ballZone = useSim((s) => s.ballZone);
  const onLeftHalf = useSim((s) => s.onLeftHalf);
  const showShotQuality = useSim((s) => s.showShotQuality);
  const showZones = useSim((s) => s.showZones);
  const setDefense = useSim((s) => s.setDefense);
  const setFormation = useSim((s) => s.setFormation);
  const reset = useSim((s) => s.reset);
  const toggleShotQuality = useSim((s) => s.toggleShotQuality);
  const toggleZones = useSim((s) => s.toggleZones);

  return (
    <aside style={panelStyle}>
      <h2 style={titleStyle}>Zone Defense Simulator</h2>
      <p style={subtitleStyle}>
        Drag green dots to position offense. Click a green dot to pass — blue
        defenders auto-slide to their zone rules.
      </p>

      <Section title="Defense">
        <div style={gridStyle}>
          {DEFENSE_KEYS.map((d) => (
            <Pill
              key={d}
              active={activeDefense === d}
              onClick={() => setDefense(d as DefenseKey)}
              label={DEFENSE_LABEL[d]}
            />
          ))}
        </div>
      </Section>

      <Section title="Offensive Set">
        <div style={gridStyle}>
          {FORMATION_KEYS.map((f) => (
            <Pill
              key={f}
              active={activeFormation === f}
              onClick={() => setFormation(f as FormationKey)}
              label={FORMATION_LABEL[f]}
            />
          ))}
        </div>
      </Section>

      <Section title="Ball Status">
        <dl style={dlStyle}>
          <dt>Zone</dt><dd>{ballZone}</dd>
          <dt>Side</dt><dd>{onLeftHalf ? "Left half" : "Right half"}</dd>
        </dl>
      </Section>

      <Section title="Teaching Aids">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={toggleZones}
            style={{
              ...toggleStyle,
              background: showZones ? "#2563eb" : "#1f2937",
              color: showZones ? "white" : "#d1d5db",
              borderColor: showZones ? "#60a5fa" : "#374151",
            }}
          >
            {showZones ? "✓ " : ""}Zone Responsibilities
          </button>
          <button
            onClick={toggleShotQuality}
            style={{
              ...toggleStyle,
              background: showShotQuality ? "#2563eb" : "#1f2937",
              color: showShotQuality ? "white" : "#d1d5db",
              borderColor: showShotQuality ? "#60a5fa" : "#374151",
            }}
          >
            {showShotQuality ? "✓ " : ""}Shot-Quality Rings
          </button>
        </div>
        {showShotQuality && (
          <div style={qualityLegendStyle}>
            <span><span style={{ ...dotStyle, background: "#22c55e" }} /> contested</span>
            <span><span style={{ ...dotStyle, background: "#eab308" }} /> guarded</span>
            <span><span style={{ ...dotStyle, background: "#ef4444" }} /> open</span>
          </div>
        )}
      </Section>

      <button style={resetStyle} onClick={reset}>Reset Positions</button>

      <footer style={footerStyle}>
        <strong>Legend:</strong>
        <div style={legendStyle}>
          <span style={{ ...dotStyle, background: "#22c55e" }} /> Offense (O1–O5)
        </div>
        <div style={legendStyle}>
          <span style={{ ...dotStyle, background: "#2563eb" }} /> Defense (X1–X5)
        </div>
        <div style={legendStyle}>
          <span style={{ ...dotStyle, background: "#ea580c", width: 12, height: 12 }} /> Ball
        </div>
      </footer>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <h3 style={h3Style}>{title}</h3>
      {children}
    </section>
  );
}

function Pill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...pillStyle,
        background: active ? "#2563eb" : "#1f2937",
        color: active ? "white" : "#d1d5db",
        borderColor: active ? "#60a5fa" : "#374151",
      }}
    >
      {label}
    </button>
  );
}

const panelStyle: React.CSSProperties = {
  width: 280,
  background: "#0b1220",
  color: "#e5e7eb",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  fontFamily: "system-ui, -apple-system, sans-serif",
  overflowY: "auto",
};
const titleStyle: React.CSSProperties = { fontSize: 18, margin: 0, marginBottom: 4, color: "#fff" };
const subtitleStyle: React.CSSProperties = { fontSize: 12, color: "#94a3b8", marginTop: 0, marginBottom: 18, lineHeight: 1.4 };
const h3Style: React.CSSProperties = { fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", margin: "0 0 8px" };
const gridStyle: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6 };
const pillStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid",
  fontSize: 12,
  cursor: "pointer",
  fontWeight: 600,
};
const dlStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  gap: "4px 12px",
  margin: 0,
  fontSize: 13,
};
const toggleStyle: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  width: "100%",
};
const qualityLegendStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 11,
  color: "#94a3b8",
  marginTop: 8,
};
const resetStyle: React.CSSProperties = {
  padding: "8px 12px",
  background: "#1f2937",
  color: "#e5e7eb",
  border: "1px solid #374151",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
  marginTop: 8,
};
const footerStyle: React.CSSProperties = { marginTop: "auto", paddingTop: 16, fontSize: 12, color: "#94a3b8" };
const legendStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, marginTop: 4 };
const dotStyle: React.CSSProperties = { width: 14, height: 14, borderRadius: "50%", display: "inline-block" };
