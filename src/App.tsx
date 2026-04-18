import { useSim } from "./store/useSim";
import { Court } from "./components/Court";
import { OffenseDot, DefenderDot, Ball } from "./components/Players";
import { ControlsPanel } from "./components/ControlsPanel";
import { ZoneOverlays } from "./components/ZoneOverlays";
import { SlideTrails } from "./components/SlideTrails";
import { PlayBanner } from "./components/PlayBanner";
import { PlayTransport } from "./components/PlayTransport";
import { usePlayRunner } from "./hooks/usePlayRunner";

export default function App() {
  const offense = useSim((s) => s.offense);
  const defenders = useSim((s) => s.defenders);
  const ballHolder = useSim((s) => s.ballHolder);
  const activePlayId = useSim((s) => s.activePlayId);
  const passTo = useSim((s) => s.passTo);
  const moveOffense = useSim((s) => s.moveOffense);

  usePlayRunner();

  const holder = offense.find((p) => p.id === ballHolder) ?? offense[0];
  const interactive = !activePlayId;

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#0b1220" }}>
      <div
        style={{
          flex: 1,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "center",
          gap: 0,
          minWidth: 0,
        }}
      >
        <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto" }}>
          <PlayBanner />
        </div>
        <div
          style={{
            width: "100%",
            maxWidth: 1400,
            margin: "0 auto",
            aspectRatio: "940 / 500",
          }}
        >
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
                interactive={interactive}
                onPass={passTo}
                onMove={moveOffense}
              />
            ))}
            <Ball x={holder.x} y={holder.y} />
          </Court>
        </div>
        <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto" }}>
          <PlayTransport />
        </div>
      </div>
      <ControlsPanel />
    </div>
  );
}
