# Week Five (working title)

## What this is
1. A mobile-first, installable web app for new Man Matters hair-regrowth customers, built for the Mosaic Fellowship Builder Challenge.
2. It fixes the "week-five cliff": people quit minoxidil in weeks 3 to 7, exactly when shedding is normal.
3. It gives them a map (what is normal, week by week, for their start date and season) and a mirror (baseline photos, monthly comparison, an honest projection).
4. Everything lives on the device. No backend, no accounts, no analytics, no third-party requests.
5. Independent concept. Not made or endorsed by Man Matters. No brand logos or product photos.

## Resume protocol
- At the start of every session: read this file, `docs/BUILD_DOC.md` and `docs/PROGRESS_LOG.md`, then tell Tanmay in three lines where we are and continue with the next unfinished phase.
- At the end of every session: update `docs/PROGRESS_LOG.md` (done, decisions, known issues, next step).
- Work one phase at a time. End of phase: `pnpm check`, Playwright screenshots at 390x844, 768x1024 and 1440x900 of every touched screen, look at them and fix what is weak, commit locally, report, then wait for "go".
- Decisions you can make yourself go in `docs/DECISIONS.md` with a one-line reason. Ask only when a choice is expensive to reverse or changes the product.
- Never add a git remote or push.

## Copy rules (every string, doc and comment)
- No em dashes or en dashes (U+2014, U+2013). Use commas, full stops or "to". Grep for both before ending a phase.
- Banned words: delve, navigate, journey as a cliche, unlock, seamless, leverage, empower, holistic, elevate, tapestry. ("Journey" as the product's own tab name and "journey day" are fine.)
- Short sentences, plain words, "you". Dry humour allowed. Never preachy. Never a dose, strength or prescription.
- No real person's name, number, quote or photo anywhere. Demo people are fictional.

## Stack
Next.js 16 (App Router, `output: "export"`, `basePath` from `NEXT_PUBLIC_BASE_PATH`), TypeScript, Tailwind v4 with CSS-variable tokens, `motion`, GSAP + ScrollTrigger (intro only), Zustand (persisted), `idb`, `date-fns`, Zod, `qrcode` (dev page), `lucide-react`, Serwist (`@serwist/build`, run after export). Vitest + Playwright. pnpm. Node 26 via Homebrew.

## Phases
| # | Phase | Status |
|---|---|---|
| 0 | Design and build doc | Done, awaiting review |
| 1 | Foundation | Not started |
| 2 | Scroll intro | Not started |
| 3 | QR entry and onboarding story | Not started |
| 4 | Baseline capture | Not started |
| 5 | Home dashboard | Not started |
| 6 | Journey map and reassurance engine | Not started |
| 7 | Mirror and projection | Not started |
| 8 | Routine, reorder and reminders | Not started |
| 9 | Journey mates | Not started |
| 10 | Profile, data and About | Not started |
| 11 | Polish and hardening | Not started |
| 12 | GitHub readiness | Not started |

## Where things are
- `docs/BUILD_DOC.md` master spec. `docs/DESIGN_SYSTEM.md` tokens and motion. `docs/SCREENS.md` wireframes. `docs/CONTENT_BANK.md` all copy. `docs/DATA_MODEL.md` storage. `docs/DECISIONS.md`. `docs/PROGRESS_LOG.md`.
- `HANDOFF.md` research and guardrails. `CLAUDE_CODE_KICKOFF_PROMPT.md` scope overrides (wins where they differ).
