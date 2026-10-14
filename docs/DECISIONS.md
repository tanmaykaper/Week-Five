# Decisions

One line each: the decision, then why. Newest at the bottom.

## Phase 0 (2026-10-14)
1. **Kickoff prompt wins over HANDOFF where they differ** (it collects a nickname, uses Next.js, adds QR entry, projection and mates). The kickoff says so explicitly.
2. **Collecting a nickname is fine** despite HANDOFF's "no name": it stays on the device, it's optional in spirit (blank becomes "you"), and the challenge rule is about the app shipping customer data, which it doesn't.
3. **Next.js 16.4 with static export.** Current stable; kickoff asks for current Next.js.
4. **Node 26 and pnpm 12 from Homebrew.** Corepack is no longer bundled with Node 25+, so pnpm comes from Homebrew.
5. **Service worker via `@serwist/build` after export, not `@serwist/next`.** Next 16 builds with Turbopack by default and the plugin route is fragile there; post-processing `out/` is bundler-independent.
6. **GSAP ScrollTrigger for the intro, `motion` for everything else.** ScrollTrigger's pinning and scrub is the most predictable option on mid-range Android; motion handles springs and shared-element transitions in React.
7. **Lenis off by default.** Native scroll is smoother on Android than JS smoothing for a single pinned scrub; revisit only if desktop scrub feels steppy.
8. **Manrope plus Instrument Serif.** Manrope is the closest free geometric to MiSans with a true 200 weight and tabular figures; the serif is reserved for the user's own letter.
9. **Day 1 is the start date; week = ceil(day / 7); judgement at day 168.** Matches "Day 34, week 5" in the brief and keeps week 24 exact.
10. **Shed window drawn as days 15 to 56 (weeks 3 to 8).** Matches research language "about 2 to 8 weeks" while starting after the quiet first two weeks.
11. **Season is computed per region, not a single June to September rule.** Chennai and the south-east coast get their October to December monsoon; the user can override.
12. **Demo mode uses its own storage namespace.** A reviewer can never overwrite or see a real user's data, and leaving demo is clean.
13. **The clock is injectable.** Demo day jumping and unit tests both need `now` to be controllable.
14. **Reminders are .ics first, notifications second.** Real scheduled push needs a server; .ics works on every phone and survives the browser being closed.
15. **No import in the MVP, only export.** Import invites schema-mismatch bugs and isn't needed for the judging flow.
16. **Fictional SKU codes prefixed `WF-`.** Real Man Matters SKUs would imply a partnership; plausible days of supply live in `src/content/skus.ts`.
17. **Product names are generic ("Regrowth solution, 60 ml") with no strength.** Avoids anything that reads as dose information.
18. **Red-flag list includes dizziness, racing heart and swelling**, not only scalp symptoms. These are the systemic warnings on minoxidil leaflets.
19. **Pausing doesn't reset the day count.** The map stays honest; restart adds an overlay and changes insight copy.
20. **Reorder prompt hidden for 24 hours after any check-in with shed or worry 3+.** Kickoff sequencing rule, made testable.
21. **Briefing lives inside `/onboarding`, not as its own route.** Back button and resume logic stay simple.
22. **Phone camera demos run over `next dev --experimental-https`.** Camera APIs need a secure origin; plain HTTP on a LAN IP falls back to file upload.
23. **Insight count is 51, not 40.** Red-flag and routine cards came on top of the 40 phase cards; all live in one JSON file for editing.

## Design v2 (2026-10-14, after Tanmay's review)
24. **The app is a responsive website, not a phone mock.** Tanmay found v1 ugly and unresponsive. Top navigation from 768 px, bottom tabs only under 768 for thumb reach. This replaces the kickoff's left icon rail.
25. **Minimal, document-style layout.** Space and hairlines instead of boxed cards; one bordered panel per screen at most; no glow, gradients or glass beyond the header blur. Replaces the kickoff's glass bento look, at Tanmay's request.
26. **Geist replaces Manrope; Instrument Serif moves up to the greeting.** Geist is cleaner at small sizes and has a true 200 weight for numerals. Serif marks human voice (greeting, the stopping moment, the user's letter); sans is the app.
27. **Phosphor icons replace Lucide.** Slightly heavier, more consistent stroke; regular weight, fill for the active tab.
28. **Theme follows the system by default, both themes first-class.** A minimal light page reads calmer for daytime use; dark is equally finished. Replaces "dark is the hero".
29. **Navigation is Today, Map, Mirror, Mates, You; `/journey` becomes `/map`.** "The map and the mirror" is the product's own idea, and it keeps "journey" out of the UI.
30. **Hosting is GitHub Pages under `/week-five`.** Confirmed by Tanmay. Screen recording is his.
31. **TypeScript pinned to 6.0.3.** 7.x is the native compiler without the JS API that Next's type check uses.
32. **Primary actions use brand blue, not black.** Keeps the Man Matters family resemblance while the rest of the page stays monochrome.

## Phase 1 (2026-10-14)
33. **Hand-written service worker instead of Serwist.** `scripts/build-sw.mjs` precaches every exported file with a content hash. About 60 lines, no runtime dependency, and it does not care which bundler Next uses. Replaces decision 5.
34. **No date-fns.** Three local calendar helpers replace it; `parse` and `format` were pulling about 15 KB of locale code into every page. Display dates use `Intl` through `toLocaleDateString`.
35. **Zod through `zod/mini`.** Same validation, functional API, and it halves our own chunk (35 KB to 21 KB gzipped).
36. **First-load JS is 202 to 207 KB gzipped**, of which about 171 KB is React 19 and the Next 16 runtime. Our code is 21 KB and icons about 14 KB. Inlining the dozen icons we use is a Phase 11 task if Lighthouse asks for it.
37. **The store saves explicitly instead of using Zustand's persist middleware.** Switching between the real and demo namespaces is a plain read of another key, and every read goes through the versioned, validated loader.
38. **Theme and mode get their own tiny keys** (`weekfive:theme`, `weekfive:mode`). The head script reads the theme before first paint without parsing the whole plan, and the theme is shared by real and demo data.
39. **Route groups:** `(app)` has the header nav, check-in bar and phone tabs; `(flow)` (intro, start, onboarding, baseline) has only the wordmark, so nobody wanders off mid-setup.
40. **Dev pages use a `.dev.tsx` extension** and are compiled only in development or with `NEXT_PUBLIC_DEV_PAGES=1`, so `/dev/qr` never ships.
41. **Playwright drives the installed Google Chrome** (`channel: "chrome"`), so no browser download. Screenshots go to `artifacts/` and are not committed.
42. **Serif display titles get typographic apostrophes automatically** (`curl()` in primitives). Straight quotes look clumsy in Instrument Serif; body text keeps plain ones.
43. **`navigator.storage.persist()` is requested after the baseline photos, not on first load.** Firefox shows a prompt for it, and it means more once there are photos to protect.
44. **References show exactly what HANDOFF gives.** No author initials or details were added from memory.

## Phase 2 (2026-10-14)
45. **The intro is an overlay on the welcome screen, not a separate page.** `/start` hosts it on a first visit, so the ripple genuinely opens onto the real next screen and the QR pack details survive. `/intro` is kept for replaying from About; it swaps its URL to `/start/` when done.
46. **A static navy cover on `/start`, shown by the head script on first visits.** The welcome screen never flashes before the intro, even before JavaScript runs. The overlay removes it as soon as it mounts.
47. **The intro has its own scroll container** (700dvh track, sticky stage), so the page behind never moves, and ScrollTrigger scrubs one timeline against it. No pinning, no Lenis.
48. **The last segment releases the drop on a timer instead of a scrub.** Scrolling to the end, pressing Enter or the button plays a 1.8 s fall, rings and reveal, so nobody can get stuck half-revealed.
49. **The reveal is a radial mask on the overlay.** It is the one paint-heavy step and lasts under a second; everything else animates transform and opacity only.
50. **GSAP is imported only inside the intro's effect.** It never loads for returning visitors or on any other page. The intro adds about 4 KB to `/start`.
51. **Reduced motion gets a calm sequence**: the same six sentences, auto-advancing every 3.5 s, with Pause, Next and Skip, a static dropper and no ripple. It is also the fallback if the animation library fails to load.
52. **Keyboard:** arrow keys, Page Up and Down and Space step one beat; Enter releases at the end; Skip is always the first focusable control. The page behind is made inert while the intro is open.
53. **Measured smoothness:** with the CPU throttled 4x in Chrome, scrubbing the whole intro averaged 57 to 60 fps with a p95 frame time of 16.8 ms on desktop and phone viewports. This is a Playwright test, not a one-off check.
