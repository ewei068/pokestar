// Training-study adapter over the existing collection preview; no gameplay writes.
// Reusing that preview keeps the invoking collection and its inspection intact.
const enableTraining = () => {
  const train = document.querySelector("[data-train]");
  if (train && train.textContent !== "Train") train.textContent = "Train";
};
new MutationObserver(enableTraining).observe(document.querySelector("#page"), { childList: true, subtree: true });
enableTraining();
// Restore the invoking history entry even when the browser reloads it instead
// of retaining the document in its back/forward cache.
const savedCollection = window.history.state?.trainingCollection;
if (savedCollection) {
  filters = savedCollection.filters;
  sortKey = savedCollection.sortKey;
  descending = savedCollection.descending;
  currentPage = savedCollection.currentPage;
  pageSize = savedCollection.pageSize;
  labelMode = savedCollection.labelMode;
  selectedId = savedCollection.selectedId;
  inspectorTab = savedCollection.inspectorTab;
  sheet = savedCollection.sheet;
  formation = savedCollection.formation;
  render();
  requestAnimationFrame(() => {
    document.querySelector(".collection-scroll").scrollTop = savedCollection.scroll;
    window.scrollTo(0, savedCollection.pageScroll);
  });
}
document.addEventListener("click", event => {
  if (!event.target.closest("[data-train]")) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const selected = byId(selectedId);
  if (!selected) return;
  window.history.replaceState({ ...window.history.state, trainingCollection: {
    filters: { ...filters }, sortKey, descending, currentPage, pageSize, labelMode,
    selectedId, inspectorTab, sheet, formation: [...formation],
    scroll: document.querySelector(".collection-scroll").scrollTop,
    pageScroll: window.scrollY,
  } }, "", window.location.href);
  const url = new URL("preview.html", window.location.href);
  for (const [key, value] of Object.entries({ id: selected.id, species: selected.speciesId,
    name: selected.name, level: selected.level, from: window.location.href })) {
    url.searchParams.set(key, value);
  }
  window.location.assign(url.href);
}, true);
