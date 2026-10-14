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
