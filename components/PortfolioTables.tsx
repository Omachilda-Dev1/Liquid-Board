"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { ASSETS } from "@/lib/mockData";
import { PendingOrder, Position, Trade, calcPnL } from "@/lib/wallet";
import { fmtPct, fmtPrice, fmtQty, fmtSignedUsd, fmtTime, fmtUsd, signClass } from "@/lib/format";
import RouteBullet from "./RouteBullet";

type Tab = "positions" | "orders" | "history";

type Props = {
  positions: Record<string, Position>;
  orders: PendingOrder[];
  trades: Trade[];
  prices: Record<string, number>;
  onClose: (symbol: string) => void;
  onCancel: (id: number) => void;
  onSelect: (symbol: string) => void;
  /** Stacked card rows instead of a table, for narrow screens. */
  compact?: boolean;
};

const bySymbol = Object.fromEntries(ASSETS.map((a) => [a.symbol, a]));

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-8 text-center text-[13px] text-ink-3">{children}</div>;
}

const th = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 first:pl-4";
const td = "px-3 py-2 first:pl-4 whitespace-nowrap";

export default function PortfolioTables({ positions, orders, trades, prices, onClose, onCancel, onSelect, compact = false }: Props) {
  const [tab, setTab] = useState<Tab>("positions");
  const pos = Object.values(positions);
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "positions", label: "Positions", count: pos.length },
    { id: "orders", label: "Open orders", count: orders.length },
    { id: "history", label: "History", count: trades.length },
  ];

  return (
    <section aria-label="Portfolio" className="flex h-full min-h-0 flex-col">
      <div className="band flex shrink-0 items-stretch px-2" role="tablist" aria-label="Portfolio views">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`band-label relative h-[38px] px-3 transition-colors ${tab === t.id ? "text-band-ink" : "text-band-ink2 hover:text-band-ink"}`}
          >
            {t.label} <span className="num">({t.count})</span>
            {tab === t.id ? <span className="absolute inset-x-3 bottom-0 h-[3px] bg-band-ink" /> : null}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "positions" ? (
          pos.length === 0 ? <Empty>No open positions. Place an order from the ticket to open one.</Empty> : compact ? (
            <ul>
              {pos.map((p) => {
                const price = prices[p.symbol] ?? p.avgEntry;
                const { raw, pct } = calcPnL(p, price);
                return (
                  <li key={p.symbol} className="flex items-center gap-3 border-b border-rule px-4 py-3">
                    <RouteBullet asset={bySymbol[p.symbol]} size={30} />
                    <div className="min-w-0 flex-1">
                      <div className="num text-[13px]">{fmtQty(p.qty)} {p.symbol} @ {fmtPrice(p.avgEntry)}</div>
                      <div className={`num text-[13px] ${signClass(raw)}`}>{fmtSignedUsd(raw)} ({fmtPct(pct)})</div>
                    </div>
                    <button type="button" onClick={() => onClose(p.symbol)} className="h-9 border border-rule-strong px-3 text-[12px] font-semibold hover:border-ink">Close</button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-ground"><tr className="border-b border-rule">
                <th className={th}>Market</th><th className={`${th} text-right`}>Size</th><th className={`${th} text-right`}>Entry</th>
                <th className={`${th} text-right`}>Last</th><th className={`${th} text-right`}>Value</th><th className={`${th} text-right`}>Lev.</th>
                <th className={`${th} text-right`}>Unrealised P&amp;L</th><th className={th}><span className="sr-only">Actions</span></th>
              </tr></thead>
              <tbody>
                {pos.map((p) => {
                  const price = prices[p.symbol] ?? p.avgEntry;
                  const { raw, pct } = calcPnL(p, price);
                  const lev = p.avgEntry * p.qty / Math.max(1e-9, p.avgEntry * p.qty - p.debt);
                  return (
                    <tr key={p.symbol} className="border-b border-rule hover:bg-ground-2">
                      <td className={td}>
                        <button type="button" onClick={() => onSelect(p.symbol)} className="flex items-center gap-2 font-semibold hover:underline">
                          <RouteBullet asset={bySymbol[p.symbol]} size={22} />{bySymbol[p.symbol]?.name}
                        </button>
                      </td>
                      <td className={`${td} num text-right`}>{fmtQty(p.qty)}</td>
                      <td className={`${td} num text-right`}>{fmtPrice(p.avgEntry)}</td>
                      <td className={`${td} num text-right`}>{fmtPrice(price)}</td>
                      <td className={`${td} num text-right`}>{fmtUsd(p.qty * price)}</td>
                      <td className={`${td} num text-right text-ink-2`}>{lev.toFixed(1)}×</td>
                      <td className={`${td} num text-right ${signClass(raw)}`}>{fmtSignedUsd(raw)} <span className="text-[12px]">({fmtPct(pct)})</span></td>
                      <td className={`${td} text-right`}>
                        <button type="button" onClick={() => onClose(p.symbol)} className="h-7 border border-rule-strong px-3 text-[12px] font-semibold hover:border-ink">Close</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : null}

        {tab === "orders" ? (
          orders.length === 0 ? <Empty>No resting orders. Limit and stop orders wait here until price reaches them.</Empty> : (
            <ul>
              {orders.map((o) => (
                <li key={o.id} className="flex items-center gap-3 border-b border-rule px-4 py-2.5 text-[13px]">
                  <RouteBullet asset={bySymbol[o.symbol]} size={22} />
                  <span className={`w-10 font-bold uppercase ${o.side === "buy" ? "up" : "down"}`}>{o.side}</span>
                  <span className="num flex-1">
                    {o.type} {fmtQty(o.qty)} {o.symbol} at {fmtPrice(o.trigger)}{o.leverage > 1 ? ` · ${o.leverage}×` : ""}
                    <span className="ml-2 text-ink-3">last {fmtPrice(prices[o.symbol])}</span>
                  </span>
                  <span className="num hidden text-ink-3 sm:inline">{fmtTime(o.createdAt, true)}</span>
                  <button type="button" onClick={() => onCancel(o.id)} aria-label={`Cancel ${o.type} ${o.side} ${o.symbol}`}
                    className="flex h-7 items-center gap-1 border border-rule-strong px-2 text-[12px] font-semibold hover:border-ink">
                    <X size={12} aria-hidden="true" /> Cancel
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : null}

        {tab === "history" ? (
          trades.length === 0 ? <Empty>No trades yet.</Empty> : (
            <table className="w-full text-[13px]">
              <thead className="sticky top-0 bg-ground"><tr className="border-b border-rule">
                <th className={th}>Time</th><th className={th}>Market</th><th className={th}>Side</th>
                {compact ? null : <th className={th}>Type</th>}
                <th className={`${th} text-right`}>Size</th><th className={`${th} text-right`}>Price</th>
                {compact ? null : <th className={`${th} text-right`}>Total</th>}
                <th className={`${th} text-right`}>Realised</th>
              </tr></thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id} className="border-b border-rule">
                    <td className={`${td} num text-ink-3`}>{fmtTime(t.time, true)}</td>
                    <td className={`${td} font-semibold`}>{t.symbol}</td>
                    <td className={`${td} font-bold uppercase ${t.side === "buy" ? "up" : "down"}`}>{t.side}</td>
                    {compact ? null : <td className={`${td} text-ink-2`}>{t.orderType}{t.leverage > 1 ? ` · ${t.leverage}×` : ""}</td>}
                    <td className={`${td} num text-right`}>{fmtQty(t.qty)}</td>
                    <td className={`${td} num text-right`}>{fmtPrice(t.price)}</td>
                    {compact ? null : <td className={`${td} num text-right`}>{fmtUsd(t.total)}</td>}
                    <td className={`${td} num text-right ${t.realised === undefined ? "text-ink-3" : signClass(t.realised)}`}>
                      {t.realised === undefined ? "—" : fmtSignedUsd(t.realised)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : null}
      </div>
    </section>
  );
}
