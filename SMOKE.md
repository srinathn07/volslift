# SMOKE.md

Manual test checklist. One section per completed checkpoint, appended by the
agent that completed it.

Every item must be written so someone who has not read the code can follow it
on a phone. No item may say "verify it works". Each one names a concrete action
and a concrete expected result.

**The whole file is re-run at every checkpoint boundary, not just the newest
section.** A failure in an earlier section is a blocker, not a note for later.

Record results as a list, item by item, with pass or fail. Never summarize.

---

## How to run it

1. `npm run dev -- -H 0.0.0.0`
2. Open `/preview` on a laptop and work through the sections at 390 x 844
3. At least twice during the build, once around C3 and once at C11, run the
   whole file on a real phone over the LAN
4. Throttle the network to Fast 3G in DevTools for at least one full pass. It
   is the only way loading and error states become visible

---

## C0 foundation

_Appended when C0 completes._
