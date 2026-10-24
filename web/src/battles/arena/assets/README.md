# Arena asset sources

These images belong to the arena feature and are imported from its CSS. Vite
includes referenced assets in its build graph, assigns hashed URLs and rewrites
the hosting base path. An imported file under repository `media/` would receive
the same treatment; this location keeps the two arena sources beside their owner.
`web/public/` instead copies files verbatim with stable names, as needed by the
runtime audio catalogs. See [Vite's asset guide](https://vite.dev/guide/assets.html).

## Grass base

- File: `grass-base.png`, copied unchanged; RGBA PNG, 256×128.
- Source: [Pokémon Godot Essentials battlebacks](https://github.com/Kurokamori/Pokemon-Godot-Essentials/blob/2a0ee58989b5f3f948c6532edd51b75e0f69a36e/assets/graphics/battlebacks/grass_base1.png).
- This is the pre-existing Pokémon grass-base image distributed with the
  Essentials asset collection, retrieved from a community mirror. The mirror
  is the provenance source used here; it is not a Nintendo download endpoint.
- Nontransparent bounds: x=2…253, y=32…95. Preserve the complete 2:1 source canvas;
  the visible oval is approximately 4:1. No resizing, palette changes or art
  generation was applied to the source file.

## Background

- File: `battle-background.webp`, copied unchanged; 1920×1179.
- [Image supplied by the user, hosted on ArtStation](https://cdnb.artstation.com/p/assets/images/images/097/422/235/large/yuki-pixels-1new-background-battle.webp?1774136396).
- Displayed with `background-size: cover` and `background-position: center`.
  A separate CSS overlay dims the image; the stored image is unchanged.

## Pokémon

Pokémon artwork comes from the existing display catalog; these files do not
replace it. `arena/spriteLayout.ts` reads each image's alpha bounds once in the
browser and caches proportional placement by URL. The unchanged image is
positioned with CSS translation; stationary and moving copies share the same
placement. Non-square images use contain padding. Remote CORS/decode failures
retain the normal centered image; failed image loads show a question mark.

The sprite's visible center is placed at 50% and its feet at 87% of the square
container. The container is 82% of the visual unit width, positioned so that
its foot line meets the grass platform center. See the arena design guide for
layout rules. No fixture-specific offsets or generated replacements ship.
