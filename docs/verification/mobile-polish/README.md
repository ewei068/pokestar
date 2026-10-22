# Second annotation batch

Implemented locally **2026-10-22, America/Los_Angeles**, following the three
mobile/browser comments. This extends the first widescreen batch. The user
accepted the local UI and requested a new PR on the same date; production
deployment remains separate.

- Project a solo trainer's saved username, or “You” for the viewer's solo team.
  Several trainers keep the team name; missing names fall back to it. Headings,
  inspection and winner narration use these labels. Canonical team keys and
  target geometry remain unchanged, and private trainer profiles stay server-side.
- Selecting a move hides the move list and offers Cancel. Touch and pen taps
  pin the complete server-supplied target footprint until Confirm or a second
  tap on the same primary target; tapping a different target updates it. Mouse
  and keyboard activation submit directly.
  Cancel restores ordinary Pokémon inspection. Changes to battle, revision,
  actor, move, turn availability, busy state or playback invalidate confirmation.
- At floating-tray widths (up to 640 px), targeting has only floating actions
  and the collapse/expand arrow, with 44 px control heights. Ordinary move
  choice retains the tray. Submission status stays in its existing live region.
- Board and inspector share `StatusLabel`: TOX/PSN purple, PAR yellow, BRN red,
  SLP gray and FRZ ice blue. Three letters remain visible and full status names
  remain accessible. Only inspector badges are separate buttons.

## Evidence

- Before implementation, the Cancel replacement test and the solo/multiplayer
  projection assertions failed for the intended missing behavior.
- Component tests exercise touch previews including empty tiles, retargeting,
  cancellation and inspection, one-shot confirmation, pen input, direct mouse
  and keyboard submission, and turn/availability invalidation. `user-event`
  supplies touch events; the pen test supplies a native DOM pointer event
  because that dependency lacks pen simulation.
- Projection tests use the real battle/service path with the in-memory store;
  they cover viewer-relative solo labels, multiplayer and missing-name fallback,
  restricted projection fields and unchanged canonical team keys.
- The repeat-tap regression failed before its implementation; a second tap on
  the staged primary target now submits the move and clears confirmation.
- Full web suite after the repeat-tap follow-up: **95 tests / 22 suites passed**. Full backend suite:
  **835 tests / 28 suites passed**. Production build and TypeScript, targeted
  backend ESLint and `git diff --check` passed.
- In-app browser review of the production components in the dense development
  story checked 320, 375, 768 and 1158 px widths with no horizontal overflow.
  Phone targeting measured a 44 px transparent control row with no panel
  border/background; collapse, expand and Cancel returned to move choice.
  Desktop/tablet targeting retained Cancel without the other move buttons.
- Browser inspection checked “You VS Palmer”, viewer-relative inspector labels,
  and computed purple TOX/PSN, yellow PAR and red BRN colors. Read-only inspection
  of the authenticated battle also showed matching purple TOX board/inspector
  badges. No live action was submitted.
- A separate simplification pass found no behavior-preserving code changes
  worth applying; two redundant comments were removed. An independent local
  integration review checked pointer input, confirmation invalidation, naming
  and projection boundaries. This was not a cross-model review.

## Remaining runtime checks

The existing backend process was left running. Its old projection still shows
“Player VS NPC”; restart the local bot/backend and reload the battle to load the
new display names and the prior batch's forced-skip behavior. No schema migration
or ruleset bump is needed. Browser review used mouse controls and responsive
viewports; touch/pen behavior is verified by DOM interaction tests, not physical
phone/tablet input. The user accepted the reviewed local UI on 2026-10-22.
