"use client";

import { useMemo } from "react";
import { Body, Screen, SectionLabel } from "@/components/Shell";
import { IconDumbbell } from "@/components/Icons";
import { exerciseById } from "@/lib/catalog";
import { SEED_HISTORY } from "@/lib/history";
import { relativeDay } from "@/lib/stats";
import { bestE1rm, tonnage } from "@/lib/strength";
import { font, muscleTint, t } from "@/lib/tokens";
import type { SessionSummary } from "@/lib/types";

interface DayGroup {
  key: string;
  performedAt: number;
  sessions: SessionSummary[];
  volume: number;
}

export default function HistoryPage() {
  const days = useMemo<DayGroup[]>(() => {
    const groups = new Map<string, DayGroup>();
    for (const session of SEED_HISTORY) {
      const key = new Date(session.performedAt).toDateString();
      const existing = groups.get(key);
      if (existing) {
        existing.sessions.push(session);
        existing.volume += tonnage(session.sets);
      } else {
        groups.set(key, {
          key,
          performedAt: session.performedAt,
          sessions: [session],
          volume: tonnage(session.sets),
        });
      }
    }
    return Array.from(groups.values()).sort((a, b) => b.performedAt - a.performedAt);
  }, []);

  return (
    <Screen tabBar>
      <Body padTop={44} gap={16}>
        <h1 style={{ margin: 0, fontFamily: font.display, fontWeight: 700, fontSize: 23 }}>
          History
        </h1>

        <SectionLabel>{days.length} LOGGED SESSIONS</SectionLabel>

        {days.map((day) => (
          <div
            key={day.key}
            style={{
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 16,
              padding: "13px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 11,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14.5, fontWeight: 600 }}>
                {new Date(day.performedAt).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span style={{ fontFamily: font.mono, fontSize: 11.5, color: t.textDim }}>
                {relativeDay(day.performedAt)} · {Math.round(day.volume).toLocaleString()} lb
              </span>
            </div>

            {day.sessions.map((session) => {
              const exercise = exerciseById(session.exerciseId);
              const top = session.sets.reduce(
                (best, set) => (bestE1rm([set]) > bestE1rm([best]) ? set : best),
                session.sets[0],
              );
              return (
                <div
                  key={`${session.exerciseId}-${session.performedAt}`}
                  style={{ display: "flex", alignItems: "center", gap: 11 }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      background: t.surface2,
                      border: "1px solid #2A2F35",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconDumbbell
                      size={16}
                      color={exercise ? muscleTint[exercise.muscle] ?? t.accent : t.accent}
                    />
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 1 }}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>
                      {exercise?.name ?? session.exerciseId}
                    </span>
                    <span style={{ fontFamily: font.mono, fontSize: 11, color: t.textDim }}>
                      {session.sets.length} sets · top{" "}
                      {top.weight === 0 ? "BW" : `${top.weight}`} × {top.reps}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: font.mono,
                      fontSize: 12,
                      color: t.textFaint,
                      flexShrink: 0,
                    }}
                  >
                    {Math.round(bestE1rm(session.sets))} e1RM
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </Body>
    </Screen>
  );
}
