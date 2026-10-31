---
artifact_contract: "ce-handoff/v1"
created_at: "2026-10-30T05:15:11+00:00"
title: "Pokestar web navigation and visual foundation"
summary: "Resume after the approved parity backlog: design navigation and representative responsive screens for #237, with bounded shared-operation discovery for #235."
keywords: ["pokestar", "web-release", "navigation", "visual-foundation", "237", "235"]
cwd: "/Users/elviswei/.codex/worktrees/d66b/pokestar"
resume_focus: "Navigation map, representative desktop/mobile screens, and the shared-operation questions they expose; no full feature implementation in this next scope."
repository: "ewei068/pokestar"
repo_root_sha: "397c25d6c7fb6a305fa83fac54beaa2b36579877"
branch: "codex/web-parity-planning-handoff"
head: "a6f74e07b6fa3a807f05dfec01411c66780b5ff1"
worktree_path: "/Users/elviswei/.codex/worktrees/d66b/pokestar"
---

# Next-session handoff: navigation and visual foundation

## Continuation checkpoint — 2026-10-30

The original handoff below is historical. Current work is on
`codex/web-navigation-foundation`, based on `codex/web-release`; the long-running
release draft is [PR #240](https://github.com/ewei068/pokestar/pull/240).

Navigation is now Play, Pokémon, Catch, Rewards, More; Bag is a header icon and
Settings a cog. The maintainer selected Dusk Arcade / Jewel as the working visual
direction. See the [UI guide](../web-ui-style-guide.md),
[editable studies](../design/web-navigation/README.md),
[operation discovery](../web-player-operations.md), and
[first-slice plan](../plans/2026-10-30-1740-feat-web-first-playable-slice-plan.md).
The studies remain standalone fixtures; no production gameplay implementation or
#235 proof is complete. The design/planning changes are preserved on `codex/web-navigation-foundation`.
The Jewel shell has since been implemented and locally verified; the maintained
[effort checkpoint](../efforts/web-battler.md) records evidence and limitations.
Trainer initialization follows shell approval and merge. Read the current plan
before using the old launch prompt.

## Where the work stands

The user asked to finish the web parity audit, review a release cut, publish the
approved tickets/priorities, clean temporary work, persist this documentation and
prepare this next-session scope. The audit and ticket publication are complete;
no navigation design or feature implementation was started in this session.

The branch is `codex/web-parity-planning-handoff`, based on `a6f74e0`.
The frontmatter HEAD is the capture point before the documentation wrap-up commit;
load the pushed branch tip to include this handoff and the planning package.
The `cwd`/worktree path is machine-local capture context, not a required next
checkout. Do not depend on the removed localhost review or scratch files.

## Accepted user decisions

- `web-parity` tracks unfinished bot-to-web parity; `web-release` independently
  marks the chosen release, including web-only features and prerequisites.
  Project Priority is separate from both labels and catalog journey impact.
- The maintainer approved all 51 review records and all selected priorities in
  chat. The export's unchecked `priorityReviewed` flags were superseded by that
  explicit approval. Forty-three new issues (#196–#238) were created, eight
  existing issues received reviewed web labels, and all Project values were
  read back. At publication: 32 release tickets, 44 parity tickets, 25 with both.
- Initialization is [#216, P0](https://github.com/ewei068/pokestar/issues/216):
  authenticated users should initialize immediately, and acting-user endpoints
  using shared `getTrainer` should also create a missing trainer. Starting
  resources must be granted once, with the bot's identity/defaults. Initialization
  does not wait for tutorial completion or create arbitrary target accounts.
- Learning/reward compatibility is separately
  [#217, P1](https://github.com/ewei068/pokestar/issues/217). The release includes
  both initialization and learning; an existing-player-only first release was
  an earlier agent recommendation, not the final accepted boundary.
- Tower [#212](https://github.com/ewei068/pokestar/issues/212), polling #192 and
  web promotion #195 were selected for release. Auto, trading, PvP invitation,
  raids and most dedicated mythical interfaces remain outside the current cut;
  verify current labels rather than infer membership from priority.
- #184 is P3/outside the cut and is not a release blocker per the maintainer's
  existing reboot runbook. #185 is maintainer-owned (`ready-for-human`); the user
  reports most acceptance verified except battle rewards. This report is not
  fresh independent provider/device/Mongo acceptance.
- Shared domain rules, identity, progression and storage remain server-owned.
  Preserve participant projections, revision checks, ordered events and existing
  Discord behavior. Rendering/reloading must not grant rewards again.

## Authoritative references to read

1. [Effort overview](../efforts/web-battler.md): deployed battle behavior,
   accepted visual/copy decisions, contract index and verification limitations.
2. [Roadmap](../efforts/web-parity.md): current phase and accepted publication;
   later historical sections retain superseded recommendations explicitly.
3. [Published tickets](../efforts/web-parity-tickets.md) and
   [issue crosswalk](../efforts/web-parity-issue-map.json): approved group/journey
   ownership and publication receipt. GitHub Issues/Project own live state after
   that snapshot; read the current relevant issues and `web-release` queue.
4. [Coverage audit](../efforts/web-parity-coverage.md): each of 106 eligible IDs,
   23 exclusions, backend coupling, side effects and evidence. Its Phase 1 release
   recommendation column is historical; published labels supersede it.
5. [web/AGENTS.md](../../web/AGENTS.md) and
   [UI/copy guide](../web-ui-style-guide.md): existing game-like compact visual
   direction, responsive/accessibility rules and presentation/copy ownership.
   [App.tsx](../../web/src/App.tsx) and
   [BattleFeature](../../web/src/battles/BattleFeature.tsx) show the current shell.
6. [Client architecture](../web-client-architecture.md),
   [browser/API contract](../battle-web-contract.md),
   [shared service](../shared-battle-service.md) and
   [completion boundary](../battle-completion-boundary.md): transport, projections,
   shared authority and unresolved multi-document reward/recovery limits.

## Bounded next-session scope

The following is the requested scope for the next-agent prompt, based on the
user's next-step discussion. It is not a claim that a design already exists or
that every implementation decision has been accepted.

Lead with [#237 — Design release navigation and responsive screen patterns](https://github.com/ewei068/pokestar/issues/237).
Investigate the related backend boundaries in
[#235 — Define shared player-operation effects and prove them in the first slice](https://github.com/ewei068/pokestar/issues/235),
without treating design discovery as completion of its runtime proof.

Produce one coherent, reviewable package:

- Map the approved release destinations and transitions: feature entry/back
  navigation, account entry, new/empty state, persistent settings and return
  paths to claims/objectives. Distinguish a navigation destination from a shared
  mechanic/side effect; do not invent a screen for every catalog row.
- Show representative collection/list and owned-detail, party/preset management,
  inventory and NPC battle-entry screens on desktop and mobile. Include useful
  loading, empty, error, stale/busy, cost/confirmation and return-to-result states
  where those screens need them. Respect the existing battle layout and voice.
- Establish visual foundations from those screens, extending the current guide.
  Extract tokens/components only where the examples demonstrate stable reuse;
  no speculative design-system rewrite, router migration or engine bundle in UI.
- Trace the operation/data needs those screens expose: trusted trainer identity
  and #216 initialization, owned reads, party validation/frozen starting builds,
  resource refresh, semantic interaction rewards, cost/receipt projection,
  request/result identity and recovery. Label existing behavior, proposals and
  unresolved product choices separately. Do not silently decide reward amounts
  or tutorial-to-Darkrai completion equivalence.
- Preserve editable source next to the maintained effort/design work and record
  design/browser checks and their limits. Any temporary visual prototype should
  be clearly separated from runtime implementation and have a stated retention
  decision at handoff. User acceptance is not established by rendering a mockup.

The subsequent implementation slice remains collection #197 → party/presets #199
→ NPC start #210 → shared combat → saved participant-safe receipt #236, with
inventory #201, automatic initialization #216 and shared effects #235 as relevant
prerequisites/consumers. These are context and follow-on work, not permission to
implement all those tickets in the next design session. Do not close #235 from
contract notes or mockups alone. Coordinate #237 completion against its actual
acceptance criteria and the user's design feedback.

## Findings that should not be rediscovered as assumptions

- Browser access currently resumes durable Discord-started battles. There is no
  browser start, Auto command or collection/economy interface. OAuth stores a
  session identity; it does not currently initialize a trainer (#216).
- `BattleStore` saves a completion summary, but the browser projection does not
  expose an itemized reward/progression receipt (#236). Winner/status rendering
  is not that receipt and does not prove rewards were applied exactly once.
- Several nonbattle effects still sit in Discord handlers/state: release credit,
  nature spending and trade consent are examples. Backend service filenames do
  not imply an authenticated, retry-safe operation ready for HTTP exposure.
- Apply owned Celebi/Jirachi bonuses and existing Darkrai entitlements with their
  consuming operations even when acquisition screens ship later. Quest progress
  must follow gameplay before its screen is added. These dependencies are in the
  audit and tickets, not separate mechanics screens.
- #186 owns battle/Auto recovery, including its existing raid scope. It is not
  automatically the recovery ticket for shop, release, equipment or trade writes.
  Acceptance/recovery gates can be investigated alongside independent design;
  they are not a blanket prohibition on starting #237.

## Verification and cleanup from this session

The source audit is static, with previously dated UI/local-test/deployment records.
Publication checks read back issue bodies/labels, priorities, unique Project
membership and all 106 eligible owners. Existing issue titles/bodies were
preserved; #185 received the human-readiness marker. Documentation link, ID,
JSON and whitespace checks are appropriate here; runtime tests were not rerun
for this documentation-only change.

The disposable review page/server, screenshots, generated copies and publication
scripts are being removed in this wrap-up. The user's original Downloads review
and attachment are outside that cleanup. The durable receipt and crosswalk retain
the decisions and approval digest; no raw review payload is needed to continue.

Compounding assessment: no separate `docs/solutions/` entry was warranted. The
non-obvious findings and decision rationale already live in the maintained audit,
contracts, tickets and publication receipt. Do not duplicate them merely because
the planning/publishing task was completed.

## Prompt for the next agent

```text
Continue Pokestar web release planning from
 docs/handoffs/2026-10-29-web-navigation-foundation.md
on codex/web-parity-planning-handoff (fetch/check out that branch first if needed).

Read the project instructions and the handoff's authoritative references, then
read the current release queue and issues #237, #235, #216 and #217. Produce the
navigation and visual-foundation design package for #237: a map of the approved
release destinations/transitions plus editable representative desktop/mobile
collection/detail, party/preset, inventory and NPC battle-entry screens. Extend
the existing style/copy guide based on those concrete screens and verify layout,
keyboard/touch access and meaningful states.

Alongside that design, investigate and record the bounded shared-operation/data
contract needed by the first slice for #235. Preserve server authority, automatic
trainer initialization, stored bonuses, progression, participant privacy and
retry/recovery semantics. Make consequential unknowns explicit and ask for the
maintainer's judgment when needed; keep proposed choices distinct from accepted
ones. Do not implement the full gameplay slice, change production, create duplicate
tickets, re-rate journeys or claim that mockups finish #235. Finish with reviewable
artifacts, verification limits and updated effort/issue context.
```
