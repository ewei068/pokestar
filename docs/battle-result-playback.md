# Battle result playback

Status: implemented first increment. Participant HTTP response shapes and durable
storage remain unchanged. The client presents supplied event observations, then
reconciles with the canonical view for each action revision.

## Sequence and state ownership

```text
HTTP response → latest authoritative battle (commands/cursors)
  → unseen action revisions → ordered presentation frames
    → event text + supplied state change start together (move VFX still precede results)
    → wait for the longest text/state animation
    → next event
    → canonical reconciliation and next-turn announcement
```

All board state, inspector bars, turn/weather displays and victory notices use
the playing view. Commands are disabled until presentation catches up. Reward
notices wait until playback finishes. Each frame is identified by battle,
revision, sequence and stage; a new polling result cannot restart its timer.

HP observations use their absolute `hp` field. Reaching zero HP does not mark a
Pokémon fainted until `pokemonFainted` is presented. Status/effect changes update
only the fields supplied. `moveStarted` projects its actor’s combat readiness
to 0 immediately, matching the engine’s move-use reset; subsequent supplied
readiness observations and canonical turn preparation remain authoritative.
Missing consequences (stat modifiers, cooldowns,
routine readiness advancement and duration ticks) arrive through reconciliation.
The final canonical view remains authoritative even if observations are missing.
No per-event or per-action snapshots were added to persistence.

An action's canonical view already contains next-turn preparation. A trailing
`turnStarted` is therefore narrated after reconciliation. Action revision also
covers final battles without another turn and phases that reset turn numbers.
A gap in revisions causes immediate resynchronization instead of guessed state.

## Announcements and log

Generic labels rise from the affected Pokémon's sprite center and fade. Moves
and blocked/skipped actions use the actor; misses use the defender. Field events
and missing subjects use larger central text. Move labels accompany the existing
1500 ms move sequence. Structural markers add no pause. There is no separate
current-event strip below the board; targeting instructions stay in Commands.

Narration is appended when its event starts, grouped by action. It never exposes
queued future results. The current log is session-local and does not reconstruct
historical entries on opening a battle. Skip animations or backgrounding the tab
settles the latest authoritative view. Changing motion preferences also settles
playback. Skipped future narration is not added.
Reduced motion preserves observation order with short text and instant changes.

## Batches, reactions and virtual history

Consecutive compatible events on distinct present Pokémon share an announcement
stage with a concurrent destination-view transition. HP/readiness gains and losses stay
separate; matching effects/statuses require the same ID and operation. Misses
and shield loss can batch. Repeated hits on the same Pokémon remain separate.
Any other event is a barrier, including faint, revival, move completion and phase
changes; action revisions are never crossed. Each narration remains an
individual log entry in server order.

State differences drive configurable damage, healing, faint, status and effect
reactions. Status application reuses the matching type’s Status move recipe in
place; cures use a clearing ring. Buff gains send red chevrons upward with red labels, debuff gains send blue
chevrons downward, and neutral gains pulse gold. Effect loss has text/state
updates without VFX or badge pulses. Miss events sidestep and return with short trails. Damage
flashes/recoils, healing emits plus particles, and fainting drops/fades the
sprite while leaving its card readable. Duration ticks do not replay
status/effect gain/loss reactions. Canonical reconciliation uses
the same reactions. Skip, reduced motion and unmount dispose all transient work.
No generated artwork or approved move VFX recipes were changed.

The log is uncapped for the current session. A [Virtua](https://github.com/inokawa/virtua)
list lazily renders visible rows and overscan, with dynamic height measurement
for wrapping. Chronological entries carry action headings. Near the bottom it
follows incoming entries; scrolling back pauses following, and Latest resumes
it. Virtualization bounds DOM work, not total history memory. Historical logs
after reconnect are still a separate server/client feature.

## Copy ownership

`web/src/battles/eventPresentation.ts` consolidates the former narration and
floating-label switches. An event definition supplies narration, short label,
subject, tone and batching key. Templates use IDs/values and display catalog
names; the server sends no UI strings or markup for this presentation.

A future Discord formatter can consume the same semantic events with its own
wording. Shared template data could be extracted into a neutral package if both
surfaces need it. A future `battle.report` would unify reporting occurrences
and legacy Discord logs; ordinary manual combat events can already use this
client catalog. Neither step requires moving rendering into the server.

## Additional observations

These are additive observations; battle rules, RNG and snapshots are unchanged.
Old stored actions remain valid and reconcile changes absent from their events.
All events also carry the existing per-action `sequence`.

| Event | Metadata | Emission |
| --- | --- | --- |
| `weatherChanged` | `previousWeatherId`, `weatherId`, `duration` | Set/replacement, refresh and clearing, including expiry; null ID means cleared. |
| `combatReadinessChanged` | `pokemonId`, nullable `sourcePokemonId`, `previousCombatReadiness`, `combatReadiness`, signed actual `amount` | Explicit boost/drain after clamping; no event when unchanged. Independent of whether rules callbacks are enabled. |

Natural readiness progression, weather countdown and
other routine changes continue to reconcile without separate announcements.

## Configuration, verification and follow-ups

The [result settings and extension guide](../web/src/battles/results/README.md)
records editable parameters, units, stories, responsibilities and extension
seams. [Initial verification](verification/event-results/README.md) and
[batch/log verification](verification/batched-results/README.md) and
[status/effect verification](verification/status-effect-results/README.md) cover unit,
component and browser checks. These result settings are separate from the
approved [move VFX recipes](battle-vfx-guide.md).

Shield-specific visuals, batching across intervening events, semantic
reports that also produce Discord logs, richer difference animations and SFX
remain follow-ups.
