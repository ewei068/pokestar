// Design fixtures only. No API, authentication, storage, or gameplay commands.
const pokemon = [
  { id: 143, name: "Snorlax", level: 42, types: ["normal"], nature: "Careful", ability: "Thick Fat", role: "Front row", item: "Leftovers" },
  { id: 448, name: "Lucario", level: 45, types: ["fighting", "steel"], nature: "Adamant", ability: "Inner Focus", role: "Front row", item: "Life Orb" },
  { id: 25, name: "Pikachu", level: 41, types: ["electric"], nature: "Timid", ability: "Static", role: "Middle row", item: "Light Ball" },
  { id: 282, name: "Gardevoir", level: 43, types: ["psychic", "fairy"], nature: "Modest", ability: "Synchronize", role: "Middle row", item: "None" },
  { id: 9, name: "Blastoise", level: 44, types: ["water"], nature: "Bold", ability: "Torrent", role: "Back row", item: "None" },
  { id: 6, name: "Charizard", level: 46, types: ["fire", "flying"], nature: "Modest", ability: "Blaze", role: "Back row", item: "None" },
  { id: 149, name: "Dragonite", level: 40, types: ["dragon", "flying"], nature: "Adamant", ability: "Inner Focus", role: "Not in party", item: "None" },
  { id: 94, name: "Gengar", level: 42, types: ["ghost", "poison"], nature: "Timid", ability: "Cursed Body", role: "Not in party", item: "None" },
];
const initialParty = [0, 1, null, null, 2, 3, null, null, 4, 5, null, null];
let party = [...initialParty];
let lastSavedParty = [...initialParty];
let acquired = false;
let savedParty = [1, 0, null, null, 3, 2, null, null, 5, 4, null, null];
let selectedSlot = null;
let dirty = false;
let search = "";
let sort = "name";
let message = "";
let selectedPokemon = 1;
let detailReturn = "collection";
let newTrainer = false;
let rewardClaimed = false;
let lessonClaimed = false;
let battleStarted = false;
let modalAction = null;
let modalOpener = null;

const screens = {
  rewards: "Rewards", collection: "Collection", detail: "Owned detail", party: "Party & presets",
  bag: "Bag", play: "Play", result: "Saved result", more: "More destinations",
  learn: "Learn", settings: "Settings", catch: "Catch", shop: "Shop", craft: "Crafting",
};
const states = {
  ready: "Ready", loading: "Loading", empty: "Empty", error: "Read error", stale: "Changed elsewhere",
  busy: "Saving / starting", uncertain: "Outcome unknown", new: "New trainer", signedout: "Signed out",
  missing: "Not owned / unavailable", pending: "Rewards pending", failed: "Rewards failed", cooldown: "Cooldown",
};
const supported = {
  rewards: ["ready", "new", "loading", "error", "signedout"],
  collection: ["ready", "empty", "loading", "error"], detail: ["ready", "loading", "error", "missing"],
  party: ["ready", "empty", "loading", "error", "stale", "busy", "uncertain"],
  bag: ["ready", "empty", "loading", "error"], play: ["ready", "new", "signedout", "empty", "loading", "error", "stale", "busy", "uncertain", "cooldown"],
  result: ["ready", "pending", "failed", "uncertain", "missing"],
  more: ["ready"], learn: ["ready", "new", "busy", "uncertain"],
  settings: ["ready", "stale", "busy", "uncertain"], catch: ["ready", "empty", "busy", "uncertain"],
  shop: ["ready"], quests: ["ready", "empty"], craft: ["ready", "empty"],
};
let page = location.hash.slice(1) || "play";
if (!screens[page]) page = "play";
let fourth = new URLSearchParams(location.search).get("fourth") === "bag" ? "bag" : "rewards";
let rewardTab = "daily";
let state = new URLSearchParams(location.search).get("state") || "ready";
if (!supported[page].includes(state)) state = "ready";

const app = document.querySelector("#app");
const screenControl = document.querySelector("#screen");
const stateControl = document.querySelector("#state");
const dialog = document.querySelector("#confirm");
const announce = text => { document.querySelector("#announcement").textContent = text; };
const esc = text => String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const link = (destination, label, classes = "button") => `<a class="${classes}" href="#${destination}">${label}</a>`;
const sprite = (p, classes = "") => `<img class="sprite ${classes}" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png" alt="" width="96" height="96">`;
const tags = p => `<div class="tags">${p.types.map(t => `<span class="tag ${t}">${t[0].toUpperCase() + t.slice(1)}</span>`).join("")}</div>`;
const heading = (eyebrow, title, description, action = "") => `<div class="page-heading"><div><h1 tabindex="-1">${title}</h1>${description ? `<p>${description}</p>` : ""}</div>${action}</div>`;
const notice = (text, kind = "", action = "") => `<div class="notice ${kind}" role="${kind === "error" ? "alert" : "status"}">${text}${action ? `<div class="actions">${action}</div>` : ""}</div>`;
const tabs = () => `<nav class="subnav" aria-label="Pokémon pages">${[["collection", "Collection"], ["party", "Party & presets"]].map(([id, label]) => `<a href="#${id}" ${page === id || (id === "collection" && page === "detail") ? 'aria-current="page"' : ""}>${label}</a>`).join("")}</nav>`;
const empty = (title, description, actions) => `<section class="panel empty"><span class="empty-symbol" aria-hidden="true">✦</span><h2>${title}</h2><p>${description}</p><div class="actions">${actions}</div></section>`;
const write = (action, label, classes = "primary") => `<button type="button" class="${classes}" data-action="${action}" data-write>${label}</button>`;
const icon = name => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${name === "bag" ? '<path d="M5 9h14l1 12H4L5 9Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3M8 14h8v4H8z"/>' : '<path d="M3 8h18v5H3zM5 13v8h14v-8M12 8v13"/><path d="M12 8C3 8 5 0 9 3l3 5Zm0 0c9 0 7-8 3-5l-3 5Z"/>'}</svg>`;
function navMarkup() {
  const active = ["detail", "party"].includes(page) ? "collection" : ["learn", "quests", "rewards"].includes(page) ? "rewards" : page === "result" ? "play" : page;
  const items = [["play", "⚔", "Play"], ["collection", "◉", "Pokémon"], ["catch", "◎", "Catch"], [fourth, fourth === "bag" ? "▣" : "✦", fourth === "bag" ? "Bag" : "Rewards"], ["more", "⋯", "More"]];
  return items.map(([id, icon, name]) => `<a href="#${id}" ${active === id ? 'aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${icon}</span><span>${name}</span></a>`).join("");
}
function collectionCards() {
  const found = pokemon.map((p, i) => ({ ...p, index: i })).filter(p => !newTrainer || (acquired && p.index === 1)).filter(p => p.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === "level" ? b.level - a.level : a.name.localeCompare(b.name));
  return found.length ? found.map(p => `<a href="#detail" data-pokemon="${p.index}" class="pokemon-card" aria-label="Inspect ${p.name}, level ${p.level}"><span class="meta"><span>${party.includes(p.index) ? "In party" : "Owned"}</span><span>Lv. ${p.level}</span></span><span class="pokemon-art">${sprite(p)}</span><strong>${p.name}</strong>${tags(p)}<small>${p.nature} · ${p.ability}</small></a>`).join("") : `<p class="muted">No Pokémon match. Try another name.</p>`;
}
function collection() {
  return `${tabs()}${heading("Collection", "Your Pokémon", "", link("party", "Edit party →"))}
    <div class="toolbar"><label>Search Pokémon<input id="search" type="search" placeholder="Name…" value="${esc(search)}"></label><label>Sort by<select id="sort"><option value="name" ${sort === "name" ? "selected" : ""}>Name</option><option value="level" ${sort === "level" ? "selected" : ""}>Level · highest first</option></select></label></div>
    <div class="panel-title"><span class="count">${newTrainer ? (acquired ? 1 : 0) : 8} Pokémon · ${party.filter(p => p !== null).length} in party</span>${link("catch", "+ Catch Pokémon", "text-link")}</div><div id="cards" class="collection-grid">${collectionCards()}</div>`;
}
function detail() {
  const p = pokemon[selectedPokemon];
  return `${link(detailReturn, detailReturn === "party" ? "← Back to party" : "← Back to collection", "back")}${heading("Owned Pokémon", p.name, `Level ${p.level} · Owned Pokémon #${String(selectedPokemon + 1).padStart(3, "0")}`, link("party", "Manage in party →"))}
    <div class="split"><div class="stack"><section class="panel"><div class="detail-hero"><div class="pokemon-art">${sprite(p)}</div><div><p class="eyebrow">${party.includes(selectedPokemon) ? "In party" : "Owned Pokémon"}</p><h2>${p.name}</h2>${tags(p)}<p class="footnote">Original trainer: Leaf<br>Held item: ${p.item}</p></div></div>
    <dl class="facts"><div><dt>Nature</dt><dd>${p.nature}</dd></div><div><dt>Ability</dt><dd>${p.ability}</dd></div><div><dt>Friendship</dt><dd>86 / 100</dd></div><div><dt>Build</dt><dd>EVs · IVs · moves · equipment</dd></div></dl></section>
    <section class="panel"><h2>Stats & training</h2>${["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"].map((s, i) => `<div class="stat-row"><span>${s}</span><span class="stat-bar"><span style="width:${[74, 87, 58, 70, 58, 79][i]}%"></span></span><span>${[142, 156, 104, 125, 104, 140][i]}</span></div>`).join("")}<p class="footnote">Check EVs and IVs before training.</p></section></div>
    <aside class="stack"><section class="panel"><h2>Build actions</h2><div class="stack">${write("outline-training", "Train / reset EVs", "")}${write("outline-evolution", "Evolution & forms", "")}${write("outline-equipment", "Equipment & held item", "")}${write("outline-protection", "Protection & release", "")}</div></section><section class="panel"><h2>Your party</h2><p class="muted">${p.name} is ${party.includes(selectedPokemon) ? "in the active formation" : "available to add"}.</p>${link("party", "Edit formation →", "text-link")}</section></aside></div>`;
}
function partyScreen() {
  const count = party.filter(p => p !== null).length;
  return `${tabs()}${heading("Party & presets", "Battle formation", "Up to six Pokémon on a 3 × 4 field. Choose a slot, then choose a Pokémon.", link("play", "Play →"))}
    <div class="split"><div class="stack"><section class="panel"><div class="panel-title"><h2>Active party</h2><span class="count">${count} / 6 · ${dirty ? "Unsaved changes" : "Saved"}</span></div><div class="enemy-edge">Opponent ahead ↑</div>
    <div class="formation">${["Front row", "Middle row", "Back row"].map((row, r) => `<div><div class="row-label">${row}</div><div class="formation-row">${party.slice(r * 4, r * 4 + 4).map((index, c) => {
      const slot = r * 4 + c;
      return `<button type="button" class="slot ${index !== null ? "occupied" : ""} ${selectedSlot === slot ? "selected" : ""}" data-slot="${slot}" aria-pressed="${selectedSlot === slot}" aria-label="Slot ${slot + 1}, ${row}, ${index === null ? "empty" : pokemon[index].name}">${index === null ? '<span aria-hidden="true">＋</span><span>Empty</span>' : `${sprite(pokemon[index])}<strong>${pokemon[index].name}</strong>`}<span>${slot + 1}</span></button>`;
    }).join("")}</div></div>`).join("")}</div><p class="footnote">${selectedSlot === null ? "Select a slot to change it. " : `Slot ${selectedSlot + 1} selected. Choose a Pokémon below, or remove its occupant.`}</p><div class="actions" style="margin-top:16px">${write("save-party", "Save formation")}${write("remove-slot", "Remove selected", "")}</div></section>
    <section class="panel"><div class="panel-title"><h2>Choose a Pokémon</h2>${link("collection", "Collection →", "text-link")}</div><div class="bench">${pokemon.map((p, i) => ({ ...p, index: i })).filter(p => !newTrainer || (acquired && p.index === 1)).map(p => `<button type="button" data-place="${p.index}" ${selectedSlot === null ? "disabled" : ""} aria-label="Place ${p.name} in selected slot">${sprite(p)}${p.name}</button>`).join("")}</div>${link("detail", "Inspect Lucario →", "text-link")}</section></div>
    <aside class="panel"><h2>Saved presets</h2><p class="muted">Switch a preset with your active party. Your current formation takes its place.</p><div class="preset"><strong>Preset 1</strong><p>6 Pokémon · 3 × 4</p>${write("swap-preset", "Switch with active party", "")}</div><div class="preset"><strong>Preset 2</strong><p>Empty slot</p>${write("save-preset", "Save active party here", "")}</div><p class="footnote">Nine preset slots in the full view. Switching a preset does not edit a battle already in progress.</p></aside></div>`;
}
function bag() {
  return `${heading("Inventory", "Your bag", "", link("shop", "Visit shop →"))}<div class="split"><section class="panel"><div class="panel-title"><h2>Items & resources</h2><span class="tag">All categories</span></div><table class="inventory"><thead><tr><th scope="col">Item</th><th scope="col">Owned</th><th scope="col">Use</th></tr></thead><tbody>${[["Poké Ball", "24", "catch", "Catch"], ["Great Ball", "8", "catch", "Catch"], ["Ultra Ball", "3", "catch", "Catch"], ["Rare Candy", "12", "detail", "Train"], ["Dream Card", "2", "more", "Details"], ["Materials", "46", "craft", "Craft"]].map(([name, count, target, label]) => `<tr><td><span class="item-symbol" aria-hidden="true">${name === "Materials" ? "◇" : "◉"}</span>${name}</td><td>${count}</td><td>${link(target, `${label} →`, "text-link")}</td></tr>`).join("")}</tbody></table></section><aside class="stack"><section class="panel"><h2>Money</h2><p style="font-size:32px;color:var(--gold);margin-bottom:8px">12,480</p><p class="muted">Use it for supplies, training and build changes.</p>${link("shop", "Browse shop →", "text-link")}</section><section class="panel"><h2>Dream Cards</h2><p class="muted">You own 2 Dream Cards.</p></section></aside></div>`;
}
function play() {
  return `${heading("Battle", "Play", "", link("party", "Edit party →"))}<section class="play-field" aria-label="Active party">${party.filter(i => i !== null).map(i => `<div>${sprite(pokemon[i])}<strong>${pokemon[i].name}</strong><small>Lv. ${pokemon[i].level}</small></div>`).join("")}</section><div class="split"><div class="stack"><section class="panel"><div class="panel-title"><h2>Continue a battle</h2><span class="tag good">In progress</span></div><div class="list-row"><span class="item-symbol" aria-hidden="true">⚔</span><div><strong>NPC battle · your turn</strong><small>Your turn.</small></div>${link("result", "Open →", "text-link")}</div><p class="footnote"></p></section>
    <section class="panel"><div class="panel-title"><h2>NPC encounters</h2><span class="tag">Daily progress</span></div><div class="list-row"><div><strong>Trainer battle</strong><small>Review today's availability before starting.</small></div>${write("start-battle", "Review battle", "gold")}</div><div class="list-row"><div><strong>Dungeons</strong><small>Choose a dungeon and resume its next phase.</small></div>${write("outline-dungeon", "Explore", "")}</div><div class="list-row"><div><strong>Battle Tower</strong><small>Continue your floor or review a reset.</small></div>${write("outline-tower", "Enter tower", "")}</div></section></div>
    <aside class="panel"><div class="panel-title"><h2>Active party</h2><span class="count">${party.filter(p => p !== null).length} / 6</span></div>${party.filter(i => i !== null).map(i => `<div class="list-row">${sprite(pokemon[i])}<div><strong>${pokemon[i].name}</strong><small>Lv. ${pokemon[i].level}</small></div></div>`).join("")}<p class="footnote">Party changes apply to your next battle.</p>${link("party", "Edit formation →", "text-link")}</aside></div>`;
}
function result() {
  const pending = ["pending", "failed", "uncertain"].includes(state);
  return `${link("play", "← Back to Play", "back")}${heading("Battle result", "Victory!", "NPC battle · saved result · only your rewards are shown")}${state === "pending" ? notice("Awarding battle rewards…", "", '<button data-action="check-result">Check status</button>') : state === "failed" ? notice("Couldn't award battle rewards.", "error", '<button data-action="check-result">Check status</button>') : state === "uncertain" ? notice("Your battle finished. We couldn't confirm the rewards. Check the saved result before trying again.", "warning", '<button data-action="check-result">Check saved result</button>') : ""}
    <div class="split"><section class="panel"><div class="panel-title"><h2>Your rewards</h2><span class="tag ${pending ? "" : "good"}">${pending ? "Not confirmed" : "Applied"}</span></div>${pending ? '<p class="muted">Reward amounts will appear when their application is confirmed.</p>' : '<div class="receipt-delta"><span>Money</span><strong>+420</strong></div><div class="receipt-delta"><span>Lucario EXP</span><strong>+180</strong></div><div class="receipt-delta"><span>Quest progress</span><strong>NPC battle · 1 / 1</strong></div><p class="footnote">Example amounts for layout review. Reopening a result does not grant rewards again.</p>'}</section><aside class="panel"><h2>What's next?</h2><div class="stack">${link("quests", "View quest progress →", "button primary")}${link("party", "Adjust your party →")}${link("play", "Choose another battle →")}${link("learn", "Return to your lesson →")}</div></aside></div>`;
}
function rewards() {
  const sections = [["daily", "Daily"], ["quests", "Quests"], ["achievements", "Achievements"], ["learn", "Tutorial"], ["levels", "Level rewards"]];
  const contents = {
    daily: `<section class="panel"><h2>Daily rewards</h2><p>${rewardClaimed ? "Today's rewards were claimed." : "Your daily rewards are ready."}</p>${write("claim-daily", rewardClaimed ? "Claimed" : "View rewards", "gold")}</section>`,
    quests: `<section class="panel"><h2>Win an NPC battle</h2><p>${battleStarted ? "1 / 1" : "0 / 1"}</p>${link("play", "Play →", "button primary")}</section>`,
    achievements: `<section class="panel"><h2>Achievements</h2><p>Catch Pokémon · 8 / 10</p>${link("catch", "Catch →", "button primary")}<p class="footnote">Example objective for layout review.</p></section>`,
    learn: `<section class="panel"><h2>Build your first party</h2><p>Put tanky Pokémon in the front.</p>${link("learn", "Continue tutorial →", "button primary")}</section>`,
    levels: `<section class="panel"><h2>Trainer level 18</h2><p>No rewards to claim.</p>${link("play", "Play →", "text-link")}</section>`,
  };
  return `${heading("", "Rewards", "")}<nav class="reward-tabs" aria-label="Reward categories">${sections.map(([id, label]) => `<button data-reward-tab="${id}" aria-pressed="${rewardTab === id}">${label}</button>`).join("")}</nav>${contents[rewardTab]}`;
}
const directoryItems = [["shop", "Shop", "Buy supplies."], ["craft", "Crafting", "Use your materials."], ["party", "Party presets", "Switch your formation."]];
function more() {
  return `${heading("", "More", "")}<div class="directory">${directoryItems.map(([id, label, description]) => `<a class="panel" href="#${id}"><strong>${label} →</strong><small>${description}</small></a>`).join("")}</div>`;
}
function learn() {
  return `${link("rewards", "← Back to rewards", "back")}${heading("Learn to play", "Build your first party", "")}<section class="panel"><p class="eyebrow">Current lesson</p><h2>Put your Pokémon on the field</h2><p class="muted">Put tanky Pokémon in the front. Choose a slot, then choose a Pokémon from your collection.</p><div class="actions">${link("party", "Open party →", "button primary")}${write("claim-lesson", lessonClaimed ? "Reward already claimed" : "Review lesson reward", "")}</div><p class="footnote">Already completed a lesson in Discord? Keep that progress. Lessons that require a later web feature should explain the Discord route and return here.</p></section>`;
}
function settings() {
  return `${link("more", "← Back to more", "back")}${heading("Account", "Settings", "Game preferences follow your trainer. Sound levels apply to this browser.")}<div class="split"><section class="panel settings-list"><h2>Trainer preferences</h2><label>Profile privacy<select><option>Public</option><option>Private</option></select></label><label>Quest reminders<select><option>On</option><option>Off</option></select></label>${write("save-settings", "Save preferences")}</section><section class="panel settings-list"><h2>Sound · this browser</h2><label>Music <input aria-label="Music volume" type="range" min="0" max="100" value="45"></label><label>Sound effects <input aria-label="Sound effects volume" type="range" min="0" max="100" value="70"></label><p class="footnote">The study makes no sound. Existing browser audio preferences remain separate from shared trainer settings.</p><button data-action="signout">Sign out</button></section></div>`;
}
function supporting() {
  if (page === "catch") return `${link("more", "← Back to more", "back")}${heading("Catch", "Catch Pokémon", "Review the banner and the resources you'll spend.")}<section class="panel"><h2>Poké Ball banner</h2><p class="muted">Owned Poké Balls: ${newTrainer ? "10" : "24"}</p><div class="actions">${write("catch", "Use a Poké Ball", "gold")}${link("bag", "View bag →")}</div></section>`;
  if (page === "quests") return `${link("rewards", "← Back to rewards", "back")}${heading("Progress", "Your quests", "Follow an objective to its action, then return to claim.")}<section class="panel"><h2>Complete an NPC battle</h2><p class="muted">${battleStarted ? "1 / 1 · example completed objective" : "0 / 1 · in progress"}</p><div class="actions">${link("play", "Choose a battle →", "button primary")}${link("result", "View saved result →")}</div></section>`;
  return `${link("more", "← Back to more", "back")}${heading(page === "craft" ? "Crafting" : "Shop & locations", page === "craft" ? "Crafting" : "Shop", "Review the current costs and owned resources before confirming.")}<section class="panel"><h2>${page === "craft" ? "Recipes" : "Supplies & location improvements"}</h2><p class="muted">Screen sketch · details still to design.</p>${link("bag", "Check owned resources →", "text-link")}</section>`;
}
function stateReplacement() {
  if (state === "signedout") return `${heading("Pokestar", "Pokestar", "Sign in with Discord to play Pokestar.")}<section class="panel"><h2>Sign in</h2><p class="muted">Use your Discord account.</p><button class="primary" data-action="signin">Sign in with Discord</button></section>`;
  if (state === "loading") return `${heading("Loading", `Loading ${screens[page].toLowerCase()}…`, "Your latest information will appear here.")}<div role="status" class="sr-only">Loading ${screens[page]}</div><div class="collection-grid" aria-hidden="true">${'<div class="skeleton"></div>'.repeat(4)}</div>`;
  if (state === "error") return `${heading(screens[page], "Couldn't load this page.", "Try again to check your latest information.")}${notice("Your saved progress hasn't been changed by this page load.", "error", '<button class="primary" data-action="reload">Try again</button>')}${link("rewards", "← Back to rewards", "back")}`;
  if (state === "missing") return `${heading("Unavailable", page === "result" ? "This result isn't available." : "This Pokémon isn't available.", page === "result" ? "The link may have expired, or this isn't your battle." : "It may no longer be in your collection.")}${link(page === "result" ? "play" : "collection", page === "result" ? "Back to battles →" : "Back to collection →", "button primary")}`;
  if ((state === "new" && page === "play") || state === "empty" || (newTrainer && ((page === "collection" && !acquired) || ((page === "party" || page === "play") && !acquired)))) {
    const copy = {
      collection: ["No Pokémon yet", "Use a Poké Ball to catch your first Pokémon.", link("catch", "Catch Pokémon →", "button primary")],
      party: ["Your field is empty", "Get a Pokémon first, then choose where it goes. You don't need a full party to get started.", link("collection", "Choose Pokémon →", "button primary")],
      bag: ["No items in this category", "Your other resources are still in your bag. Check rewards or visit the shop.", link("rewards", "Review rewards →", "button primary")],
      play: ["Build a party first", "Choose at least one owned Pokémon for your formation before starting a battle.", link("party", "Set up party →", "button primary")],
      catch: ["No Poké Balls available", "Review rewards or visit the shop, then return to this banner.", link("rewards", "Review rewards →", "button primary")],
      quests: ["No claimable rewards", "Keep playing to advance your current objectives.", link("play", "Choose a battle →", "button primary")],
      craft: ["No recipes available", "Check your owned materials or return after making more progress.", link("bag", "View bag →", "button primary")],
    }[page];
    if (copy) return `${["collection", "party"].includes(page) ? tabs() : ""}${heading(screens[page], screens[page], "")}${empty(...copy)}`;
  }
  return null;
}
function render(focus = false) {
  document.querySelector("#fourth").value = fourth;
  screenControl.innerHTML = Object.entries(screens).map(([id, label]) => `<option value="${id}" ${id === page ? "selected" : ""}>${label}</option>`).join("");
  stateControl.innerHTML = supported[page].map(id => `<option value="${id}" ${id === state ? "selected" : ""}>${states[id]}</option>`).join("");
  const banner = state === "stale" ? notice("This information changed in Discord. Reload it before saving or starting a battle.", "warning", '<button data-action="reload">Reload latest</button>') : state === "busy" ? notice(page === "play" ? "Starting your battle…" : "Saving your changes…") : state === "uncertain" && page !== "result" ? notice("We couldn't confirm what happened. Check the saved result before trying again.", "warning", '<button data-action="check-result">Check saved result</button>') : state === "cooldown" ? notice("This encounter isn't available yet. Check again when its cooldown ends.", "warning") : "";
  const content = stateReplacement() ?? ({ collection, detail, party: partyScreen, bag, play, result, rewards, more, learn, settings }[page] || supporting)();
  const signedOut = state === "signedout";
  const balance = newTrainer || state === "new" ? "1,000" : "12,480";
  const ballCount = newTrainer || state === "new" ? (acquired ? 9 : 10) : 24;
  app.innerHTML = `<header class="site-header"><a href="#play" class="brand"><span class="brand-mark" aria-hidden="true">✦</span>Pokestar</a><div class="header-right">${!signedOut ? `<div class="resources"><span><span class="resource-icon" aria-hidden="true">◆</span> ${balance} <span class="sr-only">Money</span></span><span class="secondary-resource">◉ ${ballCount} <span class="sr-only">Poké Balls</span></span></div><span class="avatar" aria-hidden="true">L</span><span class="trainer-name">Leaf · Lv. ${newTrainer || state === "new" ? 1 : 18}</span>` : ""}<a class="icon-button" href="#${fourth === "rewards" ? "bag" : "rewards"}" aria-label="${fourth === "rewards" ? "Bag" : "Rewards"}" title="${fourth === "rewards" ? "Bag" : "Rewards"}">${icon(fourth === "rewards" ? "bag" : "rewards")}</a><a class="icon-button" href="#settings" aria-label="Settings" title="Settings">⚙</a></div></header><div class="shell" ${signedOut ? 'style="grid-template-columns:1fr"' : ""}>${signedOut ? "" : `<aside class="side"><nav aria-label="Main navigation">${navMarkup()}</nav></aside>`}<main class="content" id="content" tabindex="-1">${banner}${message ? notice(message, "success") : ""}${content}</main></div>${signedOut ? "" : `<nav class="bottom-nav" aria-label="Main navigation">${navMarkup()}</nav>`}`;
  if (["busy", "stale", "uncertain", "cooldown"].includes(state)) document.querySelectorAll("[data-write], [data-place], [data-slot]").forEach(button => { button.disabled = true; });
  if (rewardClaimed) document.querySelector('[data-action="claim-daily"]')?.setAttribute("disabled", "");
  if (lessonClaimed) document.querySelector('[data-action="claim-lesson"]')?.setAttribute("disabled", "");
  if (page === "party") {
    const save = document.querySelector('[data-action="save-party"]');
    if (save && !dirty) save.disabled = true;
    const remove = document.querySelector('[data-action="remove-slot"]');
    if (remove && (selectedSlot === null || party[selectedSlot] === null)) remove.disabled = true;
  }
  document.querySelectorAll("img").forEach(img => img.addEventListener("error", () => {
    const fallback = document.createElement("span");
    fallback.className = "sprite";
    fallback.style.cssText = "display:grid;place-items:center;color:#9fe4fb;font-size:30px";
    fallback.textContent = "◉";
    img.replaceWith(fallback);
  }, { once: true }));
  document.title = `${screens[page]} · Pokestar design study`;
  if (focus) document.querySelector("h1")?.focus({ preventScroll: true });
}
function go(destination, fixtureState = "ready") {
  if (destination === "quests") { destination = "rewards"; rewardTab = "quests"; }
  state = fixtureState;
  message = "";
  const url = new URL(location.href);
  url.searchParams.set("state", state);
  url.hash = destination;
  history.pushState(null, "", url);
  page = destination;
  render(true);
  window.scrollTo(0, 0);
}
function confirm(title, text, label, action) {
  modalOpener = document.activeElement;
  modalAction = action;
  dialog.innerHTML = `<h2 id="confirm-title">${title}</h2><p>${text}</p><p class="footnote">Design fixture · this does not change your trainer.</p><div class="actions"><button data-modal="cancel" autofocus>Cancel</button><button class="primary" data-modal="accept">${label}</button></div>`;
  dialog.showModal();
}
dialog.addEventListener("click", event => {
  const button = event.target.closest("[data-modal]");
  if (!button) return;
  const action = modalAction;
  dialog.close();
  modalAction = null;
  if (button.dataset.modal === "accept") action?.();
});
dialog.addEventListener("close", () => {
  if (modalOpener?.isConnected) modalOpener.focus();
  else document.querySelector("h1")?.focus({ preventScroll: true });
});
app.addEventListener("click", event => {
  const target = event.target.closest("a, button");
  if (!target) return;
  if (target.dataset.rewardTab) { rewardTab = target.dataset.rewardTab; render(); document.querySelector(`[data-reward-tab="${rewardTab}"]`).focus(); return; }
  if (target.matches("a[href^='#']")) {
    if (target.hash === "#content") return;
    event.preventDefault();
    if (dirty && target.hash !== "#party") {
      confirm("Leave without saving?", "Your changes to the formation haven't been saved.", "Discard changes", () => {
        party = [...lastSavedParty]; dirty = false; selectedSlot = null; go(target.hash.slice(1));
      });
      return;
    }
    if (target.dataset.pokemon !== undefined) { selectedPokemon = Number(target.dataset.pokemon); detailReturn = page; }
    else if (target.hash === "#detail") { selectedPokemon = 1; detailReturn = page === "party" ? "party" : "collection"; }
    go(target.hash.slice(1));
    return;
  }
  if (target.dataset.slot !== undefined) { selectedSlot = Number(target.dataset.slot); render(); document.querySelector(`[data-slot="${selectedSlot}"]`).focus(); return; }
  if (target.dataset.place !== undefined && selectedSlot !== null) {
    const index = Number(target.dataset.place);
    const oldSlot = party.indexOf(index);
    if (oldSlot === -1 && party[selectedSlot] === null && party.filter(p => p !== null).length >= 6) { announce("Your party already has six Pokémon. Replace an occupied slot or remove one first."); return; }
    if (oldSlot !== -1) party[oldSlot] = party[selectedSlot];
    party[selectedSlot] = index; dirty = true; render(); announce(`${pokemon[index].name} placed in slot ${selectedSlot + 1}. Unsaved changes.`); return;
  }
  const action = target.dataset.action;
  const done = text => { state = "ready"; message = text; render(true); announce(text); };
  if (action === "reload") { party = [...lastSavedParty]; dirty = false; selectedSlot = null; done("Latest information loaded. Review it before continuing."); }
  else if (action === "remove-slot" && selectedSlot !== null) { party[selectedSlot] = null; dirty = true; render(); announce("Pokémon removed from the draft formation."); }
  else if (action === "save-party") confirm("Save this formation?", "This party will be used for future battle starts. Existing battles keep their starting builds.", "Save formation", () => { lastSavedParty = [...party]; dirty = false; done("Formation saved. Your party is ready to review at battle entry."); });
  else if (action === "swap-preset") confirm("Switch with preset 1?", "Your active party becomes preset 1, and preset 1 becomes your active party.", "Switch parties", () => { [party, savedParty] = [savedParty, party]; lastSavedParty = [...party]; dirty = false; done("Active party and preset 1 switched."); });
  else if (action === "save-preset") confirm("Save to preset 2?", "This copies your current formation into the empty preset slot.", "Save preset", () => done("Formation saved to preset 2 in this example."));
  else if (action === "start-battle") confirm("Start this NPC battle?", "Review: active party, today's encounter eligibility and any entry cost. This example has no entry cost. Your starting builds will be fixed for this battle.", "Start battle", () => { battleStarted = true; go("result", "pending"); });
  else if (action === "claim-daily") confirm("Claim your daily rewards?", "Today's reward bundle will be added to your trainer. Review the resulting receipt before claiming anything again.", "Claim rewards", () => { rewardClaimed = true; done("Daily reward example applied. Return tomorrow for the next claim."); });
  else if (action === "claim-lesson") confirm("Review lesson completion", "Lesson requirements must be met before a reward is claimed. Rewards you already earned in Discord stay claimed.", "Preview claimed state", () => { lessonClaimed = true; done("Example claimed state. Existing lesson credit must be preserved."); });
  else if (action === "catch") confirm("Use 1 Poké Ball?", `Owned: ${newTrainer ? 10 : 24} → ${newTrainer ? 9 : 23}. Review the banner before confirming. This example's acquired Pokémon is Lucario.`, "Use Poké Ball", () => { selectedPokemon = 1; detailReturn = "collection"; acquired = true; go("detail"); message = "Lucario joined your collection! Example acquisition receipt: −1 Poké Ball."; render(true); });
  else if (action === "save-settings") confirm("Save trainer preferences?", "Profile privacy and quest reminders should apply to the same trainer in Discord and web. Browser sound levels stay separate.", "Save preferences", () => done("Trainer preference example saved."));
  else if (action === "check-result") { if (page === "play" || page === "result") go("result"); else done("Example saved outcome checked. Review the current state before making another change."); }
  else if (action === "signin") { newTrainer = true; acquired = false; party = Array(12).fill(null); lastSavedParty = [...party]; go("play", "new"); }
  else if (action === "signout") go("play", "signedout");
  else if (action?.startsWith("outline-")) confirm("Feature design boundary", "This action is part of the approved release map. Detailed training, build, protection and mode interactions will be designed in their owning feature tickets.", "Return to study", () => {});
});
app.addEventListener("input", event => {
  if (event.target.id === "search") { search = event.target.value; document.querySelector("#cards").innerHTML = collectionCards(); announce(`${document.querySelectorAll("#cards .pokemon-card").length} matching Pokémon.`); }
});
app.addEventListener("change", event => {
  if (event.target.id === "sort") { sort = event.target.value; document.querySelector("#cards").innerHTML = collectionCards(); }
});
document.querySelector("#fourth").addEventListener("change", event => {
  fourth = event.target.value;
  const url = new URL(location.href); url.searchParams.set("fourth", fourth); history.replaceState(null, "", url); render();
});
screenControl.addEventListener("change", () => go(screenControl.value));
stateControl.addEventListener("change", () => { state = stateControl.value; message = ""; const url = new URL(location.href); url.searchParams.set("state", state); history.pushState(null, "", url); render(); announce(`${states[state]} fixture state.`); });
window.addEventListener("popstate", () => { page = location.hash.slice(1) || "play"; if (!screens[page]) page = "play"; state = new URLSearchParams(location.search).get("state") || "ready"; if (!supported[page].includes(state)) state = "ready"; message = ""; render(true); });
render();
