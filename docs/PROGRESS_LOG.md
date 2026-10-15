# Progress log

## 2026-10-14, Phase 0: design and build doc

**Done**
- Installed Node 26.11.1 and pnpm 12.11.2 (Homebrew). Installed the curated design skill set globally in `~/.claude/skills`.
- Created the project folder, `git init`, repo-local git identity.
- Wrote `CLAUDE.md`, `docs/BUILD_DOC.md`, `docs/DESIGN_SYSTEM.md`, `docs/SCREENS.md`, `docs/CONTENT_BANK.md`, `docs/DATA_MODEL.md`, `docs/DECISIONS.md`, this log, and `docs/design-preview.html`.
- Measured contrast for every text token in both themes (all AA).

**Decisions:** see DECISIONS 1 to 23.

**Known issues / open questions for Tanmay**
- App name: keep "Week Five" or change it?
- Deploy target: GitHub Pages sub-path assumed (`/week-five`).
- Hinglish: planned for onboarding and insight cards in Phase 10 if time allows.
- Submission extras: screen recording or walkthrough script?
- Copy in CONTENT_BANK is a first draft for Tanmay's edit.

**Next step:** Tanmay reviews the docs and the design preview. On "go", Phase 1: foundation.

## 2026-10-14, design v2

**Done**
- Tanmay rejected the v1 look (phone mockups, glow, boxed cards). Rebuilt `docs/design-preview.html` as a responsive website: top nav, serif greeting, quiet ring with ripple hairlines, 24-week strip, hairline-divided rows, floating check-in bar, bottom tabs on phones, demo day jumper, light and dark.
- Rewrote `DESIGN_SYSTEM.md`, updated `SCREENS.md`, `BUILD_DOC.md`, `CONTENT_BANK.md`, `DECISIONS.md` (24 to 32).
- Checked at 1440, 1024 and 390 in both themes; no horizontal scroll; contrast re-measured.

**Answers from Tanmay:** name stays Week Five, GitHub Pages hosting, he records the video, Hinglish as planned.

**Next step:** Phase 1, foundation.

## 2026-10-14, Phase 1: foundation

**Done**
- Next.js 16.4 static export, TypeScript 6, Tailwind v4 with the v2 tokens in `src/app/globals.css`, Geist and Instrument Serif through `next/font`, theme script before first paint, light and dark.
- Shell: sticky header with Today, Map, Mirror, Mates, You; phone tab bar under 768 px; floating check-in bar; footer with the privacy, medical and independence lines; skip link. Route groups `(app)` and `(flow)`.
- Every route from the sitemap exists. Real now: `/` routing (intro, then setup, then Today), the intro's six beats as a readable list, `/start` reading and validating the pack QR, Today's greeting and day line, You (theme, sample-data switch), Your data (JSON export, two-step delete everything), About (full copy, predictions, sources, replay intro), 24 static week pages, 404. Others are honest placeholders naming their phase.
- Storage: zod/mini schemas, versioned loader that backs up unreadable data instead of deleting it, explicit-save Zustand store with separate real and demo namespaces, IndexedDB photo store (photos, masks, projections).
- Time: local calendar helpers, journey day, week, phase, photo windows, injectable clock for demo days.
- Demo plumbing: three fictional personas with 24 weeks of generated check-ins and doses, "Demo, day 35" chip with the day jumper and persona picker.
- PWA: manifest (scope respects the base path), icons rendered from the mark, offline service worker.
- Tooling: `pnpm check`, Vitest (37 tests), Playwright on the installed Chrome (21 smoke tests across phone, tablet, desktop; 54 screenshots), copy checker for dashes and banned words, static server that mimics GitHub Pages. Sub-path build under `/week-five` verified.

**Decisions:** 33 to 44.

**Known issues**
- First-load JS is 202 to 207 KB gzipped against a budget of about 200 KB; the React and Next floor is about 171 KB. Inlining icons in Phase 11 would bring it under.
- Full-page screenshots show the fixed check-in bar mid-page; that is a screenshot artefact, not a layout bug.

**Next step:** Phase 2, the scroll intro.

## 2026-10-14, Phase 2: the scroll intro

**Done**
- Line-art dropper (bulb, glass, graduations, liquid) and a navy stage. Scroll, swipe or keys drive one GSAP timeline: the dropper turns upright, the bulb squeezes, the liquid drops in two steps, a drop forms at the tip and swells while a surface line appears, with the six beats fading in and out in the serif.
- At the end (scroll, Enter, or "Let's set up your plan"), the drop falls, squashes on the surface, three rings spread, and a growing circle opens the overlay onto the welcome screen, whose content rises into place as it is revealed.
- Skip intro always visible. Progress line along the bottom. Screen-reader version of all six sentences. Page behind made inert. Reduced-motion calm sequence with Pause, Next and Skip.
- First-paint cover so `/start` never flashes; GSAP loaded lazily; `/onboarding` and `/home` prefetched while the intro plays.
- Tests: 6 new e2e tests (calm path, skip, inert background, demo mode, replay, keyboard release) plus a 4x CPU throttle frame-rate test on phone and desktop (57 to 60 fps, p95 16.8 ms).

**Decisions:** 45 to 53.

**Known issues:** none new. Page weight unchanged from Phase 1 apart from about 4 KB on `/start`.

**Next step:** Phase 3, QR entry and the onboarding story.

## 2026-10-14, design v3 and Phase 3: QR entry and the setup story

**Done, design v3**
- Studied Turion Space and Morpho frame by frame at 1440 (headless Chrome captures) and took their grammar: one 3D object as the camera's vehicle, a camera travelling round concentric rings, two-voice headlines, chapter names and a segmented progress.
- Concept: one drop, twenty four rings. A light 3D pool (Three.js 0.186) behind every flow screen: glass dropper, a drop that falls, a ripple that freezes into the 24 week rings, rain on monsoon weeks, other people's drops.
- Rebuilt the intro on the pool: six two-line beats with notes and chapter names, 24-tick progress, labels on the rings, release that settles the camera onto the welcome screen. Calm path cuts between the same 3D poses.
- New light tokens (ground matches the pool's fog), Geist 500 plus italic serif headline pairs, pill buttons, tone-filled controls, footer close with the name at full width. Light is now the default theme.
- Welcome screen rebuilt as an open layout over the rings, with the pack read from the QR as a chip.

**Done, Phase 3**
- Nine questions, one per screen, each with its why-we-ask as the serif turn; the camera takes a new view of the pool for each.
- Live map: the city puts rain on the weeks its monsoon covers, the start date lights "you are here", a line says what changed. Season logic in `src/lib/season.ts`, 30 cities with their own months.
- Draft saved after every answer; reopening resumes at the same question (and the welcome screen offers to carry on). Required: products, how they bought it, a valid start date.
- Plan summary at the end (day one, shed window dates, rains, photo days, verdict date), then the briefing: five cards for quick-commerce and pharmacy, three for the assessment route, with the rings lighting the weeks each card is about.
- `/dev/qr` renders real QR codes for every fictional pack.
- Tests: 18 new unit tests (season, setup rules, finishing the plan), 5 new end-to-end tests (full setup from a pack scan, resume, required steps, short briefing, demo). Intro tests updated for the 3D scene.

**Checks:** `pnpm check` passes (lint, types, 55 unit tests, copy check, build). 56 end-to-end tests pass across phone, tablet and desktop (1 skipped by design). The 3D intro holds 60 fps average, p95 16.8 ms, with the CPU slowed 4x on phone and desktop. Screens looked at in full motion at 1440, 1024 and 390, and under reduced motion.

**Decisions:** 54 to 80.

**Known issues**
- Today, Map, Mirror and the other app pages still use the v2 layouts under the v3 tokens; they move to v3 in their own phases (Today in Phase 5). `docs/design-preview.html` is the v2 render and is superseded for the flow screens.
- First-load JS for the flow screens grows by the Three.js chunk (lazy, after first paint). App pages are unchanged.

**Next step:** Tanmay reviews v3 and Phase 3. On "go", Phase 4: baseline capture.

## 2026-10-14, Phase 4: day-one photos

**Done**
- The lens: a round viewfinder set at the exact centre of the user's 24 rings, seen from straight above, scaled so it covers weeks 1 to 4 and weeks 5 to 24 spread out round it. It stays pinned to the rings while the page scrolls or reflows.
- Intro ("Three photos, two minutes."), then crown, hairline and parting, each with a two-voice headline, a ghost line drawing over the camera, a live light meter and a camera-app shutter row on phones. Front camera for the hairline, back camera with a 3 s timer (serif countdown, closing ring, cancellable) for crown and parting. Switch camera when there are two.
- Review with Keep and Retake. Keeping a photo sinks the still into the lens while a ripple runs out across all 24 rings (`engine.splash()`).
- No camera (denied, missing, insecure origin): the drawing on white glass, the reason, and "Choose a photo" (the gallery, or the phone's camera app). Never called "upload".
- Photos: centred square, at most 1600 px, never mirrored, EXIF dropped by re-encoding, saved to IndexedDB as week 0 with their light reading. One per view; a retake replaces the old photo and its mask.
- Optional painter: soft brush on any of the three photos (opens on the setup worry), three sizes, Undo, Clear, "Mark the middle for me" for keyboards; saved as a 512 px PNG mask.
- Close: "Day one, recorded. See you in week 4." with the date and hour of the next photos, the three photos with Retake and two-tap Delete, the marked area, Go to Today, and the install nudge (browser prompt or iPhone steps). The rings light the next photo week. A return visit opens here.
- The hour of the first photo is stored (`settings.photoHour`); `onboarding.baselineDoneAt` and `navigator.storage.persist()` once all three are kept.
- Pool engine: `lensRig`, `setOffset`, `splash`, and `reframe`, which fixes a Phase 3 bug where a resize could cancel a screen's entrance and leave it without rings.

**Checks:** `pnpm check` passes (lint, types, 74 unit tests, copy check, build). 68 end-to-end tests pass across phone, tablet and desktop (1 skipped by design), including the full camera path with Chrome's fake camera, the gallery path with camera access denied, delete and retake from the close, the cancelled timer and no sideways scroll. The live lens holds 60 fps, p95 16.7 ms, with the CPU slowed 4x on phone and desktop. Looked at every moment at 1440, 1024 and 390 with real frames (`artifacts/v3/baseline-final/`), plus the no-camera screen.

**Decisions:** 81 to 98.

**Known issues**
- Demo personas have no photos yet, so a reviewer in demo mode sees the intro on /baseline. Demo head drawings for Today and the mirror come with Phase 5.
- Photos from the gallery keep the middle square; there is no crop adjuster.
- The week-4 reminder itself (banner, .ics, notification) is Phase 8; the close already says when.

**Next step:** Tanmay reviews Phase 4. On "go", Phase 5: Today (the home dashboard) moves to v3.

## 2026-10-14 to 15, Phase 5: Today

**Done**
- Today on the pool: the camera looks down on the user's 24 rings (weeks behind firmer, this week lit, shed window, rains, photo days), with labels on the rings, and six other drops landing once. The greeting in two voices, a line of 24 ticks with "Day 35 of 168" and the percentage, and today's note, with the day-one photo beside it when the note is about it.
- A sheet over the water: Today (slots from the products, one-tap done with a ring, streak), Day one and now (baseline next to the latest photo of the worry area, empty and loading states), Supply (runway level, reorder link at 10 days or less, held for 24 hours after an uneasy check-in, snooze), People who started when you did (seeded demo community), the week-24 teaser, and Thinking of stopping.
- Check-in: the capsule opens a native modal sheet (bottom on phones, right panel from 768 px); five word pills for hair fall and worry, missed applications, red flags, note. The answer replaces the form: the response matrix, the day-one photo and the ticks when doubt meets the shed window, a doctor card for any red flag. `/checkin` has the same form as a page. The bar pulses once until the first check-in.
- Night pool for the dark theme (pool colours are now CSS tokens), pool pause when covered, free-running cohort drops.
- Demo mode draws sample heads on the device (three views, day one and every photo week), labelled as drawings.
- Fixed: Today's clock now moves on when data is saved, so a fresh check-in counts at once. Head drawing styles moved to the global stylesheet (they were only loaded on /baseline).

**Checks:** `pnpm check` passes (lint, types, 93 unit tests, copy check, build). End-to-end: 7 new Today tests (demo day 35 reframe, fresh plan and doses, check-in sheet, red flag and Escape, reorder hold, check-in page, dark) plus the existing suites, across phone, tablet and desktop. Today holds 60 fps, p95 16.7 ms, with the CPU slowed 4x on phone and desktop, and draws nothing once scrolled past the hero. Frames looked at in light, dark and a fresh plan at 1440, 1024 and 390 (`artifacts/v3/today-final/`).

**Decisions:** 99 to 116.

**Known issues**
- Today's note is the compact Phase 5 rule list; the full engine, "Why am I seeing this?", the letter reveal and the breathing circle are Phase 6.
- Links from Today to Mirror, Projection, Mates, Reorder and Pause land on their placeholder pages until their phases.
- Phone hero copy is tight when the note is long and the day-one photo sits beside it (checked at 390 by 844).

**Next step:** Tanmay reviews Phase 5. On "go", Phase 6: the map, week pages, the reassurance engine, the stop flow and the letter.

## 2026-10-15, Phase 6: the map, the engine, the note and "Before you stop"

**Done**
- Reassurance engine: 52 cards in `src/content/insights.json` (the content bank's 51 with both variants, plus "paused-now"), structured triggers, red flags first, seven-day rest for ambient cards, a daily variant, a daily log. Today now uses it, with "Why am I seeing this?" (reasons from the trigger, full sources), the breathing circle and no numbers for the night card, a doctor link on red flags, and the note with day one beside it in weeks four and five.
- The map on the pool: a week picker that moves the camera ring by ring and lights the chosen ring, the rains in words, a legend, and a sheet with all 24 weeks by phase, the note, and the way out. Week pages for all 24 weeks (what often happens, what to do, not a reason to worry, when to see a doctor, sources) share the map's pool.
- The note: write and seal it on the map, sealed until day 22, then read on purpose in a sheet; revealed in the stop flow whenever that is reached.
- "Before you stop": day one at the centre of the rings, where you are, the note, the fact, three equal options. Pause with a date and a calendar file; keep going; a printable page for the doctor (also linked from red-flag notes). Every choice, and closing without one, is logged.
- Shared `Sheet` and `useLensAnchor`; a small `.ics` builder for Phase 8 to extend.

**Checks:** `pnpm check` passes (lint, types, 103 unit tests, copy check, build). End-to-end: 9 new tests (map picker and week pages, all sections, sealed and read note, writing a note, why sheet, the stop flow's keep going, pause with calendar, close, doctor page), Today tests updated for the engine's variants, sideways-scroll and phase screenshots extended to the new routes; 116 end-to-end tests pass across phone, tablet and desktop, 1 skipped by design, plus 78 phase screenshots. The map holds 60 fps, p95 16.7 ms, at 4x CPU throttle and stops drawing once scrolled. Frames at 1440, 1024 and 390 in `artifacts/v3/journey-final/`.

**Decisions:** 117 to 132.

**Known issues**
- The Desktop folder syncs to iCloud; a rebuild once left duplicate "… 2" folders in `out/` until a clean rebuild (DECISIONS 132). Worth excluding the project from iCloud.
- Adding a layout needs a fresh `pnpm build` before `pnpm typecheck`, or stale generated route types fail it.
- Monthly photo links on Today still go to the Mirror placeholder (Phase 7).

**Next step:** Tanmay reviews Phase 6. On "go", Phase 7: the mirror and the projection.

## 2026-10-15, Phase 7: the mirror and the week-24 illustration

**Done**
- The mirror on the pool: day one in a round lens at the centre of the rings, the later photo behind a divider (drag, or keys on the handle), "Show day-one outline", the views, captions with dates, a lighting warning, and a turn line that sets the expectation for each week. Choosing a later week raises the camera so the weeks in between pass under the lens and that week's ring sits lit at the rim.
- The six photo weeks as a strip of round photos (the flat twin of the amber dots) and, on the sheet, every photo day with its three photos, status (saved, due now, a few days late, missed, too soon after day one), Take photos, Retake and Compare. Tips for photos that compare. The prompt when a week is due.
- Monthly photos through the day-one capture (`/baseline/?week=N`): week N's ring at the lens's rim, day one laid faintly over the camera, a close that goes to the comparison. Today's "Week N photos" opens it directly.
- The week-24 illustration: `PredictionProvider` with `LocalSimulationProvider` (on the device, deterministic, time-sliced, limited to the head) and a disabled `RemoteModelProvider` that records the contract. Thinking in three stages over about 3.6 s, with the camera rising until week 24's ring sits at the rim, then the illustration beside day one in the same lens, its label under it, the time copy, "How this picture is made". Empty states for no photos and no painted area; the painter comes back to the illustration. Today and the mirror show the latest illustration.
- Demo: painted areas for each sample person, the worried person's week 8 under a bathroom bulb, photos dated by the demo clock.
- Pool: opt-in fog scale, lens framing by rim week (`rimBelow`), shared `useLensAnchor` rim argument.

**Checks:** `pnpm check` passes (lint, types, 123 unit tests, copy check, build). End-to-end: 134 pass across phone, tablet and desktop, 1 skipped by design, 18 of them new (mirror compare and keys, lighting warning, empty mirror, monthly photos with the fake camera, the illustration and its storage, the painter round trip), plus the new routes in the sideways-scroll test; 96 phase screenshots (light and dark). With the CPU slowed 4x at 60 Hz the mirror holds 60 fps (p95 16.7 ms) and the illustration's sequence 59.4 fps (p95 16.7 ms); its only long task is the 54 ms route load. Frames at 1440, 1024 and 390 in `artifacts/v3/mirror3/` and `mirror4/` (`node artifacts/tools/v3-mirror.mjs <dir> http://localhost:4400 [desk|tab|phone]`).

**Decisions:** 133 to 152.

**Known issues**
- The illustration has only been seen on the demo drawings and a test drawing: no real photos are allowed in the repo. Worth trying on your own photos locally.
- On battery under 20 percent, Chrome's Energy Saver caps every page at 30 fps, and the intro's frame-rate tests fail. Measure on mains power (or with `--disable-frame-rate-limit` for a rough check).
- The Desktop folder still syncs to iCloud (decision 132).

**Next step:** Tanmay reviews Phase 7. On "go", Phase 8: routine, reorder and reminders.

## 2026-10-15, Phases 8 to 12 in one run, plus the phone view

Tanmay asked to finish the whole app in this run instead of phase by phase, and to add a button that shows the site inside a phone.

**Done**
- **Phone view:** a side button on the right edge of every wide screen opens a white page with the live app inside a phone at its centre (360, 390 or 430 wide, status bar and home strip in the page's colours, reload). It shares this window's data, the big screen's pool pauses underneath, and closing it brings the big screen to wherever the phone was. Hidden on phones and inside the phone itself.
- **Phase 8, routine, supply and reminders:** the routine rule table and suggestions; Supply (`/reorder`) on the pool with the weeks the pack covers lit, the level, the reorder only after reassurance (held for 24 hours after an uneasy check-in, with a sentence saying so), snooze, packs (add by hand, remove, scan a second pack after setup), what is coming up; one reminder schedule for the calendar file, an opt-in daily-times calendar file with repeat rules, the in-app banner (one due thing at a time) and notifications while the app is open, with a tap opening the right page through the service worker.
- **Phase 9, journey mates:** `CohortProvider` with `LocalSimCohort` and a switched-off `RemoteCohort`; Mates on the pool with the cohort's drops landing and their names, a fortnight of events, local nudges (your ripple crosses the rings), the production panel and invite (share sheet or copied link).
- **Phase 10, You and data:** every setup answer editable in place, routine times, the week strip with roller nights, suggestions, reminders, theme, Hinglish for the setup story and the daily notes (also switchable on the welcome screen), sample data, storage used on Your data.
- **Phase 11 and 12:** a shared stage grammar for app pages, the phone header holding at 360, README for judges, MIT licence, GitHub Pages workflow, docs updated. Not pushed.

**Checks:** `pnpm check` (lint, types, 136 unit tests, copy check, build). End-to-end: 160 pass across phone, tablet and desktop (2 skipped by design), 13 of them new (supply runway and pack, the reorder hold, a second pack scan, mates and a nudge, editing an answer, Hinglish, routine times, the banner, the phone view), plus 108 phase screenshots in light and dark with no page errors. Frames for Supply, Mates, You and the phone view at 1440, 1024 and 390 in light and dark (`node artifacts/tools/v3-rest.mjs <dir> <base> [desk|tab|phone|all]`). Not measured this run: frame rates of the new pages (they reuse the pool and pause it under the sheet like Today).

**Fixed on the way:** the welcome screen crashed on a first visit (a store selector returned a new empty list every render); a camera test assumed photo hours never land at midday.

**Decisions:** 153 to 172.

**Known issues**
- The phone view needs a same-origin page, so it works locally and on GitHub Pages, not inside a third-party frame.
- Notifications fire only while the app is open (by design: scheduled push needs a server).
- The Desktop folder still syncs to iCloud (decision 132).

**Next step:** Tanmay reviews the whole app and the phone view. Then push to GitHub and switch Pages to GitHub Actions.
