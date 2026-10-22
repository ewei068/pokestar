# First widescreen annotation batch

Implemented locally **2026-10-21, America/Los_Angeles** from the user's nine
browser comments. The user accepted the local UI on **2026-10-22**. This records
implementation and checks separately from publication and production acceptance.

| Comment | Implemented response |
| --- | --- |
| 1 | Replace the italic serif `vs` with a compact bold `VS`. |
| 2 | Keep team names; remove YOU/RIVAL/front-direction labels. |
| 3 | Explicitly prefix battle ID and revision with `Debug`. The battle itself is not labeled a debug simulation. |
| 4 | Reserve enough HUD space for all three level digits before the HP/CR meters, including phone widths. |
| 5 | Remove the sorted readiness rail. Individual readiness meters and inspector values remain. |
| 6 | Show Skip only when it is the participant's sole legal action. The durable service automatically records forced skips whenever the engine says no move is possible, until a player has a choice or the battle ends. |
| 7 | Put status in a clickable three-letter badge beside the Pokémon name, ability and held item in separate labeled rows near the identity, and effects below the meters. |
| 8 | Separate effect duration from description prose, using a clock icon and turn count beside its title. |
| 9 | Put move type beside its title; put category, power, accuracy and cooldown in that order before its description. Facts have icons and labels; category `Other` displays as Status. Remove the redundant target-pattern chip while preserving board targeting and focus/touch access. |

The dense story now includes levels 100/123, a long name, a TOX badge, an effect,
ability and held item to make these changes repeatable. Shared inspector and HUD
changes also receive narrow-screen checks. The narrow desktop sidebar and
320 px layout wrap move facts into two columns while preserving reading order.

## Verification

- Component tests cover Skip visibility, separate inspect controls, TOX,
  structured effect duration, and move-fact order before the description. All
  three new tests failed against the old implementation before the UI changes.
- Real engine/store/service tests cover forced skips after an action and
  concurrent reads, persisted events/replay, a usable next player turn, and
  protection against a stale metadata write. The forced-skip tests failed
  before implementation.
- Independent review reproduced an intermediate-state cursor race. A matching
  cursor could suppress necessary progression indefinitely. The regression
  was strengthened to poll that exact cursor and failed before its correction.
  The store now records `needsAutomaticTurn` with the action revision; reads
  resume pending work regardless of cursor equality. Legacy records cache a
  settled marker under a revision check; unchanged-poll tests cover both new
  and legacy records without repeated replay.
- Live authenticated browser inspection checked heading/debug information,
  absence of the redundant labels/rail/Skip, complete levels 100–120, separate
  ability/item rows, effect duration and move facts. Only selection and
  inspection were used; no live battle action was submitted for this pass.
- Browser checks include the 1158 px live screen, 1280 px development states,
  1024 px sidebar, 390 px phone and 320 px narrow phone; inspect/status/back
  navigation remains available.
  Browser measurements checked horizontal overflow and level-label clipping.
- Area targeting, effects, waiting, completed and move/result-sequence stories
  retained their board with no horizontal overflow or readiness rail. This was
  a representative state check, not another timing/audio acceptance pass.
- Full web suite: **86 tests / 21 suites passed**. Full backend suite after the
  recovery correction: **834 tests / 28 suites passed**. Web production build,
  targeted JavaScript lint, `git diff --check` and changed-document relative
  link checks passed. Browser checks verified the final narrow-label CSS.
- A focused code review plus an independent local adversarial read found the
  cursor race above. The targeted remediation recheck reviewed the new metadata
  writes and concurrency and found no remaining actionable issue. The local
  review receipt is run `20261021-201325-63cb9a11`; no cross-model review ran.

## Limits and review

Vite hot reload exposed the client changes in the existing authenticated local
page. The running backend was not restarted; forced skipping is verified with
the real engine and in-memory action store, not a new authenticated Mongo battle.
Restart the local bot/backend to load that service behavior. No OAuth settings,
credentials, production flags or live battle data were changed. Automated and
browser checks do not establish production acceptance. The user's 2026-10-22
approval covers the reviewed local UI.
