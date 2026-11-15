import type { Ref } from "react";

type PageBackProps = { label: string; className?: string } &
  ({ href: string; onBack?: never; buttonRef?: never } | { href?: never; onBack: () => void; buttonRef?: Ref<HTMLButtonElement> });

/** Return to a parent view. An in-place return can restore local scroll and focus. */
export function PageBack({ label, className, href, onBack, buttonRef }: PageBackProps) {
  const classes = className ? `page-back ${className}` : "page-back";
  const content = <><span aria-hidden="true">←</span> {label}</>;
  return href !== undefined
    ? <a className={classes} href={href}>{content}</a>
    : <button type="button" className={classes} onClick={onBack} ref={buttonRef}>{content}</button>;
}
