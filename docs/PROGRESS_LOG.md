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
