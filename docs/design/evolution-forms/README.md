# Evolution & forms

Approved web UI study for [issue #205](https://github.com/ewei068/pokestar/issues/205),
covering [J21 and J22](../../user-journeys.md#j21). The maintainer asked for
evolution and form changes together on one tab. The maintainer approved the default side-by-side layout on 2026-11-13 and
asked that Train size the same way as its neighboring tabs.

## Review the study

From the repository root, with backend dependencies installed:

```sh
node docs/design/evolution-forms/serve.cjs
```

Open [Eevee’s evolutions](http://127.0.0.1:61813/?state=eevee&variant=split)
or [Rotom’s forms](http://127.0.0.1:61813/?state=rotom&variant=split). Resize the
browser to try the phone layout. Use the arrow buttons or left/right arrow
keys to change layouts. **Design study** switches and resets scenarios.
Use `review=0` in the URL to hide the review controls for an unobstructed view.

| Layout | Interaction |
| --- | --- |
| [Side-by-side](http://127.0.0.1:61813/?state=eevee&variant=split) (recommended) | A visible list and persistent preview on desktop. A single picker keeps the preview close on phones. |
| [Inline](http://127.0.0.1:61813/?state=eevee&variant=inline) | A sprite grid above the persistent preview makes the choices visible on phones, with more scrolling to reach the action. |
| [Preview dialog](http://127.0.0.1:61813/?state=rotom&variant=dialog) | Choose a sprite to open a modal comparison. Closing it returns focus to the choice. |

Edit [study.js](study.js), [study.css](study.css) or [index.html](index.html)
and reload the page. Restart the server after changing [fixtures.cjs](fixtures.cjs).
The study loads Pokestar’s shared UI styles and configured sprite URLs.
All actions are simulated in memory and reset on page reload.

## Approved interaction

Enter through the inspected Pokémon’s existing upgrade workspace. Add
**Evolution & forms** beside Train, Item & nature, and Equipment. Show the
applicable choices for the inspected Pokémon. None of the configured species
has both kinds of choice today. Keep the tab available when there are no
choices and explain the empty state there.

The preview shows the target’s sprite, type and ability, a current/after
comparison of combat power and six stats, and an optional move comparison.
An eligible evolution is free and has an explicit irreversible-action note.
A locked evolution shows the required level. Form changes show the exact
cost and current balance at the confirmation action, including a shortage
when applicable. Selection and dialog dismissal are read-only. On success,
the same Pokémon shows its new species or form and the choices update
from that state.

The scenarios include branching evolution, paid form changes, return from a
variant to its base form, a custom nickname, a missing sprite, custom moves,
a level gate, an empty list, insufficient funds, loading and load failure.
Pending blocks duplicate confirmation and can settle after leaving the tab.
A definitive rejection permits retry. Stale and unknown outcomes require a
read-only refresh before a new action. The lost-response fixture simulates a
committed change whose response was lost.

## Rules and implementation boundaries

- [The Discord evolution command](../../../src/commands/pokemon/evolve.js)
  implements level-based requirements. Every configured evolution currently
  uses a level. Eevee’s seven choices unlock at level 25. The pre-study
  confirmation reloaded ownership and trusted the cached target. The shared
  operation now revalidates the current source and target requirement.
- [Form helpers](../../../src/utils/pokemonUtils.js) derive candidates from
  explicit form groups and price them using the **current** species’ rarity.
  Rotom has five alternatives at 2,500 money each. Rotom-Wash can return to
  Rotom or switch to another configured form for the same cost. Deoxys is
  mentioned in older help copy, but its current base entry has no configured
  form group.
- [The shared transformation helper](../../../src/services/pokemon.js)
  preserves owned identity, nickname, level, nature, IVs, EVs, equipment, held
  item and explicit move overrides. It updates species, default name, stats,
  combat power, rarity, ability slot and battle eligibility. Without an
  explicit override, moves follow the new species. The study calls this helper
  on fixture data with database access blocked.
- Evolution emits [quest progress](../../../src/config/questConfig.js) after
  persistence. [Discord’s evolution-confirm event](../../../src/config/eventConfig.js)
  grants 25 trainer EXP and 200 money, and a successful bound form callback
  receives the [generic Deact grant](../../../src/handlers/eventHandler.js) of
  5 EXP and 10 money. The study models the form debit and leaves trainer grants
  out of its displayed balances. Web uses the same grant for each action.
- The former form path could overwrite broad trainer and Pokémon snapshots and
  refund after an ambiguous write. The shared operation revalidates ownership,
  source species, target and price, scopes writes and reconciles unknown
  outcomes by reading current state. Quest and grant handling follows
  confirmed persistence.

## Implementation

The shared web and Discord operation now uses the configured choices and
transformation helper. The study loads the same upgrade tab stylesheet as
production, applying equal flex sizing to every tab. See the
[local acceptance record](../../verification/evolution-forms-2026-11-13.md)
for integrated verification and remaining limits.

## Study verification

Chrome checked all 13 scenarios in each layout at 1280, 783, 390 and 320 px.
The interactive checks exercised selection without a spend, a free evolution,
paid form changes and returning to base, nickname and move behavior, shortfalls,
loading, pending departure, definitive rejection, stale/unknown refresh,
dialog Escape/focus return, and layout links. Emulated touch confirmed a form
change and an evolution at 320×480 with the button clear of the bottom
navigation. These fixture checks describe the study stage. The implementation record
above covers the integrated checks.
