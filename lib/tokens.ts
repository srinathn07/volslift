/**
 * Design tokens lifted verbatim from the VolFit design canvas.
 * Screens use these rather than literal hexes so a theme change is one edit.
 */
export const t = {
  bg: "#0A0C0E",
  bgHeader: "#0E1013",
  surface: "#15181C",
  surface2: "#1C2024",
  surfaceOff: "#111316",
  border: "#262B30",
  borderStrong: "#32383E",
  borderSoft: "#1E2227",
  borderOff: "#1F2429",
  borderAccent: "#2E2420",
  divider: "#242A30",
  text: "#F4F5F6",
  textSoft: "#C7CCD1",
  textDim: "#8B939B",
  textFaint: "#6A7178",
  textOff: "#5B6168",
  accent: "#FF5A3C",
  accentText: "#FF8F79",
  accentSoft: "rgba(255,90,60,0.14)",
  success: "#35D28A",
  successSoft: "rgba(53,210,138,0.12)",
  warning: "#FFB24A",
  warningSoft: "rgba(255,178,74,0.1)",
} as const;

export const muscleTint: Record<string, string> = {
  Chest: "#FF5A3C",
  Back: "#4A90FF",
  Legs: "#35D28A",
  Shoulders: "#C792FF",
  Arms: "#FFB24A",
  Core: "#4A90FF",
};

export const font = {
  display: "'Space Grotesk', sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const radius = {
  card: 16,
  row: 14,
  control: 12,
  input: 9,
} as const;
