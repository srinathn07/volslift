'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase/client';

export default function MePage() {
  const router = useRouter();

  async function handleSignOut() {
    await supabase().auth.signOut();
    router.replace('/sign-in');
  }

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
          Me
        </h1>
      </header>

      <div style={{ paddingTop: 32 }}>
        <button
          onClick={handleSignOut}
          style={{
            width:        '100%',
            height:       '52px',
            background:   'var(--surface)',
            color:        'var(--busy)',
            border:       '1px solid var(--hairline)',
            borderRadius: 'var(--radius-card)',
            fontSize:     'var(--text-15)',
            fontWeight:   600,
            cursor:       'pointer',
            fontFamily:   'inherit',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
