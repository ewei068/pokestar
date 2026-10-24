# Return ordered combat events with battle state

Each accepted battle action will produce an ordered sequence of combat events and an authoritative battle view at a new revision. A rejected action will return the current revision and view so a stale client can refresh. The same update contract will serve Discord and web, whether clients receive updates through polling or a later push transport. This preserves the sequence needed for animation and clear action summaries; a final snapshot alone cannot express multi-hit attacks, reactions, or turn-end effects.
