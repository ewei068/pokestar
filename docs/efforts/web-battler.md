# Pokestar web battler

Status: consolidated on **2026-10-23**; review feedback applied on
**2026-10-24, America/Los_Angeles**. The
implementation is open for review, with production cutover gates still open.
This is the maintained entry point; update contracts at their linked source.

## Review stack

Review and merge from bottom to top. Each PR targets the preceding branch;
the server foundation targets `main`.

| Order | PR | Review boundary |
| --- | --- | --- |
| 1 | [#175](https://github.com/ewei068/pokestar/pull/175) | Durable engine/service, participant projection, Discord continuation, modes, rewards and Auto |
| 2 | [#176](https://github.com/ewei068/pokestar/pull/176) | Discord OAuth, sessions, authenticated HTTP API, catalog and server setup |
| 3 | [#177](https://github.com/ewei068/pokestar/pull/177) | Static app shell, client login integration and recoverable authentication screens |
| 4 | [#178](https://github.com/ewei068/pokestar/pull/178) | Battle list, conditional polling, target selection and revision-checked actions |
| 5 | [#179](https://github.com/ewei068/pokestar/pull/179) | Accepted arena, ordered result playback, VFX, copy, sound, music and cries |
| 6 | [#181](https://github.com/ewei068/pokestar/pull/181) | Remove temporary effort documents, retain contracts and evidence, repair references |

The API follows the server foundation because it consumes the durable service
and participant projection. The client integration layer uses the existing
pre-animation UI; the presentation layer carries its accepted visual and audio
replacement. The music test that reads client files belongs to that final layer.

At the restack checkpoint, presentation commit `8c92b49` exactly matched original
tip `ef4377af008914b22b256d368262104a49a66802`. The later review fixes below
intentionally change that implementation; the final layer still changes
documentation only. The original stack, including its experimental branches, remains
recoverable through the pushed tag
[`archive/web-battler-pre-restack-2026-10-23`](https://github.com/ewei068/pokestar/tree/archive/web-battler-pre-restack-2026-10-23).
The 53 superseded PRs were closed as historical review records; use
the stack above for current work. The UI and arena side prototypes have their
own `archive/web-battler-*-prototype-2026-10-23` tags.

## Goal and scope

Give participants a static website for signing in with Discord, finding ongoing
battles, inspecting the battlefield and taking actions with ordered visual
feedback. Discord and web share one durable, server-owned battle. Other bot
features remain outside this effort.

### User-accepted decisions

These come from the project conversation, including later corrections; they
are distinct from implementation defaults and future suggestions.

- Initial rollout is intentionally silent: omit Discord-to-web battle links while
  verifying the hosting/login setup. Their absence is not a rollout blocker.

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

## Review feedback — 2026-10-24

Nine comments across #175, #176 and #179 were investigated. The implementation
changes are on their owning PRs and propagated upward with forward merges;
published history was preserved.

- Removed six unshipped durable action IDs and their compatibility handler.
  `/continue-battle` retains its picker and pagination events.
- Restored configured Discord interaction rewards for successful current,
  stale and legacy clicks. Explicit errors still skip these rewards; service
  completion rewards and Auto payment claims remain separate.
- Replaced manual cookie parsing/serialization with `cookie-parser` and
  Express cookies. HTTPS host-only names, flags, lifetimes, revocation and
  callback recovery are preserved; malformed/JSON cookie values are rejected.
- Moved status display metadata to shared server configuration. The catalog
  selects display fields from it, allowing reuse in the bot without exposing
  future internal fields.
- Added a production-build module check against battle stories, test source
  and current test-only runtime packages. Both emitted JS chunks were audited:
  112 modules, zero development/test modules. A reachable story injected as a
  negative control was rejected. `public/` media remains separate static output.

The [architecture guide](../web-client-architecture.md) records why the catalog
remains a useful transport boundary, which OAuth/session libraries could replace
the current adapter, and future Howler/Anime.js/PixiJS seams. The
[arena source notes](../../web/src/battles/arena/assets/README.md) distinguish
imported feature assets from verbatim `public/` assets. These discussion answers
do not authorize an auth or rendering migration.

Verification: server foundation **836 tests / 26 suites**, API **874 / 29**,
combined implementation **877 / 30**, web **105 / 23**, TypeScript and production
build passed. Targeted JavaScript lint and whitespace checks passed. Existing
non-fatal warnings remain. No real-provider/database/device checks were repeated.

## Verification and acceptance

Production-readiness review on **2026-10-24**: **not ready for public cutover**.
The [readiness report](../verification/production-readiness-2026-10-24.md) records
fresh passing backend (877 / 30), client (105 / 23), root/subpath build checks,
and the remaining security and deployment gates. New findings include backend
dependency/runtime maintenance, conditional fail-open vote authentication on
the shared listener, missing HTTP rate limits, absent Discord-to-web battle
links, and slow-request/startup recovery gaps. Same-site HTTPS domains are
required by the current cookie design. Existing reward/Auto reconciliation and
real Mongo/OAuth/cross-surface checks remain blocking. Runtime code and production
configuration were not changed; the report includes a proposed Pages/GCP rollout
sequence, not evidence of deployment.

Maintenance implementation on **2026-10-25** follows the
[accepted plan](../plans/2026-10-24-web-battler-runtime-and-rate-limits.md).
Vote authentication now fails closed. The HTTP package batch, Node 24.22.1
compatibility/CI lane, route quotas and browser cooldown/cancellation are
implemented locally. The [maintenance verification record](../verification/runtime-rate-limits-2026-10-24.md)
records passing local checks, remaining dependency advisories and the unverified
Mongo/VM/proxy/provider promotion gates. Production configuration is unchanged;
this does not establish production readiness.

Manual Pages deployment on **2026-10-25**: the new top deployment/readiness
layer includes `.github/workflows/deploy-web.yml`. Once merged to `main`,
**Deploy web battler** runs only by manual dispatch on the default branch;
repository variable `VITE_API_ORIGIN` supplies the public HTTPS API origin.
Pages settings supply the site domain/base path. The [setup steps](../../web/README.md#manual-github-pages-deployment)
cover Pages/variables, HTTPS/DNS and matching backend OAuth configuration.
Creating the workflow does not enable Pages, change DNS or publish a site.
Local checks passed: actionlint, public API-origin acceptance/rejection cases,
116 client tests, and production builds for `/` and `/pokestar/` with the
configured API origin embedded. Independent workflow/security review found no
actionable issues. A real Pages deployment was not run.

Local restack verification on **2026-10-23**:

| Boundary | Observed result |
| --- | --- |
| Server foundation | 832 Jest tests / 26 suites passed |
| Server API | 860 Jest tests / 29 suites passed |
| Client login/shell | 10 web tests passed; TypeScript and production build passed; lockfile dry-run passed |
| Client battle integration | 25 web tests / 8 suites passed; TypeScript and production build passed |
| Full implementation | 863 Jest tests / 30 suites and 105 web tests / 23 suites passed; TypeScript and production build passed |
| Preservation | Exact Git-tree equality between the presentation layer and original tip; final cleanup is documentation only |
| Remote checks | All six replacement PRs passed GitHub Jest and notification checks before retirement of the old stack; web checks remain local |

The 2026-10-23 restack GitHub-native check found no actionable review feedback, failing
checks or stale managed branches. All six PRs report `MERGEABLE` / `CLEAN`;
each proposed merge tree equals its reviewed head tree, and every upper base
points to the preceding reviewed head. GitHub chains synthetic merge commits
through the stack. The current `ce-babysit-pr` helper expects a direct branch
parent, so it reports `base_ref_blocker: race` on upper layers despite matching
refs. Its automatic certification remains limited; the direct ref/tree check
above is separate evidence, not a changed or suppressed helper result. No
branch update, rebase, merge or code change was made to quiet that detector.

These checks verify the stack boundaries and preserve the existing implementation.
They do not repeat browser, provider, real-database or physical-device acceptance.
The web build retains non-fatal Virtua/Rollup annotation warnings; tests retain
existing EventEmitter and static-rendering warnings.

Earlier acceptance remains scoped to its recorded evidence: the user approved
the 54-effect alpha, the copy review, the desktop/mobile annotation polish and
local login recovery screens. Cries worked well in the user's local listening.
Keep these records because their approvals and unverified cases cannot be
reconstructed from code:

- [Attack VFX alpha](../verification/vfx-alpha/README.md) and its immutable baseline comparisons.
- [Ordered results](../verification/event-results/README.md), [batching/log](../verification/batched-results/README.md), and [status/effect reactions](../verification/status-effect-results/README.md).
- [Approved copy](../verification/web-copy/README.md), including the original 104-row approval export and contextual adjustments.
- [Desktop annotation polish](../verification/widescreen-polish/README.md) and [mobile targeting/status polish](../verification/mobile-polish/README.md).
- [Login/channel recovery](../verification/login-recovery/README.md), including API-first rollout and pending real OAuth/Discord checks.
- [Move-audio listening feedback](../verification/move-audio-study/feedback-final.json); these were comparison references, not proof of phone audio behavior.

No deployment, production flag change, credential mutation, battle clearing,
runtime restart or live battle action is part of this restack.

## Authoritative guides

| Task | Source |
| --- | --- |
| System seams and module ownership | [Client architecture](../web-client-architecture.md), [durability ADR](../adr/0001-share-durable-battles-across-surfaces.md), [ordered-event ADR](../adr/0002-return-ordered-combat-events-with-battle-state.md) |
| Persistence, service and completion | [Durable records](../durable-battle-records.md), [shared service](../shared-battle-service.md), [completion boundary](../battle-completion-boundary.md) |
| HTTP/browser contract and setup | [Browser/API contract](../battle-web-contract.md), [web README](../../web/README.md), `.env.in` and `web/.env.example`; read templates, not secrets |
| Discord behavior and Auto | [Continuation contract](../discord-battle-continuation.md) |
| Combat events and playback | [Event contract](../combat-event-contract.md), [result playback](../battle-result-playback.md), [result extension notes](../../web/src/battles/results/README.md) |
| Visual design and copy | [UI and copy guide](../web-ui-style-guide.md), [arena guide](../arena-design-guide.md) |
| VFX authoring and asset provenance | [VFX guide](../battle-vfx-guide.md), [recipe guide](../../web/src/battles/vfx/recipes/README.md), [art notes](../../media/vfx/components/README.md), [arena sources](../../web/src/battles/arena/assets/README.md) |
| Audio behavior and timing | [Music/settings](../battle-audio.md), [move timing](../battle-move-audio-guide.md) |

## Remaining work

### Required before production cutover

- Complete the real-environment promotion checks in the
  [maintenance record](../verification/runtime-rate-limits-2026-10-24.md).
  Node 24 passes locally; legacy Mongo driver support and actual VM/proxy
  compatibility remain unverified. Remaining serious dependency exposures need
  explicit assessment or a separate verified update before public cutover.

- Keep `DURABLE_BATTLES_ENABLED`, `DURABLE_RAIDS_ENABLED` and
  `WEB_BATTLER_ENABLED` off in production until their rollout checks are accepted.
  Durable PvE/PvP, dungeon and tower starts use the first flag; raids require
  both durable flags. `/continue-battle` is registered in every stage.
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
- Run real OAuth/Discord recovery and physical touch/pen/audio checks,
  including autoplay, interruptions and resume. Responsive browser views and
  mocked media/input tests do not establish physical-device acceptance.

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

## Repository maintenance

The cleanup layer removes the superseded backend plan, feasibility study,
copy audit/research, feedback-tool research and dated SFX handoff. The client
plan becomes the browser/API contract; the music plan becomes the audio behavior
guide. Their current contracts, cutover gates and copy verification survive in
the sources above. Approval exports, browser evidence, runtime assets and their
editable recipes remain tracked. Untracked research, design and scratch files
are user work and remain untouched.

The 53 superseded PRs are closed and their 54 local/remote branches (including
the already-closed arena prototype) are deleted. Their heads were unchanged
and no old review threads or change-request reviews remained unresolved. The
six replacement branches remain for review. Keep them until merged and retain
the archive tags for historical VFX comparisons. The unrelated agent-setup PR
and other worktrees are outside this cleanup.

Follow-ups for a separate repository change:

- Run the updated backend/client test and production-build CI matrix remotely;
  the new Node 24 and temporary Node 18 lanes are locally verified only so far.
- Review static asset caching/hosting before public rollout: checked-in audio
  is 37,455,478 bytes and music is 56,094,812 bytes before HTTP compression.
  Music streams per visit; these totals are not the initial page transfer.
- Refresh the older public tutorial independently; its early feature-status
  claims predate this effort. Review related backlog [#16](https://github.com/ewei068/pokestar/issues/16), [#14](https://github.com/ewei068/pokestar/issues/14), [#44](https://github.com/ewei068/pokestar/issues/44) and [#13](https://github.com/ewei068/pokestar/issues/13) before closing anything.

Deleting obsolete files and branches does not shrink historical Git objects.
History rewriting and unrelated branch/worktree removal are outside this task.
