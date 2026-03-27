"use client";
import { useState } from "react";

type Props = {
  symbol: string;
  price: number;
  balance: number;
  onOrder: (side: "buy" | "sell", qty: number, total: number, orderType: string) => void;
};

const ORDER_TYPES = ["Market", "Limit", "Stop"];
const PCT_PRESETS = [25, 50, 75, 100];

export default function OrderPanel({ symbol, price, balance, onOrder }: Props) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState("Market");
  const [qty, setQty] = useState("");
  const [limitPrice, setLimitPrice] = useState(price.toFixed(2));
  const [submitted, setSubmitted] = useState(false);
  const [leverage, setLeverage] = useState(1);

  const execPrice = orderType === "Market" ? price : parseFloat(limitPrice || "0");
  const total = parseFloat(qty || "0") * execPrice;
  const maxQty = balance / execPrice;

  function setPct(pct: number) { setQty(((maxQty * pct) / 100).toFixed(4)); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = parseFloat(qty);
    if (!q || q <= 0) return;
    onOrder(side, q, total, orderType);
    setSubmitted(true);
    setQty("");
    setTimeout(() => setSubmitted(false), 2000);
  }

  const inputStyle = {
    background: "var(--input-bg)",
    borderColor: "var(--border)",
    color: "var(--text)",
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-4 space-y-3 border"
      style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>Place Order</span>
        <span className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>
          Bal: <span style={{ color: "var(--olive)" }}>${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </span>
      </div>

      {/* Buy / Sell */}
      <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--border)" }}>
        {(["buy", "sell"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setSide(s)}
            className="flex-1 py-2 text-xs font-bold transition-colors"
            style={{
              background: side === s ? (s === "buy" ? "var(--up)" : "var(--down)") : "transparent",
              color: side === s ? (s === "buy" ? "var(--bg)" : "#fff") : "var(--muted)",
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Order type */}
      <div className="flex gap-1">
        {ORDER_TYPES.map((t) => (
          <button key={t} type="button" onClick={() => setOrderType(t)}
            className="flex-1 py-1 text-[10px] rounded font-semibold border transition-all"
            style={{
              background: orderType === t ? "var(--brown)" : "transparent",
              color: orderType === t ? "var(--olive)" : "var(--muted)",
              borderColor: orderType === t ? "var(--brown)" : "var(--border)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Limit price */}
      {orderType !== "Market" && (
        <div className="space-y-1">
          <label className="text-[10px]" style={{ color: "var(--muted)" }}>{orderType} Price (USD)</label>
          <input type="number" step="any" value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-xs font-mono border focus:outline-none"
            style={inputStyle}
          />
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-1">
        <label className="text-[10px]" style={{ color: "var(--muted)" }}>Amount ({symbol})</label>
        <input type="number" min="0" step="any" value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0.0000"
          className="w-full rounded-lg px-3 py-2 text-xs font-mono border focus:outline-none"
          style={inputStyle}
        />
      </div>

      {/* % presets */}
      <div className="grid grid-cols-4 gap-1">
        {PCT_PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => setPct(p)}
            className="py-1 text-[10px] rounded border transition-all"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}
          >
            {p}%
          </button>
        ))}
      </div>

      {/* Leverage */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span style={{ color: "var(--muted)" }}>Leverage</span>
          <span className="font-mono" style={{ color: "var(--olive)" }}>{leverage}x</span>
        </div>
        <input type="range" min={1} max={20} value={leverage}
          onChange={(e) => setLeverage(+e.target.value)}
          className="w-full h-1 cursor-pointer accent-[#a8ba41]"
        />
      </div>

      {/* Summary */}
      <div className="flex justify-between text-xs border-t pt-2" style={{ borderColor: "var(--border)" }}>
        <span style={{ color: "var(--muted)" }}>Est. Total</span>
        <span className="font-mono font-semibold" style={{ color: "var(--text)" }}>
          ${(total * leverage).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <button type="submit"
        className="w-full py-2.5 rounded-lg font-bold text-sm transition-all"
        style={{
          background: submitted ? "var(--surface2)" : side === "buy" ? "var(--up)" : "var(--down)",
          color: submitted ? "var(--muted)" : side === "buy" ? "var(--bg)" : "#fff",
        }}
      >
        {submitted ? "✓ Order Submitted" : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}
      </button>
    </form>
  );
}
