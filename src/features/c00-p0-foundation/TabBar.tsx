'use client';

import Link from 'next/link';

/* ── Icons ─────────────────────────────────────────────────────────────────
   24×24 SVG, stroke-based, no fill. Color is inherited via currentColor so
   active/inactive state is handled purely by the parent's color value.
   No external icon library — deps are locked after C0.
──────────────────────────────────────────────────────────────────────────── */
function IconLog({ active }: { active: boolean }) {
  const w = active ? 2 : 1.5;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Dumbbell */}
      <rect x="2"  y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth={w} />
      <rect x="18" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth={w} />
      <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth={w} strokeLinecap="round" />
    </svg>
  );
}

function IconGym({ active }: { active: boolean }) {
  const w = active ? 2 : 1.5;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Map pin */}
      <path d="M12 2C8.68 2 6 4.68 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.32-2.68-6-6-6z"
        stroke="currentColor" strokeWidth={w} strokeLinejoin="round" />
      <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth={w} />
    </svg>
  );
}

function IconPlan({ active }: { active: boolean }) {
  const w = active ? 2 : 1.5;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Calendar */}
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth={w} />
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth={w} />
      <line x1="8"  y1="2" x2="8"  y2="6" stroke="currentColor" strokeWidth={w} strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth={w} strokeLinecap="round" />
      <circle cx="8"  cy="13" r="1" fill="currentColor" />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
      <circle cx="16" cy="13" r="1" fill="currentColor" />
      <circle cx="8"  cy="17" r="1" fill="currentColor" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function IconMe({ active }: { active: boolean }) {
  const w = active ? 2 : 1.5;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Person */}
      <circle cx="12" cy="7" r="3.5" stroke="currentColor" strokeWidth={w} />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
        stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const TABS = [
  { label: 'Log',  href: '/log',  Icon: IconLog  },
  { label: 'Gym',  href: '/gym',  Icon: IconGym  },
  { label: 'Plan', href: '/plan', Icon: IconPlan },
  { label: 'Me',   href: '/me',   Icon: IconMe   },
] as const;

interface TabBarProps {
  currentPath: string;
}

export default function TabBar({ currentPath }: TabBarProps) {
  return (
    <nav
      className="bg-surface border-t border-hairline"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Main navigation"
    >
      <div className="flex">
        {TABS.map(({ label, href, Icon }) => {
          const active = currentPath === href || currentPath.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              style={{
                height: '56px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                position: 'relative',
                textDecoration: 'none',
                color: active ? 'var(--ink)' : 'var(--ink-muted)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* 2px accent line at the top of the active tab */}
              {active && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '24px',
                    height: '2px',
                    background: 'var(--accent)',
                    borderRadius: '0 0 2px 2px',
                  }}
                />
              )}
              <Icon active={active} />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '0.03em',
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
