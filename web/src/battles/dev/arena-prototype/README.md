# Arena field prototype (throwaway)

Question: how can larger Pokémon share one field while name/type, level,
HP/readiness and status/effect cues remain readable?

Run `npm --prefix web run dev`, then open:

`http://127.0.0.1:5173/?previewBattle=1&arenaPrototype=1&story=effects&variant=A`

- **A — Floating HUD:** name/type above level + HP/readiness; status/effect
  counters flank the sprite. Default candidate, matching the proposed hierarchy.
- **B — Ribbon HUD:** status/effects above level + bars; name/type below the
  ground platform. Tests the Epic 7 inspired priority for state information.
- **C — Current cards:** existing presentation for comparison.

Use the floating arrow controls or left/right keys while the page itself is
focused. Scenario selection preserves the variant. Inputs and battle controls
keep their normal keyboard behavior. Switchers, CSS and the grass asset are
reachable only through the existing development-only story entry.

The live battle remains unchanged. This uses the production board, interaction
callbacks, playback queue and renderers, with dev fixtures and CSS experiments.
The logical rectangular rows/columns and responsive facing remain intact.
Visual units contain-fit a 7:10 rectangle into each allocated slot, so
platforms, sprite canvases and spacing keep their proportions. Full names, actual HP/
readiness values, types and effect details remain accessible through the
existing hover/focus inspector. Platform rings carry active/target/area cues,
including affected empty slots. No server writes occur in the stories.

The generated platform has been replaced by `pokemon-grass-base.png`, an
existing transparent Pokémon battle-base asset from the Essentials collection.
`battle-background.webp` is the ArtStation image supplied for this review.
See [asset sources](ASSETS.md). The background uses centered `cover` cropping
under a dim overlay; neither background nor platform is stretched.

The native 256:128 platform canvas retains its alpha margins. Sprite foot
anchors use measured nontransparent bounds of the fixture's original 96×96
PNGs: their visible horizontal centers and feet align to the platform center.
`sprite-anchors.css` applies the same offsets to stationary and moving images,
leaving the source pixels unchanged. Slot container units cap growth on either
axis and leave the other axis padded. HUD text stays readable rather than
scaling below its minimum font sizes. Hover/focus highlights affect both
platform and Pokémon. Bars have 1 px borders and no padded outer frame.

This branch is review material, not a design decision. After a layout is
chosen, rewrite/promote the winning presentation, optimize the platform asset,
consolidate current repeated anchor measurement into an arena geometry module,
and generalize asset anchor metadata in the art pipeline. Preserve the other candidates on this prototype
branch; avoid leaving them in the final production implementation.

## Prototype checks

`browser-checks.json` records 22 browser scenarios: both field variants with
long names and dense formations at 1440, 1024, 768, 390 and 320 px; hover/focus,
AOE/empty-tile highlighting, scenario/variant navigation at desktop and phone
sizes; complete move/damage/faint and status loops at desktop/phone sizes.
No horizontal overflow, labels escaping their slots, page errors or React key
warnings were observed. Native sprite images may intentionally overlap the
slot's spare space. The inspector keeps full values/names accessible.

Production type checking/build pass, and the production main JS/CSS chunks
retain their preceding hashes and sizes. No prototype unit tests were added.
Screenshots are comparison material; selection/approval is pending.

## Floating HUD refinement

`refinement-checks.json` records five viewport layouts (320–1440 px) and four
complete result/status playback loops after feedback. Checked fixed visual-unit,
platform and sprite aspect ratios, foot/center alignment within 0.6 CSS px,
heads clear of the HUD, thin bar borders, square arena corners, center/cover
background, and hover/focus highlights. No overflow or page errors. The phone
arena is 470 px tall, down from 692 px in the original prototype (about 32%).
Mobile review controls were also compacted so they don't consume the recovered
space. These are prototype checks, not user visual approval.
