# Pokestar web battler

Last full code audit: **2026-10-17, America/Los_Angeles** (2026-10-18 UTC). Local music/settings implementation and verification: **2026-10-18**. Local real-battle audio preview added **2026-10-18**. Pokémon cries added **2026-10-19**. Copy research, source comparison and local copy update: **2026-10-19**. Copy publishing and documentation check: **2026-10-20**.
Checkout: `codex/web-battle-polish`, based on `codex/web-battle-copy` ([#172](https://github.com/ewei068/pokestar/pull/172)), based on `codex/battle-cries` ([#171](https://github.com/ewei068/pokestar/pull/171)), based on `codex/battle-music` ([#170](https://github.com/ewei068/pokestar/pull/170)), based on `codex/battle-sfx` ([#169](https://github.com/ewei068/pokestar/pull/169)), based on `codex/restore-auto-battle` ([#166](https://github.com/ewei068/pokestar/pull/166)).
This is the effort's maintained entry point. Detailed contracts and authoring
rules stay in the linked documents; update those at their source.

## Goal and scope

Give participants a lightweight static website for signing in with Discord,
finding their ongoing battles, inspecting a readable battlefield, and taking
actions with clear ordered visual feedback. Discord and web operate on the
same durable server-owned battle. Keep room for other bot features to gain web
interfaces without migrating those features now.

**Current continuation stage:** the user accepted the local desktop/mobile
annotation polish on **2026-10-22** and requested publication in a new PR above
the copy branch. Publishing verification passes 95 web tests, 835 backend tests,
the production build and targeted JavaScript lint. Backend restart/live
forced-skip and trainer-name checks, physical-device input/audio checks and
production cutover remain open.

The approved copy review is applied on
draft [#172](https://github.com/ewei068/pokestar/pull/172), based on #171.
The user returned all 104 review rows approved, with 15 replacement drafts.
The original [review export and application notes](../verification/web-copy/README.md)
are preserved in the repository. The pass adopts shorter prompts, removes
redundant finished-battle help and target counts, and applies the user's reload,
duration, phase and audio wording. A small battle-owned `copy.ts` shares UI
messages and typed formatters; event narration and server catalog ownership
remain in place. [Architecture](../web-client-architecture.md) and
[voice guidance](../web-ui-style-guide.md#copy-voice) record the implementation.
The temporary review editor in `/tmp/pokestar-copy-review/editor/` remains a
historical review snapshot; its source mappings must be checked before reuse.

The user chose to match the existing server voice and to try to use the Pokémon
games' exact wording for equivalent battle events and flavor. Sign-in/list,
action prompts, notices and errors use direct player language; status/cure and
weather narration use familiar battle phrases. Finished and waiting battles
no longer prompt the player to choose a move. Full narration remains separate
from short floating cues, and unknown event causes remain general. The
[copy comparison](../web-copy-audit.md) records the implementation and checks;
[research](../web-copy-research.md) retains the earlier sourced advice. Accepted
voice direction lives in the [UI style guide](../web-ui-style-guide.md#copy-voice).
Approval covers the reviewed copy and documented contextual adjustments;
production cutover and exact wording across every generation remain distinct.

The first native-annotation UI polish batch is implemented locally on
**2026-10-21**. It simplifies the battle heading and formation labels, fixes
three-digit levels, removes the readiness rail, and reorganizes Pokémon/move
inspection. Forced participant skips now use durable server progression.
The [nine-comment implementation and verification record](../verification/widescreen-polish/README.md)
separates checked behavior and the user's local UI acceptance from the pending
backend restart/live forced-skip check.

The second annotation batch is implemented locally on **2026-10-22**: solo
trainer display names, explicit Cancel during move selection, compact phone
targeting controls, touch/pen target confirmation, and shared colored status
abbreviations. The [mobile feedback verification](../verification/mobile-polish/README.md)
records 95 web and 835 backend tests, responsive browser checks, and the running
backend's pending restart for trainer names. The user accepted the local UI;
physical touch-device acceptance remains separate.
The same-day follow-up allows a second tap on the staged primary target to use
the move; tapping a different target still changes the preview.

Feedback workflow research on **2026-10-20** compares narrated recordings,
native Codex annotations/voice, selective transcript/frame retrieval and
instrumented capture tools. The [research and proposed pilot](../ui-feedback-tools-research.md)
recommend annotations for static polish and short media evidence for motion,
audio and phone behavior. Native annotations supplied both accepted batches
above. Recording extraction and external-tool pilots remain proposals; no
capture integration was installed and no recording was analyzed.

Phone audio review remains open. The catalog has five default tracks plus
dungeon, trainer and raid themes and a per-battle override. Real battle pages
attempt autoplay without playback controls, retry on input and page return,
pause while hidden, and resume on return; stories retain manual Play/Pause.
Site Settings owns master mute and separate Music and Sound effects sliders.
Simulated recovery tests and the build passed previously; real-device autoplay,
interruption recovery and listening remain unverified. See the
[music behavior/review](../battle-music-plan.md) and
[catalog](../../web/src/battles/audio/musicCatalog.json). Turn-start cries are in
draft [#171](https://github.com/ewei068/pokestar/pull/171), stacked on music
[#170](https://github.com/ewei068/pokestar/pull/170) and SFX
[#169](https://github.com/ewei068/pokestar/pull/169); the user judged cries working
well locally. The prior [SFX handoff](../handoffs/2026-10-17-web-battler-sfx.md)
is an old snapshot.

### User-accepted decisions

These come from the project conversation, including later corrections; they
are distinct from implementation defaults and future suggestions.

- Static React/TypeScript/Vite client; backend owns identity, rules and durable
  state. The current implementation ships a display catalog, not the bot/engine
  bundle, to the browser. Other bot functions are future scope.
- Participants only; multiple ongoing battles; Discord starts/selects battles
  and can link to web. Every started mode is the intended eventual coverage,
  with complete first-release mode parity flexible rather than mandatory.
- Participants may act through either surface. Old Discord messages may be
  stale; read current state and reject/refresh stale actions. Preserve the
  original Discord menus and interaction layout when changing storage.
- Battles survive browser closure and same-ruleset restarts. Preserve generated
  starting Pokémon independently of later team edits. Incompatible engine/data
  updates may invalidate/clear active battles through an explicit maintenance
  procedure; that script is outside current work.
- Poll first, preserving a path to SSE/WebSockets. Ordered events are shared
  regardless of action origin. Open at the current view; animate only subsequent
  updates. NPCs resolve automatically, with client playback making their turns
  understandable. Final state is the priority in Discord.
- Abandoned battles may expire without rewards; mode deadlines take precedence.
  Finished links remain read-only for a limited time. Exact durations are not
  a recorded user decision; current defaults are in the persistence contract.
- Reusable VFX by 18 standard types × Physical/Special/Status, including every
  resolved footprint tile, even empty ones. Unknown/Shadow/Stellar use Normal.
  Motion depends on action category/self-targeting, independently of move type.
  Custom move overrides are future headroom, not required alpha content.
- The user approved the 54-effect alpha, final Normal Physical timing, and the
  continuous floating-HUD arena. Approval applies to those reviewed visuals,
  not to untested production behavior or future changes.
- The user judged the first four move timing examples favorably and chose custom sounds for real move cues. The completed 54-cell comparison review approved every candidate as a listening reference, not a production asset. The user liked the six battle-status and buff/neutral/debuff examples, with buff and neutral sharing the stat-raise cue, replaceable sources. Pokémon cries and trainer-specific battle music are P1.
- For cries, the user chose PokeAPI's `latest` cries, played every time a Pokémon's turn begins. Custom species use an explicit map to a real base species (`web/src/battles/audio/crySpecies.json`), never ID truncation.
- For music, the user clarified that a page reload or entry into a different battle should choose a new track. One chosen track loops during that visit. They accepted example encounter-specific tracks and a site-wide settings entry point with separate Music and Sound effects sliders. They later requested automatic music on real battle pages without a playback button, manual Play/Pause in stories, pause while hidden with automatic resume on return, and recovery on ordinary interaction or page return while retaining full-page navigation. Preferences persist locally; real-device recovery and the track mix still need review.
- Event text and its state change start together; the next event waits for both
  to finish. Damage precedes fainting. Batch compatible neighboring events while
  preserving meaningful barriers. Keep the session log uncapped and virtualized.
- Auto shows one final result; remove paced Auto and its Instant Auto setting.
  Simulate privately, check the original revision at commit, and discard stale
  results without charge. A confirmed debit failure also discards the result.
- Use stacked PRs for review; earlier PRs need not be approved before starting
  the next. Visual work proceeds iteratively with user guidance.
- Match web copy to the user's existing server voice. The accepted direction
  and source ownership are in the [UI style guide](../web-ui-style-guide.md#copy-voice);
  battle flavor should try to match the games' exact wording when the event
  and Pokestar's mechanics support it. Server copy written from memory is a
  voice reference, not a verified transcript. No generation was specified.

## Current state and evidence

**Implemented in this checkout/open PR stack does not mean merged or deployed.**
GitHub inspection during this audit found the implementation stack still open,
including drafts #164–#166 and audio drafts #169–#170. Prototype #160 is closed. No production deployment,
flag state, credentials, live database topology or domain/IP provisioning was
verified here.

Continuation check on **2026-10-19** confirmed local HEAD `653c2e7` on
`codex/battle-cries` and GitHub drafts #171 → #170 → #169 → #166 still open,
with the documented base/head chain. This was a targeted source/copy inspection,
not another full code audit or test run. Pre-existing untracked research,
design material and scratch notes remain outside this phase's changes.

Publishing check on **2026-10-20** confirmed #171 remains an open draft and
its remote head matches the copy review's base, `653c2e7`. The copy branch keeps
that parent unchanged. Web tests (**83/21 suites**), backend tests (**831/28
suites**), the web production build and targeted JavaScript lint passed again.
All **75** reviewed narration/label cases match the approval export, the export
is unchanged, and **102** relative documentation links resolve. Earlier browser
evidence remains recorded below; this publishing check did not repeat browser
review or production acceptance.

| Area                   | Current implementation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Evidence / limits                                                                                                                                                                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine and persistence | Accepted actions, ordered scalar events, immutable generated setup, action replay, revisions, expiry/retention and completion claims                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Backend unit tests and snapshot replay checks; real Mongo/restart/concurrent reward gates remain open.                                                                                                                                                                     |
| Shared surfaces        | Participant-authorized service, NPC progression, Discord continuation and existing Discord handlers loading fresh Mongo state                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | #165 tests cover restart/cache loss, stale web/Discord messages and independent selections. Paid Auto is added by #166.                                                                                                                                                    |
| API and static client  | Express Discord OAuth/session/API, safe participant projections, catalog, conditional state-ID polling                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Unit tests and retained mocked-HTTP browser evidence. The user reported successful local login/real battles and phone viewing; those reports are not a production acceptance run.                                                                                          |
| Presentation           | Session/playback/screen separation, proportional DOM arena, floating HUD, targeting/inspection, mirrored own team, collapsible tray                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Current guides plus named stories; layout integration test uses mocked HTTP.                                                                                                                                                                                               |
| Move VFX               | Approved canvas compositions, individual art ingredients, deterministic tile variation and typed editable recipes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | [Alpha evidence](../verification/vfx-alpha/README.md): historical same-browser pixel equality and full-loop checks, with their original sample scope.                                                                                                                      |
| Results and history    | Ordered playing view, concurrent text/state transitions, damage/heal/faint/miss/status/effect-gain reactions, safe batches and Virtua log                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | [Result](../verification/event-results/README.md), [batch/log](../verification/batched-results/README.md) and [status/effect](../verification/status-effect-results/README.md) records; historical counts, not today's suite totals.                                       |
| Auto                   | Shared bounded background simulation; revision/deadline claim; conditional debit; atomic replay-batch commit; existing completion claim                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | #166 unit tests cover races, failures and retries. Uncertain payment/final-write claims require manual review. Flag-off legacy Auto keeps upfront payment.                                                                                                                 |
| SFX                    | Four representative move stories and nine status/stat-gain stories remain; real battle playback uses a separate sound map and Web Audio player. The 54-cell review is archived. The Vite-development gate has been removed locally. Draft #171: a `turnStarted` frame plays the active Pokémon's cry (gain 0.6, allowed to ring up to 3 s past the 820 ms announcement); all 1,351 PokeAPI Pokémon/form cries (26 MB of MP3) live in `web/public/audio/cries`, so new species need only a `crySpecies.json` entry when custom; `npm --prefix web run download-cries` fetches cries PokeAPI adds later; each battle's cries are warmed after audio unlocks. | [Move timing guide](../battle-move-audio-guide.md), [final review](../verification/move-audio-study/feedback-final.json), [sound config](../../web/src/battles/audio/soundConfig.ts). Earlier SFX feedback was favorable; production and real-phone listening remain open. |
| Music and settings     | Draft #170: five default battle tracks, a six-track dungeon pool, named trainer and raid themes, a streaming music player, site Settings, separate volume sliders and SFX preference migration.                                                                                                                                                                                                                                                                                                                                                                                                                                                            | [Music behavior/review](../battle-music-plan.md). Backend/web tests and build passed; browser preview showed controls and persistence. No subjective listening approval or real-phone audio test.                                                                          |

Local copy update (2026-10-19): the web suite passes **83 tests in 21 suites**;
the backend suite passes **831 tests in 28 suites**; the production web build
passes. Targeted JavaScript lint and browser copy/layout review are recorded
in the [copy verification](../web-copy-audit.md#verification). The approved-review
follow-up also passes the web suite/build, checks 75 reviewed narration/label
source cases against the returned drafts, and passes mocked-HTTP browser checks
at 1440/390/320 px plus ally-healing instructions/submission at 1440/390 px.
See the [applied review](../web-copy-audit.md#approved-review-implementation).

Latest checks at the #170 commit (2026-10-19): `npx jest` 831 tests in 28
suites, `npm --prefix web test` 75 passed, and the web build passed. At #171 (2026-10-19): `npm --prefix web test` 80 passed and the web
build passed; the user listened locally, but cries are untested on a phone. The
original 2026-10-17 audit checks, on #166 plus a formatting-only diff to
`src/services/battle.js` (now committed in #170):

- `npx jest --runInBand --silent`: **828 tests, 27 suites passed**.
- `npm --prefix web test`: **52 tests, 14 suites passed**.
- `npm --prefix web run build`: **passed**, including TypeScript checking.
  Virtua/Rollup PURE-annotation warnings remain non-fatal. Main JS was about
  68.6 kB gzip; these measurements are a snapshot, not a budget or SLA.
- No browser, live OAuth, real Mongo or production action was run for this audit.
  Prior browser artifacts explicitly separate stories/mocked HTTP from live
  server verification. The preceding Auto implementation also passed ESLint.

## Read the authoritative document for the task

| Task                                    | Read / what it owns                                                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overall system and extension seams      | [Web client architecture](../web-client-architecture.md): shell, feature/session/screen/board responsibilities, catalog and future routing/rendering decisions. [ADRs](../adr/0001-share-durable-battles-across-surfaces.md) and [event ADR](../adr/0002-return-ordered-combat-events-with-battle-state.md): shared durable identity and ordered outcomes.                                  |
| Backend lifecycle and deployment gates  | [Backend plan](../web-battler-backend-plan.md), [durable record contract](../durable-battle-records.md), [shared service](../shared-battle-service.md), [completion boundary](../battle-completion-boundary.md).                                                                                                                                                                            |
| API data, storage size and client setup | [Client plan](../web-battler-client-plan.md): current projected responses, catalog and conditional polling; its old BSON numbers are explicitly historical. [Web README](../../web/README.md): env variable names, commands, static hosting, local HTTPS/iPhone trust and mocked-HTTP layout check. Read templates, not local secrets.                                                      |
| Discord behavior and Auto               | [Continuation contract](../discord-battle-continuation.md): original controls, compact locators, live reads, Auto finalization/payment and recovery boundaries.                                                                                                                                                                                                                             |
| Combat and presentation                 | [Event contract](../combat-event-contract.md): event metadata, targeting footprints, weather/readiness. [Result playback](../battle-result-playback.md) and [result extension notes](../../web/src/battles/results/README.md): observations, reconciliation, timing, batching, copy and log ownership.                                                                                      |
| Battle music and audio settings         | [Music behavior and review](../battle-music-plan.md): accepted page-visit selection, theme projection, site settings and remaining listening checks.                                                                                                                                                                                                                                        |
| Visual design                           | [UI style guide](../web-ui-style-guide.md) and [arena guide](../arena-design-guide.md): current accepted direction and review scenarios. Raw [design brief](../design/spec.md), [prototype feedback](../design/prototype-feedback.md) and images are user-supplied context currently **untracked** in this checkout.                                                                        |
| Copy and voice                          | [UI style guide](../web-ui-style-guide.md#copy-voice): accepted server/game-voice direction and source ownership. [Copy comparison](../web-copy-audit.md): inspected examples, current locations, implemented rewrites and verification. [Copy research](../web-copy-research.md): sourced advice and proposed workflow, not additional accepted policy. |
| VFX changes                             | [VFX guide](../battle-vfx-guide.md): complete-loop quality bar, highlighted examples, ingredient/choreography workflow and verification. [Recipe guide](../../web/src/battles/vfx/recipes/README.md): editable settings versus rendering code. [Art notes](../../media/vfx/components/README.md) and [arena provenance](../../web/src/battles/arena/assets/README.md): asset roles/sources. |
| Historical alternatives                 | [Feasibility](../web-battler-feasibility.md) and [VFX tool research](../battle-vfx-workflow-research.md): initial options and dated research. They do not supersede current contracts; tool prices/capabilities need rechecking before use. The research file is currently untracked.                                                                                                       |

## Milestones and review references

PR state below was checked during this audit. Follow the actual base/head chain
when reviewing or merging; many intermediate VFX experiments remain open and
are not independent alternatives to the current renderer.

| Milestone                                                              | Review references                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Engine, events, durability, modes                                      | [#116](https://github.com/ewei068/pokestar/pull/116) through [#131](https://github.com/ewei068/pokestar/pull/131); individual links and purposes are in the backend plan. [#132](https://github.com/ewei068/pokestar/pull/132) verifies service recreation.                                                                                                                                                  |
| Browser projection, OAuth/API, static client, conditional updates      | [#133](https://github.com/ewei068/pokestar/pull/133), [#134](https://github.com/ewei068/pokestar/pull/134), [#135](https://github.com/ewei068/pokestar/pull/135), [#136](https://github.com/ewei068/pokestar/pull/136).                                                                                                                                                                                      |
| Session seam, footprints, UI and stories                               | [#137](https://github.com/ewei068/pokestar/pull/137), [#139](https://github.com/ewei068/pokestar/pull/139), [#140](https://github.com/ewei068/pokestar/pull/140), [#141](https://github.com/ewei068/pokestar/pull/141).                                                                                                                                                                                      |
| Move matrix, accepted composition, recipe extraction and alpha cleanup | Initial [#142](https://github.com/ewei068/pokestar/pull/142)/[#143](https://github.com/ewei068/pokestar/pull/143); final composition [#153](https://github.com/ewei068/pokestar/pull/153); configuration [#155](https://github.com/ewei068/pokestar/pull/155), integration [#156](https://github.com/ewei068/pokestar/pull/156). Approved pre-refactor baseline: `1514fedd93deb5119bc60a8981b550940c530f58`. |
| Result sequencing, batches/log and reactions                           | [#157](https://github.com/ewei068/pokestar/pull/157), [#158](https://github.com/ewei068/pokestar/pull/158), [#159](https://github.com/ewei068/pokestar/pull/159).                                                                                                                                                                                                                                            |
| Arena and local development                                            | Prototype [#160](https://github.com/ewei068/pokestar/pull/160) is closed; production [#161](https://github.com/ewei068/pokestar/pull/161), targeting/facing/jump [#162](https://github.com/ewei068/pokestar/pull/162), local HTTPS [#163](https://github.com/ewei068/pokestar/pull/163).                                                                                                                     |
| Discord parity and Auto                                                | [#164](https://github.com/ewei068/pokestar/pull/164) restores appearance; [#165](https://github.com/ewei068/pokestar/pull/165) consolidates original handlers; [#166](https://github.com/ewei068/pokestar/pull/166) restores Auto, based on #165.                                                                                                                                                            |
| Battle SFX                                                             | [#169](https://github.com/ewei068/pokestar/pull/169) adds move/result/UI sounds with volume and mute, stacked on #166.                                                                                                                                                                                                                                                                                       |
| Battle music and audio settings                                        | [#170](https://github.com/ewei068/pokestar/pull/170) adds page-visit battle music, encounter themes and site Settings with separate Music/SFX sliders, stacked on #169.                                                                                                                                                                                                                                      |
| Pokémon cries                                                          | [#171](https://github.com/ewei068/pokestar/pull/171) plays each Pokémon's PokeAPI cry when its turn begins, with all 1,351 cries committed and an explicit custom-species map, stacked on #170. |
| Approved copy and voice                                                | [#172](https://github.com/ewei068/pokestar/pull/172) applies the author's 104-row copy review and records accepted examples, small feature-owned copy helpers and source ownership, based on #171. |

Related pre-existing backlog: [data separation #16](https://github.com/ewei068/pokestar/issues/16),
[Mongo optimization #14](https://github.com/ewei068/pokestar/issues/14),
[target handling #44](https://github.com/ewei068/pokestar/issues/44) and
[documentation #13](https://github.com/ewei068/pokestar/issues/13). These are
related issues, not evidence that the effort's release gates are resolved. No
dedicated SFX issue was identified; SFX direction is recorded in the
[move audio guide](../battle-move-audio-guide.md) and #169.

## Limitations, open decisions and next milestones

### Copy phase continuity

- The approved review is applied on the copy branch and retained in the verification
  record. Check any future review snapshot against the current source before
  applying it. No specific generation's wording is prescribed.
- The reference corpus mixes older server writing and newer web-related code;
  a server file path alone does not establish human authorship. Shared catalog
  descriptions already appear on both interfaces.
- Some detailed server narration has no equivalent semantic event metadata
  (for example, `actionBlocked` has no reason). Keep unknown causes general;
  richer reporting is separate from the wording pass.

### Required before production cutover

- Real Mongo/index/restart and authenticated cross-surface acceptance checks,
  including mode completion, current Discord UI and Auto. Earlier local Mongo
  topology observations and the user's production description are not current
  production verification.
- Per-effect reward/quest idempotency and recovery for partial multi-document
  writes; concurrent raid updates. Completion claims coordinate work but do not
  provide atomic exactly-once rewards across documents.
- Payment/finalization claim recovery: retain and reconcile uncertain Auto claims.
  Drain/reconcile claims before rolling back to code that does not honor them.
- Verify deployment flags, ruleset compatibility, hosting/domain/static IP,
  HTTPS/OAuth origins. No deploy, production flag change, credential mutation or battle clearing is part of the current continuation.

### Preserve flexibility / deferred until needed

- Per-move VFX overrides and editor tuning UI (P1), richer shaders or a dedicated
  effect runtime: revisit when a concrete effect exceeds current compositions.
- SSE/WebSockets and proactive Discord message synchronization: revisit based
  on traffic, latency or a feature needing push.
- Canvas for the whole board, shared UI tokens/components, a larger router/cache
  or other bot web features: revisit when measured rendering cost or a second
  real feature supplies evidence. The board is DOM; tile effects already use canvas.
- Restore mode-specific result/replay buttons after losing local UI context.
- Historical log recovery across reconnect; current log is uncapped only within
  a session, and its in-memory entries still grow despite DOM virtualization.
- Long-battle replay/BSON profiling and VFX per-effect loading/lossless asset
  optimization. Current action entries omit snapshots, but replay remains linear
  and the single Mongo document still has a finite size limit.
- A broader semantic report/copy system shared with Discord. Client event copy
  lives in `eventPresentation.ts`, repeated battle UI wording in `copy.ts`, and
  server combat events remain semantic. Revisit app-wide localization when a
  specific language and translation workflow are in scope.

## Verified lessons and maintenance

The durable lessons already live in their authoritative guides: preserve the
Discord presentation while changing authority/storage; treat current account
capability separately from replayable state; compose independently animated
VFX ingredients and review every complete loop at real tile size; separate
canonical state from presented state and reconcile at action boundaries.

`ce-compound`'s durability gate was applied during this audit. No separate
solution note was created because these lessons are already explicit in the
continuation, VFX, architecture and playback guides; another copy would add
maintenance drift. The same gate was checked for the copy phase on 2026-10-20:
the voice guide, architecture and approved review already preserve the decisions
and reasoning. The 2026-10-22 polish wrap-up also passed that gate without a new
solution note: the shared-service contract explains why matching cursors must
still resume automatic turns, and the architecture/arena guides preserve target
confirmation and display-name boundaries. General and web README pointers lead
to those sources. Put a future genuinely missing verified lesson through that
gate rather than turning an untested proposal into policy.

At meaningful milestones update this entry point's status, evidence, accepted
versus proposed decisions, review links and next focus. Update detailed contracts
in place. Preserve immutable dated handoffs as snapshots, rather than using them
as mutable plans. The root `AGENTS.md` points future web-battler work here.
