# Battle layout study (throwaway)

**Question:** Which structure makes a Pokestar battle feel like a game while
keeping the board, actions, and details easy to scan on desktop and mobile?

Run `cd web && npm run prototype`, or open
`http://localhost:5173/?prototypeBattle=1&variant=A` while Vite is running.
The route exists only in Vite development builds. It uses sample data, needs
no login or server, and never submits a battle action. Use the bottom bar or
left/right arrow keys to switch variants. Select a move, then a highlighted
Pokémon; hover or focus a move or Pokémon to inspect it. Move selection also
works by tap.

| Variant | Main question |
| --- | --- |
| A · Facing arena | Does a mirrored left/right board make front rows and targets easiest to read? |
| B · Tactical board | Does an enemy-above/player-below board work better across desktop and mobile? |
| C · Command desk | Is a roster-first view worth losing exact row/column placement in the main view? |

This study follows the local design notes in `docs/design/spec.md`. The sample
uses six Pokémon per side, type cues, HP and combat-readiness bars, compact
move controls, and a details panel. The readiness strip is **not a predicted
turn order**: effective Speed also matters, and the current browser projection
does not include it. Sprite URLs and battle data here are sample fixtures,
not the production asset or battle contract.

**Verdict:** pending user review. After a direction is chosen, implement it in
the real battle screen and remove the prototype route from the mainline PR.
