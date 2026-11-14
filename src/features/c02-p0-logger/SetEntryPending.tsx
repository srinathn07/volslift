'use client';

import { useRef, type CSSProperties } from 'react';
import type { PrevSet } from './types';

interface Props {
  setIndex: number;
  weight:   number;
  reps:     number;
  prev:     PrevSet | null;
  onChange: (weight: number, reps: number) => void;
}

const WEIGHT_STEP     = 5;
const WEIGHT_STEP_BIG = 25;
const REPS_STEP       = 1;
const REPS_STEP_BIG   = 5;

export default function SetEntryPending({
  setIndex, weight, reps, prev, onChange,
}: Props) {
  const weightLongRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repsLongRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Long-press helpers ── */
  function startLong(ref: typeof weightLongRef, cb: () => void) {
    ref.current = setTimeout(cb, 400);
  }
  function endLong(ref: typeof weightLongRef, normalCb: () => void) {
    if (ref.current !== null) {
      clearTimeout(ref.current);
      ref.current = null;
      normalCb();
    }
  }
  function cancelLong(ref: typeof weightLongRef) {
    if (ref.current !== null) { clearTimeout(ref.current); ref.current = null; }
  }

  function stepWeight(delta: number) { onChange(Math.max(0, weight + delta), reps); }
  function stepReps(delta: number)   { onChange(weight, Math.max(0, reps + delta)); }

  const prevLabel = prev ? `${prev.weight} × ${prev.reps}` : '—';

  return (
    <div
      style={{
        background:   'var(--raised)',
        borderRadius: 8,
        padding:      '14px 16px',
        marginBottom: 4,
      }}
    >
      {/* Previous row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ ...label13, minWidth: 20, fontVariantNumeric: 'tabular-nums' }}>
          {setIndex}
        </span>
        <span style={label13}>Prev</span>
        <span style={{ ...label13, fontVariantNumeric: 'tabular-nums' }}>
          {prevLabel}
        </span>
      </div>

      {/* Steppers row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
        {/* Weight */}
        <div style={{ flex: 1 }}>
          <span style={{ ...label13, display: 'block', marginBottom: 6 }}>Weight (lb)</span>
          <div style={stepRow}>
            <StepBtn
              label="−"
              onPointerDown={() => startLong(weightLongRef, () => stepWeight(-WEIGHT_STEP_BIG))}
              onPointerUp={() => endLong(weightLongRef, () => stepWeight(-WEIGHT_STEP))}
              onPointerCancel={() => cancelLong(weightLongRef)}
            />
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              min={0}
              step={WEIGHT_STEP}
              onChange={e => {
                const v = parseFloat(e.target.value);
                if (!isNaN(v) && v >= 0) onChange(v, reps);
              }}
              style={numInput}
            />
            <StepBtn
              label="+"
              onPointerDown={() => startLong(weightLongRef, () => stepWeight(WEIGHT_STEP_BIG))}
              onPointerUp={() => endLong(weightLongRef, () => stepWeight(WEIGHT_STEP))}
              onPointerCancel={() => cancelLong(weightLongRef)}
            />
          </div>
        </div>

        {/* Reps */}
        <div style={{ flex: 1 }}>
          <span style={{ ...label13, display: 'block', marginBottom: 6 }}>Reps</span>
          <div style={stepRow}>
            <StepBtn
              label="−"
              onPointerDown={() => startLong(repsLongRef, () => stepReps(-REPS_STEP_BIG))}
              onPointerUp={() => endLong(repsLongRef, () => stepReps(-REPS_STEP))}
              onPointerCancel={() => cancelLong(repsLongRef)}
            />
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              min={0}
              step={REPS_STEP}
              onChange={e => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v >= 0) onChange(weight, v);
              }}
              style={numInput}
            />
            <StepBtn
              label="+"
              onPointerDown={() => startLong(repsLongRef, () => stepReps(REPS_STEP_BIG))}
              onPointerUp={() => endLong(repsLongRef, () => stepReps(REPS_STEP))}
              onPointerCancel={() => cancelLong(repsLongRef)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepBtn({
  label,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
}: {
  label:           string;
  onPointerDown:   () => void;
  onPointerUp:     () => void;
  onPointerCancel: () => void;
}) {
  return (
    <button
      onPointerDown={e => { e.preventDefault(); onPointerDown(); }}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      style={{
        width:          48,
        height:         56,
        background:     'var(--surface)',
        border:         '1px solid var(--hairline)',
        borderRadius:   8,
        color:          'var(--ink)',
        fontSize:       'var(--text-22)',
        cursor:         'pointer',
        fontFamily:     'inherit',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        userSelect:     'none',
        touchAction:    'manipulation',
      }}
    >
      {label}
    </button>
  );
}

const label13: CSSProperties = {
  fontSize: 'var(--text-13)',
  color:    'var(--ink-muted)',
};

const stepRow: CSSProperties = {
  display:    'flex',
  alignItems: 'center',
  gap:        6,
};

const numInput: CSSProperties = {
  flex:               1,
  height:             56,
  background:         'var(--surface)',
  border:             '1px solid var(--hairline)',
  borderRadius:       8,
  color:              'var(--ink)',
  fontSize:           'var(--text-28)',
  fontWeight:         600,
  textAlign:          'center',
  outline:            'none',
  fontFamily:         'inherit',
  fontVariantNumeric: 'tabular-nums',
  minWidth:           0,
};
