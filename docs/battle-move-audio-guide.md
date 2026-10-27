# Move audio timing in the web battler

Status: lessons from the representative study and completed 54-cell listening review, 2026-10-18. This is a timing guide for choosing and making future custom move cues, not a production cue specification.

## The shared visual clock

A `moveStarted` presentation lasts 1,500 ms: 420 ms of actor approach, 760 ms of tile effect, and 320 ms of return. `web/src/battles/vfx/timing.ts` owns these phase boundaries. The actor reaches its destination when the tile effect begins, and the next result waits until the move presentation completes. Self-targeted actions stay in place, but their tile effect still begins after the same 420 ms lead-in.

The useful alignment target is the **audible attack** against a **visible contact or peak**, not the beginning of either file or animation. A cue can have a soft build before its loudest moment; a visual can have a build before its first collision. For a falling or multi-hit effect, align the first meaningful hit and judge whether later hits follow the visible rhythm. One move cue plays for the whole action, even when several tiles are affected.

## What the representative study taught us

- Starting the move cue when `moveStarted` is reached makes it audible while the Pokémon is still traveling. Schedule it no earlier than the end of the 420 ms approach. This was the clearest mismatch the user noticed.
- The four effects have different focal moments within the 760 ms tile window. In the current recipes, Rock Physical's first rock lands about 234 ms into the effect; Normal Special's pressure burst starts about 350 ms in; Normal Physical's burst begins near its start; Normal Status's first pulse begins about 190 ms in. Use the relevant recipe to locate the contact for each of the 54 cells.
- A short energy-window scan can identify candidate attacks in a recording, but waveform loudness does not prove which sound a listener experiences as the impact. Candidate settings still need judgment in a complete battle replay at normal volume.
- The first full listening pass kept the shared 420 ms post-approach start for almost every cell but changed eight excerpt starts, including some to the beginning of the recording. Treat the excerpt as a per-cue choice made while watching the action; a waveform-derived offset is only a useful first guess. Keep an approved excerpt when revising other cells instead of recalculating the whole matrix.
- Keep the original source intact while tuning excerpt start and playback delay. Fade a cue that would outlast the move frame so its tail does not collide sharply with the following result. Avoid cutting a strong attack at the boundary; if the cue cannot fit, revise the sound instead of stretching the approved VFX.
- Schedule the decoded sound on the Web Audio clock, after a user interaction has enabled audio. Stop a scheduled or playing cue when playback is skipped, replaced, or hidden. Result audio and music have their own design questions and are outside this move guide.

The first study's provisional fits illustrate why each cue needs its own attack position: Rock Physical's first landing is near 654 ms after `moveStarted`; Normal Special's pressure burst near 770 ms; Normal Physical begins its contact burst near 445 ms; Normal Status's first pulse near 610 ms. These are **visual landmarks**, not reusable audio offsets. A custom sound's attack, sustain, and tail should be built or trimmed around its cell's choreography.

## Review and preserve each matrix cell

For each type × Physical/Special/Status cell, watch and listen to a complete action in the actual battle screen. Check (1) silence during approach, (2) attack/contact alignment, (3) whether the sustain and tail fit the effect and return, (4) one-cue readability for area moves, and (5) repeated-play comfort at desktop and phone volume. Record approval and any excerpt/delay adjustment. The final study review approved all 54 comparison cells after six replacements; its exact settings are preserved in the [review record](verification/move-audio-study/feedback-final.json).

The temporary review story has been retired. Its playback settings remain exploration data for designing custom cues. The approved VFX recipes and shared playback architecture remain authoritative.
