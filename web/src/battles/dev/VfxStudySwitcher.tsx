/** Shared floating control for throwaway VFX comparisons. */
import { useEffect } from "react";

export const VfxStudySwitcher = ({ title, variants, names, variant, onChange }: {
  title: string;
  variants: readonly string[];
  names: Record<string, string>;
  variant: string;
  onChange: (next: string) => void;
}) => {
  const advance = (direction: number) => {
    const index = variants.indexOf(variant);
    onChange(variants[(index + direction + variants.length) % variants.length]);
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        advance(event.key === "ArrowLeft" ? -1 : 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [variant, variants, onChange]);
  return <nav className="battle-vfx-study-switcher" aria-label={`${title} variants`}>
    <button type="button" onClick={() => advance(-1)} aria-label="Previous VFX variant">←</button>
    <span><small>{title}</small><strong>{names[variant]}</strong></span>
    <button type="button" onClick={() => advance(1)} aria-label="Next VFX variant">→</button>
  </nav>;
};
