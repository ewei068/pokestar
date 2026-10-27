# Domain language and decisions

Read relevant existing ADRs in `docs/adr/` before proposing a conflicting design.
The durable-battle and ordered-event ADRs explain shared Discord/web ownership;
their detailed contracts are indexed by `docs/efforts/web-battler.md`.

Use domain terms from the current contracts and `GLOSSARY.md` when one exists.
Create a glossary only when a real naming decision needs a maintained home.
Record a consequential architecture decision as an ADR when its reasoning would
otherwise be lost; link existing decisions rather than rewriting them for each
skill. These conventions apply with either personal skills or CE.

When codebase-design is selected, use its module/interface/seam vocabulary to
describe design choices. Preserve actual Pokestar names such as `BattleService`
and HTTP API when identifying implementation files and transport contracts.
