import type { ReactNode } from "react";

type Props = {
  label: ReactNode;
  children?: ReactNode;
  as?: "h2" | "h3" | "div";
  className?: string;
  id?: string;
};

/** Black sign band that names a work area. */
export default function SignBand({ label, children, as: Tag = "h2", className = "", id }: Props) {
  return (
    <div className={`band flex min-h-[40px] shrink-0 items-center justify-between gap-3 px-4 ${className}`}>
      <Tag id={id} className="band-label">{label}</Tag>
      {children ? <div className="flex items-center gap-2 text-[12px] text-band-ink2">{children}</div> : null}
    </div>
  );
}
