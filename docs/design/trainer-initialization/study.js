// Isolated design fixtures. No API, session, reward or persistence calls.
const fixtures = {
  returning: { name: "Leaf", level: 18, money: 12480, exp: 560, next: 1800,
    note: "Returning trainer: confirmed money in the header; exact EXP in the account panel. Existing Play content stays as it is." },
  new: { name: "Leaf", level: 1, money: 1000, exp: 0, next: 100,
    note: "New trainer: configured level 1, 0 EXP and 1,000 money. No starter Pokémon, tutorial prerequisite or sign-in reward. The empty-battle view points to existing Discord commands." },
  loading: { name: "Trainer", pending: true,
    note: "A valid session is loading or initializing its trainer. No unconfirmed resource values or fake zeroes; the account panel still offers sign out." },
  error: { name: "Trainer", error: true,
    note: "The session is valid but trainer resolution failed or timed out. Try again retries trainer resolution; it does not require another Discord login or claim setup failed to persist." },
  fallback: { name: "Trainer", level: 1, money: 1000, exp: 0, next: 100,
    note: "An older valid session has only a trusted ID. Neutral name and initial keep the view usable; a later OAuth login can refresh the optional profile." },
  long: { name: "AlexandriaTheEverlastingChampion", level: 42, money: 987654321, exp: 3210, next: 4200,
    note: "Stress case: a 32-character username and large balance. Header truncates the name; the account panel wraps the complete name without hover." },
  max: { name: "Leaf", level: 100, money: 12480,
    note: "Maximum trainer level: show Max level instead of inventing another threshold or an EXP reward claim." },
};
const iconPaths = {
  play: '<path d="m5 3 14 14-2 2L3 5V3h2Zm14 0L5 17m-2-3 7 7m4-18 7 7"/><path d="m4 20 2-2m12 0 2 2"/>',
  pokemon: '<circle cx="12" cy="12" r="8"/><path d="M4 12h5m6 0h5"/><circle cx="12" cy="12" r="3"/>',
  catch: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/><circle cx="12" cy="12" r="5"/><path d="M7 12h10"/>',
  rewards: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  Bag: '<path d="M5 8h14l1 13H4L5 8Zm3 0V6a4 4 0 0 1 8 0v2"/><path d="M8 13h8v5H8z"/>',
  Settings: '<path d="m9 3-1 3-3 1-2 3 2 2-1 3 2 3 3-1 2 3h3l1-3 3-1 2-3-2-2 1-3-2-3-3 1-2-3H9Z"/><circle cx="11.5" cy="11.5" r="3"/>',
  money: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 10v4m12-4v4"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;
const money = value => value.toLocaleString("en-US");
const scenario = document.querySelector("#scenario");
const account = document.querySelector("#account-menu");
const showAccount = document.querySelector("#show-account");
const dialog = document.querySelector("#study-dialog");
const query = new URLSearchParams(location.search);
document.body.classList.toggle("review-hidden", query.get("review") === "hidden");
new ResizeObserver(entries => {
  document.querySelector(".app").style.setProperty("--review-bar-height", `${entries[0].borderBoxSize[0].blockSize}px`);
}).observe(document.querySelector(".review-bar"));
scenario.value = Object.hasOwn(fixtures, query.get("state")) ? query.get("state") : "returning";
showAccount.checked = query.get("account") === "open";
account.open = showAccount.checked;

document.querySelector("#navigation").innerHTML = [
  ["play", "Play"], ["pokemon", "Pokémon"], ["catch", "Catch"], ["rewards", "Rewards"], ["more", "More"],
].map(([name, label]) => `<a href="#${name}" data-destination="${label}" ${name === "play" ? 'aria-current="page"' : ""}>${icon(name)}<span>${label}</span><span class="nav-arrow" aria-hidden="true">›</span></a>`).join("");
document.querySelectorAll(".site-controls > [data-destination]").forEach(button => {
  button.innerHTML = icon(button.dataset.destination);
});

const explain = (title, copy) => {
  document.querySelector("#dialog-title").textContent = title;
  document.querySelector("#dialog-copy").textContent = copy;
  dialog.showModal();
};
const signout = '<button class="signout" type="button" data-signout>Sign out</button>';
const retryButton = '<button class="primary-button" type="button" data-retry>Try again</button>';
const render = () => {
  const key = scenario.value;
  const trainer = fixtures[key];
  const unavailable = trainer.pending || trainer.error;
  document.querySelector("#scenario-note").textContent = trainer.note;
  document.querySelector("#account-summary").innerHTML = `<span class="account-mark" aria-hidden="true">${trainer.name[0]}</span><span class="account-identity"><span class="trainer-name">${trainer.name}</span><span class="trainer-level">${unavailable ? "Signed in" : `Lv. ${trainer.level}`}</span></span>`;
  const profileHeading = `<div class="profile-heading"><span class="account-mark" aria-hidden="true">${trainer.name[0]}</span><div><h2>${trainer.name}</h2><small>${unavailable ? "Signed in with Discord" : `Lv. ${trainer.level}`}</small></div></div>`;
  const id = '<p class="profile-id">Discord ID<span>123456789012345678</span></p>';
  if (unavailable) {
    document.querySelector("#trainer-resources").innerHTML = `<p class="resource-status">${trainer.pending ? "Loading trainer…" : "Trainer unavailable"}</p>`;
    document.querySelector("#account-panel").innerHTML = `${profileHeading}<div class="profile-details"><p class="panel-message">${trainer.pending ? "Getting your trainer ready…" : "Couldn't load your trainer."}</p>${trainer.error ? retryButton : ""}${id}${signout}</div>`;
    document.querySelector("#page").innerHTML = `<div class="list-intro"><h1>Play</h1></div><section class="site-panel setup-state ${trainer.error ? "is-error" : ""}" ${trainer.pending ? 'role="status"' : 'role="alert"'}><div class="setup-heading"><span aria-hidden="true">${trainer.pending ? "✦" : "!"}</span><h2>${trainer.pending ? "Getting your trainer ready…" : "Couldn't load your trainer."}</h2></div><p>${trainer.pending ? "Your account details will appear here in a moment." : "Try again to load your profile and resources."}</p>${trainer.error ? retryButton : ""}</section>`;
  } else {
    document.querySelector("#trainer-resources").innerHTML = `<div class="money-display" role="group" aria-label="Money">${icon("money")}<span class="money-label">Money</span><span class="money-value">${money(trainer.money)}</span></div><div class="mobile-identity"><span class="trainer-name">${trainer.name}</span><span class="trainer-level">Lv. ${trainer.level}</span></div>`;
    const exp = trainer.level === 100
      ? '<div class="exp-heading"><span>EXP</span><span>Max level</span></div>'
      : `<div class="exp-heading"><span>EXP</span><span>${money(trainer.exp)} / ${money(trainer.next)}</span></div><progress aria-label="EXP toward next trainer level" value="${trainer.exp}" max="${trainer.next}"></progress><p class="exp-caption">To level ${trainer.level + 1}</p>`;
    document.querySelector("#account-panel").innerHTML = `${profileHeading}<div class="profile-details">${exp}<div class="profile-money"><span>Money</span><span>${money(trainer.money)}</span></div>${id}${signout}</div>`;
    document.querySelector("#page").innerHTML = `<div class="list-intro"><h1>Play</h1><section class="list-overview"><h2>Ongoing battles</h2><p>Start a battle on Discord to continue it here.</p></section></div>${key === "new" || key === "fallback"
      ? '<div class="empty-state"><h2>No ongoing battles</h2><p>Start one in Discord, then return here to continue it.</p><p class="first-play-help">New to Pokestar? Use <code>/gacha</code> in Discord to catch Pokémon, then <code>/party</code> to prepare your team.</p></div>'
      : '<a href="#battle" class="battle-card" data-destination="Continue battle"><span class="battle-card-icon" aria-hidden="true">⚔</span><span><strong>Pve</strong><small>Turn 4 · Updated just now</small></span><span class="battle-card-arrow" aria-hidden="true">→</span></a>'}`;
  }
  const url = new URL(location.href);
  url.searchParams.set("state", key);
  url.searchParams.set("account", account.open ? "open" : "closed");
  history.replaceState(null, "", url);
};
scenario.addEventListener("change", render);
showAccount.addEventListener("change", () => { account.open = showAccount.checked; });
account.addEventListener("toggle", () => {
  showAccount.checked = account.open;
  const url = new URL(location.href);
  url.searchParams.set("account", account.open ? "open" : "closed");
  history.replaceState(null, "", url);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !dialog.open && account.open) {
    account.open = false;
    document.querySelector("#account-summary").focus();
  }
});
document.addEventListener("click", event => {
  if (!(event.target instanceof Element)) return;
  const destination = event.target.closest("[data-destination]");
  if (destination) {
    event.preventDefault();
    explain(destination.dataset.destination, "This study only reviews the trainer header and account states. Other screens keep their existing behavior.");
  }
  if (event.target.closest("[data-signout]")) explain("Sign out", "This is an example account. Production sign out keeps the existing session behavior.");
  if (event.target.closest("[data-retry]")) {
    scenario.value = "loading";
    render();
    // Remain pending until the reviewer selects a confirmed outcome.
    // A timer would imply a persistence/recovery guarantee this study cannot prove.
  }
});
render();
