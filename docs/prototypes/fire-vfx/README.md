# Fire Special particle study

Question: can a generated source texture and a small code-driven particle renderer
produce a better tile effect than the current moving SVG silhouette?

This is a throwaway development story, not a production effect. Open the existing
VFX lab with `?previewBattle=1&story=vfx&type=fire&kind=special&pattern=all&variant=bloom`
while running `cd web && npm run dev`. Use the floating arrows or left/right keys
to compare the current SVG with three particle behaviors:

| Variant | Still at about 650 ms |
| --- | --- |
| Current SVG | ![Current SVG](original.png) |
| Flame bloom | ![Flame bloom](bloom.png) |
| Rising column | ![Rising column](column.png) |
| Ember burst | ![Ember burst](burst.png) |

The canvas spans the existing battle board, draws at every executed tile (including
empty tiles), and shares the move's 1.5-second playback interval. The three new
variants use the same generated transparent source image at
`media/vfx/experiments/fire-special-flame-source.png`, plus code-drawn glow and
embers. The effect is excluded from production builds.

The mobile layout was also checked with the column variant:

![Mobile rising column](mobile-column.png)

The next decision is which behavior and visual scale to keep, or whether a baked
sprite sheet is preferable. Once chosen, rewrite that behavior as the production
Fire Special renderer and remove the prototype switcher and unused variants.
