# Miss, status and effect result verification

- `npm --prefix web test`: **44 tests pass**. Covers status replacement, effect
  gain/loss identity, no reaction on duration ticks, inverse removal direction,
  all six engine status mappings, preceding view retention, and removal of
  both reaction renderers when playback completes.
- `npm --prefix web run build`: passed. The existing upstream Virtua PURE-comment
  warnings remain non-fatal; main JS is approximately 68.2 KB gzip.
- `browser.json`: 13 stories at desktop (1280) and phone (390) widths, **26 full
  loops**, plus six rechecks after widening/staggering effect chevrons. Every
  changed status mapping and effect direction was reviewed through early, peak
  and late frames at actual tile size. Representative peak captures are beside
  this document; they supplement the running stories rather than replace them.
- Confirms in-place Status recipe canvases with visible pixels and no actor
  motion; miss sidesteps; reversed buff/debuff removal cues; concurrent batches;
  canonical reconciliation; settled cleanup; no horizontal overflow or page
  errors. The effect rechecks also captured React console warnings (none).
- Reduced motion suppresses all canvas/particle work. Skip removes the overlays.
  A deliberately delayed renderer import held the preceding state, empty log
  and absent labels until status artwork settled, then began text/state/VFX
  together. No authenticated live-server battle was executed.

Review with `?previewBattle=1&story=` followed by `result-miss`,
`result-status-burn`, `result-status-paralysis`, `result-status-freeze`,
`result-status-poison`, `result-status-toxic`, `result-status-sleep`,
`result-effect-buff`, `result-effect-debuff`, `result-effect-neutral`,
`result-reaction-reconcile`, `result-batch-effects`, or `result-batch-misses`.

## Deliberate behavior

Status application maps Burn/Freeze/Paralysis/Poison/Badly Poison/Sleep to
Fire/Ice/Electric/Poison/Poison/Psychic Status move recipes, without approach or
return. Unknown status IDs use Normal. Cures get a clearing ring. Existing move
recipes and the default move approach delay remain unchanged.

Effect direction represents the consequence: Buff gain and Debuff removal rise
red; Debuff gain and Buff removal fall blue. Neutral effects pulse gold.
Duration refreshes do not replay identity-based gain/loss effects. Repeated
same-ID application still updates text and badges through existing playback.

Screenshots and checks are implementation evidence; user visual approval is
still separate. No new art assets or server contracts were introduced.
