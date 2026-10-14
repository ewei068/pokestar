# Composed VFX review evidence

The complete 54-cell matrix remains development-only. `web/vfx-review.html`
provides synchronized playback, a scrubber, phone/desktop sizing, occupied/empty
backgrounds, alternate seeds, and Fighting/Poison references.

## Completed pass and recovered feedback

- Replaced the remaining 45 whole-atlas compositions with separate moving
  ingredients, material changes, authored frames, and particles.
- Recovered all 54 browser review records, including 33 written notes, into
  `../review-2026-10-12-composed.json` before changing gallery storage.
- Applied 28 feedback revisions. Preserved the five highlighted favorites.
- Generated four individual components (impact crescent, flame body, splash,
  dragon head); see `media/vfx/components/README.md` for briefs and provenance.
- Centered sprites in responsive cards and anchored review effects to sprites.
- Rewrote the VFX guide around the process and the user's favorite examples.

## Verification

- Web TypeScript and production build passed. Development VFX are excluded
  from the production bundle (191.41 kB JS / 60.17 kB gzip in this pass).
- All 24 web tests passed using explicit file enumeration through `tsx --test`.
  The existing npm test glob is unsupported on the current Node 18 runner.
- Sampled all 54 effects every 20 ms at radii 24 and 44: 4,212 frames;
  deterministic repeat drawing and clean negative/start/end/post-end frames.
  The unchanged Fighting Physical and Status references do not vary by seed;
  the other 52 cells do at the sampled comparison point.
- Inspected complete sampled sequences for all 54 effects at desktop and phone
  scale. `{type}.png` contains 16 frames per category, from 0 through 760 ms.
  `phone-{type}.png` uses an actual 85×85 responsive Gengar card, radius 24.65,
  and the sprite's measured anchor. These are sampled sequences, not recordings.
- Dense-card layout checked at 320, 390, 900, and 1280 px. No card/page overflow;
  sprites remained horizontally centered with status/type/effect cues present.
- Eight full-board action runs (four renderer paths at 390/1280 px) included
  five occupied and three empty affected tiles. No browser exceptions or page
  overflow. Representative captures are `board-{width}-{type}.png`.
- Gallery notes persisted through reload; JSON export contained all 54 records.
  Reduced-motion comparison starts paused at 325 ms. Copyable JSON is available
  when an embedded browser cannot download the file.

Aesthetic approval belongs to the user. These checks do not promote the matrix
into live battle playback. Server-driven integration, reconnect/skip behavior,
SFX, and resulting damage/status animations remain separate work.

## Follow-up review, 2026-10-13

Saved the user's next full review in `../review-2026-10-13-composed.json`.
Ten cells changed: Normal Physical, Flying Physical/Status, Rock Special,
Fire Special/Status, Grass Special, Dragon Special/Status, and Dark Physical.
The gallery v10 carries forward 44 approvals and resets only these ten cells;
all written notes remain available.

- Normal: three independently timed 60–90° cropped crescents over pressure rings.
- Flying: lower contact and feather emission; Rock: vertical bob before convergence.
- Fire: smaller translucent background body clipped at the ground, and denser
  sequential status flames using one unbranched sprite.
- Grass/Dragon Special: larger local contact fields, spray, and blue ground arcs.
- Dragon Status: simpler generated head; head and mouth emissions share a transform.
- Dark: narrow straight horizontal cuts with varied length, timing, and placement.
- Ghost Status retains the approved original sprite: the suggested external
  image contained a repeated watermark. The optional substitution is unfulfilled.

Re-captured and inspected the complete desktop/phone sequences for all ten
changed effects; re-ran the 4,212-frame deterministic/endpoint audit with no
new failures. Current type filmstrips show this follow-up; full-board captures
above document the first pass's layout and integration checks.

## Final approval and polish

`../review-2026-10-13-approved.json` preserves the final export verbatim. The
user explicitly approved every effect; this supersedes the stale unreviewed
Rock Special dropdown in the export. Gallery v11 carries all 54 approvals.

Final adjustments: shorter/smaller Normal impact arcs with seeded radial and
angular variation; Flying contact uses more feathers without rings; Fire body,
embers, and glow share a ground anchor; Grass pressure rings draw behind the
beam without changing size or position. Ghost Status now uses the user's clean
transparent PNG directly, retaining its wavy motion. The optional sprite
substitution noted above is now fulfilled.

## Normal Physical radial-motion revision

The user approved the rest of the matrix and requested another Normal Physical
motion pass. Three small arc ingredients now start near the target center,
translate outward rapidly while growing, and clear after a 220 ms lifetime.
Short radial traces reinforce the direction. Birth, angle, scale, and travel
vary deterministically by tile. The pressure circles are unchanged.

Gallery v12 preserves other approvals and reopens only Normal Physical.
Desktop and phone filmstrips were inspected through the full sequence; build,
deterministic drawing, and clean-endpoint checks passed. Visual approval of this
new motion is pending.

Follow-up tuning: reduced the starting arc size and radial travel, softened the
initial outward acceleration, and extended each arc from 220 to 290 ms with a
later fade. Re-inspected desktop/phone sequences; build and the focused Normal
rendering audit passed (234 sampled frames, deterministic output, clean ends).

A further timing-only adjustment extends the arc lifetime to 360 ms, slowing
travel and fade proportionally. Radius, growth, and pressure rings are unchanged.
Desktop/phone sequence inspection, build, and the focused rendering audit pass.
