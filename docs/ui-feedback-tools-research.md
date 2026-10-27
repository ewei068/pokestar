# UI feedback capture and agent handoff: research

Researched **2026-10-20, America/Los_Angeles**. Proposed workflow, not an
accepted project decision. Read [web-battler](efforts/web-battler.md) for current
implementation and acceptance boundaries. This note compares documented
capabilities; no recorder, integration, export, transcription or accuracy was
tested. Prices and plan restrictions should be rechecked before subscribing.

Follow-up **2026-10-22**: the user chose native browser annotations and used
them for the accepted [desktop](verification/widescreen-polish/README.md) and
[mobile](verification/mobile-polish/README.md) UI batches. Recording extraction
and the proposed external-tool pilots remain untested proposals.

## Recommendation for this project

Use different evidence for different feedback. For spacing, wording and element
placement, point at an element and attach a short comment. For transitions,
targeting, battle playback, VFX or sound, preserve an actual short recording.
Pokestar has a DOM arena with canvas effects, so DOM-only feedback cannot
represent everything that needs review. Reproducible preview stories make
excellent anchors, supplemented by real phone captures for phone behavior.

A tool is useful when it reduces the reporter's effort **and** gives the agent
selective access to evidence. The important boundary is a compact issue ledger
plus retrievable originals, rather than putting a whole recording and every log
into every implementation prompt. Start with existing native annotations and
local recordings. If repeated narrated sessions make extraction burdensome,
pilot Jam for managed capture or Riffrec for local, instrumented bundles.

## Native Codex options before adding a recorder

The built-in browser supports **Annotate**: select an element or area, save a
comment, then send the comments to the agent. **Adjust** can preview changes
to text, spacing, color and fonts. Default browser annotations need no app code
changes. This is the first option to try for static polish on a local preview.
[Browser feedback](https://learn.chatgpt.com/docs/browser),
[annotations API](https://learn.chatgpt.com/docs/annotations-extensibility).

Voice in an existing Codex chat can discuss the task and, on macOS with Screen
context enabled, request an appshot of the frontmost window. It includes an
image and available accessibility text. Availability depends on rollout and
workspace settings. This supports a live walkthrough with explicit pauses to
look at each issue; it is not a continuous video recording. Dictation instead
just converts speech into prompt text.
[Official voice documentation](https://learn.chatgpt.com/docs/features/voice).

Manual screenshot attachments remain a portable fallback, including local
images and the CLI's `--image` input. Give each screenshot a clear target and
desired result. An image alone cannot convey intent.
[Image inputs](https://learn.chatgpt.com/docs/image-inputs).

## Representative options

| Approach | Reporter and agent handoff | Fit and material limits |
| --- | --- | --- |
| Plain screen recording + timestamped transcript | Record and narrate naturally; extraction produces issues, a few frames and relevant clips. | Lowest integration commitment; works across apps/devices with a capable recorder. Source/element association needs inference or explicit pointing. Verify both narration and game audio were captured. |
| Jam | Explicit video recording, then authenticated MCP retrieval of timed transcript, chapters, chosen frames, events and diagnostics. | Most directly documented managed implementation of selective retrieval. Requires cloud account/data sharing; capture types differ. |
| Riffrec | Add React recorder; share a local ZIP containing media and timestamped app events. | Strong fit for local React development and retained evidence; requires integration and preprocessing. Live streaming is substantially more setup. |
| Agentation | Click/annotate elements; copy structured Markdown or connect local MCP. | Good static polish queue with element context. Desktop React 18+; documented output is text-only, with no screenshots. |
| React Grab | Hover/select and copy source context into a prompt. | Very small handoff for a known component tweak; supports Vite development. Does not replace narrated capture or an issue queue. |
| Loom | Familiar narrated video with timestamped transcript; share or export. | Good if already used. Local media/caption export has paid-plan and role restrictions; verify before making it the evidence store. |
| BrowserStack Bug Capture | Extension or embedded widget records bugs plus technical context; downloadable video and shared report. | Useful managed QA alternative. Mobile widget and some SDK support require Enterprise; no direct Bug Capture report-reading MCP was verified here. |
| Marker.io | Annotated screenshot reports, diagnostics and replay; MCP reads reports. | Better for distributed screenshot/UAT feedback. Its documented replay misses canvas/WebGL and has localhost asset limitations. |

## Verified distinctions and sources

### Jam: selective evidence retrieval already exists

Current MCP documentation lists `getVideoTranscript` returning timestamped
WebVTT, `getVideoChapters`, and `getFrames` for exact moments, a time window or a
labeled overview grid. This supports transcript-first extraction followed by
targeted images. `getFrames` currently requires recordings hosted on Cloudflare
Stream; check compatibility on a real sample. **Instant Replay Jams do not support those video-only tools or
`getScreenshots`**: choose an explicit microphone-enabled video for narration.
The cloud MCP requires authentication. The plugin README additionally lists
`analyzeVideo`, absent from the current MCP tools table; inspect the connected
tool schema rather than depending on that name.
`getFrames` additionally requires video hosted on Cloudflare Stream; a newly
captured or otherwise hosted video may not return frames through that tool.
[MCP documentation](https://jam.dev/docs/jam-mcp),
[official plugin](https://github.com/jamdotdev/jam-plugin).

Jam's product page lists browser extension, recording links and iOS capture;
diagnostics depend on capture surface and instrumentation. Do not assume a
phone recording has desktop browser logs. Localhost, specific device behavior,
system-audio capture and free-tier limits were not verified.
[Capture surfaces](https://jam.dev/?v=1.0.24),
[developer context](https://jam.dev/resolve).

### Riffrec: open, local bundle; richer optional live mode

The public React package exports ZIPs containing `session.json`, `events.json`,
screen video and optional separate microphone audio. Events carry element
context and timestamps. README limitations matter: Safari screen support is
partial; screen videos above 50 MB are excluded from ZIPs; production component
names need explicit attributes. Check `files_present` before treating a bundle
as complete.

Optional Live Mode adds transcript, feedback units, annotations, frames and
utterance clips, using click/draw/pin anchors to associate speech with the UI.
It needs an endpoint and OpenAI Realtime secret minting; it is not simply a
local recorder switch. The standalone macOS browser is explicitly highly
experimental, unnotarized and isolated from existing browser profiles. Prefer
the React integration for a pilot, starting with ZIP export.
[Official README and contracts](https://github.com/kieranklaassen/riffrec).

The installed `ce-riffrec-feedback-analysis` skill accepts these ZIPs as well
as ordinary videos/audio/notes, so a custom capture SDK is not a prerequisite
for analyzing feedback. Its documentation alone does not establish that the
local analyzer's transcription and visual extraction dependencies are usable.

Source inspection of the installed analyzer on the research date found that
it defaults to `gpt-4o-mini-transcribe` with plain JSON text, and selects frames
using clicks, errors, complaint keywords and duration heuristics. It does not
establish semantic speech-to-frame alignment. Treat its candidate findings as
an extraction scaffold requiring inspection. No `ffmpeg`, `whisper-cli`,
`whisper` or `whisperx` executable was on the current shell's PATH; processing
was not exercised. This describes this installed snapshot, not all Riffrec
versions. Source: the plugin's
`ce-riffrec-feedback-analysis/scripts/analyze_riffrec_zip.py`, inspected at
`transcribe_media` and `select_moments`.

### Agentation and React Grab: avoid visual inference for static tweaks

Agentation supports element/text/area annotations, structured Markdown and
local MCP synchronization; its API supports submit callbacks, webhooks and
source actions. It documents desktop-only, client-side React 18+, seven-day
per-page local storage and text-only output. Its animation pause freezes most
animations, with exceptions. Source/element metadata makes code search easier;
it does not establish that the right source will always be identified.
[Features](https://www.agentation.com/features),
[installation and Codex support](https://www.agentation.com/install),
[API](https://www.agentation.com/api).

React Grab copies the selected element and component stack with source
locations. Its README includes a Vite development-only import, matching this
project's stack. It is a lightweight pointing aid; no voice capture, timed
video association or feedback lifecycle was established by the README.
[Official repository](https://github.com/aidenybai/react-grab).

### Loom: easy recording; export is the handoff constraint

Loom documents timestamped transcripts on all plans and whole-transcript copy.
SRT download requires eligible paid roles. MP4 download is unavailable on
Starter Free and Creator Lite roles; additional workspace restrictions can
apply. A share link is convenient for people but does not itself guarantee
agent access. Do not assume that a free Loom link can always be converted into
local evidence.
[Transcript and captions](https://support.atlassian.com/loom/docs/loom-video-transcription-and-closed-captions),
[video downloads](https://support.atlassian.com/loom/docs/download-your-loom-video).

### BrowserStack Bug Capture: recorder versus replay versus MCP

Documentation distinguishes a Chromium extension from an embedded Web SDK.
The widget can operate in mobile web pages; native mobile apps are unsupported.
The FAQ documents microphone/camera recording, downloadable WebM/MP4, and
Enterprise SDK restrictions. Downloaded video does not carry the report's
technical logs; share the report URL for those. Its replay reconstructs DOM,
so do not treat that as equivalent to actual video/audio evidence.
[Get started](https://www.browserstack.com/docs/bug-capture/get-started),
[FAQ](https://www.browserstack.com/docs/live/bug-capture/FAQ).

BrowserStack also offers an MCP server for testing infrastructure, but that
does not establish a Bug Capture report-consumption integration. No such
direct retrieval path was verified in this survey.
[MCP tools overview](https://www.browserstack.com/docs/browserstack-mcp-server/tools).

### Marker.io: screenshot reporting, with replay caveats

Marker.io's MCP reads submitted screenshot reports and diagnostics; its setup
guide explicitly covers Codex. Replay documentation says canvas/WebGL content
is not captured. Its localhost guide says replay can miss locally served
images, while extension/native capture can improve screenshots. That makes
replay alone a poor evidence source for Pokestar's animated battlefield.
[MCP](https://marker.io/marker-mcp),
[MCP setup](https://help.marker.io/en/articles/14121093-mcp-setup-guides),
[replay limitations](https://help.marker.io/en/articles/6673880-session-replay-videos),
[localhost](https://help.marker.io/en/articles/9615242-using-a-localhost-environment).

### Reproduction and verification are separate from feedback capture

Playwright traces preserve action-associated screenshots, DOM snapshots,
console/network context and source references. They help the agent reproduce
and verify behavioral fixes; they do not capture the author's preferences or
replace subjective listening. Trace Viewer can load local files entirely in
the browser.
[Official trace documentation](https://playwright.dev/python/docs/trace-viewer).

## How to associate speech with video accurately

The following is a proposed engineering workflow, not a measured benchmark.

1. **Capture one synchronized source.** Record screen and microphone together;
   retain game sound for audio feedback. Record in comfortable sections, such
   as a few minutes on targeting or phone layout. Keep the original untrimmed
   media. Capture URL/story, commit, viewport, device/browser and relevant
   settings once per section, updating them if they change.
2. **Transcribe with real timing metadata.** Keep segment start/end offsets in
   JSON, VTT or SRT. Segment timing is usually enough for layout comments;
   word timing helps with rapid pointing. Include a small glossary of game
   terms. Don't have a text-only summarizer invent timestamps.
3. **Extract all requested changes from the transcript first.** Preserve the
   original quote, time interval, requested result and uncertainty. Resolve
   later corrections, but retain the link to the original wording. Distinguish
   an observed bug, a preference, and a tentative idea. The agent can do this
   bookkeeping; the user should not have to author tickets while recording.
4. **Retrieve visual evidence around each interval.** Inspect a small number
   of frames before, during and after the comment. The relevant interaction
   often precedes the spoken complaint. Extend backward when the first window
   does not explain the feedback. Use click/pin events and element metadata
   when present, rather than guessing solely from the narration.
5. **Escalate temporal issues.** For a brief highlight, motion sequence, sound
   cue or interruption, inspect a short clip at suitable temporal resolution
   and preserve its audio. Static screenshots and low-rate sampling do not
   prove event ordering or perceptual timing. Retain a full-context frame
   alongside a detail crop; avoid reducing small UI text to an unreadable grid.
6. **Build a compact issue ledger.** Each implementation batch gets its issue
   rows and evidence references. Load frames, clips and filtered diagnostics
   only when needed. Original media stays available outside the working prompt.

Use one time origin across transcript, video and browser events. If audio is
split or silence removed, preserve a mapping back to source timestamps. A
paused screen recorder and a separately running voice recorder can drift out
of association even when the transcript itself is accurate. Preserve uncertain
associations explicitly; ask a targeted question only when inspecting the
nearby evidence cannot settle a material ambiguity.

For a plain recording, local **whisper.cpp** supports Apple Silicon and subtitle
output; **faster-whisper** exposes segment and optional word timestamps.
**WhisperX** adds phoneme-based forced alignment when closer word timing is
needed, with limitations for unalignable tokens and overlapping speech. Timing
metadata is evidence of when words were spoken, not proof of which element
they referred to. Pilot on this user's narration before choosing a model.
[whisper.cpp](https://github.com/ggml-org/whisper.cpp),
[CLI outputs](https://github.com/ggml-org/whisper.cpp/blob/master/examples/cli/README.md),
[faster-whisper](https://github.com/SYSTRAN/faster-whisper),
[WhisperX](https://github.com/m-bain/whisperX).

For a hosted OpenAI transcription path, current documentation recommends
`gpt-transcribe`. Native word/segment timestamp and subtitle examples still use
`whisper-1`, which is deprecated with shutdown scheduled for February 26, 2027.
Do not assume substituting a newer model preserves timestamp output. A new
pipeline should explicitly verify timing support or use a separate alignment
step. Single-speaker feedback does not require speaker diarization.
[File transcription](https://developers.openai.com/api/docs/guides/speech-to-text),
[deprecations](https://developers.openai.com/api/docs/deprecations).

## Direct video-model preprocessing is another viable path

Gemini documents joint video/audio input, timestamped questions, clipping and
custom sampling. Its default static processing samples at 1 FPS, which can miss
brief actions. Supported models also offer opt-in agentic processing that
selectively retrieves transcript, frames and audio. Google's reported token
savings are vendor claims, not a Pokestar benchmark.
[Video understanding](https://ai.google.dev/gemini-api/docs/video-understanding).

This can provide a convenient first extraction pass: give a video-capable model
the recording, request issue IDs with quotes and time intervals, then hand
Codex that manifest plus retrievable original evidence. It introduces another
service and possible interpretation loss. Verify selected intervals against
the original, especially for exact text, sounds and fast VFX. Do not assume an
MP4 attachment or a video-generation API establishes native video understanding
in the coding agent's current chat.

## Token efficiency without losing evidence

Optimize **total capture, extraction, clarification and implementation effort**.
Compression and smaller video files do not by themselves establish lower model
token use. Different models tokenize media differently. Keep ingestion costs
and the coding agent's context budget separate; external transcription/video
services can have their own billing.

As an illustrative retrieval count, ten minutes at one frame per second is
600 images. Twelve issues with two initial frames each is 24 images: 25 times
fewer initial images, not a demonstrated 25-fold token or dollar saving. Some
issues need additional frames or clips. Never make the count a ceiling that
forces the agent to guess. Transcript-first selection also needs a brief
visual overview when the narration is vague or a visible issue is unspoken.

A compact issue might look like this; this is a fictional example, not an
observed Pokestar defect:

```text
UX-014 | source walk-01 | 02:14–02:28 | phone / targeting story
Quote: "The tray covers the bottom row; keep those tiles visible."
Observed: tray overlaps the arena in the selected frame.
Requested: targets remain visible and tappable while choosing a move.
Evidence: source interval, context frame, detail crop, short interaction clip.
Interpretation: clear target; exact layout solution left to implementation.
Status: captured -> interpreted -> implemented -> verified -> user accepted
```

Keep original quotes and evidence references beside summaries. Consolidate
duplicates without discarding different device/state evidence. Process small
groups by screen or interaction, and verify before/after at the same story and
viewport. Code completion and passing tests do not establish subjective approval.

## Practical first recording for Pokestar

Use the existing `?previewBattle=1` routes for repeatable static and playback
feedback; `?previewBattle=1&story=playback` has a Replay control. See
[web development](../web/README.md) and
[architecture](web-client-architecture.md). Capture real battle/phone behavior
when the concern involves authentication, touch, autoplay, app switching or
audio recovery; stories do not establish those behaviors.

For no new app integration, macOS Screenshot/QuickTime can capture the screen,
microphone and visible mouse-click indicators. System audio availability
depends on macOS version, so check a short sample before reviewing music/SFX.
[Apple capture guide](https://support.apple.com/en-us/102618).
If separating narration from game audio is worthwhile, OBS supports assigning
sources to separate audio tracks; also keep a mixed track for ordinary playback.
[OBS audio tracks](https://obsproject.com/kb/multiple-audio-track-recording-guide).

While recording, name the control when convenient, point and pause briefly,
describe the problem and desired result, and say when something is tentative.
Use "next issue" or an optional hotkey marker to help segmentation. These are
small aids, not a requirement to produce a polished presentation or manually
timestamp every comment. For sound feedback, leave a brief interval without
speech so the cue can be heard.

For repeated wording reviews, a side-by-side editable table may be more
efficient than video; this repo's approved copy review is an existing example.
For a visual choice with several plausible solutions, let the agent produce
two small variants on the same story and choose between them. For a behavior
failure, use the recording to derive a repeatable scenario, then verify the
fix through browser interaction; add a meaningful automated test when warranted.

## Proposed pilot and quality bar

**Required now:** usable media, preserved time origins, an identifiable UI
target, the requested outcome and evidence appropriate to the issue. Check
these on a representative sample before a long recording.
**Preserve flexibility:** retain originals and a tool-independent Markdown/JSON
ledger so capture/transcription providers can change without recapturing work.
**Deferred:** a custom live interviewer, streaming endpoint and general feedback
dashboard; reconsider only if repeated batches demonstrate a real extraction
or clarification bottleneck.

Compare one static tweak and one temporal/audio tweak using the simplest
workflow. Add a specialist recorder only if that trial exposes a recurring
bottleneck. Evaluate total human clarification and evidence-processing time,
not advertised AI accuracy or token counts alone.

For each feedback item preserve:

- ID, source recording and original time interval; URL/story and viewport.
- The user's actual requested outcome, separately from observed symptoms and
  agent interpretation. Preserve uncertainty and later corrections.
- A pointed element or one full-context frame; add a detail crop if needed.
- A short clip for timing/audio, keeping originals available for reinspection.
- Build/commit and relevant settings so the agent can recreate the state.
- Status, implementation reference and verification evidence, with subjective
  user acceptance recorded separately from automated checks.

Avoid these failure modes: forced one-issue clips that make reporting tiring;
speech timestamps joined to a video that was independently paused/trimmed;
faint game audio obscured by narration; confusing a tentative opinion with a
firm requirement; sampling away a brief animation event; mistaking current
DOM/source for the older recorded build; and resolving a ledger item merely
because code changed. Keep noisy raw logs out of initial context and retrieve
the relevant interval when a behavioral failure calls for them.
