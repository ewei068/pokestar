export const TypeBadge = ({ type }: { type: string }) => (
  <span className="ui-badge ui-type-badge" data-type={type.toLowerCase()}>{type}</span>
);
