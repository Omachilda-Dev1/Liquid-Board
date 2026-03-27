"use client";
import { Asset, formatLargeNum } from "@/lib/mockData";

type Props = { asset: Asset; price: number };

export default function MarketStats({ asset, price }: Props) {
  const rangePct = ((price - asset.low24h) / (asset.high24h - asset.low24h)) * 100;

  return (
    <div className="rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-3 border"
      style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      {[
        { label: "Market Cap",  value: formatLargeNum(asset.marketCap) },
        { label: "24h Volume",  value: formatLargeNum(asset.volume24h) },
        { label: "24h High",    value: `$${asset.high24h.toLocaleString()}` },
        { label: "24h Low",     value: `$${asset.low24h.toLocaleString()}` },
        { label: "24h Change",  value: `${asset.change24h >= 0 ? "+" : ""}${asset.change24h}%`, isChange: true, up: asset.change24h >= 0 },
        ...(asset.circulatingSupply
          ? [{ label: "Circulating", value: `${(asset.circulatingSupply / 1e6).toFixed(1)}M`, isChange: false, up: true }]
          : [{ label: "Type", value: asset.type.toUpperCase(), isChange: false, up: true }]),
      ].map((s, i) => (
        <div key={i}>
          <div className="text-[9px] mb-0.5" style={{ color: "var(--muted)" }}>{s.label}</div>
          <div className="text-xs font-mono font-semibold"
            style={{ color: s.isChange ? (s.up ? "var(--up)" : "var(--down)") : "var(--text)" }}>
            {s.value}
          </div>
        </div>
      ))}
      <div className="col-span-2 sm:col-span-3 mt-1">
        <div className="flex justify-between text-[9px] mb-1" style={{ color: "var(--muted)" }}>
          <span>L ${asset.low24h.toLocaleString()}</span>
          <span style={{ color: "var(--text)" }}>24h Range</span>
          <span>H ${asset.high24h.toLocaleString()}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(2, Math.min(98, rangePct))}%`,
              background: "linear-gradient(to right, var(--down), var(--up))",
            }}
          />
        </div>
      </div>
    </div>
  );
}
