'use client';

import { useRef, useState, useCallback } from 'react';

const SIZES = [
  { label: '360 × 800',  w: 360,  h: 800  },
  { label: '390 × 844',  w: 390,  h: 844  },
  { label: '430 × 932',  w: 430,  h: 932  },
] as const;

type SizeLabel = typeof SIZES[number]['label'];

// Phone chrome padding around the iframe
const BEZEL_SIDE = 16;
const BEZEL_TOP  = 56; // includes status bar + dynamic island
const BEZEL_BOT  = 44; // includes home indicator

export default function PreviewClient() {
  const [sizeLabel, setSizeLabel] = useState<SizeLabel>('390 × 844');
  const [outline, setOutline] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const size = SIZES.find((s) => s.label === sizeLabel) ?? SIZES[1];
  const phoneW = size.w + BEZEL_SIDE * 2;
  const phoneH = size.h + BEZEL_TOP + BEZEL_BOT;

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
        minHeight: '100vh',
        background: '#0A0A0B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 24px 48px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#F5F4F2',
        gap: '24px',
      }}
    >
      {/* ── Controls bar ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          alignItems: 'center',
          width: '100%',
          maxWidth: '600px',
        }}
      >
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

      {/* ── Phone mockup ─────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: phoneW,
          height: phoneH,
          background: '#131316',
          borderRadius: '44px',
          border: '1.5px solid rgba(245,244,242,0.14)',
          /* outer ring + drop shadow, no gradient */
          boxShadow: '0 0 0 6px #0E0E0F, 0 32px 80px rgba(0,0,0,0.7)',
          flexShrink: 0,
        }}
      >
        {/* Side button (right) */}
        <div style={{
          position: 'absolute', right: -4, top: 100,
          width: 4, height: 60,
          background: '#1E1E22', borderRadius: '0 3px 3px 0',
        }} />
        {/* Volume up (left) */}
        <div style={{
          position: 'absolute', left: -4, top: 80,
          width: 4, height: 32,
          background: '#1E1E22', borderRadius: '3px 0 0 3px',
        }} />
        {/* Volume down (left) */}
        <div style={{
          position: 'absolute', left: -4, top: 124,
          width: 4, height: 32,
          background: '#1E1E22', borderRadius: '3px 0 0 3px',
        }} />

        {/* Top bezel with dynamic island */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: BEZEL_TOP,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          background: '#131316',
          borderRadius: '44px 44px 0 0',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          <div style={{
            marginTop: 12,
            width: 118, height: 34,
            background: '#000',
            borderRadius: '20px',
          }} />
        </div>

        {/* iframe viewport */}
        <div style={{
          position: 'absolute',
          top: BEZEL_TOP,
          left: BEZEL_SIDE,
          right: BEZEL_SIDE,
          bottom: BEZEL_BOT,
          overflow: 'hidden',
          borderRadius: '2px',
        }}>
          <iframe
            ref={iframeRef}
            src="/log"
            width={size.w}
            height={size.h}
            style={{ border: 'none', display: 'block' }}
            onLoad={handleLoad}
            title={`Preview at ${sizeLabel}`}
          />
        </div>

        {/* Bottom bezel with home indicator */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: BEZEL_BOT,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          background: '#131316',
          borderRadius: '0 0 44px 44px',
          zIndex: 2,
          pointerEvents: 'none',
        }}>
          <div style={{
            marginBottom: 10,
            width: 120, height: 5,
            background: 'rgba(245,244,242,0.25)',
            borderRadius: '3px',
          }} />
        </div>
      </div>
    </div>
  );
}
