# Share durable battles across Discord and web

Pokestar will give each started battle one durable identity and state that participants can continue through either Discord or the web. Both surfaces will submit actions through the same battle service. This replaces the current reliance on expiring Discord interaction state because battles must survive process restarts and support continuation from either surface; Discord messages and web views can be refreshed from the battle record.
