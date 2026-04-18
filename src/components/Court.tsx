import type { ReactNode } from "react";

// Full-court SVG. Units: 1 ft = 10 SVG units. viewBox 0 0 940 500.
// Left basket center: (53, 250). Right basket center: (887, 250).

type Props = { children?: ReactNode };

const LINE = "#1f2937";
const HARDWOOD = "#f5deb3";

export function Court({ children }: Props) {
  return (
    <svg
      viewBox="0 0 940 500"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block", background: HARDWOOD, borderRadius: 8 }}
    >
      {/* Outer boundary */}
      <rect x={0} y={0} width={940} height={500} fill="none" stroke={LINE} strokeWidth={2} />

      {/* Half-court line */}
      <line x1={470} y1={0} x2={470} y2={500} stroke={LINE} strokeWidth={2} />

      {/* Center circle */}
      <circle cx={470} cy={250} r={60} fill="none" stroke={LINE} strokeWidth={2} />
      <circle cx={470} cy={250} r={20} fill="none" stroke={LINE} strokeWidth={1.5} />

      {/* ----- LEFT HALF ----- */}
      {/* Free throw lane (key): 16ft wide x 19ft deep */}
      <rect x={0} y={170} width={190} height={160} fill="none" stroke={LINE} strokeWidth={2} />
      {/* Free throw circle */}
      <circle cx={190} cy={250} r={60} fill="none" stroke={LINE} strokeWidth={2} />
      {/* Backboard */}
      <line x1={40} y1={220} x2={40} y2={280} stroke={LINE} strokeWidth={3} />
      {/* Rim */}
      <circle cx={53} cy={250} r={7.5} fill="none" stroke="#c53030" strokeWidth={2} />
      {/* Restricted area (4ft semicircle under rim) */}
      <path d="M 53 210 A 40 40 0 0 1 53 290" fill="none" stroke={LINE} strokeWidth={1.5} />
      {/* 3pt corner lines */}
      <line x1={0} y1={30} x2={142} y2={30} stroke={LINE} strokeWidth={2} />
      <line x1={0} y1={470} x2={142} y2={470} stroke={LINE} strokeWidth={2} />
      {/* 3pt arc (bulges right into the court) */}
      <path d="M 142 30 A 237.5 237.5 0 0 1 142 470" fill="none" stroke={LINE} strokeWidth={2} />

      {/* ----- RIGHT HALF ----- */}
      <rect x={750} y={170} width={190} height={160} fill="none" stroke={LINE} strokeWidth={2} />
      <circle cx={750} cy={250} r={60} fill="none" stroke={LINE} strokeWidth={2} />
      <line x1={900} y1={220} x2={900} y2={280} stroke={LINE} strokeWidth={3} />
      <circle cx={887} cy={250} r={7.5} fill="none" stroke="#c53030" strokeWidth={2} />
      <path d="M 887 210 A 40 40 0 0 0 887 290" fill="none" stroke={LINE} strokeWidth={1.5} />
      <line x1={940} y1={30} x2={798} y2={30} stroke={LINE} strokeWidth={2} />
      <line x1={940} y1={470} x2={798} y2={470} stroke={LINE} strokeWidth={2} />
      {/* 3pt arc (bulges left into the court) */}
      <path d="M 798 30 A 237.5 237.5 0 0 0 798 470" fill="none" stroke={LINE} strokeWidth={2} />

      {children}
    </svg>
  );
}
