// Design-only workspace: all selection and formation changes stay in memory.
const query = new URLSearchParams(location.search);
const scenario = query.get('state') || 'normal';
const standalone = query.get('screen') === 'detail';
const page = document.querySelector('#page');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const num = value => Number(value).toLocaleString('en-US');
const phone = () => window.matchMedia('(max-width:760px)').matches;
const records = Array.from({length:scenario==='palette'?pokemonFixtures.length:72}, (_, i) => {
  const p = pokemonFixtures[i % pokemonFixtures.length];
  return {...p, id:i<pokemonFixtures.length?p.id:`${p.id}-${Math.floor(i/pokemonFixtures.length)}`,
    name:scenario==='long'&&i===0?'Sir Thunderbolt the Unreasonably Magnificent':p.name,
    ivs:i%pokemonFixtures.length===7?[31,31,31,31,31,31]:p.ivs.map(v=>Math.max(0,v-(i%7)*2)),
    power:Math.max(100,p.power-Math.floor(i/pokemonFixtures.length)*75), missingArt:scenario==='long'&&i===0, level:scenario==='max'&&i===0?100:Math.max(1,p.level-Math.floor(i/pokemonFixtures.length)*2)};
});
const byId = id => records.find(p => p.id === id);
let formation = Array(12).fill(null);
[0,1,4,5,8,9].forEach((slot,i)=>formation[slot]=records[i].id);
if (['empty','empty-party'].includes(scenario)) formation.fill(null);
if (scenario==='space') {formation[8]=null;formation[9]=null;}
let selectedId = query.get('id') || records[['placing','space'].includes(scenario)?6:0].id;
let placingId = !standalone && (scenario==='placing' || query.get('intent')==='place') ? selectedId : null;
let sheet = standalone ? null : query.get('panel') || (placingId?'party':null);
let inspectorTab='build';
let currentPage=1;
let status='';
let drag=null;
let candidate=null;
let ignoreClickUntil=0;
const blocked = ['loading','pending','uncertain','conflict','error'].includes(scenario);
const count = () => formation.filter(Boolean).length;
const chevron = (direction='down') => `<svg class="control-chevron ${direction==='up'?'is-up':''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;
const spriteAlignment = import('./sprite-layout.js');
const svg = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">${paths}</svg>`;
const icons = {
  Play:'<path d="m5 3 14 14-2 2L3 5V3h2Zm14 0L5 17m-2-3 7 7m4-18 7 7"/>',
  Pokémon:'<circle cx="12" cy="12" r="8"/><path d="M4 12h5m6 0h5"/><circle cx="12" cy="12" r="3"/>',
  Catch:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5"/><circle cx="12" cy="12" r="5"/>',
  Rewards:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  More:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
};
for(const [name,path] of Object.entries({Bag:'<path d="M5 8h14l1 13H4L5 8Zm3 0V6a4 4 0 0 1 8 0v2"/><path d="M8 13h8v5H8z"/>',Settings:'<path d="m9 3-1 3-3 1-2 3 2 2-1 3 2 3 3-1 2 3h3l1-3 3-1 2-3-2-2 1-3-2-3-3 1-2-3H9Z"/><circle cx="11.5" cy="11.5" r="3"/>'})) document.querySelector(`[aria-label="${name}"]`).innerHTML=svg(path);
document.querySelector('.trainer-money>span:first-child').outerHTML=svg('<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/>');
document.querySelector('#navigation').innerHTML=Object.entries(icons).map(([name,path])=>`<a href="?screen=collection" ${name==='Pokémon'?'aria-current="page"':`data-boundary="${name}"`}>${svg(path)}<span>${name}</span><span class="nav-arrow">›</span></a>`).join('');
if(standalone) document.body.classList.add('standalone');
function linkTo(screen, id, intent='') {
  const p=new URLSearchParams();p.set('screen',screen);p.set('state',scenario);
  if(id)p.set('id',id);if(intent)p.set('intent',intent);
  return `?${p}`;
}
function art(p, className='') {
  return p.missingArt?'<span class="fallback" aria-label="Artwork unavailable">?</span>':`<img class="${className}" src="${esc(p.sprite)}" alt="" draggable="false" loading="lazy">`;
}
const typeBadges=p=>`<div class="type-row">${p.types.map(t=>`<span class="type" data-type="${esc(t)}">${esc(t)}</span>`).join('')}</div>`;
function eligibility(id,index) {
  if(blocked)return 'Wait for the current party to load.';
  if(formation[index]===id)return 'Already in this position.';
  if(!formation.includes(id)&&!formation[index]&&count()>=6)return 'Party full: replace a member or remove one first.';
  return '';
}
function placementText(id) {
  return formation.includes(id)?'Choose a position to move or swap.':count()>=6?'Party full. Choose a member to replace.':'Choose an empty position or a member to replace.';
}
function renderParty() {
  const active=placingId||drag?.id;
  const p=byId(active);
  return `<section class="panel party-panel ${sheet==='party'?'is-open':''}" id="party-panel" aria-label="Your party"><div class="panel-head"><h2>Your party <small>${count()} / 6</small></h2><button class="panel-close" data-collapse="party" aria-label="Collapse party">${chevron()}</button></div><div class="party-summary"><span>${phone()?'Front row at top':'Faces right →'}</span><button class="party-manage-toggle" data-manage aria-expanded="${manageOpen}">Manage ${chevron()}</button>${manageOpen?'<div class="party-manage-menu"><button class="secondary" data-party-mode="move">Move / Swap</button><button class="secondary" data-party-mode="remove">Remove from party</button></div>':''}</div>${placingId||partyMode?`<div class="placement-bar"><div><strong>${p?esc(p.name):partyMode==='move'?'Move / Swap':'Remove from party'}</strong><span>${active?placementText(active):'Choose a Pokémon in the formation.'}</span></div><button class="secondary" data-cancel>Cancel</button></div>`:''}<div class="formation-field"><div class="formation-rows"><span>Back</span><span>Middle</span><span>Front →</span></div><div class="formation-grid">${formation.map((id,index)=>{
    const member=byId(id);const row=Math.floor(index/4);const col=index%4;
    const reason=active?eligibility(active,index):partyMode&&!member?'Choose a position containing a Pokémon.':'';
    const label=`Position ${index+1}${member?`, ${member.name}`:', empty'}${active?reason?`, unavailable: ${reason}`:member?formation.includes(active)?', swap here':', replace here':', place here':member?', inspect':''}`;
    return `<button type="button" class="formation-slot ${member?'':'is-empty'} ${active||partyMode?reason?'is-invalid':'is-eligible':''} ${active?'is-placement':''}" style="grid-column:${phone()?col+1:3-row};grid-row:${phone()?row+1:col+1}" data-slot="${index}" ${member?`data-pokemon="${id}" data-origin="party"`:''} aria-label="${esc(label)}" aria-pressed="${id===selectedId}" ${(active||partyMode)&&reason?'aria-disabled="true"':''} title="${esc(reason||label)}">${member?`<span class="slot-name">${esc(member.name)}</span><span class="slot-level">Lv. ${member.level}</span><span class="party-sprite">${art(member)}</span><span class="drag-handle" aria-hidden="true" title="Hold to drag">⠿</span>`:'<span class="empty-mark">+</span>'}<span class="slot-position">${index+1}</span></button>`;
  }).join('')}</div></div><p class="party-help">${active||partyMode?'Cyan rings mark valid positions. Gray positions are unavailable.':'Tap to inspect. Drag to move or swap; drag back to the collection to remove.'}</p></section>`;
}
const ivPercent = p => Math.round(p.ivs.reduce((a,b)=>a+b,0)/186*100);
let labelMode='name';
let sortKey='pokedex';
let descending=false;
let filtersOpen=false;
let filters={search:'',rarity:'',type:'',shiny:'',member:'',iv:''};
let pageSize=20;
let partyMode=null;
let manageOpen=false;
function matchingRecords() {
  const data=(scenario==='empty'?[]:records).filter(p=>
    `${p.name} ${p.speciesName}`.toLowerCase().includes(filters.search.toLowerCase()) &&
    (!filters.rarity||p.rarity===filters.rarity) && (!filters.type||p.types.includes(filters.type)) &&
    (!filters.shiny||String(p.shiny)===filters.shiny) &&
    (!filters.member||String(formation.includes(p.id))===filters.member) &&
    (!filters.iv||ivPercent(p)>=Number(filters.iv)));
  const value=p=>sortKey==='power'?p.power:sortKey==='iv'?ivPercent(p):sortKey==='level'?p.level:Number(p.speciesId);
  return data.sort((a,b)=>(descending?-1:1)*(sortKey==='name'?a.name.localeCompare(b.name):value(a)-value(b))||a.id.localeCompare(b.id));
}
function option(value,label,current) {return `<option value="${esc(value)}" ${String(value)===String(current)?'selected':''}>${esc(label)}</option>`;}
function filterSelect(key,label,choices) {return `<label><span>${label}</span><select data-filter="${key}">${choices.map(([value,text])=>option(value,text,filters[key])).join('')}</select></label>`;}
function tileLabel(p) {return labelMode==='power'?`CP ${num(p.power)}`:labelMode==='iv'?`IV ${ivPercent(p)}%`:p.name;}
function renderCollection() {
  const data=matchingRecords();const pages=Math.max(1,Math.ceil(data.length/pageSize));
  currentPage=Math.max(1,Math.min(currentPage,pages));
  const start=(currentPage-1)*pageSize,visible=data.slice(start,start+pageSize);
  const activeFilters=Object.entries(filters).filter(([key,value])=>key!=='search'&&value).length;
  let content='';
  if(scenario==='loading') content=`<div class="state-block" role="status">Loading your Pokémon…</div><div class="tile-grid">${'<div class="skeleton-tile"></div>'.repeat(12)}</div>`;
  else if(scenario==='error') content='<div class="state-block"><h3>Couldn’t load your Pokémon.</h3><p>Try again to load your collection.</p><button class="primary-button" data-retry>Try again</button></div>';
  else if(scenario==='empty') content='<div class="state-block"><h3>Your collection starts here</h3><p>Use <code>/gacha</code> in Discord to catch Pokémon, then return here to prepare your party.</p></div>';
  else if(!data.length) content='<div class="state-block"><h3>No Pokémon found</h3><p>Try another name or clear your filters.</p><button class="secondary" data-clear-filters>Clear filters</button></div>';
  else content=`<div class="tile-grid">${visible.map(p=>`<button class="collection-tile" data-rarity="${esc(p.rarity)}" type="button" data-pokemon="${p.id}" data-origin="collection" aria-label="Inspect ${esc(p.name)}, level ${p.level}, ${esc(p.rarity)}, combat power ${p.power}, IV perfection ${ivPercent(p)} percent${formation.includes(p.id)?', in party':''}" aria-pressed="${selectedId===p.id}" title="${esc(p.name)} · ${esc(p.rarity)} · CP ${num(p.power)} · IV ${ivPercent(p)}%"><span class="tile-art">${art(p)}${formation.includes(p.id)?'<span class="party-marker" aria-hidden="true">P</span>':''}${p.shiny?'<span class="shiny-marker" aria-hidden="true">✦</span>':''}<span class="drag-handle" aria-hidden="true" title="Hold to drag">⠿</span></span>${labelMode!=='none'?`<span class="tile-label">${esc(tileLabel(p))}</span>`:''}</button>`).join('')}</div>`;
  return `<section class="panel collection-panel" aria-label="Pokémon collection"><div class="panel-head"><h2>Collection</h2><label class="collection-label"><span>Label</span><select id="tile-label" aria-label="Tile label">${[['name','Name'],['power','Combat power'],['iv','IV perfection'],['none','None']].map(([v,t])=>option(v,t,labelMode)).join('')}</select></label></div><div class="collection-tools"><div class="search-tools"><input type="search" id="collection-search" aria-label="Search name or species" placeholder="Search" value="${esc(filters.search)}" maxlength="80"><button class="secondary filter-toggle" data-toggle-filters aria-expanded="${filtersOpen}" aria-controls="collection-filters">Filters${activeFilters?` · ${activeFilters}`:''}</button></div><div class="sort-tools"><label><span>Sort</span><select id="collection-sort" aria-label="Sort collection">${[['pokedex','Pokédex'],['name','Name'],['power','Power'],['iv','IV %'],['level','Level']].map(([v,t])=>option(v,t,sortKey)).join('')}</select></label><button class="secondary" data-sort-direction aria-label="${descending?'Highest to lowest; switch to ascending':'Lowest to highest; switch to descending'}">${descending?'↓':'↑'}</button><small>${data.length} Pokémon</small></div></div>${filtersOpen?`<section class="filter-popover" id="collection-filters" aria-label="Collection filters"><div class="filter-popover-head"><h3>Filters</h3><button data-toggle-filters class="secondary" aria-label="Close filters">×</button></div><div class="filter-fields">${filterSelect('rarity','Rarity',[['','Any'],...['Common','Rare','Epic','Legendary','Mythical'].map(t=>[t,t])])}${filterSelect('type','Type',[['','Any'],...[...new Set(records.flatMap(p=>p.types))].sort().map(t=>[t,t])])}${filterSelect('shiny','Shiny',[['','Any'],['true','Shiny'],['false','Not shiny']])}${filterSelect('member','Party',[['','Any'],['true','In party'],['false','Not in party']])}${filterSelect('iv','Minimum IV perfection',[['','Any'],['50','50%'],['80','80%'],['90','90%'],['95','95%'],['100','100%']])}</div><div class="filter-popover-footer"><button class="secondary" data-clear-filters>Clear</button><button class="primary-button" data-toggle-filters>Show ${data.length}</button></div></section>`:''}<div class="collection-drop" data-remove-drop>Drop here to remove from party</div><div class="collection-scroll">${content}</div><nav class="pagination" aria-label="Collection pages"><button class="secondary" data-page="${currentPage-1}" ${currentPage===1?'disabled':''} aria-label="Previous collection page">←</button><span>${data.length?`${start+1}–${start+visible.length} of ${data.length}`:'0 Pokémon'}</span><button class="secondary" data-page="${currentPage+1}" ${currentPage>=pages?'disabled':''} aria-label="Next collection page">→</button></nav></section>`;
}
// Fit complete rows into the available collection viewport. Production can
// request this page size; this standalone study only slices fixture records.
function fitCollection() {
  if(standalone)return false;
  document.querySelector('.site-layout').style.minHeight=`${window.innerHeight-document.querySelector('.site-header').offsetHeight}px`;
  const panel=document.querySelector('.collection-panel');
  const bottom=phone()?document.querySelector('.mobile-dock').getBoundingClientRect().top:window.innerHeight-12;
  const bottomGap=phone()&&window.innerHeight<=700?12:24;
  panel.style.height=`${Math.max(250,bottom-panel.getBoundingClientRect().top-bottomGap)}px`;
  const grid=panel.querySelector('.tile-grid');const tile=grid?.querySelector('.collection-tile');
  if(!tile)return false;
  const columns=getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  const gap=parseFloat(getComputedStyle(grid).rowGap)||0;
  const list=panel.querySelector('.collection-scroll');
  const available=list.clientHeight-parseFloat(getComputedStyle(list).paddingTop)-parseFloat(getComputedStyle(list).paddingBottom);
  const rows=Math.max(1,Math.floor((available+gap)/(tile.getBoundingClientRect().height+gap)));
  const size=columns*rows;
  if(size===pageSize)return false;
  const first=(currentPage-1)*pageSize;pageSize=size;currentPage=Math.floor(first/pageSize)+1;
  return true;
}
function inspectorContents(p) {
  if(inspectorTab==='stats')return `<p class="nature-summary">${esc(p.nature.name)} nature</p><table class="stat-table"><thead><tr><th scope="col">Stat</th><th scope="col">Value</th><th scope="col">IV</th><th scope="col">EV</th></tr></thead><tbody>${['HP','Attack','Defense','Sp. Atk','Sp. Def','Speed'].map((name,i)=>{
    const change=p.nature.stats[i];
    const effect=change>0?'raised':change<0?'lowered':'';
    return `<tr${effect?` class="nature-${effect}"`:''}><th scope="row"${effect?` aria-label="${name}, ${effect} by ${esc(p.nature.name)} nature"`:''}>${name}${change>0?' +':change<0?' −':''}</th><td>${p.stats[i]}</td><td>${p.ivs[i]}</td><td>${p.evs[i]}</td></tr>`;
  }).join('')}</tbody></table><p style="margin-top:12px">IVs ${p.ivs.reduce((a,b)=>a+b,0)} / 186 · EVs ${p.evs.reduce((a,b)=>a+b,0)} / 510</p>`;
  if(inspectorTab==='moves')return p.moves.map(moveInspection).join('');
  if(inspectorTab==='info')return `<h3>Species</h3><p>${esc(p.speciesName)} · #${esc(p.speciesId)}</p><p>${esc(p.description)}</p><h3>Appearance & lock</h3><p>${p.shiny?'Shiny':'Not shiny'} · ${p.locked?'Release locked':'Not release locked'}</p><h3>Date caught</h3><p>${p.dateAcquired}</p><h3>Original owner</h3><p class="identity-id">${p.originalOwner}</p><h3>Pokémon ID</h3><p class="identity-id">${p.id}</p>`;
  return `<h3>Ability</h3><strong>${esc(p.ability.name)}</strong><p>${esc(p.ability.description)}</p><h3>Held item</h3><strong>${esc(p.heldItem?.name||'None')}</strong><p>${esc(p.heldItem?.description||'')}</p><h3>Nature</h3><strong>${esc(p.nature.name)}</strong><p>${esc(p.nature.description)}</p><h3>Power</h3><p>${num(p.power)}</p><h3>Equipment</h3>${p.equipment.length?p.equipment.map(e=>`<strong>${esc(e.name)} · Lv. ${e.level}</strong><p>${e.modifiers.map(esc).join(' · ')}</p>`).join(''):'<p>No equipment.</p>'}`;
}
// Match BattleInspector's move structure; production should share this view.
function moveInspection(m) {
  const category=['Physical','Special'].includes(m.damageType)?m.damageType:'Status';
  const icon=category==='Physical'?'⚔':category==='Special'?'✦':'◌';
  const cooldown=m.cooldown===undefined?'—':`${m.cooldown} ${m.cooldown===1?'turn':'turns'}`;
  return `<div class="inspect-move"><div class="inspect-move-title"><h3>${esc(m.name)}</h3><span class="type" data-type="${esc(m.type)}">${esc(m.type)}</span></div><dl class="inspect-move-facts" aria-label="${esc(m.name)} move details"><div><dt><span aria-hidden="true">${icon}</span> Category</dt><dd>${category}</dd></div><div><dt><span aria-hidden="true">✹</span> Power</dt><dd>${esc(m.power??'—')}</dd></div><div><dt><span aria-hidden="true">◎</span> Accuracy</dt><dd>${esc(m.accuracy??'—')}</dd></div><div><dt><svg class="move-fact-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg> Cooldown</dt><dd>${cooldown}</dd></div></dl><p>${esc(m.description||'No description available.')}</p></div>`;
}
function renderInspector() {
  const p=byId(selectedId);const unavailable=['loading','empty','error'].includes(scenario)||(scenario==='missing'&&selectedId===records[0].id);
  let body='';
  if(!p||unavailable){
    const title=scenario==='loading'?'Loading Pokémon…':scenario==='missing'?'Pokémon unavailable':'Choose a Pokémon';
    const copy=scenario==='missing'?'It may have been released or traded. Choose another Pokémon from your collection.':'Tap a Pokémon in the collection or party to inspect it.';
    body=`<div class="inspect-empty"><span aria-hidden="true">◉</span><h3>${title}</h3><p>${copy}</p></div>`;
  }else{
    const member=formation.includes(p.id);const pos=formation.indexOf(p.id)+1;
    body=`<div class="inspect-scroll"><div class="inspect-body"><div class="inspect-identity">${art(p)}<div><p>Lv. ${p.level} · ${esc(p.rarity)}</p><h3>${esc(p.name)}</h3>${typeBadges(p)}</div></div><div class="member-state">${member?`● In party · position ${pos}`:'Not in party'}${p.shiny?' · ✦ Shiny':''}</div><div class="inspect-actions">${member?'':'<button class="primary-button" data-add>Add to party</button>'}<button class="secondary" data-train>Train <small>Later</small></button></div><div class="exp-row"><span>EXP</span><span>${p.level===100?'Max level':`${num(p.expProgress)} / ${num(p.expToNext)}`}</span></div>${p.level===100?'':`<progress value="${p.expProgress}" max="${p.expToNext}" aria-label="EXP toward next level"></progress>`}</div><div class="inspect-tabs" aria-label="Pokémon details">${['build','stats','moves','info'].map(t=>`<button data-inspect-tab="${t}" aria-pressed="${inspectorTab===t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div><div class="inspect-section">${inspectorContents(p)}</div></div>`;
  }
  if(blocked) body=body.replaceAll(' data-add>', ' data-add disabled>').replaceAll(' data-remove>', ' data-remove disabled>');
  return `<section class="panel inspect-panel ${sheet==='inspect'?'is-open':''}" id="inspect-panel" aria-label="Pokémon inspection"><div class="panel-head"><h2 tabindex="-1">Inspect</h2><button class="panel-close" data-collapse="inspect" aria-label="Collapse inspection">${chevron()}</button></div>${body}${p&&!unavailable?`<div class="inspect-footer"><a href="${linkTo(standalone?'collection':'detail',p.id)}">${standalone?'← Back to collection':'Open full page ↗'}</a></div>`:''}</section>`;
}
function notice() {
  const notices={pending:'Updating party…',uncertain:'The response was interrupted. Check the saved party before trying another change.',conflict:'Your party changed in Discord. Reload it before making another change.'};
  return notices[scenario]?`<div class="workspace-notice" role="status"><span>${notices[scenario]}</span>${scenario!=='pending'?'<button class="secondary" data-retry>Reload party</button>':''}</div>`:'';
}
function render() {
  const scroll=document.querySelector('.collection-scroll')?.scrollTop||0;
  const filterScroll=document.querySelector('.filter-popover')?.scrollTop||0;
  page.innerHTML=`<div class="workspace-heading"><div><h1>${standalone?'Pokémon':'Your Pokémon'}</h1><p>${standalone?'Collection · Pokémon details':'Collection & party'}</p></div></div>${notice()}<div class="workspace ${drag?.fromParty?'is-party-drag':''}">${renderParty()}${renderCollection()}${renderInspector()}</div><p class="workspace-status" role="status" aria-live="polite">${esc(status)}</p><div class="mobile-dock"><button data-open="party" aria-expanded="${sheet==='party'}" aria-controls="party-panel"><span class="dock-icon" aria-hidden="true">◈</span><span><strong>${placingId?'Choose a position':'Your party'}</strong><small>${count()} / 6 Pokémon</small></span><span class="chevron" aria-hidden="true">${chevron(sheet==='party'?'down':'up')}</span></button><button data-open="inspect" aria-expanded="${sheet==='inspect'}" aria-controls="inspect-panel"><span class="dock-icon" aria-hidden="true">◉</span><span><strong>${esc(byId(selectedId)?.name||'Inspect')}</strong><small>${placingId?'Selected Pokémon':'Pokémon details'}</small></span><span class="chevron" aria-hidden="true">${chevron(sheet==='inspect'?'down':'up')}</span></button></div>`;
  const list=document.querySelector('.collection-scroll');if(list)list.scrollTop=scroll;
  const popup=document.querySelector('.filter-popover');if(popup)popup.scrollTop=filterScroll;
  if(fitCollection()){render();return;}
  document.querySelectorAll('.party-sprite img').forEach(img => {
    spriteAlignment.then(({loadSpriteOffset})=>loadSpriteOffset(img.src)).then(offset=>{
      if(!img.isConnected)return;
      img.style.translate=`${-offset.x}% ${offset.y}%`;
      img.dataset.spriteAligned='true';
    });
  });
  document.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.outerHTML='<span class="fallback" aria-label="Artwork unavailable">?</span>';},{once:true}));
}
function inspect(id) {
  if(placingId)return;
  selectedId=id;inspectorTab='build';sheet='inspect';render();
  document.querySelector('#inspect-panel .panel-head h2')?.focus({preventScroll:true});
}
function beginPlacement(id) {
  if(blocked){status='Wait for the current party before editing.';render();return;}
  if(standalone){location.href=linkTo('collection',id,'place');return;}
  selectedId=id;placingId=id;sheet='party';status='';render();
  document.querySelector('.formation-slot.is-eligible')?.focus({preventScroll:true});
}
function place(id,index) {
  const reason=eligibility(id,index);
  if(reason){status=reason;render();return;}
  const old=formation.indexOf(id);const outgoing=formation[index];
  if(old>=0)formation[old]=outgoing||null;
  formation[index]=id;selectedId=id;placingId=null;
  status=old>=0?outgoing?'Party members swapped.':'Pokémon moved.':outgoing?'Party member replaced.':'Pokémon added to party.';
  sheet=phone()?'party':sheet;render();
  document.querySelector(`[data-slot="${index}"]`)?.focus({preventScroll:true});
}
function remove(id) {
  if(blocked)return;
  const index=formation.indexOf(id);if(index<0)return;
  formation[index]=null;placingId=null;selectedId=id;status='Pokémon removed from party. It is still in your collection.';render();
}
function cancelPlacement() {placingId=null;status='Placement canceled.';sheet='inspect';render();document.querySelector('#inspect-panel .panel-head h2')?.focus({preventScroll:true});}
function reset() {location.href=linkTo('collection');}
function boundary(name) {status=`${name} keeps its existing behavior. This study focuses on collection and party.`;render();}
page.addEventListener('change',event=>{
  const control=event.target;
  if(control.id==='tile-label'){labelMode=control.value;render();}
  if(control.id==='collection-sort'){sortKey=control.value;descending=['power','iv','level'].includes(sortKey);currentPage=1;render();}
  if(control.dataset.filter){filters[control.dataset.filter]=control.value;currentPage=1;render();}
});
page.addEventListener('input',event=>{
  if(event.target.id!=='collection-search')return;
  const cursor=event.target.selectionStart;filters.search=event.target.value;currentPage=1;render();
  const input=document.querySelector('#collection-search');input.focus({preventScroll:true});input.setSelectionRange(cursor,cursor);
});
document.addEventListener('click',event=>{
  if(Date.now()<ignoreClickUntil){event.preventDefault();return;}
  const button=event.target.closest('button,a');if(!button)return;
  if(button.dataset.boundary){event.preventDefault();boundary(button.dataset.boundary);return;}
  if(button.hasAttribute('data-retry'))return reset();
  if(button.hasAttribute('data-toggle-filters')){filtersOpen=!filtersOpen;if(filtersOpen)sheet=null;render();return;}
  if(button.hasAttribute('data-clear-filters')){filters={search:'',rarity:'',type:'',shiny:'',member:'',iv:''};currentPage=1;render();return;}
  if(button.hasAttribute('data-sort-direction')){descending=!descending;currentPage=1;render();return;}
  if(button.hasAttribute('data-train')){document.querySelector('#training-dialog').showModal();return;}
  if(button.hasAttribute('data-manage')){manageOpen=!manageOpen;render();return;}
  if(button.dataset.partyMode){partyMode=button.dataset.partyMode;manageOpen=false;placingId=null;sheet='party';status='';render();return;}
  if(button.hasAttribute('data-cancel')&&partyMode){partyMode=null;render();return;}
  if(button.hasAttribute('data-cancel'))return cancelPlacement();
  if(button.hasAttribute('data-add'))return beginPlacement(selectedId);
  if(button.hasAttribute('data-remove'))return remove(selectedId);
  if(button.hasAttribute('data-open')){sheet=sheet===button.dataset.open?null:button.dataset.open;render();return;}
  if(button.hasAttribute('data-collapse')){sheet=null;render();document.querySelector(`[data-open="${button.dataset.collapse}"]`)?.focus();return;}
  if(button.dataset.inspectTab){inspectorTab=button.dataset.inspectTab;render();document.querySelector(`[data-inspect-tab="${inspectorTab}"]`)?.focus({preventScroll:true});return;}
  if(button.dataset.page){const next=Number(button.dataset.page),forward=next>currentPage;currentPage=next;render();document.querySelector('.collection-scroll').scrollTop=0;const selector=forward?'[aria-label="Next collection page"]':'[aria-label="Previous collection page"]';const target=document.querySelector(selector);(target.disabled?document.querySelector('.pagination button:not(:disabled)'):target)?.focus({preventScroll:true});return;}
  if(button.hasAttribute('data-slot')&&placingId)return place(placingId,Number(button.dataset.slot));
  if(button.hasAttribute('data-slot')&&partyMode&&button.dataset.pokemon){const mode=partyMode;partyMode=null;return mode==='move'?beginPlacement(button.dataset.pokemon):remove(button.dataset.pokemon);}
  if(button.dataset.pokemon)return inspect(button.dataset.pokemon);
});
// Pointer drag deliberately separates mouse movement from touch long-press.
function startDrag() {
  if(!candidate||blocked||placingId||partyMode)return;
  drag={id:candidate.id,fromParty:candidate.origin==='party',pointerId:candidate.pointerId};
  selectedId=drag.id;sheet='party';
  const ghost=document.createElement('div');ghost.className='drag-ghost';ghost.innerHTML=art(byId(drag.id));document.body.append(ghost);
  document.body.classList.add('is-dragging');document.documentElement.setPointerCapture(candidate.pointerId);render();moveGhost(candidate.x,candidate.y);
}
function moveGhost(x,y) {const ghost=document.querySelector('.drag-ghost');if(ghost){ghost.style.left=`${x}px`;ghost.style.top=`${y}px`;}}
function clearDrag() {
  clearTimeout(candidate?.timer);candidate=null;drag=null;document.querySelector('.drag-ghost')?.remove();document.body.classList.remove('is-dragging');
}
function hitTest(x,y) {
  const target=document.elementFromPoint(x,y);
  document.querySelectorAll('.is-over').forEach(el=>el.classList.remove('is-over'));
  const slot=target?.closest('[data-slot]');const drop=target?.closest('.collection-panel');
  if(slot)slot.classList.add('is-over');
  if(drop&&drag?.fromParty)document.querySelector('.collection-drop')?.classList.add('is-over');
  return {slot,drop};
}
document.addEventListener('pointerdown',event=>{
  const target=event.target.closest('[data-pokemon]');
  if(!target||blocked||placingId||event.button!==0||!event.isPrimary)return;
  if(event.pointerType==='touch'&&!event.target.closest('.drag-handle'))return;
  candidate={id:target.dataset.pokemon,origin:target.dataset.origin,pointerId:event.pointerId,type:event.pointerType,x:event.clientX,y:event.clientY,timer:null};
  if(event.pointerType==='touch')candidate.timer=setTimeout(startDrag,450);
});
document.addEventListener('pointermove',event=>{
  if(!candidate||candidate.pointerId!==event.pointerId)return;
  const distance=Math.hypot(event.clientX-candidate.x,event.clientY-candidate.y);
  if(!drag&&candidate.type==='touch'&&distance>10){clearDrag();return;}
  if(!drag&&candidate.type!=='touch'&&distance>6)startDrag();
  if(!drag)return;
  event.preventDefault();moveGhost(event.clientX,event.clientY);hitTest(event.clientX,event.clientY);
},{passive:false});
document.addEventListener('pointerup',event=>{
  if(!candidate)return;
  if(!drag){clearDrag();return;}
  const {slot,drop}=hitTest(event.clientX,event.clientY);const id=drag.id;const fromParty=drag.fromParty;
  clearDrag();ignoreClickUntil=Date.now()+250;
  if(slot)return place(id,Number(slot.dataset.slot));
  if(drop&&fromParty)return remove(id);
  status='Drop canceled. Your party is unchanged.';render();
});
document.addEventListener('pointercancel',()=>{if(candidate){const active=!!drag;clearDrag();if(active){status='Drag canceled.';render();}}});
document.addEventListener('dragstart',event=>event.preventDefault());
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){if(document.querySelector('#training-dialog').open)return;if(filtersOpen){filtersOpen=false;render();document.querySelector('[data-toggle-filters]')?.focus();}else if(partyMode){partyMode=null;render();}else if(drag){clearDrag();status='Drag canceled.';render();}else if(placingId)cancelPlacement();else if(sheet){sheet=null;render();document.querySelector('[data-open="inspect"]')?.focus();}}
});
window.addEventListener('resize',()=>{if(!drag)render();});
render();
