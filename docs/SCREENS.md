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

## `/intro`
Phone
```
+------------------------------+
|                  ( Skip intro)|
|                              |
|          ___                 |
|         (   )   bulb         |
|          | |                 |
|          |~|   liquid level  |
|          | |                 |
|           v                  |
|                              |
|  Around week three, a lot    |
|  of people see more hair     |
|  fall, not less.             |
|                              |
| ---------------o------------ |  thin progress line
+------------------------------+
```
Desktop: dropper pinned centre-left at 40 percent width, beat text to its right in `--t-display`, progress line along the bottom, Skip top right.

### Beat script (scroll is 600 vh, pinned, scrubbed)
| Scroll | Dropper | Text | Ripple |
|---|---|---|---|
| 0 to 12 % | Lying at 60 degrees, slowly rotating upright | Beat 1 fades in at 4 %, out at 14 % | none |
| 12 to 28 % | Upright, bulb squeezes 8 % | Beat 2 | none |
| 28 to 44 % | Liquid drops 25 % | Beat 3 | none |
| 44 to 60 % | Liquid drops another 25 % | Beat 4 | none |
| 60 to 76 % | Bulb squeezes again, drop forms at the tip | Beat 5 | none |
| 76 to 88 % | Drop hangs, swells | Beat 6 | Surface line appears below |
| 88 to 100 % | Drop falls (`--ease-fall`), hits the surface | "Let's set up your plan." | Ripple ring expands, circular clip-path grows from impact point to cover the screen, revealing onboarding |

Reduced motion: dropper is a static illustration, the six beats cross-fade every 3.5 s with Pause, Next, Skip. Final screen fades to onboarding.

## `/start`
Phone
```
+------------------------------+
|  (mark)                      |
|                              |
|  Welcome. Let's set up       |
|  your plan.                  |
|                              |
|  We read this from your      |
|  pack:                       |
|  { Regrowth solution, 60 ml }|
|                              |
|  Your details and photos     |
|  stay on this phone.         |
|  No account. Nothing sent.   |
|                              |
|  [      Start setup       ]  |
|  ( Try it with sample data ) |
+------------------------------+
```
Desktop: same column, centred, max 520, with the orb glowing behind it.

## `/onboarding`
Phone (step 6 shown)
```
+------------------------------+
| ====------  6 of 9    (Back) |  progress thread
|                              |
|  When did you start,         |
|  or when will you?           |
|                              |
|  Everything on your map      |
|  counts from this day.       |
|                              |
|                              |
|  ( Today ) ( Yesterday )     |
|  ( Last week )               |
|  { date picker            }  |
|                              |
|  [        Continue        ]  |  thumb zone
+------------------------------+
```
Step 8 (letter) uses a full-height serif text area on a slightly raised surface, like paper.
Briefing (inside onboarding): one card per screen, swipe, dots for position (the content is a sequence, so dots are information), [ Next ].
Desktop: question left (5 of 12 columns), answer area right, progress thread across the top.

## `/baseline`
Phone
```
+------------------------------+
| (Back)   Crown   1 of 3      |
| +--------------------------+ |
| |                          | |
| |      .-''''''-.          | |  live camera
| |     /  ghost   \         | |  SVG outline
| |    |  outline   |        | |
| |     \          /         | |
| |      '-......-'          | |
| +--------------------------+ |
|  Light: (o) Good light       |
|  Hold the phone above your   |
|  head, camera facing down.   |
|                              |
|         (  shutter  )        |
|  ( Upload instead )          |
+------------------------------+
```
Painter step: photo full width, brush size pills, ( Undo ) ( Clear ) [ Done ] ( Skip ).
Desktop: camera frame left (max 640), instructions and the three-step list right.

## `/home` (nav label: Today)
Rendered in full in `docs/design-preview.html`. Order is the same at every width; only the columns change.

Desktop (1440)
```
  Tuesday, 14 October
  Evening, Arjun.                                   .---------.  ) ) )
  Day 34 of 168. Week 5, the part                  /   20%     \   ripple
  everyone finds hardest.                          |  week 5    |  hairlines
  ---------------------------------------          \ o~~~~     /
  This is the shed window. If more hair              '-------'
  is coming out right now, that is the       of the way to a fair verdict
  pattern most people describe.
  [ Compare with day one ]  Why am I seeing this?

  Your 24 weeks                                              Open the map
  Quiet | Shed window       | Settling | First fine hairs | Long middle |Judge
  [#][#][~][~][o][~][~][~][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ]
            *           *           *           *           *           *
  ------------------------------------------------------------------------
  Routine        6 days | Day one and now     Mirror | Supply   Solution 60
  Morning 8:00     [x]  | [ photo ]  [ photo ]       | 9 days left
  Evening 21:30    [ ]  | Day 1      Day 34          | ======------
  General guidance...   |                            | ( Reorder on Man Matters )
  ------------------------------------------------------------------------
  People who started when you did   Demo   { What week 24 can look like    }
  (D)(K)(R)(S)(+8)                         { ...                           }
  Dev from Pune took their week 4...  Nudge{ ( See the illustration )      }
  12 people in your start week...          { An illustration, not a promise}
  ------------------------------------------------------------------------
  Thinking of stopping?                                   ( Before you stop )
  ------------------------------------------------------------------------
  Your details and photos stay on this device. Not medical advice. ...
```
The reorder block is replaced by "Supply is fine for now" when the sequencing rule hides it.

Phone (old v1 sketch below kept only for card order)
```
+------------------------------+
| Evening, Arjun.        (av)  |
| Day 34, week 5, the part     |
| everyone finds hardest.      |
| {  .-~~~~-.                } |  hero ring card
| { /  orb   \  *   *   *    } |
| {|   20%    |              } |
| { \        /  of the way   } |
| {  '-o----'   to a fair    } |
| {             verdict      } |
| { Today              6 days} |  amber dot
| { Morning 8:00     [done] } |
| { Evening 21:30    [ ]    } |
| { This is the shed window. } |  insight
| { More hair right now is.. } |
| { [day-one photo] Why? }     |
| { Day one | now   (Mirror) } |
| { What week 24 can look.. }  |
| { 12 people in your start }  |
| { week are on week 5  Demo}  |
| I'm thinking of stopping     |
| ( How is your scalp today? ) |  capsule
| |Home|Mirror|Journey|Mates|Me|
+------------------------------+
```
Reorder card is absent here because a high-shed check-in is under 24 hours old.

Desktop (1440)
```
+----+-------------------------------------------------------------+
| R  | Evening, Arjun.  Day 34, week 5, the part everyone ...      |
|    | +---------------------+ +------------------+ +------------+ |
|    | |  ring + orb          | | Insight card     | | Today      | |
|    | |  20%                 | | + day-one photo  | | slots      | |
|    | |  (spans 2 rows)      | +------------------+ +------------+ |
|    | |                      | | Day one and now  | | Reorder    | |
|    | +---------------------+ +------------------+ +------------+ |
|    | | Projection           | | Mates strip (spans 2 columns) | |
|    | +---------------------+ +-------------------------------+ |
|    |            ( How is your scalp today?  )   capsule, centred |
+----+-------------------------------------------------------------+
```
Tablet: two columns, ring card full width on top.

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

## `/checkin` (also the capsule sheet)
Phone
```
+------------------------------+
| How is your scalp today?     |
| Hair fall this week          |
| o----o----o----O----o        |
| barely ... more than usual   |
| How worried are you          |
| o----o----O----o----o        |
| Missed applications  (-) 0 (+)|
| Anything like this?          |
| [ ] Pain  [ ] Burning        |
| [ ] Rash  [ ] Swelling       |
| [ ] Dizzy [ ] Something else |
| Anything else? ______        |
| [      Save check-in      ]  |
+------------------------------+
```
Response view replaces the form in place. Desktop: sheet becomes a right side panel 480 wide.

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
