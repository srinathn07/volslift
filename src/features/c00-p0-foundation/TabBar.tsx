'use client';

import Link from 'next/link';

const TABS = [
  { label: 'Log',  href: '/log'  },
  { label: 'Gym',  href: '/gym'  },
  { label: 'Plan', href: '/plan' },
  { label: 'Me',   href: '/me'   },
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
        {TABS.map(({ label, href }) => {
          const active = currentPath === href || currentPath.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              style={{
                // 56px tap target — required for in-session controls per UI_PATTERNS.md
                height: '56px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0',
                position: 'relative',
                textDecoration: 'none',
                color: active ? 'var(--ink)' : 'var(--ink-muted)',
                fontSize: 'var(--text-13)',
                fontWeight: active ? 600 : 400,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* 2px accent marker at the top of the active tab */}
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
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
