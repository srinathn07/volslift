'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'vl_rest_end_at';

/** Formats remaining seconds as M:SS. Pure function — exported for testing. */
export function formatRestTime(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

export function useRestTimer() {
  const [endAt, setEndAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  // Restore from sessionStorage on mount (survives tab background + hard refresh).
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const end = Number(stored);
      if (end > Date.now()) {
        setEndAt(end);
        setRemaining(Math.ceil((end - Date.now()) / 1000));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Tick every 500 ms so the display feels live.
  useEffect(() => {
    if (endAt === null) return;
    const id = setInterval(() => {
      const r = Math.ceil((endAt - Date.now()) / 1000);
      if (r <= 0) {
        setRemaining(0);
        setEndAt(null);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        setRemaining(r);
      }
    }, 500);
    return () => clearInterval(id);
  }, [endAt]);

  const start = useCallback((seconds: number) => {
    const end = Date.now() + seconds * 1000;
    setEndAt(end);
    setRemaining(seconds);
    sessionStorage.setItem(STORAGE_KEY, String(end));
  }, []);

  const stop = useCallback(() => {
    setEndAt(null);
    setRemaining(0);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return { remaining, active: endAt !== null && remaining > 0, start, stop };
}
