/** Shared deterministic math; authored geometry remains in the renderers. */
export type Colors = { main: string; light: string; dark: string };
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const ease = (value: number) => 1 - (1 - clamp(value)) ** 3;
export const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
