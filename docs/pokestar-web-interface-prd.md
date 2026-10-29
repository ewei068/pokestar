# Pokestar web interface: product requirements

Date: **2026-10-28, America/Los_Angeles**.

Status: product requirements grounded in **129 maintainer-approved journey
ratings** and the current product direction. The rule for handling dependencies
below is a proposed interpretation of the maintainer’s guidance. The ratings do
not set a release date, an implementation sequence or a commitment to ship every
P0 entry in one change.

## Product goal

Expand the web battler into a web interface for Pokestar. Players should be able
to catch, manage, train and battle Pokémon using the same trainer, collection,
resources and game rules as the Discord bot. Learning, settings and reliable
progression support that core loop.

The web interface should express those outcomes in browser-appropriate flows.
Porting a journey does not require copying Discord commands, messages, menus or
interaction counts.

## Decision sources and authority

The [reviewed catalog](user-journeys/catalog.json) owns the exact bot and web
priority for each stable journey ID. All 129 entries were approved in the
[preserved decision export](user-journeys/decisions.json). The
[review summary](user-journeys/review-summary.md) records the 44 changed priority
pairs and all maintainer notes. The [readable catalog](user-journeys.md) describes
each outcome and its source evidence.

This PRD owns product goals, requirements and the interpretation of priority.
The catalog’s exact reviewed values take precedence over a broad grouping or an
inferred dependency priority. Future explicit maintainer decisions can revise
either document; a general parity default must not erase a recorded exception.

The [coverage audit](user-journeys/coverage.md) accounts for source entry points
and mechanic families. It is evidence of static coverage, not usage frequency,
live acceptance or proof that every current implementation satisfies this PRD.
The [web effort overview](efforts/web-battler.md) retains current implementation
and verification status. Requirements here describe the target product.

## Users and scope

New players need to learn, receive their starting resources and enter the core
loop. Returning players need to manage a collection and build teams, continue
progression, earn rewards and resume battles. Existing players may already own
unlocks or benefits earned through Discord; the web must respect that progress.

Discord server managers also have critical bot journeys, including inviting the
bot and configuring spawns. Those journeys remain in the catalog even where
their web equivalent is outside scope.

The current work concerns production-facing behavior. Developer grants, test
harnesses and the operator record/reset tools marked outside scope in the
review are excluded. Other retained operator/developer rows remain in the audit
with their exact ratings; they do not create a requirement for public admin
screens. Production provisioning, background processing and maintenance remain
supporting capabilities where existing journeys require them.

## Prioritization guidelines

### Journey importance

| Priority | Working meaning | Reviewed examples |
| --- | --- | --- |
| P0 | Critical gameplay or an essential function on the applicable surface. | Catching, collection management, training/build changes, NPC/dungeon/tower battles, quests, learning and relevant settings. |
| P1 | Important normal play that the main loop can operate without temporarily. | Daily and level rewards, PvP, trading, Auto, party auto-fill and claim-all convenience. |
| P2 | Low-priority specialized or ancillary journeys, or a lower priority on a particular surface. | Most Mythical powers/unlocks, standings, event discovery and web raid/voting flows. |
| P3 | Very-low-priority reference or diagnostic convenience. | Update notes and bot ping. |
| Outside scope | No current commitment to offer the journey on that surface. | Web spawn configuration, Discord layout preferences on web, and excluded development/support tools. |

The accepted ratings refine these descriptions. They are not computed from
these examples or from estimated implementation cost. High usage can inform
future revisions, but the source scan did not measure it. P0 is not limited to
the four headline activities: onboarding, privacy/settings, resource handling
and persistence can be critical because those activities depend on them.

### Bot and web parity

For the current prioritization, equivalent production-facing journeys should
normally have the same importance on bot and web. This is a working default,
not a permanent promise of identical feature coverage or presentation.

Keep a different priority or mark a surface outside scope when the journey is
invalid there, depends on missing surface context, or works materially
differently. Record the reason. The current approved exceptions include:

| Journey | Bot | Web | Reason / boundary |
| --- | --- | --- | --- |
| Raid participation, hosting and lifecycle: J11, J66, J67 | P0 | P2 | Server participation is critical on Discord; web currently has no server context. |
| Voting and reward claims: J33 | P0 | P2 | The maintainer considers voting critical to bot growth; its web flow is lower priority. |
| Spawn configuration and bot invitation: J16, J39 | P0 | Outside scope | Discord server functions. |
| Wild encounters: J34 | P1 | Outside scope | The current browser scope has no server encounter flow. |
| Discord device layout and target-indicator setting: J72, J73 | P0 | Outside scope | Browser layout/targeting work differently. Web move targeting itself remains P0 under J93. |
| Discord sign-in/session recovery for web: J107, J108 | Outside scope | P0 | Browser access requires these flows; the bot already knows the invoking Discord identity. |

These are player-facing examples, not the complete exception list. The catalog
also retains bot/backend-only functions such as vote ingestion and background
processing. Being outside **web UI** scope does not remove the backend function
or make its data irrelevant to web players.

### Dependencies and required supporting behavior

**Proposed policy:** rate each outcome separately, then identify the minimum
supporting behavior needed to deliver it correctly. A dependency does not
automatically inherit its consumer’s priority, and an optional consumer does not
reduce the importance of preserving already-earned state.

Use the following approach when turning a journey into delivery work:

1. Name the consumer, its surface and the result the player must obtain.
2. Identify the required rule, resource, stored entitlement or upstream journey.
   Distinguish acquiring something new from honoring something already owned.
3. Check whether the shared bot/backend already supplies it. Reusing a supported
   capability does not require building its full web discovery or management UI.
4. If a dependency is missing, include its minimum necessary behavior before
   accepting the consumer as complete. Alternatively, record an explicit scope
   limitation for maintainer judgment. Do not silently remove a game rule or
   expose an unusable flow.
5. Keep the reviewed journey ratings intact. Record dependency urgency on the
   implementation work with its reason, using the
   [ticket priority rubric](agents/prioritization.md). Broad promotion of a
   related feature, screen or sibling journey requires a separate decision.

Required preservation applies to currently supported or newly offered behavior.
It is an acceptance condition for correct operation, not a new priority tier or
a blanket order to implement every possible upstream journey immediately.

| Case | Required supporting behavior | What does not follow automatically |
| --- | --- | --- |
| Web voting/claims J33 are P2; vote ingestion J124 is bot P1 / web outside scope. | Valid vote credit acknowledged by the supported bot/backend flow must remain associated with the trainer and available under the existing claim rules. Hiding or delaying a web prompt/claim page must not discard it. | J124 is not silently reclassified as P0; web does not need a second vote-ingestion system. |
| Celebi acquisition J78 and Jirachi acquisition J81 are P2; their earned bonuses J79 and J82 are P0. | Applicable core flows must honor those benefits for an existing owner. | A P0 bonus does not require promoting every Mythical unlock or powers screen to P0. |
| Auto J32 is P1; Darkrai information J44 is P2 and Darkrai unlock J87 is P1. | Offered Auto must check the unlock, available Dream Cards and the correct cost. An informational page is not the entitlement itself. | Dedicated Darkrai information need not ship before Auto if eligibility is available through another appropriate flow. |
| Jirachi requires raid resources and traded Pokémon; web raids are P2. | Preserve those prerequisites and recognize qualifying progress earned on Discord. Make an unavailable prerequisite understandable when offering the unlock. | Lower web raid priority neither invalidates Discord-earned progress nor automatically promotes the whole web raid experience. |
| Web onboarding may differ from Discord; Darkrai currently requires 25 tutorial completions. | Decide how equivalent learning/progression satisfies the existing unlock before claiming the replacement fully supports it. | Renaming lessons, bypassing the gate or requiring identical tutorial screens is not an accepted decision. |

J63 needs a later split. Its exact reviewed combined rating, “Replenish and
inspect Dream Cards,” remains **P1/P1**. The maintainer’s note proposes P0 for
replenishment and P1/P2 for inspection, with the inspection rating unresolved.
Treat replenishment correctness separately from a dedicated balance screen;
do not invent a final split or change the approved aggregate rating here.

## Functional requirements

The following groups summarize the reviewed priorities. Detailed boundaries and
all 129 ratings remain in the catalog. Parent journeys, variants and systems
overlap; they are not independent features to add together.

| ID | Requirement | Journey trace |
| --- | --- | --- |
| R01 | A new player can enter the game with the correct trainer identity and starting resources, learn the core loop, resume learning and receive eligible learning rewards. The learning design may differ between surfaces; existing progress and unlock implications must be accounted for. | J01, J46, J59; Darkrai dependency J87 |
| R02 | A player can inspect available banners, rate-ups, Pokéball choices, costs and pity, obtain Pokémon and understand the acquisition result. Shared acquisition must retain the applicable probabilities, guarantees and owned bonuses. Beginner-guarantee rollout priority stays P1; a web port does not authorize deleting deployed guarantees. | J03, J50–J52, J79, J82 |
| R03 | A player can find, filter, sort and inspect owned Pokémon; preserve their identities/builds; lock or unlock them; confirm individual or bulk release; and expand capacity. Collection operations must honor ownership and protection rules. | J04, J25, J47–J49, J129 |
| R04 | A player can build and validate a battle formation, arrange/remove Pokémon, and save/load party presets. Auto-fill remains a P1 convenience. Existing battles retain the starting party required by the shared battle contract after collection/party edits. | J05, J53–J55, J128 |
| R05 | A player can train levels and EVs, reduce/reset EV allocation, evolve, change forms/natures, and inspect or improve locations that support training, capacity or unlocks. Apply the existing eligibility, resource and stat rules. | J06, J21, J22, J24, J28, J76 |
| R06 | A player can inspect resources, buy supplies, craft items, manage held items, upgrade equipment and reroll equipment stats. Each accepted operation must charge its intended cost and apply its intended result; failures must not misrepresent an outcome as successful. Equipment comparison/transfers remain P1. | J07, J13, J18, J23, J26, J27, J29, J127 |
| R07 | A player can start eligible NPC, dungeon and Battle Tower runs, inspect the current battle, choose a legal move/target or skip, understand its result, and progress through configured phases/floors. Browser controls may differ while preserving the shared combat rules. | J08, J30, J31, J92–J101, J104 |
| R08 | A player can find and resume an ongoing battle after leaving or changing surface, recover from stale/expired interactions, and retain compatible durable progress across restart. Enforce participant/turn ownership, legal actions and current-state checks. Preserve ordered combat events and the existing completion/Auto contracts. | J09, J103, J106, J128 |
| R09 | A player receives applicable trainer/Pokémon progression, mode rewards, daily NPC bonuses, quest progress and owned benefits. Displaying or reopening a result must not grant rewards again. Reconcile uncertain completion before treating it as safely retryable. | J61, J62, J64, J79, J82, J102, J127 |
| R10 | A player can inspect and complete daily quests and staged achievements, understand progress and claim eligible rewards. Claim-all and proactive completion reminders remain P1 conveniences. | J12, J56–J60 |
| R11 | A player can inspect and change applicable personal settings, including profile privacy and tutorial/quest reminders. Honor saved choices in the flows they govern. Bot-specific layout/indicator preferences do not require equivalent web controls; web still needs usable targeting. | J35, J71–J74; targeting J93 |
| R12 | A web player can sign in to the existing Discord trainer, sign out and recover an expired session. Changing the surface must not create a separate game account or lose existing progress. | J107, J108, J129 |
| R13 | P1 flows include PvP, trading/cancellation/offer management, daily/level reward claims, Auto, profile/species inspection and the reviewed conveniences. Offer them according to their reviewed scope and prerequisites without raising their priority solely because the core loop exists. | J02, J10, J14, J17, J19, J20, J26, J32, J40, J53, J58, J60, J63, J65, J68, J69, J75, J77, J87 |
| R14 | Lower-priority or excluded UI must not cause supported background processing to discard accepted vote credit, owned unlocks, resources or applicable bonuses. Keep ingestion, stored state, entitlement application, claiming and promotion distinct when assigning work. | J33, J62, J63, J79, J82, J124, J127, J129 |

Web P2 coverage includes raids, web voting/claims, standings, event/support
discovery and the reviewed specialized Mythical flows. Update notes are web P3.
Discord continues to have its separately rated invitation, server management,
wild encounter and growth functions. This PRD does not require a server concept
on web to eliminate those differences.

## Shared state and acceptance constraints

The backend remains authoritative for identity, ownership, game rules, costs,
rewards and durable state. Browser presentation must not invent a parallel set
of game rules or grant rewards by rendering a result. Respect profile privacy
and the existing participant projections when returning player/battle data.

Keep accepted earned state under the game’s existing retention and reset rules.
A deferred UI, a closed browser or the surface on which a credit was earned is
not a reason to discard it. Do not introduce a new expiration policy through
porting work. Apply daily/weekly/other configured allowances consistently.

Existing contracts remain the source for detailed battle behavior:
[shared service](shared-battle-service.md),
[completion boundary](battle-completion-boundary.md),
[Discord continuation](discord-battle-continuation.md),
[browser/API boundary](battle-web-contract.md), and
[ordered combat events](combat-event-contract.md).
Known partial reward-write and Auto-finalization recovery gaps remain open;
their documentation is not proof that the target acceptance conditions pass.

## Acceptance evidence

Before marking a ported journey complete, verify its successful outcome,
applicable rejection/recovery paths and required dependencies on the intended
surface. Reuse existing evidence where the behavior and environment are
unchanged. Use the full catalog to check omissions before claiming critical
coverage; the 60 reviewed web-P0 entries include overlapping variants/systems.

| Scenario | Required observation |
| --- | --- |
| New player completes the core loop. | Learn, acquire, inspect/manage, form a party, train/build, battle and receive applicable progression without an unexplained prerequisite gap. |
| Existing trainer switches between Discord and web. | Identity, collection, resources, settings and battle state agree under the applicable contracts. |
| Core collection/build actions spend resources or release Pokémon. | Intended costs/results, ownership, locks, confirmation and failure behavior are correct. |
| A battle view is stale, repeated or reopened after completion. | Illegal/stale actions do not corrupt the battle; refresh/recovery works and rendering does not reissue rewards. |
| Voting has no web prompt or claim page. | A valid vote accepted by the supported backend is retained for the trainer independently of that missing UI and remains claimable under supported rules after reload/restart. Do not acknowledge durable success before recording the credit. |
| A trainer already owns Celebi or Jirachi. | Applicable P0 EXP/daily/shiny bonuses still apply even if the web unlock/powers UI is deferred. |
| Auto is offered. | Eligibility, replenished balance, debit and finalization follow the supported rules; failures expose a safe recovery path rather than an invitation to pay again blindly. |
| Privacy or reminder settings change. | Relevant flows honor the saved settings; bot-only preferences are not accidentally exposed as nonfunctional web controls. |
| A lower-priority prerequisite has no web flow. | Qualifying shared progress is recognized. Any required limitation or continuation path is explicit; game gates are not silently removed. |

Mocked tests can establish local rules and API behavior. Real database, OAuth,
provider, cross-surface and restart claims need evidence from those environments.
The [effort verification record](efforts/web-battler.md#verification-and-acceptance)
distinguishes those checks. No usage, conversion or performance target is
invented here; set such targets when measurement and rollout scope are defined.

## Decisions retained for later planning

| Decision | Current position | Revisit when |
| --- | --- | --- |
| Dependency policy | The minimum-supporting-behavior rule above is proposed; exact reviewed ratings remain unchanged. | Applying it to concrete delivery tickets or a dependency that changes scope. |
| Dream Card split | J63 remains P1/P1, with the maintainer’s proposed replenishment/inspection distinction retained. | Scoping replenishment work or a dedicated resource display. |
| Onboarding and unlock equivalence | Learning is P0; exact tutorial parity and replacement semantics are unresolved. | Designing onboarding, tutorial rewards or Darkrai access. |
| Server context on web | No current requirement; preserve the approved raid, spawn and encounter exceptions. | A concrete web multiplayer/server journey needs it. |
| Equivalent interaction rewards | Existing trainer EXP/currency rules must be considered; a one-to-one mapping from Discord clicks to browser actions is not specified. | Implementing each progression-bearing web action. |
| Vote/reward recovery details | Preserve accepted credit and earned rewards. Provider retry identity, concurrent updates and reconciliation require implementation-specific evidence; this PRD does not assert exactly-once delivery. | Changing ingestion, claiming or shared reward persistence. |
| Release boundaries and order | P0 defines critical target coverage; no next-release bundle is selected here. | Creating the implementation/release plan. |
| Long-term priority parity | Equivalent journeys default to matching bot/web importance for now. | Evidence of materially different needs or an explicit product-direction change. |

## Non-goals of this document

This PRD does not choose screens, navigation, APIs, storage schemas, libraries,
hosting changes or implementation tickets. It does not redesign Discord,
replace the battle engine, change acquisition odds/unlock rules, add server
management to web, or introduce public developer/admin tools. It does not
authorize deployment or mutate GitHub priorities.

The reviewed baseline contains bot ratings of **68 P0, 23 P1, 22 P2, 4 P3 and
12 outside scope**; web ratings are **60 P0, 21 P1, 24 P2, 1 P3 and 23 outside
scope**. These totals describe the overlapping inventory, not the number of
screens, independent features or required implementation changes.
