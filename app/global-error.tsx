'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#0E0E0F',
          color: '#F5F4F2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '24px 16px',
          minHeight: '100dvh',
        }}
      >
        <p style={{ fontSize: '15px', marginBottom: '16px' }}>
          Something went wrong.
        </p>
        <button
          onClick={reset}
          style={{
            height: '44px',
            padding: '0 16px',
            background: '#FF8200',
            color: '#0E0E0F',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
