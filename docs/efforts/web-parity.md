# Web parity: roadmap and session coordination

Updated 2026-10-29, America/Los_Angeles. Current stage: **Phase 2 release cut
and tickets established; navigation/design and the shared-operation proof are next.**
The [coverage audit](web-parity-coverage.md) records the inspected checkout,
individual assessments, issue reuse, work groups and reconciliation receipt.
No runtime behavior was changed by the audit or ticket publication. The
[published issue map](web-parity-tickets.md) records the approved cut, reviewed
priorities, G23 split and read-back checks; it supersedes the earlier recommendations
and review checkpoints retained below.

## Release branch workflow — 2026-10-29

The maintainer selected `codex/web-release` as the long-running integration branch
for this web release. Its draft PR targets `main` and stays open while the
approved release work accumulates.

- Create new web-release work branches from the latest `origin/codex/web-release`.
- Open each feature or design PR with `codex/web-release` as its base, and merge
  it into that branch only after approval.
- Keep the release PR in draft while work and acceptance remain incomplete.
  The maintainer will merge `codex/web-release` into `main` when the release is ready.

This workflow applies to the web release effort; unrelated work keeps its own
base. Use the current `web-release` issue queue and its acceptance criteria to
track remaining scope. The branch starts with the approved planning package;
its existence does not establish feature completion or production acceptance.

## Phase 2 publication — 2026-10-29

The maintainer approved the complete review and all selected priorities. Created
**43 issues (#196–#238)** and applied the reviewed web labels to **eight existing
issues**. All are in Pokestar Project 3 with verified priorities. There are
**32 release tickets**, **44 parity tickets** and **25 carrying both labels**;
the remaining **19 parity-only tickets** form the later backlog. Two web-only
proposals are included in release. See the [publication receipt](web-parity-tickets.md)
and [machine-readable crosswalk](web-parity-issue-map.json).

The accepted cut adds Tower, new-trainer initialization/learning, polling and
promotion to the Phase 1 recommendation. Per the maintainer's G23 note, automatic
initialization is [#216, P0](https://github.com/ewei068/pokestar/issues/216), while
learning/reward compatibility is [#217, P1](https://github.com/ewei068/pokestar/issues/217).
Both have the reviewed release/parity labels. #184 remains P3 and outside release;
#185 is marked `ready-for-human` and retains its existing acceptance scope.

All 106 eligible journey IDs have a published parity owner; 23 exclusions remain
excluded. Existing issue titles/bodies were preserved. The user explicitly
approved priorities in chat despite the export's unchecked per-field flags.
No ticket was held; the only scope adjustment was the requested G23 priority split.
Unsettled learning mapping and semantic gameplay rewards remain design work in
their tickets rather than implicit runtime decisions. No production changes or
standing monitoring were started.

## Direction and decision status

The user wants to expand the web battler into a full web interface for the bot,
auditing every web-eligible journey (web P0–P3) and targeting a first release
primarily drawn from web P0/P1. The user explicitly wants related journeys
coalesced into coherent tickets, with `web-parity` identifying the overall
effort and a separate marker identifying first-release scope. They requested a sequence covering
coverage, tickets, design language, navigation, shared backend architecture and
implementation, followed by a way to coordinate that work across sessions.

The published ticket labels establish the accepted release boundary, including
trainer initialization and learning/rewards. The earlier returning-player-only
recommendation was not adopted. Navigation, detailed learning compatibility,
architecture details and implementation waves remain design work within that
boundary; approval of the backlog did not settle those implementation choices.

The [next-session handoff](../handoffs/2026-10-29-web-navigation-foundation.md)
captures a bounded navigation/visual-foundation deliverable for #237, supporting
contract discovery for #235, and a prompt for the next agent. The temporary
review page/server and generator files are disposable after publication; future
work uses these repository documents and GitHub, not local review storage.

## Sources of truth

- [Journey catalog](../user-journeys.md): journey IDs, descriptions and reviewed
  bot/web priorities. At this checkpoint it contains 106 web-eligible entries:
  60 P0, 21 P1, 24 P2 and 1 P3, including overlapping journeys and supporting
  mechanics. The 23 web Outside scope entries are excluded from port scope.
- [Web effort overview](web-battler.md): existing battle delivery, contracts,
  acceptance evidence and outstanding operational work. Keep that path as the
  entry point; this roadmap supplements it.
- [Coverage audit](web-parity-coverage.md): current per-journey coverage, evidence,
  dependency/risk estimates, complete proposed backlog and separate first-release
  recommendations. Reconcile it again when the catalog or implementation changes.
- [Published ticket map](web-parity-tickets.md): approved cut and publication
  receipt; GitHub Issues/Project own subsequent live state and Priority.
- This document: phase sequence, open decisions and next-session scope.
- GitHub Issues and the [Pokestar Project](https://github.com/users/ewei068/projects/3):
  actionable work, dependencies and completion once tickets are established.
  Follow [issue conventions](../agents/issue-tracker.md) and the
  [priority rubric](../agents/prioritization.md).

Keep decisions and evidence at their owning source and link them elsewhere.
Chat summaries are useful pointers, not the only record of project state.

## Proposed phases

| Phase | Outcome and completion evidence |
| --- | --- |
| 1. Audit coverage — complete | [Audit and reconciliation](web-parity-coverage.md): all 106 eligible IDs assessed exactly once, all 23 exclusions reconciled, every gap mapped to a group or existing issue. Live acceptance limits and first-release recommendations are explicit. |
| 2. Choose release boundaries and establish tickets — complete | [Published map and read-back verification](web-parity-tickets.md): approved release/parity labels, priorities and complete journey ownership; 43 new issues plus existing scoped work in Project 3. Detailed design decisions remain explicit ticket scope. |
| 3. Design the broader interface | Validate navigation and desktop/mobile layouts using representative collection, party and battle flows. Extend the existing style guide and extract shared components where actual screens demonstrate reuse. |
| 4. Define and prove shared operations | Establish a bounded service contract and implement a representative journey through both surfaces. Suggested slice: inspect collection, edit party, start an NPC battle, finish and observe progression. Verify cross-surface behavior before expanding the pattern. |
| 5. Expand in useful waves | Deliver dependency-ordered feature groups with their shared effects and acceptance evidence. Reassess estimates after the first slice. |
| 6. Verify and release each wave | Check real persistence, authorization, concurrent actions, uncertain retries and relevant device behavior. Resolve applicable operational gates and record rollout/recovery evidence. This accompanies each wave rather than waiting until all parity work is done. |

The completed Phase 1 audit informs phases 2–4 without settling their decisions.
Design and backend investigation can proceed together after release scope is
clear. Each implementation ticket should deliver a usable outcome through the
shared operation and its adapters, rather than leave disconnected API/UI work.

Provisional expansion order: collection/party/inventory/battle entry;
acquisition/shop/training/equipment/locations; quests/learning/preferences;
remaining PvE/Auto; trading and PvP invitations. Pull supporting effects forward
with their consumers: quest progress must work when training ships even if the
quest screen follows later. Preserve reviewed priorities: P2/P3 journeys belong
in the audit and backlog, while web Outside scope journeys remain excluded.

## Historical Phase 1 findings and Phase 2 handoff

The recommendations in this section are preserved as Phase 1 history. The
publication checkpoint above and published ticket map govern the approved cut.

The audit at `a6f74e07b6fa3a807f05dfec01411c66780b5ff1` found **68 absent,
24 partial and 14 implemented-but-unverified** journeys. No full journey was
declared live-verified from static code or earlier UI approvals. The current
browser continues durable Discord-started battles; it has no browser battle
start or Auto command. OAuth creates a session, not a new trainer.

The complete backlog has **42 work groups**, including two coordination groups
that reuse existing issues instead of requesting duplicate implementation tickets.
Nine open issues were inspected and confirmed in Pokestar Project 3: #184–#187,
#190–#192, #194 and #195. The audit distinguishes current scope from new
nonbattle work and notes stale closed-issue/Project descriptions without editing
the tracker.

The separate first-release recommendation has **63 Candidate IDs (56 P0,
seven P1), 40 Later IDs and three Unresolved IDs (J01/J46/J59)**. Mixed mechanics
retain explicit portions: dungeon progression is a candidate, tower progression
is later; owned mythical bonuses follow their delivered consumers while mythical
acquisition remains later. These counts preserve traceability, not independent
feature counts or release approval. P0 tower is explicitly deferred under the
recommendation; its reviewed importance has not changed.

Recommended first implementation slice: an existing trainer inspects owned
Pokémon, edits/validates a party and preset, starts an NPC battle, switches
surfaces, completes it and inspects a saved participant-safe reward receipt and
resource/progression changes. The audit identified that current web projection
omits the stored reward summary;
receipt delivery is separate from existing acceptance/recovery issues. This
proves shared operation effects and recovery before expansion; acquisition,
capacity, training/builds, dungeon materials and quest claims still follow before
the proposed first release is complete.

Before establishing tickets, resolve the audit's D1–D6: audience/minimum existing
progress; tutorial rewards/completion compatibility and Darkrai credit; first-release
groups including tower/Auto tradeoffs; semantic EXP/currency rewards for web
operations; recovery design ownership; and labels/release tracking. D7/D8 preserve
server-context/promotion and Dream Card questions for their named revisit points.
The new-player alternative adds trainer initialization, starter grants and a
resumable reward-bearing learning path; contextual help alone does not satisfy it.

Next session should read the audit, choose these boundaries, refresh the issue
search and, only with authorization, establish/reuse grouped tickets and verify
Project membership. Navigation, final service contracts and implementation
remain later phases. No background monitoring was started.

## Historical Phase 2 review checkpoint — 2026-10-29

This records the review process before publication. It does not describe a
pending review or the continued availability of the temporary review page.

The maintainer selected independent backlog/release membership: unfinished
parity work receives `web-parity`; the chosen release cut receives `web-release`;
web-only features may receive `web-release` without `web-parity`. The earlier
`web-release-1` spelling was a proposal, not an accepted marker. Use `web-release`
for this review; do not infer that every release prerequisite is a parity port.

A temporary local HTML review presents 40 proposed parity tickets, all nine
current open issues that may receive these markers, and two additional web-only
suggestions for navigation/design and whole-release acceptance. G01/G20 reuse
existing issues and do not become duplicate tickets. Every eligible journey
retains traceability, including partial scopes such as dungeon/tower progression
and acquisition/raid shiny bonuses. The HTML supports label changes, scope edits,
notes, new web-only proposals and an exportable local review record.

The two web-only suggestions and all default ticket memberships remain proposals.
The audience, release cut and unresolved semantics have not been accepted merely
because the review page exists. Existing #185/#186 include broader mode/Auto/raid
work; the review flags whole-ticket scope and requests an explicit split if the
maintainer wants only part in release. Non-web labels and Project Priority remain
separate and preserved.

The maintainer supplied an incomplete review on 2026-10-29. The updated HTML
preserves its six scope/label approvals and exact review-contract feedback,
and adds current/suggested Project Priority, rationale, editable priority,
filtering/sorting and a separate priority-review flag for every ticket. Earlier
scope approvals do not approve these new priority suggestions. Older review JSON
can still be imported without losing feedback or approvals.

For the current cut, the maintainer considers #184 a P3 nice-to-have with an
existing reboot runbook, not a release blocker; the review no longer makes it a
hard dependency. The maintainer reports #185 mostly verified except battle
rewards and reserves it for themselves, not an agent. These are maintainer review
statements, not newly recorded independent acceptance. The partial review also
keeps #190 release-only. Publication remains pending the completed review; no
GitHub Priority or label has been changed.

Read-only tracker refresh still found 58 total issues and nine open issues,
all nine in Pokestar Project 3. Neither proposed web label exists yet. No issue,
label, Project membership or runtime behavior was changed. The user will review
the HTML first; ticket creation and label application follow their reviewed
selections and any required scope reconciliation in a later step.

## Ticket grouping and release tracking

Apply `web-parity` to tickets tracking unfinished parity work. Use the independent
`web-release` label for the selected release subset, including approved web-only
features and prerequisites that do not receive `web-parity`. Keep Project Priority authoritative for work urgency,
journey ratings authoritative for impact, and release membership independent
of both. A P0/P1 journey is a release candidate, not automatic inclusion; a
lower-priority dependency may be needed without changing its journey rating.

Propose one ticket for related journeys sharing a player outcome, service
boundary and practical acceptance test. List every covered journey ID and its
acceptance requirements. Combine parent/variant entries and shared mechanics
where one implementation delivers them together. Split when work has distinct
release timing, substantial independent risk or an independently useful outcome;
avoid both one-ticket-per-ID duplication and oversized category-wide tickets.

For each proposed ticket, record covered IDs, outcome, dependencies, effort/risk,
release recommendation and grouping rationale. If only part belongs in release
1, separate a useful first-release slice from later work and map the IDs to
those explicit portions. Existing verified coverage needs no new implementation
ticket; unverified coverage may need an acceptance ticket. Search and reuse
existing issues before creating tickets, and verify Project membership.

## Phase 1: coverage audit brief

**Completed 2026-10-28.** The brief below is retained as the audit contract;
results and completed checks live in [the maintained audit](web-parity-coverage.md).

Read the journey catalog and web effort overview first, then inspect the linked
contracts and relevant code. Use `src/README.md` for backend orientation and
`web/AGENTS.md` plus the web UI style guide for browser constraints. Inspect
current GitHub issues read-only for overlap and existing dependencies.

Create `docs/efforts/web-parity-coverage.md` as the maintained audit. Record the
inspected commit and any relevant local changes. Include one row per current
web-eligible ID (web P0–P3); overlapping entries may point to the same proposed
ticket, but each ID needs an explicit assessment. Reconcile web Outside scope
IDs in a separate exclusion list; supporting backend dependencies can be noted
without proposing their web port.

For each entry record:

- Web coverage: verified, implemented but unverified, partial, or absent. Name
  exactly which steps work, including initiation and completion. Use an explicit
  unknown assessment when evidence cannot establish implementation status.
- Evidence: repository paths/symbols and existing verification records. Static
  code and passing mocked tests do not establish live acceptance.
- Shared backend behavior already available and remaining Discord coupling.
- Dependencies, distinguishing existing shared prerequisites from missing web
  screens. Identify storage, identity/privacy, progression and reward effects.
- Relative effort (small/medium/large), confidence and reason. Separate UI work,
  service extraction, persistence/concurrency risk and product uncertainty.
- Proposed ticket group, existing issue links and special decisions needed.
- First-release recommendation (candidate, later, or unresolved) and rationale,
  preserving the catalog priority separately. This is not release approval.

Inspect representative caller-to-storage paths rather than classifying by
filenames or command names alone. Pay particular attention to tutorial gates,
owned mythical bonuses, daily refresh, spending/rewards, privacy, trades,
battle starts and legacy/durable paths. Reuse existing acceptance/recovery
issues where relevant; verify their current scope and status.

Finish with proposed grouped tickets and dependency order, a recommended first
slice, and consequential questions for the maintainer. Assess the alternative
of first-release onboarding alongside the existing-player recommendation.
Keep estimates provisional where investigation leaves uncertainty.

Completion checks:

1. Reconcile the audit IDs against the current catalog: every web P0–P3 ID
   appears exactly once, with no accidental inclusion based on bot priority.
   Reconcile excluded IDs separately and derive totals from the current catalog.
2. Check referenced paths and distinguish findings from assumptions.
3. Map every gap to a proposed grouped ticket or existing issue, including
   later-release work. Account for mechanics as shared acceptance requirements
   where appropriate rather than inventing a screen for each. Check grouping
   rationale and ensure first-release scope is explicit within mixed groups.
4. Review the audit for missing initiation, side effects, cross-surface actions
   and recovery. Report unverified behavior instead of calling it complete.
5. Update this document's current stage and link the completed audit from the
   web effort overview. Summarize decisions needed before phase 2.

This session is documentation and read-only investigation. Runtime changes,
production actions, ticket creation and priority changes belong to later work
authorized by the user. The audit does not need production mutations to finish.

## Continuing across sessions

Start each session from the current phase or selected issue, inspect the checkout
and current evidence, and choose one bounded deliverable. At the end, update the
owning artifact with completed work, verification limits, open decisions and the
next concrete action. Once tickets exist, link the relevant plan and evidence
from the ticket instead of copying the full roadmap into its body.

Repository documents must be committed and made available on the next checkout
before another worktree can rely on them. Until then, continue in this checkout
or explicitly transfer the local changes. No background monitoring or automatic
cross-chat orchestration is established by this document.
