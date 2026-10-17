# Arena design guide

Apply this alongside the [web UI guide](web-ui-style-guide.md) when changing
battlefield layout, floating HUDs, sprite placement or event labels. The approved
floating HUD prototype is preserved in PR #160 (`f140efc`); the real board now
uses that layout without a prototype flag.

## Field and formations

- Render one continuous battlefield. Teams and occupied cells have no cards,
  panel backgrounds or rectangular selection borders. The arena frame follows
  the site's square corners, thin solid border and small offset shadow.
- Use a quiet background, centered and cropped with `cover`. Dim it separately
  so sprites, meters and labels remain readable. Never stretch source art.
- On desktop, the participant is left and the rival right; front rows face the
  center. On phones, rival is above participant and front rows face the gap.
  Preserve engine row/column identity when changing the visual orientation.
  Ownership comes from the viewer’s `myTeamNames`, never engine team order or
  the active actor. Mirror only the viewer’s sprite art horizontally, including
  moving copies. Reverse the alpha-bound horizontal offset when mirroring so
  the visible center remains on the platform; keep HUDs and VFX unmirrored.
- Distribute extra width between slots. Each slot contains a proportional
  **7:10 visual unit**, capped by its available width and height. The platform
  preserves its **2:1 source canvas** (visible oval roughly 4:1). The square
  sprite container occupies 82% of the unit width. Spare space is padding;
  scaling must be uniform. Current phone slots are 96 px tall.

## Pokémon, HUD and targeting

- Align the sprite's visible horizontal center with the platform center and its
  feet with the platform's middle. `arena/PokemonSprite` reads alpha bounds once
  per source URL, accounting for non-square artwork's contain padding. Feet lie
  at 87% of the sprite container. Both stationary and moving copies use it.
  Failed CORS analysis falls back to centered art; failed image loads show `?`.
- Keep the name above type chips, then level and thin HP/CR meters. Names may
  ellipsize; inspection and the button's accessible name retain identity and
  numeric values. Status abbreviations and effect counts sit beside the sprite
  and may overlap its allocated space. Full details remain in the inspector.
- HUDs must fit the slot with long names, dual types and many effects. Preserve
  level on narrow screens. Keep meter borders to one CSS pixel. Buffs use red
  and ↑, debuffs blue and ↓, and neutral effects a distinct symbol.
- Highlight both the platform and sprite on hover or keyboard focus. Use an oval
  focus ring. Active actor, legal targets, primary target and preview footprint
  need distinct cues. Empty tiles retain quiet platforms and become visible
  when part of the target pattern. The active actor has a strong gold ring and
  a visible TURN marker (plus `aria-current`). Legal targets have bright cyan
  rings. While targeting, dim non-target sprites/platforms except the active
  actor; keep their HUD readable, inspection available and fainted sprites
  hidden. Do not move the entire tile on hover.
- Pokémon remain focusable buttons with touch inspection and the existing
  legal-target action path. Do not make canvas or decorative art intercept input.

## Events and motion

- Anchored event copy is compact, bold, warm text with a dark edge/shadow like
  the HUD. Use semantic ink colors, without filled pills or rounded toast boxes.
  Field-wide messages use a square translucent banner with a fine border and
  small offset shadow. Clamp text to the arena; wrap long copy.
- Keep text above move VFX and reaction particles. A Pokémon's event text,
  reaction marker, tile VFX and moving actor use the shared `arena/geometry`
  measurement. Occupied tiles anchor at the sprite container center; empty
  tiles use the cell center. Do not add species-specific CSS anchors.
- Submission feedback belongs in the existing command tray’s live text. Do not
  insert a temporary resolving banner above the arena: that shifts the board
  while the HTTP request is pending. Errors and persistent notices may still
  use page messages. Check submission through the HTTP/session path, since
  development stories do not exercise its pending state.
- Visual changes do not change event order, action authority or the playback
  clock. Result text and state changes start together, and the next event waits
  for their animations. Honor reduced motion and playback cancellation.
- Tile VFX art, recipes and review requirements live in the
  [VFX guide](battle-vfx-guide.md). Keep those recipes independent of field CSS.

## Verification

Review the actual production board through named stories: `dense`, `area-target`,
`result-sequence`, `result-batch-faint`, `result-status` and `result-weather`.
Check 320 px, a typical phone, tablet and desktop. Verify proportional assets,
foot placement, label contrast/wrapping, no horizontal overflow, hover/focus,
empty-target previews, touch inspection and a complete animation loop. Verify
an HTTP-backed battle when changing renderer integration; story data alone does
not establish that path. Check missing/custom assets and reduced motion when
changing sprite or animation code.

Keep temporary screenshots and review scripts outside the shipped tree.
Development stories use the same production board. Shared tokens/components
remain a later extraction when another feature supplies real repetition, as
specified in the main web UI guide.
