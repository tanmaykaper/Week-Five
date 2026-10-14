# Handoff: Mosaic Fellowship Builder Challenge, Part 2 (the app)

Drop this file into the project root (rename to CLAUDE.md if you like) and tell Claude Code: "Read HANDOFF.md fully, then follow section 9 (build order). Ask me only about the items in section 11."

## 0. Ready-to-paste first prompt

> I am building a working, browser-based app for the Mosaic Fellowship Builder Challenge (Man Matters). Everything you need is in HANDOFF.md. Build a static, installable, privacy-first web app called "Week Five" that stops new minoxidil customers from quitting in weeks 3 to 7 by giving them a personalised map of what to expect and a mirror (baseline photo, same-angle comparison) that shows their real progress. No backend, no accounts, no personal data leaves the device. Follow the build order in section 9, make it work on a phone-sized screen first, and keep all user-facing copy free of em dashes and en dashes. Start by proposing the file structure and the data model, then build.

## 1. Who and why

- Tanmay Kaper, final-year B.Sc. Economics, NMIMS Mumbai. Applying to the Mosaic Wellness Fellowship. This challenge is part of the placement process, and the submission is judged on how it stands out against many candidates who will also pick Man Matters and use AI.
- Challenge: pick one Mosaic brand (chosen: **Man Matters**), speak to 5+ real customers, identify a real problem, then build a working browser app that solves it. Requirements: built with a coding agent, runs in a browser, **no customer personal data inside the app**, plus a short written explanation of the build.
- Part 1 (customer research document, Word, 14 pages) is finished. Part 2 is this app. Part 1 closes with: "Part 2 is my attempt to give them both the map and the mirror." The app should feel like the direct continuation of that sentence.

## 2. The problem the app must solve ("the week-five cliff")

Problem statement as written in Part 1:

> Man Matters customers on minoxidil abandon treatment between weeks three and seven, the very window in which shedding is expected, because nothing prepares them to read that shedding as part of the process and nothing lets them see their own progress. The risk is greatest for those who start during the monsoon, when seasonal hair fall doubles the alarm, and for those who buy through quick commerce, where nobody briefs them at all.

Root chain (five whys): customers stop because they believe the product damages their hair, because they see more hair falling and have no baseline photo or measure of progress, because the expectation briefing happens once (a roughly 3 minute doctor call, or never for Zepto buyers), at the wrong time, because the experience is built around purchase and reorder while doubt arrives in between (weeks 3 to 7). The brand is loud at the start and silent in exactly the weeks where the decision is made.

It is a problem of **information and timing**, not product efficacy, price or convenience.

## 3. Evidence from the 11 real interviews (aggregate only, nothing personal goes in the app)

- 11 customers, Mumbai mostly, ages 18 to 45+. Three types: stopped (4), recent starters (4), quick-commerce buyers (3).
- 9 of 11 stopped or came close. All 9 did so between weeks 3 and 7. Median stop week 5. Customers expected visible results in about 2.8 months on average; clinically, judge at about 6 months, and the early weeks can only show loss.
- 8 of 11 saw an unexpected shed with no warning. 8 of 11 kept no baseline photo. The 2 who kept photos averaged confidence 4.0/5 and recommend score 8.5/10, versus 2.1/5 and 5.1/10 for the 9 who did not (tiny sample, direction only).
- The one customer who never wavered had been told by his doctor to expect a shed and to photograph his scalp monthly under the same light. Same product, same shed, different first conversation.
- 5 customers blamed the monsoon unprompted and all 5 stopped or came close. A winter starter still left inside the same window, so season sharpens the cliff but does not create it.
- Quick-commerce (Zepto) buyers skip the hair assessment and the doctor, the only two points where expectations get set. One nearly binned the bottle; one paused a month, restarted, and went through the shed twice.
- 7 of 11 named another person (mother, flatmate, barber, father, gym friend) whose offhand remark became the verdict on their hair.
- Routine complexity was real but rare (1 quit over it). Ease of use did not protect anyone from doubt (the person with the simplest routine nearly quit anyway). This is why the earlier "Routine Fitter" idea was dropped.
- Problems ranked by weighted score: shed read as failure 4.42, invisible progress 4.06, unrealistic timeline 3.72, monsoon overlap 3.12, quick-commerce gap 2.34, regimen weight 1.61.

Two testable predictions for Mosaic's own order data (mention in the app's About page and in the explanation, but do not fake data):
1. Customers whose first minoxidil order falls between June and September reorder at month two less often than those starting November to February.
2. First-time minoxidil buyers on quick commerce reorder less often than those who came through the hair assessment.

## 4. Solution concept (proposal, not yet signed off by Tanmay, adjust freely if something is unworkable)

**Working title: "Week Five".** A static, installable (PWA) web app that a new Man Matters customer opens on day one and keeps open through the first 24 weeks. Tagline idea: "The map and the mirror."

It does two jobs the brand currently does not:

1. **The map.** A personalised, week-by-week timeline that tells the customer what is normal before it happens, so the shed reads as progress rather than failure (inoculation theory, McGuire 1961; expectation-confirmation, Oliver 1980).
2. **The mirror.** A guided baseline photo and monthly same-angle comparison so progress becomes visible (goal-gradient, Kivetz et al. 2006; loss aversion makes shed vivid and growth invisible, Kahneman and Tversky 1979).

### Feature list (MVP first, stretch last)

**MVP**
1. **60 second setup (no name, no phone, no email).** Inputs: start date (default today), how they bought (hair assessment and kit / loose products on a quick-commerce app / pharmacy or other), products in use (minoxidil, gummies/biotin, shampoo, derma roller, other), city optional for season (or just use the start month). Output: a personal timeline.
2. **Briefing screen for the channel that skips it.** If bought on quick commerce or loose, open with "the briefing you skipped": a 60 second swipeable explainer (what shedding is, when it starts, how long it lasts, what it does not mean). Everyone else gets a shorter version. Same content, different framing.
3. **Week-0 baseline capture.** Guided photo of 3 views (crown, hairline/temples, parting). On-screen ghost outline, a lighting check (simple brightness reading from the camera frame, "move near a window / same spot each time"), and a "same place, same time of day" instruction. Photos stored on device only (IndexedDB), never uploaded.
4. **Personal timeline ("the map").** Horizontal week track 0 to 24 with phases: calm (weeks 0 to 2), expected shed window (about 2 to 8), settling (about 8 to 12), first fine hairs (about 12 to 16), the judgement point (about 24). A "you are here" marker. The season overlay changes the copy: a June to September start gets the "two sheds at once" explanation (seasonal shedding peaks in summer and autumn, Kunz et al. 2009; Hsiang et al. 2018).
5. **Weekly check-in (30 seconds).** Slider for how much hair fall they are seeing (a few buckets, optional comb or pillow count), a "how worried am I" slider, optional note. The app responds based on the week and the answer. In the shed window and high shed: "This is the part that feels worst and is the most expected. Here is your baseline. Here is what week 5 looks like for most people." Outside the window or with red flags (pain, burning, rash, swelling, shed still rising past about week 12 to 16): clear nudge to speak to a doctor. Never diagnose.
6. **Letter to week-five me (commitment device).** On day one the user types two or three lines to their future self. The app buries it and shows it back at the start of week 4 or at the moment they tap "I want to stop". Grounded in present bias (O'Donoghue and Rabin 1999) and pre-commitment.
7. **The "Wait, before you stop" intercept.** A persistent "I am thinking of stopping" button. It opens a short flow: shows the user's own baseline, their week on the map, the letter they wrote, and a neutral fact box ("Most people who feel this way are in weeks 3 to 7"), then three honest options: keep going, pause with a plan and a date to restart, or talk to a doctor. Does not trap or guilt the user; it just puts evidence next to the feeling.
8. **Monthly mirror.** Prompts on week 4, 8, 12, 16, 20, 24 to retake the same three photos. Before/after slider with the baseline ghost overlay. Plain-language caveat that photos are for the user and lighting changes the look.
9. **Progress ring toward week 24 ("judgement day").** A visible, honest goal-gradient: percent of the fair-judgement window completed, milestones unlocked at each monthly photo. Emphasise that the first weeks cannot show gain.
10. **Reminders without a backend.** Download a calendar (.ics) of all check-ins and photo days; optional browser Notification API where supported. In-app banner on open when something is due.

**Stretch (only after MVP is solid)**
- **"Show someone" card.** Generates a clean, shareable image or printable page for the person whose remark became the verdict (mother, flatmate, partner): "I am in week 5 of a 24 week treatment. A shed now is expected. Here is the plan." Addresses the social-proof finding (Cialdini 1984).
- **Doctor script.** A one-screen printout of baseline date, products, check-in history and the user's questions, to take to a consultation.
- **Hinglish toggle** for key screens.
- **"About this app" page** with the week-five cliff in three sentences, the two predictions Mosaic can test, and the references (section 12). This is also where the Mosaic hiring team learns why the app exists.
- **Explanation for Mosaic's analytics** (README only, no fake numbers): which events would be worth logging server-side if Mosaic ran this (baseline taken, week-4 check-in completed, stop-intercept opened, outcome chosen) and how they link to the reorder metric.

**Deliberately out of scope**
- Accounts, logins, cloud sync, any analytics SDK, any server, any real customer data, any AI diagnosis of photos, any medical advice, any product selling.
- Fake dashboards or invented statistics presented as real.

## 5. Behavioural logic to keep intact (this is what makes the app "business smart", not just a tracker)

| Moment | Mechanism | Where it shows up |
| --- | --- | --- |
| Week 0 | Forewarning / inoculation (McGuire 1961) | Briefing screen, timeline |
| Week 0 | Pre-commitment, present bias (O'Donoghue and Rabin 1999) | Letter to week-five me |
| Week 3 to 7 | Expectation confirmation (Oliver 1980) | Weekly check-in reframes the shed as on track |
| Week 3 to 7 | Loss aversion (Kahneman and Tversky 1979) | Baseline photo counters vivid hair-on-pillow loss |
| Week 3 to 7 | Salience and attribution (Taylor and Fiske 1978) | Season overlay explains that the monsoon is a second cause, not just the bottle |
| Week 3 to 7 | Social proof and other people's verdicts (Cialdini 1984) | "Most people feel this now", Show someone card |
| Weeks 4 to 24 | Goal-gradient (Kivetz et al. 2006) | Progress ring, monthly mirror |

## 6. Design and tone

- Audience: urban Indian men, 18 to 45, on a phone, often in a hurry, some anxious and embarrassed. Mobile-first at roughly 390px width, works on desktop.
- Tone: calm, direct, a bit of dry humour, never preachy, never clinical-cold. Reassuring without overclaiming. Short sentences. Plain language. Use "you".
- Visual: look and feel should sit comfortably next to the Man Matters brand without copying its assets or logo. Check manmatters.com live for the current palette and typography before choosing colours, and do not use Man Matters logos or imagery. Use a distinct app name and mark. Dark mode support. Large tap targets. Strong typography, generous spacing.
- Accessibility: contrast, keyboard use, reduced motion, alt text, labels on all controls.
- Copy rules (from Tanmay): **no em dashes or en dashes anywhere** (use commas, periods, "to"), avoid obvious AI vocabulary ("delve", "navigate", "journey", "unlock", "seamless", "leverage", "empower", "holistic"), keep it human and specific.

## 7. Safety, privacy, and claims

- On-device only: localStorage for settings and check-ins, IndexedDB for photos. Add a visible "Your data stays on this phone" line, a one-tap export (JSON, photos as zip optional) and a one-tap "delete everything".
- No personal identifiers requested. No analytics, no third-party scripts except fonts (self-host preferred).
- Not medical advice. Not a diagnostic tool. Include a short disclaimer and clear escalation rules to see a doctor. Avoid dose or prescription guidance. Minoxidil shedding timing statements should be phrased as "commonly", "for many people", with the references.
- Do not claim Man Matters endorses or built this. Present it as an independent concept built for the Builder Challenge.
- Do not include any of the interview participants' names, numbers, or identifying details anywhere in the app, repo, or demo content.

## 8. Technical approach

- Static single-page app, installable PWA (manifest + service worker for offline). Suggested stack: Vite + React + TypeScript, Tailwind or plain CSS modules, Zustand or Context for state, `idb` for IndexedDB, `date-fns` for dates. A vanilla-JS build is acceptable if simpler, but the code should be clean and readable. Deployable to Netlify, Vercel or GitHub Pages with no environment variables.
- Data model (all local): `profile {startDate, channel, products[], seasonOverride?, createdAt}`, `checkins[] {week, date, shedLevel, worry, note?}`, `photos[] {id, week, view, blobRef, takenAt}`, `letter {text, shownAt?}`, `intercepts[] {date, choice}`.
- Timeline engine: pure function `buildTimeline(startDate, channel, products)` returning phases with dates and copy variants; season detection from start month (June to September flagged as "monsoon overlap" for most of India, make it a user-overridable setting).
- Camera: `getUserMedia` with a fallback to file input. Lighting check by sampling a downscaled frame and reading mean luminance. Overlay as SVG.
- Comparison: simple draggable before/after slider with the baseline ghost overlay.
- Tests: unit tests for the timeline engine and week calculation; a manual QA script for the camera flow.
- Demo mode: a clearly labelled "Try it with sample data" switch that preloads fictional placeholder data (generic avatar illustrations or abstract silhouettes, not real photos) so reviewers can see week 5 without waiting 5 weeks. Make a "jump to week N" control in demo mode only.
- Performance and offline: first load under about 200 KB gzipped excluding fonts, works offline after first visit.

## 9. Build order

1. Scaffold project, set tokens (colour, type, spacing), layout shell, routing, PWA manifest.
2. Data layer (localStorage + IndexedDB wrappers, export, delete all).
3. Timeline engine + tests + the timeline screen with the season overlay.
4. Setup flow and briefing screens (both variants).
5. Camera capture, baseline photos, lighting check.
6. Weekly check-in and the response logic.
7. Letter to week-five me and the "Wait, before you stop" intercept.
8. Monthly mirror and slider, progress ring.
9. Reminders (.ics export, notification fallback).
10. Demo mode with sample data and week jumper.
11. About page, disclaimers, references, polish, accessibility pass.
12. Stretch features (Show someone card, doctor script, Hinglish) if time allows.
13. README for judges: problem, how to run, screenshots, what is intentionally not built, how Mosaic could measure impact.

## 10. Definition of done

- A first-time user can finish setup and capture a baseline in under 2 minutes on a phone.
- Opening the demo at "week 5, high shed" shows a screen that visibly reframes the shed using the user's own baseline, the map and their letter.
- No network requests after load other than the app's own assets (verify in DevTools).
- Works offline after the first visit and installs to the home screen.
- Nothing in the repo contains real customer names, numbers or quotes.
- No em dashes or en dashes in any user-facing string (grep for them before finishing).

## 11. Questions worth asking Tanmay (only if blocking)

- Preferred deploy target and whether he wants a public URL or a zip.
- Whether to show the app name "Week Five" or something else.
- Whether to add a Hinglish toggle.
- Whether he wants a screen recording or a short Loom-style walkthrough script for the submission.

## 12. References (for the About page and the explanation)

1. Kaliyadan et al., "Androgenetic Alopecia: An Update," IJDVL 79(5), 2013.
2. Shadi, "Compliance to Topical Minoxidil and Reasons for Discontinuation among Patients with Androgenetic Alopecia," Dermatology and Therapy 13(5), 2023 (about 86 percent of 400 patients abandoned topical minoxidil, most within six months).
3. Oliver, "A Cognitive Model of the Antecedents and Consequences of Satisfaction Decisions," JMR 17(4), 1980.
4. Kahneman and Tversky, "Prospect Theory," Econometrica 47(2), 1979.
5. O'Donoghue and Rabin, "Doing It Now or Later," AER 89(1), 1999.
6. Kivetz, Urminsky and Zheng, "The Goal-Gradient Hypothesis Resurrected," JMR 43(1), 2006.
7. Kunz et al., "Seasonality of Hair Shedding in Healthy Women Complaining of Hair Loss," Dermatology 219(2), 2009.
8. Hsiang et al., "Seasonality of Hair Loss: A Time Series Analysis of Google Trends Data 2004 to 2016," BJD 178(4), 2018.
9. Taylor and Fiske, "Salience, Attention, and Attribution: Top of the Head Phenomena," Advances in Experimental Social Psychology 11, 1978.
10. Cialdini, Influence: The Psychology of Persuasion, 1984.
11. McGuire, "Resistance to Persuasion Conferred by Active and Passive Prior Refutation of the Same and Alternative Counterarguments," J. Abnormal and Social Psychology 63(2), 1961.
12. Bernstein Medical, "Hair Growth" (hair grows about a centimetre a month; resting hairs are replaced over roughly three to four months).
13. AAFP Community Blog, "Treatment of Hair Loss with Minoxidil" (full effect closer to a year).

## 13. Voice and submission notes

- The short explanation Tanmay submits should say: the problem found in 11 real conversations, the root cause in one paragraph, what the app does (map and mirror), the one behavioural idea behind each feature, what was deliberately left out, and the two predictions Mosaic can test with its own data.
- Tanmay's writing voice: narrative, engaging, specific, grounded in research without sounding academic. Any in-app long copy and the README intro should follow that voice.
