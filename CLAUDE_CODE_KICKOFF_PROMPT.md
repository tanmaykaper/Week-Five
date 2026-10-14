# Claude Code kickoff prompt: "Week Five" (working title)

How to use: put HANDOFF.md (from earlier) in an empty project folder, put this file next to it, open Claude Code in that folder and paste the block below the line. Everything after that is phase by phase. Claude Code will stop for your approval at the end of Phase 0 (design and build doc) and at the end of every phase after it.

---

## PASTE FROM HERE

You are my lead product designer and senior front-end engineer. We are building a polished, mobile-first web app for the Mosaic Fellowship Builder Challenge (brand: Man Matters). The app has to look and feel like a real consumer product, not a hackathon demo. Aesthetics and interaction quality are the main way this submission will stand out, so treat motion, typography, spacing and responsiveness as first-class requirements rather than finishing touches.

Read HANDOFF.md first, completely. It holds the research, the problem ("the week-five cliff"), the behavioural logic and the guardrails. This prompt extends and, where it conflicts, overrides the feature scope in HANDOFF.md (section 3 below lists the overrides).

We are building locally only for now. Run `git init`, commit locally after every phase, and do NOT add a remote or push anything. I will push to GitHub later, so keep the project ready for static hosting on GitHub Pages (see the technical section).

### 1. Operating rules (follow these every session)

1. Create a `CLAUDE.md` in the project root in Phase 0 containing: the project summary in five lines, the resume protocol below, the copy rules, the tech stack, and the phase list with status. Keep it short; point to `docs/` for detail.
2. **Resume protocol:** at the start of every session, read `CLAUDE.md`, `docs/BUILD_DOC.md` and `docs/PROGRESS_LOG.md`, tell me in three lines where we are, then continue with the next unfinished phase. At the end of every session, update `docs/PROGRESS_LOG.md` (done, decisions made, known issues, next step).
3. Work strictly phase by phase. At the end of each phase: run lint, typecheck, unit tests and a production build; capture Playwright screenshots at 390x844 (phone), 768x1024 (tablet) and 1440x900 (desktop) of every screen touched; look at them yourself and fix visible problems; commit; then stop and give me a short report (what shipped, screenshots taken, open questions, how to run it). Wait for my "go" before starting the next phase.
4. Do not ask me questions you can answer yourself. Pick a sensible default, record it in `docs/DECISIONS.md` with a one-line reason, and move on. Ask only when a decision is expensive to reverse or changes the product.
5. Use any relevant skills you have available. In particular use a frontend-design skill for every visual decision, and apply current React and Next.js best practices (server and client component boundaries, `next/font`, `next/image`, Suspense, avoiding unnecessary client JS, no layout shift). Check the installed Next.js version's docs before using an API from memory.
6. **Copy rules for every user-facing string, doc and comment:** no em dashes, no en dashes (use commas, full stops or the word "to"), no filler AI vocabulary (delve, navigate, journey-as-cliche, unlock, seamless, leverage, empower, holistic, elevate, tapestry), short human sentences, you-focused, a little dry humour allowed, never preachy. Before finishing any phase, grep the repo for the characters U+2013 and U+2014 and remove them.
7. Never put any real person's name, phone number, quote or photo in the repo, the demo data or the docs. Demo people are fictional. Never use Man Matters logos, product photography or trademarked assets. The app is an independent concept built for the challenge and must say so on the About screen.

### 2. What the product is

A companion web app that a new Man Matters hair-regrowth customer opens by scanning a QR code on their pack, and keeps using for 24 weeks. It exists to fix one problem: customers quit between weeks 3 and 7, the exact window in which shedding is normal, because nobody prepared them for it and they cannot see their own progress. The app gives them **a map** (what is normal, week by week, for their start date and season) and **a mirror** (baseline photo, progress tracking, a projection of a typical outcome, a reminder of why they started). It also keeps them company (journey mates) and nudges the reorder at the right emotional moment, after reassurance and not before it.

Core idea in one line: the app speaks the right sentence on the right day of the journey, like Flo does for a cycle.

### 3. Scope overrides and additions (these beat HANDOFF.md where they differ)

**3.1 Entry via QR code.** Each pack carries a QR code that opens `/start?sku=<product-code>&reg=<yyyy-mm-dd>&batch=<id>`. The app reads the product code and purchase or registration date from the URL, shows "Welcome, let's set up your plan", and starts onboarding. Build a small `/dev/qr` page (dev only, hidden from production nav) that generates sample QR codes for several fictional SKUs so I can demo scanning with a phone against the local network. The URL parameters carry no personal data. If someone opens the app without them, let them pick products and a start date manually.

**3.2 Onboarding that feels like an interactive story, not a form.** One question per screen, full-bleed, animated transitions, a progress thread along the top, large tap targets, thumb-reachable answers, haptic-style micro-feedback (visual only), and a friendly voice. Collect only what the app needs, and say why each item is asked:
- first name or nickname (shown in greetings and on the journey-mates screen),
- age band,
- city or region (used only to pick the season and weather-related copy; offer "skip"),
- products in the routine (from the SKU, editable),
- how they bought it (hair assessment kit, quick-commerce app, pharmacy or other),
- start date,
- what they are worried about most (shedding, visible scalp, hairline, crown, other),
- a short "letter to week-five me" (commitment device, optional but encouraged),
- reminder preferences (morning and evening times, notifications on or off).

Everything is stored on the device only (localStorage and IndexedDB). The first screen after the splash states "Your details and photos stay on this phone" in plain words. This is how we satisfy the challenge rule that the app contains no customer personal data: the app ships empty of anyone's data and any data a user types lives only in their own browser.

**3.3 Routine and timing suggestions (not dosing).** From the products, age band and the user's schedule, suggest *when and how* to use each product: which days and times, how far apart the two daily applications should be, what to do on a travel day, which nights a derma roller should be kept separate from the solution, gummies with food. These come from a rule table in `src/content/routines.ts`, are labelled "general guidance, follow your pack leaflet or doctor", and always link to "talk to a doctor". Do NOT generate or imply any dose, strength, prescription or medical instruction. Age and location may change the copy and the schedule defaults but never a dose.

**3.4 Baseline capture.** A guided three-view capture (crown, hairline and temples, parting) with an SVG ghost outline, an on-device lighting check (mean luminance from a downscaled video frame, with a friendly "move closer to a window" prompt) and a "same spot, same time of day" instruction. File-input fallback when the camera is unavailable. Photos live only in IndexedDB. Optional step: the user paints the area they are worried about with a soft brush (used by 3.6).

**3.5 Home dashboard (the main screen).** A bento-style progress tracker. Cards:
- greeting by name and time of day, with the journey day and week ("Day 34, week 5, the part everyone finds hardest"),
- progress ring toward the week-24 judgement point (goal-gradient), with milestone dots,
- "Today" card: what to apply and when, with one-tap done and a streak,
- baseline versus latest photo, with a link to the full mirror,
- projected view (3.6),
- the day's insight card (3.7),
- reorder card (3.8),
- journey mates strip (3.9),
- a bottom floating capsule input like a messaging bar ("How is your scalp today?") that opens the quick check-in; it is the main interaction, in the spirit of the second design reference.

**3.6 Projected view (AI-style, built honestly).** "Here is what a typical outcome can look like at week 24." Because a trustworthy image model needs a server and photo upload, which breaks the privacy promise, build a `PredictionProvider` interface with two implementations:
1. `LocalSimulationProvider` (default, ships now): a deterministic on-device canvas pipeline that, inside the area the user painted, adds natural-looking density by blending procedurally generated fine strands and gently darkening sparse scalp pixels, at a deliberately modest strength. No network, no upload.
2. `RemoteModelProvider` (stub only, disabled): documents the contract for a future server-side image model.
Present it with a "thinking mode" animation (a pulsing orb, then a short staged sequence such as "reading your baseline", "marking the area", "estimating a typical outcome") of about 3 to 4 seconds. Always label it: "An illustration of a typical outcome, not a promise. Results vary." Show it only as a single typical case, never best case. Never imply it is a clinical image. This feature must reinforce the app's core job, which is setting realistic expectations, so the copy next to it should talk about time ("most visible change happens after month 4 to 6"), not hype.

**3.7 Flo-style reassurance engine.** A rules engine that picks an insight card for any day the app is opened, using the journey day, the season (from start date and city), the product mix, the most recent check-in signals (shed level, worry level, skipped doses) and the time of day. Examples of the behaviour wanted:
- Day 3 to 14: "Nothing to see yet, and that is the plan. Your photo is doing the remembering for you."
- Day 14 to 56, high shed or high worry: "This is the shed window. If more hair is coming out right now, that is the pattern most people describe. Here is your day-one photo to compare against."
- Monsoon start (June to September) in the shed window: "Two sheds are overlapping. The season is part of this, not just the bottle."
- Missed three or more doses: a kind, non-guilt nudge with a re-start plan.
- Night-time with high worry: a calm, short, no-numbers card and a breathing-pace animation.
- Day 100 to 130: "The first fine hairs often show up around now. Retake your photos tonight."
- Red flags in a check-in (pain, burning, rash, swelling, very heavy shedding beyond week 16): a clear "speak to a doctor" card with no cheerful framing.
Build the content as data in `src/content/insights.json` with: id, trigger conditions, priority, tone, copy (two variants), optional reference key. Seed at least 40 insights across the 24 weeks. Include a "why am I seeing this" sheet on every card (cites the reference). I will review and edit the copy later, so keep it in one file.

**3.8 Reorder and repurchase reminders.** The user's registration date plus the pack size by SKU (config file, fictional but plausible days of supply) gives a supply runway: "about 9 days left". Show a runway bar on the Home card, add in-app banners and an `.ics` export of reminders, and use the Notification API where supported. Sequencing rule that matters: never show a reorder prompt on the same screen as a worry or shed-high check-in, show reassurance first and the reorder prompt at least a day later. The call to action opens the Man Matters site in a new tab; do not build a cart or payments.

**3.9 Journey mates (a soft community, not a leaderboard).** Show people who started within about two weeks of the user, as first names plus city plus week number, with small warm events: "Aarav from Pune finished week 4", "Dev from Bengaluru took his week-8 photo", "12 people in your cohort are in week 5 today". No rankings, no scores, no comparison of results, no photos shared. Build a `CohortProvider` interface with a `LocalSimCohort` implementation (default) that generates a seeded, fictional cohort whose events line up with the user's journey day, and a stub `RemoteCohort` for a future backend. The UI must label this "Demo community" while the simulated provider is active. Include a "send a nudge" tap (a pre-written encouraging emoji or phrase) that only animates locally. Explain on the screen how opt-in, nicknames and no-photo-sharing would work in production. Also include an invite-a-friend share link (Web Share API) with a pre-filled message.

**3.10 Profile and settings.** Name, age band, city, products, start date, routine times, reminder settings, theme (dark, light, system), language toggle for key screens (English, plus Hinglish for the onboarding story and insight cards only if time allows), data export (JSON), "delete everything", an About page (the problem in three sentences, the two testable predictions from HANDOFF.md, references, the "independent concept" line, the medical disclaimer).

**3.11 Everything from HANDOFF.md section 4 that is not replaced above** stays (weekly check-in, the "Wait, before you stop" screen, letter to week-five me, monthly mirror with a before and after slider, demo mode with a "jump to day N" control, .ics reminders). The "Show someone" card and the doctor printout remain stretch goals.

### 4. Splash and scroll-driven loading experience (build with great care)

On first visit only (remember in localStorage, with a "replay intro" link in About), the app opens on a full-screen scroll-driven intro instead of a spinner. It must also work as a genuine loader, meaning the heavy bundles preload behind it.

Concept: a large, beautifully drawn dropper (SVG, inline) is pinned in the centre of a deep navy screen. As the user scrolls (or swipes on mobile), scroll progress drives the animation:
- the dropper rotates upright, the bulb squeezes, the liquid level inside drops,
- six short info beats fade in and out beside it, one per scroll segment, each a single sentence (draft them yourself in the copy style above; ideas: what the product is for in plain words, that a shed in the early weeks is common, that real change is judged at about six months, that a photo beats memory, that this is a 24-week plan, that you are not doing this alone),
- the final segment releases a single drop that falls, hits the surface and spreads as a ripple that expands to fill the screen, revealing the home page (or onboarding on first run) through a circular clip-path mask,
- a "Skip" control is always visible, and a small progress hint (thin line, not a percentage) shows how far through the intro they are.
Requirements: pinned section with scrub tied to scroll position using GSAP ScrollTrigger (or Framer Motion `useScroll`, choose the one that stays smoothest on a mid-range Android phone), optional Lenis smooth scrolling, `100dvh` units to survive iOS Safari toolbars, GPU-friendly transforms and opacity only, no layout thrash, fully keyboard operable (arrow keys and space advance it), screen-reader text alternative, and a `prefers-reduced-motion` path that replaces the scroll scrub with a simple auto-advancing sequence of the same six sentences. Must hold 60fps on a phone; verify in Chrome DevTools performance with 4x CPU throttling.

### 5. Design direction

References I want you to study and then translate (not copy):
1. Mental health dashboard, dark theme (Dribbble 27255374, by Outcrowd). What I read in it: near-black charcoal cards with hairline borders on a deep indigo-navy ground, a dense but airy bento grid, very large light-weight numerals with a small percent glyph, tiny rounded pills for deltas and tags (soft green for positive, coral for alerts), ring and orb widgets, a glowing cluster of orbs for an "engagement score", gradient pill progress bars, an avatar stack for "active participants", a left icon rail on tablet, and a greeting in a thin display weight with the name in a softer tone.
2. AI phone OS, thinking mode (Dribbble 27637405, by Gleb Kuznetsov). What I read in it: frosted-glass, pearly cards with large corner radii stacked tightly, a soft iridescent gradient wash behind everything, a conversational "Good morning, Name" greeting, small pill widgets across the top (weather, status, avatar), a floating capsule input with a mic at the bottom, and a calm "thinking" state. Use it for the home screen's conversational feel, the bottom capsule, the glass surfaces and the prediction "thinking" animation.

Brand colours (read from manmatters.com): the site is white and black with a confident blue family: primary blue about `#22548A`, deep navy about `#143461`, pale blue about `#D0DEF1`, body greys `#333437`, `#666666`, `#8D8D8D`, light grey surfaces `#EFEFEF`. The brand type is a clean geometric sans (MiSans). Use these as the anchor palette, then extend it: deepen the navy to a near-black blue for the dark theme background (for example `#070E1C` to `#0B1A33`), keep `#22548A` as the action colour and make a brighter accent from it for glows and rings (for example a cool `#4C8DDB`), add a warm secondary only for gentle emphasis (a soft amber for "today" and milestones) and keep coral reserved for red-flag states. Define everything as CSS variables and design tokens in `docs/DESIGN_SYSTEM.md` and in code, with a tested dark theme and a light theme (the light theme leans on the frosted-glass look from reference 2).

Typography: self-host a free geometric sans that sits close to MiSans (for example Plus Jakarta Sans, Manrope or Instrument Sans) through `next/font`, with a lighter display weight for big numerals and greetings, tabular numerals for counts, and a tight type scale defined in tokens. Motion language: spring-based, short (150 to 350 ms) for UI, longer (600 to 1200 ms) for story moments; shared-element transitions between a card and its detail screen; subtle parallax on the home orb; no bounce for serious content such as red-flag cards.

Layout principles: mobile first at 390px, thumb zone for primary actions, a bottom tab bar on phones (Home, Mirror, Journey, Mates, Profile) and a left icon rail on tablet and desktop, safe-area insets, no horizontal scroll, minimum 44px tap targets, 8px spacing grid, large radii (20 to 28px), cards that reflow from a single column to a 2 or 3 column bento grid. Dark theme is the hero; every screen must look good in both themes. Responsive and aesthetic on mobile is a hard requirement, equal in weight to desktop. Test on real phone widths of 360, 390 and 430, plus tablet and desktop.

Accessibility: WCAG AA contrast in both themes, visible focus, semantic landmarks, reduced-motion support everywhere, labels on all controls, alt text, camera permission fallbacks.

### 6. Technical stack and constraints

- Next.js (current stable, App Router) with TypeScript, React, **static export** (`output: "export"`) so it can be hosted on GitHub Pages. Therefore no API routes, no server actions, no runtime server features. Make `basePath` and `assetPrefix` configurable through one environment variable so a GitHub Pages sub-path works. Add a ready-to-use GitHub Actions workflow file for Pages deployment but do not enable or push anything.
- Tailwind CSS with tokens as CSS variables, Framer Motion (the `motion` package) for UI motion, GSAP with ScrollTrigger for the intro, optionally Lenis. Zustand for state with persistence, `idb` for IndexedDB, `date-fns`, Zod for validating stored data and URL parameters, `qrcode` for the dev QR page, `lucide-react` for icons (or a similar consistent set), `serwist` or an equivalent for the service worker and PWA manifest.
- Vitest for unit tests (journey-day maths, timeline engine, insight selection, runway calculation, season detection, schema migrations), Playwright for end-to-end flows and screenshot checks on the three viewports. Add an ESLint and Prettier config and a `pnpm check` script that runs lint, typecheck, tests and build.
- Everything offline-capable after the first visit, camera works on `localhost` and over HTTPS only (note this in the README), no analytics and no third-party network calls (self-host fonts).
- Performance budget: Lighthouse mobile performance 90 or higher on the home screen, no cumulative layout shift, intro bundle code-split so it does not block the rest.
- A "Demo mode" switch (clearly labelled) that loads fictional data and a "jump to day N" slider, so a reviewer can see week 5 without waiting five weeks. This is essential for the judging experience.

### 7. Sitemap to start from (refine in Phase 0)

```
/                      Splash redirect: first visit goes to /intro, else /home
/intro                 Scroll-driven dropper intro
/start                 QR landing, reads sku, reg, batch
/onboarding            Story-style setup (steps 1 to 9)
/baseline              Guided three-view capture, area painter
/home                  Dashboard (progress ring, today, mirror, projection, insight, reorder, mates)
/mirror                Photo timeline, before and after slider, retake flow
/mirror/projection     Projection "thinking mode" and result
/journey               Week-by-week map with season overlay, milestones, letter
/journey/week/[n]      What to expect in week n (static params for 1 to 24)
/checkin               Quick check-in (shed, worry, doses, notes)
/pause                 "Wait, before you stop" flow
/mates                 Journey mates feed (demo community)
/reorder               Runway, reminders, link out
/profile               Profile, routine, reminders, theme, language
/profile/data          Export and delete everything
/about                 Problem, predictions to test, references, disclaimer, replay intro
/dev/qr                Dev only QR generator
```

### 8. Phases (execute one at a time and stop after each)

**Phase 0: Design and build doc (no application code yet).** Produce, in `docs/`: `BUILD_DOC.md` (the master reference: vision, users, problem, feature spec with acceptance criteria per feature, sitemap, user flows as Mermaid diagrams, state machine for the journey, architecture, folder structure, data model and storage schema with versioning and migrations, provider interfaces, error and empty states, analytics-free instrumentation notes, risk list), `DESIGN_SYSTEM.md` (tokens, palettes for both themes with contrast checks, type scale, spacing, radii, elevation and glass recipes, motion specs with durations and easings, component inventory, iconography, illustration rules), `SCREENS.md` (a low-fidelity wireframe in ASCII or Mermaid for every route on phone and desktop, plus the exact intro beat script), `CONTENT_BANK.md` (voice guide, the six intro lines, onboarding script, 40 or more insight cards, check-in responses, red-flag copy, error messages), `DATA_MODEL.md`, `DECISIONS.md`, `PROGRESS_LOG.md`, and `CLAUDE.md` in the root. Also create a throwaway static `docs/design-preview.html` that shows the colour tokens, type scale, a sample glass card, a bento tile, the progress ring and the bottom capsule in both themes, so I can judge the look before we build. Stop and wait for my review.

**Phase 1: Foundation.** Scaffold Next.js, tokens, theming, fonts, base layout shell (bottom tab bar and desktop rail), routing, PWA manifest, storage layer with schema and migrations, journey-day utilities with tests, demo-mode plumbing, `pnpm check`.

**Phase 2: The scroll intro.** The pinned dropper animation, six beats, ripple reveal, skip, reduced-motion path, keyboard path, preload logic, performance verification.

**Phase 3: QR entry and the onboarding story.** `/start` parsing, `/dev/qr`, nine-step animated story, validation, why-we-ask microcopy, persistence, resume where you left off.

**Phase 4: Baseline capture.** Camera flow, ghost overlays, lighting check, fallback, area painter, photo storage and deletion.

**Phase 5: Home dashboard.** All bento cards wired to real state with skeleton and empty states, greeting logic, progress ring, Today card and doses, bottom capsule and quick check-in.

**Phase 6: Journey map and the reassurance engine.** Timeline with season overlay, week pages, insight engine, "why am I seeing this", check-in responses, red-flag rules, the "Wait, before you stop" flow, letter reveal.

**Phase 7: Mirror and projection.** Photo timeline, slider, monthly prompts, the `LocalSimulationProvider`, the thinking-mode animation, labelling and guardrails.

**Phase 8: Routine, reorder and reminders.** Timing suggestions from the rule table, runway, reorder sequencing, `.ics` export, notifications, banners.

**Phase 9: Journey mates.** Simulated cohort, event feed, nudges, invite share, "Demo community" labelling, production-notes panel.

**Phase 10: Profile, data and About.** Settings, theme, language, export, delete, About with references and predictions, replay intro.

**Phase 11: Polish and hardening.** Motion pass, micro-interactions, empty and error states, accessibility audit, Lighthouse, cross-device checks at 360, 390, 430, 768 and 1440, offline test, copy pass for dash and vocabulary rules, README for judges (problem, how to run, screenshots, demo script, what is deliberately not built, how Mosaic could measure impact, the two predictions).

**Phase 12: GitHub readiness.** Pages workflow, `basePath` config, build verification under a sub-path, license, `.gitignore`, final screenshot set. Do not push.

### 9. Definition of done for the whole project

- A first-time user scans a QR, watches or skips the intro, completes onboarding and a baseline photo in under three minutes on a phone.
- In demo mode, jumping to day 35 shows a Home screen that reframes the shed using the user's own baseline, the map and their own letter.
- Both themes look intentional on every screen at 360, 390, 430, 768 and 1440 widths.
- The intro holds smooth frame rates on throttled mobile.
- No request leaves the device after load.
- No dash characters in user-facing text, no real personal data anywhere, no medical dosing claims.
- `pnpm check` passes and the static export builds under a sub-path.

### 10. Begin

Start with Phase 0 now. Read HANDOFF.md, then write the Phase 0 documents and the design preview, then stop and report. Do not write application code until I approve the documents.

## END OF PROMPT
