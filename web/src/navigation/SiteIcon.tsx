export const SiteIcon = ({ name }: { name: "play" | "pokemon" | "catch" | "rewards" | "more" | "bag" | "settings" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === "play" && <><path d="m5 3 14 14-2 2L3 5V3h2Zm14 0L5 17m-2-3 7 7m4-18 7 7" /><path d="m4 20 2-2m12 0 2 2" /></>}
    {name === "pokemon" && <><circle cx="12" cy="12" r="8" /><path d="M4 12h5m6 0h5" /><circle cx="12" cy="12" r="3" /></>}
    {name === "catch" && <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5" /><circle cx="12" cy="12" r="5" /><path d="M7 12h10" /></>}
    {name === "rewards" && <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></>}
    {name === "more" && <>{[5, 12, 19].map(cx => <circle key={cx} cx={cx} cy="12" r="1" fill="currentColor" />)}</>}
    {name === "bag" && <><path d="M5 8h14l1 13H4L5 8Zm3 0V6a4 4 0 0 1 8 0v2" /><path d="M8 13h8v5H8z" /></>}
    {name === "settings" && <><path d="m9 3-1 3-3 1-2 3 2 2-1 3 2 3 3-1 2 3h3l1-3 3-1 2-3-2-2 1-3-2-3-3 1-2-3H9Z" /><circle cx="11.5" cy="11.5" r="3" /></>}
  </svg>
);
