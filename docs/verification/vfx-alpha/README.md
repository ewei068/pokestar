# Attack VFX alpha verification

Approved pre-refactor baseline:
`1514fedd93deb5119bc60a8981b550940c530f58`.
Configuration extraction commit: `af3e20d`.
The source art, rejected experiments, old review rounds, and feedback are
recoverable from those commits; temporary review galleries/captures were removed.

`approval.json` preserves the final exported review. The user explicitly
approved all effects despite the stale Rock Special dropdown, and subsequently
approved the final Normal Physical radial-motion/timing refinements.

- `config-pixel-comparison.json`: 64,800 frame comparisons across all 54 effects,
  six size/seed/background/DPR scenarios, every 4 ms plus fractional/endpoints;
  zero RGBA differences from the approved baseline.
- `config-playback-checks.json`: existing study paths and a negative control
  confirming that a lifetime change is detected; no page errors.
- `integrated-pixel-comparison.json`: equality checks after moving the renderer
  into production and removing alternate studies (same 64,800 samples, zero
  differences).
- `live-playback-checks.json`: eight phone/desktop scenes; delayed-artwork
  readiness, player and NPC actions through mocked HTTP, empty targets,
  self-targeting, reduced motion, cleanup, and reconnect without replay.
- `integrated-battle.png`: the production battle renderer in the Fire Special
  development story at desktop size.

`npm --prefix web run build` and `npm --prefix web test` passed (23 tests).
The test launcher expands file paths explicitly so Node 18 can run the same
suite. Static-markup tests emit React's expected `useLayoutEffect` warning;
the deployed client is rendered in the browser, without server hydration.

The retained lab uses production battle presentation. Its input is fixture data;
no Discord login, database writes or actual battle actions are needed. Browser
integration checks cover real client event-queue playback with mocked HTTP, as
well as occupied/empty tiles, self-targeting, reduced motion, and cancellation.
This does not claim an authenticated production-server turn was executed.

Current alpha assets total roughly 2.9 MB of PNGs, loaded once when battle
presentation prepares its VFX. The renderer is a separate lazy JS chunk.
Per-effect loading and lossless asset optimization are follow-ups for slower
connections. New resulting effects (damage numbers, faint/status animation)
and SFX are outside this alpha. Result effects have since been implemented; see
[their current contract](../../battle-result-playback.md). The measurements and
checks above describe this historical attack-alpha milestone, not a current
whole-project test count.
