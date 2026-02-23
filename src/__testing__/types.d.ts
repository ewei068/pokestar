declare namespace jest {
  interface Matchers<R> {
    /** Asserts that a BattlePokemon has taken damage (hp < maxHp) */
    toBeDamaged(): R;
    /** Asserts that a BattlePokemon has taken a specific amount of damage (maxHp - hp). Supports asymmetric matchers. */
    toBeDamagedBy(amount: number | AsymmetricMatcher): R;
    /** Asserts that a BattlePokemon has a specific effect active */
    toHaveEffect(effectId: EffectIdEnum): R;
    /** Asserts that a BattlePokemon has an active shield effect with shield > 0 */
    toBeShielded(): R;
    /** Asserts that a BattlePokemon has a specific held item, or any held item if no argument is provided */
    toHaveHeldItem(heldItemId?: HeldItemIdEnum): R;
  }

  interface Expect {
    toBeGreaterThanOrEqual(expected: number): AsymmetricMatcher;
    toBeGreaterThan(expected: number): AsymmetricMatcher;
    toBeLessThanOrEqual(expected: number): AsymmetricMatcher;
    toBeLessThan(expected: number): AsymmetricMatcher;
  }
}
