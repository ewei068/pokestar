# Tile VFX recipes

The approved baseline is Git commit `1514fedd93deb5119bc60a8981b550940c530f58`.
This extraction preserves the approved rendering. Effects are still in the
review renderer; this does not promote them into live battles.

## Find and edit an effect

Start in `index.ts`. The catalog contains all 18 types × 3 categories and is
checked against `VfxType` and `VfxKind` by TypeScript. It is the renderer's
settings selection seam. Follow the entry to its typed settings object:

| Settings file | Effects |
| --- | --- |
| `quality.ts` | Normal Physical, Fairy Status, pressure circles and outward motes |
| `fire.ts` | Fire Special, column body and foreground embers |
| `focused.ts` | Fighting and Poison, poison cuts/bubbles and aura sparks |
| `nature.ts` | Flying, Bug, Grass |
| `minerals.ts` | Ground, Rock, Steel, Ice |
| `elements.ts` | Fire Physical/Status, Water, Electric; embers/spray/bolts |
| `arcane.ts` | Normal Special/Status, Psychic, Ghost, Dark, Fairy Physical/Special, Dragon; fog |

Settings cover stage start/lifetime/stagger, counts, travel, growth, contact
position, widths, rotation, deformation, fades, and supported material/texture
choices as relevant to each effect. Shared particle profiles live beside the
recipes that use them. `shared.ts` contains common pressure, debris, slash,
opacity, wing, Fire ground-anchor, and tile-playback defaults.

Example: Normal Physical's arcs are in `qualityRecipes.normalPhysical`.
Change `lifetimeMs` for their lifespan; `travel` and `travelJitter` control their
outward displacement; `startSize`, `growth`, and `growthJitter` control growth;
`fadeOutPortion` determines how much of the lifespan is spent fading.
`qualityRecipes.pressureCircles` controls the supporting circles separately.

- Fields ending in `Ms` are milliseconds within the local tile-effect window.
- Distances, radii, widths and sizes are multiples of the tile radius unless a
  field says otherwise. They scale with the board.
- Angles are radians except fields ending in `Degrees`; angular speeds used
  with `ms` are radians per millisecond.
- Values such as `splitStart`, `contactProgress`, or `fadeOutPortion` are fractions
  of that stage's lifetime. `Jitter` values are additional ranges sampled by the
  existing deterministic seed; a base plus jitter is not a min/max tuple.
- Counts are nonnegative integers. Keep complete stages inside the existing
  760 ms playback window; changing the whole window also involves story/session
  scheduling. The configuration does not override that scheduling automatically.

The numeric fields infer `number`, so accidentally supplying text is caught by
TypeScript wherever the renderer uses them. Material and texture choices use
`Part` and `TextureName` unions. The defaults are ordinary TypeScript object
literals; editing them needs no knowledge of canvas drawing.

## Artwork and new behavior

`artwork.ts` is the image-import registry. Swap an import to replace source art,
then keep the artwork's anchor/aspect and asset provenance documented.
Per-effect `*Part` and `*Texture` fields select supported authored ingredients.
Type palettes remain in `battles/vfx/types.ts`.

Choreography formulas, curve construction, silhouette geometry, draw order,
random-seed offsets, and pixel-frame generation remain renderer implementation.
An effect-specific capability (for example a different wave curl or a new
material transition) is implemented there, with useful settings exposed in its
recipe. The extraction keeps existing formulas and arithmetic order intact.

To extend an existing effect, add a descriptive typed setting in the recipe and
consume it in the renderer. Keep stage units explicit. To introduce a new
choreography, define its renderer and settings, and route the relevant effect
through the catalog/dispatch. Per-move custom recipes and an interactive tuning
panel remain follow-ups; they are not implemented by this extraction.

## Verify appearance preservation

`web/scripts/compare-vfx.mjs` draws both versions in the same Chromium process
with the same clock, assets, seeds, background and pixel density. It compares
RGBA pixels directly, every 4 ms plus fractional and endpoint samples, across
six desktop/phone/seed/background/DPR scenarios for every effect. Differences
fail the command and record the first differing pixel per sampled frame.

To repeat it:

1. Create a temporary detached worktree at the baseline commit, and make the
   current web dependencies available there (a `web/node_modules` symlink works).
2. Serve that worktree using
   `node web/scripts/serve-vfx-baseline.mjs <baseline-checkout> 5174`.
   This sets an absolute asset origin; the original rendering source is unchanged.
3. Run the current dev server on port 5173.
4. Run `node web/scripts/compare-vfx.mjs`, with `PLAYWRIGHT_MODULE` set to the
   installed Playwright module path if it is not locally resolvable. Optional
   positional arguments are baseline URL, candidate URL, and report path.
5. Run `npm --prefix web run build` and the existing web tests.

The saved report in `docs/prototypes/vfx-matrix/config-extraction/` records the
comparison coverage and results. These are sampled pixel comparisons, not a
claim that every possible browser/GPU combination was exercised. The pure
settings extraction requires no aesthetic re-review when equality checks pass.
