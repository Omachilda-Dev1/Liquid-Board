"use client";
import { Asset, formatLargeNum } from "@/lib/mockData";

type Props = { asset: Asset; price: number };

export default function MarketStats({ asset, price }: Props) {
  const rangePct = ((price - asset.low24h) / (asset.high24h - asset.low24h)) * 100;

  return (
    <div className="bg-[#231a0a] border border-[#3d2e14] rounded-xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
      {[
        { label: "Market Cap", value: formatLargeNum(asset.marketCap) },
        { label: "24h Volume", value: formatLargeNum(asset.volume24h) },
        { label: "24h High", value: `$${asset.high24h.toLocaleString()}` },
        { label: "24h Low", value: `$${asset.low24h.toLocaleString()}` },
        { label: "24h Change", value: `${asset.change24h >= 0 ? "+" : ""}${asset.change24h}%`, color: asset.change24h >= 0 ? "text-[#a8ba41]" : "text-[#e05a3a]" },
        ...(asset.circulatingSupply ? [{ label: "Circulating", value: `${(asset.circulatingSupply / 1e6).toFixed(1)}M` }] : [{ label: "Type", value: asset.type.toUpperCase() }]),
      ].map((s, i) => (
        <div key={i}>
          <div className="text-[9px] text-[#9a8a6a] mb-0.5">{s.label}</div>
          <div className={`text-xs font-mono font-semibold ${"color" in s ? s.color : "text-[#ecedf1]"}`}>{s.value}</div>
        </div>
      ))}
      <div className="col-span-2 sm:col-span-3 mt-1">
        <div className="flex justify-between text-[9px] text-[#9a8a6a] mb-1">
          <span>L ${asset.low24h.toLocaleString()}</span>
          <span className="text-[#ecedf1]">24h Range</span>
          <span>H ${asset.high24h.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-[#3d2e14] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#e05a3a] via-[#a8ba41] to-[#a8ba41] rounded-full transition-all duration-500"
            style={{ width: `${Math.max(2, Math.min(98, rangePct))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
