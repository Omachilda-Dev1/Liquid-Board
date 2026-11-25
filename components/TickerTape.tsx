"use client";
import { Asset, open24h } from "@/lib/mockData";
import { fmtPct, fmtPrice, signClass } from "@/lib/format";
import RouteBullet from "./RouteBullet";

type Props = { assets: Asset[]; prices: Record<string, number>; onSelect: (symbol: string) => void };

export default function TickerTape({ assets, prices, onSelect }: Props) {
  const items = [...assets, ...assets];
  return (
    <div className="ticker-wrap h-[36px] shrink-0 overflow-hidden whitespace-nowrap border-b border-rule bg-ground-2">
      <div className="ticker-track h-full items-center">
        {items.map((a, i) => {
          const price = prices[a.symbol] ?? a.price;
          const change = ((price - open24h(a)) / open24h(a)) * 100;
          return (
            <button
              key={`${a.symbol}-${i}`}
              type="button"
              tabIndex={i < assets.length ? 0 : -1}
              aria-hidden={i >= assets.length}
              onClick={() => onSelect(a.symbol)}
              className="inline-flex h-[36px] items-center gap-2 px-5 text-[13px] hover:bg-ground-3"
            >
              <RouteBullet asset={a} size={26} />
              <span className="num text-ink">{fmtPrice(price)}</span>
              <span className={`num ${signClass(change)}`}>{fmtPct(change)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
