const variantNotes = {
  original:'Original Dusk Arcade — the reference point from the previous round.',
  neon:'Electric accents, angular frames and bold encounter cards. A louder arcade direction.',
  ember:'Copper frames, a warm field backdrop and illustrated encounter tiles. An expedition-menu direction.',
  moon:'An open landscape, floating party labels and a prominent Continue panel. A quieter, more cinematic direction.',
};
function chooseVariant(variant) {
  document.body.dataset.variant = variant;
  document.querySelector('#direction-note').textContent = variantNotes[variant];
  document.querySelectorAll('[data-variant][aria-pressed]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.variant === variant)));
  const url = new URL(location.href); url.searchParams.delete('theme'); url.searchParams.set('variant',variant); history.replaceState(null,'',url);
}
const initialVariant = new URLSearchParams(location.search).get('variant');
chooseVariant(Object.hasOwn(variantNotes,initialVariant) ? initialVariant : 'neon');
document.querySelectorAll('[data-variant][aria-pressed]').forEach(button => button.addEventListener('click', () => chooseVariant(button.dataset.variant)));
