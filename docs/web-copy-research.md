# Web copy research

Research date: **2026-10-19, America/Los_Angeles**.

Status: **research and proposed workflow**, not accepted Pokestar copy policy.
The [effort overview](efforts/web-battler.md) remains the entry point for project
status. These sources are product/documentation writing guides, not studies
proving that a particular phrase is AI-written or that a game must adopt a
corporate voice.

## What the primary sources recommend

| Source | Relevant guidance | Proposed application to Pokestar |
| --- | --- | --- |
| [Mailchimp: Voice and tone](https://styleguide.mailchimp.com/voice-and-tone/) | Keep a consistent voice while adjusting tone to the reader's situation. Clarity matters more than entertainment; avoid forced jokes, slang, and jargon. | Learn the author's normal voice from existing server copy. Allow different tones for battle flavor, routine controls, and errors. Do not make every button or failure message playful. |
| [Microsoft: Simple and human](https://learn.microsoft.com/en-us/style-guide/brand-voice-above-all-simple-human) | Put the key information and next step first. Use familiar words, common contractions, sentence case, and concise text that scans easily. | Replace explanations of the software's machinery with what the player needs to know or do. Retain any condition needed to make a correct decision. |
| [Google: Voice and tone](https://developers.google.com/style/tone) | Aim for conversational, friendly, respectful writing without becoming overly colloquial or frivolous. Read awkward passages aloud; ask another person to review. Useful information comes first. | Compare each draft against the author's examples and read it aloud. Do not add slang, random jokes, filler, or elaborate metaphors merely to seem human. |
| [GOV.UK Design System: Error message](https://design-system.service.gov.uk/components/error-message/) | Explain the specific problem and how to fix it. Reuse the relevant label's language. Avoid generic errors, blame, and humorous failure language. Distinguish input errors from service problems. | State whether a move is stale, a battle is unavailable, or a request failed, only when the app actually knows which. Offer a recovery action supported by the implementation. |
| [W3C: Understanding Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html) | For controls with visible text labels, the accessible name must contain that label text. Matching labels supports speech input and text-to-speech use. | Review visible copy and accessible names together. A renamed button must not keep an unrelated old `aria-label`. |

These guides converge on an editorial goal: recognizable voice, clear meaning,
and useful actions. The recommendation is to evaluate those outcomes directly.
This research does not establish a list of words that proves AI authorship or
validate any AI detector or commercial “humanizer.”

The [source comparison](web-copy-audit.md) applies these findings to the current
repository and records the implemented copy pass. The user selected matching the server
voice and the Pokémon games' phrasing for battle flavor; that accepted direction lives in the [UI style guide](web-ui-style-guide.md#copy-voice).
The external guidance and workflow below remain research and proposals.

## Proposed comparison and revision workflow

1. **Build a small reference set.** Locate representative server messages,
   help text, controls, errors, and battle narration believed to be handwritten.
   Record paths and examples. Repository history can help establish provenance,
   but authorship alone does not prove a line reflects the user's current taste.
   Treat any uncertain attribution as uncertain.
2. **Compare equivalent jobs.** Pair server instructions with web instructions,
   errors with errors, and battle flavor with battle flavor. Discord command
   syntax and chat formatting are surface constraints, not automatically voice
   traits to reproduce on the web.
3. **Extract evidence rather than invent adjectives.** Note sentence length,
   directness, contractions, punctuation, terminology, and where humor appears.
   Attach an actual reference example to each proposed rule. Preserve established
   game terms even when a generic writing guide would prefer a simpler word.
4. **Make a calibration batch.** Present roughly 8–12 old/new pairs across the
   main copy types with a short reason for each change. The user's preference
   determines which traits become durable guidance. Avoid changing all strings
   before that calibration.
5. **Apply the chosen direction in small groups.** Keep gameplay facts, costs,
   quantities, eligibility, timing, and recovery promises intact. Review full
   rendered states, including empty, loading, stale, unavailable, and finished
   views. Check phone wrapping and accessible names when affected.
6. **Keep reusable evidence.** Store accepted voice guidance and a few examples
   in the existing UI guide or a focused guide linked from it. Keep research,
   tentative rules, and accepted decisions visibly distinct. A large string
   framework or a new skill is unnecessary for the first pass.

This workflow is a proposed synthesis of the sources, not a method prescribed
or validated by them. A successful first batch should sound like the author's
chosen examples while remaining accurate in its actual UI state; fewer words
alone is not a sufficient check.

## Skills that fit this phase

- **`plan-work`**: establish scope, evidence, and consequential unknowns before
  a substantial revision; required by this repository's working instructions.
- **`research`**: gather first-party advice and retain sourced findings, as in
  this note.
- **`compound-engineering:ce-noslop`**: the closest existing editorial skill for
  identifying generic AI phrasing and rewriting while retaining source facts.
  Use the user's server examples as the stylistic authority; a generic checklist
  cannot supply the Pokestar voice by itself.
- **`compound-engineering:ce-brainstorm`**: useful if the user wants to choose
  between a restrained utility voice and more characterful game flavor before
  authorizing the full copy pass.

Required now: representative examples, factual accuracy, useful recovery text,
and accessible labels. Preserve flexibility for separate narration and interface
tone. Defer a dedicated voice-matching skill until accepted examples and recurring
work show it would save effort; revisit after the first approved revision batch.
