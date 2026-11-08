import type { TrainingContext, TrainingGains } from "../player/types";

export type TrainingPanelProps = {
  context: TrainingContext | undefined;
  locationId: string;
  onLocationChange: (id: string) => void;
  onToggle: () => void;
  running: boolean;
  pending: boolean;
  totals: TrainingGains;
  error: string | null;
  onRefresh: () => void;
  loading: boolean;
  refreshing: boolean;
};
