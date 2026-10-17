# Arena prototype asset sources

## Grass base

- File: `pokemon-grass-base.png`, copied unchanged; RGBA PNG, 256×128.
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

The story fixtures already use [PokeAPI sprites](https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon).
For the twelve fixture species, `sprite-anchors.css` records the measured
nontransparent bounds as layout offsets. Visible horizontal centers are placed
at 50% and feet at 87% of the square sprite canvas. The sprite canvas is 82% of
the visual unit's width; its foot line meets the native grass base's center.
Offsets are identical for stationary images and the moving actor copy. Future
production asset processing should store this anchor metadata with each sprite
rather than retaining fixture-specific CSS rules.
