"use client";

import { useMemo, useState } from "react";
import { Body, Screen } from "@/components/Shell";
import { IconTrophy } from "@/components/Icons";
import { exerciseById } from "@/lib/catalog";
import { historyFor } from "@/lib/history";
import { heatmap, personalRecords, relativeDay } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { bestE1rm } from "@/lib/strength";
import { font, t } from "@/lib/tokens";

const HEAT_COLORS = ["#E8EAED", "#FFD599", "#FFB04A", "#FF8200"];

export default function ProgressPage() {
  const { history } = useStore();

  const tracked = useMemo(() => {
    const ids = Array.from(new Set(history.map((s) => s.exerciseId)));
    return ids.filter((id) => historyFor(id).length > 1);
  }, [history]);

  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const selectedId = exerciseId ?? tracked[0] ?? null;

  const cells    = useMemo(() => heatmap(),             [history]);
  const prs      = useMemo(() => personalRecords(30),   [history]);
  const sessions = useMemo(
    () => selectedId ? historyFor(selectedId).slice(0, 8).reverse() : [],
    [selectedId, history],
  );

  const series  = sessions.map((s) => bestE1rm(s.sets));
  const max     = Math.max(...series, 1);
  const min     = Math.min(...series, max);
  const span    = max - min || 1;
  const points  = series.map((value, index) => {
    const x = series.length === 1 ? 160 : 8 + (index / (series.length - 1)) * 304;
    const y = 104 - ((value - min) / span) * 84;
    return `${x.toFixed(0)},${y.toFixed(0)}`;
  }).join(" ");
  const current = series.length > 0 ? Math.round(series[series.length - 1]) : 0;
  const delta   = series.length > 1 ? Math.round(series[series.length - 1] - series[0]) : 0;

  return (
    <Screen tabBar>
      <Body padTop={44} gap={18}>
        <h1 style={{ margin: 0, fontFamily: font.display, fontWeight: 700, fontSize: 23 }}>
          Progress
        </h1>

        {/* Strength chart */}
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 16, padding: "15px 14px 13px 14px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          {tracked.length === 0 ? (
            <span style={{ fontSize: 13.5, color: t.textDim, lineHeight: 1.5 }}>
              Log at least two sessions of any exercise to see a strength trend.
            </span>
          ) : (
            <>
              <div className="volfit-scroll" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
                {tracked.map((id) => {
                  const sel = id === selectedId;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setExerciseId(id)}
                      aria-pressed={sel}
                      style={{
                        flexShrink: 0, height: 32, padding: "0 13px", borderRadius: 16,
                        border: `1px solid ${sel ? t.accent : t.border}`,
                        background: sel ? t.accentSoft : t.surface2,
                        color: sel ? t.accentText : t.textSoft,
                        fontSize: 12.5, fontWeight: 600,
                      }}
                    >
                      {exerciseById(id)?.name ?? id}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: t.textDim }}>EST. 1RM</span>
                  <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 28 }}>{current} lb</span>
                </div>
                {series.length > 1 && (
                  <span style={{
                    fontFamily: font.mono, fontSize: 13, fontWeight: 600, paddingBottom: 5,
                    color: delta >= 0 ? t.success : t.warning,
                  }}>
                    {delta >= 0 ? "+" : ""}{delta} lb
                  </span>
                )}
              </div>

              <svg viewBox="0 0 320 120" width="100%" height={120} role="img"
                aria-label={`${exerciseById(selectedId ?? "")?.name} estimated 1RM trend`}>
                <line x1="0" y1="104" x2="320" y2="104" stroke={t.border} strokeWidth={1} />
                <line x1="0" y1="70" x2="320" y2="70" stroke={t.borderSoft} strokeWidth={1} strokeDasharray="3 5" />
                <line x1="0" y1="36" x2="320" y2="36" stroke={t.borderSoft} strokeWidth={1} strokeDasharray="3 5" />
                {points && (
                  <polyline points={points} fill="none" stroke={t.accent} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {sessions.filter((_, i) => i === 0 || i === sessions.length - 1).map((s) => (
                  <span key={s.performedAt} style={{ fontFamily: font.mono, fontSize: 10.5, color: t.textFaint }}>
                    {new Date(s.performedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Consistency heatmap */}
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: 16, padding: "15px 14px",
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Consistency</span>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: t.textDim }}>
              {cells.filter((c) => c > 0).length} sessions · 16 weeks
            </span>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(16, minmax(0, 1fr))", gap: 4 }}
            role="img"
            aria-label={`Workout consistency heatmap: ${cells.filter((c) => c > 0).length} sessions in the last sixteen weeks`}
          >
            {cells.map((level, index) => (
              <span key={index} style={{ width: "100%", aspectRatio: "1", borderRadius: 3, background: HEAT_COLORS[level] }} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 10.5, color: t.textFaint }}>Less</span>
            {HEAT_COLORS.map((color) => (
              <span key={color} style={{ width: 11, height: 11, borderRadius: 3, background: color }} />
            ))}
            <span style={{ fontSize: 10.5, color: t.textFaint }}>More</span>
          </div>
        </div>

        {/* Personal records */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontFamily: font.display, fontWeight: 700, fontSize: 16 }}>
              Personal Records
            </h2>
            <span style={{ fontSize: 12, color: t.textDim }}>{personalRecords(7).length} this week</span>
          </div>

          {prs.length === 0 ? (
            <div style={{
              background: t.surface, border: `1px solid ${t.border}`,
              borderRadius: 14, padding: "16px 13px",
              fontSize: 13.5, color: t.textDim, lineHeight: 1.5,
            }}>
              PRs appear here once you have at least two logged sessions of the same exercise.
            </div>
          ) : (
            prs.map((pr) => {
              const hot = Date.now() - pr.performedAt < 7 * 24 * 60 * 60 * 1000;
              return (
                <div key={`${pr.exerciseId}-${pr.performedAt}`} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: 14, padding: "12px 13px",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 11, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: hot ? t.accentSoft : t.surface2,
                    border: `1px solid ${hot ? t.borderAccent : t.border}`,
                  }}>
                    <IconTrophy size={17} color={hot ? t.accent : t.textDim} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      {exerciseById(pr.exerciseId)?.name ?? pr.exerciseId}
                    </span>
                    <span style={{ fontSize: 11.5, color: t.textDim }}>
                      {relativeDay(pr.performedAt)} · {pr.topSet.weight === 0 ? "BW" : `${pr.topSet.weight} lb`} × {pr.topSet.reps}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                    <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 14.5 }}>{pr.value}</span>
                    <span style={{ fontFamily: font.mono, fontSize: 11, color: t.success }}>
                      {pr.previous > 0 ? `+${pr.value - pr.previous} lb` : "first log"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Body>
    </Screen>
  );
}
