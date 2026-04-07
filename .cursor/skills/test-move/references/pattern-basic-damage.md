# Basic Damage + Effect Test Pattern

```javascript
describe("Move Name", () => {
  let battle;
  let source;

  beforeEach(() => {
    ({ battle } = createMockBattle({ autoStart: true }));
    source = battle.activePokemon;
    givePokemonMove(source, moveIdEnum.MOVE_NAME);
  });

  it("should deal damage", () => {
    const target = useMoveOnValidTarget(battle, source, moveIdEnum.MOVE_NAME);
    expect(target).toBeDamaged();
  });
});
```
