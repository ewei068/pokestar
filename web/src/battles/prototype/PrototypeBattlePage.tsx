/** Throwaway UI study: which battle layout best balances board clarity and dense controls? */
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { BattleCatalog, BattleDisplay, PokemonView, TargetPreview } from "../types";
import "./prototype.css";

type Variant = "A" | "B";
const variants: Variant[] = ["A", "B"];
const variantNames: Record<Variant, string> = {
  A: "Inline commands", B: "Quick command tray",
};
const sprite = (id: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const catalog: BattleCatalog = {
  rulesetVersion: 2,
  species: Object.fromEntries([
    ["157", "Typhlosion", ["fire"]], ["282", "Gardevoir", ["psychic", "fairy"]],
    ["448", "Lucario", ["fighting", "steel"]], ["197", "Umbreon", ["dark"]],
    ["131", "Lapras", ["water", "ice"]], ["149", "Dragonite", ["dragon", "flying"]],
    ["94", "Gengar", ["ghost", "poison"]], ["59", "Arcanine", ["fire"]],
    ["407", "Roserade", ["grass", "poison"]], ["26", "Raichu", ["electric"]],
    ["350", "Milotic", ["water"]], ["248", "Tyranitar", ["rock", "dark"]],
  ].map(([id, name, type]) => [id as string, {
    name: name as string, type: type as string[], sprite: sprite(Number(id)), shinySprite: sprite(Number(id)),
  }])),
  moves: {
    flamethrower: { name: "Flamethrower", type: "fire", power: 90, accuracy: 100,
      cooldown: 0, damageType: "Special", targetPattern: "One Pokémon",
      description: "A searing stream of fire that may leave the target burned." },
    eruption: { name: "Eruption", type: "fire", power: 150, accuracy: 100,
      cooldown: 0, damageType: "Special", targetPattern: "All enemy tiles",
      description: "A volcanic burst. Its force rises with the user's remaining HP." },
    quickattack: { name: "Quick Attack", type: "normal", power: 40, accuracy: 100,
      cooldown: 0, damageType: "Physical", targetPattern: "One Pokémon",
      description: "A sudden lunge that strikes before the foe can react." },
    sunnyday: { name: "Sunny Day", type: "fire", accuracy: 100,
      cooldown: 3, damageType: "Status", targetPattern: "Field",
      description: "Bright sunlight fills the battlefield for several turns." },
  },
  effects: { shield: { name: "Shielded", description: "Reduces incoming damage. 2 turns remain." },
    haste: { name: "Haste", description: "Raises combat readiness gain." } },
  abilities: { blaze: { name: "Blaze", description: "Strengthens Fire moves when HP is low." }, steadfast: { name: "Steadfast" },
    innerfocus: { name: "Inner Focus" }, synchronize: { name: "Synchronize" },
    waterabsorb: { name: "Water Absorb" }, multiscale: { name: "Multiscale" } },
  heldItems: { charcoal: { name: "Charcoal", description: "Strengthens Fire moves." }, leftovers: { name: "Leftovers" },
    sitrus: { name: "Sitrus Berry" }, lens: { name: "Wide Lens" },
    shell: { name: "Shell Bell" }, band: { name: "Choice Band" } },
};

const makePokemon = (id: number, teamName: string, position: number, hp: number,
  maxHp: number, combatReadiness: number, extra: Partial<PokemonView> = {}): PokemonView => {
  const species = catalog.species[String(id)];
  return {
    id: `${teamName}-${id}`, speciesId: String(id), name: species.name,
    shiny: false, hp, maxHp, level: 55, isFainted: hp === 0,
    combatReadiness, position, teamName, type1: species.type[0], type2: species.type[1],
    status: {}, effectIds: {}, ...extra,
  };
};
const own = "Star Team";
const enemy = "Rival Team";
const pokemonList = [
  makePokemon(157, own, 1, 168, 204, 100, { abilityId: "blaze", heldItemId: "charcoal",
    moveIds: { flamethrower: { cooldown: 0, disabledCounter: 0 },
      eruption: { cooldown: 0, disabledCounter: 0 },
      quickattack: { cooldown: 0, disabledCounter: 0 },
      sunnyday: { cooldown: 0, disabledCounter: 0 } } }),
  makePokemon(448, own, 2, 126, 180, 72, { effectIds: { shield: { duration: 2 } }, abilityId: "steadfast", heldItemId: "band" }),
  makePokemon(149, own, 3, 190, 220, 61, { abilityId: "multiscale", heldItemId: "sitrus" }),
  makePokemon(282, own, 4, 151, 190, 46, { abilityId: "synchronize", heldItemId: "lens" }),
  makePokemon(131, own, 5, 82, 205, 35, { status: { statusId: "burn", turns: 2 }, abilityId: "waterabsorb", heldItemId: "shell" }),
  makePokemon(197, own, 6, 176, 188, 28, { abilityId: "innerfocus", heldItemId: "leftovers" }),
  makePokemon(94, enemy, 1, 115, 175, 89),
  makePokemon(59, enemy, 2, 176, 202, 78),
  makePokemon(248, enemy, 3, 224, 244, 59),
  makePokemon(407, enemy, 4, 91, 160, 54),
  makePokemon(350, enemy, 5, 178, 220, 42),
];
const pokemon = Object.fromEntries(pokemonList.map((entry) => [entry.id, entry]));
const battle: BattleDisplay = {
  battleId: "prototype", rulesetVersion: 2, revision: 17, status: "active",
  completionStatus: "none", mode: { type: "Trainer battle" },
  myTeamNames: [own], isMyTurn: true,
  view: {
    battleId: "prototype", ended: false, winner: null, turn: 12,
    activePokemonId: `${own}-157`, weather: { weatherId: "sun", duration: 3 },
    teams: { [own]: { rows: 2, cols: 4 }, [enemy]: { rows: 2, cols: 4 } }, pokemon,
  },
  availableActions: { canSkip: true, moves: [] },
};
const enemyTargets = pokemonList.filter((mon) => mon.teamName === enemy).map((mon) => mon.id);
const makePreviews = (targetIds: string[], area: boolean): TargetPreview[] => targetIds.map((id) => {
  const primary = pokemon[id];
  const patternTiles = area
    ? Array.from({ length: 8 }, (_, index) => ({ teamName: primary.teamName, position: index + 1 }))
    : [{ teamName: primary.teamName, position: primary.position }];
  return { primaryTargetPokemonId: id, targetPattern: area ? "all" : "single", random: false,
    patternTiles,
    affectedPokemonIds: area ? enemyTargets : [id],
    emptyTileTargets: patternTiles.filter((tile) => !pokemonList.some((mon) =>
      mon.teamName === tile.teamName && mon.position === tile.position)) };
});
battle.availableActions.moves = [
  { moveId: "flamethrower", targetPokemonIds: enemyTargets, targetPreviews: makePreviews(enemyTargets, false) },
  { moveId: "eruption", targetPokemonIds: enemyTargets, targetPreviews: makePreviews(enemyTargets, true) },
  { moveId: "quickattack", targetPokemonIds: enemyTargets, targetPreviews: makePreviews(enemyTargets, false) },
  { moveId: "sunnyday", targetPokemonIds: [`${own}-157`], targetPreviews: makePreviews([`${own}-157`], false) },
];

const percent = (value: number, max = 100) => Math.max(0, Math.min(100, value / max * 100));
const typeClass = (type: string) => `proto-type proto-type-${type.toLowerCase()}`;
const typeBadge = (type: string) => <span className={typeClass(type)} key={type}>{type}</span>;

type PreviewState = {
  selectedMoveId: string | null;
  hoveredMoveId: string | null;
  inspectedId: string;
  hoveredId: string | null;
  pinnedTargetId: string | null;
  footprint: TargetPreview | null;
  detail: { category: string; name: string; description: string } | null;
  inspectorFocus: "move" | "pokemon";
  message: string;
  chooseMove: (id: string | null) => void;
  hoverMove: (id: string | null) => void;
  skip: () => void;
  inspect: (id: string) => void;
  hover: (id: string | null) => void;
  chooseTarget: (id: string) => void;
  inspectDetail: (detail: { category: string; name: string; description: string }) => void;
  backDetail: () => void;
};

const PokemonTile = ({ entry, preview, compact = false }: {
  entry: PokemonView; preview: PreviewState; compact?: boolean;
}) => {
  const targetable = !!preview.selectedMoveId && battle.availableActions.moves
    .find((move) => move.moveId === preview.selectedMoveId)?.targetPokemonIds.includes(entry.id);
  const inPattern = preview.footprint?.patternTiles.some((tile) =>
    tile.teamName === entry.teamName && tile.position === entry.position);
  const affected = preview.footprint?.affectedPokemonIds.includes(entry.id);
  const primary = preview.footprint?.primaryTargetPokemonId === entry.id;
  const effects = Object.keys(entry.effectIds).length;
  return <button type="button" className={`proto-mon ${compact ? "proto-mon-small" : ""} ${
    entry.id === battle.view.activePokemonId ? "is-active" : ""} ${
    entry.id === preview.inspectedId ? "is-inspected" : ""} ${
    targetable ? "is-targetable" : ""} ${inPattern ? "is-in-pattern" : ""} ${
    affected ? "is-affected" : ""} ${primary ? "is-primary" : ""} ${entry.isFainted ? "is-fainted" : ""}`}
    onClick={() => targetable ? preview.chooseTarget(entry.id) : preview.inspect(entry.id)}
    onMouseEnter={() => preview.hover(entry.id)} onMouseLeave={() => preview.hover(null)}
    onFocus={() => preview.hover(entry.id)} onBlur={() => preview.hover(null)}
    aria-label={`${entry.name}, ${entry.hp} of ${entry.maxHp} HP, ${Math.round(entry.combatReadiness)} percent combat readiness${targetable ? ", choose target" : ", inspect"}`}>
    <span className="proto-mon-head"><strong>{entry.name}</strong><small>Lv {entry.level}</small></span>
    <span className="proto-mon-main"><img src={sprite(Number(entry.speciesId))} alt="" />
      <span className="proto-mon-ornaments"><span className="proto-mon-types">{[entry.type1, entry.type2].filter(Boolean).map((type) =>
        <i className={`proto-type-dot proto-type-${String(type).toLowerCase()}`} key={type} />)}</span>
        {entry.status.statusId && <span className="proto-status">{entry.status.statusId}</span>}
        {effects > 0 && <span className="proto-effect-count" title={`${effects} active effect${effects === 1 ? "" : "s"}`}>✧ {effects}</span>}
      </span></span>
    <span className="proto-mon-stats">
      <span className="proto-stat-line"><span aria-hidden="true">♥</span><span className="proto-meter proto-hp">
        <i style={{ width: `${percent(entry.hp, entry.maxHp)}%` }} /></span>
        <small>{entry.hp}/{entry.maxHp}</small></span>
      <span className="proto-stat-line"><span aria-hidden="true">⚡</span><span className="proto-meter proto-cr">
        <i style={{ width: `${percent(entry.combatReadiness)}%` }} /></span>
        <small>{Math.round(entry.combatReadiness)}%</small></span>
    </span>
  </button>;
};

const TeamBoard = ({ teamName, preview, orientation }: {
  teamName: string; preview: PreviewState; orientation: "facing" | "vertical";
}) => {
  const dimensions = battle.view.teams[teamName];
  const isOwn = teamName === own;
  return <section className={`proto-team proto-team-${isOwn ? "own" : "enemy"} proto-team-${orientation}`}>
    <div className="proto-team-label"><strong>{teamName}</strong><span className="proto-front-desktop">{
      orientation === "facing" ? isOwn ? "YOU · FRONT →" : "← FRONT · RIVAL"
        : isOwn ? "FRONT ↑ · YOU" : "RIVAL · FRONT ↓"
    }</span><span className="proto-front-mobile">{isOwn ? "FRONT ↑ · YOU" : "RIVAL · FRONT ↓"}</span></div>
    <div className="proto-grid" style={{
      "--grid-rows": dimensions.rows, "--grid-cols": dimensions.cols,
    } as CSSProperties}>
      {Array.from({ length: dimensions.rows * dimensions.cols }, (_, index) => {
        const row = Math.floor(index / dimensions.cols);
        const col = index % dimensions.cols;
        const entry = pokemonList.find((mon) => mon.teamName === teamName && mon.position === index + 1);
        const cellStyle = {
          "--face-col": isOwn ? dimensions.rows - row : row + 1,
          "--face-row": col + 1,
          "--vert-col": col + 1,
          "--vert-row": isOwn ? row + 1 : dimensions.rows - row,
        } as CSSProperties;
        const pattern = preview.footprint?.patternTiles.some((tile) =>
          tile.teamName === teamName && tile.position === index + 1);
        return <div className={`proto-cell ${pattern ? "is-pattern-cell" : ""}`} style={cellStyle} key={index}>
          {entry ? <PokemonTile entry={entry} preview={preview} compact /> : <span className={`proto-empty ${pattern ? "is-empty-affected" : ""}`} />}
        </div>;
      })}
    </div>
  </section>;
};

const ReadinessRail = () => <section className="proto-readiness" aria-label="Combat readiness">
  <div><strong>⚡ Combat readiness</strong><small title="Speed can change who acts next">Speed affects turn order</small></div>
  <div className="proto-readiness-line">{[...pokemonList].filter((mon) => !mon.isFainted)
    .sort((a, b) => b.combatReadiness - a.combatReadiness).slice(0, 8).map((mon) =>
      <span className={mon.teamName === own ? "is-own" : "is-enemy"} key={mon.id}
        title={`${mon.name}: ${Math.round(mon.combatReadiness)}% readiness`}>
        <img src={sprite(Number(mon.speciesId))} alt="" /><small>{Math.round(mon.combatReadiness)}</small>
      </span>)}</div>
</section>;

const MoveDock = ({ preview }: { preview: PreviewState }) => <section className="proto-moves">
  <div className="proto-section-head"><h2>Choose an action</h2><span>Typhlosion's turn</span></div>
  <div className="proto-move-grid">{Object.entries(catalog.moves).map(([id, move]) => {
    const legal = battle.availableActions.moves.some((option) => option.moveId === id);
    return <button type="button" key={id} aria-disabled={!legal}
      className={`proto-move ${preview.selectedMoveId === id ? "is-selected" : ""}`}
      onClick={() => { if (legal) preview.chooseMove(preview.selectedMoveId === id ? null : id); }}
      onMouseEnter={() => preview.hoverMove(id)} onMouseLeave={() => preview.hoverMove(null)}
      onFocus={() => preview.hoverMove(id)} onBlur={() => preview.hoverMove(null)}
      title={move.description}>
      <span className="proto-move-name"><i className={`proto-type-dot proto-type-${move.type}`} />{move.name}</span>
      <span className="proto-move-meta">{typeBadge(move.type)}<small>{move.damageType === "Physical" ? "⚔ PHY" : move.damageType === "Special" ? "✦ SPEC" : "◌ STATUS"}</small></span>
      {!legal && <span className="proto-cooldown">CD {move.cooldown}</span>}
    </button>;
  })}</div>
  <div className="proto-action-foot"><span>{preview.footprint
    ? `${preview.footprint.affectedPokemonIds.length} Pokémon · ${preview.footprint.emptyTileTargets.length} empty tiles in pattern`
    : preview.selectedMoveId ? "Hover or tap a target to see the full pattern" : "Select a move to see targets"}</span>
    <button type="button" onClick={preview.skip}>↷ Skip</button></div>
</section>;

const Inspector = ({ preview }: { preview: PreviewState }) => {
  const move = catalog.moves[preview.hoveredMoveId || (
    !preview.hoveredId && preview.inspectorFocus === "move" ? preview.selectedMoveId || "" : "")];
  const entry = pokemon[preview.hoveredId || preview.pinnedTargetId || preview.inspectedId];
  return <section className="proto-info proto-inspector"><div className="proto-section-head"><h2>Inspect</h2><span>ⓘ</span></div>
    {preview.detail ? <div className="proto-detail">
      <button type="button" className="proto-back" onClick={preview.backDetail}>← Back</button>
      <small>{preview.detail.category}</small><strong>{preview.detail.name}</strong><p>{preview.detail.description}</p>
    </div> : move ? <><strong>{move.name}</strong><p>{move.description}</p>
      <div className="proto-info-facts">{typeBadge(move.type)}<span>{move.damageType}</span>
        <span>Power {move.power ?? "—"}</span><span>Accuracy {move.accuracy ?? "—"}</span>
        <span>{move.targetPattern}</span></div></>
      : <><div className="proto-inspect-head"><img src={sprite(Number(entry.speciesId))} alt="" />
        <div><strong>{entry.name}</strong><small>Lv {entry.level} · {entry.teamName}</small>
          <span className="proto-info-types">{[entry.type1, entry.type2].filter(Boolean).map((type) => typeBadge(String(type)))}</span></div></div>
        <div className="proto-inspect-bars"><span>♥ HP <strong>{entry.hp}/{entry.maxHp}</strong></span>
          <span className="proto-meter proto-hp"><i style={{ width: `${percent(entry.hp, entry.maxHp)}%` }} /></span>
          <span>⚡ Readiness <strong>{Math.round(entry.combatReadiness)}%</strong></span>
          <span className="proto-meter proto-cr"><i style={{ width: `${percent(entry.combatReadiness)}%` }} /></span></div>
        <div className="proto-inspect-tags">
          {entry.status.statusId && <button type="button" className="is-status" onClick={() => preview.inspectDetail({
            category: "Status · 2 turns", name: "Burn", description: "Burn deals damage over time and weakens physical attacks.",
          })}>◉ {entry.status.statusId}</button>}
          {Object.keys(entry.effectIds).map((id) => <button type="button" className="is-effect" key={id}
            onClick={() => preview.inspectDetail({ category: "Buff · 2 turns", name: catalog.effects[id]?.name || id,
              description: catalog.effects[id]?.description || "An active battle effect." })}>
            ✧ {catalog.effects[id]?.name || id} · {entry.effectIds[id]?.duration ?? "?"}</button>)}
          {entry.abilityId && <button type="button" className="is-ability" onClick={() => preview.inspectDetail({
            category: "Ability", name: catalog.abilities[entry.abilityId!]?.name || entry.abilityId!,
            description: catalog.abilities[entry.abilityId!]?.description || "This Pokémon's passive ability.",
          })}>✦ {catalog.abilities[entry.abilityId]?.name || entry.abilityId}</button>}
          {entry.heldItemId && <button type="button" className="is-item" onClick={() => preview.inspectDetail({
            category: "Held item", name: catalog.heldItems[entry.heldItemId!]?.name || entry.heldItemId!,
            description: catalog.heldItems[entry.heldItemId!]?.description || "An item held by this Pokémon.",
          })}>◇ {catalog.heldItems[entry.heldItemId]?.name || entry.heldItemId}</button>}
        </div></>}
  </section>;
};

const EventLine = ({ message }: { message: string }) => <div className="proto-event">
  <span className="proto-event-spark" aria-hidden="true">✦</span><strong>{message}</strong>
  <span>Turn {battle.view.turn}</span></div>;

const EventLog = () => <section className="proto-log"><div className="proto-section-head"><h2>Battle log</h2><span>↗</span></div>
  <p><b>Typhlosion</b> used Quick Attack.</p><p><b>Gengar</b> lost 26 HP.</p>
  <p><b>Gengar</b> used Shadow Ball.</p><p><b>Typhlosion</b> lost 36 HP.</p>
</section>;

const FacingArena = ({ preview }: { preview: PreviewState }) => <>
  <div className="proto-layout proto-layout-a"><div className="proto-primary">
    <div className="proto-facing-board"><TeamBoard teamName={own} preview={preview} orientation="facing" />
      <div className="proto-versus">VS</div><TeamBoard teamName={enemy} preview={preview} orientation="facing" /></div>
    <EventLine message={preview.message} /><EventLog /><ReadinessRail /></div>
    <aside className="proto-sidebar"><MoveDock preview={preview} /><Inspector preview={preview} /></aside></div>
</>;

const readVariant = (): Variant => {
  const value = new URLSearchParams(window.location.search).get("variant")?.toUpperCase();
  return variants.includes(value as Variant) ? value as Variant : "A";
};

export const PrototypeBattlePage = () => {
  const [variant, setVariant] = useState<Variant>(readVariant);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [hoveredMoveId, setHoveredMoveId] = useState<string | null>(null);
  const [inspectedId, setInspectedId] = useState(`${own}-157`);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedTargetId, setPinnedTargetId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PreviewState["detail"]>(null);
  const [inspectorFocus, setInspectorFocus] = useState<PreviewState["inspectorFocus"]>("pokemon");
  const [message, setMessage] = useState("Typhlosion is ready. Choose an action.");
  const switchVariant = (direction: number) => {
    const next = variants[(variants.indexOf(variant) + direction + variants.length) % variants.length];
    const url = new URL(window.location.href);
    url.searchParams.set("variant", next);
    window.history.replaceState(null, "", url);
    setVariant(next);
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      switchVariant(event.key === "ArrowLeft" ? -1 : 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
  const moveOption = battle.availableActions.moves.find((move) => move.moveId === selectedMoveId);
  const footprint = moveOption?.targetPreviews?.find((target) =>
    target.primaryTargetPokemonId === hoveredId && moveOption.targetPokemonIds.includes(hoveredId))
    || moveOption?.targetPreviews?.find((target) => target.primaryTargetPokemonId === pinnedTargetId)
    || null;
  const preview: PreviewState = {
    selectedMoveId, hoveredMoveId, inspectedId, hoveredId, pinnedTargetId, footprint, detail, inspectorFocus, message,
    chooseMove: (id) => { setSelectedMoveId(id); setPinnedTargetId(null); setDetail(null); setInspectorFocus("move"); setMessage(id ? `Choose a target for ${catalog.moves[id]?.name}.` : "Typhlosion is ready. Choose an action."); },
    hoverMove: setHoveredMoveId,
    skip: () => { setSelectedMoveId(null); setPinnedTargetId(null); setMessage("Preview: Skip turn. No action was sent."); },
    inspect: (id) => { setInspectedId(id); setPinnedTargetId(null); setDetail(null); setInspectorFocus("pokemon"); }, hover: setHoveredId,
    chooseTarget: (id) => { setInspectedId(id); setPinnedTargetId(id); setDetail(null); setInspectorFocus("pokemon"); setMessage(`Preview: ${catalog.moves[selectedMoveId || ""]?.name} → ${pokemon[id].name}. No action was sent.`); },
    inspectDetail: setDetail, backDetail: () => setDetail(null),
  };
  const inspected = pokemon[hoveredId || inspectedId];
  return <div className={`proto-page proto-variant-${variant.toLowerCase()}`}><header className="proto-site-header">
    <a href="/?prototypeBattle=1" className="proto-logo"><span>✦</span> POKESTAR</a>
    <nav aria-label="Prototype navigation"><span>Battles</span><span>Pokémon</span><span>Bag</span><span>Quests</span></nav>
    <span className="proto-demo-tag">DESIGN STUDY · SAMPLE DATA</span></header>
    <main className="proto-shell"><div className="proto-topline"><div><small>TRAINER BATTLE <span>·</span> TURN 12</small>
      <h1>Star Team <em>vs</em> Rival Team</h1></div><div className="proto-weather">☀ <span>Sunlight<br /><small>3 turns</small></span></div></div>
      <FacingArena preview={preview} />
      <p className="proto-state">Preview state: {variantNames[variant]} · move {selectedMoveId || "none"} · primary {footprint?.primaryTargetPokemonId || "none"} · tiles {footprint?.patternTiles.length || 0} · inspected {inspected.name}</p>
    </main><div className="proto-switcher" aria-label="Prototype layouts">
      <button type="button" onClick={() => switchVariant(-1)} aria-label="Previous layout">←</button>
      <span><small>MOBILE CONTROLS {variant} OF 2</small><strong>{variantNames[variant]}</strong></span>
      <button type="button" onClick={() => switchVariant(1)} aria-label="Next layout">→</button>
    </div></div>;
};
