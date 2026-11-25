"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ASSET_TYPE_LABEL, Asset, AssetType, open24h } from "@/lib/mockData";
import { fmtPct, fmtPrice } from "@/lib/format";
import RouteBullet from "./RouteBullet";
import SignBand from "./SignBand";

type Props = {
  assets: Asset[];
  prices: Record<string, number>;
  prevPrices: Record<string, number>;
  selected: string;
  onSelect: (symbol: string) => void;
  tick: number;
};

const FILTERS: { id: "all" | AssetType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "crypto", label: "Crypto" },
  { id: "defi", label: "DeFi" },
  { id: "stock", label: "Equity" },
];

export default function MarketList({ assets, prices, prevPrices, selected, onSelect, tick }: Props) {
  const [filter, setFilter] = useState<"all" | AssetType>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter(
      (a) => (filter === "all" || a.type === filter) && (!q || a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)),
    );
  }, [assets, filter, query]);

  return (
    <section aria-labelledby="markets-heading" className="flex min-h-0 flex-col">
      <SignBand id="markets-heading" label="Markets">
        <span className="num">{visible.length}/{assets.length}</span>
      </SignBand>

      <div className="space-y-2 border-b border-rule px-3 py-3">
        <label className="flex h-9 items-center gap-2 border border-rule-strong bg-ground px-2.5 focus-within:border-ink">
          <Search size={14} className="text-ink-3" aria-hidden="true" />
          <span className="sr-only">Search markets</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol or name"
            className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
          />
        </label>
        <div role="tablist" aria-label="Asset type" className="grid grid-cols-4 border border-rule-strong">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              type="button"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`h-8 text-[12px] font-semibold transition-colors ${
                filter === f.id ? "bg-selected text-selected-ink" : "text-ink-2 hover:bg-ground-3 hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto" aria-label="Markets">
        {visible.length === 0 ? (
          <li className="px-4 py-8 text-center text-[13px] text-ink-2">
            No market matches “{query}”.
            <button type="button" className="mt-2 block w-full font-semibold text-ink underline underline-offset-4" onClick={() => { setQuery(""); setFilter("all"); }}>
              Clear search
            </button>
          </li>
        ) : null}
        {visible.map((a) => {
          const price = prices[a.symbol] ?? a.price;
          const prev = prevPrices[a.symbol] ?? price;
          const change = ((price - open24h(a)) / open24h(a)) * 100;
          const isSelected = a.symbol === selected;
          const flash = price > prev ? "tick-up" : price < prev ? "tick-down" : "";
          return (
            <li key={a.symbol}>
              <button
                type="button"
                onClick={() => onSelect(a.symbol)}
                aria-current={isSelected ? "true" : undefined}
                className={`flex w-full items-center gap-3 border-b border-rule px-4 py-2.5 text-left transition-colors ${
                  isSelected ? "bg-selected text-selected-ink" : "hover:bg-ground-3"
                }`}
              >
                <RouteBullet asset={a} size={30} muted={!isSelected} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold">{a.name}</span>
                  <span className={`block text-[12px] ${isSelected ? "opacity-75" : "text-ink-3"}`}>{ASSET_TYPE_LABEL[a.type]}</span>
                </span>
                <span className="text-right">
                  <span key={isSelected ? undefined : tick} className={`num block px-1 text-[14px] ${isSelected ? "" : flash}`}>{fmtPrice(price)}</span>
                  <span
                    className="num block px-1 text-[12px]"
                    style={{ color: isSelected ? (change >= 0 ? "var(--sel-up)" : "var(--sel-down)") : change >= 0 ? "var(--up)" : "var(--down)" }}
                  >
                    {fmtPct(change)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
