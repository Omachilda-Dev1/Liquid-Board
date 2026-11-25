import type { Asset } from "@/lib/mockData";

type Props = {
  asset: Pick<Asset, "symbol" | "route" | "routeInk">;
  size?: number;
  /** Unselected markets carry their colour at reduced strength. */
  muted?: boolean;
  className?: string;
};

export default function RouteBullet({ asset, size = 28, muted = false, className = "" }: Props) {
  const label = asset.symbol;
  const fontSize = Math.max(label.length > 3 ? 8 : 9, Math.round(size * (label.length > 3 ? 0.3 : 0.36)));
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-extrabold tracking-[-0.02em] transition-[filter,opacity] duration-300 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize,
        background: asset.route,
        color: asset.routeInk,
        filter: muted ? "saturate(0.35)" : undefined,
        opacity: muted ? 0.8 : 1,
      }}
    >
      {label}
    </span>
  );
}
