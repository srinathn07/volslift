'use client';

import { useState, useRef, useEffect } from 'react';
import type { ExerciseRow } from './types';

interface Props {
  exercises:  ExerciseRow[];
  recentIds:  string[];
  selectedId: string | null;
  onSelect:   (id: string) => void;
  onClose:    () => void;
}

export default function ExercisePicker({
  exercises, recentIds, selectedId, onSelect, onClose,
}: Props) {
  const [search, setSearch] = useState('');
  const searchRef           = useRef<HTMLInputElement>(null);

  useEffect(() => { searchRef.current?.focus(); }, []);

  const q        = search.toLowerCase();
  const filtered = q
    ? exercises.filter(e => e.name.toLowerCase().includes(q))
    : exercises;
  const recents  = recentIds
    .map(id => exercises.find(e => e.id === id))
    .filter((e): e is ExerciseRow => e !== undefined);

  return (
    <div
      style={{
        position:      'fixed',
        inset:         0,
        background:    'var(--canvas)',
        zIndex:        200,
        display:       'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          12,
          padding:      '14px 16px 10px',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <input
          ref={searchRef}
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search exercises"
          autoCapitalize="off"
          autoCorrect="off"
          style={{
            flex:         1,
            height:       44,
            background:   'var(--surface)',
            border:       '1px solid var(--hairline)',
            borderRadius: 8,
            color:        'var(--ink)',
            fontSize:     'var(--text-15)',
            padding:      '0 12px',
            outline:      'none',
            fontFamily:   'inherit',
          }}
        />
        <button
          onClick={onClose}
          style={{
            fontSize:   'var(--text-15)',
            color:      'var(--ink-muted)',
            background: 'transparent',
            border:     'none',
            cursor:     'pointer',
            padding:    '0 4px',
            fontFamily: 'inherit',
            minHeight:  44,
            minWidth:   56,
          }}
        >
          Cancel
        </button>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 32 }}>
        {!q && recents.length > 0 && (
          <>
            <SectionLabel label="Recent" />
            {recents.map(e => (
              <ExerciseItem
                key={e.id}
                exercise={e}
                selected={e.id === selectedId}
                onSelect={onSelect}
              />
            ))}
            <SectionLabel label="All exercises" />
          </>
        )}
        {filtered.map(e => (
          <ExerciseItem
            key={e.id}
            exercise={e}
            selected={e.id === selectedId}
            onSelect={onSelect}
          />
        ))}
        {filtered.length === 0 && (
          <p
            style={{
              padding:  '24px 16px',
              color:    'var(--ink-muted)',
              fontSize: 'var(--text-15)',
            }}
          >
            No exercises match &ldquo;{search}&rdquo;.
          </p>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      style={{
        fontSize:      11,
        fontWeight:    600,
        color:         'var(--ink-muted)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding:       '16px 16px 4px',
      }}
    >
      {label}
    </p>
  );
}

function ExerciseItem({
  exercise, selected, onSelect,
}: {
  exercise: ExerciseRow;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(exercise.id)}
      style={{
        display:      'flex',
        alignItems:   'center',
        width:        '100%',
        minHeight:    56,
        padding:      '0 16px',
        background:   selected ? 'var(--surface)' : 'transparent',
        border:       'none',
        borderBottom: '1px solid var(--hairline)',
        textAlign:    'left',
        cursor:       'pointer',
        fontFamily:   'inherit',
      }}
    >
      <span
        style={{
          flex:       1,
          fontSize:   'var(--text-15)',
          color:      'var(--ink)',
          lineHeight: 1.4,
        }}
      >
        {exercise.name}
      </span>
      <span style={{ fontSize: 'var(--text-13)', color: 'var(--ink-muted)' }}>
        {exercise.equipment_class}
      </span>
    </button>
  );
}
