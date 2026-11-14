'use client';

import { useRef, useState, useCallback } from 'react';

const SIZES = [
  { label: '360 × 800',  w: 360,  h: 800  },
  { label: '390 × 844',  w: 390,  h: 844  },
  { label: '430 × 932',  w: 430,  h: 932  },
] as const;

type SizeKey = typeof SIZES[number]['label'];

export default function PreviewClient() {
  const [sizeLabel, setSizeLabel] = useState<SizeKey>('390 × 844');
  const [outline, setOutline] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const size = SIZES.find((s) => s.label === sizeLabel) ?? SIZES[1];

  const applyOutline = useCallback((enabled: boolean) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    const existing = doc.getElementById('__preview_outline__');
    if (enabled) {
      if (existing) return;
      const style = doc.createElement('style');
      style.id = '__preview_outline__';
      style.textContent = '* { outline: 1px solid #FF8200 !important; }';
      doc.head.appendChild(style);
    } else {
      existing?.remove();
    }
  }, []);

  const handleLoad = useCallback(() => {
    applyOutline(outline);
  }, [outline, applyOutline]);

  const toggleOutline = () => {
    const next = !outline;
    setOutline(next);
    applyOutline(next);
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#111113',
        padding: '24px 16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#F5F4F2',
      }}
    >
      {/* Controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        {/* Size picker */}
        {SIZES.map(({ label }) => (
          <button
            key={label}
            onClick={() => setSizeLabel(label)}
            style={{
              height: '36px',
              padding: '0 12px',
              background: label === sizeLabel ? '#FF8200' : '#1A1A1C',
              color: label === sizeLabel ? '#0E0E0F' : '#9A9792',
              border: '1px solid rgba(245,244,242,0.10)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: label === sizeLabel ? 600 : 400,
              cursor: 'pointer',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {label}
          </button>
        ))}

        {/* Dimension label */}
        <span
          style={{
            fontSize: '13px',
            color: '#9A9792',
            fontVariantNumeric: 'tabular-nums',
            marginLeft: '4px',
          }}
        >
          {size.w} × {size.h} px
        </span>

        {/* Outline toggle */}
        <button
          onClick={toggleOutline}
          style={{
            height: '36px',
            padding: '0 12px',
            background: outline ? '#FF8200' : '#1A1A1C',
            color: outline ? '#0E0E0F' : '#9A9792',
            border: '1px solid rgba(245,244,242,0.10)',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: outline ? 600 : 400,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          {outline ? 'Outlines on' : 'Outlines off'}
        </button>
      </div>

      {/* Frame */}
      <div
        style={{
          border: '1px solid rgba(245,244,242,0.10)',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'inline-block',
          lineHeight: 0,
        }}
      >
        <iframe
          ref={iframeRef}
          src="/log"
          width={size.w}
          height={size.h}
          style={{ border: 'none', display: 'block' }}
          onLoad={handleLoad}
          title={`Preview at ${size.label}`}
        />
      </div>
    </div>
  );
}
