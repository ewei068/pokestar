import { useEffect, useRef } from "react";

/** Native details menus share outside-pointer dismissal without stealing focus. */
export function useDismissDetails() {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      const menu = ref.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, []);
  return ref;
}
