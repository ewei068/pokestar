# Ticket priority

This is the maintainer's provisional starting rubric from 2026-10-28. Apply it with
judgment and revise it when real prioritization decisions expose a gap.

The linked GitHub Project's **Priority** single-select field is authoritative:
P0, P1, P2, P3, in that order. Labels describe work type and readiness; maintain
one priority value rather than duplicate priority labels. An empty priority
means not yet triaged, not low priority.

## Bugs

| Priority | Guideline |
| --- | --- |
| P0 | Active incident that breaks critical user journeys |
| P1 | Breaks mid-impact user journeys or adds friction to critical user journeys |
| P2 | Breaks low-impact user journeys or adds friction to mid-impact user journeys |
| P3 | Otherwise |

## Features, enhancements and other non-bug work

| Priority | Guideline |
| --- | --- |
| P0 | Must complete next essential work |
| P1 | Normal planned work, or a nice-to-have for next essential work |
| P2 | Nice-to-have enhancement for normal planned work |
| P3 | Otherwise |

## Triage decisions

Identify whether the ticket describes broken current behavior or a new outcome;
split mixed work when it needs different priority or acceptance criteria. Labels
are useful context, but do not establish that a current incident exists.

For a bug, record the affected journey, the observed breakage/friction and why
that journey has the stated impact. For other work, name the essential or planned
outcome it supports. Treat non-bug P0 as an explicit maintainer commitment rather
than inferring that everything useful for rollout must be next.

At the same priority, active incidents take precedence over planned non-bug
work. Otherwise sequence by dependencies and the maintainer's chosen outcome.
Priority is separate from readiness, ownership and permission to act. A P0 can
still need investigation; it does not authorize a production change by itself.

The [user journey catalog](../user-journeys.md) records all 129 reviewed bot/web
ratings, surface exceptions and unresolved dependency questions. Use those
ratings as impact context; do not copy a journey's priority directly onto every
related ticket. Equivalent journeys provisionally share bot/web priority, with
explicit reviewed exceptions retained.

For supporting work, identify the consumer and the behavior it depends on.
Stored vote credit, claiming rewards and promoting voting are separate concerns;
so are acquiring an unlock and applying an already-owned bonus. The review does
not settle a general dependency-priority rule. Record the dependency rationale
and proposed ticket urgency separately without silently changing journey ratings.

Mark uncertain impact judgments as provisional; ask for maintainer judgment
when they change sequencing. Keep untriaged items visible and avoid assigning
priorities solely from their titles.

## Deferred

- Resolve the catalog's open dependency and Dream Card decomposition questions when
  scoping concrete work. The journey review is complete; this documentation
  update does not change the state of the related
  [journey tracking issue](https://github.com/ewei068/pokestar/issues/188).
- Add completion-state board lanes only if execution tracking needs them. Reuse
  the same Project items and Priority field; the current scope is an open-issues
  table, not a separate status workflow or completion automation.
