# Combat outcome contract

`Battle.performAction` returns `{ accepted, events, snapshot, log }` for an accepted action. Rejected actions return `{ accepted: false, reason, events: [], snapshot }` and do not advance the battle. The snapshot is authoritative; events describe the ordered occurrences that led to it. The web client animates the events and reconciles to the snapshot; see [result playback](battle-result-playback.md).

Each event has a zero-based `sequence` within that action. Events contain IDs and scalar values rather than references to engine objects. A stored action update can add a battle `revision` and actor ID around this outcome without changing the engine event format. The current `log` remains available for Discord text; it is not an animation protocol.

| Event | Data | Meaning |
| --- | --- | --- |
| `actionStarted` | `pokemonId`, `action` | The active Pokémon began the accepted action. |
| `actionBlocked` | `pokemonId`, `moveId` | Status or a rule event prevented the attempted move after the turn was consumed. |
| `moveStarted` | `pokemonId`, `moveId`, `moveType`, `damageType`, `targetPattern`, `primaryTargetId`, `targetIds`, `patternTiles`, `missedTargetIds` | The engine resolved actual targets and the geometric tile footprint for this execution. `patternTiles` includes empty positions; for a random move it contains only the chosen position. A triggered or repeated move can emit another `moveStarted`. |
| `targetMissed` | `pokemonId`, `targetPokemonId`, `moveId` | This target was marked missed. Some moves can still have an effect on a missed target. |
| `hpChanged` | `pokemonId`, `sourcePokemonId`, `previousHp`, `hp`, `amount` | HP changed; `amount` is signed. |
| `shieldChanged` | `pokemonId`, `sourcePokemonId`, `shield`, `amount` | A shield absorbed damage. |
| `effectApplied`, `effectRemoved` | `pokemonId`, `effectId`; applied events also have `sourcePokemonId`, `duration` | An effect was added or removed. |
| `statusApplied`, `statusRemoved` | `pokemonId`, `statusId`; applied events also have `sourcePokemonId` | A status changed. |
| `pokemonMoved`, `pokemonTransformed`, `pokemonFainted`, `pokemonRevived` | `pokemonId` and the new position, species, or HP where relevant | A visible Pokémon changed. |
| `moveCompleted` | `pokemonId`, `moveId` | That move execution returned. Reactions can follow it. |
| `weatherChanged` | `previousWeatherId`, `weatherId`, `duration` | Weather set/replacement, refresh or clearing; null ID means cleared. |
| `combatReadinessChanged` | `pokemonId`, nullable `sourcePokemonId`, `previousCombatReadiness`, `combatReadiness`, signed actual `amount` | Explicit readiness boost/drain after clamping; unchanged values emit no event. |
| `turnStarted`, `phaseStarted`, `battleEnded` | Turn number and active Pokémon, or winner where relevant | The battle advanced to a new turn, phase, or result. |

The recorder is deliberately separate from `BattleEventHandler`: rule listeners can mutate battle objects, while combat outcomes must be safe to serialize. Existing content can still make changes outside the instrumented engine methods, so clients must always reconcile with `snapshot`. Move and ability paths that directly mutate state remain an audit/test follow-up; existing animations do not establish complete event coverage.

The participant's `availableActions.moves[*].targetPokemonIds` remains the list of legal primary targets. The additive `targetPreviews` array has one entry per primary target: `patternTiles` covers the geometric pattern (including empty cells), `affectedPokemonIds` lists currently hittable occupants, and `emptyTileTargets` lists the empty pattern cells separately. Each tile uses `{ teamName, position }` with the engine's one-based position. For random moves, `random: true` means the preview is a set of possible occupied tiles; `moveStarted.patternTiles` carries the resolved choice. Previews teach the pattern, not guaranteed damage or secondary effects.
