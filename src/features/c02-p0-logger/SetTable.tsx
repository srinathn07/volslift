'use client';

import { type CSSProperties } from 'react';
import type { LocalSet, PrevSet } from './types';
import { getPrevForIndex } from './usePrevious';

/*
 * One aligned grid for the whole set area: logged rows and the pending row
 * share the same columns, so the screen reads as a table instead of two
 * unrelated widgets. Column order follows the loggers lifters already use:
 * set number, what you did last time, then this time's inputs.
 */

const GRID = '28px minmax(0,1fr) 76px 60px';
const GAP = 8;

interface Props {
  loggedSets: LocalSet[];
  prevSets: PrevSet[];
  pendingIndex: number;
  pendingWeight: number;
  pendingReps: number;
  onChange: (weight: number, reps: number) => void;
}

export default function SetTable({
  loggedSets,
  prevSets,
  pendingIndex,
  pendingWeight,
  pendingReps,
  onChange,
}: Props) {
  const pendingPrev = getPrevForIndex(prevSets, pendingIndex);

  return (
    <div>
      {/* Header */}
      <div style={headerRow}>
        <span style={headCell}>Set</span>
        <span style={headCell}>Previous</span>
        <span style={{ ...headCell, textAlign: 'center' }}>lb</span>
        <span style={{ ...headCell, textAlign: 'center' }}>Reps</span>
      </div>

      {/* Logged rows */}
      {loggedSets.map((s) => {
        const prev = getPrevForIndex(prevSets, s.set_index);
        return (
          <div key={s.client_uuid} style={loggedRow}>
            <span style={setNumCell}>
              <span>{s.set_index}</span>
              <Dot synced={s.synced} />
            </span>
            <span style={prevCell}>{prev ? `${prev.weight} × ${prev.reps}` : '—'}</span>
            <span style={loggedValue}>{s.weight}</span>
            <span style={loggedValue}>{s.reps}</span>
          </div>
        );
      })}

      {/* Pending row */}
      <div style={pendingRow}>
        <span style={{ ...setNumCell, color: 'var(--ink)' }}>{pendingIndex}</span>

        {pendingPrev ? (
          <button
            type="button"
            onClick={() => onChange(pendingPrev.weight, pendingPrev.reps)}
            style={prevButton}
            aria-label={`Use previous, ${pendingPrev.weight} pounds for ${pendingPrev.reps} reps`}
          >
            {pendingPrev.weight} × {pendingPrev.reps}
          </button>
        ) : (
          <span style={prevCell}>—</span>
        )}

        <input
          type="number"
          inputMode="decimal"
          value={pendingWeight}
          min={0}
          step={5}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(isNaN(v) || v < 0 ? 0 : v, pendingReps);
          }}
          style={numCell}
          aria-label="Weight in pounds"
        />
        <input
          type="number"
          inputMode="numeric"
          value={pendingReps}
          min={0}
          step={1}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            onChange(pendingWeight, isNaN(v) || v < 0 ? 0 : v);
          }}
          style={numCell}
          aria-label="Reps"
        />
      </div>
    </div>
  );
}

/* A 5px dot carries sync state without a text glyph. */
function Dot({ synced }: { synced: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 5,
        height: 5,
        borderRadius: 9999,
        background: synced ? 'var(--free)' : 'var(--unknown)',
        flexShrink: 0,
      }}
    />
  );
}

/* ── Styles ──────────────────────────────────────────────────────────────── */

const baseRow: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: GRID,
  gap: GAP,
  alignItems: 'center',
};

const headerRow: CSSProperties = {
  ...baseRow,
  paddingBottom: 6,
};

const headCell: CSSProperties = {
  fontSize: 'var(--text-12)',
  fontWeight: 600,
  color: 'var(--ink-muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
};

const loggedRow: CSSProperties = {
  ...baseRow,
  height: 44,
  borderTop: '1px solid var(--hairline)',
};

const pendingRow: CSSProperties = {
  ...baseRow,
  minHeight: 64,
  borderTop: '1px solid var(--hairline)',
  background: 'var(--raised)',
  marginLeft: -8,
  marginRight: -8,
  paddingLeft: 8,
  paddingRight: 8,
  borderRadius: 8,
};

const setNumCell: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 'var(--text-13)',
  color: 'var(--ink-muted)',
};

const prevCell: CSSProperties = {
  fontSize: 'var(--text-13)',
  color: 'var(--ink-muted)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

/* Tapping Previous accepts those numbers. Looks like text, behaves like a control.
   justifySelf keeps the underline hugging the text instead of stretching the cell. */
const prevButton: CSSProperties = {
  ...prevCell,
  justifySelf: 'start',
  textAlign: 'left',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px dashed var(--ink-muted)',
  padding: '6px 0 4px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  minHeight: 44,
};

const loggedValue: CSSProperties = {
  fontSize: 'var(--text-17)',
  color: 'var(--ink)',
  textAlign: 'center',
};

const numCell: CSSProperties = {
  width: '100%',
  height: 56,
  background: 'var(--surface)',
  border: '1px solid var(--hairline)',
  borderRadius: 8,
  color: 'var(--ink)',
  fontSize: 'var(--text-22)',
  fontWeight: 600,
  textAlign: 'center',
  outline: 'none',
  fontFamily: 'inherit',
  padding: 0,
  minWidth: 0,
};
