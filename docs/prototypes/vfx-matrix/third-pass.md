# Poison and Fighting VFX third pass

The [second review export](review-2026-10-12-round-2.json) approved 12 effects,
marked 40 for further work, and left two unreviewed. This pass revises five
effects from the [second pass](second-pass.md); the other 49 animations retain
their prior implementation and review status. The [live review grid](../../../web/vfx-review.html)
starts a fresh review for these five and carries forward the other marks.

| Combination | Change from review |
| --- | --- |
| Fighting Physical | Replaced the generated fist with a deliberately small, code-drawn pixel icon. Kept the directional strike and pressure rings. |
| Fighting Special | Replaced the high-detail sphere with a 24-pixel orb whose inner swirl changes frame by frame. Kept its travel, impact growth, rings, and sparks. |
| Fighting Status | Two upright fists sit above angular, crossed forearms to make a defensive guard. |
| Poison Physical | Narrowed both slashes into cuts; bubbles and timing remain. |
| Poison Special | Replaced the generated sludge sphere with an animated, low-resolution orb that drops from above the tile. Kept bubbles, drips, and impact rings. |

The pixel motifs are authored in [`pixelMotifs.ts`](../../../web/src/battles/dev/pixelMotifs.ts).
They are development studies, not yet promoted to live battle playback. The
three earlier generated images were removed because their realism and baked
detail did not read as game art at tile size. Poison Status was approved and
left untouched. Fire Special remains unreviewed and was also left untouched.

The remaining first-pass notes describe distinct silhouettes and sequences
for other type/category pairs. They need focused passes rather than a shared
style transform. Keep each revision separately reviewable in the grid.
