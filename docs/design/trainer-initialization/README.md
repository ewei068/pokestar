# Trainer initialization: header and account review

Design approved by the maintainer on 2026-10-30 for the current scope, with
browser battle starts still awaiting their own design and implementation. This
is the first affected surface after the accepted Jewel shell; it does not reopen
navigation or design future collection/party screens. The study remains a fixture;
production implementation and evidence are tracked in the web effort overview.

From the repository root:

```sh
python3 -m http.server 8130 --bind 127.0.0.1
```

Open [the editable review](http://127.0.0.1:8130/docs/design/trainer-initialization/).
The top review controls select seven scenarios and open/close the account panel.
Clicking the trainer initial also opens it; Escape closes it and restores focus.
`?state=new&account=open` links to a specific state. Add `&review=hidden` to hide
review controls for a product-only screenshot. These controls are outside the
proposed product UI.

## Proposed presentation

- Desktop: money before Bag; trainer initial, name and level beside the account
  control. The account panel contains full identity, exact EXP progress, money,
  Discord ID and the existing sign-out action.
- Phone: keep the existing brand/Bag/account/cog row. A compact second row shows
  money and name/level. The account panel opens below both rows, scrolls when
  needed and clears bottom navigation. Long names truncate only in the header;
  opening the account makes the complete name readable.
- Pending: “Getting your trainer ready…” covers both lookup and initialization.
  Do not display invented zero balances or claim a starter grant has completed.
- Failure or uncertain response: “Couldn't load your trainer.” with Try again.
  The valid session remains usable for sign out; retry returns to pending. It
  does not simulate successful persistence or require another OAuth login.
- Missing optional profile: neutral “Trainer” name and initial. No missing-avatar
  request is needed for the study; production should fall back to the same initial
  if the trusted avatar is absent or cannot load.

The Play list uses existing production composition and copy. The new-account
empty state adds the existing Discord `/gacha` and `/party` routes. It makes no
claim that acquisition, party editing or a starter Pokémon exists on web.
Other destinations and sign out open a study-boundary dialog instead of acting.

## Data and implementation boundaries

The study imports `web/src/style.css` directly, retaining shell scenery, controls,
sidebar and bottom navigation. Changes live in `study.css`; `study.js` holds only
named fixtures. No production source is changed or imported as JavaScript.
No API, OAuth, session, gameplay, reward or persistence calls occur.

| Display | Authoritative source / proposed projection |
| --- | --- |
| Trainer identity | Trusted OAuth profile stored on the acting trainer; existing session ID for older sessions. Neutral fallback when optional fields are missing. |
| Money and level | `src/config/trainerConfig.js` defaults and stored trainer values. New trainer: 1,000 money and level 1. |
| EXP | Stored cumulative EXP and `getTrainerLevelExp`; project progress within the level and the next threshold. New trainer: 0 / 100. At level 100 show Max level. |
| Account action | Existing session logout; do not require a loaded trainer to sign out. |
| Empty journey help | Existing `gacha` and `party` commands in `src/config/commandConfig.js`; existing `BattleList` remains the Play owner. |

These are proposed display needs, not an implemented API schema. Keep a bounded
acting-user projection; do not return the entire trainer, backpack, quest state,
party or private operational fields. Starter balls still use shared configured
defaults (10 Poké Balls, 5 Great Balls, 3 Ultra Balls, 1 Master Ball) but Bag
operations and their screen remain a later unit. Login/bootstrap awards no
gameplay interaction money/EXP and no lesson credit.

## Verification

Browser-checked all seven states at 1280, 390 and 320 px: no horizontal overflow,
account panels fit the viewport, and phone panels clear the resource row and
bottom navigation. Also checked 320×740 panel scrolling, keyboard Enter/Escape
with focus return, scenario switching, the boundary dialog, retry to pending,
neutral profile fallback and maximum-level display. No JavaScript page errors
or `/api/` requests occurred. JavaScript syntax and local document/asset links
were checked. Long-name and large-balance fixtures were visually inspected.

No production behavior changed, so runtime suites were not rerun for this
design-only checkpoint. These fixture checks do not establish actual OAuth,
Mongo uniqueness, concurrency, restart, resource refresh, cross-surface behavior,
physical-device acceptance or approval of the proposed design.

See the [first-slice plan](../../plans/2026-10-30-1740-feat-web-first-playable-slice-plan.md)
and [operation discovery](../../web-player-operations.md) for implementation and
persistence evidence requirements.
