import { useEffect, useRef, useState } from "react";

export const useTargetConfirmation = (scope: string | null, targetIds: string[], submit: (id: string) => void) => {
  const [pending, setPending] = useState<{ scope: string; id: string } | null>(null);
  const pendingRef = useRef(pending);
  const clear = () => { pendingRef.current = null; setPending(null); };
  useEffect(() => { clear(); }, [scope]);
  const pendingTargetId = pending?.scope === scope && targetIds.includes(pending.id) ? pending.id : null;
  return {
    pendingTargetId,
    clear,
    choose: (id: string, pointerType: string) => {
      if (!scope || !targetIds.includes(id)) return;
      const current = pendingRef.current;
      if ((pointerType === "touch" || pointerType === "pen") &&
          (current?.scope !== scope || current.id !== id)) {
        const next = { scope, id };
        pendingRef.current = next;
        setPending(next);
        return;
      }
      clear();
      submit(id);
    },
    confirm: () => {
      const current = pendingRef.current;
      if (!current || current.scope !== scope || !targetIds.includes(current.id)) return;
      clear();
      submit(current.id);
    },
  };
};
