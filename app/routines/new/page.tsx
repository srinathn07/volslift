"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Body, Screen, SectionLabel } from "@/components/Shell";
import { IconBolt, IconFolder, IconGrip, IconPin, IconPlus, IconX } from "@/components/Icons";
import { ROUTINES, exerciseById } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { font, t } from "@/lib/tokens";
import type { RoutineExercise } from "@/lib/types";

export default function RoutineBuilderPage() {
  const router = useRouter();
  const { gym, gymCtx } = useStore();
  const [name, setName] = useState("Upper Power A");
  const [entries, setEntries] = useState<RoutineExercise[]>(() =>
    ROUTINES[0].exercises.filter((e) => gymCtx.availableIds.has(e.exerciseId)).slice(0, 5),
  );

  const move = (index: number, direction: -1 | 1) => {
    const next = [...entries];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setEntries(next);
  };

  const remove = (exerciseId: string) =>
    setEntries((prev) => prev.filter((e) => e.exerciseId !== exerciseId));

  const totalSets = entries.reduce((sum, e) => sum + e.targetSets, 0);
  const minutes = Math.round(totalSets * 3.4);
  const muscles = new Set(entries.map((e) => exerciseById(e.exerciseId)?.muscle)).size;

  return (
    <Screen>
      <div
        style={{
          flexShrink: 0,
          background: t.bgHeader,
          borderBottom: `1px solid ${t.borderSoft}`,
          padding: "calc(16px + env(safe-area-inset-top)) 16px 14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Link
          href="/"
          aria-label="Cancel and go home"
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
          }}
        >
          <IconX size={16} color={t.textSoft} />
        </Link>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: font.display,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          New Routine
        </span>
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            height: 36,
            padding: "0 18px",
            borderRadius: 11,
            background: t.accent,
            border: "none",
            fontFamily: font.display,
            fontWeight: 700,
            fontSize: 14,
            color: t.bg,
            flexShrink: 0,
          }}
        >
          Save
        </button>
      </div>

      <Body padTop={18} gap={18}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label htmlFor="routine-name">
            <SectionLabel>ROUTINE NAME</SectionLabel>
          </label>
          <input
            id="routine-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              height: 50,
              boxSizing: "border-box",
              borderRadius: 13,
              background: t.surface,
              border: "1px solid #2A2F35",
              color: t.text,
              fontFamily: font.display,
              fontSize: 17,
              fontWeight: 700,
              padding: "0 14px",
            }}
          />
          <div style={{ display: "flex", gap: 9 }}>
            <button
              type="button"
              style={{
                flex: 1,
                height: 42,
                borderRadius: 11,
                background: t.surface,
                border: `1px solid ${t.border}`,
                color: t.textSoft,
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              <IconFolder size={15} color={t.textDim} />
              Push / Pull split
            </button>
            <Link
              href="/coach"
              style={{
                flex: 1,
                height: 42,
                borderRadius: 11,
                background: t.surface,
                border: `1px solid ${t.borderAccent}`,
                color: t.accentText,
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              <IconBolt size={15} />
              Build with AI
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <SectionLabel>EXERCISES · {entries.length}</SectionLabel>
            <span style={{ fontSize: 11.5, color: t.textFaint }}>Use the arrows to reorder</span>
          </div>

          {entries.map((entry, index) => {
            const exercise = exerciseById(entry.exerciseId);
            if (!exercise) return null;
            return (
              <div
                key={entry.exerciseId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 14,
                  padding: "11px 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    aria-label={`Move ${exercise.name} up`}
                    disabled={index === 0}
                    style={arrowStyle(index === 0)}
                  >
                    ▴
                  </button>
                  <IconGrip size={14} />
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    aria-label={`Move ${exercise.name} down`}
                    disabled={index === entries.length - 1}
                    style={arrowStyle(index === entries.length - 1)}
                  >
                    ▾
                  </button>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 3 }}
                >
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{exercise.name}</span>
                  <span style={{ fontFamily: font.mono, fontSize: 12, color: t.textDim }}>
                    {entry.targetWeight ? `${entry.targetWeight} lb · ` : ""}
                    {entry.repLow}–{entry.repHigh} reps
                  </span>
                </div>
                <span
                  style={{
                    height: 32,
                    padding: "0 11px",
                    borderRadius: 9,
                    background: t.surface2,
                    border: "1px solid #2A2F35",
                    color: t.textSoft,
                    fontFamily: font.mono,
                    fontSize: 12,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {entry.targetSets} sets
                </span>
                <button
                  type="button"
                  onClick={() => remove(entry.exerciseId)}
                  aria-label={`Remove ${exercise.name}`}
                  style={{
                    width: 30,
                    height: 32,
                    borderRadius: 9,
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  <IconX size={15} color={t.textFaint} strokeWidth={2.2} />
                </button>
              </div>
            );
          })}

          <Link
            href="/exercises"
            style={{
              height: 48,
              borderRadius: 13,
              background: "none",
              border: `1px dashed ${t.borderStrong}`,
              color: t.text,
              fontSize: 14.5,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <IconPlus size={17} color={t.accent} />
            Add Exercise
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: t.surface,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: "10px 12px",
            }}
          >
            <IconPin size={15} color={t.accent} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 12, lineHeight: 1.4, color: t.textDim }}>
              Picker is limited to the{" "}
              <strong style={{ color: t.textSoft, fontWeight: 600 }}>
                {gymCtx.availableCount} exercises
              </strong>{" "}
              {gym.name} has equipment for.
            </span>
            <Link
              href="/gym"
              style={{ fontSize: 11.5, fontWeight: 600, color: t.accentText, flexShrink: 0 }}
            >
              Change
            </Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
          <Estimate value={String(totalSets)} label="working sets" />
          <Estimate value={`~${minutes}`} label="minutes" />
          <Estimate value={String(muscles)} label="muscle groups" />
        </div>
      </Body>
    </Screen>
  );
}

function arrowStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 24,
    height: 18,
    background: "none",
    border: "none",
    padding: 0,
    color: disabled ? "#2E343A" : t.textFaint,
    fontSize: 12,
    lineHeight: "18px",
  };
}

function Estimate({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 13,
        padding: "12px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 15 }}>{value}</span>
      <span style={{ fontSize: 10.5, color: t.textDim }}>{label}</span>
    </div>
  );
}
