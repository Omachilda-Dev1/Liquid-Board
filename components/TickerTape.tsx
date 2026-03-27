"use client";
import { Asset } from "@/lib/mockData";

type Props = { assets: Asset[]; prices: Record<string, number>; prevPrices: Record<string, number> };

export default function TickerTape({ assets, prices, prevPrices }: Props) {
  const items = [...assets, ...assets]; // duplicate for seamless loop
  return (
    <div className="ticker-wrap bg-[#231a0a] border-b border-[#3d2e14] py-1.5">
      <div className="ticker-inner gap-8">
        {items.map((a, i) => {
          const price = prices[a.symbol] ?? a.price;
          const prev = prevPrices[a.symbol] ?? a.price;
          const up = price >= prev;
          return (
            <span key={i} className="inline-flex items-center gap-2 px-4 text-xs">
              <span className="text-[#a8ba41] font-bold font-mono">{a.symbol}</span>
              <span className={`font-mono ${up ? "text-[#a8ba41]" : "text-[#e05a3a]"}`}>
                ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`${a.change24h >= 0 ? "text-[#a8ba41]" : "text-[#e05a3a]"}`}>
                {a.change24h >= 0 ? "▲" : "▼"} {Math.abs(a.change24h)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
