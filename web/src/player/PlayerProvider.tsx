import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { TrainerProfile } from "../trainer/types";
import { PlayerData } from "./PlayerData";

const Context = createContext<PlayerData | null>(null);
export const PlayerProvider = ({ userId, trainer, onAccountChanged, children }: {
  userId: string; trainer: TrainerProfile | null; onAccountChanged: () => void; children: ReactNode;
}) => {
  const [data] = useState(() => new PlayerData(userId, trainer, onAccountChanged));
  useEffect(() => { data.activate(); return () => data.dispose(); }, [data]);
  return <Context.Provider value={data}><QueryClientProvider client={data.client}>{children}</QueryClientProvider></Context.Provider>;
};
export const usePlayer = () => {
  const data = useContext(Context);
  if (!data) throw new Error("PlayerProvider is required");
  return data;
};
