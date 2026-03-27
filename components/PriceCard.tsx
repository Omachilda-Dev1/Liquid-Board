"use client";
import { Asset, formatLargeNum } from "@/lib/mockData";

type Props = {
  asset: Asset;
  price: number;
  prevPrice: number;
  selected: boolean;
  onClick: () => void;
};

export default function PriceCard({ asset, price, prevPrice, selected, onClick }: Props) {
  const up = price >= prevPrice;
  const flashClass = price !== prevPrice ? (up ? "flash-up" : "flash-down") : "";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${flashClass} ${selected ? "glow-olive" : ""}`}
      style={{
        background: selected ? "var(--olive-dim)" : "var(--card-bg)",
        borderColor: selected ? "var(--olive)" : "var(--border)",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: "var(--text)" }}>{asset.symbol}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium border"
            style={{
              background: asset.type === "crypto" ? "var(--olive-dim)" : asset.type === "defi" ? "rgba(97,57,16,0.15)" : "rgba(236,237,241,0.1)",
              color: asset.type === "crypto" ? "var(--olive)" : asset.type === "defi" ? "var(--brown-light)" : "var(--muted)",
              borderColor: asset.type === "crypto" ? "var(--olive-ring)" : "var(--border)",
            }}
          >
            {asset.type}
          </span>
        </div>
        <span className="text-xs font-semibold" style={{ color: asset.change24h >= 0 ? "var(--up)" : "var(--down)" }}>
          {asset.change24h >= 0 ? "+" : ""}{asset.change24h}%
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-base font-mono font-bold" style={{ color: up ? "var(--up)" : "var(--down)" }}>
          ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: price < 1 ? 4 : 2 })}
        </span>
        <span className="text-[10px]" style={{ color: "var(--muted)" }}>
          Vol {formatLargeNum(asset.volume24h)}
        </span>
      </div>
    </button>
  );
}
