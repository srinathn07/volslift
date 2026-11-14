'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';
import TabBar from './TabBar';

/** Module-level store so scroll positions survive route changes without React state. */
const scrollStore = new Map<string, number>();

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevPath  = useRef<string>(pathname);

  const [authReady, setAuthReady] = useState(false);
  const [authed,    setAuthed]    = useState(false);

  // Auth guard — subscribe to session changes once on mount.
  useEffect(() => {
    supabase().auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase().auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect unauthenticated users to sign-in (skip public routes).
  const isPublic = pathname.startsWith('/preview') || pathname.startsWith('/sign-in');
  useEffect(() => {
    if (!isPublic && authReady && !authed) {
      router.replace('/sign-in');
    }
  }, [isPublic, authReady, authed, router]);

  // Scroll position preservation.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (prevPath.current !== pathname) {
      scrollStore.set(prevPath.current, el.scrollTop);
      prevPath.current = pathname;
      el.scrollTop = scrollStore.get(pathname) ?? 0;
    }
  }, [pathname]);

  const handleScroll = () => {
    if (scrollRef.current) {
      scrollStore.set(pathname, scrollRef.current.scrollTop);
    }
  };

  // Public routes bypass the shell entirely.
  if (isPublic) return <>{children}</>;

  // Show blank canvas while session resolves to avoid flash.
  if (!authReady || !authed) {
    return <div style={{ minHeight: '100dvh', background: 'var(--canvas)' }} />;
  }

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
