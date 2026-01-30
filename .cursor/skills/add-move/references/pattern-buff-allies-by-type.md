# Buff Allies Based on Type Pattern

Applies buffs to allies that share a specific type.

```javascript
execute() {
  const { source } = this;
  const allies = source.getPartyPokemon().filter(p =>
    p && !p.isFainted && p.hasType(pokemonTypes.FIRE)
  );

  for (const ally of allies) {
    ally.applyEffect("atkUp", 3, source, {});
  }
}
```

