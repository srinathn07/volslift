/**
 * Design tokens — light theme, UTK orange accent.
 */
export const t = {
  bg: "#FFFFFF",
  bgHeader: "#F8F9FA",
  surface: "#F0F2F5",
  surface2: "#E8EAED",
  surfaceOff: "#F5F6F8",
  border: "#D1D5DB",
  borderStrong: "#B8BCC4",
  borderSoft: "#E5E7EB",
  borderOff: "#E8EAED",
  borderAccent: "#FFD5A0",
  divider: "#E5E7EB",
  text: "#111827",
  textSoft: "#374151",
  textDim: "#6B7280",
  textFaint: "#9CA3AF",
  textOff: "#D1D5DB",
  accent: "#FF8200",
  accentText: "#C65F00",
  accentSoft: "rgba(255,130,0,0.10)",
  success: "#16A34A",
  successSoft: "rgba(22,163,74,0.10)",
  warning: "#D97706",
  warningSoft: "rgba(217,119,6,0.10)",
} as const;

export const muscleTint: Record<string, string> = {
  Chest:     "#FF8200",
  Back:      "#2563EB",
  Legs:      "#16A34A",
  Shoulders: "#7C3AED",
  Arms:      "#D97706",
  Core:      "#2563EB",
};

export const font = {
  display: "var(--font-display), sans-serif",
  body:    "var(--font-body), system-ui, sans-serif",
  mono:    "var(--font-mono), monospace",
} as const;

export const radius = {
  card:    16,
  row:     14,
  control: 12,
  input:   9,
} as const;
