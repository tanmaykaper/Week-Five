# Screens

Low-fidelity wireframes, phone (390 wide) and desktop (1440 wide). v2 (14 October 2026): every route is a responsive web page. No phone frames. Phone layouts also hold at 360 and 430; tablet (768 to 959) uses the top nav with single-column content that goes two-up where noted. `docs/design-preview.html` renders Today at full fidelity.

Legend: `[ Button ]` primary, `( Button )` quiet, `{ ... }` the one bordered panel, `----` hairline, `~~~` hatched shed window, `*` amber photo day, `o` you are here, `|tabs|` phone bottom tab bar.

Shared frame, 768 px and up:
```
+--------------------------------------------------------------------------+
| (drop) Week Five   Today  Map  Mirror  Mates  You     (o Demo, day 34) (moon)|  sticky, 64 px, blur
+--------------------------------------------------------------------------+
|        content, max 1200, gutters clamp(20, 4vw, 48)                      |
|                                                                          |
|                 ( drop  How is your scalp today?          [^] )           |  floating check-in bar
+--------------------------------------------------------------------------+
```
Shared frame, under 768 px:
```
+------------------------------+
| (drop) Week Five  (o Demo 34)|
|  content, one column, 20 gutters
| ( How is your scalp today? ^)|
| Today  Map  Mirror Mates  You|  bottom tabs
+------------------------------+
```

## `/` redirect
No UI. A blank `--bg` frame with the app mark centred for at most one frame while the redirect runs.

## The intro (overlay on `/start`; `/intro` replays it), v3

Always light, on the pool. Captures: `artifacts/v3/final/` (run `node artifacts/tools/v3-intro.mjs <dir>` against the dev server).

Desktop: words in the left 48 percent, vertically centred; the dropper and later the rings fill the right. HUD along the bottom: chapter name left, 24 ticks centre, next action right. Phone: the scene above, words at the bottom, HUD under them.

| Scroll | Camera and scene | Words |
|---|---|---|
| 0 to 14 % | Three-quarter view; the tilted dropper turns upright | The roots |
| 14 to 28 % | Closer; the bulb squeezes, the liquid drops | The shed |
| 28 to 42 % | Macro on the tip; a drop forms | Six months |
| 42 to 56 % | The drop swells and falls; the camera follows it down; impact and ripple | The photo |
| 56 to 70 % | The camera climbs to look down; the ripple freezes into 24 rings; shed band, photo dots and labels appear | The map |
| 70 to 84 % | A slow orbit; six other drops land and ring out | Not alone |
| 84 to 100 % | Settles above the rings | Let's set up your plan |
| Release | The camera settles on the welcome view; the page rises at 0.55 s | |

Reduced motion: the same six poses, cut every 4 s, with Pause, Next and Skip.

## `/start` (v3)
Open layout on the pool. Desktop: words in a 640 px column on the left, the rings spreading on the right. Phone: rings above, everything else at the bottom.
```
Welcome.
Let's set up your plan.          (serif turn)
One question at a time, about two minutes.
{ (drop) We read this from your pack / Regrowth solution, 60 ml / Bought 1 October, batch B2291 }
[ Start setup ]  ( Try it with sample data )
(lock) Your details and photos stay on this phone. No account...
```
Mid-way through setup the primary reads "Carry on from question {n}".

## `/onboarding` (v3)
HUD row: ( < )  3 of 9  Your rains  ---------  (nine ticks)
Then the question in two voices, the answers, and Continue (plus Skip where allowed). Desktop: a 720 px column on the left, the camera's view of the pool on the right, a new view per question. Phone: question and answers at the bottom, the pool above.
- City and start date questions show their effect on the rings (rain, "you are here") and say it in a live line.
- Finish: "Your plan / is ready." with a five-row summary, then the briefing.
- Briefing (`?step=briefing`): title, lead, one card at a time (sans title, body, which weeks light up), dots, ( < ) [ Next ]. Last: [ Got it. Take my day-one photos. ]

## `/baseline` (v3)
Always light, on the pool. Captures: `artifacts/v3/baseline3/` (run `node artifacts/tools/v3-baseline.mjs <dir> <base> <desk|tab|phone> <fake-head.mjpeg>`).

Intro, open layout (words left on wide screens, at the bottom on phones; the rings with the photo-day dots behind):
```
( < )  0 of 3  Day-one photos                 --- --- ---
Three photos, two minutes.
Your day one, on the record.                  (serif)
Same spot, same time of day, every month...
(crown)   (hairline)   (parting)              drawings, or the photo + Saved
[ Open the camera ]  ( I'll do it later )
(lock) Photos stay on this phone. Nothing is sent anywhere.
                                   o Photos every four weeks   (label on the dots)
```

Capture, wide screens: words left, the lens right with the rings spreading out round it.
```
( < )  1 of 3  Crown                                   === --- ---
Your crown, from above.                    .-~~~~~~~-.
The bit you never see yourself.          /  camera    \     ) ) ) weeks 5 to 24
Hold the phone above your head...       |   ghost      |
[==o====] Good light.                    \            /
[ (o) Take crown photo ] ( Choose a photo ) ( Timer, 3 s )  '-.____.-'
Timer on. Three seconds to get the phone into place.
```
Phones: the lens on top, words under it, then the camera-app row `(gallery)  ((o))  (timer)`. Review swaps the row for `( Retake ) [ Keep ]`. No camera: the ghost on white glass, the reason, `[ Choose a photo ]`.

Painter (optional): the photo in the lens, `( Crown ) ( Hairline ) ( Parting )`, `Brush (s)(m)(l)`, `( Undo ) ( Clear ) ( Mark the middle for me )`, `[ Done ] ( Skip )`.

Close, open layout:
```
( < )  All set  Day one                       === === ===
Day one, recorded.
See you in week 4.                             (serif)
Next photos around 4 November, at about 9 pm. Same spot, same light.
(photo) Crown     ( Retake ) ( Delete )        rows on phones, three across on wide screens
(photo) Hairline  ( Retake ) ( Delete )
(photo) Parting   ( Retake ) ( Delete )
[ Go to Today ]  ( Mark the area you watch )
{ (phone) Add Week Five to your home screen... ( Add to home screen ) }
                                o Week 4, next photos      (label on its ring, lit)
```

## `/home` (nav label: Today), v3
Captures: `artifacts/v3/today-final/` (run `node artifacts/tools/v3-today.mjs <dir> <base> <desk|tab|phone>`).

Wide screens: the hero on the pool (words left, the rings right with labels), then the sheet.
```
Wednesday 14 October
Evening, Arjun.                                     o Shed window   o Week 8, next photos
Week 5, the part everyone                              ( ( ( (o) ) ) )   o Rains, weeks 1 to 3
finds hardest.               (serif)                               o You are here, week 5
Day 35 of 168  ::::|::::::::::::::::::  21% of the way to a fair verdict
(day 1) This is the shed window. If more hair is coming out
        right now, that is the pattern most people describe...
        ( Compare with day one )
.------------------------------------------------------------------------------.  the sheet
| Today                         2 days in a row | Day one and now   Open the mirror |
| { Morning 08:00  Regrowth solution  [Done] }  |  (day 1)(week 4)                  |
| { Evening 21:30  Solution, gummies  [Mark done] }  Day 1    Week 4               |
| General guidance...                           |  Sample drawings for the demo...  |
| Supply            | People who started...   | (dashed disc)                     |
| About 22 days left| Demo community          | What week 24 can look like.       |
| [=========----]   | (R)(S)(P)(A)(+7)        | An illustration...                |
| Runs out 5 Nov    | 11 people in your start | ( See the illustration )          |
| { Thinking of stopping?  Look at three things first...  ( Before you stop ) }     |
'------------------------------------------------------------------------------'
                  ( drop  How is your scalp today?          [^] )
```
Phones: the rings fill the top, the words end above the check-in bar and the tabs; the sheet stacks the sections in one column. Dark theme: the same on night water.

## `/mirror`
Phone
```
+------------------------------+
| Day one and now.             |
| ( Crown ) ( Hairline ) (Part)|  segmented
| +--------------------------+ |
| | day one    |    week 4   | |  compare slider
| |            ||            | |
| +--------------------------+ |
| ( Show day-one outline )     |
| These photos are for you.    |
| Light and angle change how   |
| hair looks.                  |
| Timeline                     |
| [w0] [w4] [w8*] [ ] [ ] [ ]  |  next due in amber
| [ Retake week 8 photos ]     |
| { What week 24 can look like}|
+------------------------------+
```
Desktop: slider left at 8 columns, timeline and actions right at 4.

## `/mirror/projection`
Phone
```
+------------------------------+
| (Back)                       |
|        .-------.             |
|       (  orb    )  thinking  |
|        '-------'             |
|  Reading your baseline       |  stages tick in
|  Marking the area            |
|  Estimating a typical outcome|
+------------------------------+
then
+------------------------------+
| What week 24 can look like.  |
| +--------------------------+ |
| |  day one  ||  illustration|
| +--------------------------+ |
| An illustration of a typical |
| outcome, not a promise.      |
| Results vary.                |
| Most visible change, if it   |
| comes, shows up between      |
| month four and six.          |
| ( Repaint area ) ( Done )    |
+------------------------------+
```
Desktop: thinking orb centred; result as side by side images with the label beneath, never overlapping the image.

## `/map` (nav label: Map)
Phone (vertical track)
```
+------------------------------+
| Your 24 weeks                |
| { Monsoon overlap: weeks 3 to 8 } |
|  1  .  quiet start           |
|  2  .                        |
|  3 ~~~ shed window opens     |
|  4 ~*~ photos, letter        |
|  5 ~o~ you are here          |
|  6 ~~~                       |
|  7 ~~~                       |
|  8 ~*~ photos                |
|  9  .  settling              |
| ...                          |
| 24  *  judgement week        |
| ( Write your letter )        |
| I'm thinking of stopping     |
+------------------------------+
```
Desktop: the same 24-cell strip as Today at full width with phase labels, then the week list below as a two-column table (week, what commonly happens). Season overlap is a hatched band under the strip with its own one-line explanation.

## `/map/week/[n]`
Phone
```
+------------------------------+
| (Back)  Week 5               |
| The part everyone finds      |
| hardest.                     |
| What often happens           |
| What to do this week         |
| Not a reason to worry        |
| When to see a doctor         |
| Sources                      |
| ( Week 4 )        ( Week 6 ) |
+------------------------------+
```
Desktop: reading column max 640 with a sticky mini track on the left.

## `/checkin` (also the capsule sheet), v3
```
How is your scalp today?
Thirty seconds. We'll tell you what's normal.      (serif)
Hair fall this week
( Barely any ) ( A few ) ( Normal for me ) ( More than usual ) ( Handfuls )
How worried are you
( Calm ) ( A little ) ( Some ) ( A lot ) ( Very )
Missed applications in the last 7 days        (-) 0 (+)
Anything like this?
( Pain on the scalp ) ( Burning ) ( Rash or flaking ) ( Swelling... ) ( Dizzy... ) ( Something else unusual )
Anything else? (optional)  { ...... }
[ Save check-in ]   Saved on this phone only.
```
The answer replaces the form: "Check-in saved.", the two-voice title, the sentence, then the day-one photo and the 24 ticks when they help, or the doctor card with the ticked list. Sheet: bottom on phones, right panel from 768 px. `/checkin` shows the same form as a page.

## `/pause`
Phone, one step per screen, vertical progress dots
```
+------------------------------+
| (Close)                      |
| This was day one.            |
| +--------------------------+ |
| |   crown photo            | |
| +--------------------------+ |
| Before you decide, here's    |
| where you started.           |
| [          Next          ]   |
+------------------------------+
...
+------------------------------+
| Most people who feel this    |
| way are in weeks three to    |
| seven.                       |
| [       Keep going       ]   |
| [   Pause with a plan    ]   |  equal weight
| [   Talk to a doctor     ]   |
+------------------------------+
```
Desktop: the four parts on one screen as a calm two-column spread, options at the bottom.

## `/mates`
Phone
```
+------------------------------+
| People who started when you  |
| did.               (Demo)    |
| (A)(D)(K)(R)(+36)            |
| { Dev from Pune took their   |
|   week 4 photos.   (Nudge) } |
| { 12 people in your start    |
|   week are on week 5 today } |
| { Kabir from Delhi finished  |
|   week 4.          (Nudge) } |
| { How this would work for    |
|   real                     } |
| [    Invite a friend     ]   |
+------------------------------+
```
Desktop: feed column left (7 cols, hairline rows), production notes as the one panel on the right (5 cols).

## `/reorder`
Phone
```
+------------------------------+
| About 9 days left.           |
| [=========-------]           |  gradient pill bar
| Your regrowth solution runs  |
| out around 23 Oct.           |
| [ Reorder on Man Matters ]   |
| ( Remind me in 3 days )      |
| ( Add reminders to calendar )|
| Packs                        |
| { WF-SOL-60, bought 1 Oct }  |
| ( Add a pack )               |
+------------------------------+
```
Desktop: centred column, max 640.

## `/profile`
Phone
```
+------------------------------+
| You                          |
| { Name        Arjun       > }|
| { Age band    25 to 34    > }|
| { City        Mumbai      > }|
| { Products    3           > }|
| { Start date  10 Sep      > }|
| Routine                      |
| { Morning 8:00 Evening 21:30}|
| General guidance. Follow     |
| your pack leaflet or doctor. |
| Reminders                    |
| { Notifications      (on)  }|
| ( Add to calendar )          |
| Look                         |
| ( System )( Dark )( Light )  |
| ( English )( Hinglish )      |
| { Demo mode          (off) }|
| { Your data               > }|
| { About                   > }|
| I'm thinking of stopping     |
+------------------------------+
```
Desktop: settings as hairline rows in a 760 px column, grouped under plain titles.

## `/profile/data`
```
+------------------------------+
| Your data                    |
| Everything stays on this     |
| phone.                       |
| [   Export a copy (JSON)  ]  |
| Storage used: 4.2 MB         |
| ( Delete everything )        |  coral text, two-step
+------------------------------+
```

## `/about`
Reading column, max 640 on every width:
```
Why this exists (three sentences)
What we think Mosaic could test (two predictions)
How it keeps your data on the phone
Not medical advice
Sources (numbered list, real sequence)
Independent concept line
( Replay intro )
```

## `/dev/qr` (dev only)
```
+------------------------------------------+
| Dev QR codes        origin: 192.168.1.4  |
| { QR } WF-SOL-60   Regrowth solution 60  |
| { QR } WF-SOL-90   Regrowth solution 90  |
| { QR } WF-FOAM-60  Regrowth foam 60      |
| { QR } WF-GUM-30   Hair gummies 30       |
| { QR } WF-KIT-01   Starter kit           |
| reg date: [ 2026-10-01 ]  batch: [ B1 ]  |
+------------------------------------------+
```

## Demo chip (overlay on every in-app route when demo is on)
```
                     ( Demo, day 35 ^ )
 opens:
 { Jump to day   1 [=====o------] 180 }
 { ( 1 ) ( 10 ) ( 35 ) ( 60 ) ( 110 ) ( 168 ) }
 { Persona: ( Steady ) ( Worried ) ( Monsoon, quick-commerce ) }
 { ( Leave demo ) }
```
