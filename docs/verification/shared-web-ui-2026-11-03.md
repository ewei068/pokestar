# Shared website and battle UI · 2026-11-03

The maintainer requested shared styling so ordinary battle UI follows the
website theme automatically. This refactor replaces the earlier palette-only
update. Work remains local in the existing `d66b` checkout and implementation
branch.

## Ownership

- `web/src/ui.css` owns theme tokens and shared panel, control, badge and move
  fact styles. Battle, collection, Play and the shell consume those sources.
- `TypeBadge` renders ordinary type labels with one complete standard-type
  palette. Collection, move controls and battle inspection use it.
- `MoveInspection` owns its type badge and shared fact markup. Callers provide
  a type name rather than independently styled badge markup. Numeric battle
  type IDs still resolve through the catalog/legacy mapping.
- `Chevron` is shared by collection controls and the battle collapse control.
  Ability/item badges share appearance between collection and battle; battle
  status/effect inspection uses the same badge base with semantic variants.
- Feature CSS owns layout and density. Arena sprites, target geometry, small
  HUD chips, meters, effects and event timing retain their separate rules.

## Observed verification

- Client tests passed: 162 tests across 30 suites. Existing move-inspection and
  numeric-type tests were updated for the shared badge input/identity. Existing
  interaction tests still cover inspection callbacks, cancellation, confirmation,
  status identity, playback and party operations.
- Client TypeScript and production bundle checks passed at the root and with
  `/pokestar/` as the base. Existing Virtua/Rollup annotation warnings remain.
- `git diff --check` passed. A stylesheet scan found no undefined `--site-*`
  references. The client has no separate configured lint command.
- Local browser checks used production components in dense, waiting and
  completed stories, and the HTTP-backed Blue battle in the existing disposable
  Mongo environment. Desktop checks confirmed Collapse is hidden and move cards
  retain their feature alignment despite shared stylesheet import order.
- Battle phone checks covered 390px and 320px widths. Collapse/Expand and
  move selection/Cancel worked; observed document widths matched the viewport.
  Targeting retained a transparent tray and 44px Cancel/collapse controls.
- Collection desktop inspection exercised Moves and About. Fire/Flying badges
  used the same colors, 11px text and 4px corners as battle inspection. Play's
  Continue and trainer panels were checked against the shared surfaces.
- Screenshots were saved outside the shipped tree, including the production
  battle preview and the dense story with status, ability, item and effect badges.

## Review and limits

The project's bounded-change route was used: a direct scoped review in the
current context. The review checked CSS precedence, callers of removed styles,
formation resets, numeric type mapping and existing interaction semantics.
It caught shared button display overriding the desktop collapse rule, repaired
by lowering layout-default specificity. It also caught Continue's panel caller
missing the new shared classes; that caller was migrated before final checks.
No actionable findings remain from that pass.

No new CSS-mirroring tests were added. This change alters presentation and
shared markup, with existing behavior tests and real-browser observations as
evidence. It changes no backend rules or session logic and does not establish
physical-device, live-provider or deployment acceptance.
