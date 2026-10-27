# VFX artwork ingredients

These images are inputs to the configuration-driven client renderer. The import
registry is `web/src/battles/vfx/recipes/artwork.ts`. None is a complete move
animation: code composes each ingredient with geometry, deformation, frames,
and independently timed particles. Approved source pixels are preserved.

| Asset | Role / source |
| --- | --- |
| `normal-impact-crescent.png` | Generated pixel crescent; three cropped radial bursts over pressure circles. Brief: hollow white/pale-blue arc, chunky spikes, flat highlights, transparent center/exterior, no surrounding effect. |
| `fire-body.png` | Generated broad flame body, cropped at its ground anchor and deformed in bands. Brief: three asymmetric tongues, opaque flat orange/gold/yellow bands, transparent exterior, no separate particles or glow. |
| `water-splash.png` | Generated contact splash; independent ribbons and droplets carry its motion. Brief: pale-cyan shallow base and outward fingers, white rims, flat blue bands, hollow gaps, no detached droplets or scene. |
| `dragon-head-simple.png` | Generated 24 px-style head with flat blue/violet colors, horn, open jaws, and short neck. Code articulates it and emits voice arcs from the mouth. |
| `ghost-user-sprite.png` | User-supplied transparent 401×461 PNG, copied unchanged from `codex-clipboard-6d21a37e-f4f6-4fb0-a519-0ffc38d02340.png`. Existing ripple, bob, fog, and particles provide animation. |
| `fire-special-flame-source.png` | Retained generated rising-flame ingredient. |
| `fire-ember-coal.png`, `fire-ember-fleck.png`, `fire-ember-fork.png` | Retained generated ember ingredients, with independent trajectories and lifetimes. |
| `fairy-status-mote.png`, `fairy-status-glint-small.png`, `fairy-status-pearl-small.png` | Retained generated Fairy ingredients. Small particles use simple readable silhouettes. |

The generated components used the built-in image tool. Original files remain
in the local Codex generated-image directory; generation briefs above document
the intended role. The user's Ghost source was used directly without generation
or pixel editing. Earlier atlases, rejected variants, and review screenshots
are recoverable from Git baseline `1514fedd93deb5119bc60a8981b550940c530f58`.

Pixel fists/orbs and other small material parts are authored in
`web/src/battles/vfx/pixelMotifs.ts` and `composedVfx/parts.ts`.
