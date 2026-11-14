'use client';

import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { useSession } from './useSession';
import { useSetLogger } from './useSetLogger';
import { usePrevious } from './usePrevious';
import { useRestTimer } from './useRestTimer';
import { useExercises } from './useExercises';
import { useEquipmentUnits } from './useEquipmentUnits';
import ExercisePicker from './ExercisePicker';
import SetTable from './SetTable';
import StepperBar from './StepperBar';
import PlateCalc from './PlateCalc';
import RestTimerBar from './RestTimerBar';
import type { LocalSet, ExerciseRow } from './types';

/*
 * Layout note: this screen renders inside AppShell's scroll container, which is
 * already 100dvh minus the tab bar. Setting a 100dvh min-height here would push
 * the primary action below the fold on every load, so the root fills its parent
 * instead and the action bar is sticky.
 */

function defaultSessionName(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Morning workout';
  if (h < 17) return 'Afternoon workout';
  return 'Evening workout';
}

export default function LogScreen() {
  const { session, loading: sessionLoading, startSession, endSession } = useSession();
  const { sets, logSet, syncStatus } = useSetLogger(session?.id ?? null);

  const [selectedExId, setSelectedExId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pendingWeight, setPendingWeight] = useState(45);
  const [pendingReps, setPendingReps] = useState(5);
  const [logging, setLogging] = useState(false);
  const [starting, setStarting] = useState(false);

  const { prevSets } = usePrevious(selectedExId, session?.id ?? null);
  const {
    remaining,
    active: timerActive,
    start: startTimer,
    stop: stopTimer,
  } = useRestTimer();
  const { exercises, recentIds } = useExercises();
  const { units, selectedUnitId, setSelectedUnitId } = useEquipmentUnits(selectedExId);

  const selectedEx: ExerciseRow | null = useMemo(
    () => exercises.find((e) => e.id === selectedExId) ?? null,
    [exercises, selectedExId],
  );

  const currentExSets: LocalSet[] = useMemo(
    () => sets.filter((s) => s.exercise_id === selectedExId),
    [sets, selectedExId],
  );

  // On load with existing sets: auto-select the most recently used exercise.
  useEffect(() => {
    if (sets.length > 0 && selectedExId === null) {
      const sorted = [...sets].sort((a, b) => b.logged_at.localeCompare(a.logged_at));
      setSelectedExId(sorted[0].exercise_id);
    }
  }, [sets, selectedExId]);

  // On new session with no sets: open the exercise picker once.
  useEffect(() => {
    if (session && !sessionLoading && sets.length === 0 && selectedExId === null) {
      setPickerOpen(true);
    }
  }, [session, sessionLoading, sets.length, selectedExId]);

  // Prefill the pending set from the previous session.
  useEffect(() => {
    if (!selectedExId) return;
    const nextIdx = currentExSets.length + 1;
    const prev =
      prevSets.find((p) => p.set_index === nextIdx) ?? prevSets[prevSets.length - 1] ?? null;
    if (prev) {
      setPendingWeight(prev.weight);
      setPendingReps(prev.reps);
    } else if (prevSets.length === 0) {
      setPendingWeight(selectedEx?.equipment_class === 'barbell' ? 45 : 0);
      setPendingReps(5);
    }
    // selectedEx resolves asynchronously with the exercises load; including it
    // would re-run this and clobber a value the user just typed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExId, prevSets, currentExSets.length]);

  function handleSelectExercise(exId: string) {
    setSelectedExId(exId);
    setPickerOpen(false);
    const ex = exercises.find((e) => e.id === exId);
    setPendingWeight(ex?.equipment_class === 'barbell' ? 45 : 0);
    setPendingReps(5);
  }

  async function handleLogSet() {
    if (!session || !selectedExId || logging) return;
    setLogging(true);
    await logSet(selectedExId, pendingWeight, pendingReps, selectedUnitId);
    if (selectedEx) startTimer(selectedEx.default_rest_seconds);
    setLogging(false);
  }

  async function handleRepeatLast() {
    if (!session || !selectedExId || logging || currentExSets.length === 0) return;
    setLogging(true);
    const last = currentExSets[currentExSets.length - 1];
    await logSet(selectedExId, last.weight, last.reps, selectedUnitId);
    if (selectedEx) startTimer(selectedEx.default_rest_seconds);
    setLogging(false);
  }

  async function handleStart() {
    if (starting) return;
    setStarting(true);
    const s = await startSession(defaultSessionName());
    setStarting(false);
    if (s) setPickerOpen(true);
  }

  /* ── Resolving ── */
  if (sessionLoading) {
    return <div style={{ minHeight: '100%', background: 'var(--canvas)' }} />;
  }

  /* ── No active session: one tap to start ── */
  if (!session) {
    return (
      <div style={root}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 16px' }}>
          <h1 style={headingStyle}>Ready to lift</h1>
          <p style={{ fontSize: 'var(--text-15)', color: 'var(--ink-muted)', marginTop: 6 }}>
            Your last numbers load as you go.
          </p>
        </div>
        <div style={actionBar}>
          <button onClick={handleStart} disabled={starting} style={primaryBtn}>
            {starting ? 'Starting…' : 'Start workout'}
          </button>
        </div>
      </div>
    );
  }

  /* ── Active session ── */
  const nextSetIdx = currentExSets.length + 1;

  const byExercise = new Map<string, LocalSet[]>();
  for (const s of sets) {
    const arr = byExercise.get(s.exercise_id) ?? [];
    arr.push(s);
    byExercise.set(s.exercise_id, arr);
  }
  const otherExercises = Array.from(byExercise.entries()).filter(
    ([exId]) => exId !== selectedExId,
  );

  return (
    <>
      {pickerOpen && (
        <ExercisePicker
          exercises={exercises}
          recentIds={recentIds}
          selectedId={selectedExId}
          onSelect={handleSelectExercise}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <div style={root}>
        {/* Header */}
        <div style={sessionHeader}>
          <span style={{ fontSize: 'var(--text-15)', color: 'var(--ink-muted)' }}>
            {session.name}
          </span>
          <button onClick={endSession} style={ghostBtn}>
            End
          </button>
        </div>

        <RestTimerBar remaining={remaining} active={timerActive} onSkip={stopTimer} />

        {/* Exercise selector */}
        <button onClick={() => setPickerOpen(true)} style={exerciseBtn}>
          <span style={exerciseName}>{selectedEx ? selectedEx.name : 'Choose exercise'}</span>
          <Chevron />
        </button>

        {/* Set table */}
        <div style={{ flex: 1, padding: '14px 16px 0' }}>
          {selectedExId && (
            <>
              <SetTable
                loggedSets={currentExSets}
                prevSets={prevSets}
                pendingIndex={nextSetIdx}
                pendingWeight={pendingWeight}
                pendingReps={pendingReps}
                onChange={(w, r) => {
                  setPendingWeight(w);
                  setPendingReps(r);
                }}
              />

              <StepperBar
                weight={pendingWeight}
                reps={pendingReps}
                onChange={(w, r) => {
                  setPendingWeight(w);
                  setPendingReps(r);
                }}
              />

              {selectedEx?.equipment_class === 'barbell' && <PlateCalc weight={pendingWeight} />}

              {units.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p style={capStyle}>Equipment</p>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {units.map((u) => {
                      const on = selectedUnitId === u.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUnitId(u.id)}
                          aria-pressed={on}
                          style={{
                            ...chip,
                            background: on ? 'var(--raised)' : 'transparent',
                            color: on ? 'var(--ink)' : 'var(--ink-muted)',
                            borderColor: on ? 'var(--ink-muted)' : 'var(--hairline)',
                          }}
                        >
                          {u.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Earlier exercises this session */}
              {otherExercises.length > 0 && (
                <div style={{ marginTop: 24, borderTop: '1px solid var(--hairline)', paddingTop: 16 }}>
                  <p style={capStyle}>Earlier today</p>
                  {otherExercises.map(([exId, exSets]) => {
                    const ex = exercises.find((e) => e.id === exId);
                    return (
                      <button
                        key={exId}
                        onClick={() => setSelectedExId(exId)}
                        style={earlierRow}
                      >
                        <span style={{ flex: 1, textAlign: 'left', color: 'var(--ink)' }}>
                          {ex?.name ?? 'Exercise'}
                        </span>
                        <span style={{ color: 'var(--ink-muted)', fontSize: 'var(--text-13)' }}>
                          {exSets.length} {exSets.length === 1 ? 'set' : 'sets'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky action bar */}
        <div style={actionBar}>
          {syncStatus === 'error' && (
            <p style={{ fontSize: 'var(--text-13)', color: 'var(--busy)', marginBottom: 8 }}>
              Saved on this device. Will sync when you are back online.
            </p>
          )}
          <button
            onClick={handleLogSet}
            disabled={!selectedExId || logging}
            style={{ ...primaryBtn, opacity: !selectedExId || logging ? 0.5 : 1 }}
          >
            {logging ? 'Logging…' : 'Log set'}
          </button>
          {currentExSets.length > 0 && (
            <button
              onClick={handleRepeatLast}
              disabled={logging}
              style={{ ...secondaryBtn, opacity: logging ? 0.5 : 1, marginTop: 8 }}
            >
              Repeat last set
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function Chevron() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden focusable="false">
      <path
        d="M2.5 4.5L6 8l3.5-3.5"
        fill="none"
        stroke="var(--ink-muted)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const root: CSSProperties = {
  minHeight: '100%',
  background: 'var(--canvas)',
  display: 'flex',
  flexDirection: 'column',
};

const sessionHeader: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
};

const headingStyle: CSSProperties = {
  fontSize: 'var(--text-28)',
  fontWeight: 600,
  color: 'var(--ink)',
  lineHeight: 1.2,
};

const capStyle: CSSProperties = {
  fontSize: 'var(--text-12)',
  fontWeight: 600,
  color: 'var(--ink-muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 8,
};

const exerciseBtn: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '0 16px 14px',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--hairline)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  textAlign: 'left',
  minHeight: 56,
};

const exerciseName: CSSProperties = {
  flex: 1,
  fontSize: 'var(--text-28)',
  fontWeight: 600,
  color: 'var(--ink)',
  lineHeight: 1.2,
};

/* Sticky so the primary action is reachable without scrolling. */
const actionBar: CSSProperties = {
  position: 'sticky',
  bottom: 0,
  background: 'var(--canvas)',
  borderTop: '1px solid var(--hairline)',
  padding: '12px 16px 16px',
};

const primaryBtn: CSSProperties = {
  width: '100%',
  height: 56,
  background: 'var(--accent)',
  color: 'var(--on-accent)',
  border: 'none',
  borderRadius: 8,
  fontSize: 'var(--text-17)',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const secondaryBtn: CSSProperties = {
  width: '100%',
  height: 56,
  background: 'transparent',
  color: 'var(--ink-muted)',
  border: '1px solid var(--hairline)',
  borderRadius: 8,
  fontSize: 'var(--text-17)',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const ghostBtn: CSSProperties = {
  fontSize: 'var(--text-15)',
  color: 'var(--ink-muted)',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '8px 0 8px 16px',
  fontFamily: 'inherit',
  minHeight: 44,
};

const chip: CSSProperties = {
  padding: '0 14px',
  minHeight: 44,
  border: '1px solid var(--hairline)',
  borderRadius: 8,
  fontSize: 'var(--text-13)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
};

const earlierRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  minHeight: 48,
  background: 'transparent',
  border: 'none',
  borderBottom: '1px solid var(--hairline)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 'var(--text-15)',
  padding: 0,
};
