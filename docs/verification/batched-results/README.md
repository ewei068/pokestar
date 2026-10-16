# Batched results and virtual log verification

- `npm --prefix web test`: 39 tests passed. Covers compatible batches, barriers,
  repeated hits, mixed gain/loss, matching effect/status identity, individual log
  ordering, deduplication without an entry cap, and existing playback/control
  contracts. Component tests stub DOM-only observer/scroll methods; actual
  virtualization and animation geometry were checked in Chromium.
- `npm --prefix web run build`: passed. Virtua emits upstream PURE-comment
  annotation warnings that Rollup strips; no build errors. The total main JS
  chunk is approximately 66.6 KB gzip, including this feature and the virtualizer.
- `browser.json`: six batch stories at desktop and phone widths (12 loops).
  Confirms simultaneous per-target announcements, three concurrent reactions,
  serial faint barriers, fade progress, final hidden sprites, no horizontal
  overflow, reduced motion and cleanup. No page errors.
- The 20,000-entry, variable-height log mounted 16 rows in the measured desktop
  viewport. Its oldest entry was reachable. Appending results while reading did
  not move the log; Latest resumed following. Following survived additional
  appends and a narrow resize. History reached 20,007 entries without truncation.
- `http.json`: real client session with mocked HTTP, separate canonical player
  and NPC revisions, artwork readiness, narration timing, reconnect, motion
  preference changes and visibility cleanup. No authenticated live-server turn
  was executed. Server code and response/storage contracts are unchanged.

Adjacent board/log captures are implementation evidence for review, not user
approval. Review full animations in `result-batch-damage`, `result-batch-heal`,
`result-sequence` and `result-batch-faint`; inspect `result-long-log` and use
Simulate another result to exercise scrolling with arriving events.

The client history is uncapped within a session; memory grows with entries.
Virtualization bounds DOM work. Durable/reconnect history remains separate.
