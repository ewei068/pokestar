# Web copy comparison

Inspected: **2026-10-19, America/Los_Angeles**, on `codex/battle-cries`,
commit `653c2e7`, followed by the local copy implementation on the same base.
The user approved the direction and requested this implementation. See the [effort overview](efforts/web-battler.md)
for implementation status and [copy research](web-copy-research.md) for external
guidance. Accepted copy direction lives in the [UI style guide](web-ui-style-guide.md#copy-voice).

The user chose **match the existing server voice**, following a recommendation
of direct instructions, short energetic battle messages, and calmer errors.
The first copy pass below is now implemented. “AI-heavy” describes the user's
experience of the copy; this audit does not infer authorship from wording.

## Reference writing and observed differences

| Reference | Actual example | Useful voice evidence |
| --- | --- | --- |
| [`tutorialConfig`](../src/config/helpConfig.js) | “In Pokestar, party position matters! Put tanky Pokemon in the front, and spread your Pokemon out to avoid AoE damage.” | Practical advice, ordinary game vocabulary, direct instructions, occasional enthusiasm. |
| [`buildPartyEmbed`](../src/embeds/battleEmbeds.js) | “Modify your party with `/party manage`” | Names the action and the control needed to do it. |
| [`BattlePokemon`](../src/battle/engine/BattlePokemon.js) | “${this.name} took ${damageTaken} damage!” and “${this.name} healed ${healTaken} HP!” | Short announcements with a concrete verb and exact amount. |
| [`BattlePokemon`](../src/battle/engine/BattlePokemon.js) | “${this.name} was burned!” and “${this.name} is fast asleep!” | Status-specific grammar rather than inserting a status ID into a generic sentence. |
| [`effects`](../src/battle/data/effects.js) | “${target.name}'s Attack rose!” | Describes the consequence in game language. |
| [`Battle`](../src/battle/engine/Battle.js) | “The sunlight turned harsh!” and “It started to rain!” | Familiar battle announcements instead of raw weather names plus a generic verb. |

These are references from the server corpus the user identified. Their wording
was inspected; individual human authorship was not independently established.
Some newer server files belong to the web implementation, so location under
`src/` alone does not make text a handwriting reference. Preserve the user's
word choices without copying accidental typos, outdated instructions, Discord
formatting, or slash-command syntax into unrelated web interactions.

Before this pass, the web's main differences were implementation terms in player
instructions
(“share the same state,” “playback,” “Revision”), generic framing (“Your arena”),
and generic event templates. This is an editorial assessment, not a finding that
every web sentence needs changing. “No ongoing battles” and “Start one in Discord,
then return here to continue it” already serve their purpose.

## Copy ownership

| Copy | Edit/review location | Constraint |
| --- | --- | --- |
| Sign-in, account, initial connection | [`App.tsx`](../web/src/App.tsx) | State only what sign-in and connectivity checks establish. |
| Battle list and empty/loading/error states | [`BattleList.tsx`](../web/src/battles/BattleList.tsx) | Battles start in Discord; participants can continue on either interface. |
| Actions, waiting, targeting | [`MovePanel.tsx`](../web/src/battles/MovePanel.tsx) | Keep possible targets distinct from guaranteed hits; cover touch and keyboard use. |
| Stale action and request errors | [`useBattleSession.ts`](../web/src/battles/useBattleSession.ts) | Do not invent rejection reasons or promise a request had no effect when the response is unknown. |
| Battle completion, rewards, version notices | [`BattleScreen.tsx`](../web/src/battles/BattleScreen.tsx) | Saved battle results, pending rewards, and failed rewards are separate facts. |
| Narration and floating labels | [`eventPresentation.ts`](../web/src/battles/eventPresentation.ts) | Full narration and short cues share definitions with presentation semantics. Preserve subjects, tones, batch keys, and event order. |
| Inspector fallback text and duration | [`BattleInspector.tsx`](../web/src/battles/BattleInspector.tsx) | Check missing metadata and singular/plural durations. |
| Audio settings and failures | [`AudioSettings.tsx`](../web/src/settings/AudioSettings.tsx), [`useBattleAudio.ts`](../web/src/battles/audio/useBattleAudio.ts), [`useBattleMusic.ts`](../web/src/battles/audio/useBattleMusic.ts) | A playback failure is different from the player choosing mute. |
| Status descriptions added for web | [`statusDisplay`](../src/web/battleCatalog.js) | Verify timing and effects against the engine before replacing terms such as “status ticks.” |
| Shared move/effect/ability/item descriptions | [`battleCatalog.js`](../src/web/battleCatalog.js) projects [`src/battle/data`](../src/battle/data) | These already come from shared definitions. Editing them changes both interfaces; avoid web-only duplicates. |

Fixtures under `web/src/battles/dev` include stand-in descriptions. Review real
catalog data as well as stories before claiming production copy is covered.

## First-pass comparison (historical)

The Pokémon names and numbers below illustrate the rendered templates.
This table preserves the first implementation. The approved review below
supersedes its wording where the user supplied replacements.

| Context / source | Before update | Implemented wording | Reason |
| --- | --- | --- | --- |
| List introduction, `BattleList.tsx` | “Continue a battle started in Discord. Actions here and in Discord share the same state.” | “Continue a battle from Discord. You can play here or in Discord.” | Keeps the useful fact in player language. |
| Connection error, `App.tsx` | “Could not connect to the Pokestar battle service. Refresh to retry.” | “Couldn't connect to Pokestar. Refresh the page to try again.” | Familiar phrasing with the same recovery action. |
| Playback heading detail, `MovePanel.tsx` | “Playing battle events…” | “Catching up with the battle…” | Explains the wait without naming the event system. |
| Target selection, `MovePanel.tsx` | “Click a highlighted target to use; click the move again to cancel” | “Choose a highlighted target to use this move. Select the move again to cancel.” | Names what will happen; works for mouse, touch, and keyboard. |
| Move narration, `eventPresentation.ts` | “Typhlosion used Tackle.” | “Typhlosion used Tackle!” | Matches server announcement punctuation. Keep the short cue `Tackle`. |
| Damage narration, `eventPresentation.ts` | “Gengar lost 42 HP.” | “Gengar took 42 damage!” | Matches the existing damage announcement. Keep the short cue “−42 HP.” |
| Healing narration, `eventPresentation.ts` | “Gengar gained 20 HP.” | “Gengar healed 20 HP!” | Matches server healing wording; retains the amount and unit. |
| Burn application, `eventPresentation.ts` | “Gengar is now Burn.” | “Gengar was burned!” | Fixes noun/adjective grammar using the server phrase. The badge can still say “Burn.” |
| Sleep application, `eventPresentation.ts` | “Gengar is now Sleep.” | “Gengar fell asleep!” | Uses status-specific wording. Keep stable status IDs and catalog names. |
| Sun begins, `eventPresentation.ts` | “Sun began.” | “The sunlight turned harsh!” | Matches the engine's weather announcement; do not reuse it for weather intensification. |

Removed the decorative “Your arena” and “Welcome to the arena” lines, which
repeated page context. “Revision” remains a candidate for a later diagnostic
details treatment; moving it changes information layout and is deferred.

## Implementation and accuracy limits

The user added that battle flavor should try to match the games' exact wording.
The implementation uses game-style status application/cure and weather phrases,
while keeping Pokestar's numeric damage, shield, readiness and phase messages.
No particular generation was requested. The existing server remains the voice
reference, not a certified transcript of game text.

Updated sign-in/list text, action and targeting instructions, completion and
reward notices, request/audio errors, duration/count grammar, log empty text, and event
narration. The command tray asks “What will [Pokémon] do?” during the player's
turn, identifies waiting turns, and switches to inspection prompts after a
battle ends. Unknown statuses keep a grammatical general fallback. Full log lines
use familiar battle phrases; floating labels remain short (for example,
`Paralyzed` and `−42 HP`) within the existing 820 ms announcement time.

Status descriptions now explain end-of-turn damage in player language. This
timing was checked in `Battle.nextTurn()`, which calls `tickStatus()` after
`TURN_END`, and in `BattlePokemon.tickStatus()`. Shared move, ability, held-item,
and effect definitions were not rewritten. Development fixtures use the same
updated status wording.

Request failure text now preserves uncertainty about whether an action reached
the server. Sound failures describe the playback problem instead of asking
players to run a developer setup script.

The phrase check used the [Emerald battle-message reconstruction](https://github.com/pret/pokeemerald/blob/master/src/battle_message.c),
a community-maintained reconstruction of the game strings, not an official
writing guide. It confirms familiar status/miss/faint/weather wording; the
server uses some later-style variants. This pass does not claim exact wording
for every generation or for Pokestar-only mechanics.

Preserve flexibility for different tones in announcements, controls, and errors.
The accepted direction and examples live in the existing UI guide. Defer
a new copy framework, a custom skill, or changes to semantic events until a
concrete need appears.

In particular, `actionBlocked` currently supplies a Pokémon and move ID without
a reason. It cannot reproduce every server line such as “is fast asleep!” or
“is paralyzed and can't move!” safely from that event alone. A copy pass should
keep its fallback general; richer reason-specific reporting is separate work.

## Prompt for the editing pass

> Match the Pokestar server examples linked in this audit. Use direct
> instructions for controls and short, energetic announcements for battle
> results. For equivalent battle events, prefer the Pokémon games' wording.
> Keep errors calm and actionable. Rewrite only lines that need it.
> Preserve game terms, values, conditions, and uncertainty. Keep full narration
> separate from short floating labels. Do not add jokes, claims, or causes that
> the current state or event does not establish. Return each proposed change
> with its source location and the server example it follows.

## Verification

Local verification on **2026-10-19**:

- `npm --prefix web test`: **83 tests, 21 suites passed**. Existing playback,
  batching and missing-subject assertions were updated for the new narration.
  Status application/cure, weather transition/fallback, and healing/cue tests
  failed against the old copy before implementation and now pass.
- `npx jest --runInBand --silent`: **831 tests, 28 suites passed**, including
  the server display catalog and battle engine. The existing listener warning
  remains non-fatal.
- `npm --prefix web run build`: passed, including TypeScript. Existing Virtua
  PURE-annotation warnings remain non-fatal.
- `npx eslint src/web/battleCatalog.js`: passed. ESLint emits its existing
  React-package detection warning; no web TypeScript lint command is configured.
- The existing HTTP/session layout browser check passed at **1440 px and
  390 px**, with the pending-action copy updated. The arena and viewport stayed
  stable through submission.
- A temporary Playwright copy review covered **1440 px, 390 px and 320 px**:
  sign-in, empty/error battle lists, targeting, long names/dense formations,
  waiting, inspector details, finished battles, pending/failed rewards, an
  uncertain action response, paralysis/freeze messages, weather, and the full
  move → damage → faint sequence. No page overflow or JavaScript errors were
  observed. Phone screenshots were visually inspected; the finished-battle
  prompt mismatch found during review was corrected and rechecked.
- A local correctness review of the final diff found no actionable issues.
  It ran in the implementation context, without a separate reviewer.

Browser evidence uses production components with story data and mocked HTTP;
no live OAuth, real battle write, phone hardware or production check was run.
Temporary browser script, results and screenshots are in
`/tmp/pokestar-copy-review/`; they are review artifacts, not shipped assets.
No separate per-string UI snapshot tests were added for the prose changes.
The user's subjective wording review is separate from these checks.

## Temporary approval review

The user judged the first pass generally better but not final and requested a
copy-only comparison editor. Temporary HTML and supporting files live in
`/tmp/pokestar-copy-review/editor/`. Run `python3 serve.py` there to serve the
editor at `http://127.0.0.1:5180`. The HTML also opens on its own; without the
server, it saves in the browser and supports JSON export.

The editor includes 104 changed copy pairs: interface wording, removals,
narration, short cues, status descriptions, and variable/singular/plural
variants. Sources and review IDs are kept in the data/export and omitted from
the visible copy comparison. These are temporary review IDs, not production
localization keys. No screenshots or scene context are included.

Approvals and replacement drafts save to `review-decisions.json` next to the
HTML while the local server runs, with browser storage and export as backups.
Editing approved text makes it pending again. Empty approved drafts mean remove
the text. Read the saved choices when the user asks to apply them, matching
source mappings and the recorded before/current values against the repository.
Pending rows are not approvals. This tool does not edit production sources.

Functional browser checks passed for approvals, replacement edits, removals,
reset/use-before, search/filter/bulk approval, reload persistence, export/import,
and literal text handling. Check-generated choices were removed before opening
it for the user. No screenshots were taken for this review tool.

Architecture recommendation at review creation, **subsequently adopted for repeated battle UI copy**: retain the existing
battle presentation catalog and shared server descriptions. Extract repeated
interface copy into small feature-owned TypeScript objects/functions when that
reduces actual duplication. Defer an app-wide localization key scheme and
custom interpolation/plural framework until there is a concrete translation
need. At that point use an established message-format system that supports
whole messages, variables and locale-dependent plurals; see the
[ICU message syntax reference](https://formatjs.github.io/docs/core-concepts/icu-syntax/).

## Approved review implementation

The user returned the completed review and authorized applying it and updating
implementation guidance. All 104 rows are approved; 15 drafts change the first
pass. The original export and contextual accuracy details are preserved in the
[verification record](verification/web-copy/README.md). The accepted voice now
includes shorter prompts, omitted redundant hints and target counts, action-first
reload errors, and concise duration/phase/audio wording. These examples belong
in the [UI guide](web-ui-style-guide.md#copy-voice).

A small feature-owned `web/src/battles/copy.ts` collects repeated interface
messages and typed targeting/duration formatters. Event narration stays in
`eventPresentation.ts`; shared catalog descriptions stay server-owned. No
localization keys, interpolation parser or translation dependency were added.
The [architecture guide](web-client-architecture.md) records this ownership.

Approved removals are respected without leaving empty help paragraphs. Target
hints now say “Choose a target” for every preview shape; server-projected legal
targets and visual footprint highlights are unchanged. The accepted “attack”
instruction has a neutral variant for non-damaging move categories. Confirmed
reward failures keep a concise failure message rather than claiming work is
still in progress.

Verification: the web suite passed **83 tests in 21 suites**, and the web build
passed with TypeScript checking. The 75 reviewed event-narration/short-label
source cases were rendered through `presentEvent` and matched their approved
drafts. Browser checks passed at **1440, 390 and 320 px**, covering the approved
copy in sign-in/list, active/targeting/finished states, inspector durations,
rewards, uncertain action errors, status/weather and move-result playback.
A separate **1440/390 px** healing check confirmed neutral targeting wording
and an unchanged Soft-Boiled submission to an ally. No screenshots were taken.
No backend rules, persistence or catalog descriptions changed in this follow-up.

## Publication check

On **2026-10-20, America/Los_Angeles**, the copy work moved to
`codex/web-battle-copy`, based on the unchanged #171 head `653c2e7`.
The changes are published in draft [#172](https://github.com/ewei068/pokestar/pull/172).
Web tests (**83 tests, 21 suites**), backend tests (**831 tests, 28 suites**),
the production web build, targeted lint of `src/web/battleCatalog.js`, and all
**75** approved narration/label source comparisons passed again. The original
export remains byte-for-byte unchanged; all **102** relative links in the copy
docs and their project entry points resolve. Browser evidence above is from
the implementation review, not a new production or browser acceptance run.

The general README, web README and scoped agent instructions now point future
copy work to the accepted voice guide and review. The guide records the user's
confirmed failure text, “Couldn't award battle rewards.”, separately from
pending rewards. These sources already retain the durable reasoning; the
Compound Engineering documentation check did not create a duplicate solution
note or a new project-wide copy framework.
