# Event results and view transitions

`config.ts` holds typed presentation settings. The development stories and live
battle screen use the same playback module and renderers. No tuning panel is
required: edit settings and replay the relevant story.

## Settings

- `text`: lifetime, rise distance, entry scale, fade fractions, easing, font sizes,
  and width limits. Times are milliseconds, distances are CSS pixels, and fade
  positions are fractions of the text lifetime. Keep `fadeInEnd < fadeStart < 1`.
- `transition`: meter, cue and faint/revival durations, plus easing. The longest
  supported transition in a view change determines the wait before advancing.
- `reducedMotion`: short readable event interval and immediate state changes.
- `history`: the maximum number of reached narration entries retained locally.

Move approach/VFX/return settings remain in `../vfx/`; a move's label accompanies
that existing sequence and adds no extra pause. Silent structural events have
no announcement delay.

## Responsibilities

`../playback.ts` plans each revision from the preceding canonical view. It emits
an event stage (old view), then a transition stage (destination view). Only
supplied observations update fields; `applyEventView` never calculates battle
rules. At the action boundary, the canonical view supplies any missing changes.
A final `turnStarted` is announced after this reconciliation. Revisions, rather
than turn numbers, distinguish action boundaries and phases.

`../useBattlePlayback.ts` owns progression, reached log entries, asset readiness,
reduced motion and cancellation. Incoming revisions append without restarting
the active frame. Initial opening, gaps, ruleset changes, skipping and background
visibility or motion-preference changes resynchronize to the latest canonical state. Stale timer completions
cannot advance another frame. The browser clock has a finite configured deadline
for each stage; custom treatments must stay within their stage's timing.

`events.ts` selects a label/subject/tone and applies known observations.
`transitions.ts` compares views. `EventAnnouncement.tsx` measures the sprite
anchor, falls back to board center, and animates the label. CSS animates meter
width, fainted appearance and cue/weather emphasis when the destination view
is rendered. The state duration is shared with the playback clock. Values in
text/ARIA reflect the destination when that transition starts; the visual bar
interpolates to it. `BattleLog.tsx` groups reached narration by action, newest
action first and chronological within each action.

## Stories

Open `?previewBattle=1&story=<id>`:

| Story | Covers |
| --- | --- |
| `result-damage`, `result-heal` | Floating text then HP interpolation |
| `result-shield` | Shield damage followed by effect removal |
| `result-status` | Applied status, buff, and cure; badge changes |
| `result-revive` | Revival text, HP restoration and appearance |
| `result-announcement`, `result-missing-target` | Central text and missing-subject fallback |
| `result-weather`, `result-readiness` | Explicit observed state changes |
| `result-reconcile` | HP, readiness, effect duration and weather differences without events |
| `result-sequence` | Move VFX → damage text → HP drain → faint text → faint transition → canonical next turn |

Review full playback at desktop and phone sizes. Check the old values remain
visible through announcements, no future results enter the log, transitions
settle before subsequent events, and skip/reduced motion leave no visual work.
Use pure playback tests for ordering, immutability, reconciliation and incoming
updates; use component tests for labels/controls and browser checks for actual
motion and geometry. Keep approved move VFX recipes unchanged when adjusting
result presentation.

## Extending this later

- Add a semantic combat observation and its typed fields, narration, cue and
  optional observed-state patch. Unknown observations currently settle through
  canonical reconciliation. Do not transmit engine objects or unprojected data.
- A custom event visual can replace the generic announcement at its rendering
  seam. State-difference animations belong in the transition stage so they also
  work during canonical reconciliation, without duplicate reactions.
- Batched AOE presentation needs explicit independence/causality information.
  Keep server event order; fainting and triggered effects are ordering barriers.
- A future semantic report such as `moveProtected` can drive Discord logging,
  client narration and a custom treatment from one occurrence. Introduce that
  report for a concrete behavior; do not create a second parallel event bus.
- Fine-grained shield visuals, hit markers, position/transform transitions,
  historical logs after reconnect, interactive tuning and SFX remain follow-ups.
