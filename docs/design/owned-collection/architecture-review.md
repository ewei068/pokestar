# Independent architecture review

This review covers the original proposal. The later maintainer-feedback amendment
at the top of [architecture.md](architecture.md) supersedes its infrastructure,
migration and revision recommendations and has not had another independent review.

2026-10-31. A fresh review agent inspected the
[proposal](architecture.md), current contracts and relevant source. The review
was read-only; the author made the repairs below. This is one focused review
and one repair pass, not an implementation verification.

## Findings and disposition

| Priority | Finding and reachable consequence | Repair |
| --- | --- | --- |
| P1 | U3 used partyRevision for cached party/membership views while party writers migrated in U4. Discord edits could leave the version unchanged and the web view stale. | Required counter/writer participation now precedes U3 cached views. Shared Discord commands and ownership coordination move into foundation work; U4 enables browser editing. |
| P2 | “Invalidate that domain” omitted cross-domain dependencies. A changed party could leave an “in party” collection result stale; a changed build could leave party summaries stale. | Added the counter-to-query dependency matrix and revision-vector acceptance, including definitive errors that would otherwise erase newer cached detail. |
| P2 | The draft called all migrated Discord callback rewards 5/10. A reachable legacy Pokémon-selection event grants 10/25. | Specified separate trusted Deact, legacy eventConfig and commandConfig policies. Existing handler grants are skipped only for operations whose runner handled the grant. |

The reviewer found the overall direction proportionate to the existing
crash/replay and shared-ownership contracts. It found no additional concrete
blocker in the proposed receipt replay or ownership guard approach. This is an
assessment of the proposal, not evidence that transaction infrastructure or
writer migration already works.

## Clarifications incorporated

- Primary/snapshot transaction reads and majority commit durability need
  explicit deployment verification.
- Persist unresolved operation identity before dispatch for reload recovery.
- Detect shared-cookie account changes across tabs. Requests assert their
  expected account against the authenticated actor; response/auth epochs prevent
  old-account data or commands crossing into the new account.
- The author also broadened the trainer revision to cover projected profile
  fields as well as resources, and made deployment writer-overlap rules explicit.

## Evidence and remaining work

Source checks included party update/preset paths, trainer snapshot and grant
helpers, owned listing/detail, release/trade ownership checks, Discord handlers,
eventConfig, auth/transport and the standalone-Mongo runbook. The author checked
the repaired clauses against those findings and checked local document links
and whitespace.

No production code changed and no runtime tests ran for this proposal.
Live topology, all-writer migration closure, transaction crash/restart behavior
and client cache integration still require implementation evidence. The user
review comes next; the infrastructure migration and library adoption remain
proposed.
