// Throwaway UI study. Three layouts for the same Pokémon upgrade tab.
const fixtures = await fetch("/fixtures.json").then(response => response.json());
const page = document.querySelector("#page");
const dialog = document.querySelector("#preview-dialog");
const menu = document.querySelector("#study-menu");
const picker = document.querySelector("#fixture");
const layouts = { split: "Side-by-side", inline: "Inline", dialog: "Preview dialog" };
const layoutKeys = Object.keys(layouts);
const params = new URL(location.href).searchParams;
document.querySelector(".study-tools").hidden = params.get("review") === "0";
let layout = layoutKeys.includes(params.get("variant")) ? params.get("variant") : "split";
let scenario = Object.hasOwn(fixtures, params.get("state")) ? params.get("state") : "eevee";

let fixture, species, money, selected, phase, result, timer, away, dialogOpen;
let showMoves = false;
let onReturnFocus, fixtureBeforeRefresh;
const balance = number => number.toLocaleString("en-US");
const build = () => fixture.builds[species];
const choice = () => build().choices.find(item => item.id === selected);
const locked = item => item.kind === "evolve" && build().current.level < item.level;
const blocked = () => ["pending", "stale", "unknown"].includes(phase);
const label = item => item.kind === "evolve" ? "Evolve" : "Change form";
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]
));

const icons = {
  Play: '<path d="m5 3 14 14-2 2L3 5V3h2Zm14 0L5 17m-2-3 7 7m4-18 7 7m-4-7 4 4"/>',
  Pokémon: '<circle cx="12" cy="12" r="8"/><path d="M4 12h5m6 0h5"/><circle cx="12" cy="12" r="3"/>',
  Catch: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/><circle cx="12" cy="12" r="5"/>',
  Rewards: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  More: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  bag: '<path d="M5 8h14l1 13H4L5 8Zm3 0V6a4 4 0 0 1 8 0v2M8 13h8v5H8z"/>',
  settings: '<path d="m9 3-1 3-3 1-2 2 2 3-1 3 2 2 3-1 2 3h3l1-3 3-1 2-2-2-3 1-3-2-2-3 1-2-3H9Z"/><circle cx="11.5" cy="11.5" r="3"/>',
  money: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 10v4m12-4v4"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
document.querySelector("#navigation").innerHTML = ["Play", "Pokémon", "Catch", "Rewards", "More"].map(name =>
  `<a ${name === "Pokémon" ? 'href="#site-content" data-action="back" aria-current="page"' : ""}>${icon(name)}<span>${name}</span><span class="nav-arrow" aria-hidden="true">›</span></a>`
).join("");
document.querySelectorAll("[data-icon]").forEach(element => { element.innerHTML = icon(element.dataset.icon); });

function art(pokemon, missing = false) {
  return `<span class="pokemon-art">${!missing && pokemon.sprite
    ? `<img src="${escapeHtml(pokemon.sprite)}" alt="" draggable="false">` : ""}
    <span class="art-fallback" aria-hidden="true">?</span></span>`;
}

function types(pokemon) {
  return `<span class="ui-badge-list">${pokemon.types.map(type =>
    `<span class="ui-badge ui-type-badge" data-type="${type.toLowerCase()}">${type}</span>`
  ).join("")}</span>`;
}

function identity(current) {
  const nickname = current.name !== current.species;
  return `<section class="ui-panel current-pokemon" aria-label="Current Pokémon">
    ${art(current, scenario === "long" && species === fixture.start)}
    <div class="current-name"><h2>${escapeHtml(current.name)}</h2>
      <p>${nickname ? `${escapeHtml(current.species)} · ` : ""}Lv. ${current.level}</p>${types(current)}</div>
    <div class="current-power"><small>Combat power</small><strong>${balance(current.power)}</strong></div>
  </section>`;
}

function sectionHeading(items) {
  if (items[0].kind === "evolve") return "Evolutions";
  return "Forms";
}

function option(item, grid = false) {
  const { target } = item;
  const availability = locked(item) ? `Requires Lv. ${item.level}` : "";
  return `<button class="choice ${grid ? "choice-tile" : ""}" data-choice="${item.id}" ${layout === "dialog"
    ? 'aria-haspopup="dialog"' : `aria-pressed="${selected === item.id}"`} ${blocked() ? "disabled" : ""}>
    ${art(target)}<span class="choice-copy"><strong>${escapeHtml(target.species)}</strong>
      ${types(target)}${availability ? `<small class="unavailable">${availability}</small>` : ""}</span>
    ${grid ? "" : '<span class="choice-arrow" aria-hidden="true">›</span>'}
  </button>`;
}

function notice() {
  if (phase === "success") return `<p class="feedback success" role="status" tabindex="-1">${escapeHtml(result)}</p>`;
  if (phase === "refreshed") return '<p class="feedback" role="status" tabindex="-1">Pokémon and money refreshed.</p>';
  if (phase === "failed") return '<p class="feedback rejected" role="alert" tabindex="-1">Couldn’t change this Pokémon. Try again.</p>';
  if (phase === "stale" || phase === "unknown") return `<div class="feedback" role="status" tabindex="-1">
    <p>${phase === "stale" ? "This Pokémon changed elsewhere. Refresh to see its current form and choices."
      : "Couldn’t confirm the change. Refresh your Pokémon and money before trying again."}</p>
    <button class="ui-button" data-action="refresh">Refresh Pokémon &amp; money</button></div>`;
  return "";
}

function comparison(current, item) {
  const { target } = item;
  const names = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
  const delta = (before, after) => {
    const difference = after - before;
    if (!difference) return '<span class="unchanged" aria-label="No change">—</span>';
    return `<span class="${difference > 0 ? "gain" : "loss"}">${difference > 0 ? "+" : "−"}${balance(Math.abs(difference))}</span>`;
  };
  const sameMoves = current.moves.join() === target.moves.join();
  const formBalance = item.kind === "form" ? `<p>Cost <strong>${balance(item.cost)} money</strong><span>Balance ${balance(money)}</span></p>` : "";
  const requirement = locked(item) ? `Reach Lv. ${item.level} to evolve.` : money < item.cost ? `You need ${balance(item.cost - money)} more money.` : "";
  const evolutionTerms = item.kind === "evolve" && !requirement
    ? '<p>No cost<span>Evolution can’t be undone.</span></p>' : "";
  const busyText = item.kind === "evolve" ? "Evolving…" : "Changing form…";
  return `<div class="comparison-body" aria-busy="${phase === "pending"}">
    <div class="target-hero">${art(target)}<div><h3>${escapeHtml(target.species)}</h3>
      ${types(target)}<p>${escapeHtml(current.ability)}${current.ability !== target.ability ? ` <span aria-hidden="true">→</span> <strong>${escapeHtml(target.ability)}</strong>` : ""}</p></div>
    </div>
    <table class="stats">
      <thead><tr><th scope="col">Stats</th><th scope="col">Current</th><th scope="col">After</th><th scope="col">Change</th></tr></thead>
      <tbody>
        <tr class="power-row"><th scope="row">Combat power</th><td>${balance(current.power)}</td><td>${balance(target.power)}</td><td>${delta(current.power, target.power)}</td></tr>
        ${names.map((name, index) => `<tr><th scope="row">${name}</th><td>${balance(current.stats[index])}</td>
          <td>${balance(target.stats[index])}</td><td>${delta(current.stats[index], target.stats[index])}</td></tr>`).join("")}
      </tbody>
    </table>
    <details class="moves" ${showMoves ? "open" : ""}><summary>${sameMoves ? "Moves stay the same" : "Move changes"}</summary>
      <div class="move-lists">
        <div><strong>${sameMoves ? "Moves" : "Current"}</strong><ul>${current.moves.map(move => `<li>${escapeHtml(move)}</li>`).join("")}</ul></div>
        ${sameMoves ? "" : `<div><strong>After</strong><ul>${target.moves.map(move => `<li>${escapeHtml(move)}</li>`).join("")}</ul></div>`}
      </div>
    </details>
    ${layout === "dialog" || phase === "failed" ? notice() : ""}
    <div class="confirm-bar">
      <div class="confirm-cost">${formBalance}${requirement ? `<p class="unavailable">${requirement}</p>` : evolutionTerms}
        ${phase === "pending" ? `<span class="sr-only" role="status" tabindex="-1">${busyText}</span>` : ""}
      </div>
      <button class="ui-button ui-button--primary" data-action="confirm" ${blocked() || requirement ? "disabled" : ""}>
        ${phase === "pending" ? busyText : label(item)}</button>
    </div>
  </div>`;
}

function variantPanel(current, items) {
  const item = choice();
  const heading = sectionHeading(items);
  if (layout === "split") {
    const options = items.map(item => {
      const detail = locked(item) ? ` · requires Lv. ${item.level}` : "";
      return `<option value="${item.id}" ${selected === item.id ? "selected" : ""}>${escapeHtml(item.target.species)}${detail}</option>`;
    }).join("");
    return `<div class="split-layout"><section class="ui-panel choices"><h2 class="ui-panel-heading">${heading}</h2>
      <div class="choice-list">${items.map(item => option(item)).join("")}</div>
      <div class="mobile-chooser"><select class="study-select" id="mobile-choice" aria-label="${heading}" ${blocked() ? "disabled" : ""}>${options}</select></div></section>
      <section class="ui-panel preview"><h2 class="ui-panel-heading">Preview</h2>
        ${item ? comparison(current, item) : '<p class="empty-copy">Choose a Pokémon to preview.</p>'}</section></div>`;
  }
  if (layout === "inline") {
    return `<section class="ui-panel inline-layout"><h2 class="ui-panel-heading">${heading}</h2>
      <div class="inline-grid">${items.map(item => option(item, true)).join("")}</div>
      ${item ? `<section class="inline-preview" aria-label="Preview">${comparison(current, item)}</section>` : ""}</section>`;
  }
  return `<section class="ui-panel dialog-layout"><h2 class="ui-panel-heading">${heading}</h2>
    <div class="inline-grid">${items.map(item => option(item, true)).join("")}</div></section>`;
}

function render(focusSelector) {
  const { current, choices } = build();
  const showDialog = dialogOpen && !away && choice();
  document.querySelector("#money").textContent = balance(money);
  document.querySelector("#variant").textContent = layouts[layout];
  page.classList.toggle("is-away", away);
  if (away) {
    page.innerHTML = `<h1>Your Pokémon</h1>${identity(current)}
      <button class="ui-button" data-action="return">Open Evolution &amp; forms</button>`;
  } else {
    const state = phase === "loading" ? '<section class="ui-panel empty-copy" role="status">Loading Pokémon…</section>'
      : phase === "load-error" ? `<section class="ui-panel empty-copy" role="alert">
        <p>Couldn’t load this Pokémon.</p><button class="ui-button" data-action="refresh">Try again</button></section>`
      : `${identity(current)}${!showDialog && (phase !== "failed" || layout === "dialog") ? notice() : ""}
        ${choices.length ? variantPanel(current, choices) : `<section class="ui-panel empty-copy"><h2>No evolutions or forms</h2>
          <p>${escapeHtml(current.species)} has no available evolutions or alternate forms.</p></section>`}`;
    page.innerHTML = `<section class="pokemon-upgrade-workspace">
      <button class="page-back upgrade-back" data-action="back"><span aria-hidden="true">←</span> Pokémon</button>
      <h1 tabindex="-1">Evolution &amp; forms</h1>
      <div class="pokemon-upgrade-tabs" role="tablist" aria-label="Pokémon upgrades">
        <button class="ui-button" role="tab" aria-selected="false" disabled>Train</button>
        <button class="ui-button" role="tab" aria-selected="false" disabled>Item &amp; nature</button>
        <button class="ui-button" role="tab" aria-selected="false" disabled>Equipment</button>
        <button class="ui-button" role="tab" id="evolution-tab" aria-selected="true" aria-controls="evolution-panel">Evolution &amp; forms</button>
      </div>
      <div id="evolution-panel" role="tabpanel" aria-labelledby="evolution-tab">${state}</div>
    </section>`;
  }

  if (showDialog) {
    const alreadyOpen = dialog.open;
    dialog.innerHTML = `<header class="ui-panel-heading"><h2 id="dialog-heading" tabindex="-1">Preview</h2>
      <button class="ui-button ui-button--icon" data-action="close" aria-label="Close preview">×</button></header>
      ${comparison(current, choice())}`;
    if (!alreadyOpen) dialog.showModal();
    (focusSelector && dialog.querySelector(focusSelector) || dialog.querySelector("#dialog-heading")).focus({ preventScroll: true });
  } else {
    if (dialog.open) dialog.close();
    if (focusSelector) page.querySelector(focusSelector)?.focus();
  }
  document.querySelectorAll(".pokemon-art img").forEach(img => {
    if (img.complete && !img.naturalWidth) img.remove();
    else img.addEventListener("error", () => img.remove(), { once: true });
  });
  document.querySelector(".moves")?.addEventListener("toggle", event => {
    showMoves = event.target.open;
  });
}

function reset(focus) {
  clearTimeout(timer);
  fixture = fixtures[scenario];
  species = fixture.start;
  money = fixture.money ?? 12480;
  selected = build().choices[0]?.id;
  phase = ["loading", "load-error"].includes(scenario) ? scenario : "ready";
  result = null;
  away = dialogOpen = showMoves = false;
  picker.value = scenario;
  render(focus);
  if (phase === "loading") timer = setTimeout(() => { phase = "ready"; render(); }, 2200);
}

function writeUrl() {
  const url = new URL(location.href);
  url.searchParams.set("variant", layout);
  url.searchParams.set("state", scenario);
  history.replaceState(null, "", url);
}

function cycle(offset) {
  const index = (layoutKeys.indexOf(layout) + offset + layoutKeys.length) % layoutKeys.length;
  layout = layoutKeys[index];
  dialogOpen = false;
  writeUrl();
  render();
}

function choose(id, focusSelector = `[data-choice="${id}"]`) {
  if (blocked()) return;
  selected = id;
  showMoves = false;
  if (phase === "failed" || phase === "success" || phase === "refreshed") phase = "ready";
  if (layout === "dialog") {
    onReturnFocus = `[data-choice="${id}"]`;
    dialogOpen = true;
    render();
  } else {
    render(focusSelector);
  }
}

function confirm() {
  const item = choice();
  if (!item || locked(item) || money < item.cost || blocked()) return;
  const { current } = build();
  phase = "pending";
  render(".confirm-cost [role=status]");
  timer = setTimeout(() => {
    if (scenario === "stale") {
      phase = "stale";
      dialogOpen = false;
      render(".feedback");
      return;
    }
    if (scenario === "failed") {
      phase = "failed";
      render(".feedback");
      return;
    }
    money -= item.cost;
    species = item.id;
    selected = build().choices[0]?.id;
    showMoves = dialogOpen = false;
    if (scenario === "unknown") {
      // Simulate a committed write with a missing reply. Refresh reveals the new snapshot.
      fixtureBeforeRefresh = { money, species };
      money += item.cost;
      species = current.id;
      selected = item.id;
      phase = "unknown";
    } else {
      result = item.kind === "evolve"
        ? `${current.name} evolved into ${item.target.species}!`
        : `${current.name} changed form to ${item.target.species}!`;
      phase = "success";
    }
    render(".feedback");
  }, scenario === "slow" ? 2200 : 650);
}

function refresh() {
  if (phase === "unknown") ({ money, species } = fixtureBeforeRefresh);
  if (phase === "stale") {
    species = species === "479" ? "10009" : "479";
    money -= build().choices[0].cost;
  }
  phase = ["loading", "load-error"].includes(phase) ? "ready" : "refreshed";
  selected = build().choices[0]?.id;
  showMoves = dialogOpen = false;
  render(".feedback, h1");
}

function closePreview() {
  dialogOpen = false;
  render(blocked() ? ".feedback, h1" : onReturnFocus);
}

document.addEventListener("click", event => {
  const button = event.target.closest("[data-action], [data-choice]");
  if (!button) return;
  event.preventDefault();
  if (button.dataset.choice) choose(button.dataset.choice);
  const action = button.dataset.action;
  if (action === "confirm") confirm();
  if (action === "refresh") refresh();
  if (action === "close") closePreview();
  if (action === "back" || action === "return") {
    away = action === "back";
    dialogOpen = false;
    render(away ? '[data-action="return"]' : "h1");
  }
});
page.addEventListener("change", event => {
  if (event.target.id === "mobile-choice") choose(event.target.value, "#mobile-choice");
});
dialog.addEventListener("cancel", event => { event.preventDefault(); closePreview(); });
picker.addEventListener("change", () => {
  scenario = picker.value;
  writeUrl();
  reset("h1");
  menu.open = false;
});
document.querySelector("#reset").addEventListener("click", () => { reset("h1"); menu.open = false; });
document.querySelector("#variant-prev").addEventListener("click", () => cycle(-1));
document.querySelector("#variant-next").addEventListener("click", () => cycle(1));
document.addEventListener("keydown", event => {
  if (dialog.open || event.target.closest("select, input, textarea, [contenteditable]")) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    cycle(event.key === "ArrowLeft" ? -1 : 1);
  }
});
reset();
