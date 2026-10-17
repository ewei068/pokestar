# Arena field prototype (throwaway)

Question: how can larger Pokémon share one field while name/type, level,
HP/readiness and status/effect cues remain readable?

Run `npm --prefix web run dev`, then open:

`http://127.0.0.1:5173/?previewBattle=1&arenaPrototype=1&story=effects&variant=A`

- **A — Floating HUD:** name/type above level + HP/readiness; status/effect
  counters flank the sprite. Default candidate, matching the proposed hierarchy.
- **B — Ribbon HUD:** status/effects above level + bars; name/type below the
  ground platform. Tests the Epic 7 inspired priority for state information.
- **C — Current cards:** existing presentation for comparison.

Use the floating arrow controls or left/right keys while the page itself is
focused. Scenario selection preserves the variant. Inputs and battle controls
keep their normal keyboard behavior. Switchers, CSS and the grass asset are
reachable only through the existing development-only story entry.

The live battle remains unchanged. This uses the production board, interaction
callbacks, playback queue and renderers, with dev fixtures and CSS experiments.
The logical rectangular rows/columns and responsive facing remain intact.
Sprites use larger boxes (96 px desktop, 80 px phone); full names, actual HP/
readiness values, types and effect details remain accessible through the
existing hover/focus inspector. Platform rings carry active/target/area cues,
including affected empty slots. No server writes occur in the stories.

`grass-platform.png` is a new generated transparent ingredient. Brief: one
muted tan/olive oval ground patch, classic handheld pixel art, simple silhouette,
no characters/scenery/UI/backdrop, designed for roughly 100 CSS px display.
The quiet field background is authored CSS so it can fit variable formations.

This branch is review material, not a design decision. After a layout is
chosen, rewrite/promote the winning presentation, optimize the platform asset,
consolidate current repeated anchor measurement into an arena geometry module,
and update the style guide. Preserve the other candidates on this prototype
branch; avoid leaving them in the final production implementation.

## Prototype checks

`browser-checks.json` records 22 browser scenarios: both field variants with
long names and dense formations at 1440, 1024, 768, 390 and 320 px; hover/focus,
AOE/empty-tile highlighting, scenario/variant navigation at desktop and phone
sizes; complete move/damage/faint and status loops at desktop/phone sizes.
No horizontal overflow, labels escaping their slots, page errors or React key
warnings were observed. Native sprite images may intentionally overlap the
slot's spare space. The inspector keeps full values/names accessible.

Production type checking/build pass, and the production main JS/CSS chunks
retain their preceding hashes and sizes. No prototype unit tests were added.
Screenshots are comparison material; selection/approval is pending.
