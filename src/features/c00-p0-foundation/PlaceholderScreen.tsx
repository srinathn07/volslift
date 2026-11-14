interface PlaceholderScreenProps {
  title: string;
}

/**
 * Bare placeholder used by every tab until the real screen lands in a later
 * checkpoint. Shows only the page title — intentional, not incomplete.
 */
export default function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <div style={{ padding: '0 16px' }}>
      <header
        style={{
          paddingTop: '14px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--text-22)',
            fontWeight: 600,
            color: 'var(--ink)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
      </header>
    </div>
  );
}
