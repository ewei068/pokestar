const members = [
  { id:143, name:'Snorlax', level:42, type:'NORMAL' },
  { id:448, name:'Lucario', level:45, type:'FIGHTING' },
  { id:25, name:'Pikachu', level:41, type:'ELECTRIC' },
  { id:282, name:'Gardevoir', level:43, type:'PSYCHIC' },
  { id:9, name:'Blastoise', level:44, type:'WATER' },
  { id:6, name:'Charizard', level:46, type:'FIRE' },
];
const img = p => `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png" alt="" width="96" height="96">`;
document.querySelector('#party').innerHTML = members.map(p => `<div class="member"><div class="sprite-stage">${img(p)}</div><strong>${p.name}</strong><span class="level">Lv. ${p.level} <span class="type ${p.type.toLowerCase()}">${p.type}</span></span></div>`).join('');
document.querySelector('#formation').innerHTML = ['Front','Middle','Back'].map((label,i) => `<div class="formation-row"><span>${label}</span>${members.slice(i*2,i*2+2).map(p => `<span class="formation-slot" title="${p.name}">${img(p)}<span class="sr-only">${p.name}</span></span>`).join('')}<span class="empty-slot" aria-label="Empty slot"></span><span class="empty-slot" aria-label="Empty slot"></span></div>`).join('');
const descriptions = {
  journal:'Warm paper, inked edges and small field-guide details. The smallest step from the current study.',
  console:'Inset panels, stronger frames and tactile controls. A handheld-menu influence with web typography.',
  arcade:'Dusk scenery, colorful mode cards and striped buttons. The most game-like end of the comparison.',
};
function setTheme(theme) {
  document.body.dataset.theme = theme;
  document.querySelector('#direction-note').textContent = descriptions[theme];
  document.querySelectorAll('[data-theme][aria-pressed]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.theme === theme)));
  const url = new URL(location.href); url.searchParams.set('theme',theme); history.replaceState(null,'',url);
}
const requested = new URLSearchParams(location.search).get('theme');
if (requested && descriptions[requested]) setTheme(requested);
document.querySelectorAll('[data-theme][aria-pressed]').forEach(button => button.addEventListener('click', () => setTheme(button.dataset.theme)));
const routes = {'Bag':'bag','Settings':'settings','Pokémon':'collection','Catch':'catch','Rewards':'rewards','More':'more','Party editor':'party','Continue battle':'result','Trainer battle':'play','Dungeons':'play','Battle Tower':'play'};
const dialog = document.querySelector('#preview');
document.querySelectorAll('[data-preview]').forEach(button => button.addEventListener('click', () => {
  document.querySelector('#preview-title').textContent = button.dataset.preview;
  document.querySelector('#study-link').href = `./?state=ready#${routes[button.dataset.preview]}`;
  dialog.showModal();
}));
document.querySelectorAll('img').forEach(image => image.addEventListener('error', () => { image.style.visibility = 'hidden'; }, {once:true}));
