# Design system (v3, 14 October 2026)

v1 drew the app as a phone mockup with glow and glass; Tanmay rejected it. v2 was a calm document of hairlines and serif greetings; he found it plain and asked for an Awwwards-style, 3D, light design that flows like two references he picked: Turion Space (awwwards.com/sites/turion-space) and Morpho (morphowater.com). v3 is that direction, built and running for the intro, the welcome screen and setup. Today and the rest of the app move to v3 in their own phases (5 onward); until then they wear the v3 tokens, type and buttons on the v2 layouts.

## What the references taught

| Reference | What it does | What we took |
|---|---|---|
| Morpho | One 3D object (the can) is the camera's vehicle: it turns, you look into its opening, and you fall through it into the world. Chapters are numbered down the left edge. Headlines pair a light sans line with an italic serif line ("A small click. *A world opens.*"). | The dropper as the vehicle; the drop falls and the camera follows it into the water. Two-voice headlines. A chapter name beside the progress. |
| Turion | A pinned orbital diagram: the camera travels round concentric orbits while statements change beside it. HUD labels sit on the orbits. A segmented progress bar. Big open screens, text in one column, the object in the rest. | The ripple, seen from above, becomes 24 concentric week rings that the camera travels around. Labels sit on the rings. The progress line is 24 ticks, one per week. |

Both are dark. We are light: water in daylight, because the app is used in bathrooms at 8 a.m. and Tanmay asked for light.

## The idea: one drop, twenty four rings

Treatment is one small drop a day, and nothing visible happens for a while. In v3 that sentence is the whole interface.

- **The pool.** Every flow screen sits on the same light 3D water, which stays mounted between screens so the camera travels instead of cutting.
- **The dropper** is the hero object: glass pipette, light blue liquid, navy bulb. In the intro it turns upright, squeezes, and a drop forms.
- **The drop** falls; the camera follows it to the water; the ripple spreads.
- **The rings.** The camera climbs and the ripple freezes into 24 rings, one per week: the map. The shed window (weeks 3 to 8) is a dashed, tinted band. Photo weeks carry an amber dot. "You are here" is the one accent ring. Weeks that fall in the user's monsoon have rain falling on them.
- **Other drops** land around yours: the people who started the same week.
- **Setup is the map being drawn.** Each answer changes the water: the city puts rain on the right weeks, the start date lights your week, the briefing lights the weeks each card is about.
- **Day one is the middle of the map.** The camera for the baseline photos is a round lens set exactly at the centre of the rings, seen from straight above; weeks 5 to 24 spread out around it. Keeping a photo drops it into the water and its ripple runs out across all 24 weeks.

## Principles

1. **One object, one camera.** Motion is the camera moving through one scene, never sections sliding past each other.
2. **Open screens.** One statement per screen, in one column (left on wide screens, bottom on phones); the scene takes the rest. No cards, no grids in the flow.
3. **Two voices.** The sans says what happens; the italic serif says how it feels or why. Every headline in the flow is built this way.
4. **Light and quiet.** A cool near-white ground, deep navy ink, one blue accent. Amber only for photo days, rain blue only for the monsoon, coral only for see-a-doctor.
5. **Words over the water stay readable.** The water's shading is kept between 82 and 112 percent of its base tone, rings at 17 percent ink, so text on top never fights it.
6. **Website at every width.** Landscape: words left, scene right. Portrait: scene above, words and answers in the thumb zone below.

## Colour

Light is the designed default. Dark remains a choice in You for the app pages; the flow screens wear `.theme-light` whatever the setting, because the pool is daylight (as the v2 intro was always navy).

| Token | Light | Use |
|---|---|---|
| `--bg` | `#F1F4F7` | Page ground, identical to the pool's fog, so canvas and page are one surface |
| `--surface` | `#FFFFFF` | Answers, fields, the pack chip (often at 80 to 90 percent over the water) |
| `--sunk` | `#E6EBF0` | Footer field, quiet fills |
| `--ink` | `#0F1E33` | Headlines, body, selected chips |
| `--text-2` | `#45546A` | Notes, why-we-ask lines |
| `--text-3` | `#536074` | Captions, placeholders |
| `--accent` / `--action` | `#22548A` | Primary buttons, "you are here", focus |
| `--rain` | `#3F7FC7` | Monsoon rings and rain (graphics only) |
| amber | `#C98A12` | Photo-day dots (graphics only) |
| `--alert` | `#962C2A` on `#FBE7E8` | Red flags and errors only |

Pool colours (in the shader): water `#E3E9EF`, low sky `#FBFCFD`, high sky `#D6E0EA`, fog to `#F1F4F7`.

### Measured contrast (WCAG 2.2)
| Text | on bg | on surface | on sunk | on darkest water |
|---|---|---|---|---|
| ink | 15.17 | 16.75 | 13.96 | 13.69 |
| text-2 | 6.97 | 7.69 | 6.41 | 6.29 |
| text-3 | 5.78 | 6.38 | 5.32 | 5.21 |
| accent | 7.04 | 7.77 | 6.48 | 6.35 |

White on action 7.77. White on a selected (ink) chip 16.75. Tags: today 6.89, alert 6.58, ok 6.59, info 6.45. Rain blue (3.39 to 4.14) and amber are used only for non-text graphics, where 3:1 applies. The dark theme keeps the v2 values and measurements.

## Typography

| Role | Face | Setting |
|---|---|---|
| Sans line of a headline | Geist 500 | `-0.045em`, line height 0.98 |
| Serif turn of a headline | Instrument Serif italic | 1.1x the sans size, `-0.02em`, line height 0.92 |
| Body, notes, UI | Geist 400 and 500 | 16 to 19 px, line height 1.5 to 1.6 |
| The user's own letter | Instrument Serif italic | 24 px |
| HUD (chapter, step count, labels) | Geist 500 | 13 to 14 px, tabular figures, sentence case |

| Token | Size | Use |
|---|---|---|
| `--t-hero` | `clamp(2.375rem, 1.2rem + 3.9vw, 4.75rem)` | Welcome |
| intro beat | `clamp(2.125rem, 1.1rem + 3.3vw, 4.5rem)` | Intro headlines |
| setup question | `clamp(2rem, 1.1rem + 2.3vw, 3.25rem)` | One question per screen |
| `--t-display` | `clamp(2.375rem, 1.35rem + 3.4vw, 4.25rem)` | App page titles |
| `--t-lead` | `clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)` | Leads, briefing cards |

The sans line fits one line on desktop (copy is written to about 24 characters); the serif turn may take two.

## Layout

- Gutters `clamp(20px, 4vw, 56px)`; header 72 px, no bar chrome in the flow (wordmark and one control floating on the water).
- **Intro:** words in the left 48 percent on landscape, bottom on portrait. HUD along the bottom: chapter name, 24 ticks (weeks 3 to 8 in the accent), next action.
- **Setup:** HUD row (back, "3 of 9", chapter, nine ticks), then the question and its answers in a 720 px column. On phones both sit at the bottom; the scene fills the space above.
- **Camera framing:** every pose is written for landscape and adapted for portrait (`poses.ts`): the camera backs away and the subject moves up the screen.

## Components

| Component | Spec |
|---|---|
| Button, primary | Pill, 48 px, action blue, white text, press scales to 0.97 |
| Button, quiet | Pill, 48 px, ink at 6 percent (11 on hover), no border |
| Choice row (single) | 60 px, radius 18, white at 82 percent; selected fills action blue with a white tick; a ring spreads from the tick when picked; auto-advances after 360 ms |
| Chip (multi) | Pill, 44 px, white at 82 percent; selected is ink with a tick and the same ring |
| Field | 64 px (52 small), radius 18, white at 86 percent, accent ring on focus |
| Letter | Serif italic 24 px on white paper, radius 18, character count |
| Switch | 46 by 28 track, action blue when on |
| Ring label | 12 px ring marker plus text on a ground-coloured pill; positioned every frame by the engine; spread round the rings so they never stack; fewer on phones |
| Live line | A ring marker and one sentence saying what the answer just did to the map |
| Plan summary | Tone-stepped rows (no lines), key left, value right, tabular figures |
| Lens | Round, `min(62dvh, 40vw, 600px)` on wide screens, `min(100vw minus gutters, 40dvh, 520px)` on phones. White glass at 74 percent with a 6 px white rim and the screen's one shadow (it floats). Holds the live camera (mirrored for the front camera), the still, or the photo being painted |
| Ghost outline | Single-weight line drawings of the three views (`HeadGhost`). Over the camera: white 1.8 px over a 3.6 px ink edge at 40 percent, so it reads on any picture. On its own: ink at 50 percent. The eyebrow guide is dashed |
| Shutter | Phones: 78 px ring in action blue with a 60 px disc, centred in a camera-app row (choose a photo left, timer right). Wide screens: a 60 px pill with the disc on the left and "Take crown photo". While the timer runs the disc becomes a stop square |
| Tool | Phones: 52 px white circle, icon only (the name is still in the button). Wide screens: 44 px pill with icon and text. Pressed (timer on) fills ink |
| Light meter | 88 by 6 px track; the 70 to 190 stretch tinted amber; a 14 px amber marker that fills when the light is good. The sentence beside it does the telling |
| Photo disc | 64 px on the intro (drawing or photo, "Saved" under the name); 84 to 128 px on the close, as rows with Retake and Delete beside them on phones |
| Brush size | 44 px circles with a dot sized to the brush; selected fills ink |

## The pool (3D)

`src/components/pool/`. Three.js 0.186, loaded only by the flow screens, after first paint. Before it is ready (or without WebGL) a static drawing of the rings stands in.

- **Water:** one plane with a custom shader. No geometry for ripples: the drop's ripple, the cohort's ripples, the frozen week rings, the shed band, the photo dots, the rain and the idle swell are all slopes and lines computed per pixel, so it costs the same at any detail.
- **Dropper and drop:** lathe geometry. Glass and drop use transmission; liquid is clipped by a world-space plane so its surface stays level whichever way the dropper points.
- **State:** two plain objects, `rig` (camera) and `state` (dropper, drop, ripple, map, week, rain, focus, labels). GSAP scrubs them in the intro; pages glide between named poses with `usePoolPose`; the engine draws only when something changed or the water is meant to move.
- **Budget:** pixel ratio capped at 1.5; transforms and one draw per frame; measured 60 fps average and a 16.8 ms p95 frame with the CPU slowed 4x, on phone and desktop sizes. The live lens (camera, light meter and pool together) measured 60 fps and a 16.7 ms p95 the same way.
- **Helpers added in Phase 4:** `lensRig()` aims the camera straight down with the rings' centre under an element on the page; `setOffset()` keeps it there while the page scrolls; `splash()` drops a ripple from the centre on its own clock; `reframe()` changes the framing on resize without stopping a glide.

## Motion

| Ease | Value | Use |
|---|---|---|
| `--ease-settle` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances, presses, answers |
| `--ease-swell` | `cubic-bezier(0.65, 0, 0.35, 1)` | Camera glides between poses (cubic in-out in the engine) |
| GSAP `power2.in` | | The drop's fall |

| Moment | Duration | Why |
|---|---|---|
| Intro | Scrubbed over 820 vh | The story moves at the reader's pace |
| Release | 1.7 s camera settle, page rises at 0.55 s | The camera lands on the welcome screen instead of a cut |
| Setup question change | 220 ms out (up), 640 ms in (rise, 80 ms stagger); camera glides 1.1 to 1.2 s | Each answer visibly moves you through the pool |
| Rings entrance on welcome | 1.9 s from the centre out | The plan spreads like the ripple it is |
| Pick feedback | Ring spreads from the tick, 520 ms | The drop lands; a visual stand-in for a haptic |
| Into the lens | Camera glides to straight above the rings, 1.3 s; lens fades and scales in from 0.94, 900 ms | You look down into the middle of your own map |
| Timer | Each second: the numeral in the serif scales in from 1.18, a ring closes on the lens from 1.12 | The count is felt without reading it |
| Shutter | A white flash, 420 ms | The photo was taken |
| Keep | The still sinks (to 0.82, fading, 680 ms, `--ease-swell`) while `splash()` sends a ripple across the rings (about 2.5 s) | The photo lands like a drop on day one |

Reduced motion: the intro becomes a calm sequence that cuts between the same 3D poses every 4 s with Pause, Next and Skip; the water stops moving; setup cuts between questions; everything renders at rest.

## Rules broken on purpose (taste-skill house rules)

- **Styled accent line in headlines:** the italic serif turn. It is the two-voice idea (fact, then feeling) and comes straight from the Morpho reference.
- **A numbered progress:** "3 of 9" in setup and 24 ticks in the intro. These count real things (questions, weeks), not decoration.
- **Small HUD labels on the scene:** they are the map's legend, positioned on the rings they name, in sentence case and readable size.
- **One shadow:** only on things that float (the check-in bar, popovers). Nothing at rest.

## Imagery

- No stock photography, no product shots, no Man Matters marks. The dropper is generic and built in code.
- The pool is the only illustration in the flow. Head placeholders are the single-weight ghost drawings (`src/components/heads/HeadGhost.tsx`): crown from above with its whorl, hairline face on with the eyebrow line, parting from above with the parting. They stand in for any photo not taken yet.
