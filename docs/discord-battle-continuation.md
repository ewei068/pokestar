# Discord battle continuation

`/continue-battle` is registered in alpha with an optional battle ID. Without an ID, it lists the player's ongoing durable battles with pagination; selecting one renders the current battle. Slash replies are private, and the legacy message command sends the battle to the author by DM. The current renderer reuses the existing Discord battle embed, while new buttons and menus carry the battle ID and observed revision.

Selecting a move shows legal targets. Choosing a target or skipping sends an action through `BattleService` with the Discord interaction ID as the request ID. The returned battle is rendered from the durable record. A stale or invalid button gets the latest state and an explanation; old Discord messages may remain stale until pressed or refreshed. Completed and expired battles render read-only during their retention window.

This command currently lists only battles created through `BattleService`; live `/pve`, `/pvp`, dungeon, raid, and tower starts have not been cut over. It is alpha-only while completion rewards and callback-backed modes are made durable. The new component events have no per-click experience or money reward, so stale refreshes cannot farm command rewards.
