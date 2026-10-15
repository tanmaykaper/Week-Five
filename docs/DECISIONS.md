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

## Phase 5 (2026-10-14 to 15)
99. **Today sits on the pool, and the rings are the progress ring.** Weeks behind you are drawn firmer, your week is lit, and a line of 24 ticks says the same thing in numbers. One object for the map everywhere, instead of a separate dial (kickoff 3.5's ring, done the v3 way).
100. **A sheet rises over the water for the rest of Today.** The hero stays an open scene; the routine, photos, supply and mates sit on a full-width surface with open sections, not a grid of identical cards.
101. **The pool follows the theme on app pages.** Its colours are CSS tokens; dark gets night water (light rings on deep blue). Flow screens stay daylight.
102. **The pool pauses when the sheet covers it** (`setPaused`), so a scrolled Today costs no GPU time.
103. **Today's note is a compact rule list in Phase 5** (`src/lib/today-note.ts`: the content bank's ids, variant A, red flags first). Phase 6 replaces it with insights.json, both variants, the seven-day cooldown and "Why am I seeing this?".
104. **Check-in answers ship with the check-in (Phase 5), not with the engine (Phase 6).** A check-in that saves without answering would be a dead end, and a red flag must never get a cheerful "Saved".
105. **Hair fall and worry are five word pills with nothing preselected**, not sliders. A slider has to start somewhere, and wherever it starts anchors the answer. Native radios underneath, so arrow keys work.
106. **The check-in is a native `<dialog>`**: focus trap, Escape and focus return come with the platform. Bottom sheet on phones, a right-hand panel from 768 px.
107. **Doubt means hair fall or worry at 3 or more, or any red flag.** It drives the answer, the note, and the reorder hold.
108. **The reorder link shows only at 10 days or less, and never within 24 hours of an uneasy check-in or while snoozed.** Above 10 days Supply just shows the level. The link opens manmatters.com in a new tab.
109. **Slots come from the products, without amounts:** solution or foam morning and evening, serum mornings, gummies evenings "with food". Routine rules and roller nights come in Phase 8.
110. **The streak counts days with every active slot done**, and an unfinished today doesn't break it; it shows nothing at zero.
111. **Demo photos are drawings made on the device** the first time demo mode needs them: three views for day one and each photo week, density dipping in the shed window and coming back modestly. They are labelled "Sample drawings for the demo, not photos of anyone."
112. **Anything in a demo plan dated after the demo clock is invisible** (doses, check-ins, photos), since the persona's 24 weeks are generated up front.
113. **The journey clock moves on whenever saved data changes**, not just once a minute, so a check-in saved a second ago is never treated as being in the future.
114. **The cohort is seeded from the start date** (40 fictional people within two weeks, first names and cities only). Phase 9 wraps it in the CohortProvider; Today shows the count in your start week and one event.
115. **Other people's drops land once on Today, on their own clock** (`landCohort`), after the rings spread. Nothing under reduced motion.
116. **The night card says "breathe slowly"** until Phase 6 brings the breathing circle the content bank describes.

## Phase 6 (2026-10-15)
117. **Insight cards are data with structured triggers** (`insights.json`: `when`, `refs`, `attach`, two variants), parsed from the content bank so the copy stays in one editable file. The engine only interprets triggers; it holds no copy.
118. **Ambient cards (priority under 80) rest for seven days after being shown; situational ones (80 and up) can repeat.** Red flags, photo weeks, high-shed reframes and night cards should show whenever they apply; "why shed at all?" should not greet someone every morning. Today's pick never changes during the day.
119. **Variants are picked by a hash of the date and the card**, so the same card reads the same all day and can change the next.
120. **"Why am I seeing this?" builds its sentence from the card's own trigger and the person's data**, not from hand-written reasons, so it can't drift from the rules. Sources print in full; the leaflet and the routine table get their own lines.
121. **The note leads Today in weeks four and five while it's sealed (priority 85), with the day-one photo and "Compare with day one" beside it.** That one screen is the definition of done's "baseline, map and letter".
122. **The map is the pool; the picker moves the camera ring by ring.** Previous and next buttons and arrow keys are the accessible way; the 24 bars are a pointer shortcut. One pool is shared by `/map` and the week pages through a nested layout.
123. **Week copy is phase text plus each week's own turn and line**, with full sections only where the week matters (3, 4, 5, 8, 12, 16, 20, 24). Hedged ("commonly", "for many people"); the doctor section always lists the red flags.
124. **The note opens in a sheet that lives in the app layout.** Reading it changes the screen that held the button, so the sheet can't belong to the button.
125. **Reaching the note in "Before you stop" reveals it, whatever the week** (`revealedIn: "pause"`): that is the moment it was written for.
126. **The three stop options are identical in size, tone and weight**, with "Close without choosing" under them. Every choice and the close are logged as intercepts; none of them nags later.
127. **A pause never resets the clock.** It adds the "paused-now" card until the restart date, then "restart-after-pause" for three weeks. "Keep going" clears a pause.
128. **The restart reminder is a one-event .ics built on the device** (floating local time at the morning routine time). Phase 8 extends `src/lib/ics.ts` to every reminder.
129. **"Talk to a doctor" is a one-page summary**: dates, product names (no amounts), how they bought, recent check-ins, anything flagged, three questions, a disclaimer, and a print stylesheet. Red-flag notes link to it directly without logging a stop choice.
130. **The lens anchor became a shared hook** (`useLensAnchor`) used by day-one photos and the stop flow, and it re-syncs its offset right after anchoring.
131. **`AGENTS.md` is ignored.** `next dev` writes it (Next's own agent notes, with dashes); it isn't ours.
132. **The project sits in an iCloud-synced Desktop folder.** A fast rebuild of `out/` once produced "home 2"-style duplicate folders and 404s; a clean rebuild fixed it. Excluding the folder from iCloud (for example renaming it `week-five.nosync` with a `week-five` link) would stop it for good; that is Tanmay's call.

## Phase 7 (2026-10-15)
133. **The mirror is a round lens at the centre of the rings, with day one in it**; the later photo shares the lens behind a divider. Day one is the middle of the map, as with the camera lens and the stop flow.
134. **Choosing a later week raises the camera**: the weeks in between pass under the lens and that week's ring sits lit just outside its rim (`rimBelow()`, about 24 px out at any lens size, so it never hides under the glass). Time passing is a camera move, not a page change.
135. **The pool has an opt-in fog scale** (`fog`, default 1), so views from high above don't fade into the ground. Every earlier pose is unchanged.
136. **The compare slider:** drag anywhere on the lens (sideways only, so vertical scrolling still works on touch), or arrow keys, Page Up and Down, Home and End on the handle. Day one is on the left.
137. **"Show day-one outline" lays day one at 35 percent over the later photo** (BUILD_DOC F14), off by default, to check the two line up.
138. **A lighting warning when mean luminance differs by more than 25.** The worried sample person's week-8 set is drawn under a bathroom bulb so a reviewer can see it.
139. **Each comparison's serif turn sets the expectation for that week** ("Four weeks in. Expect no change yet." up to "Now it's a fair test."), so the mirror keeps the app's one job: making the wait readable.
140. **Photo weeks are due from two days before to five after, then "a few days late" for ten more** (the same window as the photos-late note), then missed. Weeks under 14 days after a late day one are "too soon" (decision 93), and Today's photo notes now follow the same rule.
141. **Monthly photos reuse the day-one capture** (`/baseline/?week=N`): the same lens with week N's ring lit at its rim, day one laid at 30 percent over the camera (mirrored with the preview) in place of the outline drawing, no painter, and a close that goes to the comparison.
142. **Photos are dated by the journey clock**, so a photo taken on demo day 27 counts on day 27. The capture flow ignores photos dated after the clock, since a demo plan holds all 24 weeks up front.
143. **The projection is a PredictionProvider** with the LocalSimulationProvider on and the RemoteModelProvider off (it only records the contract). The pixel work is pure (`sim-core.ts`): it reads hair and scalp tones in the painted area, moves bare skin a little towards the hair's colour, and draws seeded fine hairs along the photo's own hair direction (a structure tensor) blended with a default per view. Deterministic and unit tested.
144. **The illustration only touches the head.** A chroma test (YCbCr skin range) limits the softening to skin, and hairs are drawn only over skin or hair, so a rough area that spills onto the wall never grows hair there.
145. **The strength is fixed and small**: fine hairs over about a quarter of the bare scalp, which closes about 11 percent of the gap between a thin patch and the hair around it in the unit test. One typical case, never a best case.
146. **The pixel work is time-sliced** (a generator that yields between passes and every 24 hairs). With the CPU slowed 4x it adds no long task to the thinking sequence.
147. **Thinking takes about 3.6 s**: three stages of 1.2 s (0.7 s under reduced motion), never shown ahead of the provider's real progress. Each stage sends one ripple out from under the lens; during "Estimating a typical outcome" the camera rises until week 24's ring sits at the rim, while the weeks count up beside the stage.
148. **The illustration is shown in the same compare lens as the mirror**, sliding in from the right, with the permanent label under the lens (never on it) and captions naming both sides. This replaces the v2 side-by-side, so both pictures stay the same size and line up.
149. **One illustration per photo**, kept on the device. Repainting the area deletes it. Today's and the mirror's "What week 24 can look like" show the latest one.
150. **"Change the marked area" opens the existing painter** (`/baseline/?step=paint&then=projection`) and comes back, rather than embedding it in an app page, where its always-light controls would break the dark theme.
151. **Demo plans carry a painted area for each sample person**, so the illustration works in the demo without painting first.
152. **The mirror and the illustration share one pool** (`mirror/layout.tsx`), like the map and its weeks.

## Phases 8 to 12, in one run (2026-10-15)
Tanmay asked to finish the app in one run instead of stopping after each phase, and to add a phone view.
153. **Routine suggestions are a rule table** (`src/content/routines.ts`, 13 rules) filtered by products, age band, the city's rains this month and the gap between the two times. Wording and default times change; amounts never appear (a unit test scans every rule for units).
154. **The "about twelve hours" tip gives way to an even-gap tip** when the two times are 4 or more hours off twelve, rather than showing both.
155. **Roller nights are picked on a Monday-first week strip** in You and stored as `getDay()` values, which the insight engine already used.
156. **One reminder schedule feeds three outputs** (`src/lib/reminders.ts`): the calendar file, the in-app banner and notifications. Weekly check-ins at the evening time, photo days at the hour of the day-one photos, the note on day 22, reorder at 10 and 3 days, the restart date.
157. **Daily times are a separate, opt-in calendar file** with repeat rules (`RRULE`), so the main file stays a handful of meaningful dates.
158. **The banner shows one thing at a time**, in this order: restart day, reorder at 3 days or less, photos due, the note, reorder at 10 days, a missed weekly check-in. It is hidden on the screen its action leads to and on check-in, pause and the illustration; dismissing it hides it until tomorrow.
159. **The banner sits on the page under the header and scrolls away** rather than floating fixed, so it never covers section titles.
160. **Notifications only while the app is open** (the due item once per id, and the next application of the day if it is within six hours), through the service worker when there is one so a tap opens the right page. Real mode only: the demo clock is synthetic.
161. **Supply lights the weeks the pack still covers** on the rings, with "Pack runs out, week n" on the last one. The reorder link appears at 10 days or fewer, never within 24 hours of an uneasy check-in (it says so), and not while snoozed.
162. **A pack can be added by hand or by scanning its QR after setup.** The newest pack sets the runway; products on a new pack join the routine. Duplicates (same code, date and batch) are ignored.
163. **Journey mates go through a `CohortProvider`** (`src/lib/providers/cohort/`): `LocalSimCohort` (seeded 40 fictional people, events from each person's own day over the last two weeks) and a `RemoteCohort` stub that documents the contract and ships switched off. Today's glance reads the same people.
164. **Names appear on the water as their drops land**, and sending a nudge sends your own ripple across the rings. Nudges are logged locally, one per person per day.
165. **Nudges on phones are a round button** so the sentence keeps the width.
166. **You edits every setup answer in place** (one row opens at a time, explicit Save), plus routine times, roller nights, reminders, theme and language.
167. **Hinglish covers the setup questions and the daily notes**, as the kickoff allowed. The card chosen never changes with the language, only its line. The switch is on the welcome screen and in You.
168. **App pages on the pool share one grammar** (`components/ui/stage.css`, `StagePool`): hero on the water, words left and rings right, then the sheet. Your data and About stay plain reading pages.
169. **Phone view is a side button on the right edge of wide screens** (shaped like a phone's side button), not a header control, because every corner is already used by the intro's HUD, the check-in bar or the demo chip.
170. **Phone view runs the real app in a same-origin iframe** at 360, 390 or 430 wide, so every phone rule applies and the data is shared. The big screen's pool stops drawing while it is open, and closing it navigates the big screen to wherever the phone was.
171. **The page around the phone is always white**, whatever the theme, as asked; the status bar and home strip take the colours of the page inside.
172. **MIT licence and a Pages workflow** that runs lint, types, unit tests and the copy check before building under `/week-five`. Not pushed.
