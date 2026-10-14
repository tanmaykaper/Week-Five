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

## Intro: the six beats

1. What's in this bottle works on hair that hasn't grown yet.
2. Around week three, a lot of people see more hair fall, not less. For many, that's the treatment starting.
3. The fair time to judge is about six months. Not week five. Definitely not day nine.
4. Your memory is a bad judge of hair. A photo is a good one.
5. So here's a 24 week plan, with a map for every week of it.
6. And you're not the only one. Plenty of people started the same week you did.

Final frame (with the drop): **Let's set up your plan.**
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

## Onboarding story (nine steps)

Each step: question, why we ask, input, skip rule.

| # | Question | Why we ask | Input | Skip |
|---|---|---|---|---|
| 1 | What should we call you? | Only for greetings. A nickname is fine. | Text, 24 chars, placeholder "e.g. Arjun" | No (default "you" if blank: "Morning, you") |
| 2 | Which age band are you in? | Changes a few tips and default reminder times. Never your dose. | 18 to 24, 25 to 34, 35 to 44, 45 and up | Yes |
| 3 | Which city are you in? | Only to know when your rainy season is. Monsoon months make hair fall worse for everyone. | Search list of cities, plus "Somewhere else" with a monsoon yes or no | Yes |
| 4 | Here's what we found on your pack. Using anything else? | So your daily card shows the right things. | Product chips, pre-ticked from the SKU | No (at least one) |
| 5 | How did you buy it? | If nobody walked you through it, we'll give you the short briefing first. | Hair assessment and kit, Quick-commerce app, Pharmacy or somewhere else | No |
| 6 | When did you start, or when will you? | Everything on your map counts from this day. | Date, default today, quick picks "Today", "Yesterday", "Last week" | No |
| 7 | What bothers you most right now? | We'll keep an eye on that area in your photos. | Multi-select: Shedding, Seeing my scalp, Hairline, Crown, Something else | Yes |
| 8 | Write a note to yourself for week five. | Week five is when most people want to stop. Your own words land better than ours. | Text area, 400 chars, serif. Placeholder: "Dear week-five me, you started this because..." | Yes ("I'll write it later") |
| 9 | When do you want your reminders? | So the daily card shows the right times. You can turn notifications off. | Morning and evening time pickers, notifications toggle | Times prefilled |

Step 3, "Somewhere else" follow-up: "Is it monsoon season where you are between June and September?" Yes / No / Not sure (treated as yes).
Step 8 saved toast: **Note saved. We'll hand it back in week four.**
Finish: **Your plan is ready.** "One more thing before the map: the bit nobody tells you."

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

## Baseline capture

- Intro: **Three photos, two minutes.** "Same spot, same time of day, every month. A window in daylight is perfect. Bathroom light is not."
- Crown: "Hold the phone above your head, camera facing down. Line the top of your head up with the outline." Shutter: **Take crown photo**
- Hairline and temples: "Face the camera, hair pushed back, eyebrows on the line."
- Parting: "Tilt your head down. Part your hair where you normally would."
- Light meter: Too dark: "Too dark. Move closer to a window." Good: "Good light." Too bright: "Too bright. Step out of direct sun."
- After each: **Keep** / **Retake**. Saved: "Photo saved. It stays on this phone."
- Painter intro: **Show us the area you're watching.** "Paint over it with your finger. We use this for the projection, nothing else." Buttons: **Undo**, **Clear**, **Done**, **Skip**.
- Done: **Day one, recorded.** "Next photos in week four. We'll remind you."
- Install nudge (after baseline): "Add Week Five to your home screen. It keeps your photos safer on this phone."

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
- Today card: title **Today**. Slots "Morning, {time}" and "Evening, {time}". Done state "Done". Streak "{n} days in a row" (no streak at 0, no shaming when it breaks).
- Mirror card: **Day one and now.** Empty: "No photos yet. Two minutes, and future you will thank you." Button **Take photos**.
- Projection card: **What week 24 can look like.** "An illustration of a typical outcome, not a promise."
- Reorder card: **About {n} days left.** "Your {product} runs out around {date}." Button **Reorder on Man Matters**. Snooze **Remind me in 3 days**.
- Mates strip: "{n} people in your start week are on week {w} today." Pill: **Demo community**.
- Capsule placeholder: **How is your scalp today?**
- Stopping link: **I'm thinking of stopping**

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

### "Why am I seeing this?" sheet
Pattern: "You're seeing this because {reasons}." Reasons are joined from the card's conditions in plain words: "you're on day {d}", "you said hair fall is {shedWord}", "you're in {city}'s monsoon months", "you bought on a quick-commerce app", "it's late at night". Then: "Where this comes from: {reference}." Close: **Got it**.

Shed words: 0 barely any, 1 a few, 2 normal for me, 3 more than usual, 4 handfuls. Worry words: 0 calm, 1 a little, 2 some, 3 a lot, 4 very.

## Check-in

- Title: **How is your scalp today?**
- Shed slider label: "Hair fall this week" (barely any, a few, normal for me, more than usual, handfuls)
- Worry slider label: "How worried are you" (calm, a little, some, a lot, very)
- Missed doses: "Missed applications in the last 7 days"
- Red flags: "Anything like this?" Pain on the scalp, Burning, Rash or flaking, Swelling in face, hands or feet, Dizzy or racing heart, Something else unusual
- Note: "Anything else? (optional)"
- Submit: **Save check-in**. Toast: **Check-in saved.**

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
| Camera denied | "No camera access. You can still upload photos from your gallery." |
| Camera unavailable | "This browser can't open the camera. Upload a photo instead." |
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
