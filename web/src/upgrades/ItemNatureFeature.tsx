import { useState } from "react";
import { usePlayer } from "../player/PlayerProvider";
import { ItemNaturePanel } from "./ItemNaturePanel";
import { usePokemonBuild } from "./usePokemonBuild";

function ItemNatureSession({ pokemonId }: { pokemonId: string }) {
  const build = usePokemonBuild(pokemonId);
  const [selection, setSelection] = useState("");
  const natureId = build.context?.natures.some(nature => nature.id === selection) ? selection : "";
  return <ItemNaturePanel {...build} natureId={natureId} onNatureChange={setSelection}
    onChangeNature={() => { void build.changeNature(natureId); }}
    onHeldItemChange={id => { void build.changeHeldItem(id); }} onRefresh={() => { void build.refresh(); }} />;
}
export function ItemNatureFeature({ pokemonId }: { pokemonId: string }) {
  const data = usePlayer();
  return <ItemNatureSession key={`${data.userId}:${pokemonId}`} pokemonId={pokemonId} />;
}
