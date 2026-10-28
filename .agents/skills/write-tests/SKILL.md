---
name: write-tests
description: Write and run Jest tests in Pokestar, including behavior tests for moves, abilities, effects, and held items. Use when adding tests, deciding whether new battle data needs a test, or reusing the shared mocks, battle utilities, and custom matchers.
---

# Backend Jest tests

This skill covers backend JavaScript. Browser tests in `web/` use the client
runner (`npm test --prefix web`); `npm run build --prefix web` also checks client
TypeScript. Follow `web/AGENTS.md` for browser verification scenarios. Backend
database mocks do not establish real MongoDB or cross-surface acceptance.

Tests live in `src/<module>/__tests__/<name>.test.js`. `src/__testing__/setup.js` runs before every suite: it mocks the database (`src/__testing__/mocks/database.js`), initializes battle data, and registers the custom matchers. Setup every suite needs belongs there.

Run one file with `npm test -- <path>`, a subset with `npm test -- -t "<name pattern>"`, everything with `npm test`. When a test fails, fix the implementation; change the test only when the test itself is wrong.

## When battle data needs a behavior test

Each of `moves.test.js`, `abilities.test.js`, `effects.test.js`, and `heldItems.test.js` starts with an e2e suite that runs every registered entry. That catches crashes, not wrong damage, targets, or side effects.

Write at least one behavior test for new battle data unless its implementation is a single generic call with nothing around it, such as `execute() { this.genericDealAllDamage(); }`. Any of these means a test is needed:

- Conditionals, loops, or more than one step in `execute()`, `abilityAdd`, `effectAdd`, or `itemAdd`
- Custom damage calculation (`calculateDamageFunction`, `attackOverride`, multipliers)
- Direct `BattlePokemon` calls (`applyEffect`, `dispellEffect`, `dealDamage`, `giveHeal`, `boostCombatReadiness`, and so on)
- Charge or multi-turn behavior, `overrideFields`, or species- and form-specific branches
- Item or effect manipulation (stealing, swapping, dispelling)
- A probabilistic secondary effect

One focused test on the distinctive behavior is the bar. Add move tests to `moves.test.js`, and ability, effect, or held-item tests as a new `describe` block in the matching file.

## Shared infrastructure

Mocks in `src/__testing__/mocks/`: `createMockBattle({ team1Party, team2Party, autoStart })`, `createMockPokemon`, `createMockPokemonParty({ speciesIds })`, `createMockTrainer`.

Battle utilities in `src/__testing__/utils/battle.js`:

- `HIGH_ACCURACY`: set `source.acc = HIGH_ACCURACY` to guarantee hits
- `givePokemonMove(pokemon, moveId)`: give a move with zero cooldown
- `getValidTargetForMove(battle, source, moveId)` and `useMoveOnValidTarget(battle, source, moveId)`
- `describeStatusProbability({ statusId, probability, setup })` and `describeEffectProbability({ effectId, probability, setup })`: generate tests that pin a secondary-effect chance

Matchers registered in `setup.js`: `toBeDamaged()`, `toBeDamagedBy(amount)`, `toHaveEffect(effectId)`, `toBeShielded()`, `toHaveHeldItem(heldItemId?)`, plus the asymmetric `expect.toBeGreaterThan(n)`, `expect.toBeGreaterThanOrEqual(n)`, `expect.toBeLessThan(n)`, and `expect.toBeLessThanOrEqual(n)` for use inside `toBeDamagedBy`.

Constants at the top of `moves.test.js`: `ALWAYS_HITTABLE_SPECIES` when accuracy matters, `BURNABLE_SPECIES` for status tests, `VERY_HIGH_HP` when the target must survive so damage can be measured exactly.

When a setup step or assertion repeats across tests, promote it to a utility, matcher, or constant in the same change and add it to this list.

## Examples in `moves.test.js`

| Pattern                                       | Copy from                         |
| --------------------------------------------- | --------------------------------- |
| Damage plus probabilistic status or effect    | `Fire Punch`, `Confusion`         |
| Recoil to the user                            | `Wood Hammer`                     |
| Compare damage across conditions with a clone | `Facade` (`battle.cloneAndReset`) |
| Charge turn, then strike turn                 | `Solar Blade`, `Shadow Force`     |
| Species- or form-specific behavior            | `Mystical Power`, `Roar of Time`  |
| Count hits or calls with `jest.spyOn`         | `Triple Axel`, `Tri Attack`       |
| Observe a battle event during the move        | `Flame Ball`                      |
| Held item swaps                               | `Switcheroo`                      |
| Healing and shields                           | `Heal Order`, `Defend Order`      |
