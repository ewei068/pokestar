# Pokestar web battler

Last code audit: **2026-10-17, America/Los_Angeles** (2026-10-18 UTC). Local real-battle audio preview added **2026-10-18**.
Checkout: `codex/restore-auto-battle`, HEAD `89572ac4818db6fb6b0a53c10dc8ff1ec7282fb8`.
This is the effort's maintained entry point. Detailed contracts and authoring
rules stay in the linked documents; update those at their source.

## Goal and scope

Give participants a lightweight static website for signing in with Discord,
finding their ongoing battles, inspecting a readable battlefield, and taking
actions with clear ordered visual feedback. Discord and web operate on the
same durable server-owned battle. Keep room for other bot features to gain web
interfaces without migrating those features now.

**Current continuation stage:** the battle audio study move/result stories and nine status/stat stories. The temporary 54-cell review is complete: the user's final export approves all comparisons and preserves exact timings; its review UI was removed. The real battle screen now has a local-only SFX preview driven by the same reached playback frames. Its [replaceable config](../../web/src/battles/audio/soundConfig.ts) covers all 54 move cells, select, hit, faint, restore, six statuses and stat gains. One move cue plays per action, distinct result cues may overlap, and music remains deferred. The user requested these changes remain uncommitted. The [move audio guide](../battle-move-audio-guide.md) records source-independent timing lessons. The prior continuation snapshot is [the SFX handoff](../handoffs/2026-10-17-web-battler-sfx.md).

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
- Event text and its state change start together; the next event waits for both
  to finish. Damage precedes fainting. Batch compatible neighboring events while
  preserving meaningful barriers. Keep the session log uncapped and virtualized.
- Auto shows one final result; remove paced Auto and its Instant Auto setting.
  Simulate privately, check the original revision at commit, and discard stale
  results without charge. A confirmed debit failure also discards the result.
- Use stacked PRs for review; earlier PRs need not be approved before starting
  the next. Visual work proceeds iteratively with user guidance.

## Current state and evidence

**Implemented in this checkout/open PR stack does not mean merged or deployed.**
GitHub inspection during this audit found the implementation stack still open,
including drafts #164–#166. Prototype #160 is closed. No production deployment,
flag state, credentials, live database topology or domain/IP provisioning was
verified here.

| Area                   | Current implementation                                                                                                                                                          | Evidence / limits                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Engine and persistence | Accepted actions, ordered scalar events, immutable generated setup, action replay, revisions, expiry/retention and completion claims                                            | Backend unit tests and snapshot replay checks; real Mongo/restart/concurrent reward gates remain open.                                                                                                                                                                                                                                                                |
| Shared surfaces        | Participant-authorized service, NPC progression, Discord continuation and existing Discord handlers loading fresh Mongo state                                                   | #165 tests cover restart/cache loss, stale web/Discord messages and independent selections. Paid Auto is added by #166.                                                                                                                                                                                                                                               |
| API and static client  | Express Discord OAuth/session/API, safe participant projections, catalog, conditional state-ID polling                                                                          | Unit tests and retained mocked-HTTP browser evidence. The user reported successful local login/real battles and phone viewing; those reports are not a production acceptance run.                                                                                                                                                                                     |
| Presentation           | Session/playback/screen separation, proportional DOM arena, floating HUD, targeting/inspection, mirrored own team, collapsible tray                                             | Current guides plus named stories; layout integration test uses mocked HTTP.                                                                                                                                                                                                                                                                                          |
| Move VFX               | Approved canvas compositions, individual art ingredients, deterministic tile variation and typed editable recipes                                                               | [Alpha evidence](../verification/vfx-alpha/README.md): historical same-browser pixel equality and full-loop checks, with their original sample scope.                                                                                                                                                                                                                 |
| Results and history    | Ordered playing view, concurrent text/state transitions, damage/heal/faint/miss/status/effect-gain reactions, safe batches and Virtua log                                       | [Result](../verification/event-results/README.md), [batch/log](../verification/batched-results/README.md) and [status/effect](../verification/status-effect-results/README.md) records; historical counts, not today's suite totals.                                                                                                                                  |
| Auto                   | Shared bounded background simulation; revision/deadline claim; conditional debit; atomic replay-batch commit; existing completion claim                                         | #166 unit tests cover races, failures and retries. Uncertain payment/final-write claims require manual review. Flag-off legacy Auto keeps upfront payment.                                                                                                                                                                                                            |
| SFX                    | Four representative move stories and nine status/stat-gain stories remain; real battle playback uses a separate sound map and Web Audio player. The 54-cell review is archived. | [Move timing guide](../battle-move-audio-guide.md), [final review](../verification/move-audio-study/README.md), [sound config](../../web/src/battles/audio/soundConfig.ts), and [local setup](../../web/README.md). All 54 move comparisons and the new result examples received favorable user feedback; authenticated desktop and real-phone listening remain open. |

Fresh checks during this audit, on the checkout above with only pre-existing
formatting changes to `src/services/battle.js`:

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
| Visual design                           | [UI style guide](../web-ui-style-guide.md) and [arena guide](../arena-design-guide.md): current accepted direction and review scenarios. Raw [design brief](../design/spec.md), [prototype feedback](../design/prototype-feedback.md) and images are user-supplied context currently **untracked** in this checkout.                                                                        |
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
| Discord parity and Auto                                                | [#164](https://github.com/ewei068/pokestar/pull/164) restores appearance; [#165](https://github.com/ewei068/pokestar/pull/165) consolidates original handlers; [#166](https://github.com/ewei068/pokestar/pull/166) restores Auto. Current branch is #166, based on #165.                                                                                                                                    |

Related pre-existing backlog: [data separation #16](https://github.com/ewei068/pokestar/issues/16),
[Mongo optimization #14](https://github.com/ewei068/pokestar/issues/14),
[target handling #44](https://github.com/ewei068/pokestar/issues/44) and
[documentation #13](https://github.com/ewei068/pokestar/issues/13). These are
related issues, not evidence that the effort's release gates are resolved. No
dedicated SFX issue or approved SFX specification was identified in this audit.

## Limitations, open decisions and next milestones

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
- A broader semantic report/copy system shared with Discord. Current client copy
  is centralized in `eventPresentation.ts`; server combat events remain semantic.

## Verified lessons and maintenance

The durable lessons already live in their authoritative guides: preserve the
Discord presentation while changing authority/storage; treat current account
capability separately from replayable state; compose independently animated
VFX ingredients and review every complete loop at real tile size; separate
canonical state from presented state and reconcile at action boundaries.

`ce-compound`'s durability gate was applied during this audit. No separate
solution note was created because these lessons are already explicit in the
continuation, VFX, architecture and playback guides; another copy would add
maintenance drift. Put a future genuinely missing verified lesson through that
gate rather than turning an untested proposal into policy.

At meaningful milestones update this entry point's status, evidence, accepted
versus proposed decisions, review links and next focus. Update detailed contracts
in place. Preserve immutable dated handoffs as snapshots, rather than using them
as mutable plans. The root `AGENTS.md` points future web-battler work here.
