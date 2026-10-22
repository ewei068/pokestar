const abbreviations: Record<string, string> = {
  Burn: "BRN", Poison: "PSN", Toxic: "TOX", BadPoison: "TOX", "Badly Poison": "TOX",
  Sleep: "SLP", Freeze: "FRZ", Paralysis: "PAR",
};

export const StatusLabel = ({ statusId, className = "", onClick }: {
  statusId: string;
  className?: string;
  onClick?: () => void;
}) => {
  const abbreviation = abbreviations[statusId] || statusId.slice(0, 3).toUpperCase();
  const props = { className: `arena-status-label ${className}`, "data-status": abbreviation,
    title: statusId, "aria-label": `Status: ${statusId}` };
  return onClick ? <button type="button" {...props} onClick={onClick}>{abbreviation}</button>
    : <span {...props}>{abbreviation}</span>;
};
