export type TrainerProfile = {
  displayName: string;
  avatarUrl: string | null;
  level: number;
  money: number;
  exp: { current: number; required: number } | null;
};
