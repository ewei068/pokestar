# Component art

Generated with the built-in image generation tool on 2026-10-12 for the VFX
feedback revision. Transparent source PNGs are stored here unchanged. The
renderer composes these individual ingredients with independent particles,
geometry, and timing; none is a complete move animation.

| Asset | Brief / prompt constraints | Use |
| --- | --- | --- |
| `normal-impact-crescent.png` | One isolated hollow white/pale-blue impact crescent, chunky outward spikes, stepped notches, slate-blue outline, two flat highlights, deliberate 24 px style. Transparent center and exterior. No brush texture, particles, glow, scene, or text. | Two staggered pulses of independently rotated crescents over pressure circles. |
| `fire-body.png` | One broad compact fire body with three asymmetric tongues, orange/gold/pale-yellow flat bands, opaque silhouette, 32 px style, transparent exterior. No narrow tailed ember, smoke, detached particles, ground, glow, texture, or text. | A background body with band deformation, separately rising flames, and small foreground embers. |
| `dragon-head.png` | One right-facing dragon head and short neck, backward horn, blue/violet scales, cyan cheek, narrow eye, distinct jaw. Clean 40 px style, six flat shades, opaque colors, transparent exterior. More recognizable than an abstract icon; no body, effects, scene, glow, or text. | A head that rears through an arc; timed pressure arcs leave its mouth. |
| `water-splash.png` | One compact front-view pale-cyan splash, shallow base, four outward-curving fingers, hollow transparent gaps, white rims, two blue shades, 24 px style. No detached droplets, ground, circle, glow, detailed texture, or text. | A brief deforming contact splash, combined with independent water ribbons and ballistic droplets. |

These briefs record the full intended constraints of the prompts; generation
may not obey every requested detail exactly. The rendered tile is the review
artifact. The original generated files also remain in the local Codex generated
image directory.

Earlier generated ember, glint, and pearl ingredients remain in
`media/vfx/experiments/`. Pixel fists/orbs and the small material parts are
code-authored in the development renderer.

The optional Lavender Town URL supplied in feedback was inspected. It contains
a repeated PicMix watermark; it was not copied into the renderer. Ghost Status
keeps the project's original spirit silhouette and its existing deformation.

## Dragon refinement, 2026-10-13

`dragon-head-simple.png` replaces the high-detail head in the review renderer.
Generated with the built-in image tool; original file:
`exec-40768361-97ef-4564-ac11-af82e4ad4a5b.png`.

Brief: one tiny, right-facing, open-mouth blue-violet dragon head; emulate a
24×24 logical pixel grid with five flat colors, a bold snout, one swept-back
horn, a small eye/fang, short neck, and true transparency. No scales, texture,
glow, rings, or particles. Code rears the head and emits independently timed
voice arcs from its mouth. The previous detailed head remains for history.
