# Earlier implementation plan review — superseded

2026-11-02. One independent review checked the draft’s retained-start protocol.
Its three findings concerned timestamp binding, Discord Replay attempt identity
and participation grants during recovery. They were repaired in that draft.

The maintainer subsequently removed the entire retained-start requirement:
accidental duplicate battles are acceptable, and disabling Start while a request
is pending is sufficient. The associated review findings and protocol-specific
tests are withdrawn, rather than deferred implementation requirements.

The [current plan](../../plans/2026-11-02-1847-feat-npc-battle-start-plan.md)
uses the ordinary shared start path, current server party validation and in-memory
pending state. This bounded simplification is reviewed directly in the current
context. No new independent review pipeline or approval gate is required.
