'use client';

import { usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';
import TabBar from './TabBar';

/** Module-level store so scroll positions survive route changes without React state. */
const scrollStore = new Map<string, number>();

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevPath = useRef<string>(pathname);

  // /preview is a full-screen tool, not an app route — render bare.
  if (pathname.startsWith('/preview')) {
    return <>{children}</>;
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (prevPath.current !== pathname) {
      // Save position for the page we just left.
      scrollStore.set(prevPath.current, el.scrollTop);
      prevPath.current = pathname;
      // Restore position for the page we just entered.
      el.scrollTop = scrollStore.get(pathname) ?? 0;
    }
  }, [pathname]);

  const handleScroll = () => {
    if (scrollRef.current) {
      scrollStore.set(pathname, scrollRef.current.scrollTop);
    }
  };

  return (
    /*
     * Outer: full-width canvas, centers the column.
     * Inner: 430px column, holds the scrollable content and the pinned tab bar.
     */
    <div className="flex justify-center min-h-screen bg-canvas">
      <div
        className="w-full max-w-shell flex flex-col min-h-screen"
        style={{ position: 'relative' }}
      >
        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
          onScroll={handleScroll}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>

        {/* Tab bar pinned inside the column */}
        <TabBar currentPath={pathname} />
      </div>
    </div>
  );
}
