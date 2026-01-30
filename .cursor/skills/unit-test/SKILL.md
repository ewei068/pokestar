---
name: unit-test
description: Create and run Jest unit tests. Use when implementing tests or validating changes.
---

# Unit Testing in Pokestar

## Quick Reference

**Test location:** `src/<module>/__tests__/<name>.test.js`

**Run all tests:**

```bash
npm test
```

**Run specific test file:**

```bash
npm test -- src/battle/data/__tests__/moves.test.js
```

**Run tests matching a pattern:**

```bash
npm test -- --testNamePattern="move.*execute"
```

## Test Setup

Tests use the setup file at `src/__testing__/setup.js` which:

1. Mocks the database via `src/__testing__/mocks/database.js`
2. Initializes battle data via `initialize()`

If new setup should be added for all tests, add them in this file.

## Available Mocks

Mocks for tests are located in `src/__testing__/mocks`. Use these utilites to create mock data for testing. If new mocks are needed, create those mocks in this directory.

## Available Utilities

Test utilities are located in `src/__testing__/utils`. Use these utilities when invoking commonly-reused testing functionality. If a new common test pattern should be utilized, create new utils for it here.

## Test Structure

```javascript
const { createMockBattle } = require("../../../__testing__/mocks/battle");
const {
  getValidTargetForMove,
  givePokemonMove,
} = require("../../../__testing__/utils/battle");

describe("Feature Name", () => {
  it("should do something", () => {
    const { battle } = createMockBattle({ autoStart: true });

    // Arrange
    const { activePokemon } = battle;

    // Act
    // ... perform action

    // Assert
    expect(result).toBe(expected);
  });
});
```

## Running After Implementation

After implementing a feature that has tests, run the relevant test suite:

```bash
npm test -- <path-to-test-file>
```

If tests fail:

1. Read the error message to understand what failed
2. Fix the implementation (not the test, unless the test is wrong)
3. Re-run the tests
4. Repeat until all tests pass

## References

- `references/pattern-moves-e2e.md` - Testing all moves execute without error
