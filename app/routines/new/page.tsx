"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Body, Screen, SectionLabel } from "@/components/Shell";
import { IconGrip, IconPlus, IconX } from "@/components/Icons";
import { exerciseById } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { font, t } from "@/lib/tokens";
import type { RoutineExercise } from "@/lib/types";
import type { GeneratedDay } from "@/lib/routineGen";

const DRAFT_KEY = "volfit.routine_draft";

export default function RoutineBuilderPage() {
  return <Suspense><RoutineBuilderContent /></Suspense>;
}

function RoutineBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveRoutine, gym } = useStore();
  const [name, setName] = useState("");
  const [entries, setEntries] = useState<RoutineExercise[]>([]);
  const [restored, setRestored] = useState(false);

  // Generator state.
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<GeneratedDay[] | null>(null);
  const [source, setSource] = useState<"model" | "fallback" | null>(null);

  const generate = async () => {
    if (generating || prompt.trim().length === 0) return;
    setGenerating(true);
    setGenerated(null);
    try {
      const res = await fetch("/api/generate-routine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: prompt, gymId: gym.id }),
      });
      const data = (await res.json()) as { days: GeneratedDay[]; source: "model" | "fallback" };
      setSource(data.source);
      // A single day goes straight into the editor so it can be adjusted
      // before saving. Several days are previewed and saved together, since
      // this screen only edits one routine at a time.
      if (data.days.length === 1) {
        setName(data.days[0].name);
        setEntries(data.days[0].exercises);
        setGenerated(null);
      } else {
        setGenerated(data.days);
      }
    } catch {
      setSource("fallback");
      setGenerated(null);
    } finally {
      setGenerating(false);
    }
  };

  const saveAll = (days: GeneratedDay[]) => {
    days.forEach((d, i) =>
      saveRoutine({ id: `${Date.now()}-${i}`, name: d.name, exercises: d.exercises }),
    );
    sessionStorage.removeItem(DRAFT_KEY);
    router.push("/");
  };

  // Restore draft from sessionStorage on mount.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const { name: n, entries: e } = JSON.parse(raw) as { name: string; entries: RoutineExercise[] };
        if (n) setName(n);
        if (Array.isArray(e) && e.length > 0) setEntries(e);
      }
    } catch { /* corrupt draft — ignore */ }
    setRestored(true);
  }, []);

  // Persist draft whenever name or entries change (after initial restore).
  useEffect(() => {
    if (!restored) return;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ name, entries }));
  }, [name, entries, restored]);

  // Handle ?add=<exerciseId> query param set by the exercises page when
  // returning from "pick for routine" flow.
  const addId = searchParams.get("add");
  useEffect(() => {
    if (!addId || !restored) return;
    setEntries((prev) => {
      if (prev.some((e) => e.exerciseId === addId)) return prev;
      return [...prev, { exerciseId: addId, targetSets: 3, repLow: 8, repHigh: 12 }];
    });
    // Strip the query param so a refresh doesn't re-add the exercise.
    window.history.replaceState(null, "", "/routines/new");
  }, [addId, restored]);

  const move = (index: number, direction: -1 | 1) => {
    const next = [...entries];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setEntries(next);
  };

  const remove = (exerciseId: string) =>
    setEntries((prev) => prev.filter((e) => e.exerciseId !== exerciseId));

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed || entries.length === 0) return;
    saveRoutine({
      id: Date.now().toString(),
      name: trimmed,
      exercises: entries,
    });
    sessionStorage.removeItem(DRAFT_KEY);
    router.push("/");
  };

  const totalSets = entries.reduce((sum, e) => sum + e.targetSets, 0);
  const minutes = Math.round(totalSets * 3.4);
  const muscles = new Set(entries.map((e) => exerciseById(e.exerciseId)?.muscle)).size;

  const canSave = name.trim().length > 0 && entries.length > 0;

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
          onClick={save}
          disabled={!canSave}
          style={{
            height: 36,
            padding: "0 18px",
            borderRadius: 11,
            background: canSave ? t.accent : t.surface2,
            border: "none",
            fontFamily: font.display,
            fontWeight: 700,
            fontSize: 14,
            color: canSave ? t.bg : t.textFaint,
            flexShrink: 0,
          }}
        >
          Save
        </button>
      </div>

      <Body padTop={18} gap={18}>
        {/* Generator. The model proposes; lib/routineGen.ts decides what survives. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label htmlFor="routine-prompt">
            <SectionLabel>DESCRIBE IT</SectionLabel>
          </label>
          <textarea
            id="routine-prompt"
            rows={3}
            placeholder={`e.g. 4 days a week, upper/lower, 45 minutes a session, my left shoulder hates overhead pressing`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{
              boxSizing: "border-box",
              borderRadius: 13,
              background: t.surface,
              border: `1px solid ${t.border}`,
              color: t.text,
              fontFamily: "inherit",
              fontSize: 14,
              lineHeight: 1.5,
              padding: "12px 14px",
              resize: "vertical",
            }}
          />
          <button
            type="button"
            onClick={generate}
            disabled={generating || prompt.trim().length === 0}
            style={{
              height: 46,
              borderRadius: 13,
              border: "none",
              background: prompt.trim().length === 0 ? t.surface2 : t.accent,
              color: prompt.trim().length === 0 ? t.textFaint : t.bg,
              fontFamily: font.display,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            {generating ? "Building…" : "Build it for me"}
          </button>
          <span style={{ fontSize: 11, lineHeight: 1.5, color: t.textFaint }}>
            Only uses exercises {gym.name} can actually load. Sets and rep ranges
            are suggestions; weights come from your own history.
          </span>
          {source === "fallback" ? (
            <span style={{ fontSize: 11.5, lineHeight: 1.45, color: t.warning }}>
              Built from the equipment list rather than your description. Edit it
              below, or try again.
            </span>
          ) : null}
        </div>

        {generated && generated.length > 1 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionLabel>{generated.length} DAYS</SectionLabel>
            {generated.map((d) => (
              <div
                key={d.name}
                style={{
                  background: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 13,
                  padding: "11px 13px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</span>
                {d.exercises.map((e) => (
                  <div
                    key={e.exerciseId}
                    style={{ display: "flex", alignItems: "baseline", gap: 8 }}
                  >
                    <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: t.textSoft }}>
                      {exerciseById(e.exerciseId)?.name ?? e.exerciseId}
                    </span>
                    <span style={{ fontFamily: font.mono, fontSize: 11.5, color: t.textDim }}>
                      {e.targetSets} × {e.repLow}-{e.repHigh}
                    </span>
                  </div>
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={() => saveAll(generated)}
              style={{
                height: 46,
                borderRadius: 13,
                border: "none",
                background: t.accent,
                color: t.bg,
                fontFamily: font.display,
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Save all {generated.length} routines
            </button>
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label htmlFor="routine-name">
            <SectionLabel>ROUTINE NAME</SectionLabel>
          </label>
          <input
            id="routine-name"
            type="text"
            placeholder="e.g. Upper A, Push Day…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              height: 50,
              boxSizing: "border-box",
              borderRadius: 13,
              background: t.surface,
              border: `1px solid ${t.border}`,
              color: t.text,
              fontFamily: font.display,
              fontSize: 17,
              fontWeight: 700,
              padding: "0 14px",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <SectionLabel>EXERCISES · {entries.length}</SectionLabel>
            {entries.length > 0 && (
              <span style={{ fontSize: 11.5, color: t.textFaint }}>Use the arrows to reorder</span>
            )}
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
                    border: `1px solid ${t.border}`,
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

          <button
            type="button"
            onClick={() => router.push("/exercises?for=routine")}
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
              width: "100%",
            }}
          >
            <IconPlus size={17} color={t.accent} />
            Add Exercise
          </button>
        </div>

        {entries.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
            <Estimate value={String(totalSets)} label="working sets" />
            <Estimate value={`~${minutes}`} label="minutes" />
            <Estimate value={String(muscles)} label="muscle groups" />
          </div>
        )}
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
    color: disabled ? t.textOff : t.textFaint,
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
