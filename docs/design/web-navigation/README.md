# Web navigation study

**Current decision · 2026-10-30:** Dusk Arcade / Jewel is the working visual
language. Main tabs are Play, Pokémon, Catch, Rewards, More; Bag is a header
icon and Settings a cog. See the [maintained UI guide](../../web-ui-style-guide.md).
Use `refined.html?variant=jewel` and [the saved reference](jewel-reference.jpg).
Earlier variants and fourth-tab switching below are retained as design history,
not open navigation decisions. Keep these editable sources through the first
implementation slice; reassess retention after production components replace them.

Navigation and overall visual direction for #237; individual screens are sketches.
This standalone fixture never calls the API or saves trainer data. It does not
establish acceptance for operations, onboarding or rewards.

Run from the repository root:

```sh
python3 -m http.server 8129 --bind 127.0.0.1 --directory docs/design/web-navigation
```

Open http://127.0.0.1:8129/. Review controls select screens, fixture states and the
fourth main tab. They are outside the proposed product UI.

## Direction from the 2026-10-29 review

- Default to Play; no Home. Catch replaces Summon in navigation.
- Main navigation: Play, Pokémon, Catch, Rewards **or** Bag, More.
- Keep the desktop sidebar and phone bottom bar, plus the top resource bar.
- Put Settings behind a cog. Put whichever of Rewards/Bag is not a main tab
  beside the trainer resources as an icon with an accessible name.
- Explore a single Rewards screen with Daily, Quests, Achievements, Tutorial
  and Level rewards sections. The fourth-tab control compares both placements;
  this historical choice was settled in favor of Rewards on 2026-10-30.
- Use the battle screen as the visual reference: paper panels, dark ink,
  square edges, offset shadows, warm accents and Pokémon scenery/sprites.
  Follow the [general UI and copy guide](../../web-ui-style-guide.md).

The initial study copied the older navy shell and added generic explanatory
copy. This revision was compared with the rendered production `dense` battle
story. The scenery is a local copy of the existing arena background; sprites
use the existing external PokeAPI sprite source and can fall back when missing.

## Verification and remaining scope

Checked JS syntax, all review-screen routes, both fourth-tab placements,
Rewards → Tutorial, and the cog → Settings route. Visually reviewed Play at
1280px, Rewards at 390px and collection at 320px. All selectable screens rendered
without horizontal overflow at 320px in the ready state.

The fixture actions and alternate states are illustrative, not a validated
end-to-end game. Continue opens a saved-result sketch rather than combat. Reward
amounts/objectives, acquisition, lesson credit and writes remain examples.
Review the revised direction with the maintainer before refining individual
screens or implementing navigation. No release issue is closed by this study.

## Visual alternatives · 2026-10-30

Open `directions.html` for three Play-page treatments using the same content:

- **A — Field journal:** subtle paper texture, double-line borders, small stamped
  details and illustrated encounter rows. Closest to the current direction.
- **B — League console:** inset frames, muted enamel colors and tactile controls;
  a moderate handheld-menu influence with readable web typography.
- **C — Dusk arcade:** scenery extends through the shell, with colorful mode cards
  and striped controls. Deliberately the stronger comparison endpoint.

The supplied fan-game references informed framing, texture, artwork placement
and control emphasis; their game rules and screen copy were not adopted.
Themes are selected with buttons or `?theme=journal`, `?theme=console` and
`?theme=arcade`. This is a separate single-page comparison; the navigation study
and accepted UI guide have not been replaced. Destination buttons show a study
boundary dialog linking to the corresponding navigation sketch.

All three themes were visually inspected on desktop; phone layout and 320px
horizontal overflow were checked. Theme selection, a destination dialog and
keyboard dismissal were exercised. These are design alternatives awaiting user
feedback, not production-ready screens or an approved visual direction.

## Dusk variants · second round

The maintainer preferred Dusk Arcade and requested more creative deviations.
`dusk.html` preserves that original alongside three further Play-page sketches:

- **Neon arena:** citrus/cyan accents, angular frames, bold encounter cards.
- **Ember expedition:** copper framing, warm scenery and illustrated mode tiles.
- **Moonlit journey:** an open landscape, floating party labels, a separate
  Continue panel and a compact formation strip. The largest composition change.

Select with the comparison buttons or `?variant=original`, `?variant=neon`,
`?variant=ember`, `?variant=moon`. These reuse the same fixture content and
navigation. They do not change the approved UI guide or production screens.
All three new variants were visually inspected at 1280px; Moonlit was also
visually inspected at 390px. All four options fit at 320px without horizontal
overflow. The Continue preview dialog was exercised. Visual selection remains
open for maintainer feedback.

## Original Dusk refinements

The maintainer still preferred original Dusk, requested more visible scenery,
and questioned the heavy typography and muted theme-like palette.
`refined.html` keeps the original composition and provides an unchanged reference
plus two options sharing lighter Trebuchet lettering and a more visible backdrop:

- **Clear colors:** blue/green/red encounters, gold Continue, dark green-neutral panels.
- **Jewel colors:** sapphire/jade/amethyst encounters, gold Continue, plum-neutral panels.

Use `?variant=original`, `?variant=clear` or `?variant=jewel`. The colors identify
encounter choices rather than reward rarity or battle state. This is exploratory;
none of these refinements replaces the production UI or the maintained guide.
