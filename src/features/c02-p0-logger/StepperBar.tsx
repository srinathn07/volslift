'use client';

import { useRef, type CSSProperties } from 'react';

/*
 * Steppers for the pending set. The numbers themselves live in SetTable so the
 * grid stays aligned; this bar is the thumb-friendly way to nudge them.
 * Tap steps small, press and hold steps big.
 *
 * Long-press logic preserved from the original SetEntryPending implementation.
 */

const WEIGHT_STEP = 5;
const WEIGHT_STEP_BIG = 25;
const REPS_STEP = 1;
const REPS_STEP_BIG = 5;

interface Props {
  weight: number;
  reps: number;
  onChange: (weight: number, reps: number) => void;
}

export default function StepperBar({ weight, reps, onChange }: Props) {
  const weightLongRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repsLongRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (ref.current !== null) {
      clearTimeout(ref.current);
      ref.current = null;
    }
  }

  const stepWeight = (d: number) => onChange(Math.max(0, weight + d), reps);
  const stepReps = (d: number) => onChange(weight, Math.max(0, reps + d));

  return (
    <div style={bar}>
      <Group
        label="lb"
        onMinusDown={() => startLong(weightLongRef, () => stepWeight(-WEIGHT_STEP_BIG))}
        onMinusUp={() => endLong(weightLongRef, () => stepWeight(-WEIGHT_STEP))}
        onPlusDown={() => startLong(weightLongRef, () => stepWeight(WEIGHT_STEP_BIG))}
        onPlusUp={() => endLong(weightLongRef, () => stepWeight(WEIGHT_STEP))}
        onCancel={() => cancelLong(weightLongRef)}
      />
      <Group
        label="reps"
        onMinusDown={() => startLong(repsLongRef, () => stepReps(-REPS_STEP_BIG))}
        onMinusUp={() => endLong(repsLongRef, () => stepReps(-REPS_STEP))}
        onPlusDown={() => startLong(repsLongRef, () => stepReps(REPS_STEP_BIG))}
        onPlusUp={() => endLong(repsLongRef, () => stepReps(REPS_STEP))}
        onCancel={() => cancelLong(repsLongRef)}
      />
    </div>
  );
}

function Group({
  label,
  onMinusDown,
  onMinusUp,
  onPlusDown,
  onPlusUp,
  onCancel,
}: {
  label: string;
  onMinusDown: () => void;
  onMinusUp: () => void;
  onPlusDown: () => void;
  onPlusUp: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={group}>
      <StepBtn
        sign="minus"
        ariaLabel={`Decrease ${label}`}
        onDown={onMinusDown}
        onUp={onMinusUp}
        onCancel={onCancel}
      />
      <span style={groupLabel}>{label}</span>
      <StepBtn
        sign="plus"
        ariaLabel={`Increase ${label}`}
        onDown={onPlusDown}
        onUp={onPlusUp}
        onCancel={onCancel}
      />
    </div>
  );
}

/* Drawn, not typed. A text minus sits off the optical centre at this size. */
function StepBtn({
  sign,
  ariaLabel,
  onDown,
  onUp,
  onCancel,
}: {
  sign: 'plus' | 'minus';
  ariaLabel: string;
  onDown: () => void;
  onUp: () => void;
  onCancel: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onPointerDown={(e) => {
        e.preventDefault();
        onDown();
      }}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
      onPointerLeave={onCancel}
      style={stepBtn}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden focusable="false">
        <rect x="1" y="7" width="14" height="2" rx="1" fill="currentColor" />
        {sign === 'plus' && (
          <rect x="7" y="1" width="2" height="14" rx="1" fill="currentColor" />
        )}
      </svg>
    </button>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const bar: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
  marginTop: 12,
};

const group: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 4,
  background: 'var(--surface)',
  border: '1px solid var(--hairline)',
  borderRadius: 8,
  padding: 2,
};

const groupLabel: CSSProperties = {
  fontSize: 'var(--text-12)',
  fontWeight: 600,
  color: 'var(--ink-muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  userSelect: 'none',
};

const stepBtn: CSSProperties = {
  width: 56,
  height: 52,
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  color: 'var(--ink)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
};
