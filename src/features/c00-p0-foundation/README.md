# C0 Foundation and design system

**Priority:** `p0`  
**Build order:** C0  
**Estimated:** 2 hours  
**Environment:** Either agent. No database needed.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- Repo root config
- `app/layout.tsx`, `app/globals.css`, `tailwind.config.ts`
- `app/preview/`
- This folder, which holds the app shell

**Depends on:** Nothing. This is the first checkpoint.

**Dependencies to install:** next, react, typescript, tailwindcss, @supabase/supabase-js, vitest. Nothing else, for the whole build.

## Build

- Next.js App Router with TypeScript `strict`, Tailwind, and the Supabase client installed but unused.
- Every token from `DESIGN.md` as CSS variables plus a Tailwind theme extension. Do not invent a color after this checkpoint.
- The app shell in this folder: `max-width: 430px` centered column, `canvas` background, bottom tab bar with four tabs in this order, Log, Gym, Plan, Me, each a placeholder screen showing only its title. **Log is the default tab**, because the logger is the product and the app must never open to a dashboard.
- The dark palette from `DESIGN.md`. There is no light mode. Set the `theme-color` meta to `canvas` so the browser chrome matches.
- Tab bar padded with `env(safe-area-inset-bottom)`, layout height in `100dvh`.
- `/preview` route: iframes the app at 360x800, 390x844 and 430x932 with a size picker, a label showing current dimensions, a toggle that puts a 1px outline on every element, and a 404 when `NODE_ENV === "production"`.
- PWA manifest, icons, `apple-mobile-web-app-capable`.
- Root error boundary rendering one plain sentence and a reload button. Never a stack trace.
- An npm script `gate` that runs `tsc --noEmit`, `next build` and `vitest run` in sequence.

## Done when

- All four tabs navigate and the active tab keeps its scroll position.
- `/preview` renders the app at all three sizes.
- No horizontal scroll at 360px.
- Console clean.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Tap each of the four tabs. Each shows its own title and the orange marker moves to it.
2. Scroll the Gym tab, switch to Log, switch back. Scroll position is preserved.
3. Open `/preview` and switch between 360, 390 and 430. The frame resizes and the label matches.
4. At 360 width, nothing scrolls sideways on any tab.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c00-green`.
