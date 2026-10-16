# Battle result playback

Status: implemented first increment. Participant HTTP response shapes and durable
storage remain unchanged. The client presents supplied event observations, then
reconciles with the canonical view for each action revision.

## Sequence and state ownership

```text
HTTP response → latest authoritative battle (commands/cursors)
  → unseen action revisions → ordered presentation frames
    → event text or move VFX using the preceding view
    → supplied state change, animated from the preceding view
    → next event
    → canonical reconciliation and next-turn announcement
```

All board state, inspector bars, turn/weather displays and victory notices use
the playing view. Commands are disabled until presentation catches up. Reward
notices wait until playback finishes. Each frame is identified by battle,
revision, sequence and stage; a new polling result cannot restart its timer.

HP observations use their absolute `hp` field. Reaching zero HP does not mark a
Pokémon fainted until `pokemonFainted` is presented. Status/effect changes update
only the fields supplied. Missing consequences (stat modifiers, cooldowns,
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

## Additional observations

These are additive observations; battle rules, RNG and snapshots are unchanged.
Old stored actions remain valid and reconcile changes absent from their events.
All events also carry the existing per-action `sequence`.

| Event | Metadata | Emission |
| --- | --- | --- |
| `weatherChanged` | `previousWeatherId`, `weatherId`, `duration` | Set/replacement, refresh and clearing, including expiry; null ID means cleared. |
| `combatReadinessChanged` | `pokemonId`, nullable `sourcePokemonId`, `previousCombatReadiness`, `combatReadiness`, signed actual `amount` | Explicit boost/drain after clamping; no event when unchanged. Independent of whether rules callbacks are enabled. |

Natural readiness progression, action readiness reset, weather countdown and
other routine changes continue to reconcile without separate announcements.

## Configuration, verification and follow-ups

The [result settings and extension guide](../web/src/battles/results/README.md)
records editable parameters, units, stories, responsibilities and extension
seams. [Verification records](verification/event-results/README.md) cover unit,
component and browser checks. These result settings are separate from the
approved [move VFX recipes](battle-vfx-guide.md).

Custom event visuals, causality-aware AOE batching, semantic reports that also
produce Discord logs, richer difference animations and SFX remain follow-ups.
