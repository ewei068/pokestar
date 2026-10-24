import { BattleScreen } from "./BattleScreen";
import type { BattleCatalog } from "./types";
import { useBattleSession } from "./useBattleSession";

export const BattlePage = ({ battleId, catalog }: { battleId: string; catalog: BattleCatalog }) => {
  const session = useBattleSession(battleId, catalog);
  return <BattleScreen catalog={catalog} session={session} />;
};
