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

Run these after `npm run dev -- -H 0.0.0.0`. Open the app at the printed
address. Use either a phone on the same network or a desktop browser at 390px
width.

1. **Default tab.** Open the app. It should land on the Log screen showing the
   word "Log" in large text. The orange marker should appear above the Log tab
   label. Expected: Log screen visible, no other screen shown.

2. **Tab navigation.** Tap Gym. The screen shows "Gym" and the orange marker
   moves to Gym. Tap Plan — shows "Plan", marker moves. Tap Me — shows "Me",
   marker moves. Tap Log — back to "Log", marker returns.
   Expected: each tab shows only its own title; marker follows each tap.

3. **Scroll preservation.** Go to the Gym tab. Scroll down (the page may be
   short in C0; add extra content manually if needed, or use a browser
   DevTools device preset at 390 × 844 to confirm the scroll container
   exists). Switch to Log. Switch back to Gym.
   Expected: the Gym scroll position is restored, not reset to the top.

4. **No horizontal scroll.** Set browser width to 360px (DevTools device
   toolbar). Tap every tab. Swipe or drag horizontally on each screen.
   Expected: nothing scrolls sideways on any tab.

5. **Preview route — size picker.** Navigate to `/preview`. Three buttons
   appear: "360 × 800", "390 × 844", "430 × 932". Click each one.
   Expected: the iframe resizes visibly and the label next to the buttons
   matches the selected dimensions.

6. **Preview route — outline toggle.** On `/preview`, click "Outlines off".
   It should change to "Outlines on" and a 1px orange outline should appear
   on every element inside the iframe.
   Expected: outline visible inside iframe, not outside it.

7. **Preview 404 in production.** Run `npm run build && npm start`. Navigate
   to `/preview`.
   Expected: the page returns a 404 / Not Found response.

8. **PWA manifest.** Open DevTools → Application → Manifest (Chrome) or
   Manifest (Safari). Check that name is "VolsLift", display is "standalone",
   and background and theme colors are both `#0E0E0F`.
   Expected: all fields match.

9. **Dark chrome.** On a real iPhone or Android, add the app to the home
   screen. Open it. The browser status bar and surrounding chrome should be
   dark (matching the app background), not white.
   Expected: no white bar visible at the top or bottom.
