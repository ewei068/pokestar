# Evolution & forms local acceptance

The [approved study](../design/evolution-forms/README.md) is implemented for J21
and J22 in [#205](https://github.com/ewei068/pokestar/issues/205). The inspected
Pokémon workspace contains a shared Evolution & forms tab with a desktop list
and preview, a phone picker, and explicit confirmation. The preview shows
the transformed build and, for paid forms, the current trainer balance.

## Observed checks

- Backend Jest passed 1,077 tests in 49 suites. Web passed 245 tests.
  Root and `/pokestar/` production bundles built. Backend lint reported no
  errors and four existing JSDoc warnings. Backend checkJs retains 473
  diagnostics, two fewer than the equipment base and no additions after
  normalizing source positions.
- Disposable standalone MongoDB and authenticated HTTP verified read-only
  previews, actor and origin checks, foreign ownership, level and money
  requirements, custom name and move preservation, cost and grants, evolution
  quest progress, and two concurrent confirmations against one observed
  source. A local Discord interaction harness verified that a superseded
  evolution button cannot submit the newly selected target.
- Fault injection changed the Pokémon and money after debit. The conditional
  Pokémon write missed and restored the quoted cost while preserving the
  concurrent balance change. A lost Pokémon write response produced an
  unknown outcome, and a read exposed the saved form and debit. A lost
  debit response left the debit with the original Pokémon.
- Chrome exercised the production bundle with desktop mouse and emulated
  phone touch. Evolution survived reload. A form response lost after save
  showed recovery feedback in view at 320×480 and refreshed without another
  charge. A form request settled once after switching to Equipment and
  returning. A focused client regression reproduces the case where a
  finishing Train request canceled the first read in the new tab.
- In the original study, Train measured 36.6 px across 320, 390 and 600 px
  viewports because its grid column was `auto`. Other columns grew. Study
  and production now use [one stylesheet](../../web/src/upgrades/upgrade-tabs.css)
  with equal flex sizing applied to every tab and no column count. Chrome
  measured all four tabs at the same width within each of five tested
  viewports from 320 to 1280 px.

## Known limits

The guarded writes use the existing standalone MongoDB reliability scope.
A form debit and its Pokémon update are separate writes. A process failure or
lost debit result can leave only the debit. A refresh shows persisted state
and never automatically retries or refunds an ambiguous write. The retained
legacy broad writers do not all participate in the new guard. The server
revalidates current ownership and confirmation terms at the mutation boundary.

Evolution preserves raw EXP as before. Poochyena → Mightyena and Happiny →
Chansey can show out-of-range progress against their new growth curves. Growth
curve normalization would change game progression and was outside this work.

The disposable services and data were removed. Checks used a local session
fixture and emulated touch. Live Discord, OAuth, and production deployment
remain unverified.
