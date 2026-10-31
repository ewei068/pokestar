# Web UI style guide for agents

Status: working guidance for the Pokestar web client, including screens, shell,
prototypes and development stories. The current broader-site direction is
**Dusk Arcade / Jewel**, selected on 2026-10-30. Individual screens are designed
with their real data and actions as their implementation approaches.

## Aim

Make Pokestar feel like a game that is comfortable to use as a website. Favor
readable information, clear Pokémon identity and easy-to-find actions. The
battle screen established the game presentation; the selected Jewel study
extends it to the site shell and non-battle pages.

## Shared visual language

Use the [Jewel reference](design/web-navigation/jewel-reference.jpg) and editable
[Play-page study](design/web-navigation/refined.html) with `?variant=jewel`.
Serve the study as described in its [README](design/web-navigation/README.md).
`directions.css` provides its base and `refined.css` the selected treatment.
These are reference sources, not production components to copy wholesale.

- **Scenery and surfaces.** Let the landscape remain visible around content.
  Put text-heavy content on dark plum panels with enough opacity for readable
  text. Pokémon sprites and scenery carry the game character; reserve scenic
  framing for places where it supports the activity.
- **Color hierarchy.** Warm gold marks the main action and selected navigation.
  Sapphire, jade and amethyst distinguish encounter choices. Keep supporting
  surfaces quiet so those colors remain useful. Color accompanies a label or
  icon; encounter colors do not imply rarity, success or failure.
- **Typography.** Use `Trebuchet MS`, then `Segoe UI`, then a sans-serif fallback
  for the broader shell. Favor regular-weight navigation, panel headings and
  feature labels; use bold selectively for the page title and main actions.
  Preserve readable sizes on phones and verify fallback-font wrapping.
- **Edges and controls.** Fine contrasting borders, restrained inset highlights,
  short offset shadows and modest corner radii give controls depth. Use subtle
  diagonal stripes sparingly on primary actions. Keep large body panels calm.
- **Density.** Group related facts, preserve comfortable touch targets, and use
  short copy. Details belong beside their action, not in repeated explanatory
  subtitles. Sprite art may be playful; controls must remain recognizable.

Starting values from the selected study, to extract only where implementation
shows shared use:

| Role | Reference value |
| --- | --- |
| Primary text / secondary text | `#fff4dc` / `#ddd8c9` |
| Content panel / panel header | `#2b2641ed` / `#433557e8` |
| Panel border | `#9c8eb0` |
| Main action / selected navigation | `#edbe43` / `#d2aa4c` |
| Trainer battle / dungeon / tower | `#3155a0` / `#287563` / `#793e8b` |

These values establish direction, not verified accessibility for every pairing.
Check contrast over the actual composited background and all control states.
Keep the current battle board, HUD colors, type badges and effect semantics
intact. Its paper command/inspection panels and square arena frame remain
battle-specific; [the arena guide](arena-design-guide.md) owns their composition.
For that reference, run the web development server and open
`/?previewBattle=1&story=dense`; source is
[`battle-ui.css`](../web/src/battles/battle-ui.css). Compare new screens with the
appropriate rendered reference. The legacy navy top bar is not the shell target.

## Navigation

Accepted 2026-10-30: **Play, Pokémon, Catch, Rewards, More**. Play is the default;
there is no Home tab. Catch is the player-facing name for acquisition. Keep a
resource/account bar above the desktop sidebar or phone bottom navigation.
Bag is an icon near resources; Settings uses a cog with an accessible name.
Rewards groups daily rewards, quests, achievements, tutorial and level claims;
exact subtab presentation is refined when those screens are implemented.

Pokémon owns collection, owned detail and party/presets. Play owns encounter
selection, active battles and saved results. More contains secondary destinations
such as Shop and Crafting. Preserve direct battle links, browser Back, useful
empty/error recovery and return paths from objectives to gameplay and claims.

## Design as features are built

Before implementing a screen, sketch its actual information and consequential
actions using this language. Review substantial choices such as party editing,
catch costs and reward claims; straightforward lists and settings can use the
established patterns directly. Extract only repeated tokens/components that
these screens demonstrate. Keep pending, failed and unknown outcomes distinct.
The studies establish direction and navigation, not gameplay or reward rules.

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
