# Design system (v2, 14 October 2026)

v1 drew the app as a phone mockup with glow, glass and boxed cards everywhere. Tanmay rejected it as ugly and unresponsive. v2 is a responsive website first: calm, minimal, mostly type and space. `docs/design-preview.html` is the reference render of Home.

## The idea: the drop and the ripple, drawn quietly

Treatment is one small drop a day, and nothing visible happens for a while. Then it spreads.

- The intro ends with a single drop that falls and becomes a ripple that opens the app.
- The progress ring on Today is that ripple frozen at today. Three faint concentric hairlines around it are the only decoration on the page.
- The shed window is drawn on the ring and on the 24-week strip from day one as a hatched band, so it is on the map before it arrives.
- Check-ins send with a small ripple from the send button.

Boldness goes in one place: the serif greeting and the ring beside it. Everything else is hairlines, plain type and space.

## Principles

1. **A document, not a dashboard.** Sections are separated by space and 1 px hairlines, not by boxes. At most one bordered panel per screen, and only when it holds something different in kind (the projection teaser, a red-flag card).
2. **Space does the grouping.** Big gaps between sections (64 to 112 px), tight gaps inside them (8 to 24 px).
3. **One accent.** Man Matters blue for actions and "you are here". Amber only for photo days and today. Coral only for see-a-doctor. Nothing else gets colour.
4. **Serif for people, sans for the app.** The greeting, the "Thinking of stopping?" moment and the user's own letter are set in Instrument Serif. Everything the app says is Geist.
5. **Flat.** No gradients, no glow, no glass except the sticky header blur. One very soft shadow, used only on things that float (check-in bar, popovers, sheets).
6. **Website at every width.** Top navigation from 768 px up. On phones the same content stacks into one column with a bottom tab bar for thumb reach. Never a phone frame, never horizontal scroll.

## Colour

Cool near-white and deep navy ink, anchored on manmatters.com (primary blue about `#22548A`, deep navy `#143461`, pale blue `#D0DEF1`). Pastel tags are washed-out tints, never large fills.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#FBFCFD` | `#0B121C` | Page |
| `--surface` | `#FFFFFF` | `#101925` | Floating bar, popovers, the one bordered panel |
| `--sunk` | `#F3F5F8` | `#0E1621` | Photo wells, avatar circles, hover fills |
| `--line` | `#E6EAF0` | `rgba(255,255,255,0.08)` | Hairlines |
| `--line-strong` | `#D5DCE5` | `rgba(255,255,255,0.14)` | Quiet button borders, ticks |
| `--ink` | `#0F1E33` | `#E9EEF5` | Headings, body |
| `--text-2` | `#556275` | `#9AA8BA` | Secondary text |
| `--text-3` | `#626E7E` | `#8391A5` | Captions, metadata |
| `--accent` | `#22548A` | `#7DB0EE` | Links, ring, you-are-here |
| `--action` | `#22548A` | `#2C66A6` | Primary button fill (white text) |
| `--track` | `#E9EDF2` | `rgba(255,255,255,0.08)` | Empty ring and strip |
| `--hatch` | `rgba(34,84,138,0.42)` | `rgba(125,176,238,0.45)` | Shed window hatching |
| `--today-bg` / `--today` | `#FBF3DB` / `#7A5200` | `#2B2926` / `#F2B661` | Photo days, today |
| `--alert-bg` / `--alert` | `#FDEBEC` / `#9F2F2D` | `#2B2329` / `#F28B76` | Red flags only |
| `--ok-bg` / `--ok` | `#EDF3EC` / `#346538` | `#1B2D2F` / `#7CD4A6` | Positive deltas |
| `--info-bg` / `--info` | `#E8F0FA` / `#22548A` | `#1B2839` / `#7DB0EE` | Neutral notices |

### Measured contrast (WCAG 2.2)
| Pair | Light (bg / surface / sunk) | Dark (bg / surface / sunk) |
|---|---|---|
| `--ink` | 16.31 / 16.75 / 15.33 | 16.12 / 15.17 / 15.59 |
| `--text-2` | 6.03 / 6.19 / 5.67 | 7.77 / 7.31 / 7.52 |
| `--text-3` | 5.05 / 5.18 / 4.75 | 5.87 / 5.52 / 5.68 |
| `--accent` | 7.56 / 7.77 / 7.11 | 8.34 / 7.84 / 8.06 |
| White on `--action` | 7.77 | 5.90 |
| Tags (text on its tint) | today 6.24, alert 6.26, ok 6.08, info 6.76 | today 8.04, alert 6.35, ok 8.08, info 6.61 |

All pass AA for body text.

## Typography

| Role | Family | Notes |
|---|---|---|
| Display (greeting, a few moments of human voice, the letter) | **Instrument Serif** 400, italic for the letter | Tight tracking, line-height 1 |
| Everything else | **Geist** variable 200 to 700 | 200 for big numerals, 400 body, 500 UI, 600 titles |

Both self-hosted through `next/font`. Phosphor icons (regular, fill for the active tab, bold for checkmarks).

| Token | Size | Line height | Weight | Use |
|---|---|---|---|---|
| `--t-display` | `clamp(2.75rem, 1.7rem + 4.2vw, 5rem)` | 1 | Serif 400, -0.02em | Greeting |
| `--t-numeral` | `clamp(3.5rem, 2.8rem + 2.6vw, 5rem)` | 0.9 | Geist 200, -0.05em | Ring percent, days left |
| `--t-statement` | `clamp(1.25rem, 1.12rem + 0.55vw, 1.5rem)` | 1.45 | Geist 400, -0.01em | The insight sentence |
| `--t-lead` | `clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` | 1.6 | 400 | Day line under the greeting |
| `--t-title` | `1.125rem` | 1.3 | 600, -0.01em | Section titles |
| `--t-body` | `1rem` | 1.6 | 400 | Body |
| `--t-small` | `0.875rem` | 1.5 | 400 to 500 | Secondary |
| `--t-micro` | `0.8125rem` | 1.4 | 500 | Captions, phase labels |

Rules: headings `text-wrap: balance`, body `pretty`, `tabular-nums` on every changing number, sentence case everywhere, no all-caps labels, no eyebrow labels unless they carry information (the date above the greeting does), no arrows in button text, measure 36 to 64 characters.

## Layout

- **Container:** max 1200 px content, gutters `clamp(20px, 4vw, 48px)`.
- **Header:** sticky, 64 px, hairline bottom, background blur. Wordmark left, nav (Today, Map, Mirror, Mates, You) from 768 px, demo chip and theme toggle right. Active nav item: ink colour and a 2 px underline on the header's bottom edge.
- **Phones (under 768):** header keeps the wordmark and demo chip; a bottom tab bar (64 px plus safe area) carries the five destinations. The check-in bar floats 12 px above the tabs.
- **Grid:** 12 columns from 960 px. Hero is 7 + 5 (text and ring). The three-up row is 1 : 1.25 : 1 with vertical hairlines. The two-up row is 7 + 5.
- **Vertical rhythm:** section gap `clamp(64px, 7vw, 112px)`. Inside sections: 8, 12, 16, 20, 24, 32, 40 px.
- **Radius:** 6 small controls, 8 buttons and photo wells, 12 panels, 16 the floating check-in bar. Pills only for small tags.
- **Breakpoints:** 360, 390, 430 (phones), 640 (ring grows to 360 px, strip gets full labels), 768 (top nav), 900 (multi-column rows), 960 (two-column hero), 1200+.

## Components

| Component | Spec |
|---|---|
| Button, primary | Brand blue fill, white text, 44 px, radius 8, press scales to 0.98 |
| Button, quiet | Transparent, `--line-strong` border, ink text |
| Link | `--text-2`, underline in `--line-strong`, underline goes ink on hover |
| Tag | 24 px, radius 999, tinted background, 12 px text, sentence case |
| Ring | 280 px on phones, 360 px from 640. 3 px track and arc, 24 ticks, milestone dots (amber when done), hatched shed band outside the arc, a ringed marker for today, three faint ripple hairlines |
| Week strip | 24 cells, 44 px tall (36 on phones), gap 4 (2 on phones). Done weeks in ink, this week in accent, future in track, shed window hatched, photo days as dots under cells, current week number in an accent box. Phase labels above from 900 px |
| Row list | Items separated by hairlines, 60 px minimum height |
| Checkbox (routine) | 32 px square, radius 8, fills with action blue and a bold check |
| Photo well | 4:5, `--sunk`, hairline, radius 8, caption below |
| Panel | One per screen at most: `--surface`, hairline, radius 12, 28 px padding |
| Check-in bar | Fixed, centred, max 560 px, 56 px tall, radius 16, `--surface`, soft float shadow, drop icon, send button 40 px |
| Popover / sheet | `--surface`, hairline, radius 12, float shadow. Sheets become a right-side panel from 1024 px |
| Demo chip | Hairline chip "Demo, day 34" with an amber dot, opens the day jumper popover |
| Red-flag card | `--alert-bg` panel, `--alert` title, no motion beyond a fade |

## Motion

Quiet. One orchestrated moment per screen, and motion that answers taps.

| Ease | Value | Use |
|---|---|---|
| `--ease-settle` | `cubic-bezier(0.22, 1, 0.36, 1)` | Reveals, popovers, sheets, hover and press |
| `--ease-swell` | `cubic-bezier(0.65, 0, 0.35, 1)` | Ring draw, letter unfold, intro ripple |
| `--ease-fall` | `cubic-bezier(0.55, 0, 1, 0.45)` | The intro drop only |

| Moment | Duration | Why |
|---|---|---|
| Today entrance: date, greeting, day line, ring, insight at 90 ms steps; ring draws from 0 to today | 700 ms reveal, 1000 ms ring | Distance travelled feels earned (goal-gradient) |
| Section reveals on scroll: 12 px rise and fade, once | 700 ms | Content arrives as you reach it, never all at once |
| Press feedback: scale 0.98 | 120 ms | Physical confirmation |
| Check-in send: ripple from the button | 800 ms | The drop lands |
| Popover and sheet open | 180 to 280 ms | Shows where it came from |
| Intro scroll story | scrubbed | See SCREENS |

`prefers-reduced-motion: reduce` turns all of it off: content renders at rest, the ring shows its final value, the intro becomes an auto-advancing sequence.

## Imagery

- No stock photography, no product shots, no Man Matters marks.
- Head placeholders (demo and empty states) are a single-weight line drawing of a crown whorl, identical for day 1 and day 34, because nothing visible should have changed by then.
- The projection is the only place hair is drawn as an outcome, and it is always labelled.
