# Content bank

All user-facing copy in one place for Tanmay to edit. When this is approved, insights move to `src/content/insights.json` and the rest to `src/content/copy.ts` unchanged.

## Voice guide

- **Sound like** a friend who has been through it and read the research: calm, direct, a little dry.
- **Short sentences.** One idea each. Plain words. "You", never "users".
- **Honest about time.** The early weeks can only show loss. Say so.
- **Hedge medical facts properly:** "commonly", "for many people", "often". Never "will".
- **Never** a dose, a strength, a prescription, a diagnosis, a guarantee, guilt, or a countdown.
- **Humour** only when the user is calm. Never on red-flag, night-worry or pause screens.
- **No dashes** (em or en). No: delve, navigate, journey as a cliche, unlock, seamless, leverage, empower, holistic, elevate, tapestry.
- **Buttons** say what happens: "Take photo", "Save note", "Pause with a plan". The confirmation uses the same verb: "Photo saved", "Note saved".
- **Errors** say what happened and what to do. They don't apologise.

## Intro: the six beats (v3, two voices)

Each beat: the sans line (what happens), the serif turn (how it feels), a short note, and a chapter name for the HUD. Source: `src/content/intro.ts`.

| Chapter | Sans | Serif turn | Note |
|---|---|---|---|
| The roots | It works on hair | that hasn't grown yet. | What's in the bottle works on the roots under your skin. The hair you can see today was decided months ago. |
| The shed | Around week three, | more hair falls, not less. | For many people, that's the treatment starting. Older resting hairs make way for new ones. |
| Six months | Judge it at six months. | Not week five. Not day nine. | Hair grows about a centimetre a month. Anything you decide sooner is a guess. |
| The photo | Memory is a bad judge. | A photo is a good one. | Same spot, same light, once a month. Your day-one photo does the remembering for you. |
| The map | 24 weeks. | A ring for each one. | So here's the plan, with a map for every week of it. The shed window is drawn on from day one. |
| Not alone | You're not the only one. | Others started this week too. | Plenty of people began the same week you did. You'll see them along the way. |

Final frame: **Let's set up your plan.** "About two minutes. Nothing leaves this phone." Chapter: "Your plan".
Ring labels on the map: "Day one", "Weeks 3 to 8, the shed window", "Photo days", "Week 13, fine hairs often show", "Week 24, a fair verdict".
Skip control: **Skip intro**. Reduced-motion controls: **Pause**, **Next**, **Skip intro**.
Screen-reader heading: "Before you start, six things worth knowing."

## Welcome and privacy

- QR welcome title: **Welcome. Let's set up your plan.**
- QR welcome body: "We read this from your pack: {productName}. You can change it in a minute."
- No QR: "Let's set up your plan. Tell us what you're using and when you started."
- Bad QR: "We couldn't read that code. Pick your products instead."
- Privacy screen title: **Your details and photos stay on this phone.**
- Privacy body: "No account, no sign-up, nothing sent anywhere. If you delete the app's data, it's gone for good, so we'll remind you to export a copy now and then."
- Primary: **Start setup** (about 2 minutes). Secondary: **Try it with sample data**.

## Onboarding story (nine steps, v3)

Each question is a headline in two voices: the question, then why we ask it as the serif turn. Source: `src/content/onboarding.ts`.

| # | Chapter | Question | Turn (why we ask) | Input | Skip |
|---|---|---|---|---|---|
| 1 | Your name | What should we call you? | Only for greetings. A nickname is fine. | Text, 24 chars, placeholder "e.g. Arjun". Hint: "Leave it blank and we'll say "you"." | Blank allowed |
| 2 | Age | Which age band are you in? | It changes a few tips. Never your dose. | 18 to 24, 25 to 34, 35 to 44, 45 and up | Skip |
| 3 | Your rains | Which city are you in? | Only to know when your rains come. | City search and picks, plus Somewhere else ("Does it rain hard where you are, roughly June to September?" Yes, No, Not sure) | Skip |
| 4 | Your routine | What are you using? (with a pack: "Here's what's on your pack.") | So your day shows the right things. (with a pack: "Using anything else as well?") | Product chips, pre-ticked from the pack | At least one |
| 5 | How you bought it | How did you buy it? | If nobody briefed you, we will. | Hair assessment and kit; A quick-commerce app; A pharmacy or somewhere else, each with a one-line note | Required |
| 6 | Day one | When did you start? | Everything on your map counts from this day. | Today, Yesterday, A week ago, The day I bought it, or a date | Required |
| 7 | Your worry | What bothers you most? | We'll keep an eye on it in your photos. | Shedding, Seeing my scalp, Hairline, Crown, Something else | Skip |
| 8 | A note | Write a note for week five. | Your own words will land better than ours. | Serif text area, 400 chars. Placeholder "Dear week-five me, you started this because". Hint: "Week five is when most people want to stop. We'll keep this hidden until then." | "I'll write it later" |
| 9 | Reminders | When do you want reminders? | So your day shows the right times. | Morning and evening times (defaults by age band), notifications switch | Times prefilled |

Live lines under the city and date questions:
- Rains over the shed window: "The rains land on weeks {a} to {b}, on top of the shed window. We'll tell you which hair fall is the season."
- Rains clear of it: "The rains land on weeks {a} to {b} of your plan, clear of the shed window."
- None: "No rainy months inside your 24 weeks in {city}. One less thing muddying the picture."
- Date: "Day one is {date}. Today is day {n}, week {w}. Your shed window runs {from} to {to}." or "Your plan starts in {n} days, on {date}..."

Finish: **Your plan** / *is ready.* "{Name}, here's your plan. One more thing before you start: the bit nobody tells you." Summary rows: Day one, Shed window, Rains, Photo days, A fair verdict. Button **Read the briefing**.

## Briefing

### The briefing you skipped (quick-commerce, pharmacy or other). Five cards.
Header: **The briefing you skipped.** "You bought this in ten minutes, so nobody gave you the talk. Here's the short version."

1. **It works on the roots.** "Minoxidil works on the follicles under your skin, not on the hair you can see. That's why it's slow."
2. **Expect a shed.** "Between about week two and week eight, many people see more hair fall. Older resting hairs make way for new growing ones."
3. **It passes.** "For most people the shed settles within a few weeks. If it's still heavy around week twelve to sixteen, talk to a doctor."
4. **It doesn't mean it's failing.** "A shed in the early weeks is not a sign the product is damaging your hair. Stopping now resets the clock."
5. **Judge at six months.** "Hair grows about a centimetre a month. Fair judgement is around week 24, with your photos side by side."

Finish: **Got it. Take my day-one photos.**

### Short version (hair assessment and kit). Three cards.
Header: **A quick reminder.** "You heard this at the start. It's easy to forget by week five."
Cards 2, 4 and 5 from above.

## Baseline capture (v3)

Every screen is a headline in two voices, as in setup: what to do in the sans, why in the serif. Source: `src/content/baseline.ts`.

| Screen | Sans | Serif turn | Body |
|---|---|---|---|
| Intro (chapter "Day-one photos") | Three photos, two minutes. | Your day one, on the record. | "Same spot, same time of day, every month. A window in daylight is perfect. Bathroom light is not." |
| Crown | Your crown, from above. | The bit you never see yourself. | "Hold the phone above your head, camera facing down. Line the top of your head up with the outline." |
| Hairline and temples | Your hairline, face on. | The one everybody else sees. | "Face the camera, hair pushed back, eyebrows on the line." |
| Parting | Your parting, head down. | The easiest place to see density. | "Tilt your head down. Part your hair where you normally would." |
| Painter (chapter "Your area", optional) | Show us the area you watch. | Only for the projection, nothing else. | "Paint over it with your finger. Rough is fine." (pointer: "with the pointer") |
| Close | Day one, recorded. | See you in week {w}. | "Next photos around {date}, at about {time}. Same spot, same light." |
| Close, a photo missing | Day one, nearly recorded. | Take the rest when you can. | same |

- Intro buttons: **Open the camera** (or **Carry on with the {view}**), **I'll do it later**. Line: "Photos stay on this phone. Nothing is sent anywhere." Saved views show "Saved".
- Shutters: **Take crown photo**, **Take hairline photo**, **Take parting photo**. While the timer runs: **Cancel the timer**. Screen reader: "Taking the photo in {n}".
- Tools: **Choose a photo** (never "upload": nothing is uploaded), **Timer, 3 s** ("Timer on. Three seconds to get the phone into place."), **Switch camera**. Camera starting: "Opening the camera".
- Light meter: "Checking the light", "Too dark. Move closer to a window.", "Good light.", "Too bright. Step out of direct sun."
- Review: **Keep** / **Retake**. "Sharp, and the outline roughly lined up? Keep it." Dark still: "This one is dark. A retake by a window will compare better." Bright still: "This one is bright. Out of direct sun will compare better." A saved photo met again: "Already saved. Keep it, or take it again." From the gallery: "We keep the middle square, the same every month."
- Saved (screen reader): "Photo saved. It stays on this phone."
- Errors: "No camera access. You can still pick photos from your gallery." / "This browser can't open the camera. Choose a photo instead." / "We couldn't read that photo. Try another one." / "We couldn't save that photo. Your phone may be low on space."
- Painter: **Brush** (Small, Medium, Large), **Undo**, **Clear**, **Mark the middle for me**, **Done**, **Skip**. Empty: "Nothing painted yet. Skip if you'd rather not."
- Close: **Go to Today**, **Mark the area you watch** (or **Change the marked area**). Per photo: **Retake**, **Delete** then **Delete it** (second tap), or **Take {view} photo** when missing. "Photo deleted."
- Install nudge: "Add Week Five to your home screen. It keeps your photos safer on this phone." Button **Add to home screen** when the browser offers it; on iPhone: "On iPhone: Share, then Add to Home Screen."
- Ring labels: "Photos every four weeks" (intro), "Week {w}, next photos" (close).

## Home

- Greetings: "Morning, {name}." / "Afternoon, {name}." / "Evening, {name}." / Night: "Still up, {name}?"
- Day line pattern: "Day {d}, week {w}, {phrase}." Phrases by phase:
  - not started: "Starts in {n} days" (replaces the whole line)
  - calm: "the quiet start"
  - shed, weeks 3 to 4: "the shed window"
  - shed, week 5: "the part everyone finds hardest"
  - shed, weeks 6 to 8: "the shed window, past the middle"
  - settling: "things settling down"
  - first hairs: "when fine hairs often show up"
  - building: "the long middle"
  - judgement: "judgement week"
  - beyond: "past six months"
- Ring centre: "{pct}%" with caption "of the way to a fair verdict".
- Ring label (screen reader): "Day {d} of 168. {pct} percent of the way to week 24. Shed window is days 15 to 56."
- Routine block: title **Routine**. Slots "Morning, {time}" and "Evening, {time}". Done state "Done". Streak "{n} days in a row" (no streak at 0, no shaming when it breaks).
- Mirror block: **Day one and now.** Empty: "No photos yet. Two minutes, and future you will thank you." Button **Take photos**.
- Projection card: **What week 24 can look like.** "An illustration of a typical outcome, not a promise."
- Reorder card: **About {n} days left.** "Your {product} runs out around {date}." Button **Reorder on Man Matters**. Snooze **Remind me in 3 days**.
- Mates strip: "{n} people in your start week are on week {w} today." Pill: **Demo community**.
- Capsule placeholder: **How is your scalp today?**
- Stopping section: **Thinking of stopping?** "Look at three things first: your day-one photo, where you are on the map, and the note you wrote." Button: **Before you stop**
- Navigation: **Today**, **Map**, **Mirror**, **Mates**, **You**

Today in v3 (Phase 5, source `src/content/today.ts`):
- Greeting pair: "{Greeting}, {name}." (night: "Still up, {name}?") with the turn "Week {w}, {phrase}." Before the start: "Your plan starts in {n} days." After day 168: "Past six months."
- Progress: "Day {d} of 168" and "{pct}% of the way to a fair verdict". Screen reader: "Day {d} of 168. {pct} percent of the way to week 24. The shed window is days 15 to 56."
- Today's note: the insight copy below, variant A; actions **Compare with day one**, **Take day-one photos**, **Week {w} photos**, **Check in**. Fallback: "One day at a time. The map is drawn; you just have to keep walking it." Not started: "Your plan hasn't started yet. Take your day-one photos before the first application, then let the clock run."
- Routine: **Today**, slots "Morning" and "Evening" with times and products ("Regrowth solution", "Hair gummies, with food"), buttons **Mark done** and **Done**, "{n} days in a row", "General guidance. Follow your pack leaflet or your doctor." No slots: "Nothing on a schedule today. Your products are on the You page."
- Mirror: **Day one and now**, **Open the mirror**, "Week {w} photos around {date}.", demo: "Sample drawings for the demo, not photos of anyone."
- Supply: **Supply**, "About {n} days left." (or "Probably finished."), "Your {product} runs out around {date}.", "Your {product} has probably run out. Bought a new pack? Scan its code." **Reorder on Man Matters** (opens in a new tab), **Remind me in 3 days**. No pack: "How big is your pack, and when did you buy it?" **Add a pack**.
- Mates: **People who started when you did**, pill **Demo community**, "{n} people in your start week are on week {w} today.", one event line, **See them**.
- Projection teaser and stopping section as above.
- Ring labels: "You are here, week {w}", "Week {w}, next photos", "Rains, weeks {a} to {b}", "Shed window".

## Insight cards (48)

Format: `id` | when | priority | tone | ref. Then variant A and variant B. Day is journey day. Priority 100 beats everything. Night is 22:00 to 05:00.

### Calm, days 1 to 14
1. `calm-day-one` | day 1 | 60 | warm | aafp
   A: "Day one. The clock has started. Nothing will look different for a while, and that's the plan."
   B: "Today counts. The first weeks are quiet on the outside. That's normal, not a problem."
2. `calm-photo-remembers` | days 2 to 14, baseline taken | 50 | warm | kahneman1979
   A: "Nothing to see yet, and that is the plan. Your photo is doing the remembering for you."
   B: "Your scalp won't look different this week. Your day-one photo remembers how it looked, so you don't have to."
3. `calm-no-baseline` | days 1 to 21, no baseline | 90 | direct | kahneman1979
   A: "You haven't taken your day-one photos yet. Two minutes, and it's the most useful thing you'll do this month."
   B: "Take your three photos before anything changes. Future you will want something to compare against."
4. `calm-habit` | days 3 to 10 | 45 | dry | odonoghue1999
   A: "The hard part right now is boring: doing it every day at the times on your pack. Tie it to something you never skip."
   B: "Pair it with a habit you already have. Brush, then apply. Boring wins."
5. `calm-roots` | days 5 to 14 | 40 | warm | kaliyadan2013
   A: "It works on the roots, not the hair you can see. The hair on your head today started growing months ago."
   B: "Think of it as working on next season's hair. This season's was already decided."
6. `calm-heads-up` | days 10 to 16 | 70 | direct | mcguire1961
   A: "Heads up. Over the next few weeks, many people notice more hair in the shower. If that happens, it's the expected part."
   B: "Something to know before it happens: an early shed is common between about week two and week eight."
7. `calm-letter-unwritten` | days 1 to 14, no letter | 55 | warm | odonoghue1999
   A: "Write two lines to yourself for week five. You'll see why when you get there."
   B: "Future you is going to have a rough week around week five. Leave him a note."
8. `calm-quick-commerce` | days 1 to 10, channel quick-commerce | 65 | dry | mcguire1961
   A: "You bought this in ten minutes, so nobody gave you the talk. Short version: expect a shed, judge at six months."
   B: "No doctor call came with your order, so here's the one line from it: a shed in the first two months is common."

### Shed window, days 15 to 56
9. `shed-open` | days 15 to 21 | 60 | direct | kaliyadan2013
   A: "You're in the shed window now. More hair coming out over the next few weeks is the pattern most people describe."
   B: "The shed window opened this week. It's drawn on your ring so it doesn't sneak up on you."
10. `shed-high` | days 14 to 56, latest shed or worry 3+ | 80 | calm | oliver1980
   A: "This is the shed window. If more hair is coming out right now, that is the pattern most people describe. Here is your day-one photo to compare against."
   B: "More hair in the drain this week fits the timing. Look at your day-one photo next to today before you decide anything."
11. `shed-why` | days 15 to 56 | 45 | warm | bernstein
   A: "Why shed at all? Older resting hairs get pushed out to make room for new growing ones. Out with the old, slowly."
   B: "The hairs falling now were already on their way out. The treatment just moved the date up."
12. `shed-week-five` | days 29 to 35 | 75 | warm | shadi2023
   A: "Week five. The week most people find hardest, and the week a lot of people quit. You're still here."
   B: "Week five is where many people give up. The people who don't are the ones who get to see month six."
13. `shed-letter-ready` | days 22 to 35, letter written and not revealed | 85 | warm | odonoghue1999
   A: "A few weeks ago you wrote something for this week. Want to read it?"
   B: "Past you left a note for exactly this stretch. It's ready when you are."
14. `shed-monsoon` | days 15 to 56, season overlap | 78 | calm | kunz2009, hsiang2018
   A: "Two sheds are overlapping. The season is part of this, not just the bottle."
   B: "Monsoon months bring their own hair fall. Right now you're getting that and the treatment shed at once. Both pass."
15. `shed-seasonal-peak` | days 15 to 56, no monsoon, start month August to October | 50 | calm | kunz2009
   A: "Late summer and autumn are peak shedding months for most people, treated or not. Some of this is the calendar."
   B: "Hair fall has a season, and you started in it. Not everything you're seeing is the bottle."
16. `shed-counting` | days 15 to 56 | 40 | dry | taylor1978
   A: "Counting hairs on the pillow is a reliable way to feel worse. Your photos measure the thing that matters."
   B: "Hair on the pillow is loud. Hair growing under the skin is silent. Trust the quiet one a bit more."
17. `shed-other-people` | days 15 to 56 | 45 | warm | cialdini1984
   A: "If someone has commented on your hair lately, they're seeing week five, not month six. You can show them the plan."
   B: "A remark from someone at home isn't a verdict. They don't have your map."
18. `shed-cohort` | days 22 to 49 | 40 | warm | cialdini1984
   A: "Plenty of people who started the same week as you are in this stretch right now. Nobody enjoys this part."
   B: "You're not the only one squinting at the shower drain this week."
19. `shed-quiet` | days 15 to 56, latest shed 0 to 1 and worry 0 to 1 | 45 | warm | kaliyadan2013
   A: "Quiet week. Not everyone sheds much, and that's fine too. A small shed doesn't mean it isn't working."
   B: "No big shed so far? That happens. It isn't a sign of anything either way."
20. `shed-photo-week-four` | photo window week 4 open | 82 | direct | kivetz2006
   A: "First monthly photo day. Same spot, same light, same time as day one. Expect no visible change yet."
   B: "Week four photos tonight. These won't show growth. They're for week twelve to compare against."
21. `shed-peak` | days 36 to 49 | 50 | calm | kaliyadan2013
   A: "For many people the shed peaks around now and then eases. You're closer to the end of this part than the start."
   B: "If this is your peak, it's the peak. It usually gets easier from here."
22. `shed-more-isnt-faster` | days 15 to 56 | 35 | direct | aafp
   A: "Tempted to use more to speed it up? More doesn't make it faster and can irritate your scalp. Stick to your pack."
   B: "Extra doesn't mean extra results. Same amount, same times, every day."
23. `shed-kept-going` | intercept "keep-going" in the last 7 days | 72 | warm | kivetz2006
   A: "You thought about stopping this week and kept going. That was the hard bit."
   B: "You had the stopping thought and didn't act on it. Most of this treatment is exactly that."

### Settling, days 57 to 84
24. `settle-open` | days 57 to 63 | 55 | calm | kaliyadan2013
   A: "The shed window is closing. For many people hair fall eases over the next few weeks."
   B: "Two months in. The loudest part is usually behind you now."
25. `settle-photo-week-eight` | photo window week 8 open | 82 | direct | kivetz2006
   A: "Week eight photos tonight. Compare with day one, not with yesterday."
   B: "Two months of data. Same spot, same light. Your future self is keeping score."
26. `settle-boring` | days 64 to 84 | 35 | dry | none
   A: "This part is boring. Boring is good. Nothing dramatic is meant to happen yet."
   B: "No news is the news this month. Keep going."
27. `settle-still-heavy` | days 57 to 84, latest shed 3+ | 80 | serious | aafp
   A: "Still shedding a lot past week eight? It can take a while to settle, especially in a rainy season. If it's still heavy by week twelve, check in with a doctor."
   B: "Heavy shedding this late can still be normal, but it's worth watching. If it hasn't eased by week twelve to sixteen, a doctor should take a look."
28. `settle-halfway` | days 84 to 90 | 65 | warm | kivetz2006
   A: "Halfway to judgement day. Half the waiting is done, and none of it was wasted."
   B: "Day 84. Halfway. The second half tends to be the one with something to look at."

### First fine hairs, days 85 to 126
29. `fine-week-twelve` | photo window week 12 open | 82 | direct | aafp
   A: "Week twelve photos. Some people see a little, many see nothing yet. Both are on schedule."
   B: "Three months. Take your photos and compare with day one, side by side, same light."
30. `fine-hairs` | days 100 to 130 | 60 | warm | bernstein
   A: "The first fine hairs often show up around now. Retake your photos tonight."
   B: "Look closely at your hairline in good light. New hairs start thin and light, easy to miss."
31. `fine-growth-rate` | days 85 to 126 | 40 | calm | bernstein
   A: "Hair grows about a centimetre a month. New hairs need a few months to be long enough to notice."
   B: "A new hair started in month two is barely a centimetre long now. Patience is just arithmetic here."
32. `fine-not-late` | days 90 to 126, latest worry 3+ | 70 | calm | aafp
   A: "If you can't see a difference yet, you're not late. The fair point to judge is around week 24."
   B: "Nothing visible yet is still on schedule. Most visible change shows up between month four and six."
33. `fine-week-sixteen` | photo window week 16 open | 82 | direct | kivetz2006
   A: "Week sixteen photos. This is often the first comparison where people spot something."
   B: "Four months in. Same spot, same light, and look at the hairline and crown closely."

### Building, days 127 to 167
34. `build-long-middle` | days 127 to 150 | 35 | dry | none
   A: "The long middle. Nobody writes songs about month five. Keep going anyway."
   B: "Month five. Less drama, more routine. That's exactly how it should feel."
35. `build-week-twenty` | photo window week 20 open | 82 | direct | kivetz2006
   A: "Week twenty photos. One more set after this, and then you get to judge properly."
   B: "Twenty weeks of photos. Line them up and look at the trend, not one picture."
36. `build-almost` | days 150 to 165 | 55 | warm | kivetz2006
   A: "Two weeks to judgement day. Plan a proper photo session: same spot, same light, no rush."
   B: "Almost there. Your week 24 photos are the ones that count, so pick a good light."
37. `build-consistency` | days 127 to 167, missed doses under 3 in the last two check-ins | 40 | warm | none
   A: "Five months of showing up. That consistency is most of the work."
   B: "You've done the boring part for months. That's the bit most people don't manage."

### Judgement and beyond, day 165 onward
38. `judge-day` | days 165 to 175 | 85 | calm | aafp
   A: "Week 24. Time to judge fairly: day one next to today. If you're not sure what you're seeing, a doctor can read it with you."
   B: "Judgement week. Look at all six sets of photos in order. The trend tells you more than any single one."
39. `beyond-keep` | day 176 onward | 45 | calm | aafp
   A: "Many people keep going past six months, because the full effect can take closer to a year."
   B: "Six months is when you can judge. A year is often when it's fully showing. Your call, with your doctor."

### Any time
40. `missed-few` | latest missed doses 3 to 6 | 74 | warm | odonoghue1999
   A: "Missed a few days? It happens. Pick it up again tonight. No catching up, no doubling, just carry on."
   B: "A few gaps don't undo anything. Start again at your next usual time."
41. `missed-many` | latest missed doses 7+ | 76 | calm | kaliyadan2013
   A: "Life got in the way for a bit. When you restart, you may see a small shed again. That's normal, not a step back."
   B: "Been off it for a while? Restart at your usual times. A second, smaller shed after a restart is common."
42. `night-worry` | night, latest worry 3+ | 88 | calm, no numbers | none
   A: "It's late, and hair always looks worse at this hour. Breathe with the circle for a minute. Look again in daylight."
   B: "Nothing about your hair will change before morning. Breathe with the circle. Sleep is good for it too."
43. `restart-after-pause` | within 21 days after a restart date | 77 | calm | kaliyadan2013
   A: "Welcome back. Restarting can bring a second, smaller shed. Same process, not a new problem."
   B: "You're back on it. If you shed again in the next few weeks, that's the restart, not a failure."
44. `no-checkin-week` | no check-in for 7+ days, days 8 onward | 58 | dry | none
   A: "No check-in for a week. Thirty seconds, the bar at the bottom."
   B: "How's it going up there? Tap the bar at the bottom and tell us."
45. `photo-overdue` | monthly photo window passed without photos, up to 10 days | 68 | direct | kivetz2006
   A: "Your week {w} photos are a few days late. Tonight works. Same spot, same light."
   B: "Missed photo day. No harm done, just take them when you're next by that window."
46. `roller-night` | roller in products, today is a roller night | 52 | direct | routine
   A: "Roller night. Keep it apart from your solution tonight. Your Today card has the timing."
   B: "It's a roller night. Check the timing on your Today card before you start."
47. `gummies-food` | gummies in products, morning | 30 | dry | routine
   A: "Gummies go down better with food. Breakfast is the easy anchor."
   B: "Take your gummies with a meal. Easier to remember, easier on the stomach."

### Red flags (override everything, no humour, coral, no bounce)
48. `red-irritation` | latest red flags include pain, burning or rash | 100 | serious | leaflet
   A: "You mentioned pain, burning or a rash. Please speak to a doctor before your next application. Show them this list."
   B: "Pain, burning or a rash needs a doctor to look at it. Don't apply again until you've spoken to one."
49. `red-systemic` | latest red flags include swelling or dizzy-or-racing-heart | 100 | serious | leaflet
   A: "Dizziness, a racing heart, or swelling in your face, hands or feet needs a doctor today. Don't wait for the next check-in."
   B: "Please contact a doctor today about the dizziness, racing heart or swelling you mentioned."
50. `red-late-heavy` | day 112 onward, latest shed 4 | 95 | serious | aafp
   A: "Heavy shedding this far in isn't the usual pattern. Book a doctor's appointment so someone can take a proper look."
   B: "Shedding this much after four months is worth a doctor's opinion. Book one this week."
51. `red-other` | latest red flags include other-unusual | 95 | serious | none
   A: "You noticed something unusual. Trust that. A doctor can tell you if it's related."
   B: "If something feels off, it's worth asking a doctor. Bring your check-in history."

### Paused (added in Phase 6)
52. `paused-now` | paused, before the restart date | 86 | calm | kaliyadan2013
   A: "You're paused until {restart}. Your map keeps its place, and day one stays day one."
   B: "Paused for now, restarting on {restart}. Nothing on your map moves while you're away."

### "Why am I seeing this?" sheet
Pattern: "You're seeing this because {reasons}." Reasons are joined from the card's conditions in plain words: "you're on day {d}", "you said hair fall is {shedWord}", "you're in {city}'s monsoon months", "you bought on a quick-commerce app", "it's late at night". Then: "Where this comes from: {reference}." Close: **Got it**.

Shed words: 0 barely any, 1 a few, 2 normal for me, 3 more than usual, 4 handfuls. Worry words: 0 calm, 1 a little, 2 some, 3 a lot, 4 very.

Built: link **Why am I seeing this?** under every note; sheet title **Why this note?** *Because of what you told us.*; "Where this comes from" lists the full citations (the leaflet and the routine table have their own lines). Close **Got it**. The night card's circle: "Breathe in", "Breathe out"; under reduced motion "Breathe in slowly, then out even more slowly."

## The map and the week pages (Phase 6)
- Map: **Your 24 weeks.** *A ring for each one.* "What's normal, week by week, drawn before it happens." Picker: "Week {n}" with tags **You are here**, **Photos**, **Rains**, the week's turn and one line, **Read week {n}**. Rains: "Rains on weeks {a} to {b}, on top of the shed window. Some of the hair fall then is the season, not the bottle." / "... clear of the shed window." / "No rainy months inside your 24 weeks." Legend: Shed window, Photo days, Rains, You are here. List title **Week by week**, groups Quiet start, The shed window, Settling, First fine hairs, The long middle, A fair verdict.
- Week pages: **Week {n}.** with its turn, then **What often happens**, **What to do this week**, **Not a reason to worry**, **When to see a doctor** (alert tone), **Sources**. Tags: "You're in this week.", "A photo week: same spot, same light, same time as day one.", "Your rains fall on this week." All 24 weeks of text are in `src/content/weeks.ts` (phase text plus each week's own turn and line, and its own sections where it matters: weeks 3, 4, 5, 8, 12, 16, 20, 24).
- The note: **Write a note for week five.** *Your own words will land better than ours.* **Seal it**. Sealed: **Your note is sealed.** *It opens on {date}.* "You'll get it at the start of week four, or sooner if you ever open "Before you stop"." Ready: **Your note is ready.** *You wrote it for this stretch.* **Read your note**. Read: **From you, on day one.** with "You wrote this on {date}."

## Check-in

- Title: **How is your scalp today?** Turn: *Thirty seconds. We'll tell you what's normal.*
- Shed slider label: "Hair fall this week" (barely any, a few, normal for me, more than usual, handfuls)
- Worry slider label: "How worried are you" (calm, a little, some, a lot, very)
- Missed doses: "Missed applications in the last 7 days"
- Red flags: "Anything like this?" Pain on the scalp, Burning, Rash or flaking, Swelling in face, hands or feet, Dizzy or racing heart, Something else unusual
- Note: "Anything else? (optional)"
- Submit: **Save check-in**. Under it: "Saved on this phone only." Answer opens with **Check-in saved.**
- Answer titles: calm answers "Thanks." *That's on schedule.*; doubt "Heard." *Here's where you are.*; red flag "Please see a doctor." (alert tone, no turn, then the list of what was ticked). Day-one photo caption: "Day 1. Compare it with today in daylight, not with the drain." Without one: "No day-one photo yet. Take one tonight; it makes next month easier." Button **Done**.
- Night card in Phase 5 says "Breathe slowly for a minute"; the breathing circle comes with Phase 6.

### Response matrix
| Phase | Shed 0 to 2, worry 0 to 2 | Shed 3 to 4 or worry 3 to 4 |
|---|---|---|
| Calm | "Quiet start, as expected. See you next week." | "Early to be seeing much. If it's more hair, the shed window usually opens around week three. Here's your plan." + map |
| Shed | "A calm week in the shed window. Not everyone sheds a lot." | "This is the part that feels worst and is the most expected. Here's your day-one photo. Here's what week {w} looks like for most people." + baseline + map |
| Settling | "Settling down. That's the direction you want." | "Still a lot? It can take a few weeks longer, especially in the rains. If it's still heavy around week twelve to sixteen, see a doctor." |
| First hairs | "Good time to look closely at your hairline in daylight." | "Nothing visible yet is still on schedule. Week 24 is the fair point to judge." |
| Building and later | "Steady. That's what month five should feel like." | "If shedding is heavy this late, a doctor should take a look." + doctor link |

Any red flag replaces the response with the matching red-flag card.

## Wait, before you stop

Built (Phase 6, source `src/content/journey.ts`). Step chapters: Day one, Where you are, Your note, Your choice. Titles in two voices: **This was day one.** *Before you decide, here's where you started.* / **You're on day {d}, week {w}.** *The shed window runs to about week eight. Fair judgement is week 24.* / **You wrote this on {date}.** *To whoever you'd be this week.* / **Most people who feel this way are in weeks three to seven.** *It's the most common time to stop, and the least informative time to judge.* Outcomes: **Kept going.** *That was the hard bit.* / **Paused until {date}.** *Restarting can bring a small shed again.* "That's expected. Your map keeps its place, and day one stays day one." **Add the restart to my calendar**, **Back to Today**. Closing: **Close without choosing**. No photo: "No day-one photo was taken. That's all right; the map still holds."

For your doctor (one page): **For your doctor.** *One page, from this phone.* "Show this to a dermatologist or your GP. It has your dates, what you use and how the weeks have felt, and nothing else." Rows: Started, Today, Using, Bought through, Flagged ("Nothing flagged."). Check-ins table (date, hair fall, worry, missed). Questions worth asking: "Is what I'm seeing the usual shed, or something else?", "Is this the right product and routine for me?", "When should I judge whether it's working?" Disclaimer: "Week Five is not medical advice and doesn't diagnose anything. This page is a summary of what you entered." **Print this page**.

- Entry: **I'm thinking of stopping**
- Step 1: **This was day one.** (their crown photo) "Before you decide, here's where you started."
- Step 2: **You're on day {d}, week {w}.** (mini map with marker) "The shed window runs to about week eight. Fair judgement is week 24."
- Step 3 (if letter): **You wrote this on {date}.** (the letter in serif)
- Step 4 fact box: "Most people who feel this way are in weeks three to seven. It's the most common time to stop, and the least informative time to judge."
- Options, equal weight:
  - **Keep going** "Back to your plan." Confirmation: "Kept going. That was the hard bit."
  - **Pause with a plan** "Pick a date to restart. We'll add it to your calendar." Confirmation: "Paused until {date}. Restarting can bring a small shed again; that's expected."
  - **Talk to a doctor** "Bring your photos and check-ins. We'll put them on one page." Confirmation: opens doctor guidance.
- Close without choosing: allowed, logged as "closed", no follow-up nag.

## Mirror and projection

- Mirror title: **Day one and now.** Caveat: "These photos are for you. Light and angle change how hair looks."
- Lighting warning: "These two were taken in different light. Compare carefully."
- Slider label: "Drag to compare day one with week {w}". Ghost toggle: **Show day-one outline**.
- Projection title: **What week 24 can look like.**
- Thinking stages: "Reading your baseline", "Marking the area", "Estimating a typical outcome".
- Permanent label: **An illustration of a typical outcome, not a promise. Results vary.**
- Under it: "Most visible change, if it comes, shows up between month four and six. This picture is to help you picture the wait, not to predict your result."
- Empty, no mask: "Paint the area you're watching first. Takes ten seconds."
- Empty, no photo: "Take your day-one photos first."

Phase 7 (source `src/content/mirror.ts`, monthly capture in `src/content/baseline.ts`):
- Mirror turn by the week compared: 4 "Four weeks in. Expect no change yet." / 8 "Eight weeks in. Still early to judge." / 12 "Twelve weeks in. Look, don't measure." / 16 "Sixteen weeks in. Fine hairs come first." / 20 "Twenty weeks in. Nearly a fair test." / 24 "Twenty four weeks. Now it's a fair test." Only day one: "Day one, on its own for now." No photos: "Day one comes first." with "No photos yet. Two minutes, and future you will thank you." and **Take day-one photos**.
- Strip: "Compare with week {w}, {date}", "Take week {w} photos", "Week {w} photos, around {date}", "Due", "Late", "Missed", "Not needed".
- Due prompt: "Week {w} photos are due." / "Week {w} photos are a few days late." / "The rest of your week {w} photos." then "Same spot as day one, around {9 pm}. Tonight works." Buttons **Take week {w} photos**, **Take the rest**. Otherwise "Your first monthly photos are in week {w}, around {date}." or "Next photos in week {w}, around {date}."
- Photo days: "Saved", "{n} of 3", "Due now", "A few days late", "Missed, no harm done", "Too soon after day one", "Around {date}"; **Take photos**, **Retake**, **Compare**.
- Photos that compare: "Same spot, same window, every time." / "Around {9 pm}, the hour of your day-one photos." / "Dry hair, combed the way you usually wear it." / "The camera shows day one faintly. Line up with it."
- Illustration: chapter "Week 24 illustration"; thinking "Drawing week 24." / "On this phone, from your day-one photo."; result turn "One typical case, drawn on day one."; captions "Day one", "Week 24, illustration"; ring label "Week 24, an illustration"; **Done**, **Change the marked area**, **Mark the area**, **Try again**; "This phone couldn't draw the illustration. Try again, or come back to it later."
- How this picture is made: "It's drawn on this phone from your day-one photo. Inside the area you marked, it adds fine hairs and lets a little less scalp show, always at the same small strength. Nothing is uploaded, and it isn't a medical image. It can't tell you what will happen to you."
- Monthly photos: "Week {w} photos." / "Same three, same spot." / "Same spot and light as day one, around {9 pm}. The camera shows your day-one photo faintly, so you can line up with it." Switch **Day-one outline**, note "Your day-one photo is laid faintly over the camera. Line up with it." Close "Week {w}, recorded." / "See you in week {next}." (last: "That's the whole set.") with "They're next to day one in the mirror. Compare them there, not with yesterday." and **Compare with day one**.

## Journey mates (demo community)

- Title: **People who started when you did.** Pill: **Demo community**.
- Event templates: "{name} from {city} finished week {w}." "{name} from {city} took their week {w} photos." "{name} from {city} checked in." "{name} from {city} wrote a note to their week-five self." "{n} people in your start week are on week {w} today."
- Nudge sheet: **Send {name} a nudge.** Phrases: "Keep going", "Week five is the worst one", "Photos don't lie", "Same here", plus emoji. Sent: "Sent." (local animation only)
- Production panel: **How this would work for real.** "Opt in only. Nicknames, never full names. Cities, never addresses. No photos are ever shared, and nobody sees anyone's results. Right now these people are simulated so you can see the idea."
- Invite: **Invite a friend.** Share text: "I'm using Week Five to get through the first six months of hair treatment without losing my mind. It's free and keeps everything on your phone."

## Reorder

- Banner at 10 days: "About 10 days of {product} left. Reorder when it suits you."
- Banner at 3 days: "About 3 days left. Worth ordering today so you don't miss days."
- No pack: "How big is your pack, and when did you buy it?"
- Offline: "Reordering needs a connection."

## Routine guidance labels
- Footer on every routine suggestion: "General guidance. Follow your pack leaflet or your doctor." Link: **Talk to a doctor**.
- Spacing note: "Many people space the two applications roughly 12 hours apart."
- Travel day: "On travel days, keep the times close to normal and pack it in your cabin bag."

## Errors and empties
| Case | Copy |
|---|---|
| Camera denied | "No camera access. You can still pick photos from your gallery." |
| Camera unavailable | "This browser can't open the camera. Choose a photo instead." |
| Storage blocked | "This browser isn't saving anything right now. Open in a normal tab to keep your plan." |
| Storage low | "Your phone is low on space for photos. Export a copy, then delete extra shots." |
| Data unreadable | "We couldn't read your saved data. A copy is kept on this phone. You can export it from Profile, Data." |
| Notifications denied | "Notifications are off in your browser. The calendar file works instead." |
| Export done | "Export saved to your downloads." |
| Delete confirm | "Delete everything? Your plan, check-ins and photos will be gone from this phone. This can't be undone." Buttons: **Delete everything** / **Keep my data** |
| Deleted | "Everything is deleted." |

## About
- **Why this exists.** "Most people who start minoxidil and stop do it between weeks three and seven, exactly when shedding is expected. Nobody prepares them for it, and they can't see their own progress. This app gives them a map of what's normal and a mirror that shows how far they've come."
- Predictions section, references section, independent concept line: "An independent concept built for the Mosaic Fellowship Builder Challenge. Not made, reviewed or endorsed by Man Matters or Mosaic Wellness."
- Disclaimer: "Not medical advice and not a diagnostic tool. Follow your pack leaflet and your doctor. If something feels wrong, see a doctor."

## Reference keys
kaliyadan2013, shadi2023, oliver1980, kahneman1979, odonoghue1999, kivetz2006, kunz2009, hsiang2018, taylor1978, cialdini1984, mcguire1961, bernstein, aafp, leaflet (the product's own pack leaflet), routine (the routine rule table). Full citations in `HANDOFF.md` section 12.

## Added in the last run (Phases 8 to 12)
The strings live with their screens; these files are the source of truth now:
- Routine suggestions and labels: `src/content/routines.ts` (13 rules, always under "General guidance. Follow your pack leaflet or your doctor.").
- Supply, the reorder and reminders: `src/content/supply.ts` and `REMINDER_COPY` in `src/lib/reminders.ts` (the 10-day and 3-day lines above are used as written).
- Journey mates: `src/content/mates.ts` (the templates, phrases and production panel above, plus "started today" and the invite text).
- You: `src/content/profile.ts`.
- Hinglish: `src/content/hinglish.ts`, the nine setup questions and one line for each of the 52 insight cards (plus the fallback and not-started lines), in Roman script. Same rules: no dashes, no doses, short and kind.
- Phone view: "Phone view. The same app, in one hand." and "It's live: tap around. It shares this window's data, and closing it brings the big screen to wherever the phone was."
