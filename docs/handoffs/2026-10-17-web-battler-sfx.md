---
artifact_contract: "ce-handoff/v1"
created_at: "2026-10-18T02:00:28Z"
title: "Pokestar web battler — explore battle SFX"
summary: "Implemented web/Discord battle stack through Auto; begin user-guided SFX exploration with current architecture, evidence and local-state warnings."
keywords: ["pokestar", "web-battler", "sfx", "audio", "continuation"]
cwd: "/Users/elviswei/.codex/worktrees/f78b/pokestar"
resume_focus: "Explore battle SFX with the user; establish scope, references and workflow before implementation."
repository: "ewei068/pokestar"
repo_root_sha: "397c25d6c7fb6a305fa83fac54beaa2b36579877"
branch: "codex/restore-auto-battle"
head: "89572ac4818db6fb6b0a53c10dc8ff1ec7282fb8"
worktree_path: "/Users/elviswei/.codex/worktrees/f78b/pokestar"
---

# Continuation purpose

The user requested durable project context and a dated handoff focused on
**exploring battle SFX next**. The effort is now indexed by
[docs/efforts/web-battler.md](../efforts/web-battler.md); start there for accepted
decisions, milestone PRs, authoritative guides, known limits and deferred work.
Root `AGENTS.md` now points web-battler sessions to that overview.

## User intent and authority

The user approved the existing move VFX alpha and arena, requested preserved
Discord UI, and selected one-result Auto with conditional payment. Those are
recorded decisions. This request asks for **preparation for SFX exploration**;
it does not approve an audio engine, tool/provider, asset purchase, generation
batch, sound palette, cue matrix, UI change or implementation.

The next-session procedure proposed below is the handoff author's recommendation.
On resume, orient and obtain the current user's confirmation/direction before
researching, changing code or producing audio. Do not treat this file as standing
execution authority. Preserve the existing visual approvals while discussing audio.

## Capture state

- Machine-local checkout: `/Users/elviswei/.codex/worktrees/f78b/pokestar`.
- Branch: `codex/restore-auto-battle`.
- HEAD: `89572ac4818db6fb6b0a53c10dc8ff1ec7282fb8`.
- Tip PR: [#166](https://github.com/ewei068/pokestar/pull/166), based on
  [#165](https://github.com/ewei068/pokestar/pull/165); #165 is based on
  [#164](https://github.com/ewei068/pokestar/pull/164). All three were open drafts
  during capture. The overview links the earlier stack; do not assume it is
  merged or deployed, or flatten it while resuming an exploration task.
- No commits, pushes, stash operations or worktree moves were performed for
  this documentation task. The docs created/updated here are **uncommitted**.
  Source/asset files were not changed by this pass. A fresh session on another
  branch/host will not receive these local files merely by opening #166.

### Local work that needs preserving

All paths in this subsection are **machine-local, uncommitted** under the
checkout above, not a promise of presence on another machine.

- `/Users/elviswei/.codex/worktrees/f78b/pokestar/src/services/battle.js` had a
  pre-existing 36-addition/10-deletion formatting diff when this task began.
  It remains uncommitted and was not edited by this documentation pass.
- Newly saved `/Users/elviswei/.codex/worktrees/f78b/pokestar/AGENTS.md`,
  `/Users/elviswei/.codex/worktrees/f78b/pokestar/docs/efforts/web-battler.md`
  and this dated handoff are local files until committed through the normal
  user-approved workflow.
- Tracked documentation was updated in place: web feasibility/backend/client
  plans, client architecture, durable record and combat-event contracts, result
  playback, and the historical VFX-alpha verification README. Changes correct
  stale scope/browser claims, old per-action snapshot descriptions and missing
  weather/readiness metadata; they do not redesign the system.
- `/Users/elviswei/.codex/worktrees/f78b/pokestar/docs/design/` is pre-existing
  untracked user guidance and reference images. Current tracked UI/arena guides
  are the operational baseline; raw design notes retain historical dislikes.
- `/Users/elviswei/.codex/worktrees/f78b/pokestar/docs/battle-vfx-workflow-research.md`
  was already untracked; this pass added its historical/superseded status and
  current-guide pointer. It still is not available from Git alone.
- Other pre-existing untracked files were left untouched:
  `/Users/elviswei/.codex/worktrees/f78b/pokestar/docs/agent-workflow-stacks-research.md`,
  `/Users/elviswei/.codex/worktrees/f78b/pokestar/docs/ai-engineering-quality-research.md`,
  `/Users/elviswei/.codex/worktrees/f78b/pokestar/docs/personal-scratch.md`.
  They are not SFX dependencies and were not used as project authority.
- Local env files, certificates, sessions, dev servers and installed external
  apps were not inspected or exported. No credentials are needed to open the
  development stories. Follow `web/README.md` for environment variable names.

This is a managed worktree; archiving/deleting it before preserving the local
work would break continuity. No automatic backup or commit was made. These
files are in the repository directory rather than OS-managed temporary storage,
but their availability currently depends on retaining/accessing this checkout.

## What exists now

The static React/Vite/TypeScript app signs in through Express Discord OAuth and
uses participant-safe projections, a display catalog, legal targets and
conditional polling. Server rules and replay remain authoritative. The DOM
arena, sprite/HUD placement and canvas effects are separate presentation pieces.

Move VFX have 54 approved type/category compositions, typed recipes and a shared
420 ms approach / 760 ms tile / 320 ms return schedule. Result text, state changes,
batching, reactions and the virtualized reached-event log use ordered playback.
First open shows current state without historical animation. Cancellation,
visibility and reduced-motion handling already exist for visuals.

The latest change restores Discord Auto using current account eligibility,
private bounded simulation, a short revision/deadline-checked finalization claim,
conditional Dream Card debit, a replayable batch commit and existing completion
claims. Confirmed debit failure discards the result. Ambiguous payment/final-write
failures retain a claim for manual reconciliation. Flag-off legacy Auto still
charges upfront. No web Auto route/button was added.

No audio runtime/dependency or audio assets were found under `web/src`/`media`
during this audit. This is a scoped code inspection, not a listening test or a
claim about every file or external asset associated with the project.

## Verification and remaining limits

Freshly run during this documentation audit at the captured HEAD plus the
pre-existing formatting diff:

| Command                         | Observed result                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `npx jest --runInBand --silent` | 828 tests, 27 suites passed.                                                     |
| `npm --prefix web test`         | 52 tests, 14 suites passed.                                                      |
| `npm --prefix web run build`    | TypeScript + Vite build passed; existing Virtua/Rollup PURE annotation warnings. |

The preceding Auto implementation also passed ESLint. No browser, audio,
authenticated OAuth/Discord turn, real Mongo restart/concurrency test or production
verification was run for this documentation task. Retained browser records use
stories and mocked HTTP; the user separately reported local real-battle and
phone success. Those evidence classes must stay distinct.

The overview and backend plan list production gates: multi-document reward/quest
idempotency and interrupted claims, concurrent raid writes, actual deployment
configuration/topology.
Other unfinished scope includes durable reconstruction of mode-specific replay
buttons after local UI cache loss, reconnect log history, per-move VFX overrides,
asset loading optimization and broader event/report coverage. SFX does not depend
on resolving all of these first, and this handoff does not reopen their implementation.

## Orientation references for SFX exploration

Repository paths below are relative to the captured checkout; their purpose
matters more than reproducing their contents here.

1. `docs/efforts/web-battler.md`: accepted decisions, evidence, authoritative
   reference map and open questions. `web/AGENTS.md` adds web-specific guidance.
2. `docs/battle-vfx-guide.md`: approved running references, ingredient-based
   composition and full-sequence review at actual tile size. Its workflow is
   relevant to sound iteration, but does not define audio requirements.
3. `web/src/battles/useBattlePlayback.ts` and `playback.ts`: frame identity,
   begin/advance, waiting for artwork, ordering, skip and visibility cancellation.
   This is a candidate place to observe semantic playback; no audio hook exists.
4. `web/src/battles/BattleScreen.tsx`, `BattleMotion.tsx`,
   `vfx/BoardVfx.tsx` and `vfx/timing.ts`: presented events, shared visual timing
   and renderer boundaries. Inspect these before deciding where sound timing
   belongs; a draw loop is not an existing once-only sound trigger.
5. `docs/battle-result-playback.md`, `web/src/battles/results/config.ts`,
   `results/batching.ts` and `eventPresentation.ts`: concurrent event/state timing,
   grouped AOE outcomes, semantic copy and reactions. Audio should be discussed
   against these existing meanings rather than inferred solely from particles.
6. `docs/combat-event-contract.md`: move type/category/primary target/full footprint,
   damage, status, miss, faint, weather and readiness payloads. Current events are
   sufficient candidates for exploration; new server audio metadata is unproven.
7. `web/src/battles/dev/storyDefinitions.ts` and `BattleScreenPreview.tsx`:
   categorized stories render production presentation and real playback with
   fixture data and no battle writes. Local examples after starting Vite:
   `?previewBattle=1&story=motion-tackle`, `motion-hyper-beam`,
   `result-sequence`, `result-batch-damage`, `result-miss`, `result-status-burn`.
   The VFX lab uses `?previewBattle=1&story=vfx&type=fire&kind=special&pattern=all`.
8. `docs/web-client-architecture.md` and `web/README.md`: static-site boundaries,
   future extension seams, local run/build commands and local HTTPS/phone setup.
9. `media/vfx/components/README.md` and `web/src/battles/arena/assets/README.md`:
   existing visual ingredient/source records. The historical VFX research file
   considers tools and a user-mentioned local GPU; it is not current audio
   research, a verified hardware inventory or a provider recommendation for SFX.

## Proposed next-session conversation, subject to current user direction

The user has vague audio ideas and has not chosen specific sounds. A useful
first outcome is a small SFX brief and audition plan, not a production matrix:

- Clarify scope (move cues, result cues, UI sounds, cries; music is undecided),
  style/reference clips, quiet versus prominent mix, acceptable repetition and
  budget. A representative move plus contrasting status/result sound is an
  audition proposal, not an accepted requirement.
- Compare lightweight browser playback options and asset sourcing only after
  those preferences are clearer. Verify current primary documentation and
  licensing/costs before recommending a provider or local tool. The reported
  4080-class GPU's actual VRAM/host access and audio usefulness are unverified.
- Address browser audio unlock, mute/volume and persistence, mobile behavior,
  hidden tabs, skips/reconnects/unmount, overlap/polyphony and AOE batching.
  Sound per tile versus per action is open; copying visual particle/tile counts
  directly into audio can create unwanted overlap. Reduced motion is not an
  agreed mute setting.
- Preserve the session/presentation seam. A small configurable audio-cue catalog
  is a candidate, not a selected implementation. Tie any future playback to
  reached semantic frames with explicit cleanup/deduplication; do not change
  accepted combat or VFX timing without user direction.
- If the user later authorizes a trial, agree on listening comparisons and
  browser/mobile checks; unit tests alone cannot establish sound quality,
  perceptual sync, loudness or autoplay behavior. No audition or implementation
  was started in the creating session.

## Learning capture

`ce-compound`'s eligibility gate found no missing durable lesson worth another
solution document: current VFX, architecture/playback and Discord/Auto guides
already capture the verified reasoning. Their links are retained in the overview.
No `CONCEPTS.md`, solution-note hierarchy or speculative SFX policy was created.
This handoff is an immutable snapshot; maintain ongoing status in the effort
overview and detailed guides instead.
