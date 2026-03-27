"use client";
import { Asset } from "@/lib/mockData";

type Props = { assets: Asset[]; prices: Record<string, number>; prevPrices: Record<string, number> };

export default function TickerTape({ assets, prices, prevPrices }: Props) {
  const items = [...assets, ...assets];
  return (
    <div className="ticker-wrap py-1.5 border-b" style={{ background: "var(--ticker-bg)", borderColor: "var(--border)" }}>
      <div className="ticker-inner gap-8">
        {items.map((a, i) => {
          const price = prices[a.symbol] ?? a.price;
          const prev = prevPrices[a.symbol] ?? a.price;
          const up = price >= prev;
          return (
            <span key={i} className="inline-flex items-center gap-2 px-4 text-xs">
              <span className="font-bold font-mono" style={{ color: "var(--olive)" }}>{a.symbol}</span>
              <span className="font-mono" style={{ color: up ? "var(--up)" : "var(--down)" }}>
                ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{ color: a.change24h >= 0 ? "var(--up)" : "var(--down)" }}>
                {a.change24h >= 0 ? "▲" : "▼"} {Math.abs(a.change24h)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
