"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, font } from "@/lib/tokens";
import { IconHome, IconClock, IconTrend, IconUser } from "./Icons";

/**
 * Phone-shaped shell. Fills the viewport on a phone and centres at the design
 * width on a desktop, so the ported screens keep their proportions.
 */
export function Screen({
  children,
  tabBar = false,
}: {
  children: React.ReactNode;
  tabBar?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: t.bg,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: t.bg,
          position: "relative",
          paddingBottom: tabBar ? 78 : 0,
        }}
      >
        {children}
        {tabBar ? <TabBar /> : null}
      </div>
    </div>
  );
}

/** Scrolling body region, with the safe-area top padding the screens expect. */
export function Body({
  children,
  padTop = 40,
  gap = 18,
  padBottom = 24,
}: {
  children: React.ReactNode;
  padTop?: number;
  gap?: number;
  padBottom?: number;
}) {
  return (
    <div
      className="volfit-scroll"
      style={{
        flex: "1 1 auto",
        overflowY: "auto",
        padding: `calc(${padTop}px + env(safe-area-inset-top)) 16px ${padBottom}px 16px`,
        display: "flex",
        flexDirection: "column",
        gap,
      }}
    >
      {children}
    </div>
  );
}

export function Header({
  title,
  subtitle,
  back,
  right,
  children,
}: {
  title?: string;
  subtitle?: string;
  back?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: t.bgHeader,
        borderBottom: `1px solid ${t.borderSoft}`,
        padding: "calc(16px + env(safe-area-inset-top)) 16px 12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        {back ? (
          <Link
            href={back}
            aria-label="Go back"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: t.surface2,
              border: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconChevronLeftSmall />
          </Link>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 1 }}>
          {title ? (
            <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18 }}>{title}</span>
          ) : null}
          {subtitle ? (
            <span style={{ fontSize: 11.5, color: t.textDim }}>{subtitle}</span>
          ) : null}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function IconChevronLeftSmall() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke={t.textSoft}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="15 6 9 12 15 18" />
    </svg>
  );
}

const TABS = [
  { href: "/",        label: "Home",     Icon: IconHome  },
  { href: "/history", label: "History",  Icon: IconClock },
  { href: "/progress",label: "Progress", Icon: IconTrend },
  { href: "/profile", label: "Profile",  Icon: IconUser  },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        maxWidth: 430,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        height: 78,
        paddingBottom: "calc(10px + env(safe-area-inset-bottom))",
        boxSizing: "border-box",
        background: t.bgHeader,
        borderTop: `1px solid ${t.borderSoft}`,
      }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 10px",
            }}
          >
            <Icon size={21} color={active ? t.accent : t.textFaint} />
            <span
              style={{
                fontSize: 10.5,
                fontWeight: active ? 600 : 400,
                color: active ? t.accent : t.textFaint,
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Small label used above sections. */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: "0.07em",
        color: t.textDim,
      }}
    >
      {children}
    </span>
  );
}
