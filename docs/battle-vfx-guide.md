# Battle VFX creation guide

Status: working guidance, 2026-10-12. Use this when creating or promoting a tile
effect. The [web UI style guide](web-ui-style-guide.md) governs the surrounding
battle screen; the [VFX matrix](battle-vfx-matrix.md) records the first-pass
motifs for all type/category combinations. This guide records the animation
decisions learned from the Fire, Normal, Fairy, Fighting, Poison, and full
matrix studies.

## What an effect communicates

The server's accepted combat event supplies the action and its resolved tile
footprint. Animate **every tile in that footprint**, including empty tiles.
The move's category controls the actor's travel, independently of its type:
Physical approaches the primary target; Special and Status move into the
target's lane; a self-targeting move leaves the actor in place. The sequence is
actor approach → tile VFX → actor return → result effects. Damage numbers,
faints, status changes, and sound are a later pass.

Resolve art in this order: a move-specific animation, when one exists; the
move's type and Physical/Special/Status template; then Normal for unknown,
Shadow, Stellar, or future types. The effect uses event data rather than
calculating targets or damage in the browser. A missing or stale event can
still render the authoritative state without animation.

## Current visual direction

| Combination | Review status | What to preserve |
| --- | --- | --- |
| Normal Physical | **Approved:** [generated pixel impact sprite over dense pressure circles](prototypes/vfx-quality/normal-sprite-rings-motion.gif) | Two short pulses; a compact hollow impact silhouette; three expanding circles behind it. [Circles alone](prototypes/vfx-quality/normal-physical-ripple.png) remain the simpler fallback if the sprite feels busy on dense boards. |
| Fire Special | **Second-pass candidate:** [rising column with one dominant tailed ember](prototypes/fire-vfx/fire-column-motion.gif) | The October 12 review approved the direction and requested a smaller center flame with bottom-up embers. Draw the small embers **after** the main ember so they cross its face in the foreground; vary their birth, path, and sprite. |
| Fairy Status | **Approved:** [soft halo and staggered motes](prototypes/vfx-quality/fairy-status-halo.png) | Small, simple glints and pearls emit outward at different times; occasional larger accents give detail without making every tiny particle ornate. |

These are **development studies**, not production renderers. A [first-pass
matrix](prototypes/vfx-matrix/README.md) now covers all 54 standard
type/category combinations. The [Poison and Fighting second pass](prototypes/vfx-matrix/second-pass.md)
replaces six of the first-pass candidates; the
[third pass](prototypes/vfx-matrix/third-pass.md) responds to feedback on five
of those effects with simpler pixel motifs and different motion. The
[fourth pass](prototypes/vfx-matrix/fourth-pass.md) refines their scale, cuts,
and motion. Reuse the principles below, then
review each revised effect on the battle board before choosing its final
treatment.

## Matrix quality bar

Give every combination a **visual subject and a verb**, not merely the type's
icon with a different particle speed. Physical effects should show contact,
weight, cuts, or a strike. Special effects should show a projected force or
environmental change with a beginning, a peak, and a release. Status effects
should show a field, ward, bind, or other lasting influence without borrowing
the Special effect's impact beat. A type can share its palette and a few small
marks across categories, but its three silhouettes and motion paths must be
recognizable separately at the actual tile size.

Build the focal shape first, then supporting motion. Use a deliberate 16–32 px
grid for an icon-like focal sprite, or clean geometric curves when a wave,
shield, gust, or ring needs smooth motion. Keep the focal shape bolder and more
detailed than small particles. A static sprite that only translates and fades
is insufficient for a large focal element: change its shape, frame, scale,
pose, or reveal over time. Use generated art when the effect benefits from
painted detail, but inspect it at battle scale; realistic texture downscaled
into pixel art has repeatedly looked pasted on.

Put a visible start, peak, and release within the tile's 760 ms window. A
typical study spends roughly 0–180 ms on entry, 180–450 ms at peak/contact,
and 450–760 ms dispersing, though the silhouette determines exact timing.
Layer from back to front: atmosphere/field, main subject, then sparks, debris,
or glints. Use force rings only when they express a shock, stomp, punch, roar,
or similar pressure; they should not be the default background for every
effect. A slash should taper to sharp ends, falling matter should land or
bounce, and particles should originate where the visible contact happens.

Preserve approved cells while expanding the matrix. Treat new cells as review
candidates and keep them isolated from production playback. In the review
grid, show the latest animated candidate and carry forward feedback only for
unchanged cells. Reset the mark for every revised cell so an earlier approval
does not silently certify a different animation.

## Build one tile effect

1. **Brief the silhouette.** Name the type and category, the feeling on a
   single tile, the main visual anchor, and the supporting shapes. Decide how
   the effect reads over both an occupied card and an empty striped tile.
   Finish this step when a still image at actual tile size is recognizable.
2. **Author a few transparent textures.** Use generated or painted art for
   details that benefit from it: a flame, impact, mote, shard, or trail. Give
   the largest element most of the detail. Make small particles simpler and
   lower resolution. Trim transparent margins, clean stray pixels and rough
   edges, and inspect the asset against the battle's light backgrounds. Keep
   the final asset in `media/vfx/` with its source prompt or art brief in the
   study notes. A generated still supplies art; it does not supply motion.
3. **Choreograph on one shared clock.** Give each layer a birth time, lifetime,
   path, scale, rotation, and fade. A restrained main element plus staggered
   supporting elements reads better than moving one static image as a block.
   Draw background glow and rings first, the main texture next, and foreground
   sparks last when they should visibly pass over the anchor.
   Keep the VFX inside the actor's effect window. Production timing must come
   from the same playback clock as actor travel, not a copied millisecond
   offset from a CSS animation.
4. **Vary each tile reproducibly.** Seed the action from a stable event identity
   and derive child seeds from the tile's stable team/position and each
   particle's index. Vary birth, angle, radius, sprite choice, size, and a
   small amount of rotation. Keep the dominant silhouette consistent. Replaying
   one event should reproduce it; different affected tiles should differ.
5. **Review motion in context.** Use the development VFX lab for single-target
   and multi-tile patterns, including empty tiles. Capture early, peak, and
   late frames and one full loop. Check desktop, a typical phone, and a narrow
   phone; replay on light/striped cells and over Pokémon sprites. Check the
   reduced-motion path and make sure readable event text remains available.
   Promote an effect when its category and type read clearly at real size,
   the footprint is correct, and the animation does not obscure battle data.

## Art and tooling decisions

- Keep the core shape clear at tile size. Pixel edges should use a deliberate
  low-resolution grid and nearest-neighbor scaling. Smooth arcs can be useful
  for pressure waves; irregular, thin, hand-drawn lines have been harder to
  read on this board.
- Generated raster art can carry too much natural texture even after downscaling.
  For icon-like fists and energy orbs, author a tiny graphic motif or a few
  drawn frames first; animate internal details rather than moving an unchanged
  PNG through the whole effect. Preserve the category-specific silhouette and
  timing when simplifying the art.
- Shape language should follow the material. A cut needs sharp, tapered ends
  and a wider center; a punch can use quick scale change and a small impact
  shake; a splash should originate at the point where it contacts the tile.
  Inspect early and late frames, since a single peak still can hide awkward
  motion or unwanted residue.
- Layer code-driven rings, glows, trails, and particles around a small number
  of authored textures. The Normal study shows that clean pressure circles
  can add density without demanding a more elaborate sprite.
- For broad matrix coverage, start with one clear silhouette per type and
  category-specific choreography. The first-pass matrix uses Physical bursts,
  Special fields, and Status halos. Treat this as a review scaffold: replace
  icon-like cells with authored textures or bespoke motion where needed.
- Canvas is sufficient for these lightweight studies. A whole game engine is
  not required to animate a few tile layers. Use a sprite sheet or an authored
  VFX tool when frame-specific shapes outperform transformed stills. Consider
  a dedicated runtime only if effect count or compositing cost makes the
  present canvas approach unwieldy. See [local tool research](local-vfx-tools-research.md)
  for Aseprite, Effekseer, Phaser, and other options.
- Use external games as choreography references and create project-owned art.
  Record source, license, prompt, cleanup, and exported dimensions for each
  texture so the asset can be revised later.

## Production handoff

The current Fire and quality prototypes render only in development stories.
When promoting a chosen effect, keep the battle session's event queue and
targeting authority intact. Add a presentation-level resolver for custom move
animation → type/category template → Normal fallback. Give actor motion and
tile effects one playback clock, and pass resolved event tiles and a stable
event seed into the renderer. Keep static type data and assets tree-shakeable
so a battle page loads the effects it needs as the web client grows.

Review the finished production effect with real event playback, including
reconnect/skip-to-latest behavior, before retiring its development variant.
The [quality pass](prototypes/vfx-matrix/quality-pass.md) replaces 37
first-pass combinations with distinct sequences. Eight approved first-pass
combinations remain unchanged; the focused studies remain separate. Review
the 37 new candidates before promotion.
Result effects and sound remain open for separate review.
