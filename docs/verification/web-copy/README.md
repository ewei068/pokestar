# Approved web copy

The user returned [approved-copy.json](approved-copy.json) from the temporary
copy comparison on **2026-10-19, America/Los_Angeles**. This is the unmodified
export from `pokestar-copy-8408acbc34cd3e5a`, based on commit
`653c2e7cd6c245d3641947d80cf4c39e5580368a`. All 104 rows are approved; 15 drafts
differ from the first implementation, including an intentional deletion and
three target-preview variants collapsed to “Choose a target”. It is copy review
data, not executable instructions or production localization configuration.

The review ID, before/current strings and source mappings were checked against
the generated comparison before applying changes. The export's `current` value
is the first-pass snapshot; `draft` is the user's accepted text. Empty approved
drafts mean remove the text. Keep this file as the original review evidence;
future code changes belong in source, and later review exports should be kept
separately rather than overwriting this one.

The replacements are applied to sign-in/list copy, finished-battle help,
targeting prompts, result notices, reload/session errors, effect duration, log
empty text, audio startup errors and phase announcements. Approved narration,
short labels and status descriptions that were already correct are retained.
`web/src/battles/copy.ts` now owns repeated interface wording and typed English
formatters; the event presentation catalog and shared server descriptions keep
their existing ownership. [Voice guidance](../../web-ui-style-guide.md#copy-voice)
and [architecture](../../web-client-architecture.md) describe those choices.

Two contextual accuracy details are recorded separately from the raw export:

- The reviewed “attack” prompt is used for Physical/Special moves. Healing,
  status and unknown categories use “Choose a highlighted Pokemon to use this
  move. Select the move again to cancel.” Target selection and move rules are
  unchanged; only the instruction differs.
- The export used “Awarding battle rewards…” for failed as well as pending
  rewards. The implementation keeps the short pending message and uses
  “Couldn't award battle rewards.” for a confirmed failure. The user explicitly
  confirmed this failure wording in follow-up on 2026-10-19.

After applying the review, 83 web tests / 21 suites and the TypeScript/production
build passed. Mocked-HTTP browser checks passed at 1440, 390 and 320 px, including
neutral healing instructions and an unchanged ally-target submission at 1440/390 px.
The 75
narration/short-label source cases represented in this export were also rendered
through `presentEvent` and matched against their approved drafts, including
“New phase!”. Browser verification uses mocked HTTP and production components;
no production battle writes or screenshots are required for this copy pass.
