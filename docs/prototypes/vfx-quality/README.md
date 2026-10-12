# Normal Physical and Fairy Status quality studies

Question: can small textures plus timed canvas layers make two very different
tile effects clearer and richer than the current SVG matrix?

These are throwaway development stories on the existing VFX lab. Run
`cd web && npm run dev`, then open the links below. The floating arrows or the
left/right keys compare the existing SVG with each study's alternatives.
The `pattern` control lets every variant run on one tile or a larger footprint,
including empty tiles.

| Study | Review URL | Variants |
| --- | --- | --- |
| Normal Physical | `?previewBattle=1&story=vfx&type=normal&kind=physical&pattern=all&variant=impact` | Current SVG, impact arcs, pixel geometry, clean crescents, generated pixel sprite, crossing strikes, pressure rings |
| Fairy Status | `?previewBattle=1&story=vfx&type=fairy&kind=status&pattern=all&variant=halo` | Current SVG, mote halo, gathering spiral, ribbon veil |

## Captures

| Normal Physical | Still at about 650 ms |
| --- | --- |
| Current SVG | ![Normal SVG](normal-physical-original.png) |
| Impact arcs | ![Impact arcs](normal-physical-impact.png) |
| Pixel geometry | ![Pixel geometry](normal-physical-pixel.png) |
| Clean crescents | ![Clean crescents](normal-physical-graphic.png) |
| Generated pixel sprite | ![Generated pixel sprite](normal-physical-sprite.png) |
| Crossing strikes | ![Crossing strikes](normal-physical-cross.png) |
| Pressure rings | ![Pressure rings](normal-physical-ripple.png) |

![Normal impact motion](normal-impact-motion.gif)

| Fairy Status | Still at about 650 ms |
| --- | --- |
| Current SVG | ![Fairy SVG](fairy-status-original.png) |
| Mote halo | ![Mote halo](fairy-status-halo.png) |
| Gathering spiral | ![Gathering spiral](fairy-status-spiral.png) |
| Ribbon veil | ![Ribbon veil](fairy-status-veil.png) |

![Fairy spiral motion](fairy-spiral-motion.gif)

The Normal impact variant now draws two staggered pulses, each with two or three
partial jagged arcs spanning 60–120 degrees. Radius, rotation, timing, and arc
shape vary by tile seed. The older crossing and ripple variants still use the
independently generated streak at `media/vfx/experiments/normal-impact-streak.png`.

The three newer Normal variants isolate different approaches to removing the
hand-drawn feel. **Pixel geometry** draws three clean arcs on a 24-pixel canvas
and scales it without smoothing. **Clean crescents** uses smooth, even-width
canvas arcs and a faint inner pressure ring. **Generated pixel sprite** uses an
original transparent shock-ring image downsampled to 64 pixels; the canvas
changes its timing, size, and rotation per tile. The source prompt asked for
three disconnected, chunky ivory-gray pixel crescents with a hollow center,
few fragments, no glow, and no fine spikes; the user's impact reference was
used only for composition. The resulting project asset is
`media/vfx/experiments/normal-impact-pixel-generated.png`. These alternatives
share the same two-pulse window to make visual comparison easier.

Fairy uses the existing higher-detail center mote at
`media/vfx/experiments/fairy-status-mote.png` plus two new low-resolution,
32-pixel glint and pearl sprites (`fairy-status-glint-small.png` and
`fairy-status-pearl-small.png`). Different small sprites emit outward at staggered
times through most of the VFX interval; the main mote appears occasionally as
an accent. Canvas timing, arcs, rings, ribbons, positioning, and per-tile seeded
variation are code-driven. The stories remain outside the production build.

As a choreography reference, [Pokémon Showdown's move table](https://github.com/smogon/pokemon-showdown-client/blob/master/play.pokemonshowdown.com/src/battle-animations-moves.ts)
uses two staggered expanding impact images for Giga Impact, reuses that sequence
for Double-Edge, and combines actor motion with two target-side wisps for Body
Slam. These studies use their own art and geometry.

The Normal study tests whether a short, sharp pulse reads as physical without
comic-book symbols. The Fairy study tests whether the status effect reads as
magical without implying damage or a specific buff. These are questions for
review, not final art decisions. The selected behaviors should later be
rewritten into the production renderer with a shared actor/VFX clock. The
animation guidance document comes after these studies are reviewed.
