// In-memory design simulation. No fetch, API, storage, grants or gameplay writes.
const params = new URLSearchParams(location.search);
let scenario = params.get("state") || "ready";
if (scenario === "entry" || (!params.has("state") && !params.has("id"))) window.location.replace("collection.html");
const collectionUrl = new URL("collection.html", window.location.href);
collectionUrl.searchParams.set("id", params.get("id") || "67a1234567890abcdef000000");
collectionUrl.searchParams.set("panel", "inspect");
const returnTo = params.get("from");
const invokingUrl = returnTo ? new URL(returnTo, window.location.href) : collectionUrl;
const safeReturnUrl = invokingUrl.origin === collectionUrl.origin && invokingUrl.pathname === collectionUrl.pathname ? invokingUrl : collectionUrl;
const page = document.querySelector("#page");
const stats = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
const catalog = window.trainingLocations;
const owned = scenario === "home" ? { 0: 0 } : { 0: 2, 1: 1, 2: 2, 3: 1, 4: 3, 6: 2, 7: 1, 8: 1 };
let locationId = scenario.startsWith("berry") ? "8" : scenario === "home" ? "0" : "2";
let pokemon = { name: scenario === "long" ? "Sir Pikachu the Unreasonably Magnificent" : "Pikachu", species: "Pikachu", id: 25, level: 41, progress: 198, required: 535, evs: [0, 232, 0, 0, 0, 96] };
if (["level-cap", "complete", "berry", "berry-zero"].includes(scenario)) pokemon.level = 100;
if (scenario === "ev-cap") pokemon.evs = [6, 252, 0, 0, 0, 252];
if (scenario === "complete") pokemon.evs = [0, 252, 0, 0, 0, 96];
if (scenario === "berry") pokemon.evs = [6, 25, 0, 12, 0, 17];
if (scenario === "berry-zero") pokemon.evs = [0, 0, 0, 0, 0, 0];
const selectedRecord = pokemonFixtures.find(record => record.speciesId === params.get("species"));
if (selectedRecord) pokemon = { name: params.get("name") || selectedRecord.name, species: selectedRecord.speciesName, id: Number(selectedRecord.speciesId), sprite: selectedRecord.sprite, types: selectedRecord.types, level: Number(params.get("level")) || selectedRecord.level, progress: selectedRecord.expProgress, required: selectedRecord.expToNext, evs: [...selectedRecord.evs] };
let running = false, pending = false, timer, requestTimer;
let trainerGainsCount = 0;
let gainedExp = 0, gainedEvs = [0, 0, 0, 0, 0, 0];
let unresolved = scenario === "uncertain";
let rejected = scenario === "error", stale = scenario === "stale";
const escape = value => String(value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const icons = { play:'<path d="m5 3 14 14-2 2L3 5V3h2Zm14 0L5 17m-2-3 7 7m4-18 7 7"/>', pokemon:'<circle cx="12" cy="12" r="8"/><path d="M4 12h5m6 0h5"/><circle cx="12" cy="12" r="3"/>', catch:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/><circle cx="12" cy="12" r="5"/>', rewards:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>', more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>' };
document.querySelector("#navigation").innerHTML = [["play", "Play"], ["pokemon", "Pokémon"], ["catch", "Catch"], ["rewards", "Rewards"], ["more", "More"]].map(([id, label]) => `<a href="#${id}" data-shell="${label}" ${id === "pokemon" ? 'aria-current="page"' : ""}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id]}</svg><span>${label}</span><span class="nav-arrow" aria-hidden="true">›</span></a>`).join("");
const selectedLocation = () => catalog.find(row => row.id === locationId);
const level = id => owned[id] || 0;
const available = id => id === "0" || !!level(id);
function config() { return selectedLocation().levelConfig[level(locationId)] || { exp: 2, evs: [0, 0, 0, 0, 0, 0] }; }
function delta() {
  const next = [...pokemon.evs];
  return config().evs.map((value, i) => {
    const total = next.reduce((a, b) => a + b, 0);
    const change = value > 0 ? Math.max(0, Math.min(value, 252 - next[i], 510 - total)) : Math.max(value, -next[i]);
    next[i] += change;
    return change;
  });
}
// Maintainer-confirmed stop rule; backend still stores EXP at Lv. 100.
const canTrain = () => pokemon.level < 100 || delta().some(value => value !== 0);
const exp = () => Math.max(1, Math.floor(config().exp * (2.5 * Math.sqrt(18) + 15) * (scenario === "celebi" ? 2 : 1)));
const signed = value => value > 0 ? `+${value}` : String(value).replace("-", "−");
function art() { return scenario === "long" ? '<span class="art-fallback" role="img" aria-label="Artwork unavailable">◇</span>' : `<img class="pokemon-art" src="${escape(pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`)}" alt="" onerror="this.outerHTML='<span class=&quot;art-fallback&quot; aria-label=&quot;Artwork unavailable&quot;>◇</span>'">`; }
function identity() { return `<div class="identity">${art()}<div class="identity-info"><h2>${escape(pokemon.name)}</h2><p>Lv. ${pokemon.level} · ${pokemon.species}</p><span class="type">${escape((pokemon.types || ["Electric"]).join(" / "))}</span></div></div>`; }
function locations() {
  return `<aside class="ui-panel location-panel"><header class="ui-panel-heading panel-head"><h2>Training locations</h2><small>${catalog.filter(row => available(row.id)).length} available</small></header><div class="locations">${catalog.map(row => `<button class="location-row${running && row.id === locationId ? " active-locked" : ""}" data-location="${row.id}" aria-pressed="${row.id === locationId}" ${!available(row.id) || running || pending ? "disabled" : ""}><span class="location-icon" aria-hidden="true">${row.emoji}</span><span class="location-label"><strong>${row.name}</strong><small>${row.id === "0" ? "EXP" : row.id === "7" || row.id === "8" ? "Reduce all EVs" : `${stats[+row.id - 1]} EVs`}</small></span><span class="location-level">${available(row.id) ? level(row.id) ? `Lv. ${level(row.id)}` : "Free" : "Not owned"}</span></button>`).join("")}</div><p class="locations-foot">More locations and upgrades in <button data-shell="Shop">Shop</button>.</p></aside>`;
}
function notice() {
  if (unresolved) return '<div class="callout" role="alert"><p>Training paused. The last request may have finished. Refresh before training again.</p><button data-action="refresh" class="ui-button">Refresh Pokémon</button></div>';
  if (rejected) return '<div class="callout" role="alert"><p>You no longer own this location. Choose another location.</p></div>';
  if (stale) return '<div class="callout" role="alert"><p>This Pokémon changed in Discord. Refresh before training.</p><button data-action="refresh" class="ui-button">Refresh Pokémon</button></div>';
  return "";
}
function summary() {
  const d = delta(), cfg = config();
  return `<div class="mobile-location"><label for="location">Training location</label><select id="location" ${running || pending ? "disabled" : ""}>${catalog.map(row => `<option value="${row.id}" ${row.id === locationId ? "selected" : ""} ${!available(row.id) ? "disabled" : ""}>${row.name} · ${available(row.id) ? level(row.id) ? `Lv. ${level(row.id)}` : "Free" : "Not owned"}</option>`).join("")}</select></div><div class="location-summary"><h3>${selectedLocation().emoji} ${selectedLocation().name} <small>· ${level(locationId) ? `Lv. ${level(locationId)}` : "Free"}</small></h3><p>${cfg.evs.some(v => v < 0) ? "Reduces every stat's EVs." : locationId === "0" ? "Fully upgraded, Home provides the most EXP." : `Train ${stats[+locationId - 1]} EVs and gain EXP.`}</p><div class="gains"><span class="gain${pokemon.level === 100 ? " capped" : ""}">+${exp()} EXP${scenario === "celebi" ? " · Celebi ×2" : ""}${pokemon.level === 100 ? " · Lv. 100" : ""}</span>${cfg.evs.map((v, i) => v ? `<span class="gain${v < 0 ? " reduction" : ""}${d[i] === 0 ? " capped" : ""}">${d[i] ? signed(d[i]) : "0"} ${stats[i]} EV${d[i] === 0 ? v < 0 ? " · At zero" : " · Capped" : ""}</span>` : "").join("")}</div></div>`;
}
function controls() {
  const evSummary = gainedEvs.map((value, i) => value ? `${signed(value)} ${stats[i]}` : "").filter(Boolean).join(", ") || "0";
  const blocked = unresolved || stale || rejected || !canTrain();
  const status = running || pending ? "Training…" : "";
  return `<div class="training-controls"><div class="action-line"><button class="ui-button ui-button--primary train-button" data-action="train" ${!running && (blocked || pending) ? "disabled" : ""}>${running ? "Stop" : pending ? "Stopping…" : "Train"}</button><p class="train-status" role="status">${status}</p></div><div class="session"><span>EXP <strong>+${gainedExp.toLocaleString()}</strong></span><span>EVs <strong>${evSummary}</strong></span></div></div>`;
}
function render() {
  const focused = document.activeElement?.dataset?.action;
  const title = `<a href="${escape(safeReturnUrl.href)}" class="back-link" data-action="back">‹ Pokémon</a><div class="page-title"><h1>Train</h1></div>`;
  if (["loading", "load-error", "empty"].includes(scenario)) {
    const body = scenario === "loading" ? '<h2>Loading training…</h2><div class="empty-line"></div><div class="empty-line"></div>' : scenario === "load-error" ? '<h2>Couldn’t load training.</h2><p>Try loading your Pokémon and locations again.</p><button class="ui-button" data-action="reload">Try again</button>' : '<h2>No Pokémon to train.</h2><p>Your owned Pokémon will appear here.</p><button class="ui-button" data-shell="Catch">Go to Catch</button>';
    page.innerHTML = title + `<section class="ui-panel state-panel" ${scenario === "loading" ? 'aria-busy="true"' : ""}>${body}</section>`;
    return;
  }
  const d = delta();
  page.innerHTML = title + notice() + `<div class="training-layout">${locations()}<section class="ui-panel pokemon-panel" aria-label="Train selected Pokémon">${identity()}<p class="exp-label">EXP <span>${pokemon.level === 100 ? "Maximum level" : `${pokemon.progress.toLocaleString()} / ${pokemon.required.toLocaleString()} to Lv. ${pokemon.level + 1}`}</span></p><div class="exp-meter" role="meter" aria-label="Level progress" aria-valuemin="0" aria-valuemax="${pokemon.required}" aria-valuenow="${pokemon.level === 100 ? pokemon.required : pokemon.progress}"><i style="width:${pokemon.level === 100 ? 100 : 100 * pokemon.progress / pokemon.required}%"></i></div>${summary()}<div class="ev-title"><h3>Effort values</h3><small>${pokemon.evs.reduce((a, b) => a + b, 0)} / 510 total · 252 per stat</small></div><table class="ev-table"><thead><tr><th>Stat</th><th></th><td>EVs</td><td>Next</td></tr></thead><tbody>${stats.map((name, i) => `<tr class="${config().evs[i] ? "affected" : ""}${d[i] < 0 ? " reducing" : ""}"><th>${name}</th><td class="ev-meter"><div><i style="width:${pokemon.evs[i] / 252 * 100}%"></i></div></td><td>${pokemon.evs[i]} / 252</td><td>${d[i] ? signed(d[i]) : "—"}</td></tr>`).join("")}</tbody></table>${controls()}</section></div>`;
  // Preserve keyboard position while the fixture refreshes.
  if (focused) page.querySelector(`[data-action="${focused}"]`)?.focus({ preventScroll: true });
}
function schedule() { timer = setTimeout(sendTraining, 1000); }
function sendTraining() {
  if (!running || pending) return;
  if (!canTrain()) { stop(); return; }
  pending = true;
  render();
  requestTimer = setTimeout(() => {
    const d = delta(), earned = exp();
    pokemon.evs = pokemon.evs.map((value, i) => value + d[i]);
    gainedEvs = gainedEvs.map((value, i) => value + d[i]);
    gainedExp += earned;
    trainerGainsCount += 1;
    document.querySelector("#money").textContent = (12480 + trainerGainsCount * 50).toLocaleString();
    // Illustrative level meter. Production must consume server-derived progress.
    if (pokemon.level < 100) {
      pokemon.progress += earned;
      while (pokemon.progress >= pokemon.required && pokemon.level < 100) { pokemon.progress -= pokemon.required; pokemon.level += 1; }
    }
    pending = false;
    if (!canTrain()) running = false;
    else if (running) schedule();
    render();
  }, scenario === "slow" ? 2300 : 0);
}
function stop() { clearTimeout(timer); running = false; render(); }
function returnToCollection() {
  clearTimeout(timer);
  running = false;
  if (returnTo && document.referrer === safeReturnUrl.href) window.history.back();
  else window.location.assign(safeReturnUrl.href);
}
document.addEventListener("click", event => {
  const target = event.target.closest("button,a");
  if (!target || target.disabled) return;
  if (target.dataset.shell) {
    event.preventDefault();
    if (target.dataset.shell === "Pokémon") { returnToCollection(); return; }
    stop();
    document.querySelector("#boundary-title").textContent = target.dataset.shell;
    document.querySelector("#boundary").showModal(); return;
  }
  if (target.dataset.location) { locationId = target.dataset.location; rejected = false; render(); return; }
  switch (target.dataset.action) {
    case "back": event.preventDefault(); returnToCollection(); break;
    case "train": if (running) stop(); else if (canTrain() && !unresolved && !stale && !rejected && !pending) { running = true; schedule(); render(); } break;
    case "refresh": unresolved = false; stale = false; render(); break;
    case "reload": scenario = "ready"; render(); break;
  }
});
document.addEventListener("change", event => { if (event.target.id === "location") { locationId = event.target.value; rejected = false; render(); } });
document.addEventListener("visibilitychange", () => { if (document.hidden && running) stop(); });
window.addEventListener("pagehide", () => { clearTimeout(timer); clearTimeout(requestTimer); running = false; });
render();
if (scenario === "running") { running = true; schedule(); render(); }
