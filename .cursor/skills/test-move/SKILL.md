---
name: test-move
description: Write unit tests for battle moves. Use when a move has complex or unique logic that warrants testing.
---

# Testing Moves in Pokestar

Move tests live in `src/battle/data/__tests__/moves.test.js`.

## When to Test Moves

Only test moves with complex or unique logic. Do NOT test simple moves that just call generic methods like `genericDealAllDamage` or `genericApplyAllEffects`.

DO test moves with conditional branches, multi-step flows, species-specific behavior, charge mechanics, non-standard damage calculations, or item/effect manipulation.

## Running Tests

```bash
npm test -- src/battle/data/__tests__/moves.test.js
```

The file includes an e2e test that verifies all moves can execute without errors. If a new move causes a test failure, fix the implementation and re-run until tests pass.

## Common Constants

```javascript
const ALWAYS_HITTABLE_SPECIES = pokemonIdEnum.ARCEUS_FIGHTING;
const BURNABLE_SPECIES = pokemonIdEnum.BULBASAUR;
const VERY_HIGH_HP = 99999;
```

Use `ALWAYS_HITTABLE_SPECIES` when accuracy matters, `BURNABLE_SPECIES` for status tests on non-Fire types, and `VERY_HIGH_HP` when you need the target to survive to measure exact damage.

**When creating a test using a frequently-used constant, make it a common constant and refactor other tests to use that constant.** Also, update this documentation with that constant.

## References

- `references/pattern-basic-damage.md` - Basic damage + effect test setup
- `references/pattern-probabilistic.md` - Probabilistic status/effect test generators
- `references/pattern-charge-move.md` - Charge/two-turn move tests
- `references/pattern-species-specific.md` - Species-specific behavior tests
- `references/pattern-damage-comparison.md` - Comparing damage between conditions via clone
- `references/pattern-spy.md` - Spying on method calls
- `references/pattern-battle-event.md` - Listening for battle events
