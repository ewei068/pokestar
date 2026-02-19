declare namespace jest {
  interface Matchers<R> {
    /** Asserts that a BattlePokemon has taken damage (hp < maxHp) */
    toBeDamaged(): R;
    /** Asserts that a BattlePokemon has taken a specific amount of damage (maxHp - hp). Supports asymmetric matchers. */
    toBeDamagedBy(amount: number | AsymmetricMatcher): R;
  }

  interface Expect {
    toBeGreaterThanOrEqual(expected: number): AsymmetricMatcher;
  }
}
