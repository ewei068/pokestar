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
  labels or shapes. Buff counters/tags use red and upward symbols; debuffs use
  blue and downward symbols, consistent with result reactions. Use the same cue in the board and inspector. Color supports
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
- Use the continuous field and proportional floating HUD defined in the
  [arena design guide](arena-design-guide.md). It owns sprite/platform anchors,
  field backgrounds, labels, meters, target rings and event-copy appearance.
- A selected move highlights legal primary targets. Hover or focus shows the
  full server-supplied pattern, including empty tiles. Mouse clicks and keyboard
  activation use a legal target directly. Touch and pen taps pin the pattern
  and confirm with Confirm or a second tap on the same primary target; tapping
  a different target updates that preview. Cancel exits
  targeting and restores inspection. The selected move replaces the move list
  with Cancel and, when a target is staged, Confirm. At floating-tray widths,
  show those controls and a collapse arrow without the panel background.
- The move's executed footprint comes from ordered combat events. A preview
  describes a possible action; playback depicts the accepted action.
- Move motion follows the action category: physical approaches the primary
  target, special and status approach its lane at the board center, and self
  targeting stays put. Tile VFX follow move type and category, reaching every
  executed pattern tile, even an empty one. The actor returns before result
  effects. The 18 standard types each have Physical, Special, and Status VFX;
  unrecognized types use Normal VFX for now.
- The battle screen reads projected state and calls session commands. It does
  not recreate targeting or damage rules in the browser.

## Copy voice

Accepted direction, **2026-10-19**: match the user's existing server voice.
Use direct instructions and short, energetic battle announcements, with calmer
wording for errors. For battle events and flavor, try to match the Pokémon
games' exact wording when the event and Pokestar's mechanics support it. The
server copy was written from memory, so it is a voice reference rather than a
verified transcript. Check wording when exact accuracy matters; no particular
generation is required. Keep names and capitalization readable on the web.

Use status-specific phrases such as “was burned!”, “was frozen solid!”, and
“woke up!” rather than inserting status IDs into generic sentences. Keep
Pokestar-specific mechanics, numbers, and conditions explicit even where the
games have no equivalent line. An event without a failure reason must not
claim paralysis, sleep, immunity, or another specific cause. Full log narration
can carry the game phrasing; floating cues stay short enough to read in the
existing animation time. The [approved copy record](verification/web-copy/README.md) preserves the
implemented choices and verification limits.

Use the existing tutorial and battle narration as references. For example,
`src/config/helpConfig.js` gives practical advice (“Put tanky Pokemon in the
front”), while `src/battle/engine/BattlePokemon.js` announces concrete results
(“took … damage!” and “was burned!”). Match the appropriate kind of writing:
announcements need not sound like controls or connection errors. Preserve game
terms and established facts when changing their wording.

The user's [approved copy review](verification/web-copy/approved-copy.json)
also supplies concrete style examples. Favor short prompts such as “Choose a
target”, “New phase!”, and “1 turn left.” Remove redundant help text when the
remaining controls already explain the action. Target hints omit affected-count,
empty-tile and random-result summaries; the board still shows the target pattern.
Keep exact HP/readiness values in result narration and meters. Error messages
can lead with the recovery action, as in “Reload the page; your session has
expired.” The accepted “SFX could not start.” shows that familiar game
abbreviations are appropriate here; a generic plain-language rule must not
erase the user's word choices.

Use the approved “attack” instruction for Physical/Special moves and neutral
“use this move” wording for status, healing and unknown categories. Shortening
copy must still describe the actual action and state. In particular, pending
and failed rewards are different states even when the player needs only a
short message: “Awarding battle rewards…” while pending, and the explicitly
confirmed “Couldn't award battle rewards.” on failure. If an action request's
outcome is uncertain, ask the player to check the battle before retrying;
the message must preserve that uncertainty.

Shared battle interface messages and typed formatters live in
`web/src/battles/copy.ts`. Keep one-off site-shell text with the shell. Ordinary
TypeScript properties/functions handle the current English copy; add to the
feature module when wording repeats or needs coordinated editing. Defer an
app-wide localization key scheme and message-format runtime until translation
work is concrete. Narration and short floating labels remain in
`web/src/battles/eventPresentation.ts`; the
[playback contract](battle-result-playback.md) owns event semantics and timing.
Move, effect, ability, and held-item descriptions are projected from shared
server definitions by `src/web/battleCatalog.js`. Edit shared descriptions at
their source rather than creating competing web versions.

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
