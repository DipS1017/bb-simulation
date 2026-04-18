import { useSim, type DefenderId } from "../store/useSim";
import {
  ZONE_AREAS,
  ZONE_COLORS,
  mirrorPolygon,
  polygonCentroid,
  type ZonePolygon,
} from "../data/zoneAreas";

const DEFENDER_IDS: DefenderId[] = ["X1", "X2", "X3", "X4", "X5"];

function toPointsAttr(poly: ZonePolygon): string {
  return poly.map(([x, y]) => `${x},${y}`).join(" ");
}

export function ZoneOverlays() {
  const showZones = useSim((s) => s.showZones);
  const activeDefense = useSim((s) => s.activeDefense);
  const onLeftHalf = useSim((s) => s.onLeftHalf);

  if (!showZones) return null;

  const areas = ZONE_AREAS[activeDefense];

  return (
    <g pointerEvents="none">
      {DEFENDER_IDS.map((id) => {
        const raw = areas[id];
        const poly = onLeftHalf ? mirrorPolygon(raw) : raw;
        const [cx, cy] = polygonCentroid(poly);
        return (
          <g key={id}>
            <polygon
              points={toPointsAttr(poly)}
              fill={ZONE_COLORS[id]}
              fillOpacity={0.14}
              stroke={ZONE_COLORS[id]}
              strokeOpacity={0.45}
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              fill={ZONE_COLORS[id]}
              fillOpacity={0.55}
              fontSize={32}
              fontWeight={800}
              style={{ userSelect: "none" }}
            >
              {id}
            </text>
          </g>
        );
      })}
    </g>
  );
}
