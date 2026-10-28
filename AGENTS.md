# Pokestar

Pokestar has a Discord bot and a static React/TypeScript web battler. The Node
backend uses discord.js, MongoDB and JavaScript typed with JSDoc/checkJs.
The backend owns identity, battle rules and durable state; both surfaces use
the shared battle service.

## Read for the task

- Web-battler planning, implementation, debugging or review: read
  [docs/efforts/web-battler.md](docs/efforts/web-battler.md) first. It indexes
  accepted decisions, contracts, verification and remaining work. Update it at
  meaningful milestones, keeping observed results separate from proposals.
- Browser UI: also read [web/AGENTS.md](web/AGENTS.md) for visual, copy and
  presentation ownership rules.
- Backend structure: [src/README.md](src/README.md). Engine/data changes:
  [src/battle/README.md](src/battle/README.md).
- Local setup and production operations: [runbook.md](runbook.md) and
  [web/README.md](web/README.md). Use environment templates to discover settings.

## Verification

- `npm test`: backend Jest suites with mocked database access; a pass does not
  establish real MongoDB, OAuth, Discord or restart acceptance. Use
  `npm test -- <path>` for a focused check; run the full backend suite after
  engine or shared-service changes.
- `npm run typecheck`: backend checkJs, excluding `web/`. Preserve the existing
  diagnostic baseline and check for new errors, including errors at callers.
  Report remaining failures rather than describing filtered output as a pass.
- `npm run lint -- <files>`: backend ESLint on the files changed.
- `npm test --prefix web`: client tests.
- `npm run build --prefix web`: client TypeScript and production bundle checks.
  Run client tests/build after browser changes or shared browser/API contracts.
- Match verification to the change. For docs and skill moves, check references,
  examples and discovery; runtime tests are needed when runtime behavior changes.

## Boundaries and conventions

- Deact (`src/deact/`, `src/elements/`, `src/hooks/`, `src/modals/`) builds
  Discord UI. React in `web/` builds browser UI. `src/components/` is legacy.
- New moves, abilities, effects and held items belong in `src/battle/data/`.
  `src/config/battleConfig.js` retains legacy definitions. Edit configuration
  and enums when the task requires it.
- Preserve server authority, participant projections, revision checks and
  ordered events when changing battle flows. Follow the linked contracts for
  completion and Auto; rendering a result must not issue rewards again.
- New backend functions have precise JSDoc types; reuse shared typedefs.
- Keep existing import/export ordering and keep changes scoped to the task.
- Root `README.md` and `changelog.md` are player-facing. `design.md` records
  historical design, not the current implementation.

## Skills and work tracking

Repository skills live in `.agents/skills/`; `.cursor/skills` is a compatibility
link to the same files. Read the matching skill for battle data, Jest helpers,
Deact, commands, Pokémon configuration or Discord verification.

Compound Engineering is the default general workflow when installed. Personal
grilling, codebase-design, improve-codebase-architecture and Wayfinder remain
optional tools; [workflow guidance](docs/agents/workflow.md) defines their scope.
Missing plugins do not prevent following the repository's contracts directly.

project_tracker: github

Use GitHub Issues on `ewei068/pokestar`. Read
[issue conventions](docs/agents/issue-tracker.md) when creating, triaging or
working a ticket, and [domain guidance](docs/agents/domain.md) when naming
concepts or reconsidering recorded architecture decisions.
