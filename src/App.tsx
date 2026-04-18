import { useSim } from "./store/useSim";
import { Court } from "./components/Court";
import { OffenseDot, DefenderDot, Ball } from "./components/Players";
import { ControlsPanel } from "./components/ControlsPanel";
import { ZoneOverlays } from "./components/ZoneOverlays";
import { SlideTrails } from "./components/SlideTrails";

export default function App() {
  const offense = useSim((s) => s.offense);
  const defenders = useSim((s) => s.defenders);
  const ballHolder = useSim((s) => s.ballHolder);
  const passTo = useSim((s) => s.passTo);
  const moveOffense = useSim((s) => s.moveOffense);

  const holder = offense.find((p) => p.id === ballHolder) ?? offense[0];

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0b1220" }}>
      <div style={{ flex: 1, padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1400, aspectRatio: "940 / 500" }}>
          <Court>
            <ZoneOverlays />
            <SlideTrails />
            {defenders.map((d) => (
              <DefenderDot key={d.id} d={d} />
            ))}
            {offense.map((p) => (
              <OffenseDot
                key={p.id}
                p={p}
                hasBall={p.id === ballHolder}
                onPass={passTo}
                onMove={moveOffense}
              />
            ))}
            <Ball x={holder.x} y={holder.y} />
          </Court>
        </div>
      </div>
      <ControlsPanel />
    </div>
  );
}
