"use client";
import { useEffect, useRef, useState } from "react";
import { OrderBookEntry, generateOrderBook } from "@/lib/mockData";
import { fmtPrice, fmtQty, priceDecimals } from "@/lib/format";
import SignBand from "./SignBand";

type Props = {
  symbol: string;
  price: number;
  rows?: number;
  route: string;
  routeInk: string;
  /** Fill the parent's height, centred on the mid price (desktop column). */
  fill?: boolean;
  onPickPrice: (price: number) => void;
};

const ROW_H = 24;

export default function OrderBook({ symbol, price, rows = 9, route, routeInk, fill = false, onPickPrice }: Props) {
  // Levels are generated around a base price and scaled to the live price on
  // every render, so the mid always sits inside the spread.
  const [raw, setRaw] = useState<{ base: number; bids: OrderBookEntry[]; asks: OrderBookEntry[] } | null>(null);

  // In fill mode, show only as many whole rows as the column has room for.
  const sectionRef = useRef<HTMLElement>(null);
  const [fit, setFit] = useState(rows);
  useEffect(() => {
    if (!fill || !sectionRef.current) return;
    const el = sectionRef.current;
    const ro = new ResizeObserver(([e]) => {
      const chrome = 40 + 26 + 50 + 64; // band, column header, mid row, balance bar
      setFit(Math.max(3, Math.min(rows, Math.floor((e.contentRect.height - chrome) / 2 / ROW_H))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fill, rows]);
  const shown = fill ? fit : rows;

  const priceRef = useRef(price);
  priceRef.current = price;

  // Rebuild on symbol change, then refresh every 2s around the latest price.
  useEffect(() => {
    const make = () => ({ base: priceRef.current, ...generateOrderBook(priceRef.current, rows) });
    setRaw(make());
    const id = setInterval(() => setRaw(make()), 2000);
    return () => clearInterval(id);
  }, [symbol, rows]);

  const book = raw
    ? {
        asks: raw.asks.slice(0, shown).map((e) => ({ ...e, price: e.price * (price / raw.base) })),
        bids: raw.bids.slice(0, shown).map((e) => ({ ...e, price: e.price * (price / raw.base) })),
      }
    : null;
  const d = priceDecimals(price);
  const maxTotal = book ? Math.max(book.asks[book.asks.length - 1].total, book.bids[book.bids.length - 1].total) : 1;
  const spread = book ? book.asks[0].price - book.bids[0].price : 0;
  const bidShare = book ? book.bids[book.bids.length - 1].total / (book.bids[book.bids.length - 1].total + book.asks[book.asks.length - 1].total) : 0.5;

  const Row = ({ e, side }: { e: OrderBookEntry; side: "bid" | "ask" }) => (
    <li>
      <button
        type="button"
        onClick={() => onPickPrice(e.price)}
        title="Use this price for a limit order"
        className="relative grid h-[24px] w-full grid-cols-3 items-center px-4 text-[12px] hover:bg-ground-3"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-[2px] right-0"
          style={{ width: `${(e.total / maxTotal) * 100}%`, background: side === "ask" ? "var(--down-wash)" : "var(--up-wash)" }}
        />
        <span className={`num relative text-left ${side === "ask" ? "down" : "up"}`}>{fmtPrice(e.price, d)}</span>
        <span className="num relative text-right text-ink">{fmtQty(e.size)}</span>
        <span className="num relative text-right text-ink-3">{fmtQty(e.total)}</span>
      </button>
    </li>
  );

  return (
    <section ref={sectionRef} aria-label="Order book" className={`flex flex-col ${fill ? "h-full min-h-0" : ""}`}>
      <SignBand label="Order book">
        <span>Click to set limit</span>
      </SignBand>
      <div className="grid grid-cols-3 px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3">
        <span>Price</span>
        <span className="text-right">Size ({symbol})</span>
        <span className="text-right">Total</span>
      </div>
      {!book ? (
        <p className="px-4 py-6 text-[13px] text-ink-3">Loading book…</p>
      ) : (
        <>
          <ul aria-label="Asks" className={fill ? "flex flex-1 flex-col justify-end" : ""}>
            {book.asks.slice().reverse().map((e, i) => <Row key={`a${i}`} e={e} side="ask" />)}
          </ul>
          <div className="my-1 flex shrink-0 items-center justify-between border-y border-rule px-4 py-2">
            <span className="num px-1.5 text-[16px] font-semibold" style={{ background: route, color: routeInk }}>{fmtPrice(price, d)}</span>
            <span className="text-[12px] text-ink-3">
              Spread <span className="num text-ink-2">{fmtPrice(spread, d)}</span>{" "}
              <span className="num">({((spread / price) * 100).toFixed(3)}%)</span>
            </span>
          </div>
          <ul aria-label="Bids" className={fill ? "flex-1" : ""}>
            {book.bids.map((e, i) => <Row key={`b${i}`} e={e} side="bid" />)}
          </ul>
          <div className="shrink-0 px-4 pb-4 pt-3">
            <div className="flex h-2" aria-hidden="true">
              <span className="bg-up" style={{ width: `${bidShare * 100}%` }} />
              <span className="flex-1 bg-down" />
            </div>
            <div className="mt-1 flex justify-between text-[12px]">
              <span className="up num">Bids {(bidShare * 100).toFixed(0)}%</span>
              <span className="down num">{((1 - bidShare) * 100).toFixed(0)}% Asks</span>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
