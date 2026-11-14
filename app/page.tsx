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
  IconPin,
  IconPlus,
  IconSliders,
  IconTrend,
  IconTrophy,
} from "@/components/Icons";
import { coachCards } from "@/lib/coach";
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
  const { gym, gymCtx, routines, session, startEmpty, startRoutine } = useStore();

  const stats = useMemo(() => weekStats(), []);
  const streak = useMemo(() => chainDays(), []);
  const topCard = useMemo(() => coachCards()[0], []);

  const begin = (routineId?: string) => {
    if (routineId) startRoutine(routineId);
    else startEmpty();
    router.push("/workout");
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <Screen tabBar>
      <Body padTop={44} gap={20}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: t.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconBrand />
          </div>
          <span
            style={{
              fontFamily: font.display,
              fontWeight: 700,
              fontSize: 21,
              letterSpacing: "-0.01em",
            }}
          >
            Vol<span style={{ color: t.accent }}>Fit</span>
          </span>
          <span style={{ flex: 1 }} />
          <Link
            href="/gym"
            aria-label="Settings"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: t.surface,
              border: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconSliders size={19} color={t.textSoft} />
          </Link>
        </div>

        {/* Greeting, gym, streak */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 23,
              }}
            >
              {greeting()}
            </h1>
            <span style={{ fontSize: 13, color: t.textDim }}>{today}</span>
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
            <Link
              href="/gym"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flex: 1,
                minWidth: 0,
                height: 42,
                boxSizing: "border-box",
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                padding: "0 11px",
              }}
            >
              <IconPin size={15} color={t.accent} />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {gym.name}
              </span>
              <span
                style={{
                  fontFamily: font.mono,
                  fontSize: 10.5,
                  color: t.textDim,
                  flexShrink: 0,
                }}
              >
                {gymCtx.availableCount}/{gymCtx.totalCount}
              </span>
              <IconChevronRight size={14} color="#565C63" strokeWidth={2.2} />
            </Link>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                height: 42,
                boxSizing: "border-box",
                background: t.surface,
                border: `1px solid ${t.borderAccent}`,
                borderRadius: 12,
                padding: "0 12px",
              }}
            >
              <IconFlame size={15} />
              <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 13 }}>{streak}</span>
              <span style={{ fontSize: 11.5, color: t.textDim }}>day streak</span>
            </div>
          </div>
        </div>

        {/* Start or resume */}
        {session ? (
          <Link
            href="/workout"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: t.accent,
              borderRadius: 16,
              padding: "17px 0",
              color: t.bg,
              fontFamily: font.display,
              fontWeight: 700,
              fontSize: 16.5,
            }}
          >
            Resume {session.name}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => begin()}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: t.accent,
              border: "none",
              borderRadius: 16,
              padding: "17px 0",
              color: t.bg,
              fontFamily: font.display,
              fontWeight: 700,
              fontSize: 16.5,
            }}
          >
            <IconPlus size={20} color={t.bg} />
            Start Empty Workout
          </button>
        )}

        {/* Coach teaser */}
        {topCard ? (
          <Link
            href="/coach"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: t.surface,
              border: `1px solid ${t.borderAccent}`,
              borderRadius: 16,
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: t.accentSoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconBolt />
            </div>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 1 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>Your AI Coach has a tip</span>
              <span
                style={{
                  fontSize: 12,
                  color: t.textDim,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {topCard.title}
              </span>
            </div>
            <IconChevronRight size={17} color="#565C63" />
          </Link>
        ) : null}

        {/* Routines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontFamily: font.display, fontWeight: 700, fontSize: 16 }}>
              Your Routines
            </h2>
            <Link href="/routines/new" style={{ fontSize: 12.5, color: t.textDim, fontWeight: 600 }}>
              New
            </Link>
          </div>

          {routines.map((routine) => {
            const blocked = routine.exercises.filter(
              (e) => !gymCtx.availableIds.has(e.exerciseId),
            ).length;
            return (
              <button
                key={routine.id}
                type="button"
                onClick={() => begin(routine.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 14,
                  padding: "13px 14px",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 34,
                    borderRadius: 2,
                    background: routine.tint ?? t.accent,
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 1 }}
                >
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{routine.name}</span>
                  <span style={{ fontSize: 12, color: t.textDim }}>
                    {routine.exercises.length} exercises
                    {routine.lastPerformedAt ? ` · ${relativeDay(routine.lastPerformedAt)}` : ""}
                    {blocked > 0 ? ` · ${blocked} not at ${gym.note.toLowerCase()}` : ""}
                  </span>
                </div>
                <IconChevronRight size={17} color="#565C63" />
              </button>
            );
          })}
        </div>

        {/* Week stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          <StatTile
            icon={<IconTrend size={16} color={t.textDim} />}
            value={formatVolume(stats.volume)}
            label={"lb volume\nthis week"}
          />
          <StatTile
            icon={<IconDumbbell size={16} color={t.textDim} />}
            value={String(stats.workouts)}
            label={"workouts\nthis week"}
          />
          <StatTile
            icon={<IconTrophy size={16} color={t.textDim} />}
            value={String(stats.prs)}
            label={"new PRs\nthis week"}
          />
        </div>
      </Body>
    </Screen>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 14,
        padding: "12px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        alignItems: "flex-start",
      }}
    >
      {icon}
      <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 16 }}>{value}</span>
      <span
        style={{
          fontSize: 10.5,
          color: t.textDim,
          lineHeight: 1.2,
          whiteSpace: "pre-line",
        }}
      >
        {label}
      </span>
    </div>
  );
}
