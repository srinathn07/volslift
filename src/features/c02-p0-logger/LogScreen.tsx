'use client';

import { useState, useEffect, useMemo, type CSSProperties } from 'react';
import { useSession }                  from './useSession';
import { useSetLogger }                from './useSetLogger';
import { usePrevious, getPrevForIndex } from './usePrevious';
import { useRestTimer }                from './useRestTimer';
import { useExercises }                from './useExercises';
import { useEquipmentUnits }           from './useEquipmentUnits';
import ExercisePicker  from './ExercisePicker';
import SetEntryPending from './SetEntryPending';
import PlateCalc       from './PlateCalc';
import RestTimerBar    from './RestTimerBar';
import type { LocalSet, ExerciseRow } from './types';

export default function LogScreen() {
  const { session, loading: sessionLoading, startSession, endSession } = useSession();
  const { sets, logSet, syncStatus } = useSetLogger(session?.id ?? null);

  const [selectedExId,   setSelectedExId]   = useState<string | null>(null);
  const [pickerOpen,     setPickerOpen]      = useState(false);
  const [sessionName,    setSessionName]     = useState('Workout');
  const [pendingWeight,  setPendingWeight]   = useState(45);
  const [pendingReps,    setPendingReps]     = useState(5);
  const [logging,        setLogging]         = useState(false);

  const { prevSets }                                     = usePrevious(selectedExId, session?.id ?? null);
  const { remaining, active: timerActive, start: startTimer, stop: stopTimer } = useRestTimer();
  const { exercises, recentIds }                         = useExercises();
  const { units, selectedUnitId, setSelectedUnitId }     = useEquipmentUnits(selectedExId);

  const selectedEx: ExerciseRow | null = useMemo(
    () => exercises.find(e => e.id === selectedExId) ?? null,
    [exercises, selectedExId],
  );

  const currentExSets: LocalSet[] = useMemo(
    () => sets.filter(s => s.exercise_id === selectedExId),
    [sets, selectedExId],
  );

  // On load with existing sets: auto-select the most recently used exercise.
  useEffect(() => {
    if (sets.length > 0 && selectedExId === null) {
      const sorted = [...sets].sort((a, b) => b.logged_at.localeCompare(a.logged_at));
      setSelectedExId(sorted[0].exercise_id);
    }
  }, [sets.length, selectedExId]);

  // On new session with no sets: open the exercise picker once.
  useEffect(() => {
    if (session && !sessionLoading && sets.length === 0 && selectedExId === null) {
      setPickerOpen(true);
    }
  }, [session?.id, sessionLoading, sets.length, selectedExId]);

  // Prefill pending set from previous session whenever exercise / previous data / sets change.
  useEffect(() => {
    if (!selectedExId) return;
    const nextIdx = currentExSets.length + 1;
    const prev    = getPrevForIndex(prevSets, nextIdx);
    if (prev) {
      setPendingWeight(prev.weight);
      setPendingReps(prev.reps);
    } else if (prevSets.length === 0) {
      setPendingWeight(selectedEx?.equipment_class === 'barbell' ? 45 : 0);
      setPendingReps(5);
    }
  // eslint intentionally not exhaustive — selectedEx changes with exercises load
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExId, prevSets, currentExSets.length]);

  function handleSelectExercise(exId: string) {
    setSelectedExId(exId);
    setPickerOpen(false);
    const ex = exercises.find(e => e.id === exId);
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
    const s = await startSession(sessionName || 'Workout');
    if (s) setPickerOpen(true);
  }

  /* ── Loading ── */
  if (sessionLoading) {
    return <div style={{ minHeight: '100dvh', background: 'var(--canvas)' }} />;
  }

  /* ── No session ── */
  if (!session) {
    return (
      <div style={root}>
        <div style={{ padding: '56px 16px 32px' }}>
          <h1 style={headingStyle}>Start a workout</h1>
        </div>
        <div style={{ flex: 1, padding: '0 16px' }}>
          <label style={labelStyle} htmlFor="sname">Session name</label>
          <input
            id="sname"
            type="text"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ padding: '24px 16px 16px' }}>
          <button onClick={handleStart} style={primaryBtn}>
            Start workout
          </button>
        </div>
      </div>
    );
  }

  /* ── Active session ── */
  const nextSetIdx  = currentExSets.length + 1;
  const pendingPrev = getPrevForIndex(prevSets, nextSetIdx);

  // Group all session sets by exercise for the summary.
  const byExercise = new Map<string, LocalSet[]>();
  for (const s of sets) {
    const arr = byExercise.get(s.exercise_id) ?? [];
    arr.push(s);
    byExercise.set(s.exercise_id, arr);
  }

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
          <span style={{ fontSize: 'var(--text-17)', fontWeight: 600, color: 'var(--ink)' }}>
            {session.name}
          </span>
          <button onClick={endSession} style={ghostBtn}>
            End
          </button>
        </div>

        {/* Rest timer */}
        <RestTimerBar remaining={remaining} active={timerActive} onSkip={stopTimer} />

        {/* Exercise selector */}
        <button
          onClick={() => setPickerOpen(true)}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          8,
            width:        '100%',
            padding:      '14px 16px',
            background:   'transparent',
            border:       'none',
            borderBottom: '1px solid var(--hairline)',
            cursor:       'pointer',
            fontFamily:   'inherit',
            textAlign:    'left',
            minHeight:    56,
          }}
        >
          <span
            style={{ flex: 1, fontSize: 'var(--text-22)', fontWeight: 600, color: 'var(--ink)' }}
          >
            {selectedEx ? selectedEx.name : 'Choose exercise'}
          </span>
          <span style={{ fontSize: 'var(--text-15)', color: 'var(--ink-muted)' }}>▾</span>
        </button>

        {selectedExId && (
          <div style={{ padding: '12px 16px 0' }}>
            {/* Logged sets for this exercise */}
            {currentExSets.length > 0 && (
              <LoggedSetList sets={currentExSets} />
            )}

            {/* Pending set entry */}
            <SetEntryPending
              setIndex={nextSetIdx}
              weight={pendingWeight}
              reps={pendingReps}
              prev={pendingPrev}
              onChange={(w, r) => { setPendingWeight(w); setPendingReps(r); }}
            />

            {/* Equipment unit selector */}
            {units.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <span style={{ ...labelStyle, display: 'block', marginBottom: 6 }}>
                  Equipment
                </span>
                <div
                  style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}
                >
                  {units.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUnitId(u.id)}
                      style={{
                        padding:      '8px 14px',
                        background:   selectedUnitId === u.id ? 'var(--accent)' : 'var(--surface)',
                        color:        selectedUnitId === u.id ? 'var(--on-accent)' : 'var(--ink)',
                        border:       '1px solid var(--hairline)',
                        borderRadius: 8,
                        fontSize:     'var(--text-13)',
                        cursor:       'pointer',
                        fontFamily:   'inherit',
                        whiteSpace:   'nowrap',
                        minHeight:    44,
                      }}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Plate calculator */}
            {selectedEx?.equipment_class === 'barbell' && (
              <PlateCalc weight={pendingWeight} />
            )}
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            padding:       '20px 16px 16px',
            display:       'flex',
            flexDirection: 'column',
            gap:           10,
          }}
        >
          {syncStatus === 'error' && (
            <p style={{ fontSize: 'var(--text-13)', color: 'var(--busy)' }}>
              Some sets are queued offline and will sync when connected.
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
              style={{ ...secondaryBtn, opacity: logging ? 0.5 : 1 }}
            >
              Repeat last set
            </button>
          )}
        </div>

        {/* Session summary */}
        {sets.length > 0 && (
          <div
            style={{
              borderTop: '1px solid var(--hairline)',
              padding:   '16px 16px 32px',
            }}
          >
            <SectionCap label="This session" />
            {Array.from(byExercise.entries()).map(([exId, exSets]) => {
              const ex = exercises.find(e => e.id === exId);
              return (
                <div key={exId} style={{ marginBottom: 16 }}>
                  <p
                    style={{
                      fontSize:   'var(--text-15)',
                      fontWeight: 600,
                      color:      'var(--ink)',
                      marginBottom: 6,
                    }}
                  >
                    {ex?.name ?? exId}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {exSets.map(s => (
                      <span
                        key={s.client_uuid}
                        style={{
                          fontSize:           'var(--text-13)',
                          color:              s.synced ? 'var(--ink-muted)' : 'var(--unknown)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {s.weight}×{s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────────── */

function LoggedSetList({ sets }: { sets: LocalSet[] }) {
  return (
    <div style={{ marginBottom: 8 }}>
      {sets.map(s => (
        <div
          key={s.client_uuid}
          style={{
            display:            'flex',
            alignItems:         'center',
            gap:                12,
            padding:            '8px 0',
            borderBottom:       '1px solid var(--hairline)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span
            style={{ fontSize: 'var(--text-13)', color: 'var(--ink-muted)', minWidth: 20 }}
          >
            {s.set_index}
          </span>
          <span style={{ flex: 1, fontSize: 'var(--text-15)', color: 'var(--ink)' }}>
            {s.weight} lb × {s.reps}
          </span>
          <span style={{ fontSize: 11, color: s.synced ? 'var(--free)' : 'var(--unknown)' }}>
            {s.synced ? '✓' : '…'}
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionCap({ label }: { label: string }) {
  return (
    <p
      style={{
        fontSize:      11,
        fontWeight:    600,
        color:         'var(--ink-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
        marginBottom:  12,
      }}
    >
      {label}
    </p>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────────── */

const root: CSSProperties = {
  minHeight:     '100dvh',
  background:    'var(--canvas)',
  display:       'flex',
  flexDirection: 'column',
};

const sessionHeader: CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  padding:        '14px 16px 10px',
  borderBottom:   '1px solid var(--hairline)',
};

const headingStyle: CSSProperties = {
  fontSize:   'var(--text-28)',
  fontWeight: 600,
  color:      'var(--ink)',
  lineHeight: 1.2,
};

const labelStyle: CSSProperties = {
  fontSize: 'var(--text-13)',
  color:    'var(--ink-muted)',
};

const inputStyle: CSSProperties = {
  display:      'block',
  width:        '100%',
  height:       52,
  background:   'var(--surface)',
  border:       '1px solid var(--hairline)',
  borderRadius: 8,
  color:        'var(--ink)',
  fontSize:     'var(--text-15)',
  padding:      '0 16px',
  outline:      'none',
  fontFamily:   'inherit',
  marginTop:    6,
};

const primaryBtn: CSSProperties = {
  width:        '100%',
  height:       56,
  background:   'var(--accent)',
  color:        'var(--on-accent)',
  border:       'none',
  borderRadius: 8,
  fontSize:     'var(--text-17)',
  fontWeight:   600,
  cursor:       'pointer',
  fontFamily:   'inherit',
};

const secondaryBtn: CSSProperties = {
  width:        '100%',
  height:       56,
  background:   'var(--surface)',
  color:        'var(--ink-muted)',
  border:       '1px solid var(--hairline)',
  borderRadius: 8,
  fontSize:     'var(--text-17)',
  fontWeight:   600,
  cursor:       'pointer',
  fontFamily:   'inherit',
};

const ghostBtn: CSSProperties = {
  fontSize:   'var(--text-15)',
  color:      'var(--ink-muted)',
  background: 'transparent',
  border:     'none',
  cursor:     'pointer',
  padding:    '8px 0 8px 16px',
  fontFamily: 'inherit',
  minHeight:  44,
};
