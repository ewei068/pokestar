# Web parity: published tickets and approved release cut

Published and independently read back **2026-10-29, America/Los_Angeles**.
GitHub Issues and [Pokestar Project 3](https://github.com/users/ewei068/projects/3)
own current execution state and Priority. This is the publication receipt and
journey/group crosswalk, not a second live status board.

- [Release tickets](https://github.com/ewei068/pokestar/issues?q=is%3Aissue%20is%3Aopen%20label%3Aweb-release): **32** issues with `web-release`.
- [Later parity backlog](https://github.com/ewei068/pokestar/issues?q=is%3Aissue%20is%3Aopen%20label%3Aweb-parity%20-label%3Aweb-release): **19** issues with `web-parity` without `web-release`.
- Total parity: **44** issues; **25** carry both labels. Seven release issues
  carry no parity label. #184 carries neither and remains outside the cut.
- Created **43 new issues, #196–#238**; applied reviewed web labels to **eight
  existing issues**. Reviewed nine existing issues in total, including unchanged #184.
- Every one of **106 eligible journey IDs** has a published parity owner;
  **23 Outside scope IDs** remain excluded. Parent/variant/mechanic overlap does
  not imply independent screens or a count of independent features.

## Approval and scope reconciliation

The maintainer supplied `pokestar-web-release-review-2026-10-29.json`, snapshot
`999c2975f55f00e7`, and explicitly authorized ticket creation, Project updates
and all reviewed/changed priorities. The file has 51 approved scope/label
records. Its separate `priorityReviewed` booleans remain false; the maintainer's
explicit chat approval supersedes those flags. No additional priority approval
was inferred from the older partial review.

Review SHA-256: `40dcaa49dfaba7efc8530283d47932d02e09221cf6e908fd30d0be088bc90625`.
Source audit checkout: `a6f74e07b6fa3a807f05dfec01411c66780b5ff1`. The
[coverage audit](web-parity-coverage.md) retains source findings and the original
Phase 1 recommendation. **The published issue labels/priorities supersede that
recommendation for the accepted cut.** Runtime coverage was not reverified here.

One reviewed group became two tickets, directly reflecting the maintainer's note:

- **G23A / [#216](https://github.com/ewei068/pokestar/issues/216), P0:** initialize
  the authenticated acting trainer at sign-in and through authenticated operations
  using shared `getTrainer`; reuse bot defaults/identity and grant starter resources
  once under concurrent or retried first use. It does not wait for tutorial design.
- **G23B / [#217](https://github.com/ewei068/pokestar/issues/217), P1:** web learning,
  resumable lesson rewards and compatibility with the existing completion/Darkrai
  ledger. Both tickets retain `web-parity` and `web-release`. This ticket-priority
  split does not change the catalog's reviewed journey impact ratings.

The approved cut includes Tower G18, polling #192, promotion #195 and trainer /
learning G23A/G23B, which were later, optional or unresolved in Phase 1. New-player
initialization and learning are now in release scope; detailed learning mapping,
semantic EXP/currency grants and navigation remain design work in #217/#235/#237.
The earlier silent-rollout recommendation is superseded for planning by including
#195; this publication does not activate promotion or change runtime behavior.

#184 remains **P3**, no web labels, and **not a release blocker**, reflecting the
maintainer's existing reboot runbook and assessment. #185 remains **P1** and
maintainer-owned: `ready-for-human` records that it is not an agent task. The
maintainer reports most acceptance verified except battle rewards; this statement
is separate from independently recorded acceptance. #190 is release-only as reviewed.
Existing issue titles/bodies and non-web labels were preserved, with the explicit
human-readiness addition on #185. No assignment or production setting changed.

## Published issue map

Priority values below were verified at publication; the Project field remains
authoritative after future triage. An issue can be design-first or have pending
acceptance despite a high Priority. New issues are in Project status **Todo**.
G01/G20 reuse existing issues and do not create duplicate implementation tickets.

| Review ID | Published issue | Journey scope / role | Labels at publication | Project Priority |
| --- | --- | --- | --- | --- |
| G02 | [#196 — Claim daily and trainer-level rewards](https://github.com/ewei068/pokestar/issues/196) | J02, J19 | `web-parity`, `web-release` | P1 |
| G03 | [#197 — Browse owned collection and build identity](https://github.com/ewei068/pokestar/issues/197) | J04, J129 | `web-parity`, `web-release` | P0 |
| G04 | [#198 — Protect and release a reviewed selection](https://github.com/ewei068/pokestar/issues/198) | J25, J47, J48 | `web-parity`, `web-release` | P1 |
| G05 | [#199 — Edit and restore battle formations](https://github.com/ewei068/pokestar/issues/199) | J05, J54, J55 | `web-parity`, `web-release` | P0 |
| G06 | [#200 — Automatically fill a party](https://github.com/ewei068/pokestar/issues/200) | J53 | `web-parity` | P2 |
| G07 | [#201 — Inspect owned resources](https://github.com/ewei068/pokestar/issues/201) | J18 | `web-parity`, `web-release` | P0 |
| G08 | [#202 — Buy supplies and location improvements](https://github.com/ewei068/pokestar/issues/202) | J13, J28, J49 | `web-parity`, `web-release` | P1 |
| G09 | [#203 — Roll banners and inspect acquired Pokémon](https://github.com/ewei068/pokestar/issues/203) | J03, J50, J51, J52 | `web-parity`, `web-release` | P0 |
| G10 | [#204 — Train and rebuild EV allocation](https://github.com/ewei068/pokestar/issues/204) | J06, J76 | `web-parity`, `web-release` | P0 |
| G11 | [#205 — Evolve and change owned builds](https://github.com/ewei068/pokestar/issues/205) | J21, J22, J24 | `web-parity`, `web-release` | P1 |
| G12 | [#206 — Upgrade and reroll equipment with costs](https://github.com/ewei068/pokestar/issues/206) | J07, J27, J75 | `web-parity`, `web-release` | P0 |
| G13 | [#207 — Compare and transfer equipment](https://github.com/ewei068/pokestar/issues/207) | J26 | `web-parity` | P2 |
| G14 | [#208 — Give and recover held items](https://github.com/ewei068/pokestar/issues/208) | J23 | `web-parity`, `web-release` | P0 |
| G15 | [#209 — Craft an item from owned resources](https://github.com/ewei068/pokestar/issues/209) | J29 | `web-parity`, `web-release` | P0 |
| G16 | [#210 — Choose and start NPC battles with daily progress](https://github.com/ewei068/pokestar/issues/210) | J08, J64 | `web-parity`, `web-release` | P0 |
| G17 | [#211 — Enter and finish multiphase dungeons](https://github.com/ewei068/pokestar/issues/211) | J30, J104 (dungeon portion) | `web-parity`, `web-release` | P0 |
| G18 | [#212 — Enter and advance the Battle Tower](https://github.com/ewei068/pokestar/issues/212) | J31; J104 (tower portion) | `web-parity`, `web-release` | P1 |
| G19 | [#213 — Start another encounter from its result](https://github.com/ewei068/pokestar/issues/213) | J65 | `web-parity` | P2 |
| G21 | [#214 — Use Auto and inspect replenished cards](https://github.com/ewei068/pokestar/issues/214) | J32, J63 | `web-parity` | P1 |
| G22 | [#215 — View quests and claim staged rewards](https://github.com/ewei068/pokestar/issues/215) | J12, J56, J57, J58 | `web-parity`, `web-release` | P0 |
| G23A | [#216 — Initialize authenticated web trainers and grant starting resources](https://github.com/ewei068/pokestar/issues/216) | J46 — Create a trainer and receive starting resources | `web-parity`, `web-release` | P0 |
| G23B | [#217 — Preserve tutorial progress and learning rewards on web](https://github.com/ewei068/pokestar/issues/217) | J01 — Learn to play; J59 — Claim tutorial rewards and resume the next lesson | `web-parity`, `web-release` | P1 |
| G24 | [#218 — Help players find delivered actions and objectives](https://github.com/ewei068/pokestar/issues/218) | J36, J60 | `web-parity`, `web-release` | P1 |
| G25 | [#219 — Persist profile privacy and reminder preferences](https://github.com/ewei068/pokestar/issues/219) | J35, J71, J74 | `web-parity`, `web-release` | P1 |
| G26 | [#220 — Inspect self and permitted other trainer profiles](https://github.com/ewei068/pokestar/issues/220) | J17 | `web-parity` | P2 |
| G27 | [#221 — Browse species research and ownership counts](https://github.com/ewei068/pokestar/issues/221) | J20 | `web-parity` | P2 |
| G28 | [#222 — Obtain and customize Mew](https://github.com/ewei068/pokestar/issues/222) | J40, J77 | `web-parity` | P1 |
| G29A | [#223 — Obtain Darkrai with compatible learning credit](https://github.com/ewei068/pokestar/issues/223) | J87 | `web-parity` | P1 |
| G29B | [#224 — Explain Darkrai ownership and Auto access](https://github.com/ewei068/pokestar/issues/224) | J44 | `web-parity` | P2 |
| G30 | [#225 — Create and answer PvP challenges](https://github.com/ewei068/pokestar/issues/225) | J10 | `web-parity` | P1 |
| G31 | [#226 — Offer, consent to and complete a trade](https://github.com/ewei068/pokestar/issues/226) | J14, J68, J69 | `web-parity` | P1 |
| G32 | [#227 — Host, join and settle raid instances](https://github.com/ewei068/pokestar/issues/227) | J11, J66, J67 | `web-parity` | P2 |
| G33 | [#228 — Obtain Celebi and use daily time travel](https://github.com/ewei068/pokestar/issues/228) | J41, J78 | `web-parity` | P2 |
| G34 | [#229 — Obtain and change Deoxys forms](https://github.com/ewei068/pokestar/issues/229) | J42, J80 | `web-parity` | P2 |
| G35 | [#230 — Obtain Jirachi and choose a weekly wish](https://github.com/ewei068/pokestar/issues/230) | J43, J81, J83, J84, J85, J86 | `web-parity` | P2 |
| G36 | [#231 — Obtain Arceus and use its powers](https://github.com/ewei068/pokestar/issues/231) | J45, J88, J89, J90, J91 | `web-parity` | P2 |
| G37 | [#232 — Read events, updates and community support](https://github.com/ewei068/pokestar/issues/232) | J37, J38, J105 | `web-parity` | P2 |
| G38 | [#233 — Compare global and server standings](https://github.com/ewei068/pokestar/issues/233) | J15, J70 | `web-parity` | P2 |
| G39 | [#234 — Claim accepted vote credit on web](https://github.com/ewei068/pokestar/issues/234) | J33 | `web-parity` | P2 |
| G40 | [#235 — Define shared player-operation effects and prove them in the first slice](https://github.com/ewei068/pokestar/issues/235) | J61, J62, J79, J82, J106, J127 | `web-parity`, `web-release` | P0 |
| G41 | [#236 — Show a saved, participant-safe completion receipt](https://github.com/ewei068/pokestar/issues/236) | J102 | `web-parity`, `web-release` | P0 |
| E184 | [#184 — Verify production reboot recovery and backup restoration](https://github.com/ewei068/pokestar/issues/184) | J09, J128 | Neither (unchanged) | P3 |
| E185 | [#185 — Complete real-environment web battler acceptance](https://github.com/ewei068/pokestar/issues/185) | J107, J108, J09, J92, J93, J94, J95, J96, J97, J98, J99, J100, J101, J103, J128 | `web-parity`, `web-release` | P1 |
| E186 | [#186 — Design and verify reward and Auto claim recovery](https://github.com/ewei068/pokestar/issues/186) | J102, J61, J64, J67, J79, J100, J127, J128 | `web-parity`, `web-release` | P1 |
| E187 | [#187 — Assess and remediate remaining production dependency exposures](https://github.com/ewei068/pokestar/issues/187) | No catalog journey; shared prerequisite or web-only improvement | `web-release` | P2 |
| E190 | [#190 — Tapping a target for a move on web devices occasionally instantly uses the move or doesn't bring up the confirm option](https://github.com/ewei068/pokestar/issues/190) | J93 | `web-release` | P1 |
| E191 | [#191 — Web battler to auto-scroll to arena if off-screen upon entry](https://github.com/ewei068/pokestar/issues/191) | J09, J95 | `web-release` | P2 |
| E192 | [#192 — Reduce polling and cut network traffic loads](https://github.com/ewei068/pokestar/issues/192) | J09, J103, J106, J128 | `web-release` | P1 |
| E194 | [#194 — Use icons on web interface](https://github.com/ewei068/pokestar/issues/194) | J04, J18, J51, J75, J95 | `web-parity`, `web-release` | P0 |
| E195 | [#195 — Web interface upselling](https://github.com/ewei068/pokestar/issues/195) | No catalog journey; shared prerequisite or web-only improvement | `web-release` | P0 |
| W01 | [#237 — Design release navigation and responsive screen patterns](https://github.com/ewei068/pokestar/issues/237) | Web-only proposal; no parity journey | `web-release` | P0 |
| W02 | [#238 — Verify the complete web release loop and rollout boundary](https://github.com/ewei068/pokestar/issues/238) | Web-only proposal; no parity journey | `web-release` | P1 |

## Journey-to-ticket reconciliation

The [individual audit rows](web-parity-coverage.md#individual-journey-assessments)
link to their published primary owner. Additional ownership remains explicit:
J104 → #211 dungeon phases / #212 tower floors; J82 → #235 shared contract,
#203 acquisition odds / #227 raid reward odds; J79 → #235 and its daily/training/
battle consumers; J102 → #236 receipt plus #186 recovery. A foundational ticket
being in release does not pull every later consumer into release.

All mechanics and resource side effects stay with consuming operations' acceptance;
no screen was created per mechanic. Stored Celebi/Jirachi/Darkrai benefits and
Discord-earned prerequisites remain usable independently of later unlock screens.
The source audit's evidence and provisional estimates remain available, while
public tickets contain self-contained outcome, evidence, acceptance, dependencies
and verification so uncommitted local documentation is not their only context.

## Verification receipt

Read-back used fresh all-state issue, label and Project queries after mutations.

- 43 unique new publication markers and issues; no duplicate group tickets.
- All 52 reviewed/published records have exactly one Project 3 item and the approved
  Priority. Distribution: P0 **17**, P1 **18**, P2 **16**, P3 **1** (#184).
- Every web label matches the approved record (including the G23 split); all new
  issue bodies match their prepared text and all dependency references resolve to
  published issue URLs. Existing issue titles/bodies remained byte-for-byte unchanged.
- All 106 eligible catalog IDs have at least one published parity owner; all 23
  exclusions remain excluded. No bot-priority inclusion or journey re-rating.
- Project README documents the two label filters and removes the stale claim
  that journey prioritization is future work. Project visibility and saved-view
  filters were not changed. No runtime code, tests or production actions were run.

For release execution, filter Project 3's existing Open issues view with
`label:web-release`, retaining its repository/issue/open filters and ascending
Priority. Dependencies still govern sequence within a priority. Use
`label:web-parity -label:web-release` for later parity bookkeeping.

Next work is the approved design/proof slice, starting with the shared operation
contract and representative collection/party/NPC/receipt path. Publishing the
backlog did not implement those features, settle every design choice, authorize
production actions or start standing monitoring. The
[next-session handoff](../handoffs/2026-10-29-web-navigation-foundation.md) captures
the bounded design scope and prompt. Load the planning package from
`codex/web-parity-planning-handoff` when continuing in another checkout; the
temporary review page, local server and publication scripts are not required.
