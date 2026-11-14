'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';

type UIState = 'idle' | 'loading' | 'sent' | 'error';

const ALLOWED_DOMAINS = ['@vols.utk.edu', '@utk.edu'];

function isAllowed(email: string): boolean {
  const lower = email.toLowerCase().trim();
  return ALLOWED_DOMAINS.some((d) => lower.endsWith(d));
}

interface Props {
  /** Injected server-side from NEXT_PUBLIC_DEMO_EMAIL. Null = hide demo button. */
  demoEmail:    string | null;
  /** Injected server-side from DEMO_PASSWORD. Null = hide demo button. */
  demoPassword: string | null;
}

export default function SignInPage({ demoEmail, demoPassword }: Props) {
  const router = useRouter();
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [linkState,   setLinkState]   = useState<UIState>('idle');
  const [pwState,     setPwState]     = useState<UIState>('idle');
  const [demoState,   setDemoState]   = useState<UIState>('idle');
  const [domainError, setDomainError] = useState('');
  const [linkError,   setLinkError]   = useState('');
  const [pwError,     setPwError]     = useState('');
  const [demoError,   setDemoError]   = useState('');

  const busy     = linkState === 'loading' || pwState === 'loading' || demoState === 'loading';
  const showDemo = !!(demoEmail && demoPassword);

  /* ── Magic link ──────────────────────────────────────────────────────────── */
  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setDomainError('');
    setLinkError('');

    if (!isAllowed(email)) {
      setDomainError('Sign-in is restricted to @vols.utk.edu and @utk.edu addresses.');
      return;
    }

    setLinkState('loading');
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
      setLinkState('error');
      setLinkError(error.message);
    } else {
      setLinkState('sent');
    }
  }

  /* ── Password ────────────────────────────────────────────────────────────── */
  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    if (!email || !password) {
      setPwError('Enter your email address and password.');
      return;
    }
    setPwState('loading');
    const { error } = await supabase().auth.signInWithPassword({
      email:    email.toLowerCase().trim(),
      password,
    });
    if (error) {
      setPwState('error');
      setPwError(error.message);
    } else {
      router.replace('/log');
    }
  }

  /* ── Demo account ────────────────────────────────────────────────────────── */
  async function handleDemo() {
    if (!demoEmail || !demoPassword) return;
    setDemoError('');
    setDemoState('loading');
    const { error } = await supabase().auth.signInWithPassword({
      email:    demoEmail,
      password: demoPassword,
    });
    if (error) {
      setDemoState('error');
      setDemoError(error.message);
    } else {
      router.replace('/log');
    }
  }

  /* ── Sent state ──────────────────────────────────────────────────────────── */
  if (linkState === 'sent') {
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
            onClick={() => { setLinkState('idle'); setEmail(''); }}
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

        {/* ── Shared email input ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            disabled={busy}
          />
          {domainError && (
            <p style={styles.errorText} role="alert">{domainError}</p>
          )}
          {linkState === 'error' && (
            <p style={styles.errorText} role="alert">
              {linkError || 'Something went wrong. Try again.'}
            </p>
          )}
        </div>

        {/* ── Password field (secondary path) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={styles.divider}>
            <span style={styles.dividerText}>or sign in with password</span>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPwError(''); }}
            style={styles.input}
            disabled={busy}
          />
          {pwState === 'error' && (
            <p style={styles.errorText} role="alert">
              {pwError || 'Something went wrong. Try again.'}
            </p>
          )}
        </div>
      </div>

      <div style={styles.bottom}>
        {/* Primary: magic link */}
        <button
          type="button"
          style={{
            ...styles.btn,
            opacity: busy || !email ? 0.5 : 1,
            marginBottom: 12,
          }}
          disabled={busy || !email}
          onClick={handleMagicLink}
        >
          {linkState === 'loading' ? 'Sending…' : 'Send magic link'}
        </button>

        {/* Secondary: password */}
        <button
          type="button"
          style={{
            ...styles.btn,
            background: 'var(--surface)',
            color: 'var(--ink-muted)',
            opacity: busy || !email || !password ? 0.5 : 1,
            marginBottom: showDemo ? 12 : 0,
          }}
          disabled={busy || !email || !password}
          onClick={handlePassword}
        >
          {pwState === 'loading' ? 'Signing in…' : 'Sign in with password'}
        </button>

        {/* Demo account — only rendered when env vars are present */}
        {showDemo && (
          <>
            <button
              type="button"
              style={{
                ...styles.btn,
                background: 'transparent',
                color: 'var(--ink-muted)',
                border: '1px solid var(--hairline)',
                opacity: busy ? 0.5 : 1,
              }}
              disabled={busy}
              onClick={handleDemo}
            >
              {demoState === 'loading' ? 'Signing in…' : 'Use demo account'}
            </button>
            {demoState === 'error' && (
              <p style={{ ...styles.errorText, marginTop: 8 }} role="alert">
                {demoError || 'Demo sign-in failed.'}
              </p>
            )}
          </>
        )}
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
  divider: {
    display:    'flex',
    alignItems: 'center',
    gap:        12,
    marginTop:  4,
  },
  dividerText: {
    fontSize:   'var(--text-13)',
    color:      'var(--ink-muted)',
    whiteSpace: 'nowrap' as const,
  },
  errorText: {
    fontSize:   'var(--text-13)',
    color:      'var(--busy)',
    marginTop:  4,
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
    display:       'flex',
    flexDirection: 'column' as const,
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
