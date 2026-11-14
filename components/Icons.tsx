/**
 * Inline stroke icons, same geometry as the design canvas. Decorative by
 * default; pass a `label` when an icon is the only content of a control and
 * there is no aria-label on the control itself.
 */
export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  label?: string;
  style?: React.CSSProperties;
}

function Svg({
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
  label,
  style,
  children,
  fill = "none",
}: IconProps & { children: React.ReactNode; fill?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={fill === "none" ? color : "none"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);

export const IconDumbbell = (p: IconProps) => (
  <Svg strokeWidth={1.8} {...p}>
    <path d="M4 9v6" />
    <path d="M2 8v8" />
    <path d="M6 10v4" />
    <path d="M18 10v4" />
    <path d="M22 8v8" />
    <path d="M20 9v6" />
    <path d="M8 12h8" />
  </Svg>
);

export const IconTrend = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="15 7 21 7 21 13" />
  </Svg>
);

export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg strokeWidth={2.4} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg strokeWidth={3} {...p}>
    <polyline points="5 13 9.5 17.5 19 7" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="9 6 15 12 9 18" />
  </Svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <Svg {...p}>
    <polyline points="15 6 9 12 15 18" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg strokeWidth={2.3} {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <line x1="20.5" y1="20.5" x2="16.3" y2="16.3" />
  </Svg>
);

export const IconSliders = (p: IconProps) => (
  <Svg strokeWidth={1.8} {...p}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <circle cx="9" cy="6" r="2" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <circle cx="15" cy="12" r="2" />
    <line x1="4" y1="18" x2="20" y2="18" />
    <circle cx="7" cy="18" r="2" />
  </Svg>
);

export const IconPin = (p: IconProps) => (
  <Svg strokeWidth={1.9} {...p}>
    <path d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.6" />
  </Svg>
);

export const IconX = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </Svg>
);

export const IconSwap = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 7h9l-3-3" />
    <path d="M16 17H7l3 3" />
  </Svg>
);

export const IconTrophy = (p: IconProps) => (
  <Svg strokeWidth={1.9} {...p}>
    <path d="M8 4h8v4a4 4 0 01-8 0V4z" />
    <path d="M8 5H5a3 3 0 003 3" />
    <path d="M16 5h3a3 3 0 01-3 3" />
    <path d="M12 12v4" />
    <path d="M9 20h6" />
  </Svg>
);

export const IconWarning = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l9 17H3l9-17z" />
    <line x1="12" y1="10" x2="12" y2="14" />
    <circle cx="12" cy="17" r="0.6" />
  </Svg>
);

export const IconArrowUp = (p: IconProps) => (
  <Svg strokeWidth={2.2} {...p}>
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </Svg>
);

export const IconFolder = (p: IconProps) => (
  <Svg strokeWidth={1.8} {...p}>
    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </Svg>
);

/** Filled glyphs. */
export const IconFlame = ({ size = 20, color = "#FF5A3C", style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <path d="M12 2c2 4-3 5-3 9a3 3 0 006 0c0-1.2-1-2-1-2 1.1 1.8 3 2.9 3 5.6A5 5 0 016.3 15c0-5.3 3.4-6.6 5.7-13z" />
  </svg>
);

export const IconBolt = ({ size = 18, color = "#FF5A3C", style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <polygon points="13 2 4 14 11 14 9 22 20 10 13 10" />
  </svg>
);

export const IconDots = ({ size = 17, color = "#6A7178", style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);

export const IconGrip = ({ size = 16, color = "#565C63", style }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={{ flexShrink: 0, ...style }}
    aria-hidden
  >
    <circle cx="9" cy="6" r="1.5" />
    <circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" />
    <circle cx="15" cy="18" r="1.5" />
  </svg>
);

/** The VolFit mark: a loaded bar with the V hanging under it. */
export const IconBrand = ({ size = 21, color = "#0A0C0E" }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <path d="M7 6l5 12 5-12" />
  </svg>
);
