"use client";
import { useEffect, useState } from "react";
import { generateOrderBook, OrderBookEntry } from "@/lib/mockData";

type Props = { symbol: string; price: number };

export default function OrderBook({ symbol, price }: Props) {
  const [book, setBook] = useState(() => generateOrderBook(price));

  useEffect(() => {
    const id = setInterval(() => setBook(generateOrderBook(price)), 2000);
    return () => clearInterval(id);
  }, [price]);

  const maxTotal = Math.max(...book.asks.map((a) => a.total), ...book.bids.map((b) => b.total));

  const Row = ({ entry, side }: { entry: OrderBookEntry; side: "bid" | "ask" }) => {
    const pct = (entry.total / maxTotal) * 100;
    const isAsk = side === "ask";
    return (
      <div className="relative flex items-center justify-between text-[10px] font-mono py-[2px] px-2 overflow-hidden">
        <div className="absolute inset-y-0 right-0" style={{
          width: `${pct}%`,
          background: isAsk ? "var(--depth-ask)" : "var(--depth-bid)",
        }} />
        <span style={{ color: isAsk ? "var(--down)" : "var(--up)" }}>
          {entry.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        <span style={{ color: "var(--muted)" }}>{entry.size.toFixed(4)}</span>
        <span style={{ color: "var(--text)", opacity: 0.6 }}>{entry.total.toFixed(3)}</span>
      </div>
    );
  };

  return (
    <div className="rounded-xl overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <div className="px-3 py-2 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>Order Book</span>
        <span className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>{symbol}/USD</span>
      </div>
      <div className="py-1">
        <div className="flex justify-between text-[9px] px-2 pb-1" style={{ color: "var(--muted)" }}>
          <span>Price</span><span>Size</span><span>Total</span>
        </div>
        {book.asks.slice().reverse().map((a, i) => <Row key={`a${i}`} entry={a} side="ask" />)}
        <div className="flex items-center justify-center py-1.5 border-y my-1" style={{ borderColor: "var(--border)" }}>
          <span className="font-mono font-bold text-sm" style={{ color: "var(--up)" }}>
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
        {book.bids.map((b, i) => <Row key={`b${i}`} entry={b} side="bid" />)}
      </div>
    </div>
  );
}
