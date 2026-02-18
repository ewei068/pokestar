declare namespace jest {
  interface Matchers<R> {
    /** Asserts that a BattlePokemon has taken damage (hp < maxHp) */
    toBeDamaged(): R;
  }
}
