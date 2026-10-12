# Web UI style guide for agents

Status: working guidance for the Pokestar web client. Apply it when adding or
changing a screen. The battle UI is the first example; future features may
refine these rules.

## Aim

Make Pokestar feel like a game that is comfortable to use as a website. Favor
compact, readable information, clear Pokémon identity, and actions that are
easy to find. Use the existing battle screen as the visual baseline. Keep the
site shell and future non-battle pages consistent with that direction.

## Design decisions

- **Information first.** Show the current state, available actions, and the
  consequence of a choice close together. Use details on hover or focus, and
  an explicit inspect path on touch devices. Preserve readable text alongside
  icons and color.
- **Game character.** Use Pokémon sprites, type colors, HP and readiness bars,
  strong panel edges, and a small number of warm accents. Keep body text easy
  to scan; reserve decorative treatment for headings, badges, and key events.
- **Compact density.** Let related facts share a panel. Check long names, many
  effects, empty cells, and narrow screens before increasing panel size.
- **Semantic cues.** Give status, buff, debuff, ability, and item distinct
  labels or shapes. Use the same cue in the board and inspector. Color supports
  the cue; it is not the only way to read it.
- **Responsive interaction.** Keep the battle board visible while actions are
  chosen. On phones, the command tray can collapse. Hover information must
  also be reachable by focus or a visible tap path. Controls need a clear
  disabled, selected, busy, and error state.
- **Motion explains events.** Animate ordered server events and their resolved
  tile footprints. Keep action authority in the session and show readable
  event text. Honor reduced motion by showing the result without animation.

## Battle-specific invariants

- Desktop formations put the participant on the left and opponent on the
  right. Their front rows face the center. On phones, the opponent is above
  the participant and both front rows face the gap between them.
- A selected move highlights legal primary targets. Hover or focus shows the
  full server-supplied pattern, including empty tiles. Clicking a legal target
  uses the move; clicking the selected move again exits targeting.
- The move's executed footprint comes from ordered combat events. A preview
  describes a possible action; playback depicts the accepted action.
- The battle screen reads projected state and calls session commands. It does
  not recreate targeting or damage rules in the browser.

## Review a UI change

1. Open the relevant named development stories and the live screen when the
   change depends on API data. Check desktop, a typical phone, and a narrow
   phone. Verify content and interaction with mouse, keyboard focus, and touch
   affordances.
2. Check normal, waiting, completed, dense, missing-asset, and playback states
   as relevant. Confirm that long text stays readable and that all important
   information remains available without hover.
3. Test behavior at the nearest useful seam. Prefer user-visible assertions
   for components and structural contracts for story data. Use browser review
   for layout and motion. Record any untested real-server path in the PR.

## Later, when repetition gives us evidence

Extract shared typography, color, spacing, and motion tokens after another web
feature reveals repeated values and stable semantics. Extract reusable panel,
badge, meter, and action components when two screens share behavior and visual
rules. Keep the current feature CSS and components local until those examples
exist; this guide records the direction without freezing a design system now.
