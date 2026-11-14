# C1 Auth and the complete schema

**Priority:** `p0`  
**Build order:** C1  
**Estimated:** 2.5 hours  
**Environment:** Needs database credentials. An agent that cannot reach Supabase cannot verify this.

> Hand back to the user after this checkpoint.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- `supabase/migrations/`, `supabase/seed/`
- `app/(auth)/`, `app/sign-in/`
- `src/lib/supabase/`, `src/lib/types/db.ts`
- This folder
- A one-line additive extension of C0's `AppShell` bypass list, to let
  `/sign-in` render without the tab bar. Additive only, change nothing else in
  C0's files.

**Do not create `middleware.ts`.** See the decided-architecture section of
`PROJECT.md`: auth is client-side only, route protection is a client-side
guard, and a cookie check in middleware cannot see a localStorage session.
Do not add `@supabase/ssr`.

**Credentials are required before this checkpoint can be verified.** If
`.env.local` is missing, stop and say so rather than writing auth you cannot
test. Unverified auth and unverified RLS are the two worst things to carry into
C2 and C3, because every failure downstream will look like a logger bug.

**Depends on:** None beyond C0.

## Build

- Magic-link auth restricted to `@vols.utk.edu` and `@utk.edu`. No passwords. A gmail address is refused with a plain inline message and no email is sent.
- Session persists across a refresh and across a PWA cold start.
- **One** migration creating all ten tables listed in `PROJECT.md`. The entire schema ships now, including tables not used until C8. There are no migrations after this checkpoint.
- `client_uuid` with a unique constraint on `sets`, `equipment_events` and `equipment_reports`.
- Row level security exactly as specified in `PROJECT.md`.
- Seed roughly 70 exercises with the full attribute set from `PROJECT.md`, and the real TRECS equipment inventory grouped by zone.
- Generated DB types in `src/lib/types/db.ts`, imported everywhere. No hand-written row interfaces.
- Add the LAN dev origin to the Supabase redirect allowlist and record the exact steps at the bottom of this README.

## Done when

- A vols.utk.edu address signs in. A gmail address is refused.
- Hard refresh keeps you signed in.
- Seed row counts printed and matching the seed file.
- Attempting to read another user's sets returns zero rows, demonstrated.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Sign in with a vols address. You land on the Gym tab, signed in.
2. Try a gmail address. An inline message refuses it.
3. Hard refresh. Still signed in.
4. Run the seed count query. Exercises and equipment units are both non-zero and match the seed file.

## LAN dev origin — redirect allowlist steps

The magic link's `emailRedirectTo` is set to `window.location.origin + '/log'`, so both
`http://localhost:3000` and `http://<LAN-IP>:3000` must be in Supabase's allowed redirect URLs.

1. Open the Supabase dashboard → **Authentication** → **URL Configuration**.
2. Under **Redirect URLs**, click **Add URL** and add:
   ```
   http://localhost:3000/**
   http://192.168.x.x:3000/**
   ```
   Replace `192.168.x.x` with your machine's LAN IP (`ifconfig | grep "inet "` on macOS).
3. Under **Site URL**, set it to `http://localhost:3000` (or your primary dev URL).
4. Click **Save**.

After this, magic links sent while on the LAN will redirect back correctly on the phone that received the email.

## Notes

- **Human task, do this first.** Send someone to TRECS with a notes app to count racks, benches, cable towers and the named machines, by zone. Real inventory is worth the hour and everything downstream depends on it.
- Mid-build migrations are the most expensive mistake available on this project. Create every table now even if it stays empty until C8.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c01-green`.
