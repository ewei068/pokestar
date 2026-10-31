const variantNotes = {
  original:'Original Dusk — unchanged reference.',
  clear:'More landscape, lighter lettering. Gold for Continue; blue, green and red for battle choices.',
  jewel:'The same layout and lighter lettering, with sapphire, jade and amethyst against warm gold.',
};
function chooseVariant(variant) {
  document.body.dataset.variant = variant;
  document.querySelector('#direction-note').textContent = variantNotes[variant];
  document.querySelectorAll('[data-variant][aria-pressed]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.variant === variant)));
  const url = new URL(location.href); url.searchParams.delete('theme'); url.searchParams.set('variant',variant); history.replaceState(null,'',url);
}
const initialVariant = new URLSearchParams(location.search).get('variant');
chooseVariant(Object.hasOwn(variantNotes,initialVariant) ? initialVariant : 'clear');
document.querySelectorAll('[data-variant][aria-pressed]').forEach(button => button.addEventListener('click', () => chooseVariant(button.dataset.variant)));
