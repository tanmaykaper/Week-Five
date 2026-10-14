# Design system

## The idea: the drop and the ripple

Treatment is one small drop a day, and nothing happens for a while. Then it spreads. The whole interface comes from that:

- The intro ends with a single drop that falls, hits the surface and becomes a ripple that opens the app.
- The Home progress ring is that ripple, frozen at today: the arc is how far it has spread toward week 24.
- The shed window is drawn on the ring from day one as a hatched band, so it's on the map before it arrives (forewarning made visible).
- The orb behind the ring is the drop. It breathes slowly, and only there.
- Check-ins feel like dropping something into water: the capsule sends, a small ripple confirms.

Boldness goes in one place, the ring and orb. Everything around it stays quiet: hairlines, plain type, no decorative gradients on cards.

## Colour

Anchored on the Man Matters palette read from manmatters.com (primary blue about `#22548A`, deep navy `#143461`, pale blue `#D0DEF1`), extended for an app with a dark hero theme. Names describe the role, not the hue.

### Primitives
| Token | Hex | Use |
|---|---|---|
| `--navy-950` | `#08111F` | Dark ground |
| `--navy-900` | `#0F1B2E` | Dark card surface |
| `--navy-850` | `#15243B` | Dark raised surface, sheets |
| `--navy-800` | `#143461` | Brand deep navy, dark glow source |
| `--blue-600` | `#22548A` | Brand blue, primary action |
| `--blue-500` | `#2C66A6` | Action hover and pressed |
| `--blue-400` | `#5B9BE6` | Glow, ring, links on dark |
| `--blue-100` | `#D0DEF1` | Brand pale blue, light washes |
| `--mist-50` | `#EEF3FA` | Light ground |
| `--amber-400` | `#F2B661` | Today and milestones on dark |
| `--amber-700` | `#8A5A0F` | Today and milestones on light |
| `--coral-400` | `#F28B76` | Red flags on dark |
| `--coral-700` | `#B23F2A` | Red flags on light |
| `--mint-400` | `#7CD4A6` | Positive deltas on dark |
| `--mint-700` | `#1F7A4C` | Positive deltas on light |

### Semantic tokens
| Token | Dark | Light |
|---|---|---|
| `--bg` | `#08111F` | `#EEF3FA` |
| `--bg-glow` | radial `#143461` at 55 percent opacity | iridescent wash: `#D0DEF1`, `#E6E0F5`, `#DDF0EA` radials |
| `--surface` | `#0F1B2E` | `rgba(255,255,255,0.62)` + blur 24 px (`#F8FAFD` solid fallback) |
| `--surface-raised` | `#15243B` | `#FFFFFF` |
| `--hairline` | `rgba(255,255,255,0.08)` | `rgba(14,31,56,0.08)` |
| `--hairline-strong` | `rgba(255,255,255,0.14)` | `rgba(14,31,56,0.14)` |
| `--text` | `#EAF0F8` | `#0E1F38` |
| `--text-2` | `#A3B3C9` | `#46566E` |
| `--text-3` | `#7E91AB` | `#5F6F86` |
| `--action` | `#22548A` | `#22548A` |
| `--action-text` | `#FFFFFF` | `#FFFFFF` |
| `--accent` | `#5B9BE6` | `#22548A` |
| `--today` | `#F2B661` | `#8A5A0F` |
| `--alert` | `#F28B76` | `#B23F2A` |
| `--positive` | `#7CD4A6` | `#1F7A4C` |
| `--focus` | `#5B9BE6` 2 px + 2 px offset | `#22548A` 2 px + 2 px offset |
| `--selection` | `rgba(91,155,230,0.35)` | `rgba(34,84,138,0.20)` |

Coral is used for red-flag states only. Amber only for "today" and milestones. If either shows up anywhere else, it's a bug.

### Contrast checks (WCAG 2.2, measured)
| Pair | Dark: bg / surface / raised | Light: bg / surface / raised |
|---|---|---|
| `--text` | 16.50 / 15.06 / 13.60 | 14.81 / 15.79 / 16.51 |
| `--text-2` | 8.87 / 8.10 / 7.31 | 6.69 / 7.13 / 7.46 |
| `--text-3` (small labels only) | 5.88 / 5.36 / 4.84 | 4.59 / 4.89 / 5.12 |
| `--accent` | 6.55 / 5.98 / 5.40 | 6.97 / 7.43 / 7.77 |
| `--today` | 10.48 / 9.57 / 8.64 | 5.31 / 5.66 / 5.92 |
| `--alert` | 7.86 / 7.18 / 6.48 | 5.18 / 5.52 / 5.77 |
| `--positive` | 10.65 / 9.72 / 8.78 | 4.77 / 5.09 / 5.32 |
| White on `--action` | 7.77 | 7.77 |
| White on `--blue-500` hover | 5.90 | 5.90 |

Every text pair passes AA (4.5:1). Light glass surfaces are checked against their solid fallback; the blur layer is never allowed to drop below `rgba(255,255,255,0.55)` so contrast holds over the wash.

## Typography

| Role | Family | Why |
|---|---|---|
| Everything in the app's voice | **Manrope** (variable, 200 to 800) | Geometric and calm like MiSans, with a real 200 weight for big numerals and tabular figures built in |
| The user's own words (the letter, its reveal) | **Instrument Serif**, italic | Your words look different from the app's words. The change of voice is the point |

Both are self-hosted through `next/font`. No other families.

### Scale (major third, 1.25, fluid between 360 and 1440 px)
| Token | Size | Line height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `--t-numeral` | `clamp(4rem, 3.2rem + 4vw, 6.5rem)` | 0.9 | 200 | -0.04em | Ring percent, day count |
| `--t-display` | `clamp(2.25rem, 1.9rem + 1.8vw, 3.5rem)` | 1.02 | 300 | -0.03em | Greeting, intro beats |
| `--t-h1` | `clamp(1.75rem, 1.55rem + 1vw, 2.4rem)` | 1.1 | 600 | -0.02em | Screen titles, onboarding questions |
| `--t-h2` | `1.375rem` | 1.2 | 600 | -0.015em | Card titles |
| `--t-h3` | `1.125rem` | 1.3 | 600 | -0.01em | Sub-heads |
| `--t-body` | `1rem` | 1.5 | 450 | 0 | Body |
| `--t-small` | `0.875rem` | 1.45 | 500 | 0 | Secondary text, why-we-ask |
| `--t-micro` | `0.75rem` | 1.35 | 600 | 0.01em | Pills, axis labels (sentence case, never all caps) |
| `--t-letter` | `clamp(1.5rem, 1.3rem + 1vw, 2rem)` | 1.3 | 400 italic | 0 | The letter |

Rules: `text-wrap: balance` on headings, `pretty` on body. `font-variant-numeric: tabular-nums` on every number that changes or lines up. Body measure 34 to 64 characters. No all-caps labels, no tracked-out eyebrows, no monospace data labels, no arrows appended to button text.

## Space, grid, radius, elevation

- **Spacing** (8 px grid, 4 for hairline nudges): `--s-1` 4, `--s-2` 8, `--s-3` 12, `--s-4` 16, `--s-5` 24, `--s-6` 32, `--s-7` 40, `--s-8` 48, `--s-9` 64, `--s-10` 80.
- **Gutters**: 16 px side gutter at 360 to 430, 24 at 768, 32 at 1200+. Plus `env(safe-area-inset-*)`.
- **Grid**: phone 1 column; 768 to 1199 two columns with a 72 px left icon rail; 1200+ three columns, content max 1180 px, rail 88 px.
- **Radius** by hierarchy, not one value everywhere: `--r-hero` 28 (ring card, sheets), `--r-card` 20 (bento tiles), `--r-inner` 12 (photos and inputs inside cards), `--r-pill` 999 (pills, capsule, tab indicator).
- **Elevation**: dark theme uses no drop shadows; depth comes from surface steps and hairlines, plus a 1 px top inner highlight `inset 0 1px 0 rgba(255,255,255,0.04)`. Light theme glass: `0 1px 0 rgba(255,255,255,0.8) inset, 0 10px 30px -12px rgba(20,52,97,0.18)`. Sheets get one deeper level.
- **Glass recipe (light)**: `background: rgba(255,255,255,0.62); backdrop-filter: blur(24px) saturate(140%); border: 1px solid rgba(255,255,255,0.7)`. Fallback without `backdrop-filter`: `#F8FAFD`. Dark theme uses glass only for the capsule and sheets: `rgba(21,36,59,0.72)` + blur 20 px.

## Motion

Two speeds. UI motion answers a tap and is short. Story motion (intro, letter reveal, projection) is slow and happens rarely.

### Eases
| Name | Value | Use |
|---|---|---|
| `--ease-settle` | `cubic-bezier(0.22, 1, 0.36, 1)` | Things arriving and settling: sheets, cards, page enters |
| `--ease-swell` | `cubic-bezier(0.65, 0, 0.35, 1)` | Story moments: ring draw, ripple, letter unfold |
| `--ease-fall` | `cubic-bezier(0.55, 0, 1, 0.45)` | The drop falling, and nothing else |

### Springs (motion package)
| Name | Config | Use |
|---|---|---|
| `press` | stiffness 600, damping 40 | Tap feedback, scale to 0.97 |
| `ui` | stiffness 380, damping 34 | Sheets, segmented controls, tab indicator |
| `calm` | stiffness 160, damping 26, no overshoot (critically damped) | Red-flag and doctor cards. Serious content never bounces |

### Durations
`--d-instant` 120 ms (colour, focus), `--d-fast` 180 ms (press, toggle), `--d-ui` 280 ms (sheets, page enter), `--d-slow` 350 ms (card expand), `--d-story` 900 ms (ring draw, letter unfold), `--d-ripple` 1200 ms (intro reveal).

### Stagger
Home on first paint: ring first, then greeting, then cards at 50 ms steps, max 6 items. Once per session; returning to Home within the session does not replay it.

### Choreography with a reason for each
| Motion | Why it exists |
|---|---|
| Ring draws from 0 to today on first Home paint | Makes distance travelled feel earned (goal-gradient) |
| Orb breathes on a 10 s cycle | A calm, living centre; it slows to the 4-in 6-out pace in the night card |
| Card to detail shared-element transition | Shows where the detail came from, keeps place |
| Capsule ripple on send | Confirms the check-in landed |
| Onboarding step slide | One question replaces another, spatially forward |
| Letter unfolds | Marks it as a moment, not just another card |
| Projection thinking sequence | Honest pacing; signals work is being done on the device |

Under `prefers-reduced-motion: reduce`: every transition becomes a 120 ms opacity cross-fade or nothing, the ring renders at its final value, the orb is still, the intro uses its auto-advance path, parallax is off.

## Components

| Component | Notes |
|---|---|
| `AppShell` | Bottom tab bar on phones, left rail at 768+. Main landmark, skip link |
| `TabBar` / `Rail` | Home, Mirror, Journey, Mates, Profile. Lucide icons at 1.75 stroke, label always visible, pill indicator |
| `Card` | Surface, hairline, `--r-card`. Variants: `hero` (`--r-hero`), `quiet` (no surface, hairline only), `alert` (coral hairline, no glow) |
| `Glass` | Light-theme surface recipe, dark-theme capsule and sheets |
| `Ring` | SVG, 24 week ticks, progress arc, milestone dots (amber when done), shed window hatch, "you are here" notch. `role="img"` with a text label |
| `Orb` | Radial gradient drop behind the ring; CSS-only animation |
| `Capsule` | Floating input bar above the tab bar, 56 px tall, opens check-in sheet |
| `Sheet` | Bottom sheet on phones, side panel at 1200+. Focus trap, Escape closes, drag handle |
| `Pill` | Status and delta tags. Tones: neutral, today, positive, alert |
| `Slider` | Five labelled steps, words not numbers, keyboard arrows |
| `Segmented` | Theme, language |
| `CompareSlider` | Before and after, drag and arrow keys, ghost toggle |
| `PhotoTile` | Fixed aspect, `--r-inner`, width and height set |
| `Skeleton` | Shimmer off under reduced motion |
| `Banner` | Due reminders, storage warnings |
| `DemoChip` | Floating "Demo, day 35" chip, opens the day jumper |

## Iconography
Lucide only, 1.75 px stroke, 20 or 24 px, `currentColor`. Custom SVG for the app mark (a drop over one ripple ring), the dropper, the ghost outlines and the demo silhouettes. Emoji are allowed only in the mates nudge picker.

## Illustration rules
- Head ghost outlines and demo silhouettes are single-weight line drawings in `--text-3`, no faces, no skin tones, no hair textures pretending to be photos.
- No stock photos, no Man Matters product shots, no logos.
- The projection is the only place we draw hair, and it's always labelled.

## Breakpoints
360, 390, 430 (phones, must all be tested), 768 (tablet, rail appears), 1200 (three columns). Never horizontal scroll. Tap targets at least 44 px.
