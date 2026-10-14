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

## Design v3 (2026-10-14, after Tanmay's review of v2)
54. **Light, 3D, cinematic, from Turion Space and Morpho.** Tanmay didn't like v2 and asked for an Awwwards-style 3D layout in light mode that flows like those two sites. Studied both frame by frame; see DESIGN_SYSTEM "What the references taught". Replaces decisions 25 and 28 for the flow screens.
55. **One idea carries it: one drop, twenty four rings.** The dropper is the camera's vehicle (Morpho's can); the ripple seen from above is the 24-week map (Turion's orbits). It belongs to this product and no other.
56. **A shared 3D pool behind the flow layout.** Intro, welcome, setup and baseline sit on one Three.js scene that stays mounted between routes, so the camera travels instead of cutting.
57. **Three.js, imperative, no React Three Fiber.** One small engine class with plain `rig` and `state` objects suits GSAP scrubbing and keeps the dependency count down. It loads only on flow screens, after first paint.
58. **The water is one shader, not geometry.** Ripples, rings, rain and dots are per-pixel slopes and lines. It looks the same at any size and costs one draw.
59. **Light is the default theme; flow screens are always light.** Dark stays selectable in You for app pages. The theme toggle leaves the flow header. Replaces decision 28.
60. **Headlines in two voices.** Geist 500 says what happens, Instrument Serif italic says how it feels or why. Replaces decision 26's "serif for people" rule; the user's letter stays in the serif.
61. **Pill buttons and tone-filled controls, no hairline boxes in the flow.** The taste skill's square-or-round rule, decided once: round, like a drop.
62. **The intro's beats are rewritten as two-line pairs with a note and a chapter name.** Same six ideas as before, shorter lines so the sans line fits one line on desktop.
63. **The intro overlay is transparent and the page behind is hidden with `visibility`.** The ripple mask of v2 is gone; the camera settling on the welcome screen is the reveal.
64. **The first-visit hold is a style block that only /start renders.** A `:has()` rule on `<html>` was not re-evaluated by Chrome when the flag was removed, which left the page hidden and unfocusable.
65. **Focus moves to the page once it is actually visible.** Under reduced motion every property gets a 1 ms transition, `visibility` included, so same-frame focus landed nowhere.
66. **Reduced motion keeps the 3D but cuts between settled poses.** The water stops moving and nothing travels; the story still has its pictures. The SVG fallback remains for no WebGL.
67. **Labels on the scene are fewer on phones.** Only one or two at a time, placed up and left so their text runs on screen; the live line says the rest in words.

## Phase 3 (2026-10-14)
68. **Setup answers are saved as a draft inside `onboarding`** (`onboarding.draft`, every field optional), so closing the tab resumes at the same question. Adding an optional field keeps old documents valid, so the schema version stays 1.
69. **The pack scan pre-ticks products and offers its purchase day as a start-date pick**, but never overwrites an answer already given.
70. **Each question's "why we ask" is its serif turn.** Short, always visible, never a tooltip.
71. **Single-choice questions advance by themselves 360 ms after a pick.** The pick registers visibly (fill, tick, ring) before the camera moves on.
72. **Skipping the city means June to September**, which covers most of India. "Somewhere else" asks one yes, no or not sure question; not sure counts as yes.
73. **Cities carry their own monsoon months** (`src/content/cities.ts`, 30 cities). Tamil Nadu and Puducherry get October to December; Bengaluru, Mysuru and Visakhapatnam run to October.
74. **The rains are drawn on the weeks they cover, not only where they meet the shed window.** The live line says whether they overlap it.
75. **Start dates may be up to a year back or two months ahead.** Validated with a plain reason when out of range.
76. **Reminder times default by age band** (from 07:00 and 20:30 for 45 and up, to 09:00 and 22:30 for 18 to 24). Times only, never amounts.
77. **The plan is saved when the last question is answered**, before the briefing, so leaving during the briefing still leaves a plan. The root route sends people back to setup only while it is unfinished.
78. **A blank name stays blank in the profile**; greetings already say "you".
79. **The briefing is a step inside /onboarding (`?step=briefing`)**, with swipe, buttons and arrow keys, and lights up the weeks each card is about. It ends on /baseline (Phase 4).
80. **The dev QR page renders real codes with `qrcode`** (a dev dependency, never in production bundles) for every fictional pack, with an editable purchase date and batch.

## Phase 4 (2026-10-14)
81. **The viewfinder is a round lens at the centre of the rings.** Day one is the middle of the map, so the camera looks straight down on the pool and is scaled so the lens covers weeks 1 to 4; weeks 5 to 24 spread out round it. Its one bold moment: keeping a photo drops it into the water.
82. **Photos are the centred square of the frame**, at most 1600 px, JPEG at 0.9. What the round lens shows is what is kept, and every month compares the same shape whatever phone or camera took it.
83. **Front camera for the hairline, back camera with a 3 s timer for crown and parting.** You can watch yourself for the hairline; nobody can see a screen above their head. Both are switchable and the timer can be cancelled.
84. **Stored photos are never mirrored.** The front camera preview is mirrored like a mirror, but comparisons have to stay true month to month whichever camera is used.
85. **"Choose a photo", never "upload".** Nothing is uploaded anywhere, and the copy must not suggest otherwise. The camera-denied line now says "pick photos from your gallery".
86. **The light meter reads the middle 80 percent of the square** (the edges are usually the room), at 64 by 48, every 250 ms. Thresholds stay 70 and 190; a still outside them gets a gentle retake suggestion, never a block.
87. **Keeping a photo is a drop.** The still sinks and `engine.splash()` sends a ripple across all 24 rings on its own clock, so camera glides never cut it short. Nothing moves under reduced motion.
88. **`engine.reframe()` for resizes.** The resize handler from Phase 3 used `set()`, which cancelled the entrance glide whenever the first resize callback landed after it, leaving a screen with no rings. Reframing now moves only the framing and lets the glide finish.
89. **`engine.setOffset()` pins the rings to the lens** while the page scrolls or reflows, without touching the camera rig or a running glide.
90. **One baseline per view.** A retake replaces the older week-0 photo along with its mask and projections (`keepPhoto`).
91. **Masks are 512 px PNGs whose alpha is the area**, one per photo; painting nothing deletes the mask. "Mark the middle for me" is the keyboard path, since a brush needs a pointer.
92. **The painter opens on the worry from setup**: hairline to the hairline photo, crown to the crown, seeing my scalp to the parting, anything else to the crown.
93. **Next photos are the first photo week at least 14 days after the baseline**, at the hour it was taken (`settings.photoHour`, an optional field, so the schema stays version 1).
94. **`navigator.storage.persist()` is asked for once all three are kept** (decision 43), and the close carries the install nudge: the browser's own prompt when it offers one, the iPhone steps otherwise. AppRuntime catches the prompt at boot.
95. **Deleting a photo takes a second tap** ("Delete it") within five seconds. No modal; retaking is one tap away.
96. **The baseline screens reuse setup's HUD, field styles and transitions** (`onboarding.css`), so the flow reads as one story from the first question to the last photo.
97. **Demo mode can use /baseline on its own photo database**, so a reviewer can try the camera without touching real data. Demo head drawings for Today and the mirror come in Phase 5.
98. **Capture screenshots use an abstract drawn head as Chrome's fake camera** (`artifacts/tools/fake-head-video.mjs`). It is not a person and never ships.
