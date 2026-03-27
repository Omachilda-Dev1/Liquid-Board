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
        <div
          className="absolute inset-y-0 right-0"
          style={{
            width: `${pct}%`,
            background: isAsk ? "rgba(224,90,58,0.12)" : "rgba(168,186,65,0.12)",
          }}
        />
        <span className={isAsk ? "text-[#e05a3a]" : "text-[#a8ba41]"}>
          {entry.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        <span className="text-[#9a8a6a]">{entry.size.toFixed(4)}</span>
        <span className="text-[#ecedf180]">{entry.total.toFixed(3)}</span>
      </div>
    );
  };

  return (
    <div className="bg-[#231a0a] border border-[#3d2e14] rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-[#3d2e14] flex items-center justify-between">
        <span className="text-xs font-semibold text-[#ecedf1]">Order Book</span>
        <span className="text-[10px] text-[#9a8a6a] font-mono">{symbol}/USD</span>
      </div>
      <div className="px-0 py-1">
        <div className="flex justify-between text-[9px] text-[#9a8a6a] px-2 pb-1">
          <span>Price</span><span>Size</span><span>Total</span>
        </div>
        {book.asks.slice().reverse().map((a, i) => <Row key={`a${i}`} entry={a} side="ask" />)}
        <div className="flex items-center justify-center py-1.5 border-y border-[#3d2e14] my-1">
          <span className="font-mono font-bold text-sm text-[#a8ba41]">
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
        {book.bids.map((b, i) => <Row key={`b${i}`} entry={b} side="bid" />)}
      </div>
    </div>
  );
}
