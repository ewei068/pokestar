# Battle tile VFX matrix

The development-only [VFX lab](http://localhost:5173/?previewBattle=1&story=vfx)
lets reviewers choose a type, action category, and target area. Its URL records
the selection so a specific combination can be shared. The six named Normal
move stories remain available under **Move examples**.
The [creation guide](battle-vfx-guide.md) records the current quality direction
and the workflow for future effects.
The [full matrix contact sheets](prototypes/vfx-matrix/README.md) show the
development-only first pass for all 54 combinations. The table below names
their starting motifs; it does not imply that every cell is art-approved.

Travel is category-driven and identical across types: Physical approaches the
primary target; Special and Status approach its lane; self-targeting stays put.
Each executed footprint tile receives the selected SVG effect, including empty
tiles. The actor returns before result events. Result animations and sound are
outside this pass.

These are first-pass visual motifs for feedback, grouped by type:

| Type | Physical | Special | Status |
| --- | --- | --- | --- |
| Normal | Pixel impact and pressure circles | Concentric energy swirl | Soft pulse and compass marks |
| Fighting | Fist strike and pressure rings | Incoming aura sphere | Converging fist guard |
| Flying | Sweeping air cuts | Cyclone | Drifting feathers and breeze |
| Poison | Crossed slashes and bubbles | Incoming sludge orb and drips | Spreading toxic pool and rising bubbles |
| Ground | Cracked earth | Rising dust bands | Tremor ripples |
| Rock | Flying shards | Stone pillars | Faceted stone halo |
| Bug | Pincer cuts | Winged swarm | Cocoon and motes |
| Ghost | Wisp strike | Spectral spiral | Haunting veil |
| Steel | Metal impact star | Energy grid | Shield sigil |
| Fire | Burning slash streaks | Rising column with a central ember | Ember halo |
| Water | Splash cuts | Whirlpool | Drop and ripples |
| Grass | Leaf blades | Growing vines | Sprout |
| Electric | Lightning strike | Arcing field | Static ring |
| Psychic | Warped lens | Orbital field | Mind rings |
| Ice | Ice fracture | Snowflake burst | Frost sigil |
| Dragon | Claw marks | Dragon vortex | Runic ring |
| Dark | Crescent cut | Shadow eclipse | Shadow veil |
| Fairy | Star strike | Radiant star field | Staggered mote halo |

The battle engine currently registers 18 standard types plus Unknown and Shadow.
It has a Terapagos Stellar form but no separate Stellar move type in its type
enum. Unknown, Shadow, Stellar, and any future type use Normal VFX in all three
categories. The lab includes the three named extras to make that fallback
visible. A later custom move animation can take precedence over this type and
category matrix without changing the server event contract.
