'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        paddingTop: 'var(--space-6)',
      }}
    >
      <p style={{ color: 'var(--ink)', fontSize: 'var(--text-15)', marginBottom: 'var(--space-4)' }}>
        Something went wrong.
      </p>
      <button
        onClick={reset}
        style={{
          height: '44px',
          padding: '0 var(--space-4)',
          background: 'var(--accent)',
          color: 'var(--on-accent)',
          border: 'none',
          borderRadius: 'var(--radius-card)',
          fontSize: 'var(--text-15)',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Reload
      </button>
    </div>
  );
}
