# Agent workflow

Repository contracts and task instructions govern the work. Skills supply
procedures; installing a different provider does not replace Pokestar's rules.
Generic skills stay in the user's installation, while repository skills capture
Pokestar-specific behavior.

## Choose one workflow for the current stage

- Use CE for ordinary planning, implementation, debugging and review when it is
  installed. Routine changes do not need every stage of the full pipeline.
- Use personal grilling when the user asks to stress-test a decision. Its
  explicit confirmation ends the interview before execution starts; this is
  not an extra approval step for unrelated CE work.
- Use codebase-design for deep-module vocabulary when designing interfaces.
  Use improve-codebase-architecture when the user requests its exploratory
  report and candidate-selection workflow, rather than adding a scan to every PR.
- Use Wayfinder when the user chooses a persistent map of unresolved decisions.
  Its issue operations are in [issue-tracker.md](issue-tracker.md). Hand settled
  decisions to a CE plan; keep a single owner for each stage.

Personal skills are optional and are not vendored here. Explicitly select an
older general review/debug/prototype skill if its behavior is desired; otherwise
prefer CE instead of running both against the same task.

## Proportionate review and cost

The following controls were checked against the installed CE **3.31.1** on
2026-10-26. Recheck the plugin's supported arguments after upgrades.

- Request a quick review for routine changes. CE's quick/fast/light route uses
  the harness's built-in review when available; otherwise it falls back to CE's
  multi-agent route. It is not a guaranteed cheap mode on every host.
- Normal report-only review uses `depth:auto`: CE chooses lite, focused or full.
  `depth:full` forces full review; `depth:lite` is not a supported argument.
- `apply:local` (or an explicit apply request to the review itself) forces full
  review. For a routine edit, request findings first, then fix the accepted
  findings in the implementation workflow. This changes the workflow and does
  not provide CE's full verified-apply receipt.
- `mode:agent` changes serialization, not depth or reviewer selection.
- Prefer one review and one focused repair pass. Reopen investigation when a
  failing check or concrete unresolved defect warrants it. Separate speculative
  hardening and unrelated improvements from defects that block this change.
- Reuse verification for an unchanged tree. Rerun checks affected by subsequent
  edits; repeat broad checks when those edits or unresolved failures warrant it.

The tracked `.compound-engineering/config.yaml` disables the automatic standing
post-PR watch, optional PR concept teaching and explainer archival. Review depth
and cross-model selection retain CE's defaults. Personal checkout overrides
belong in `.compound-engineering/config.local.yaml`.

One optional setting, separate from the active repository defaults:

```yaml
# Optional personal override, not active repository configuration.
cross_model_review_mode: off
```

Cross-model `off` removes the automatic provider peer, while retaining local
reviewers and the local adversarial fallback. `auto_babysit: false` disables the
open-ended post-PR watch; it does not disable `lfg`'s bounded CI repair loop.
Teaching settings reduce PR explanation/archival work. None caps all review rounds
or tokens. Start with scoped work and measure before changing model/effort.

CE review artifacts under `/tmp/compound-engineering-<uid>/ce-code-review/`
include `metadata.json` and `stages.jsonl`: compare selected depth, reviewer count,
stage duration and peer activity. Token totals exist only when supplied by the
host; missing counts are not zero. A long stage is not by itself a token measure.

Keep always-loaded guidance short, inspect bounded source ranges, and retain
decisions at their existing source. Capture non-obvious reusable lessons in
`docs/solutions/` when they are not already explained by code, tests or contracts.
Plans use `docs/plans/`; CE's default artifact root is already appropriate here.

Sources: [CE review modes](https://github.com/EveryInc/compound-engineering-plugin/blob/main/skills/ce-code-review/references/modes-and-output.md),
[CE configuration](https://github.com/EveryInc/compound-engineering-plugin/blob/main/docs/guides/configuration.md),
and [OpenAI guidance on skills and prompts](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra).
