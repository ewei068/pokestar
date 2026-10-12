# Battle interaction study (throwaway)

**Question:** With the facing arena selected, should phone controls sit directly
after the board or remain visible in a compact tray while choosing targets?

Run `cd web && npm run prototype`, or open
`http://localhost:5173/?prototypeBattle=1&variant=A` while Vite is running.
The route exists only in development, uses sample data, requires no login or
server, and never submits an action. Use the bottom bar or left/right arrow keys
to compare variants. On desktop, the two variants use the same layout.

| Variant | Phone interaction |
| --- | --- |
| A · Inline commands | Move buttons follow the two teams in the scroll. |
| B · Quick command tray | A horizontal move row stays visible near the bottom; swipe for more moves. |

Choose **Eruption**, then hover, focus, or tap a rival Pokémon. The orange
footprint includes all occupied and empty tiles in the pattern; the dark outline
marks the chosen primary target. Choose Flamethrower to compare a single-tile
pattern. The fixture uses the same additive `targetPreviews` shape as the web
battle response. It is illustrative sample data, not a live battle or the
authoritative move catalog.

The inspector combines Pokémon and move details. Click a status, effect,
ability, or held item for a description, then use Back. The type/status/effect
cues, compact cells, and readiness rail reflect feedback in
`docs/design/prototype-feedback.md`. The readiness rail is **not predicted turn
order**; effective Speed also matters.

**Prior round:** The user preferred the facing arena (old A), found the
vertical board close second, and rejected the roster layout because it hid
formation. This round keeps formation and compares the mobile action flow.
After feedback, carry the chosen interaction into the production battle screen
and remove this route from the mainline implementation.
