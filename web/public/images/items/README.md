# Item icons

Browser assets for version control, served beneath the configured web base path at `images/items/`.
The NPC design study also uses these exact files.

| File | Existing local source |
| --- | --- |
| `poke-ball.png` | `extra_data/images/items/poke-ball.png` |
| `mint.png` | `extra_data/images/items/mint/neutral.png` |
| `raid-pass.png` | `extra_data/images/items/raid-pass.png` |
| `mew.png` | `extra_data/images/pokemon/icons/151.png` (menu icon, not the battle sprite) |
| `star-piece.png` | `extra_data/images/items/star-piece.png` |
| `knowledge-shard.png` | Discord emoji `knowledgeshard` from `backpackConfig`; not present in `extra_data` |
| `emotion-shard.png` | Discord emoji `emotionshard` from `backpackConfig`; not present in `extra_data` |
| `willpower-shard.png` | Discord emoji `willpowershard` from `backpackConfig`; not present in `extra_data` |

Pokeball, Mint and Raid Pass were copied unchanged from the project's existing, ignored art collection on 2026-11-02. Mew’s menu icon and the star piece image were copied from that collection on 2026-11-04. The three shard files were copied the same day from the Discord emojis named in `backpackConfig`, after they were not found in `extra_data`.
The neutral Mint image represents the generic Mint item; it does not indicate a selected nature.
`extra_data` remains untouched, so existing art workflows still work.
Only assets currently used by a study are promoted; this is not a general icon import or new icon registry.
Knowledge, Emotion and Willpower shards were looked for in `extra_data` and were not there. The files above are the emoji images already named by those items.
The originating collection does not include per-file attribution metadata; this move records local provenance, not a new licensing claim.
