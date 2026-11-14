"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Screen } from "@/components/Shell";
import { IconCheck, IconDots, IconPlus, IconSwap, IconX } from "@/components/Icons";
import { substituteFor, substitutesForBusy, type SwapCandidate } from "@/lib/availability";
import { equipmentName, exerciseById } from "@/lib/catalog";
import { busyLevel, shouldOfferSwap, type OccupancySnapshot } from "@/lib/occupancy";
import { formatClock, useElapsed, useStore, type ActiveExercise } from "@/lib/store";
import { font, muscleTint, t } from "@/lib/tokens";

const GRID = "28px 1fr 64px 52px 34px";
const REST_OPTIONS = [30, 60, 90, 120, 0];

export default function WorkoutPage() {
  const router = useRouter();
  const store = useStore();
  const { session, tonnage, finish, gymCtx, swapExercise, rest, occupancy } = store;
  const elapsed = useElapsed(session?.startedAt ?? null);
  const [dismissedSwapIds, setDismissedSwapIds] = useState<Set<string>>(new Set());

  if (!session) {
    return (
      <Screen>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            padding: 24,
          }}
        >
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18 }}>
            No workout running
          </span>
          <span style={{ fontSize: 13.5, color: t.textDim, textAlign: "center" }}>
            Start one from home, or pick a routine.
          </span>
          <Link
            href="/"
            style={{
              marginTop: 4,
              height: 48,
              padding: "0 22px",
              borderRadius: 13,
              background: t.accent,
              color: t.bg,
              display: "flex",
              alignItems: "center",
              fontFamily: font.display,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Back to home
          </Link>
        </div>
      </Screen>
    );
  }

  const onFinish = () => {
    finish();
    router.push("/");
  };

  return (
    <Screen>
      {/* Sticky header */}
      <div
        style={{
          flexShrink: 0,
          background: t.bgHeader,
          borderBottom: `1px solid ${t.borderSoft}`,
          padding: "calc(14px + env(safe-area-inset-top)) 16px 14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 3 }}>
          <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 18 }}>
            {session.name}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: t.success,
                flexShrink: 0,
              }}
            />
            <span style={{ fontFamily: font.mono, fontWeight: 600, fontSize: 14, color: t.textSoft }}>
              {formatClock(elapsed)}
            </span>
            <span style={{ fontSize: 12, color: t.textFaint }}>
              · {tonnage.toLocaleString()} lb
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onFinish}
          style={{
            height: 38,
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
          Finish
        </button>
      </div>

      {/* Exercises */}
      <div
        className="volfit-scroll"
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          padding: "16px 16px 104px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {session.exercises.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${t.borderStrong}`,
              borderRadius: 16,
              padding: "28px 20px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>Nothing logged yet</span>
            <span style={{ fontSize: 12.5, color: t.textDim, textAlign: "center" }}>
              Add an exercise to start.
            </span>
          </div>
        ) : (
          session.exercises.map((ex) => {
            const available = gymCtx.availableIds.has(ex.exerciseId);
            const exercise = exerciseById(ex.exerciseId);

            if (!available) {
              const sub = exercise ? substituteFor(exercise, gymCtx) : null;
              return (
                <UnavailableCard
                  key={ex.exerciseId}
                  exerciseId={ex.exerciseId}
                  substituteId={sub?.id ?? null}
                  onSwap={swapExercise}
                />
              );
            }

            const equipSnap = exercise ? occupancy.get(exercise.equipment) : undefined;
            const offerSwap = equipSnap
              ? shouldOfferSwap(equipSnap, rest.duration)
              : false;
            const dismissed = dismissedSwapIds.has(ex.exerciseId);
            const candidates =
              offerSwap && exercise && !dismissed
                ? substitutesForBusy(exercise, gymCtx, occupancy)
                : [];

            return (
              <div
                key={ex.exerciseId}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <ExerciseCard active={ex} />
                {equipSnap && <OccupancyMeter snap={equipSnap} />}
                {offerSwap && !dismissed && candidates.length > 0 && (
                  <SwapOfferCard
                    exerciseId={ex.exerciseId}
                    candidates={candidates}
                    sessionName={session.name}
                    onSwap={swapExercise}
                    onDismiss={() =>
                      setDismissedSwapIds((prev) => new Set([...prev, ex.exerciseId]))
                    }
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add exercise */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          width: "100%",
          maxWidth: 430,
          boxSizing: "border-box",
          padding: "14px 16px calc(22px + env(safe-area-inset-bottom)) 16px",
          background: `linear-gradient(to top, ${t.bg} 55%, rgba(255,255,255,0))`,
        }}
      >
        <Link
          href="/exercises"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            height: 50,
            borderRadius: 14,
            background: t.surface2,
            border: `1px solid ${t.borderStrong}`,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          <IconPlus size={18} color={t.accent} />
          Add Exercise
        </Link>
      </div>

      <RestSheet />
    </Screen>
  );
}

function UnavailableCard({
  exerciseId,
  substituteId,
  onSwap,
}: {
  exerciseId: string;
  substituteId: string | null;
  onSwap: (oldId: string, newId: string) => void;
}) {
  const exercise = exerciseById(exerciseId);
  const substitute = substituteId ? exerciseById(substituteId) : null;
  if (!exercise) return null;

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: "14px 13px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: t.warningSoft,
            border: `1px solid ${t.warning}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconSwap size={17} color={t.warning} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 1 }}>
          <span style={{ fontSize: 14.5, fontWeight: 600 }}>{exercise.name}</span>
          <span style={{ fontSize: 12, color: t.warning }}>Not available at this gym</span>
        </div>
      </div>

      {substitute ? (
        <button
          type="button"
          onClick={() => onSwap(exerciseId, substitute.id)}
          style={{
            height: 40,
            borderRadius: 11,
            background: t.accentSoft,
            border: `1px solid ${t.borderAccent}`,
            color: t.accentText,
            fontSize: 13.5,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <IconSwap size={15} color={t.accent} />
          Swap to {substitute.name}
        </button>
      ) : (
        <span style={{ fontSize: 12.5, color: t.textDim }}>
          No substitute available — remove this exercise or add your own.
        </span>
      )}
    </div>
  );
}

function ExerciseCard({ active }: { active: ActiveExercise }) {
  const { addSet, updateSet, toggleSetDone, removeExercise, previousFor } = useStore();
  const exercise = exerciseById(active.exerciseId);
  if (!exercise) return null;
  const tint = muscleTint[exercise.muscle] ?? t.accent;

  return (
    <div
      style={{
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        padding: "14px 12px 10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "0 2px" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: t.surface2,
            border: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width={19}
            height={19}
            viewBox="0 0 24 24"
            fill="none"
            stroke={tint}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 9v6" />
            <path d="M2 8v8" />
            <path d="M6 10v4" />
            <path d="M18 10v4" />
            <path d="M22 8v8" />
            <path d="M20 9v6" />
            <path d="M8 12h8" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, gap: 1 }}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>{exercise.name}</span>
          <span style={{ fontSize: 11.5, color: t.textDim }}>
            {exercise.equipment === "bodyweight" ? "Bodyweight" : equipmentLabel(exercise.equipment)} ·{" "}
            {exercise.muscle}
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeExercise(active.exerciseId)}
          aria-label={`Remove ${exercise.name} from this workout`}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            padding: 0,
          }}
        >
          <IconDots />
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRID,
          gap: 6,
          alignItems: "center",
          padding: "0 2px",
        }}
      >
        <HeadCell center>SET</HeadCell>
        <HeadCell>PREVIOUS</HeadCell>
        <HeadCell center>LB</HeadCell>
        <HeadCell center>REPS</HeadCell>
        <span />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {active.sets.map((set, index) => (
          <div
            key={set.clientId}
            style={{
              display: "grid",
              gridTemplateColumns: GRID,
              gap: 6,
              alignItems: "center",
              padding: "3px 2px",
              borderRadius: 10,
              background: set.done ? "rgba(22,163,74,0.07)" : "transparent",
            }}
          >
            <span
              style={{
                fontFamily: font.mono,
                fontWeight: 600,
                fontSize: 13,
                color: t.textSoft,
                textAlign: "center",
              }}
            >
              {index + 1}
            </span>
            <span style={{ fontFamily: font.mono, fontSize: 12.5, color: t.textFaint }}>
              {previousFor(active.exerciseId, index + 1)}
            </span>
            <NumberField
              value={set.weight}
              label={`Weight, set ${index + 1} of ${exercise.name}`}
              onChange={(weight) => updateSet(active.exerciseId, set.clientId, { weight })}
            />
            <NumberField
              value={set.reps}
              label={`Reps, set ${index + 1} of ${exercise.name}`}
              onChange={(reps) => updateSet(active.exerciseId, set.clientId, { reps })}
            />
            <button
              type="button"
              onClick={() => toggleSetDone(active.exerciseId, set.clientId)}
              aria-pressed={set.done}
              aria-label={`${set.done ? "Undo" : "Mark"} set ${index + 1} of ${exercise.name}`}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: set.done ? t.success : t.surface2,
                border: `1px solid ${set.done ? t.success : t.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                transition: "background 120ms ease",
              }}
            >
              <IconCheck size={15} color={set.done ? t.bg : t.textFaint} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addSet(active.exerciseId)}
        style={{
          height: 36,
          borderRadius: 10,
          background: "none",
          border: `1px dashed ${t.borderStrong}`,
          color: t.textDim,
          fontSize: 12.5,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <IconPlus size={14} color={t.textDim} />
        Add Set
      </button>
    </div>
  );
}

function HeadCell({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <span
      style={{
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: t.textFaint,
        textAlign: center ? "center" : "left",
      }}
    >
      {children}
    </span>
  );
}

function NumberField({
  value,
  label,
  onChange,
}: {
  value: string;
  label: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
      style={{
        width: "100%",
        boxSizing: "border-box",
        height: 34,
        borderRadius: 9,
        background: t.surface2,
        border: `1px solid ${t.border}`,
        color: t.text,
        fontFamily: font.mono,
        fontWeight: 600,
        fontSize: 14,
        textAlign: "center",
        padding: 0,
      }}
    />
  );
}

function RestSheet() {
  const { rest, setRestDuration, closeRest } = useStore();
  const elapsed = useElapsed(rest.open ? rest.startedAt : null);
  if (!rest.open) return null;

  const duration = rest.duration || 90;
  const remaining = Math.max(0, duration - elapsed);
  const circumference = 2 * Math.PI * 56;
  const offset = circumference * (1 - remaining / duration);

  return (
    <div
      role="dialog"
      aria-label="Rest timer"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.50)",
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
          borderTop: `1px solid ${t.border}`,
          borderRadius: "24px 24px 0 0",
          padding: "14px 20px calc(26px + env(safe-area-inset-bottom)) 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span style={{ width: 40, height: 4, borderRadius: 2, background: t.borderStrong }} />
        <span style={{ fontFamily: font.display, fontWeight: 700, fontSize: 17 }}>Rest Timer</span>

        <div
          style={{
            position: "relative",
            width: 128,
            height: 128,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width={128}
            height={128}
            viewBox="0 0 128 128"
            aria-hidden
            style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}
          >
            <circle cx="64" cy="64" r="56" fill="none" stroke={t.borderSoft} strokeWidth={8} />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke={remaining === 0 ? t.success : t.accent}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <span style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 28 }}>
              {formatClock(remaining)}
            </span>
            <span style={{ fontSize: 11, color: t.textDim }}>of {formatClock(duration)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "center" }}>
          {REST_OPTIONS.map((seconds) => {
            const selected = rest.duration === seconds;
            return (
              <button
                key={seconds}
                type="button"
                onClick={() => setRestDuration(seconds)}
                aria-pressed={selected}
                style={{
                  height: 38,
                  padding: "0 15px",
                  borderRadius: 19,
                  border: `1px solid ${selected ? t.accent : t.border}`,
                  background: selected ? t.accentSoft : t.surface2,
                  color: selected ? t.accentText : t.textSoft,
                  fontFamily: font.mono,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {seconds === 0 ? "Custom" : seconds >= 60 ? `${seconds / 60} min` : `${seconds}s`}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            type="button"
            onClick={closeRest}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 13,
              background: t.surface2,
              border: `1px solid ${t.borderStrong}`,
              fontSize: 14.5,
              fontWeight: 600,
              color: t.textSoft,
            }}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={closeRest}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 13,
              background: t.accent,
              border: "none",
              fontFamily: font.display,
              fontSize: 15,
              fontWeight: 700,
              color: t.bg,
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function equipmentLabel(id: string): string {
  return id
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function OccupancyMeter({ snap }: { snap: OccupancySnapshot }) {
  const level = busyLevel(snap);
  const ratio = snap.total > 0 ? Math.min(1, snap.inUse / snap.total) : 0;
  const barColor =
    level === "busy" ? t.warning : level === "moderate" ? t.accent : t.success;
  const name = equipmentName(snap.equipmentId);
  const ariaLabel = `${name}: ${snap.inUse} of ${snap.total} in use`;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "7px 13px",
        background: t.surface,
        border: `1px solid ${t.border}`,
        borderRadius: 11,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 4,
          background: t.borderSoft,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${ratio * 100}%`,
            height: "100%",
            background: barColor,
            borderRadius: 2,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: font.mono,
          fontSize: 11.5,
          color: t.textDim,
          flexShrink: 0,
        }}
      >
        {snap.inUse} of {snap.total} in use
      </span>
    </div>
  );
}

function SwapOfferCard({
  exerciseId,
  candidates,
  sessionName,
  onSwap,
  onDismiss,
}: {
  exerciseId: string;
  candidates: SwapCandidate[];
  sessionName: string;
  onSwap: (oldId: string, newId: string) => void;
  onDismiss: () => void;
}) {
  const [whyOpen, setWhyOpen] = useState(false);
  const [fetchedSentence, setFetchedSentence] = useState<string | null>(null);
  const top = candidates[0];
  if (!top) return null;

  const exercise = exerciseById(exerciseId);
  const displaySentence = fetchedSentence ?? top.evidence;

  const handleWhyToggle = () => {
    setWhyOpen((prev) => {
      const opening = !prev;
      if (opening && !fetchedSentence) {
        void fetch("/api/swap-reason", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateIds: candidates.map((c) => c.exercise.id),
            candidates: candidates.map((c) => ({ id: c.exercise.id, evidence: c.evidence })),
            exerciseName: exercise?.name ?? exerciseId,
            sessionName,
          }),
        })
          .then((r) => r.json() as Promise<{ sentence?: string }>)
          .then((d) => { if (d.sentence) setFetchedSentence(d.sentence); })
          .catch(() => { /* use static evidence */ });
      }
      return opening;
    });
  };

  return (
    <div
      style={{
        background: t.accentSoft,
        border: `1px solid ${t.borderAccent}`,
        borderRadius: 14,
        padding: "12px 13px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: t.accentText }}
        >
          Find a swap
        </span>
        {top.waitMinutes > 0 && (
          <span
            style={{ fontFamily: font.mono, fontSize: 11.5, color: t.textDim }}
          >
            ~{top.waitMinutes} min wait
          </span>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss swap suggestion"
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <IconX size={14} color={t.textFaint} />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onSwap(exerciseId, top.exercise.id)}
        style={{
          height: 42,
          borderRadius: 11,
          background: t.accentSoft,
          border: `1px solid ${t.borderAccent}`,
          color: t.accentText,
          fontSize: 13.5,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 7,
        }}
      >
        <IconSwap size={15} color={t.accent} />
        Swap to {top.exercise.name}
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          type="button"
          onClick={handleWhyToggle}
          aria-expanded={whyOpen}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            fontSize: 12,
            fontWeight: 600,
            color: t.textDim,
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          Why this swap?
          <span style={{ fontSize: 10 }}>{whyOpen ? "▴" : "▾"}</span>
        </button>
        {whyOpen && (
          <span style={{ fontSize: 12, color: t.textDim, lineHeight: 1.5 }}>
            {displaySentence}
          </span>
        )}
      </div>
    </div>
  );
}
