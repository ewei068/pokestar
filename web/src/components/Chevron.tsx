export const Chevron = ({ up = false }: { up?: boolean }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path d={up ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);
