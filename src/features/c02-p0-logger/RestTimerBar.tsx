import { formatRestTime } from './useRestTimer';

interface Props {
  remaining: number;
  active:    boolean;
  onSkip:    () => void;
}

export default function RestTimerBar({ remaining, active, onSkip }: Props) {
  if (!active) return null;

  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        padding:        '12px 16px',
        background:     'var(--surface)',
        borderBottom:   '1px solid var(--hairline)',
      }}
    >
      <span
        style={{
          fontSize:           'var(--text-22)',
          fontWeight:         600,
          color:              'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatRestTime(remaining)}
      </span>
      <button
        onClick={onSkip}
        style={{
          fontSize:   'var(--text-13)',
          color:      'var(--ink-muted)',
          background: 'transparent',
          border:     'none',
          cursor:     'pointer',
          padding:    '8px 0 8px 16px',
          fontFamily: 'inherit',
          minHeight:  44,
        }}
      >
        Skip
      </button>
    </div>
  );
}
