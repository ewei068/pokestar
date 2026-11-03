// Design-only interactions; no gameplay requests, rewards or persistence.
import { loadSpriteOffset } from '../owned-collection/sprite-layout.js';
const params = new URLSearchParams(location.search);
let scenario = params.get('state') || 'ready';
let selected = params.get('npc') || (scenario === 'long' ? 'volo' : 'blue');
let difficulty = params.get('difficulty') || 'easy';
let detail = params.get('screen') === 'detail';
let activeTab = ['browse','detail'].includes(params.get('screen')) ? 'trainers' : 'continue';
let search = '';
let partyOpen = false;
let chosenMember = null;
const page = document.querySelector('#page');
const escape = value => String(value).replace(/[&<>"']/g, value => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[value]));
const locked = () => scenario === 'pending';
const blocked = () => ['loading','error','empty','pending','unavailable','empty-party','invalid-party'].includes(scenario);
const getNpc = () => npcFixtures.find(npc => npc.id === selected) || npcFixtures[0];
const getDifficulty = () => getNpc().difficulties.find(item => item.id === difficulty) || getNpc().difficulties[0];
const partyMembers = () => scenario === 'empty-party' ? [] : pokemonFixtures.slice(0,6);
const nav = [['play','Play','⚔'],['pokemon','Pokémon','◈'],['catch','Catch','◎'],['rewards','Rewards','♜'],['more','More','•••']];
document.querySelector('#navigation').innerHTML = nav.map(([id,label,icon]) => `<a href="#${id}" ${id === 'play' ? 'aria-current="page" data-play' : `data-boundary="${label}"`}><span aria-hidden="true">${icon}</span>${label}<span class="nav-arrow" aria-hidden="true">›</span></a>`).join('');
function picture(src, name, cls = '') {
  return `<img src="${escape(src)}" alt="${escape(name)}" class="${cls}" loading="lazy">`;
}
function activeBattles() {
  if (scenario === 'no-ongoing') return [];
  const battles = [
    {id:'cynthia',name:'Cynthia',difficulty:'Hard',turn:8,updated:'2 min ago',sprite:npcFixtures.find(n=>n.id==='cynthia').sprite},
    {id:'blue',name:'Blue',difficulty:'Easy',turn:1,updated:'5 min ago',sprite:npcFixtures.find(n=>n.id==='blue').sprite},
    {id:'pvp',name:'PvP battle',difficulty:null,turn:12,updated:'10 min ago',sprite:null},
  ];
  if (scenario === 'started') battles.unshift({id:'started',name:getNpc().name,difficulty:getDifficulty().name,turn:1,updated:'Just now',sprite:getNpc().sprite});
  return battles;
}
function tabs() {
  const count = activeBattles().length;
  return `<nav class="subnav" aria-label="Play views">${count ? `<button type="button" data-tab="continue" ${activeTab === 'continue' ? 'aria-current="page"' : ''}>Continue <span class="tab-count">${count}</span></button>` : ''}<button type="button" data-tab="trainers" ${activeTab === 'trainers' ? 'aria-current="page"' : ''}>Trainer battles</button><button type="button" data-boundary="Dungeons">Dungeons<small>Later</small></button><button type="button" data-boundary="Battle Tower">Battle Tower<small>Later</small></button></nav>`;
}
function continuePanel() {
  return `<section class="panel continue-panel" aria-label="Ongoing battles"><header class="panel-head"><h2>Ongoing battles</h2><small>${activeBattles().length} battles</small></header><div class="continue-list">${activeBattles().map(battle => `<button type="button" class="continue-row" data-action="continue" data-battle-id="${battle.id}"><span class="battle-portrait">${battle.sprite ? picture(battle.sprite,'') : '<span aria-hidden="true">⚔</span>'}</span><span class="battle-summary"><strong>${escape(battle.name)}${battle.difficulty ? ` <small>· ${escape(battle.difficulty)}</small>` : ''}</strong><small>Turn ${battle.turn} · Updated ${battle.updated}</small></span><span class="continue-arrow" aria-hidden="true">→</span></button>`).join('')}</div></section>`;
}
function partyField() {
  const members = partyMembers();
  return `<div class="collection-workspace"><div class="collection-formation" style="--rows:3;--cols:4">${Array.from({length:12},(_,index) => {
    const member = members[[0,1,null,null,2,3,null,null,4,5,null,null][index]];
    return `<button type="button" class="collection-slot" style="--row:${Math.floor(index/4)};--col:${index%4}" ${member ? `data-member="${member.id}"` : 'disabled'} aria-label="Position ${index+1}, ${escape(member?.name || 'empty')}">${member ? `<span class="collection-slot-name">${escape(member.name)}</span><small>Lv. ${member.level}</small><span class="collection-party-sprite">${picture(member.sprite,'','party-sprite')}</span>` : '<span class="collection-empty-slot">—</span>'}<span class="collection-slot-number">${index+1}</span></button>`;
  }).join('')}</div></div>${chosenMember ? `<div class="member-preview">${escape(chosenMember.name)} · Lv. ${chosenMember.level}<br>CP ${chosenMember.power.toLocaleString()}<br><a href="#pokemon" data-boundary="Pokémon">Inspect in Pokémon →</a></div>` : ''}`;
}
function partySection(popout = false) {
  const count = partyMembers().length;
  const header = `<header class="panel-head"><h2 ${popout ? 'id="party-title"' : ''}>Your party <small>${count}/6</small></h2>${popout ? '<button type="button" class="party-close" data-action="close-party" aria-label="Close party">×</button>' : ''}</header>`;
  const body = `${header}<div class="party-info"><span>Formation</span><b><span class="party-desktop-direction">Faces right →</span><span class="party-phone-direction">Front row at top</span></b></div>${partyField()}<a href="#pokemon" class="secondary party-edit" data-boundary="Edit party">Edit party →</a>`;
  return popout ? `<dialog id="party-panel" class="party-popout" aria-labelledby="party-title">${body}</dialog>` : `<aside class="panel party-preview">${body}</aside>`;
}
function speciesStrip(data) {
  const species = [...new Map([data.ace,...data.pool].map(pokemon => [pokemon.id,pokemon])).values()];
  return `<section class="possible-species" aria-label="Possible Pokémon"><h3 class="section-title">Possible Pokémon</h3><ul class="species-strip" tabindex="0" aria-label="Possible species, scroll horizontally. Ace is marked with a red border.">${species.map(pokemon => `<li class="species-tile ${pokemon.id === data.ace.id ? 'is-ace' : ''}" title="${escape(pokemon.name)}${pokemon.id === data.ace.id ? ` · Ace · Lv. ${data.maxLevel+1}` : ''}">${picture(pokemon.sprite,`${pokemon.name}${pokemon.id === data.ace.id ? `, Ace, level ${data.maxLevel+1}` : ''}`)}${pokemon.id === data.ace.id ? '<span class="ace-tag" aria-hidden="true">Ace</span>' : ''}</li>`).join('')}</ul></section>`;
}
function dailySummary(data) {
  const unavailable = ['claimed','settled'].includes(scenario);
  const status = !data.dailyRewards ? 'None' : scenario === 'result-pending' ? 'Updating…' : unavailable ? 'Already claimed' : '';
  return `<section class="daily-reward" aria-label="Daily Reward"><header><h3 class="section-title">Daily Reward</h3>${status ? `<small>${status}</small>` : ''}</header>${data.rewardItems.map(item => `<div class="reward-item">${item.icon ? picture(`../../../web/public/images/items/${item.icon}`,'','item-icon') : '<span class="item-icon" aria-hidden="true">◆</span>'}<span class="reward-count">${item.count}</span><span>${escape(item.name)}</span></div>`).join('')}</section>`;
}
function statusNotice() {
  const messages = {
    'empty-party':['Add a Pokémon to your party to start.','Edit party','party'],
    'invalid-party':['Your party has a Pokémon that can’t battle. Edit your party, then refresh.','Edit party','party'],
    stale:['Couldn’t refresh your party and rewards.','Refresh','refresh'],
    failed:['Couldn’t start this battle. Your request wasn’t accepted.','Dismiss','dismiss'],
    'start-error':['Couldn’t confirm the start. Your battle may have started.','Continue','view-ongoing'],
    pending:['Starting your battle…','',''],
    started:['Your battle is ready.','Open battle','continue'],
    unavailable:['This trainer or difficulty is no longer available. Choose another.','Choose trainer','home'],
    settled:['Daily reward updated.','',''],
    'result-pending':['Battle finished. Rewards are still being settled.','Open battle','continue'],
  };
  const value = messages[scenario];
  return value ? `<div class="callout ${['failed','invalid-party'].includes(scenario) ? 'error-state' : ''}" role="${['pending','started','settled'].includes(scenario) ? 'status' : 'alert'}"><p>${value[0]}</p>${value[1] ? `<button type="button" class="secondary" data-action="${value[2]}">${value[1]}</button>` : ''}</div>` : '';
}
function detailPanel() {
  const npc = getNpc(), data = getDifficulty();
  let label = 'Start battle';
  if (scenario === 'pending') label = 'Starting battle…';
  if (scenario === 'started') label = 'Open battle';
  if (['empty-party','invalid-party'].includes(scenario)) label = 'Prepare your party';
  if (scenario === 'unavailable') label = 'Choose another trainer';
  return `<section class="panel encounter-detail" aria-label="Selected trainer"><header class="encounter-header"><div class="portrait">${scenario === 'long' ? '<span class="trainer-fallback" aria-label="Trainer art unavailable">V</span>' : picture(npc.sprite,'')}</div><div><h2>${escape(npc.displayName)}</h2><p>“${escape(npc.catchphrase)}”</p></div></header><div class="encounter-content"><h3 class="section-title">Difficulty</h3><div class="difficulties" aria-label="Difficulty">${npc.difficulties.map(item => `<button type="button" data-difficulty="${item.id}" aria-pressed="${item.id === data.id}" ${locked() ? 'disabled' : ''}>${escape(item.name)}</button>`).join('')}</div><div class="facts"><span><b>${data.count}</b> Pokémon</span><span>Levels <b>${data.minLevel}–${data.maxLevel+1}</b></span></div>${speciesStrip(data)}${dailySummary(data)}</div><footer class="start-bar"><button type="button" class="party-trigger secondary" data-action="open-party" aria-haspopup="dialog" aria-expanded="${partyOpen}">Your party <span>${partyMembers().length}/6 <span aria-hidden="true">↗</span></span></button><button type="button" class="primary-button" data-action="${scenario === 'started' ? 'continue' : 'start'}" ${blocked() ? 'disabled' : ''} ${scenario === 'pending' ? 'aria-busy="true"' : ''}>${label}<span aria-hidden="true">⚔</span></button></footer></section>`;
}
function catalogRows() {
  const filtered = npcFixtures.filter(npc => `${npc.name} ${npc.displayName}`.toLowerCase().includes(search.toLowerCase()));
  return filtered.length ? filtered.map(npc => {
    const low = Math.min(...npc.difficulties.map(d => d.minLevel));
    const high = Math.max(...npc.difficulties.map(d => d.maxLevel+1));
    return `<button type="button" class="trainer-row" data-npc="${npc.id}" aria-pressed="${npc.id === selected}" ${locked() ? 'disabled' : ''}>${picture(npc.sprite,'')}<span><strong>${escape(npc.displayName)}</strong><small>Lv. ${low}–${high}</small></span><b aria-hidden="true">›</b></button>`;
  }).join('') : '<div class="empty-panel">No matching trainers.<br>Try another name.</div>';
}
function render() {
  const initial = ['loading','error','empty'].includes(scenario);
  if (!activeBattles().length && activeTab === 'continue') activeTab = 'trainers';
  page.className = `page-shell ${activeTab === 'trainers' && detail && !initial ? 'is-detail' : ''}`;
  const trainerContent = `${detail ? '<button type="button" class="mobile-back" data-action="home">‹ All trainers</button>' : ''}${statusNotice()}${initial ? `<section class="panel empty-panel">${scenario === 'loading' ? '<h2>Loading trainers…</h2><div class="loading-line"></div><div class="loading-line"></div><div class="loading-line"></div>' : scenario === 'error' ? '<h2>Couldn’t load trainers.</h2><p>Try refreshing the list.</p><button type="button" class="secondary" data-action="refresh">Try again</button>' : '<h2>No trainers available.</h2><p>Check again later, or use Continue for ongoing battles.</p>'}</section>` : `<div class="encounters"><section class="panel trainer-panel" aria-label="Trainers"><header class="panel-head"><h2>Trainers</h2><small>17 opponents</small></header><div class="trainer-tools"><input id="search" type="search" aria-label="Search trainers" placeholder="Search trainers" value="${escape(search)}"></div><div class="trainer-rows">${catalogRows()}</div></section>${detailPanel()}${partySection()}</div>${partySection(true)}`}`;
  page.innerHTML = `<div class="play-heading"><h1>Play</h1></div>${tabs()}${activeTab === 'continue' ? continuePanel() : trainerContent}`;
  wireImages();
  const rows = document.querySelector('.trainer-rows');
  const selectedRow = document.querySelector('.trainer-row[aria-pressed=true]');
  if (rows && selectedRow && matchMedia('(min-width:761px)').matches) {
    rows.scrollTop = selectedRow.getBoundingClientRect().top - rows.getBoundingClientRect().top - 8;
  }
  const dialog = document.querySelector('#party-panel');
  if (dialog) {
    if (partyOpen) dialog.showModal();
    dialog.addEventListener('close', () => {partyOpen = false;document.querySelector('.party-trigger')?.setAttribute('aria-expanded','false');document.querySelector('.party-trigger')?.focus();});
    dialog.addEventListener('click', event => {if (event.target !== dialog) return;const r = dialog.getBoundingClientRect();if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();});
  }
}
function wireImages() {
  page.querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
    if (img.classList.contains('party-sprite')) return;
    const fallback = document.createElement('span');fallback.className = img.classList.contains('item-icon') ? 'item-icon' : 'trainer-fallback';fallback.textContent = '?';fallback.setAttribute('aria-label','Art unavailable');img.replaceWith(fallback);
  }, {once:true}));
  page.querySelectorAll('.party-sprite').forEach(img => {img.style.scale = '-1 1';void loadSpriteOffset(img.src).then(offset => {img.style.translate = `${offset.x}% ${offset.y}%`;});});
}
function boundary(name) {
  document.querySelector('#boundary-title').textContent = name;
  document.querySelector('#boundary-copy').textContent = name === 'Edit party' || name === 'Pokémon' ? 'In the app, this opens the existing Pokémon workspace. Your trainer and difficulty stay selected when you return. Party presets are a separate follow-up.' : name === 'Battle' ? 'This continues into the existing battle screen. This study stops at the handoff; it does not start a real battle.' : `${name} is outside this trainer-battle study.`;
  document.querySelector('#boundary').showModal();
}
function remember(replace = false) {
  const url = new URL(location.href);url.searchParams.set('screen',activeTab === 'continue' ? 'continue' : detail ? 'detail' : 'browse');url.searchParams.set('npc',selected);url.searchParams.set('difficulty',difficulty);history[replace ? 'replaceState' : 'pushState']({},'',url);
}
function selectNpc(id) {
  if (['unavailable','started'].includes(scenario)) scenario = 'ready';
  selected = id;difficulty = getNpc().difficulties[0].id;activeTab = 'trainers';detail = true;chosenMember = null;remember();render();
  if (matchMedia('(max-width:760px)').matches) {scrollTo(0,0);document.querySelector('.mobile-back')?.focus();}
}
document.addEventListener('input',event => {if (event.target.id !== 'search') return;search = event.target.value;document.querySelector('.trainer-rows').innerHTML = catalogRows();wireImages();});
document.addEventListener('click',event => {
  const target = event.target.closest('button,a');if (!target || target.disabled) return;
  if (target.dataset.boundary) {event.preventDefault();boundary(target.dataset.boundary);return;}
  if (target.dataset.tab || target.hasAttribute('data-play')) {event.preventDefault();activeTab = target.dataset.tab || (activeBattles().length ? 'continue' : 'trainers');detail = false;partyOpen = false;remember();render();document.querySelector(`[data-tab="${activeTab}"]`)?.focus();return;}
  if (target.dataset.npc) {selectNpc(target.dataset.npc);return;}
  if (target.dataset.difficulty) {if (scenario === 'started') scenario = 'ready';difficulty = target.dataset.difficulty;remember(true);render();document.querySelector(`[data-difficulty="${difficulty}"]`)?.focus();return;}
  if (target.dataset.member) {chosenMember = pokemonFixtures.find(member=>member.id === target.dataset.member);render();const host = partyOpen ? '.party-popout' : '.party-preview';document.querySelector(`${host} [data-member="${chosenMember.id}"]`)?.focus();return;}
  const action = target.dataset.action;
  if (action === 'home') {detail = false;if (scenario === 'started') scenario = 'ready';remember();render();document.querySelector(`[data-npc="${selected}"]`)?.focus();}
  if (action === 'continue') boundary('Battle');
  if (action === 'party') boundary('Edit party');
  if (action === 'open-party') {partyOpen = true;render();}
  if (action === 'close-party') document.querySelector('#party-panel')?.close();
  if (['refresh','dismiss'].includes(action)) {scenario = 'ready';render();}
  if (action === 'view-ongoing') {activeTab = activeBattles().length ? 'continue' : 'trainers';detail = false;remember();render();}
  if (action === 'start' && !blocked()) {scenario = 'pending';render();setTimeout(()=>{scenario = 'started';render();},1600);}
});
document.addEventListener('focusin',event => {
  const tab = event.target.closest('.subnav button');
  tab?.scrollIntoView({block:'nearest',inline:'nearest'});
});
window.addEventListener('popstate',()=>{const p = new URLSearchParams(location.search);selected=p.get('npc')||'blue';difficulty=p.get('difficulty')||'easy';detail=p.get('screen')==='detail';activeTab=['browse','detail'].includes(p.get('screen'))?'trainers':'continue';partyOpen=false;render();});
render();
