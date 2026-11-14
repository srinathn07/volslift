"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Body, Screen } from "@/components/Shell";
import {
  IconBolt,
  IconBrand,
  IconChevronRight,
  IconDumbbell,
  IconFlame,
  IconPlus,
  IconTrend,
  IconTrophy,
} from "@/components/Icons";
import { gymBusyness } from "@/lib/occupancy";
import { chainDays, formatVolume, relativeDay, weekStats } from "@/lib/stats";
import { useStore } from "@/lib/store";
import { font, t } from "@/lib/tokens";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const router = useRouter();
  const { routines, session, startEmpty, startRoutine, history } = useStore();

  // Re-compute whenever history loads from db.
  const stats  = useMemo(() => weekStats(),  [history]);
  const streak = useMemo(() => chainDays(),  [history]);

  const begin = (routineId?: string) => {
    if (routineId) startRoutine(routineId);
    else startEmpty();
    router.push("/workout");
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <Screen tabBar>
      <Body padTop={44} gap={20}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, background: t.accent,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <IconBrand />
          </div>
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 21, letterSpacing: "-0.01em" }}>
            Vol<span style={{ color: t.accent }}>Fit</span>
          </span>
          <CrowdRing />
        </div>

        {/* Greeting + streak */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h1 style={{ margin: 0, fontFamily: font.display, fontWeight: 700, fontSize: 23 }}>
              {greeting()}
            </h1>
            <span style={{ fontSize: 13, color: t.textDim }}>{today}</span>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            height: 42, alignSelf: "flex-start", boxSizing: "border-box",
            background: t.surface, border: `1px solid ${t.borderAccent}`,
            borderRadius: 12, padding: "0 12px",
          }}>
            <IconFlame size={15} />
            <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 13 }}>{streak}</span>
            <span style={{ fontSize: 11.5, color: t.textDim }}>day streak</span>
          </div>
        </div>

        {/* Start or resume */}
        {session ? (
          <Link
            href="/workout"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: t.accent, borderRadius: 16, padding: "17px 0",
              color: "#FFFFFF", fontFamily: font.display, fontWeight: 700, fontSize: 16.5,
            }}
          >
            Resume {session.name}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => begin()}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              background: t.accent, border: "none", borderRadius: 16, padding: "17px 0",
              color: "#FFFFFF", fontFamily: font.display, fontWeight: 700, fontSize: 16.5,
            }}
          >
            <IconPlus size={20} color="#FFFFFF" />
            Start Workout
          </button>
        )}

        {/* Coach. Deterministic, so it is named for what it does, not for a model. */}
        <Link
          href="/coach"
          style={{
            display: "flex", alignItems: "center", gap: 12,
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 16, padding: "14px 16px",
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: t.accentSoft,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <IconBolt />
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 1 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Coach Smokey</span>
            <span style={{ fontSize: 12, color: t.textDim }}>
              Progression and deload, with the numbers
            </span>
          </div>
          <IconChevronRight size={16} color={t.textFaint} />
        </Link>

        {/* Routines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontFamily: font.display, fontWeight: 700, fontSize: 16 }}>
              Your Routines
            </h2>
            <Link href="/routines/new" style={{ fontSize: 12.5, color: t.accentText, fontWeight: 600 }}>
              New
            </Link>
          </div>

          {routines.length === 0 ? (
            <div style={{
              border: `1px dashed ${t.borderStrong}`, borderRadius: 14, padding: "22px 16px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>No routines yet</span>
              <span style={{ fontSize: 12.5, color: t.textDim, textAlign: "center" }}>
                Create a routine for quick structured workouts.
              </span>
              <Link
                href="/routines/new"
                style={{
                  marginTop: 4, height: 40, padding: "0 18px", borderRadius: 11,
                  background: t.accent, color: "#FFFFFF",
                  display: "flex", alignItems: "center",
                  fontFamily: font.display, fontWeight: 700, fontSize: 14,
                }}
              >
                Create Routine
              </Link>
            </div>
          ) : (
            routines.map((routine) => (
              <button
                key={routine.id}
                type="button"
                onClick={() => begin(routine.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: 14, padding: "13px 14px",
                  textAlign: "left", width: "100%",
                }}
              >
                <div style={{
                  width: 4, height: 34, borderRadius: 2,
                  background: routine.tint ?? t.accent, flexShrink: 0,
                }} />
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 1 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{routine.name}</span>
                  <span style={{ fontSize: 12, color: t.textDim }}>
                    {routine.exercises.length} exercises
                    {routine.lastPerformedAt ? ` · ${relativeDay(routine.lastPerformedAt)}` : ""}
                  </span>
                </div>
                <IconChevronRight size={17} color={t.textFaint} />
              </button>
            ))
          )}
        </div>

        {/* Week stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          <StatTile icon={<IconTrend size={16} color={t.textDim} />}   value={formatVolume(stats.volume)}  label={"lb volume\nthis week"} />
          <StatTile icon={<IconDumbbell size={16} color={t.textDim} />} value={String(stats.workouts)}       label={"workouts\nthis week"} />
          <StatTile icon={<IconTrophy size={16} color={t.textDim} />}   value={String(stats.prs)}            label={"new PRs\nthis week"} />
        </div>
      </Body>
    </Screen>
  );
}

function StatTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`,
      borderRadius: 14, padding: "12px 10px",
      display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start",
    }}>
      {icon}
      <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 16 }}>{value}</span>
      <span style={{ fontSize: 10.5, color: t.textDim, lineHeight: 1.2, whiteSpace: "pre-line" }}>{label}</span>
    </div>
  );
}

/**
 * How busy the gym is right now, as a ring.
 *
 * The arc is the share of stations in use, pooled across the gym. It reads at
 * a glance from across a room, which is the point: the question it answers is
 * "is it worth walking over", asked before you leave the house, so a number
 * you have to stop and parse would be the wrong shape for it.
 *
 * Tapping goes to the gym screen, where the same occupancy is broken down by
 * station.
 */
function CrowdRing() {
  const { gym, occupancy } = useStore();
  const busy = gymBusyness(occupancy.values());

  const SIZE = 42;
  const STROKE = 4;
  const r = (SIZE - STROKE) / 2;
  const circumference = 2 * Math.PI * r;
  const tint =
    busy.level === "busy" ? t.warning : busy.level === "moderate" ? t.accent : t.success;
  const pct = Math.round(busy.ratio * 100);
  const word =
    busy.level === "busy" ? "busy" : busy.level === "moderate" ? "filling up" : "quiet";

  return (
    <Link
      href="/gym"
      aria-label={`${gym.name} is ${word}, ${busy.inUse} of ${busy.total} stations in use`}
      style={{
        marginLeft: "auto",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 8,
        textDecoration: "none",
      }}
    >
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 1,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: tint, lineHeight: 1 }}>
          {word}
        </span>
        <span style={{ fontFamily: font.mono, fontSize: 10, color: t.textFaint, lineHeight: 1 }}>
          {busy.inUse}/{busy.total} in use
        </span>
      </span>

      <span style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
        <svg width={SIZE} height={SIZE} aria-hidden focusable="false">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={r}
            fill="none"
            stroke={t.borderSoft}
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={r}
            fill="none"
            stroke={tint}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - busy.ratio)}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            style={{ transition: "stroke-dashoffset 300ms ease" }}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: font.mono,
            fontSize: 11,
            fontWeight: 700,
            color: t.text,
          }}
        >
          {pct}
        </span>
      </span>
    </Link>
  );
}
