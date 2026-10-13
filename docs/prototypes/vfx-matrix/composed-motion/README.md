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
