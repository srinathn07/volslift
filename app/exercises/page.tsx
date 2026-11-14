"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Header, Screen } from "@/components/Shell";
import {
  IconCheck,
  IconDumbbell,
  IconPlus,
  IconSearch,
  IconSwap,
  IconX,
} from "@/components/Icons";
import { queryLibrary, type LibraryRow } from "@/lib/availability";
import { equipmentName } from "@/lib/catalog";
import { historyFor } from "@/lib/history";
import { bestE1rm } from "@/lib/strength";
import { useStore } from "@/lib/store";
import { font, muscleTint, t } from "@/lib/tokens";
import type { Muscle } from "@/lib/types";

const GROUPS: Array<Muscle | "All"> = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export default function ExercisesPage() {
  const router = useRouter();
  const { gym, gymCtx, availableOnly, setAvailableOnly, addExercise, session } = useStore();
  const [muscle, setMuscle] = useState<Muscle | "All">("All");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<LibraryRow | null>(null);

  const rows = useMemo(
    () => queryLibrary(gymCtx, { muscle, search, availableOnly }),
    [availableOnly, gymCtx, muscle, search],
  );

  const onAdd = (row: LibraryRow) => {
    const target = row.available ? row.exercise : row.substitute;
    if (!target) return;
    addExercise(target.id);
    setDetail(null);
    router.push("/workout");
  };

  return (
    <Screen>
      <Header
        back={session ? "/workout" : "/"}
        title="Exercises"
        subtitle={`${gymCtx.totalCount} in library`}
        right={
          <button
            type="button"
            aria-label="Create custom exercise"
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
              padding: 0,
            }}
          >
            <IconPlus size={18} color={t.accent} />
          </button>
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            height: 44,
            borderRadius: 13,
            background: t.surface2,
            border: `1px solid ${t.border}`,
            padding: "0 13px",
          }}
        >
          <IconSearch size={17} color={t.textDim} />
          <input
            type="search"
            aria-label="Search exercises"
            placeholder="Search exercises"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              background: "none",
              border: "none",
              color: t.text,
              fontSize: 14.5,
              padding: 0,
            }}
          />
        </div>

        {/* Gym context */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: "9px 11px",
          }}
        >
          <svg
            width={15}
            height={15}
            viewBox="0 0 24 24"
            fill="none"
            stroke={t.accent}
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            style={{ flexShrink: 0 }}
          >
            <path d="M12 21s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.6" />
          </svg>
          <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600 }}>{gym.name}</span>
          <span
            style={{ fontFamily: font.mono, fontSize: 11, color: t.textDim, flexShrink: 0 }}
          >
            {gymCtx.availableCount} of {gymCtx.totalCount} here
          </span>
          <Link
            href="/gym"
            style={{ fontSize: 11.5, fontWeight: 600, color: t.accentText, flexShrink: 0 }}
          >
            Change
          </Link>
        </div>

        {/* Availability toggle and muscle chips */}
        <div
          className="volfit-scroll"
          style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4 }}
        >
          <button
            type="button"
            onClick={() => setAvailableOnly(!availableOnly)}
            aria-pressed={availableOnly}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 34,
              padding: "0 13px",
              borderRadius: 17,
              border: `1px solid ${availableOnly ? t.success : "#2E343A"}`,
              background: availableOnly ? t.successSoft : t.surface2,
              color: availableOnly ? "#6FE0AC" : t.textSoft,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <IconCheck size={12} color={availableOnly ? t.success : t.textFaint} strokeWidth={3.2} />
            At my gym
          </button>
          <span
            style={{
              width: 1,
              height: 22,
              background: "#2A2F35",
              flexShrink: 0,
              alignSelf: "center",
            }}
          />
          {GROUPS.map((group) => {
            const selected = muscle === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => setMuscle(group)}
                aria-pressed={selected}
                style={{
                  flexShrink: 0,
                  height: 34,
                  padding: "0 14px",
                  borderRadius: 17,
                  border: `1px solid ${selected ? t.accent : "#2E343A"}`,
                  background: selected ? t.accentSoft : t.surface2,
                  color: selected ? t.accentText : t.textSoft,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {group}
              </button>
            );
          })}
        </div>
      </Header>

      <div
        className="volfit-scroll"
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          padding: "10px 16px 24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}
      >
        {rows.length === 0 ? (
          <span style={{ fontSize: 13, color: t.textDim, padding: "20px 4px" }}>
            Nothing matches. Turn off &ldquo;At my gym&rdquo; to see what other equipment would
            unlock.
          </span>
        ) : null}

        {rows.map((row) => {
          const { exercise, available } = row;
          const tint = available ? muscleTint[exercise.muscle] ?? t.accent : "#5B6168";
          const best = bestE1rm(historyFor(exercise.id)[0]?.sets ?? []);
          return (
            <button
              key={exercise.id}
              type="button"
              onClick={() => setDetail(row)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 14,
                padding: "11px 13px",
                textAlign: "left",
                width: "100%",
                background: available ? t.surface : t.surfaceOff,
                border: `1px solid ${available ? t.border : t.borderOff}`,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: available ? t.surface2 : "#16191D",
                  border: `1px solid ${available ? "#2A2F35" : "#23282D"}`,
                }}
              >
                <IconDumbbell size={18} color={tint} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 3 }}>
                <span
                  style={{ fontSize: 14.5, fontWeight: 600, color: available ? t.text : "#9AA1A8" }}
                >
                  {exercise.name}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      borderRadius: 5,
                      padding: "2px 6px",
                      color: available ? t.textSoft : t.textDim,
                      background: available ? "#242A30" : "#1D2126",
                    }}
                  >
                    {exercise.muscle}
                  </span>
                  <span style={{ fontSize: 11.5, color: t.textDim }}>
                    {equipmentName(exercise.equipment)}
                  </span>
                </div>
              </div>
              {available ? (
                <span
                  style={{
                    fontFamily: font.mono,
                    fontSize: 11.5,
                    color: t.textFaint,
                    flexShrink: 0,
                  }}
                >
                  {best > 0 ? `${Math.round(best)} e1RM` : "—"}
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: t.warning,
                    background: t.warningSoft,
                    borderRadius: 6,
                    padding: "3px 7px",
                    flexShrink: 0,
                  }}
                >
                  Not here
                </span>
              )}
            </button>
          );
        })}
      </div>

      {detail ? (
        <DetailSheet row={detail} onClose={() => setDetail(null)} onAdd={() => onAdd(detail)} gymName={gym.name} />
      ) : null}
    </Screen>
  );
}

function DetailSheet({
  row,
  gymName,
  onClose,
  onAdd,
}: {
  row: LibraryRow;
  gymName: string;
  onClose: () => void;
  onAdd: () => void;
}) {
  const { exercise, available, substitute } = row;
  const history = historyFor(exercise.id);
  const points = history
    .slice(0, 8)
    .reverse()
    .map((session, index, all) => {
      const value = bestE1rm(session.sets);
      return { index, value, count: all.length };
    });

  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), max);
  const span = max - min || 1;
  const path = points
    .map((p) => {
      const x = points.length === 1 ? 150 : 12 + (p.index / (points.length - 1)) * 276;
      const y = 78 - ((p.value - min) / span) * 60;
      return `${x.toFixed(0)},${y.toFixed(0)}`;
    })
    .join(" ");

  const gain = points.length > 1 ? Math.round(points[points.length - 1].value - points[0].value) : 0;

  return (
    <div
      role="dialog"
      aria-label={`${exercise.name} detail`}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5,6,8,0.72)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        zIndex: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          margin: "0 auto",
          boxSizing: "border-box",
          background: t.surface,
          borderTop: "1px solid #2A2F35",
          borderRadius: "24px 24px 0 0",
          padding: "14px 20px calc(24px + env(safe-area-inset-bottom)) 20px",
          display: "flex",
          flexDirection: "column",
          gap: 15,
          maxHeight: "88dvh",
          overflowY: "auto",
        }}
        className="volfit-scroll"
      >
        <span
          style={{ width: 40, height: 4, borderRadius: 2, background: t.borderStrong, alignSelf: "center" }}
        />

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 3 }}>
            <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 19 }}>
              {exercise.name}
            </span>
            <span style={{ fontSize: 12.5, color: t.textDim }}>
              {equipmentName(exercise.equipment)} · {exercise.muscle}
              {history.length > 0 ? ` · ${history.length} sessions logged` : " · never logged"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close exercise detail"
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: t.surface2,
              border: "1px solid #2A2F35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              padding: 0,
            }}
          >
            <IconX size={16} color={t.textSoft} />
          </button>
        </div>

        {!available ? (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 11,
              background: "rgba(255,178,74,0.08)",
              border: "1px solid #3D3220",
              borderRadius: 13,
              padding: 12,
            }}
          >
            <IconSwap size={17} color={t.warning} style={{ marginTop: 1 }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, lineHeight: 1.45, color: "#E4C79A" }}>
              {gymName} has no {equipmentName(exercise.equipment).toLowerCase()}.
              {substitute
                ? ` Closest match in your equipment list: ${substitute.name}.`
                : " Nothing in your equipment list covers this movement."}
            </span>
          </div>
        ) : null}

        {points.length > 1 ? (
          <div
            style={{
              background: t.surface2,
              border: "1px solid #2A2F35",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span
                style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: t.textDim }}
              >
                ESTIMATED MAX
              </span>
              <span
                style={{
                  fontFamily: font.mono,
                  fontWeight: 700,
                  fontSize: 14,
                  color: gain >= 0 ? t.success : t.warning,
                }}
              >
                {gain >= 0 ? "+" : ""}
                {gain} lb
              </span>
            </div>
            <svg
              viewBox="0 0 300 92"
              width="100%"
              height={92}
              role="img"
              aria-label={`${exercise.name} estimated max over the last ${points.length} sessions`}
            >
              <line x1="0" y1="78" x2="300" y2="78" stroke="#2E343A" strokeWidth={1} />
              <line
                x1="0"
                y1="42"
                x2="300"
                y2="42"
                stroke="#242A30"
                strokeWidth={1}
                strokeDasharray="3 5"
              />
              <polyline
                points={path}
                fill="none"
                stroke={t.accent}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : null}

        {exercise.cues ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <span
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: t.textDim }}
            >
              FORM CUES
            </span>
            <span style={{ fontSize: 13.5, lineHeight: 1.5, color: t.textSoft }}>{exercise.cues}</span>
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: 50,
              borderRadius: 13,
              background: t.surface2,
              border: `1px solid ${t.borderStrong}`,
              fontSize: 14.5,
              fontWeight: 600,
              color: t.textSoft,
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={onAdd}
            disabled={!available && !substitute}
            style={{
              flex: 2,
              height: 50,
              borderRadius: 13,
              background: !available && !substitute ? t.surface2 : t.accent,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: font.display,
              fontSize: 15,
              fontWeight: 700,
              color: !available && !substitute ? t.textFaint : t.bg,
              padding: "0 10px",
            }}
          >
            {available
              ? "Add to Workout"
              : substitute
                ? `Add ${substitute.name} instead`
                : "No swap available"}
          </button>
        </div>
      </div>
    </div>
  );
}
