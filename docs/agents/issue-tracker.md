# Issue tracker: GitHub

Use GitHub Issues on `ewei068/pokestar` through an available connector or the
authenticated `gh` CLI. Search all relevant issues before creating one; the
optional `agent` label must not restrict the default search.

## Ticket contract

Each actionable ticket states the outcome/problem, current evidence, scope,
acceptance criteria, dependencies and verification. Link maintained plans and
contracts instead of maintaining a second copy of their full specification.
Use [triage labels](triage-labels.md) when they help identify the next action.
Compound Engineering does not require a special label taxonomy.

- Read: `gh issue view <number> --json number,title,body,labels,comments`.
- Search: `gh issue list --state all --search "<topic>"`.
- Create: `gh issue create --title "<title>" --body-file <markdown-file>`.
- Resolve: link the implementation and verification, then close as completed.
- Retire stale or declined work as not planned, with the reason recorded.

Publishing or messaging follows the user's authorization. A document mentioning
an issue tracker is not a standing instruction to create tickets automatically.
PRs are implementation/review artifacts; ordinary backlog triage concerns issues.

## Wayfinding operations

Use this optional path only when the user chooses Wayfinder for an effort whose
unresolved decisions span sessions. A map tracks decisions; ordinary execution
tickets do not need this protocol.

- **Map:** one issue labelled `wayfinder:map`. Its Notes identify the destination
  and the selected workflow; Decisions-so-far links to resolved child decisions.
- **Child:** a native GitHub sub-issue of the map. Use `wayfinder:research`,
  `wayfinder:prototype`, `wayfinder:grilling` or `wayfinder:task` for its type.
  Create missing labels only when starting an authorized map. `task` means
  direct resolution of a decision unless the map explicitly includes execution.
- **Parent link:** use GitHub's sub-issue UI/API. The REST operation is
  `POST /repos/{owner}/{repo}/issues/{parent}/sub_issues`, with the child's
  numeric database ID as `sub_issue_id`. If unavailable, maintain a parent task
  list and a `Part of #<parent>` line on each child.
- **Blocking:** use native issue dependencies. Add a blocker with
  `POST /repos/{owner}/{repo}/issues/{child}/dependencies/blocked_by`, passing
  the blocker's database ID as `issue_id`. If unavailable, use `Blocked by: #N`
  lines. A ticket is unblocked when all blockers are closed.
- **Frontier:** read the map's open children in map order; exclude assigned
  children and those with open blockers. Claim the first eligible child by
  assigning the driving developer before changing its resolution.
- **Resolve:** record the answer in a comment, close the child, and add a brief
  linked context pointer to Decisions-so-far. Use titles as the visible links.

When decisions are settled, hand the map's results to CE planning or execution.
Keep the decision in its child ticket and link it from any implementation plan.
