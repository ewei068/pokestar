---
title: NPC battle selection and start - Plan
type: feat
date: 2026-11-02
artifact_contract: ce-unified-plan/v1
product_contract_source: approved-npc-study
origin: docs/design/npc-battles/README.md
execution: code
---

# NPC battle selection and start - Plan

## Goal Capsule

- Objective: A trainer can choose an NPC, start a battle with their saved party and continue durable battles through Discord or the web.
- Means: Shared NPC construction, the existing player cache and battle service/session, and a Start button disabled while its request is pending.
- Authority: The approved NPC study and latest maintainer direction govern this plan. Accidental duplicate battles are acceptable because starting has no cost. Existing durable-battle and ordered-event contracts remain authoritative.
- Delivery: One focused implementation branch based on the collection implementation, using the existing checkout. Preserve predecessor PR branches. No new worktree, merge, deployment or standing monitoring loop.
- Stop conditions: Escalate a material departure from the approved design or reliability scope. Routine technical decisions and verification do not require another approval.

## Product Contract

### Summary

Implement the approved Play journey for #210: conditional Continue, NPC selection, current party preparation and ordinary battle starts.
Phone tabs scroll horizontally while preserving readable labels and counts.
The maintainer explicitly removed the draft's retained-start guarantee: disable Start during submission and allow another attempt once the request ends, including after a timeout.

### Problem Frame

The web can continue durable battles, but players must currently start NPC battles in Discord.
Expose the existing shared start flow through the authenticated player API and approved Play workspace.

### Requirements

- R1. Implement the approved study in `docs/design/npc-battles/README.md`, including scrolling phone tabs.
- R2. Derive trainer ranges, configured difficulties, species/ace and daily reward rows from shared server configuration and current trainer state.
- R3. Continue is the default on entering Play when ongoing battles exist; hide it after a confirmed empty result and default to Trainer battles. Refresh failure preserves known state, and polling never changes an in-progress trainer selection.
- R4. Reuse the existing controlled party and owned inspector, player cache and Pokémon workspace. Preserve trainer/difficulty across Edit party and browser Back.
- R5. Authenticate the actor and validate the current owned, eligible 1–6-member saved party at the shared start boundary. Use the server's current party without an expected-formation comparison or extra review step. No level, daily-clear or active-battle lockout is introduced.
- R6. Disable Start while the request is pending and suppress repeated activation in that interval. On failure or timeout, release pending state and allow a new explicit attempt. Do not automatically retry the POST. Accidental duplicate battles across retries, tabs or reloads are acceptable.
- R7. On success, open the returned battle through the existing session, including its result if opening automatic turns finished it. Preserve existing frozen setup, participant projection, revisions, ordered events, Auto and completion handling.
- R8. Preserve existing account isolation so obsolete responses cannot install player data or navigate after an account change. Pure reads grant no participation rewards; explicit starts follow the current best-effort interaction policy.

### Key Decisions

- Compact encounter presentation: aggregate level ranges, difficulty hues, one species/ace strip, compact item rewards and party pop-outs. Governs R1, R2.
- Conditional Continue as the first/default Play tab when battles exist. All ongoing battles stay in one list. Governs R3.
- Reuse existing party/cache/battle ownership and rules. Governs R4, R5, R7, R8.
- Pending-button protection is sufficient for starts. The maintainer accepts accidental duplicates and removed the stronger recovery protocol. Governs R5, R6; supersedes earlier retained-start requirements in this study and parent-plan guidance for this journey.

### Scope Boundaries

Include NPC catalog/progress, active-list integration, shared NPC starts, the approved UI and the three used public item icons.
Party presets (#199), training, dungeon/tower starts and saved-result screens remain follow-ups.
Keep the existing durable battle persistence unchanged: no start reservations, request identities, retained rejections, input fingerprints, timestamp windows, start-recovery endpoint or browser-persisted intent.
No separate start controller or Discord Replay protocol is required.
General operation ledgers, economy transactions, global player revisions and exactly-once participation grants remain outside this journey.
Revisit duplicate-start protection only if starting gains a cost or accidental duplicates become a demonstrated product problem.

### Sources

- `docs/design/npc-battles/README.md`: approved presentation, source-discovered rules and latest simplified start contract.
- `docs/design/owned-collection/architecture.md`: approved lightweight reliability amendment.
- `docs/plans/2026-10-30-1740-feat-web-first-playable-slice-plan.md`, U5: parent journey; current maintainer direction supersedes its stronger start guarantees here.
- `docs/efforts/web-battler.md`, `docs/adr/0001-share-durable-battles-across-surfaces.md`, `docs/adr/0002-return-ordered-combat-events-with-battle-state.md`: existing battle contracts.
- Kept editable source: `docs/design/npc-battles/index.html`, `preview.html`, `study.js`, `study.css` and generated fixtures. These are design evidence and stay outside the production bundle.

## Planning Contract

### Key Technical Decisions

- KTD1. Put shared NPC projections and construction in a surface-neutral `src/services/npcBattle.js`. Extract the NPC branch of `buildPveSend`; reuse `BasicNPC`, `validatePartyForBattle` and `BattleService.start`. Keep the flag-off Discord legacy path working through the same construction helper. HTTP starts require durable support.
- KTD2. Each accepted start constructs a normal new battle using current server-owned party/build data and the existing persistence path. Discord Replay keeps its current behavior. The server reads the latest saved party; there is no client snapshot conflict check or party lock.
- KTD3. Add NPC reads and a start POST beneath the existing authenticated `/player` boundary. Retain its account assertion, same-origin protection, request limits and rate limits. The request contains the selected NPC/difficulty; the authenticated actor comes from the session. Return allowlisted projections and the created battle identity.
- KTD4. Extend the existing account-scoped player data layer for NPC data and the active list using current polling/focus/reconnect rules. Start is an ordinary mutation with retries disabled and in-memory pending state. No start-specific storage or controller is needed. Reuse existing account-lifetime checks for stale responses.
- KTD5. Extend active summaries only with NPC/difficulty display metadata. Continue lists all existing battle modes with participant authorization. After a timeout, refresh the list without claiming that it proves whether that particular request succeeded; the player may start again regardless of that refresh outcome.
- KTD6. Extend current route helpers with Play subview/NPC/difficulty context while preserving direct battle URLs and the Pokémon owned-detail parameter. Reuse the existing router and hand off live combat to the battle session.

### Start flow

1. Start captures the selected NPC/difficulty, sets pending immediately and disables further submission.
2. The server authenticates the player, validates the current saved party, constructs the encounter and calls the existing durable start service.
3. A successful response opens its returned battle ID through the existing battle session.
4. A validation failure shows the actionable server error and allows another attempt after correction.
5. A timeout or ambiguous network failure says the battle may have started, refreshes ongoing battles and releases pending state. Continue and another explicit Start remain available. Refresh failure does not block another attempt.

The existing mutation timeout bounds the pending state; reload also starts with no retained request state.
Cancellation or timeout in the browser does not claim to undo a server-side start.
No automatic mutation retry is introduced.

The browser's explicit start uses the existing best-effort 5 EXP/10 money interaction policy.
A participation-grant failure must not turn an already-created battle into a failed start.
Discord retains its existing outer-handler grant, with no second grant in the extracted shared domain path.
Automatic catalog, party and active-list reads grant nothing.

NPC availability uses `getTrainer` lifecycle normalization, including UTC daily refresh.
Daily eligibility stays completion-owned. Refresh party, progress, trainer resources and active summaries when returning from battle or party editing; pending completion displays Updating rather than claiming a reward.

## Implementation Units

### U1. Shared NPC reads and ordinary starts

- Goal: Give Discord and HTTP one source for NPC choices and battle construction.
- Requirements: R2, R4, R5, R7, R8. Dependencies: approved collection head and existing battle contracts.
- Files: `src/services/npcBattle.js` (new), `src/services/battle.js`, `src/services/player.js` as needed for projection reuse; `src/services/__tests__/npcBattle.test.js` (new).
- Approach: Implement KTD1–KTD2. Project catalog/progress and local item icon keys. Reuse current owner-filtered party reads, validation and durable start; keep Discord rendering in its adapter. Preserve legacy flag-off starts and Replay.
- Test scenarios: configured difficulties; aggregate range includes the ace; unique species/ace projection; UTC daily refresh; no-daily-reward NPC; valid one-member party; invalid empty/foreign/ineligible/duplicate party; current saved party used after an edit without a client conflict gate; geometry, builds, reward multipliers and Auto preserved; ordinary starts and Discord Replay create new battles.
- Verification: Focused service tests establish gameplay parity, then full backend tests after extraction. Existing battle persistence tests continue to cover its unchanged contracts.

### U2. Authenticated transport and player data

- Goal: Connect current player reads and ordinary starts to the browser through the existing data layer.
- Requirements: R2–R8. Dependencies: U1.
- Files: `src/web/playerApi.js`, API composition wiring, `src/battle/service/BattleWebService.js`, `web/src/player/PlayerData.ts`, `web/src/player/types.ts`; existing API/player-data tests.
- Approach: Implement KTD3–KTD5 with an ordinary start mutation, bounded errors and expected-account assertions. Extend active summaries safely. Refresh affected queries after start outcomes without adding a global submission lock.
- Test scenarios: anonymous/wrong-origin/account-mismatch requests rejected; session actor cannot be forged; reads/focus/polling grant nothing; POST uses current owned party; success returns the created battle; mutation does not automatically retry; old-account responses cannot install data or navigate; explicit-start participation follows current policy even if the grant fails.
- Verification: HTTP and player-data tests cover adapters/account boundaries. Real-session browser checks establish cookie/origin integration separately from live Discord OAuth.

### U3. Approved Play workspace and end-to-end proof

- Goal: Deliver the approved encounter journey through the existing shell and battle screen.
- Requirements: R1–R8. Dependencies: U2.
- Files: `web/src/play/PlayFeature.tsx`, `web/src/play/play.css`, Play feature tests; `web/src/App.tsx`, `web/src/battles/BattleFeature.tsx`, `web/src/battles/BattleList.tsx`, route helpers/tests; `PartyView` only if controlled presentation needs optional read-only/inspection behavior; `web/public/images/items/`; effort/verification docs.
- Approach: Implement KTD4–KTD6 using production components. Native party dialogs contain focus and support Close/Escape/backdrop dismissal with restored focus. Play tabs scroll horizontally. All active battles stay in one list. Study fixtures stay outside the production bundle.
- Test scenarios: unknown/failed/empty active list; disappearance of the final active battle; polling preserves selection; tab/species scrolling; difficulty hues; daily reward states/icons; 1/6 and 6/6 formations; dialog/member inspection; Edit party return/Back; double activation while pending sends one POST; success opens the returned ID; failure/timeout re-enables Start without waiting for a refresh; no storage requirement on reload; direct battle links and completion refresh preserve existing behavior.
- Verification: Compare production screens with the approved study at 1280/900/390/320 px, including long labels, large Continue counts, missing art and short phone dialogs. Prove a disposable collection → party → NPC start → reload known battle → continuation → settled progression path.

## Verification Contract

| Check | Required evidence |
| --- | --- |
| Backend Jest | Focused service/API cases, then full `npm test` after shared-service changes. |
| Backend types | `npm run typecheck`; compare against the documented 498-diagnostic baseline and report remaining failures/new diagnostics including callers. |
| Backend lint | Lint changed backend files; distinguish existing warnings from new errors. |
| Client | `npm test --prefix web` and `npm run build --prefix web`. |
| Browser | Production components with the local authenticated service at desktop/tablet/phone widths; scrolling, dialogs, navigation, disabled pending submission and retry after failure/timeout. |
| Persistence/continuation | Start an ordinary durable battle and continue its known ID after reload/restart through the existing persistence path. No reservation, duplicate-start race or retained-request recovery checks are required. |
| Cross-surface | Continue the same disposable battle through Discord and web when local Discord access is available; otherwise state what remains unverified. |

Use matching Jest/Discord-verification skills during implementation.
Do not describe mocked tests as proof of MongoDB, OAuth, Discord, physical-device or production acceptance.
Use one independent implementation reviewer for shared-service parity, authorization and account races, with one repair pass and affected checks. The earlier retained-start plan review is historical after the maintainer's scope reduction.

## Definition of Done

- U1–U3 satisfy their cited requirements and verification, with no new type/lint regressions hidden by filtering.
- Start is disabled only for pending submission or ordinary unavailable/invalid input states; a resolved failure/timeout permits a new explicit attempt.
- The desktop/phone journey matches the approved study, including scrolling tabs and simple start/error states.
- Existing combat, Auto, completion, persistence and Discord behavior remain intact.
- The effort index and verification record separate observed results from provider/device/legacy-write limitations.
- No retained-start machinery, study fixtures or abandoned experiments enter production modules; predecessor PR branches remain untouched.
