// Design-only interactions. No gameplay requests, rewards or persistence.
import { loadSpriteOffset } from '../owned-collection/sprite-layout.js';

const params = new URLSearchParams(location.search);
let scenario = params.get('state') || 'ready';
let tab = ['tower', 'continue', 'dungeons'].includes(params.get('tab')) ? params.get('tab') : 'dungeons';
let detail = params.get('detail') !== '0';
let dungeonId = params.get('dungeon') || (scenario === 'long' ? 'mountCoronet' : 'mindTemple');
let difficultyId = params.get('difficulty') || '';
let floorStage = Number(params.get('floor')) || 0;
let partyOpen = false;
let chosenMember = null;
const page = document.querySelector('#page');
const { dungeons, floors } = playModeFixtures;
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const picture = (src, name, cls = '') => src ? `<img src="${escape(src)}" alt="${escape(name)}" class="${cls}" loading="lazy">` : '<span class="trainer-fallback" aria-label="Art unavailable">?</span>';
const levelSpan = (min, max) => min === max ? `Lv. ${min}` : `Lv. ${min}–${max}`;
const progress = () => scenario === 'first-floor' ? 0 : scenario === 'tower-clear' ? floors.length : 6;
const nextStage = () => progress() < floors.length ? progress() + 1 : null;
const partyMembers = () => scenario === 'empty-party' ? [] : pokemonFixtures.slice(0, 6);
const locked = () => scenario === 'pending';
const partyBlocked = () => ['empty-party', 'invalid-party'].includes(scenario);
const getDungeon = () => dungeons.find(dungeon => dungeon.id === dungeonId) || dungeons[0];
const getDifficulty = () => getDungeon().difficulties.find(item => item.id === difficultyId) || getDungeon().difficulties[0];
const getFloor = () => floors.find(floor => floor.stage === floorStage) || floors.find(floor => floor.stage === nextStage()) || floors.at(-1);

const nav = [['play', 'Play', '⚔'], ['pokemon', 'Pokémon', '◈'], ['catch', 'Catch', '◎'], ['rewards', 'Rewards', '♜'], ['more', 'More', '•••']];
document.querySelector('#navigation').innerHTML = nav.map(([id, label, icon]) => `<a href="#${id}" ${id === 'play' ? 'aria-current="page" data-play' : `data-boundary="${label}"`}><span aria-hidden="true">${icon}</span>${label}<span class="nav-arrow" aria-hidden="true">›</span></a>`).join('');

function battles() {
  if (scenario === 'no-ongoing') return [];
  const list = [
    { id: 'trainer', name: 'Blue', detail: 'Easy', turn: 4, updated: '2 min ago', sprite: '' },
    { id: 'dungeon', name: 'Mind Temple', detail: 'Hard', turn: 6, updated: '8 min ago', sprite: dungeons[0].sprite },
  ];
  if (scenario === 'floor-open') {
    const floor = floors.find(item => item.stage === nextStage());
    list.unshift({ id: 'tower', name: 'Battle Tower', detail: `Floor ${floor.stage}`, turn: 3, updated: '1 min ago', sprite: floor.sprite });
  }
  if (scenario === 'started') {
    const started = tab === 'tower'
      ? { id: 'started', name: 'Battle Tower', detail: `Floor ${getFloor().stage}`, turn: 1, updated: 'Just now', sprite: getFloor().sprite }
      : { id: 'started', name: getDungeon().displayName, detail: getDifficulty().name, turn: 1, updated: 'Just now', sprite: getDungeon().sprite };
    list.unshift(started);
  }
  return list;
}

function tabs() {
  const count = battles().length;
  const current = name => tab === name ? 'aria-current="page"' : '';
  return `<nav class="subnav" aria-label="Play views">${count ? `<button type="button" data-tab="continue" ${current('continue')}>Continue <span class="tab-count">${count}</span></button>` : ''}<button type="button" data-boundary="Trainer battles">Trainer battles</button><button type="button" data-tab="dungeons" ${current('dungeons')}>Dungeons</button><button type="button" data-tab="tower" ${current('tower')}>Battle Tower</button></nav>`;
}

function notice() {
  const messages = {
    'empty-party': ['Add a Pokémon to your party to start.', 'Edit party', 'party'],
    'invalid-party': ['Your party has a Pokémon that can’t battle.', 'Edit party', 'party'],
    stale: ['Couldn’t refresh your progress. This list is the last one loaded.', 'Refresh', 'refresh'],
    failed: ['Couldn’t start this battle. Your request wasn’t accepted.', 'Dismiss', 'dismiss'],
    'start-error': ['Couldn’t confirm the start. Your battle may have started.', 'Continue', 'view-ongoing'],
    pending: ['Starting your battle…', '', ''],
    started: ['Your battle is ready.', 'Open battle', 'continue'],
  };
  const value = messages[scenario];
  if (!value) return '';
  return `<div class="callout ${scenario === 'failed' || scenario === 'invalid-party' ? 'error-state' : ''}" role="${['pending', 'started'].includes(scenario) ? 'status' : 'alert'}"><p>${value[0]}</p>${value[1] ? `<button type="button" class="secondary" data-action="${value[2]}">${value[1]}</button>` : ''}</div>`;
}

function iconFile(icon) {
  return `../../../web/public/images/${icon.includes('/') ? icon : `items/${icon}`}`;
}
function rewards(items) {
  const rows = items.map(item => `<div class="reward-item">${item.icon ? picture(iconFile(item.icon), '', 'item-icon') : `<span class="reward-mark" aria-hidden="true">${item.kind === 'money' ? '▱' : '◆'}</span>`}<span class="reward-count">${item.count.toLocaleString()}</span><span>${escape(item.name)}</span></div>`).join('');
  return `<section class="daily-reward" aria-label="Clear reward"><header><h3 class="section-title">Clear reward</h3></header>${rows}</section>`;
}

function speciesTiles(species, aceId = null) {
  return species.map(pokemon => {
    const ace = pokemon.id === aceId;
    const count = pokemon.count > 1 ? ` ×${pokemon.count}` : '';
    const boss = pokemon.boss ? ', Boss' : '';
    const level = pokemon.level ? `, level ${pokemon.level}` : '';
    return `<li class="species-tile ${ace ? 'is-ace' : ''} ${pokemon.boss ? 'is-boss' : ''}" title="${escape(pokemon.name)}${count}">${picture(pokemon.sprite, `${pokemon.name}${count}${level}${ace ? ', Ace' : ''}${boss}`)}${pokemon.boss ? '<span class="boss-tag" aria-hidden="true">Boss</span>' : ''}${ace ? '<span class="ace-tag" aria-hidden="true">Ace</span>' : ''}${pokemon.count > 1 ? `<span class="species-count" aria-hidden="true">×${pokemon.count}</span>` : ''}</li>`;
  }).join('');
}

function partyField() {
  const members = partyMembers();
  const slots = [0, 1, null, null, 2, 3, null, null, 4, 5, null, null];
  return `<div class="collection-workspace"><div class="collection-formation" style="--rows:3;--cols:4">${slots.map((memberIndex, index) => {
    const member = memberIndex === null ? null : members[memberIndex];
    return `<button type="button" class="collection-slot" style="--row:${Math.floor(index / 4)};--col:${index % 4}" ${member ? `data-member="${member.id}"` : 'disabled'} aria-label="Position ${index + 1}, ${escape(member?.name || 'empty')}">${member ? `<span class="collection-slot-name">${escape(member.name)}</span><small>Lv. ${member.level}</small><span class="collection-party-sprite">${picture(member.sprite, '', 'party-sprite')}</span>` : '<span class="collection-empty-slot">—</span>'}<span class="collection-slot-number">${index + 1}</span></button>`;
  }).join('')}</div></div>${chosenMember ? `<div class="member-preview">${escape(chosenMember.name)} · Lv. ${chosenMember.level}<br>CP ${chosenMember.power.toLocaleString()}<br><a href="#pokemon" data-boundary="Pokémon">Inspect in Pokémon →</a></div>` : ''}`;
}

function partySection(popout = false) {
  const count = partyMembers().length;
  return `${popout ? '<dialog id="party-panel" class="party-popout" aria-labelledby="party-title">' : '<aside class="panel party-preview">'}${`<header class="panel-head"><h2 ${popout ? 'id="party-title"' : ''}>Your party <small>${count}/6</small></h2>${popout ? '<button type="button" class="party-close" data-action="close-party" aria-label="Close party">×</button>' : ''}</header><div class="party-info"><span>Formation</span><b><span class="party-desktop-direction">Faces right →</span><span class="party-phone-direction">Front row at top</span></b></div>${partyField()}<a href="#pokemon" class="secondary party-edit" data-boundary="Edit party">Edit party →</a>`}${popout ? '</dialog>' : '</aside>'}`;
}

function startBar(label, action, disabled, busy = false) {
  const count = partyMembers().length;
  return `<footer class="start-bar"><button type="button" class="party-trigger secondary" data-action="open-party" aria-haspopup="dialog" aria-expanded="${partyOpen}">Your party <span>${count}/6 <span aria-hidden="true">↗</span></span></button><button type="button" class="primary-button" ${action ? `data-action="${action}"` : ''} ${disabled ? 'disabled' : ''} ${busy ? 'aria-busy="true"' : ''}>${escape(label)}<span aria-hidden="true">⚔</span></button></footer>`;
}

function dungeonAction() {
  if (scenario === 'pending') return ['Starting battle…', '', true, true];
  if (scenario === 'started') return ['Open battle', 'continue', false, false];
  if (partyBlocked()) return ['Prepare your party', '', true, false];
  return ['Start dungeon', 'start', ['loading', 'error'].includes(scenario), false];
}

function towerAction(floor) {
  const next = nextStage();
  if (scenario === 'pending') return ['Starting battle…', '', true, true];
  if (scenario === 'started') return ['Open battle', 'continue', false, false];
  if (!next) return ['Tower complete', '', true, false];
  if (floor.stage < next) return ['Cleared', '', true, false];
  if (floor.stage > next) return [`Clear floor ${next} first`, '', true, false];
  if (partyBlocked()) return ['Prepare your party', '', true, false];
  if (scenario === 'floor-open') return ['Continue floor', 'continue', false, false];
  return [`Start floor ${floor.stage}`, 'start', ['loading', 'error'].includes(scenario), false];
}

function dungeonPanel() {
  const dungeon = getDungeon();
  const data = getDifficulty();
  const [label, action, disabled, busy] = dungeonAction();
  const art = scenario === 'long' ? '' : dungeon.sprite;
  return `<section class="panel encounter-detail" aria-label="Selected dungeon"><header class="encounter-header dungeon-banner${art ? ' has-art' : ''}" data-mode="dungeon">${art ? picture(art, '', 'dungeon-scene') : ''}<div class="dungeon-copy"><h2>${escape(dungeon.displayName)}</h2><p>${escape(dungeon.description)}</p></div></header><div class="encounter-content"><h3 class="section-title">Difficulty</h3><div class="difficulties" aria-label="Difficulty">${dungeon.difficulties.map(item => `<button type="button" data-difficulty="${item.id}" aria-pressed="${item.id === data.id}" ${locked() ? 'disabled' : ''}>${escape(item.name)}</button>`).join('')}</div><div class="facts"><span>Levels <b>${data.minLevel}–${data.maxLevel}</b></span></div><section class="possible-species" aria-label="Pokémon"><h3 class="section-title">Pokémon</h3><ul class="species-strip" tabindex="0" aria-label="Pokémon. Bosses have a red border.">${speciesTiles(data.species)}</ul></section>${rewards(data.rewards)}</div>${startBar(label, action, disabled, busy)}</section>`;
}

function subtitle(dungeon) {
  const label = dungeon.subtitle;
  if (!label) return '';
  const icon = label.icon ? `<img src="${escape(iconFile(label.icon))}" alt="" class="item-icon">` : '';
  return `<small class="row-subtitle">${icon}<span>${escape(label.text)}</span></small>`;
}
function dungeonRows() {
  return dungeons.map(dungeon => {
    const thumb = scenario === 'long' && dungeon.id === 'mountCoronet' ? '' : dungeon.bosses[0]?.sprite;
    return `<button type="button" class="trainer-row" data-dungeon="${dungeon.id}" aria-pressed="${dungeon.id === getDungeon().id}" ${locked() ? 'disabled' : ''}>${picture(thumb, dungeon.bosses[0]?.name || '')}<span><strong>${escape(dungeon.displayName)}</strong>${subtitle(dungeon)}</span><b aria-hidden="true">›</b></button>`;
  }).join('');
}

function floorRows() {
  const next = nextStage();
  return floors.map(floor => {
    const progressName = !next || floor.stage < next ? 'cleared' : floor.stage === next ? 'current' : 'locked';
    const flag = progressName === 'cleared' ? 'Cleared' : progressName === 'current' ? 'Next' : 'Locked';
    return `<button type="button" class="trainer-row" data-floor="${floor.stage}" data-progress="${progressName}" aria-pressed="${floor.stage === getFloor().stage}" ${locked() ? 'disabled' : ''}><span class="trainer-fallback" aria-hidden="true">${floor.stage}</span><span><strong>${escape(floor.name)}</strong><small>${levelSpan(floor.fightMin, floor.fightMax)}</small><span class="floor-flag">${flag}</span></span><b aria-hidden="true">›</b></button>`;
  }).join('');
}

function towerPanel() {
  const floor = getFloor();
  const [label, action, disabled, busy] = towerAction(floor);
  const art = scenario === 'long' ? '' : floor.sprite;
  const species = [floor.ace, ...floor.pool.filter(pokemon => pokemon.id !== floor.ace.id)];
  return `<section class="panel encounter-detail" aria-label="Selected floor"><header class="encounter-header" data-mode="tower"><div class="portrait">${picture(art, '')}</div><div><h2>Floor ${floor.stage}: ${escape(floor.name)}</h2><p>“${escape(floor.catchphrase)}”</p></div></header><div class="encounter-content"><div class="facts"><span>${escape(floor.difficultyName)}</span><span><b>${floor.count}</b> Pokémon</span><span>Levels <b>${floor.fightMin}–${floor.fightMax}</b></span></div><section class="possible-species" aria-label="Possible Pokémon"><h3 class="section-title">Possible Pokémon</h3><ul class="species-strip" tabindex="0" aria-label="Possible species. Ace is marked.">${speciesTiles(species, floor.ace.id)}</ul></section>${rewards(floor.rewards)}</div>${startBar(label, action, disabled, busy)}</section>`;
}

function shell(listLabel, listCount, note, rows, detailPanel) {
  const back = tab === 'tower' ? 'All floors' : 'All dungeons';
  return `${detail ? `<button type="button" class="mobile-back" data-action="home">‹ ${back}</button>` : ''}${notice()}${['loading', 'error'].includes(scenario) ? `<section class="panel empty-panel">${scenario === 'loading' ? `<h2>Loading ${tab === 'tower' ? 'the tower' : 'dungeons'}…</h2><div class="loading-line"></div><div class="loading-line"></div>` : `<h2>Couldn’t load ${tab === 'tower' ? 'the tower' : 'dungeons'}.</h2><p>Try refreshing the list.</p><button type="button" class="secondary" data-action="refresh">Try again</button>`}</section>` : `<div class="encounters"><section class="panel trainer-panel" aria-label="${listLabel}"><header class="panel-head"><h2>${listLabel}</h2><small>${listCount}</small></header><p class="mode-note">${note}</p><div class="trainer-rows">${rows}</div></section>${detailPanel}${partySection()}</div>${partySection(true)}`}`;
}

function render() {
  if (!battles().length && tab === 'continue') tab = 'dungeons';
  const showDetail = detail && !['loading', 'error'].includes(scenario);
  page.className = `page-shell ${showDetail ? 'is-detail' : ''}`;
  const next = nextStage();
  const towerNote = next ? `Floor ${next} of ${floors.length} is next. Resets in 9 days.` : `All ${floors.length} floors cleared. Resets in 9 days.`;
  const body = tab === 'continue'
    ? `<section class="panel continue-panel" aria-label="Ongoing battles"><header class="panel-head"><h2>Ongoing battles</h2><small>${battles().length} battles</small></header><div class="continue-list">${battles().map(battle => `<button type="button" class="continue-row" data-action="continue"><span class="battle-portrait">${picture(battle.sprite, '')}</span><span class="battle-summary"><strong>${escape(battle.name)} <small>· ${escape(battle.detail)}</small></strong><small>Turn ${battle.turn} · Updated ${battle.updated}</small></span><span class="continue-arrow" aria-hidden="true">→</span></button>`).join('')}</div></section>`
    : tab === 'tower'
      ? shell('Floors', `${floors.length} floors`, towerNote, floorRows(), towerPanel())
      : shell('Dungeons', `${dungeons.length} dungeons`, 'You can rematch any dungeon.', dungeonRows(), dungeonPanel());
  page.innerHTML = `<div class="play-heading"><h1>Play</h1></div>${tabs()}${body}`;
  wireImages();
  const rows = document.querySelector('.trainer-rows');
  const selectedRow = document.querySelector('.trainer-row[aria-pressed=true]');
  if (rows && selectedRow && matchMedia('(min-width:761px)').matches) rows.scrollTop += selectedRow.getBoundingClientRect().top - rows.getBoundingClientRect().top - 8;
  const dialog = document.querySelector('#party-panel');
  if (dialog) {
    if (partyOpen && matchMedia('(max-width:1190px)').matches) dialog.showModal();
    dialog.addEventListener('close', () => { partyOpen = false; document.querySelector('.party-trigger')?.focus(); });
    dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
  }
}

function wireImages() {
  page.querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
    if (img.classList.contains('party-sprite')) return;
    const fallback = document.createElement('span');
    fallback.className = img.classList.contains('item-icon') ? 'item-icon' : img.classList.contains('dungeon-scene') ? '' : 'trainer-fallback';
    if (img.classList.contains('dungeon-scene')) { img.closest('.dungeon-banner')?.classList.remove('has-art'); img.remove(); return; }
    fallback.textContent = '?';
    fallback.setAttribute('aria-label', 'Art unavailable');
    img.replaceWith(fallback);
  }, { once: true }));
  page.querySelectorAll('.party-sprite').forEach(img => { img.style.scale = '-1 1'; void loadSpriteOffset(img.src).then(offset => { img.style.translate = `${offset.x}% ${offset.y}%`; }); });
}

function boundary(name) {
  const copy = {
    'Trainer battles': 'Trainer battles already has an approved screen. This study does not redraw it.',
    'Edit party': 'This opens the existing Pokémon workspace. The dungeon or floor stays selected when you return.',
    Pokémon: 'Inspection stays in the Pokémon workspace.',
    Battle: 'This opens the existing battle screen. The study stops at that handoff.',
  };
  document.querySelector('#boundary-title').textContent = name;
  document.querySelector('#boundary-copy').textContent = copy[name] || `${name} is outside this study.`;
  document.querySelector('#boundary').showModal();
}

function remember(replace = false) {
  const url = new URL(location.href);
  url.searchParams.set('tab', tab);
  url.searchParams.set('detail', detail ? '1' : '0');
  url.searchParams.set('dungeon', getDungeon().id);
  url.searchParams.set('difficulty', getDifficulty().id);
  url.searchParams.set('floor', String(getFloor().stage));
  history[replace ? 'replaceState' : 'pushState']({}, '', url);
}

function openDetail() {
  detail = true;
  remember();
  render();
  if (matchMedia('(max-width:760px)').matches) { scrollTo(0, 0); document.querySelector('.mobile-back')?.focus(); }
}

document.addEventListener('click', event => {
  const target = event.target.closest('button,a');
  if (!target || target.disabled) return;
  if (target.dataset.boundary) { event.preventDefault(); boundary(target.dataset.boundary); return; }
  if (target.dataset.tab || target.hasAttribute('data-play')) {
    event.preventDefault();
    tab = target.dataset.tab || (battles().length ? 'continue' : 'dungeons');
    detail = tab === 'tower';
    if (tab === 'tower') floorStage = nextStage() || floors.length;
    partyOpen = false;
    remember();
    render();
    document.querySelector(`[data-tab="${tab}"]`)?.focus();
    return;
  }
  if (target.dataset.dungeon) { if (scenario === 'started') scenario = 'ready'; dungeonId = target.dataset.dungeon; difficultyId = getDungeon().difficulties[0].id; openDetail(); return; }
  if (target.dataset.floor) { if (scenario === 'started') scenario = 'ready'; floorStage = Number(target.dataset.floor); openDetail(); return; }
  if (target.dataset.difficulty) { if (scenario === 'started') scenario = 'ready'; difficultyId = target.dataset.difficulty; remember(true); render(); document.querySelector(`[data-difficulty="${difficultyId}"]`)?.focus(); return; }
  if (target.dataset.member) { chosenMember = pokemonFixtures.find(member => member.id === target.dataset.member); render(); return; }
  const action = target.dataset.action;
  if (action === 'home') { detail = false; if (scenario === 'started') scenario = 'ready'; remember(); render(); }
  if (action === 'continue') boundary('Battle');
  if (action === 'party') boundary('Edit party');
  if (action === 'open-party') { partyOpen = true; render(); }
  if (action === 'close-party') document.querySelector('#party-panel')?.close();
  if (action === 'refresh' || action === 'dismiss') { scenario = 'ready'; render(); }
  if (action === 'view-ongoing') { tab = battles().length ? 'continue' : 'dungeons'; detail = false; remember(); render(); }
  if (action === 'start') { scenario = 'pending'; render(); setTimeout(() => { scenario = 'started'; render(); }, 1600); }
});
document.addEventListener('focusin', event => event.target.closest('.subnav button')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }));
window.addEventListener('popstate', () => {
  const next = new URLSearchParams(location.search);
  tab = next.get('tab') || 'dungeons';
  detail = next.get('detail') === '1';
  dungeonId = next.get('dungeon') || dungeonId;
  difficultyId = next.get('difficulty') || difficultyId;
  floorStage = Number(next.get('floor')) || floorStage;
  partyOpen = false;
  render();
});
render();
