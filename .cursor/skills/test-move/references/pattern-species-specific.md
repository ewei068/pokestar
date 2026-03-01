# Species-Specific Behavior Test Pattern

Use a setup helper to create battles with specific species, then test each species' unique behavior.

```javascript
const setupMove = (sourceSpeciesId) => {
  const { battle } = createMockBattle({
    autoStart: false,
    team1Party: createMockPokemonParty({ speciesIds: [sourceSpeciesId] }),
    team2Party: createMockPokemonParty({
      speciesIds: [ALWAYS_HITTABLE_SPECIES],
    }),
  });
  const source = battle.parties.Team1.pokemons.find((p) => p !== null);
  source.combatReadiness = 100;
  battle.start();
  givePokemonMove(source, moveIdEnum.MOVE_NAME);
  return { battle, source };
};

it("should do X when used by SpeciesA", () => {
  /* ... */
});
it("should do Y when used by SpeciesB", () => {
  /* ... */
});
```
