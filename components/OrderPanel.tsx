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

  function setPct(pct: number) {
    setQty(((maxQty * pct) / 100).toFixed(4));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = parseFloat(qty);
    if (!q || q <= 0) return;
    onOrder(side, q, total, orderType);
    setSubmitted(true);
    setQty("");
    setTimeout(() => setSubmitted(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#231a0a] border border-[#3d2e14] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#ecedf1]">Place Order</span>
        <span className="text-[10px] text-[#9a8a6a] font-mono">
          Bal: <span className="text-[#a8ba41]">${balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </span>
      </div>

      {/* Buy / Sell */}
      <div className="flex rounded-lg overflow-hidden border border-[#3d2e14]">
        {(["buy", "sell"] as const).map((s) => (
          <button key={s} type="button" onClick={() => setSide(s)}
            className={`flex-1 py-2 text-xs font-bold transition-colors ${
              side === s
                ? s === "buy" ? "bg-[#a8ba41] text-[#1a1208]" : "bg-[#e05a3a] text-white"
                : "bg-transparent text-[#9a8a6a] hover:text-[#ecedf1]"
            }`}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Order type */}
      <div className="flex gap-1">
        {ORDER_TYPES.map((t) => (
          <button key={t} type="button" onClick={() => setOrderType(t)}
            className={`flex-1 py-1 text-[10px] rounded font-semibold border transition-all ${
              orderType === t
                ? "border-[#613910] bg-[#613910] text-[#a8ba41]"
                : "border-[#3d2e14] text-[#9a8a6a] hover:text-[#ecedf1]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Limit price */}
      {orderType !== "Market" && (
        <div className="space-y-1">
          <label className="text-[10px] text-[#9a8a6a]">{orderType} Price (USD)</label>
          <input
            type="number" step="any" value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="w-full bg-[#1a1208] border border-[#3d2e14] rounded-lg px-3 py-2 text-[#ecedf1] text-xs font-mono focus:outline-none focus:border-[#613910]"
          />
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-1">
        <label className="text-[10px] text-[#9a8a6a]">Amount ({symbol})</label>
        <input
          type="number" min="0" step="any" value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="0.0000"
          className="w-full bg-[#1a1208] border border-[#3d2e14] rounded-lg px-3 py-2 text-[#ecedf1] text-xs font-mono focus:outline-none focus:border-[#613910]"
        />
      </div>

      {/* % presets */}
      <div className="grid grid-cols-4 gap-1">
        {PCT_PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => setPct(p)}
            className="py-1 text-[10px] rounded border border-[#3d2e14] text-[#9a8a6a] hover:border-[#613910] hover:text-[#a8ba41] transition-all"
          >
            {p}%
          </button>
        ))}
      </div>

      {/* Leverage */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-[#9a8a6a]">Leverage</span>
          <span className="text-[#a8ba41] font-mono">{leverage}x</span>
        </div>
        <input type="range" min={1} max={20} value={leverage} onChange={(e) => setLeverage(+e.target.value)}
          className="w-full h-1 accent-[#a8ba41] cursor-pointer"
        />
      </div>

      {/* Summary */}
      <div className="flex justify-between text-xs border-t border-[#3d2e14] pt-2">
        <span className="text-[#9a8a6a]">Est. Total</span>
        <span className="text-[#ecedf1] font-mono font-semibold">
          ${(total * leverage).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <button type="submit"
        className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${
          submitted ? "bg-[#3d2e14] text-[#9a8a6a]"
            : side === "buy"
              ? "bg-[#a8ba41] text-[#1a1208] hover:bg-[#8a9a32]"
              : "bg-[#e05a3a] text-white hover:bg-[#c04a2a]"
        }`}
      >
        {submitted ? "✓ Order Submitted" : `${side === "buy" ? "Buy" : "Sell"} ${symbol}`}
      </button>
    </form>
  );
}
