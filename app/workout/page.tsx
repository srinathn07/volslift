"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Screen } from "@/components/Shell";
import { IconCheck, IconDots, IconPlus, IconSliders } from "@/components/Icons";
import { exerciseById } from "@/lib/catalog";
import { formatClock, useElapsed, useStore, type ActiveExercise } from "@/lib/store";
import { font, muscleTint, t } from "@/lib/tokens";

const GRID = "28px 1fr 64px 52px 34px";
const REST_OPTIONS = [30, 60, 90, 120, 0];

export default function WorkoutPage() {
  const router = useRouter();
  const { session, tonnage, finish } = useStore();
  const elapsed = useElapsed(session?.startedAt ?? null);

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
        <Link
          href="/gym"
          aria-label="Workout settings"
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
          <IconSliders size={18} color={t.textSoft} />
        </Link>
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
              Add an exercise to start. The picker only offers what this gym can load.
            </span>
          </div>
        ) : (
          session.exercises.map((ex) => <ExerciseCard key={ex.exerciseId} active={ex} />)
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
          background: `linear-gradient(to top, ${t.bg} 55%, rgba(10,12,14,0))`,
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
            border: "1px solid #2A2F35",
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
              background: set.done ? "rgba(53,210,138,0.07)" : "transparent",
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
                border: `1px solid ${set.done ? t.success : "#2A2F35"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                transition: "background 120ms ease",
              }}
            >
              <IconCheck size={15} color={set.done ? t.bg : "#565C63"} />
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
          border: `1px dashed ${"#2E343A"}`,
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
        border: "1px solid #2A2F35",
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
            <circle cx="64" cy="64" r="56" fill="none" stroke="#242A30" strokeWidth={8} />
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
                  border: `1px solid ${selected ? t.accent : "#2E343A"}`,
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
