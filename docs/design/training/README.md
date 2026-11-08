# Pokémon training

2026-11-07, America/Los_Angeles. Maintainer-approved training design for [#204](https://github.com/ewei068/pokestar/issues/204), journeys J06 and J76. Editable preview only: no API calls, database or gameplay persistence. Collection view state is retained in its browser history entry for the return journey. Production implementation remains a later step.

From the repository root, run `python3 -m http.server 8132 --bind 127.0.0.1`, then open the [review](http://127.0.0.1:8132/docs/design/training/).

- [Desktop](http://127.0.0.1:8132/docs/design/training/?width=1280&state=ready)
- [Phone](http://127.0.0.1:8132/docs/design/training/?width=390&state=ready)
- [Collection entry](http://127.0.0.1:8132/docs/design/training/?width=390&state=entry)
- [EV cap, EXP continues](http://127.0.0.1:8132/docs/design/training/?width=390&state=ev-cap)
- [Level cap, EVs continue](http://127.0.0.1:8132/docs/design/training/?width=390&state=level-cap)
- [Berry Farm reduction](http://127.0.0.1:8132/docs/design/training/?width=390&state=berry)
- [Slow request and Stop](http://127.0.0.1:8132/docs/design/training/?width=390&state=slow)
- [Uncertain outcome](http://127.0.0.1:8132/docs/design/training/?width=390&state=uncertain)

## Confirmed direction

The maintainer requested a browser training loop: clicking Train begins sending the equivalent of `/train` every second, with the first request after one second. Stop when the Pokémon cannot gain new EVs **and** EXP. Backend training rules and Discord behavior stay the same. This changes the browser interaction, not the amount earned by an individual training operation.

**Stop rule confirmed by the maintainer, 2026-11-07:** treat level 100 as EXP complete. Continue training while the selected location can change EVs, including reductions at Berry Bush/Farm. Stop when neither EXP progression nor an EV change is possible there. `addPokemonExpAndEVs` still increments stored EXP at level 100; that backend behavior stays unchanged. The maintainer subsequently approved the refined training screen; future upgrade tabs need their own designs. The UI shows actual simulated EXP earned even during level-100 EV training; it does not pretend the backend awards zero EXP there.

## Proposed screen and loop

Train opens only from an inspected owned Pokémon, with no independent navigation tab or Pokémon picker inside training. Back and the Pokémon navigation item return to the invoking collection, preserving its search and inspection. The study reuses the existing collection preview through `collection.html` and a small `collection.js` adapter; the original collection study is unchanged. The review's default fixture opens that collection. Named training fixtures are review shortcuts for a preselected Pokémon, not proposed standalone product routes. Desktop has owned training locations beside the selected Pokémon, level/EXP, six EV rows, next gains and session totals. Phone uses a native location select and keeps Train/Stop above the existing bottom navigation. The selected location's gains are next-operation deltas after clamps, rather than an unqualified configured maximum. The full stat table stays visible even at locations affecting only one stat.

Required now: readable desktop/phone composition, start/stop clarity, real location catalog and ownership, capped-stat/EXP distinctions, EV reductions, pending/error/unknown outcomes and feedback on the proposal. Check with a real browser and the source rules below.

Proposed browser interaction details:

1. Train turns into Stop immediately. Wait one second before the first operation. Keep at most one operation in flight. After a response, wait one second before the next; slow responses never produce a backlog or catch-up burst. This means slow requests can lower the rate below one per second.
2. Keep the invoked Pokémon fixed and lock location selection while running or finishing a request. Stop cancels future ticks; a request already submitted may still finish and count. The status is blank while idle and reads “Training…” while running or finishing an in-flight operation. The button becomes disabled “Stopping…” while a stopped request finishes.
3. Keep only total Pokémon EXP and signed EV gains in the footer. Omit request counts, trainer-gain lines, cadence text and latest-result narration. Trainer progression and header money still update through the unchanged operation; removing footer copy does not remove rewards. A full EV stat does not stop EXP training. Maximum level does not stop a permitted EV change. Under the confirmed stop rule, both complete at the selected location stops automatically; another location can still be useful.
4. Berry reductions share this operation. Continue while any affected EV can fall, including at level 100. At zero EVs, continue only if EXP progression remains. Do not silently move to another location or switch Pokémon.
5. Stop on a rejected operation. On timeout/network uncertainty, pause and ask to refresh before manually starting again; do not automatically retry an uncertain mutation. Refresh is a read and does not restart training.
6. Pause when the tab becomes hidden or the user leaves training. Returning, reloading, signing back in or choosing another Pokémon never starts a loop automatically. No background worker or saved running preference. An already submitted real request may still complete after departure.

The header review selector exposes ready/running, collection entry, EV cap, level cap, both complete, Berry reduction/zero, Celebi bonus, only Home, slow response, unknown outcome, rejected training, changed-in-Discord, loading, failed load, empty and long-name/missing-art fixtures. Reset returns to the fixture's initial state.

Preserve flexibility: keep Pokémon ID/location ID and loop ownership separate from presentation. A real session should consume server-projected eligibility, actual gains and fresh progression values. The session owns timers and cancellation; React presentation owns layout. Keep this study independent of production imports so design feedback can change its layout cheaply.

Deferred: nature/evolution (#205), equipment (#206), held items (#208), location purchases (#202), real endpoints, persistence and reward verification. Revisit their interaction boundaries when their own journeys begin. No broader CSS extraction or framework change is part of training.

## Source evidence and implementation constraints

| Concern | Source and consequence |
| --- | --- |
| `/train` operation | `src/commands/pokemon/train.js`: map nine locations, obtain trainer and owned Pokémon, call `trainPokemon`, report gains and level-up. The web should share the operation, not simulate Discord command parsing. |
| Ownership/location rules | `src/services/pokemon.js`, `trainPokemon`: non-Home requires an owned location. Free Home gives base 2 EXP; owned levels supply configured EXP/EVs. |
| Locations | `src/config/locationConfig.js`: Home, Restaurant, Gym, Dojo, Temple, School, Track, Berry Bush, Berry Farm. Computer Lab and Ilex Shrine are not `/train` choices. The fixture generator reads this catalog directly. |
| EV bounds | `addPokemonExpAndEVs` and `src/config/pokemonConfig.js`: zero floor, 252 per stat, 510 total; positive and negative paths have different clamps. Revalidate current values on every operation. |
| EXP | `src/config/trainerConfig.js`, `expMultiplier`; trainer-level multiplier, floor, at least 1 EXP; Celebi doubles it. Level stops at 100 but stored EXP keeps increasing. |
| Training side effects | `trainPokemon` emits `TRAINED_POKEMON`; quest/event listeners consume it. The Discord command handler (`src/handlers/commandHandler.js`, `src/config/commandConfig.js`) separately awards trainer participation progression. The future shared HTTP operation must preserve relevant per-operation side effects; scheduling/read refresh alone must never grant them. |
| Trainer gains | The configured `/train` participation grant is 15 trainer EXP and 50 money per successful command. The maintainer confirmed web training uses this same grant per successful tick, replacing rather than stacking the generic web 5/10 grant. The study updates fixture header money; its footer shows only Pokémon EXP/EV gains. Real trainer-level changes must affect subsequent server-calculated Pokémon EXP. The fixture keeps trainer level 18 fixed. |
| Request quota | `src/web/rateLimits.js` currently shares an actions budget of 60 per minute per user. A one-second loop can consume nearly that entire budget; other tabs/actions can lead to 429. Implementation must account for this and show a stopped/rate-limited state without automatically retrying a mutation. This study does not change the quota. |
| Existing mutation limits | `addPokemonExpAndEVs` writes a Pokémon snapshot; existing Discord writers and cross-document side effects are not made atomic by a browser loop. Keep the approved reliability scope and document actual concurrent outcomes rather than claiming exactly-once behavior. |
| Existing client seam | `web/src/collection/PokemonInspection.tsx` exposes disabled Train. `web/src/player/` owns account-scoped server data. Future training should reconcile current Pokémon, collection/party summaries and trainer progression without obscuring confirmed values on each tick. |

The generated `fixtures.js` contains live location names, levels and base yields. Ownership, trainer level 18, Pokémon builds and session results are illustrative. The prototype repeats the documented EXP multiplier and EV clamps only to make the interaction inspectable. Its fixed 535-EXP level meter is deliberately illustrative, not a new growth formula. Production must use server-derived growth/progress, actual signed deltas and stop eligibility. Regenerate the location catalog with `node docs/design/training/generate-fixtures.cjs`.

## Evidence

Initial study observations in local headless Chrome (before the refinement below):

- All 18 fixtures at 1280, 900, 390 and 320 px (72 combinations) rendered meaningful content without horizontal document overflow or browser script errors. No local stylesheet/script/image request failed. Remote sprite delivery remains subject to its host; the long-name fixture explicitly shows missing-art fallback.
- A phone action initially overlapped the bottom navigation. The repaired fixed action stays above it; follow-up checks included a 320×640 long-name fixture. Stats remain reachable by vertical scrolling.
- Real timers showed no request during the first 600 ms, one after the first second, and no future ticks after Stop. A slow-response fixture allowed its one in-flight result to finish after Stop and issued no catch-up requests.
- Level-100 EV training reached the per-stat cap and stopped. Berry Farm reduced EVs to zero and stopped at level 100. Capped EVs below level 100 continued EXP training. These fixture checks match the maintainer-confirmed stop rule; they do not establish production behavior.
- Refresh after unknown outcome did not restart the loop. Choosing a different location recovered from rejected training. Hiding the document paused before another tick. Collection entry and Back returned to the correct study view.
- A final five-layout check verified the dark text color on gold Train, phone action reachability, and one-operation trainer gains/header money. Screenshots are machine-local at `/tmp/pokestar-training-{desktop,tablet,phone,narrow-long,berry,result}.png`; they are review aids, not durable acceptance artifacts.
- Direct scoped review checked the study against source bounds, the requested first-tick timing, completion cases and the existing visual guide. JavaScript syntax and whitespace checks passed. No independent agent review was run for this reversible study.

No backend/client production tests were run for these isolated static study files. No real OAuth, MongoDB, Discord, production training, physical-device input, true cross-tab scheduling or reward/concurrency acceptance is claimed. Background pausing was checked with a visibility event; real OS/device suspension remains unverified. The study's fixtures do not establish a working HTTP training operation.


## Maintainer refinement · 2026-11-07

- Removed “down to zero” from Berry copy. Home says “Fully upgraded, Home provides the most EXP.” The upgrade qualifier matches the configured yields: maximum Home base EXP is 10; Berry Farm is 8, while lower Home levels can yield less. Backend yields are unchanged.
- Removed Change and the Pokémon chooser. Collection inspection is the entry; Back returns to its invoking screen, including the current search/selection. Training is not a main-navigation destination. The adapter shares the established collection study instead of recreating a placeholder inspection screen.
- Idle/stopped/completed status is blank; active status is “Training…”. The footer contains only total Pokémon EXP and EV gains, kept beside Train/Stop above phone navigation. Pending Stop still prevents further requests and waits for its one submitted result.
- Added **Open unframed** to the review toolbar. It opens the current fixture directly, without the width-preview iframe. The wrapper's iframe was a plausible explanation for annotation failing only on this review. The maintainer subsequently confirmed the unframed route works; the app's underlying iframe limitation remains an inference.

Refinement verification: all 18 states at 1280/900/390/320 px (72 combinations) fit without horizontal overflow or browser script errors. Idle status was empty and the footer had only EXP/EV totals. Real-timer checks covered first-tick delay, Stop and one slow in-flight completion. The collection → inspect Snorlax → Train → Back flow restored the search and selection; the Pokémon navigation item returned to that same context. The first return check exposed that browser history alone did not preserve the invoking filter; the adapter now restores that entry's view state explicitly. The unframed link retained the chosen fixture and rendered without an iframe. Desktop/phone screenshots were visually inspected. A final 1280/390/320 px check verified that EXP/EV totals stay in the action footer and update after one tick, while idle status clears after Stop. Syntax, local HTML references and whitespace checks passed. The maintainer subsequently confirmed annotations work on the unframed route. These remain fixture-only observations; production behavior is not established.


## Approval and extension boundary · 2026-11-07

The maintainer approved the refined study and confirmed annotation works in the unframed preview. A final requested repair gives the native training-location select a custom chevron 12 px from the right edge with 38 px reserved for text. Production should reuse the established select treatment.

The Pokémon-scoped workspace must be able to add Train, Held item, Equipment, Nature and other upgrade tabs later. Keep the selected Pokémon identity and invoking-screen return context in the host; keep the training loop and training state inside the Train feature. Only Train is implemented in this slice; do not add empty future tabs, generic plugin registration or future mutation APIs. Switching away from Train will stop its loop.

Implementation planning is recorded in [the training plan](../../plans/2026-11-07-2134-feat-web-pokemon-training-plan.md).
