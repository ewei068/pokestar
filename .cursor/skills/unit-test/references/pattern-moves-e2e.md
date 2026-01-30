# Pattern: Moves E2E Test

Tests that all moves in the registry can execute on a valid target without throwing errors.

## Implementation

```javascript
const { getMoveIds, getMove } = require("../moveRegistry");
const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  getValidTargetForMove,
  givePokemonMove,
} = require("../../../__testing__/utils/battle");

describe("All Moves e2e", () => {
  const getTestCases = () =>
    getMoveIds({}).map((moveId) => [moveId, getMove(moveId).name]);

  it.each(getTestCases())(
    "move %s (%s) can execute on a valid target without error",
    (moveId, _moveName) => {
      const { battle } = createMockBattle({ autoStart: true });

      const { activePokemon } = battle;
      expect(activePokemon).not.toBeNull();

      givePokemonMove(activePokemon, moveId);

      const target = getValidTargetForMove(battle, activePokemon, moveId);
      expect(target).not.toBeNull();

      expect(() => {
        activePokemon.useMove(moveId, target.id);
      }).not.toThrow();
    },
  );
});
```

## How It Works

1. `getMoveIds({})` retrieves all registered move IDs
2. `it.each()` creates a test case for each move
3. Each test creates a fresh battle, gives the active Pokemon the move, and attempts to use it
4. If any move throws an error during execution, that specific test fails

## Running

```bash
npm test -- src/battle/data/__tests__/moves.test.js
```

## When a Test Fails

The test output will show which move ID failed:

```
✕ move MOVE_NAME (Move Display Name) can execute on a valid target without error
```

Fix the move implementation in `src/battle/data/moves.js` and re-run.
