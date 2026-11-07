# Item icons

Browser assets for version control, served beneath the configured web base path at `images/items/`.
The NPC design study also uses these exact files.

| File | Existing local source |
| --- | --- |
| `poke-ball.png` | `extra_data/images/items/poke-ball.png` |
| `master-ball.png` | `extra_data/images/items/master-ball.png` |
| `mint.png` | `extra_data/images/items/mint/neutral.png` |
| `raid-pass.png` | `extra_data/images/items/raid-pass.png` |
| `star-piece.png` | `extra_data/images/items/star-piece.png` |
| `knowledge-shard.png` | Discord emoji `knowledgeshard` from `backpackConfig`; not present in `extra_data` |
| `emotion-shard.png` | Discord emoji `emotionshard` from `backpackConfig`; not present in `extra_data` |
| `willpower-shard.png` | Discord emoji `willpowershard` from `backpackConfig`; not present in `extra_data` |
| `great-ball.png` | Discord emoji `greatball` (`1100296107759779840`) |
| `ultra-ball.png` | Discord emoji `ultraball` (`1100296166555521035`) |
| `lum-berry.png` | Discord emoji `lumberry` (`1342652061484978248`) |
| `sitrus-berry.png` | Discord emoji `sitrusberry` (`1342652062734880863`) |
| `custap-berry.png` | Discord emoji `custapberry` (`1358678114938519662`) |
| `exp-share.png` | Discord emoji `expshare` (`1343335843447701594`) |
| `choice-band.png` | Discord emoji `choiceband` (`1336571391616614411`) |
| `choice-scarf.png` | Discord emoji `choicescarf` (`1336571392480514069`) |
| `choice-specs.png` | Discord emoji `choicespecs` (`1336571393458049107`) |
| `amulet-coin.png` | Discord emoji `amuletcoin` (`1343335842307113000`) |
| `focus-band.png` | Discord emoji `focusband` (`1342654744526716938`) |
| `focus-sash.png` | Same emoji image as Focus Band (`1342654744526716938`), saved under its own filename |
| `lucky-egg.png` | Discord emoji `luckyegg` (`1343335844433498144`) |
| `leftovers.png` | Discord emoji `leftovers` (`1336571394531659837`) |
| `shell-bell.png` | Discord emoji `shellbell` (`1358678116150542518`) |
| `wide-lens.png` | Discord emoji `widelens` (`1342655292982169662`) |
| `life-orb.png` | Discord emoji `lifeorb` (`1342654745906774046`) |
| `power-herb.png` | Discord emoji `powerherb` (`1343334633424551956`) |
| `toxic-orb.png` | Discord emoji `toxicorb` (`1342654749169811506`) |
| `flame-orb.png` | Discord emoji `flameorb` (`1342654741846429778`) |
| `eviolite.png` | Discord emoji `eviolite` (`1342652890451546172`) |
| `rocky-helmet.png` | Discord emoji `rockyhelmet` (`1342654748070772746`) |
| `eject-button.png` | Discord emoji `ejectbutton` (`1358643223655874690`) |
| `heavy-duty-boots.png` | Discord emoji `heavydutyboots` (`1342656422562758707`) |

Pokeball, Mint and Raid Pass were copied unchanged from the project's existing, ignored art collection on 2026-11-02. The star piece image was copied from that collection on 2026-11-04. Mew's menu icon is `web/public/images/pokemon/mew.png`, copied from `extra_data/images/pokemon/icons/151.png`; it is not an item. The three shard files were copied the same day from the Discord emojis named in `backpackConfig`, after they were not found in `extra_data`. Great Ball, Ultra Ball, and the held-item files were copied on 2026-11-06 from those same catalog emojis. `extra_data` was not on disk for that copy. Focus Band and Focus Sash name one emoji id, so the two files are the same bytes.
The neutral Mint image represents the generic Mint item; it does not indicate a selected nature.
`extra_data` remains untouched, so existing art workflows still work.
The bag publishes an icon only when that file is already in this folder. This is not a new icon registry.
Knowledge, Emotion and Willpower shards were looked for in `extra_data` and were not there. The files above are the emoji images already named by those items.
The originating collection does not include per-file attribution metadata; this move records local provenance, not a new licensing claim.
