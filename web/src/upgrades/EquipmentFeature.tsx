import { usePlayer } from "../player/PlayerProvider";
import { EquipmentPanel } from "./EquipmentPanel";
import { usePokemonEquipment } from "./usePokemonEquipment";

function EquipmentSession({ pokemonId }: { pokemonId: string }) {
  const equipment = usePokemonEquipment(pokemonId);
  return <EquipmentPanel {...equipment} onUpgrade={type => { void equipment.upgrade(type); }}
    onReroll={(type, slot) => { void equipment.reroll(type, slot); }} onRefresh={() => { void equipment.refresh(); }} />;
}
export function EquipmentFeature({ pokemonId }: { pokemonId: string }) {
  const data = usePlayer();
  return <EquipmentSession key={`${data.userId}:${pokemonId}`} pokemonId={pokemonId} />;
}
