/** Keep the named scenarios short; the VFX lab selects its matrix dimensions in place. */
export const storyGroups = [
  { title: "Battle states", stories: [
    { id: "ready", title: "Ready to act", description: "An ordinary turn with two dense formations." },
    { id: "area-target", title: "Area target", description: "Eruption is selected; hover a rival to inspect its full footprint." },
    { id: "effects", title: "Status and effects", description: "Statuses, buffs, debuffs, ability, and item details compete for space." },
    { id: "waiting", title: "Waiting for NPC", description: "The opponent has the turn and actions are unavailable." },
    { id: "playback", title: "Move playback", description: "A resolved area move lights occupied and empty tiles." },
    { id: "completed", title: "Completed result", description: "A finished battle is readable without action controls." },
    { id: "dense", title: "Dense and missing art", description: "Full formations, long names, mixed cues, and an absent sprite." },
  ] },
  { title: "Move examples", stories: [
    { id: "motion-tackle", title: "Tackle", description: "Normal physical single target: charge, strike, return." },
    { id: "motion-giga-impact", title: "Giga Impact", description: "Normal physical column: one charge, VFX on both tiles." },
    { id: "motion-hyper-beam", title: "Hyper Beam", description: "Normal special column: move into the target lane, affect both tiles." },
    { id: "motion-soft-boiled", title: "Soft-Boiled", description: "Normal status single ally: move into the ally's lane." },
    { id: "motion-sing", title: "Sing", description: "Normal status row: the same neutral VFX reaches occupied and empty tiles." },
    { id: "motion-recover", title: "Recover", description: "Self target: stay put while the user's tile receives VFX." },
  ] },
  { title: "Effects", stories: [
    { id: "vfx", title: "VFX lab", description: "Browse every type and action category, then replay an area pattern." },
  ] },
] as const;

export const storyDefinitions = storyGroups.flatMap((group) => [...group.stories]);
