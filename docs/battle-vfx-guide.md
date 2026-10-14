# Battle tile VFX guide

Use this workflow when creating or revising an effect. The quality reference is
**the running animation at battle size**. The current review entry is
`web/vfx-review.html`; its Compare motion control synchronizes a selected cell
with Fighting and Poison, supports phone size, and exposes the whole timeline.
The effects remain in development review until the user requests promotion.

## Make an effect

1. **Read the latest feedback and choose a reference.** Start with the affected
   cell's notes and the examples below. Review the reference's entire sequence.
   Finish this step with a concrete subject, action, contact point, and release
   for this type/category. Physical implies contact; Special projects a force
   or changes the environment; Status establishes a field or influence.
2. **Describe the choreography before making art.** Write a short sequence such
   as “stones gather → hang → converge in arcs → break at the center.” Identify
   independently timed pieces and the material behavior of each. Finish when
   you can describe what visibly changes at entry, peak, and release.
3. **Choose the smallest useful art ingredients.** Use generated art for a
   flame body, splash, impact crescent, or recognizable creature part. Use
   authored pixel frames for changing orbs and small bold silhouettes. Use
   canvas geometry for growing cuts, waves, fields, rings, and electrical
   branches. Finish when each ingredient is readable at its intended display
   size and has an explicit animation role.
4. **Animate the parts on one clock.** Give each piece a birth, lifetime,
   trajectory, and release. Change the focal shape through frames, articulation,
   deformation, growth, or a material transition. Supporting parts should
   explain the material: droplets separate from a collapsing crest, fragments
   leave a landing rock, feathers leave the wing's outer edge. Finish when
   those causes and their visible consequences line up in both time and space.
   Attach emissions to an animated local point: a wing tip, open mouth, or
   beam foot. Effects that move or rotate must carry that origin with them.
5. **Review the whole effect beside the references.** Inspect the complete
   0–760 ms sequence, with regular playback plus timeline scrubbing or a
   complete sampled filmstrip. Check desktop and phone scale, occupied and
   empty tiles, and multiple affected tiles. Fix gaps you can see before
   asking for the user's review. Finish this step for **every changed cell**;
   a good peak frame, a successful build, or a populated matrix does not
   establish animation quality.
6. **Preserve review evidence.** Save feedback, the changed-cell list, source
   art briefs, and visual evidence. Carry notes forward and reset approval
   only on revised cells. Report any unresolved visual or technical issue
   explicitly. User approval and live-playback validation are separate steps.

## Examples the user highlighted

The [recovered review](prototypes/vfx-matrix/review-2026-10-12-composed.json)
contains all 54 selections and the user's exact written feedback. Its favorite
examples illustrate different solutions; they are not one template to recolor.

| Reference | How it works | What to reuse |
| --- | --- | --- |
| **Rock Special — strongest favorite** | Several faceted stones appear at different positions, hover, curve toward a shared focus, then yield to pressure and fragments. | Choreograph independent objects around a common event. Let size, depth, path, and timing vary while preserving the central beat. See `composedVfx/minerals.ts`, `rockSpecial`. |
| **Fighting Physical** | A small pixel fist rapidly comes into focus, settles with a brief shake, and triggers delayed pressure circles. | A simple recognizable ingredient can carry the contact beat. Shape detail is subordinate to timing, scale, and the follow-through. See `focusedMatrixVfx.ts`, `fightingPhysical`. |
| **Fighting Special** | An orb arrives, its internal pixel frames keep changing, and pressure arcs and sparks expand independently. | Animate the material inside a focal object as well as its position. See `pixelMotifs.ts` and `focusedMatrixVfx.ts`. |
| **Ghost Status** | A small spirit ripples in independently displaced bands while surrounding fog lobes drift and fade on separate lifetimes. | Combine a readable subject with restrained deformation and atmosphere. Preserve the sprite's identity; movement need not be violent to be effective. See `composedVfx/arcane.ts`, `ghostStatus`. |
| **Psychic Status** | An eye opens, the pupil scans, rings follow at staggered times, and the eye closes. | Clean geometry with meaningful internal motion can be as effective as generated art. See `composedVfx/arcane.ts`, `psychicStatus`. |

Poison remains a useful complementary reference: Physical grows two tapered
cuts with separate bubbles; Special changes an orb's internal frames before a
splash; Status spreads a pool while bubbles rise at different times.

## Art and motion rules

- **Compose moving ingredients.** A complete effect illustration translated,
  scaled, and faded as one dominant layer is insufficient. Keep generated
  images small in responsibility and combine them with authored motion.
- **Budget detail for the display size.** Main subjects can use a deliberate
  24–40 px visual grid. Small particles need fewer shapes and colors. Flat
  tones and clear edges read better here than textured illustration reduced
  to a few pixels. Inspect at actual size before adding detail.
- **Make cuts narrow and long.** Grow and clear their tapered tails; vary
  length, angle, offset, and timing where the brief calls for multiple cuts.
  Avoid leaving a wide almond shape suspended at the center.
- **Place contact deliberately.** Land falling objects where their pressure,
  spray, or debris originates. Foot-level effects use a small offset below
  the sprite; impact effects center on it. Anchor an occupied tile to its
  sprite bounds and an empty tile to its cell bounds.
- **Respect the material.** Stone falls, bounces, and fractures. Heavy metal
  can stay planted. Water curls, collapses, and sheds droplets. Electricity
  changes channels in short discrete bursts. Gas changes its silhouette and
  density. Fire can have one broad body with smaller foreground embers.
- **Match contact to the source.** A broad beam needs a broad local impact,
  while a small slash needs a narrow trace. A background flame should leave
  room for foreground embers through scale and opacity. Check these relations
  in motion before increasing particle count.
- **Use layers purposefully.** Draw atmosphere first, the focal object next,
  and foreground particles last. Pressure circles suit impacts, stomps, and
  roars; other materials can communicate their own force without circles.
- **Preserve category identity.** A type's palette and ingredients may be
  shared, but its Physical, Special, and Status sequences need distinct
  subjects or behavior. Status can be beneficial and should not always read
  as damage.
- **Vary tiles reproducibly.** Derive random values from event identity, stable
  tile identity, and particle index. Vary emitted parts' birth, direction,
  size, sprite, and path. Replaying a seed should reproduce the sequence;
  neighboring affected tiles should have variation.
- **End cleanly.** Fit the entire local sequence into the tile effect window.
  A per-tile delay must shorten the remaining lifetime or adjust the shared
  schedule; it must not chop off the release. Nothing remains after completion.

## Store and extend approved effects

The approved renderer is preserved at Git commit
`1514fedd93deb5119bc60a8981b550940c530f58`. Its settings now live in typed
[recipe files](../web/src/battles/dev/recipes/README.md). Start with the 54-entry
catalog in `recipes/index.ts`, then follow the effect's settings record. The
renderers consume that catalog; artwork imports are in `recipes/artwork.ts`.

Edit existing timing, counts, movement, growth, deformation, fades, and material
choices there. Keep new fields descriptive and document their units. Geometry,
choreography formulas, draw order, and deterministic seeding stay in rendering
code. Expose new settings when adding a new behavior instead of recreating the
entire drawing program in configuration.

For a pure refactor, use the same-browser pixel comparison against the saved
baseline before declaring appearance preserved. Intentional changes still use
the visual review workflow above. A tuning UI remains P1; per-move overrides and
live-battle promotion are separate follow-ups.

## Generated asset brief

Specify **one component**, its final visible size, palette, silhouette, pixel
grid, transparency, and how code will animate it. Keep surrounding rings,
particles, background, and scene composition out of a component request.
Inspect the generated result at tile size, then revise the art or choreography
if it fails there. Asset generation alone never completes an effect.

The [component asset notes](../media/vfx/components/README.md) record the
current prompts, sources, and uses. Historical `review-atlas` images are
superseded concept art and are not inputs to the current renderer.

## Runtime and validation boundaries

The server supplies accepted actions and all resolved footprint tiles,
including empty ones. The category controls actor motion independently of
type: Physical approaches its target; Special and Status approach the target's
lane; self-targeting leaves the actor in place. Sequence actor approach → tile
VFX → actor return → resulting effects. Damage numbers, faints, and sound are
separate work.

Keep the battle session, event queue, and action authority outside the renderer.
Future resolution order is custom move → type/category → Normal for unknown,
Shadow, Stellar, or future types. Development review does not promote the
matrix into live battles. Promotion requires asset readiness, a shared playback
clock, reduced-motion behavior, multi-tile playback, and reconnect/skip checks.

Use unit tests for state and timing contracts, and browser checks for rendering,
layout, deterministic seeds, asset loading, clean endpoints, and visual review.
Record what was actually inspected. Frame capture and tests support judgment;
they do not grant aesthetic approval automatically.

If greater fidelity becomes necessary, first add authored frame sequences or
richer material deformation to the relevant component. Consider shaders,
Effekseer, or another runtime only when a demonstrated effect needs capabilities
the current canvas composition cannot provide. The renderer boundary supports
that later choice.
