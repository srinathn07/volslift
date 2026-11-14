'use client';

import { useState } from 'react';
import { supabase } from '@/src/lib/supabase/client';

type UIState = 'idle' | 'loading' | 'sent' | 'error';

const ALLOWED_DOMAINS = ['@vols.utk.edu', '@utk.edu'];

function isAllowed(email: string): boolean {
  const lower = email.toLowerCase().trim();
  return ALLOWED_DOMAINS.some((d) => lower.endsWith(d));
}

export default function SignInPage() {
  const [email,       setEmail]       = useState('');
  const [state,       setState]       = useState<UIState>('idle');
  const [domainError, setDomainError] = useState('');
  const [errorMsg,    setErrorMsg]    = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDomainError('');
    setErrorMsg('');

    if (!isAllowed(email)) {
      // Domain refused — no network request made.
      setDomainError('Sign-in is restricted to @vols.utk.edu and @utk.edu addresses.');
      return;
    }

    setState('loading');
    const { error } = await supabase().auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo:
          typeof window !== 'undefined'
            ? `${window.location.origin}/log`
            : '/log',
      },
    });

    if (error) {
      setState('error');
      setErrorMsg(error.message);
    } else {
      setState('sent');
    }
  }

  /* ── Sent state ──────────────────────────────────────────────────────────── */
  if (state === 'sent') {
    return (
      <div style={styles.root}>
        <div style={styles.top}>
          <span style={styles.wordmark}>VolsLift</span>
        </div>
        <div style={styles.mid}>
          <p style={styles.heading}>Check your email</p>
          <p style={styles.body}>
            We sent a sign-in link to{' '}
            <span style={{ color: 'var(--ink)' }}>{email}</span>.
            Tap the link in your email to continue.
          </p>
        </div>
        <div style={styles.bottom}>
          <button
            style={{ ...styles.btn, background: 'var(--surface)', color: 'var(--ink-muted)' }}
            onClick={() => { setState('idle'); setEmail(''); }}
          >
            Use a different address
          </button>
        </div>
      </div>
    );
  }

  /* ── Form ────────────────────────────────────────────────────────────────── */
  return (
    <div style={styles.root}>
      <div style={styles.top}>
        <span style={styles.wordmark}>VolsLift</span>
      </div>

      <div style={styles.mid}>
        <p style={styles.heading}>Sign in</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={styles.label} htmlFor="email-input">
            UTK email address
          </label>
          <input
            id="email-input"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="netid@vols.utk.edu"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setDomainError(''); }}
            style={styles.input}
            disabled={state === 'loading'}
          />
          {domainError && (
            <p style={styles.errorText} role="alert">
              {domainError}
            </p>
          )}
          {state === 'error' && (
            <p style={styles.errorText} role="alert">
              {errorMsg || 'Something went wrong. Try again.'}
            </p>
          )}
        </form>
      </div>

      <div style={styles.bottom}>
        <button
          type="submit"
          form="sign-in-form"
          style={{
            ...styles.btn,
            opacity: state === 'loading' ? 0.5 : 1,
          }}
          disabled={state === 'loading' || !email}
          onClick={handleSubmit as unknown as React.MouseEventHandler}
        >
          {state === 'loading' ? 'Sending…' : 'Send magic link'}
        </button>
      </div>
    </div>
  );
}

/* ── Inline styles — tokens only, no literals ─────────────────────────────── */
const styles = {
  root: {
    minHeight:      '100dvh',
    background:     'var(--canvas)',
    display:        'flex',
    flexDirection:  'column' as const,
    padding:        '0 24px',
    paddingBottom:  'calc(env(safe-area-inset-bottom) + 16px)',
  },
  top: {
    paddingTop: 56,
    paddingBottom: 32,
  },
  wordmark: {
    fontSize:   'var(--text-22)',
    fontWeight: 600,
    color:      'var(--accent)',
    letterSpacing: '-0.02em',
  },
  mid: {
    flex:           1,
    display:        'flex',
    flexDirection:  'column' as const,
    gap:            24,
  },
  heading: {
    fontSize:   'var(--text-28)',
    fontWeight: 600,
    color:      'var(--ink)',
    lineHeight: 1.2,
  },
  label: {
    fontSize:  'var(--text-13)',
    color:     'var(--ink-muted)',
    marginBottom: 4,
  },
  input: {
    width:        '100%',
    height:       '52px',
    background:   'var(--surface)',
    border:       '1px solid var(--hairline)',
    borderRadius: 'var(--radius-card)',
    color:        'var(--ink)',
    fontSize:     'var(--text-15)',
    padding:      '0 16px',
    outline:      'none',
    fontFamily:   'inherit',
  },
  errorText: {
    fontSize:  'var(--text-13)',
    color:     'var(--busy)',
    marginTop: 4,
    lineHeight: 1.4,
  },
  body: {
    fontSize:   'var(--text-15)',
    color:      'var(--ink-muted)',
    lineHeight: 1.5,
  },
  bottom: {
    paddingTop:    24,
    paddingBottom: 8,
  },
  btn: {
    width:        '100%',
    height:       '56px',
    background:   'var(--accent)',
    color:        'var(--on-accent)',
    border:       'none',
    borderRadius: 'var(--radius-card)',
    fontSize:     'var(--text-17)',
    fontWeight:   600,
    cursor:       'pointer',
    fontFamily:   'inherit',
  },
} as const;
