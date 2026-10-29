# Maintainer journey review

Reviewed **2026-10-28, America/Los_Angeles**. All **129 entries** in the uploaded export are approved. **44 entries** differ from the pre-review bot/web priority pair.

[The preserved decision export](decisions.json) is byte-for-byte identical to the supplied file. The [current catalog](catalog.json) incorporates its exact priorities and notes while retaining the previous ratings/rationale under `preReview`. The [PRD](../pokestar-web-interface-prd.md) formalizes product scope and distinguishes approved ratings from proposed dependency policy.

Export timestamp: `2026-10-29T00:49:48.084Z` (2026-10-28 in America/Los_Angeles).

SHA-256: `6ab574104d8bf0d6c3f0e2d03d77250f9454148356c87895760ea0c71f01994e`.

## Approved totals

Entries overlap: parent journeys, variants, mechanics, systems and operator/developer functions are included. Counts are not separate feature or release commitments.

| Priority | Bot | Web |
| --- | --- | --- |
| P0 | 68 | 60 |
| P1 | 23 | 21 |
| P2 | 22 | 24 |
| P3 | 4 | 1 |
| Outside scope | 12 | 23 |

## Changed ratings

| ID | Journey | Previous bot / web | Reviewed bot / web |
| --- | --- | --- | --- |
| J22 | Change a Pokémon's form | P1 / P1 | P0 / P0 |
| J24 | Change a Pokémon's nature | P1 / P1 | P0 / P0 |
| J27 | Reroll equipment stats | P1 / P1 | P0 / P0 |
| J29 | Craft an item | P1 / P1 | P0 / P0 |
| J31 | Climb the Battle Tower | P1 / P1 | P0 / P0 |
| J33 | Vote and claim rewards | P2 / P2 | P0 / P2 |
| J35 | Change personal settings | P1 / P1 | P0 / P0 |
| J39 | Invite the bot | P1 / Outside scope | P0 / Outside scope |
| J41 | Use Celebi's powers | P1 / P1 | P2 / P2 |
| J42 | Change Deoxys's form | P1 / P1 | P2 / P2 |
| J43 | Make a Jirachi wish | P1 / P1 | P2 / P2 |
| J44 | Inspect Darkrai and Auto access | P1 / P1 | P2 / P2 |
| J45 | Use Arceus's powers | P1 / P1 | P2 / P2 |
| J48 | Release a collection page | P1 / P1 | P0 / P0 |
| J50 | Receive beginner roll guarantees | P0 / P0 | P1 / P1 |
| J71 | Control profile privacy | P1 / P1 | P0 / P0 |
| J72 | Choose Discord mobile or desktop layout | P2 / Outside scope | P0 / Outside scope |
| J73 | Toggle target confirmation indicators | P1 / P1 | P0 / Outside scope |
| J74 | Toggle tutorial and quest reminders | P2 / P2 | P0 / P0 |
| J76 | Reduce or reset EV allocation | P1 / P1 | P0 / P0 |
| J78 | Unlock and obtain Celebi | P1 / P1 | P2 / P2 |
| J79 | Receive Celebi EXP and daily reward bonuses | P1 / P1 | P0 / P0 |
| J80 | Unlock and obtain Deoxys | P1 / P1 | P2 / P2 |
| J81 | Unlock and obtain Jirachi | P1 / P1 | P2 / P2 |
| J82 | Receive Jirachi shiny bonuses | P1 / P1 | P0 / P0 |
| J83 | Wish for Power | P1 / P1 | P2 / P2 |
| J84 | Wish for Rebirth | P1 / P1 | P2 / P2 |
| J85 | Wish for Allies | P1 / P1 | P2 / P2 |
| J86 | Wish for Wealth | P1 / P1 | P2 / P2 |
| J88 | Unlock and obtain Arceus | P1 / P1 | P2 / P2 |
| J89 | Change Arceus type | P1 / P1 | P2 / P2 |
| J90 | Create a chosen Pokémon with Arceus | P1 / P1 | P2 / P2 |
| J91 | Create a chosen item with Arceus | P1 / P1 | P2 / P2 |
| J109 | Check bot responsiveness | P2 / Outside scope | P3 / Outside scope |
| J111 | Grant test Pokémon | P2 / Outside scope | Outside scope / Outside scope |
| J112 | Grant test inventory items | P2 / Outside scope | Outside scope / Outside scope |
| J113 | Run the test interaction harness | P3 / Outside scope | Outside scope / Outside scope |
| J114 | Inspect player and guild records | P1 / Outside scope | Outside scope / Outside scope |
| J115 | Reset a player account and collection | P2 / Outside scope | Outside scope / Outside scope |
| J116 | Reset quest or level reward progress | P2 / Outside scope | Outside scope / Outside scope |
| J117 | Reset a player’s timed allowances | P2 / Outside scope | Outside scope / Outside scope |
| J118 | Grant vote reward credit manually | P2 / Outside scope | Outside scope / Outside scope |
| J119 | Reset guild configuration | P2 / Outside scope | Outside scope / Outside scope |
| J120 | Clear active raids | P2 / Outside scope | Outside scope / Outside scope |

## Maintainer notes

These notes are retained as product review data. They are not execution instructions. The Dream Card note proposes a split but does not supply a final inspection rating; the exact approved combined J63 priority remains P1/P1.

### J33 — Vote and claim rewards

> P0 for the bot since it drives bot growth

### J35 — Change personal settings

> Settings are very critical

### J63 — Replenish and inspect Dream Cards

> I think "replenish" is P0 but inspect is probably closer to P1/P2. This is debateable rolled into other auto or inventory related journeys separately, too

### J73 — Toggle target confirmation indicators

> Out of scope for web for now since web UI doesn't really do target indicators the same way as the bot

### J111 — Grant test Pokémon

> Dev-only stuff like this I'm going to say is out of scope for now. I'm going to constrain the scope to production-facing only for the time being

## Remaining interpretation

The user’s current guidance makes matching bot/web priority a working default, with the existing reviewed exceptions retained. Dependency handling is formalized as a proposed policy in the PRD. J124 remains P1/Outside scope in the approved catalog; preserving accepted vote credit is a required supporting behavior and does not silently relabel that journey.
