# Triage labels

These are repository conventions, independent of the installed skill provider.
Use labels that help the current work; an issue need not have every category.
Priority lives in the GitHub Project's single-select field, using
[the priority rubric](prioritization.md), rather than a second set of labels.

| Label | Meaning |
| --- | --- |
| `bug`, `enhancement`, `documentation` | Kind of work |
| `needs-triage` | Scope or priority needs a maintainer decision |
| `needs-info` | A specific unanswered question blocks progress |
| `ready-for-agent` | Outcome, scope, dependencies and verification are clear enough to execute |
| `ready-for-human` | The next action requires human judgment or access; explain it in the issue |
| `agent` | Optional provenance: created or managed through an agent workflow |
| `wontfix` | Intentionally declined work |

Remove conflicting readiness/waiting labels when the next action changes.
Assigning a ticket coordinates ownership; it does not authorize deployment or
other actions beyond the user's request. Search all issues before creating one.
Wayfinder labels are optional and described in [issue conventions](issue-tracker.md).
