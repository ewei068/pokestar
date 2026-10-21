export const battleCopy = {
  listIntro: "Start a battle on Discord to continue it here.",
  chooseTarget: "Choose a target",
  battleEnded: "The battle has ended.",
  rewardsPending: "Awarding battle rewards…",
  rewardsFailed: "Couldn't award battle rewards.",
  battleOutdated: "Reload the page; battle is out-of-date.",
  sessionExpired: "Reload the page; your session has expired.",
  logEmpty: "No battle updates yet.",
  sfxStartFailed: "SFX could not start.",
  sfxPlaybackFailed: "Couldn't play a battle sound.",

  targetInstruction: (damageType?: string) =>
    damageType === "Physical" || damageType === "Special"
      ? "Choose a highlighted Pokemon to attack. Select the move again to cancel."
      : "Choose a highlighted Pokemon to use this move. Select the move again to cancel.",

  turnsLeft: (turns: number) => `${turns} ${turns === 1 ? "turn" : "turns"} left.`,
};
