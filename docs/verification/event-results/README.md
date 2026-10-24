# Event result playback verification

- `npm --prefix web test`: 34 tests passed, covering progression, immutable
  observations, canonical action boundaries, player/NPC revisions delivered
  together, overlapping responses, stale completions, narration timing,
  reduced-motion durations and user-facing controls.
- `npm test -- --runInBand src/battle/engine/__tests__/BattleActions.test.js src/battle/service/__tests__/BattleWebService.test.js src/battle/persistence/__tests__/BattleStore.test.js`:
  26 tests passed, including weather set/refresh/clear observations and actual
  clamped readiness changes, plus existing persistence/projection behavior.
- `npm --prefix web run build`: passed.
- `browser-stories.json`: all 11 result stories at 1280 px and 390 px. Checked
  full playback, clean completion, no horizontal overflow or page errors.
  Damage checks measure anchor alignment and actual intermediate HP bar widths.
  The sequence asserts full HP through move VFX and damage text, zero HP without
  fainting during the drain, then faint narration and the next canonical turn.
  Reduced-motion and skip checks settle without residual actors, labels or VFX.
- `browser-http.json`: mocked HTTP through the real application and session;
  two revisions (player and NPC) in one response retain their individual views.
  Covers delayed artwork, enabling motion after an initially reduced-motion
  session, reached-only narration, reopening without replay and visibility
  interruption cleanup. No authenticated production-server battle was run.

The adjacent captures show text at desktop/phone scale. Review via
`?previewBattle=1&story=result-sequence`; use the Event results story group for
individual effects. These are implementation evidence, not user approval of
new result presentation. Existing move art and recipes were not modified.
