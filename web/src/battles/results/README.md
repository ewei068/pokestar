# Event results and view transitions

`config.ts` holds typed presentation settings. The development stories and live
battle screen use the same playback module and renderers. No tuning panel is
required: edit settings and replay the relevant story.

Floating labels follow the [arena design guide](../../../../docs/arena-design-guide.md).
Their anchors share `../arena/geometry.ts` with movement and tile VFX.

## Settings

- `text`: lifetime, rise distance, entry scale, fade fractions, easing, font sizes,
  and width limits. Times are milliseconds, distances are CSS pixels, and fade
  positions are fractions of the text lifetime. Keep `fadeInEnd < fadeStart < 1`.
- `transition`: meter, cue and faint/revival durations, plus easing. The longest
  supported transition in a view change determines the wait before advancing.
- `reducedMotion`: short readable event interval and immediate state changes.
- `log`: virtual viewport height and near-bottom follow threshold. History has no
  entry cap. Rows are measured dynamically by Virtua and created lazily.
- `reactions`: damage flash/recoil/rays, healing glow/particle births, faint
  drop/fade, miss sidesteps/trails, status recipe mapping/clearing rings, and
  effect chevrons/pulses. Distances are CSS pixels, angles in drawing code are radians, and
  durations are milliseconds. Keep durations positive, counts integer, and
  particle births within the transition (stagger × last index + fade-in must fit). Reactions contribute to the transition
  deadline, so increasing their duration cannot advance playback early.

Move approach/VFX/return settings remain in `../vfx/`; a move's label accompanies
that existing sequence and adds no extra pause. Silent structural events have
no announcement delay.

## Responsibilities

`../playback.ts` plans each revision from the preceding canonical view. It emits
an event stage containing both the labels and destination view. Observed state
changes and text start together; its deadline is the longer of the text/move
lifetime and state transition. A transition-only stage handles silent changes
and canonical reconciliation. Supplied observations update fields;
`moveStarted` also projects the engine’s readiness spend as 0 for its actor. It does not infer damage or other move
consequences. At the action boundary, the canonical view supplies any missing
changes.
A final `turnStarted` is announced after this reconciliation. Revisions, rather
than turn numbers, distinguish action boundaries and phases.

`../useBattlePlayback.ts` owns progression, reached log entries, asset readiness,
reduced motion and cancellation. Incoming revisions append without restarting
the active frame. Initial opening, gaps, ruleset changes, skipping and background
visibility or motion-preference changes resynchronize to the latest canonical state. Stale timer completions
cannot advance another frame. The browser clock has a finite configured deadline
for each stage; custom treatments must stay within their stage's timing.

`../eventPresentation.ts` is the client presentation catalog: full narration,
short labels, subjects, tones and batch keys are defined together. `events.ts`
applies known observations without generating copy.
`transitions.ts` compares views. `EventAnnouncement.tsx` measures the sprite
anchor, falls back to board center, and animates the label. CSS animates meter
width, fainted appearance and cue/weather emphasis when the destination view
is rendered. The state duration is shared with the playback clock. Values in
text/ARIA reflect the destination when that transition starts; the visual bar
interpolates to it. `ResultReactions.tsx` derives damage/healing/faint treatments from the same view
differences, including canonical reconciliation. It cancels sprite animations
and removes its particles on stage change, skip or unmount. Random-looking
particle placement/timing is seeded by frame, Pokémon and particle identity.
Fainted sprites stay hidden while their readable card remains.

`StatusVfx.tsx` groups newly applied statuses by type and reuses `BoardVfx` with
zero approach delay. Burn → Fire, Paralysis → Electric, Freeze → Ice,
Poison/Badly Poison → Poison, Sleep → Psychic. Unknown statuses use Normal.
These are the existing approved Status recipes, with no actor movement. Their
760 ms lifetime is shared with `vfx/timing.ts`; recipe art and choreography stay
in `vfx/recipes/`. Cures use a short clearing ring. Status identity changes and
effect additions are view differences, so canonical reconciliation uses the
same visuals. Effect removal updates state and text without VFX or badge pulse. Duration ticks and same-ID refreshes do not replay them.

Misses are event-only sidesteps with short trails: no damage or view patch is
invented. `effectDirection.ts` uses catalog categories: Buff gains rise in red (including
the floating label), Debuff gains fall in blue. Neutral/unknown effect gains
use gold expanding rings. Removals do not play particles or badge pulses. Shared
`effectColors` settings feed both animation ingredients and CSS variables for
board counters and inspector tags. Labels and up/down symbols preserve meaning
without relying on color.

Frames retain a reference to their preceding view while artwork is pending;
text, badges, state and the playback timer begin together when assets settle.
Asset failure remains non-blocking. Reduced motion renders no canvas/reactions.

`BattleLog.tsx` presents chronological history with action headings. Its Virtua
list mounts only visible rows plus overscan, handles wrapped text, follows new
entries near the bottom, and preserves position while reading older entries.
Latest returns to live follow. There is no session entry cap; history storage is
still linear in entries, and opening a battle still starts a new local log.

## Batching

Only consecutive compatible observations within one action revision share a
stage. HP and readiness use separate gain/loss keys; HP also keeps sources
separate. Effect/status batches require matching IDs and operation. Misses
require the same attacker/move. Shield damage can batch too. Each subject must
be present and distinct: repeated hits remain individually visible. Every other
event, including silent move completion, is a barrier. Never pull events across
a faint, revival, move, phase or action boundary.

A batch computes labels from the preceding view, appends each narration in
server order, and applies the supplied observations in that same order to form
one destination view. Labels and transitions start together; the next batch
waits until both finish. More aggressive grouping
would require explicit causality/independence information.

## Stories

Open `?previewBattle=1&story=<id>`:

| Story | Covers |
| --- | --- |
| `result-damage`, `result-heal` | Floating text alongside HP interpolation |
| `result-shield` | Shield damage followed by effect removal |
| `result-status` | Applied status, buff, and cure; badge changes |
| `result-miss`, `result-batch-misses` | One or several defenders sidestep/return with independent trails |
| `result-status-burn`, `result-status-paralysis`, `result-status-freeze` | Fire/Electric/Ice Status recipes in place, then cure |
| `result-status-poison`, `result-status-toxic`, `result-status-sleep` | Poison/Poison/Psychic Status recipes in place, then cure |
| `result-effect-buff`, `result-effect-debuff`, `result-effect-neutral` | Gain-only directions/colors/pulses; removal remains text/state only |
| `result-reaction-reconcile` | Status/effect reactions for canonical differences without events |
| `result-revive` | Revival text, HP restoration and appearance |
| `result-announcement`, `result-missing-target` | Central text and missing-subject fallback |
| `result-weather`, `result-readiness` | Explicit observed state changes |
| `result-reconcile` | HP, readiness, effect duration and weather differences without events |
| `result-sequence` | Move VFX → damage text + HP drain → faint text + drop/fade → canonical next turn |
| `result-batch-damage`, `result-batch-heal` | Concurrent labels, reactions and bars on three Pokémon |
| `result-batch-readiness`, `result-batch-effects`, `result-batch-misses` | Grouped numeric, matching effect/status and miss observations |
| `result-batch-faint` | Fainting prevents batching across dependent results |
| `result-long-log` | 20,000 wrapped entries, follow/scroll behavior, and Simulate another result |

Review full playback at desktop and phone sizes. Check observed values update as their labels appear, no future results enter
the log, transitions
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
  seam. State-difference animations belong to the frame’s view changes so they also
  work during canonical reconciliation, without duplicate reactions.
- Grouping beyond consecutive compatible observations needs explicit
  independence/causality information. Keep server event order and barriers.
- A future semantic report such as `moveProtected` can drive Discord logging,
  client narration and a custom treatment from one occurrence. Introduce that
  report for a concrete behavior; do not create a second parallel event bus.
- Fine-grained shield visuals, position/transform transitions,
  historical logs after reconnect, interactive tuning and SFX remain follow-ups.
