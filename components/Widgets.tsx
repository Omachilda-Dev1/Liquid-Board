"use client";
import { useGasPrice, useFearGreed } from "@/hooks/usePrices";
import { calcPortfolioValue } from "@/lib/wallet";
import type { Position } from "@/lib/wallet";

type Props = {
  usdBalance: number;
  positions: Record<string, Position>;
  prices: Record<string, number>;
  totalDeposited: number;
};

export default function Widgets({ usdBalance, positions, prices, totalDeposited }: Props) {
  const gas = useGasPrice();
  const fg = useFearGreed();
  const portfolioVal = calcPortfolioValue(positions, prices);
  const totalVal = usdBalance + portfolioVal;
  const totalPnL = totalVal - totalDeposited;
  const totalPnLPct = (totalPnL / totalDeposited) * 100;

  const card = { background: "var(--card-bg)", borderColor: "var(--border)" };

  return (
    <div className="space-y-2">
      {/* Portfolio summary */}
      <div className="rounded-xl p-3 border" style={card}>
        <div className="text-[9px] mb-1" style={{ color: "var(--muted)" }}>Portfolio Value</div>
        <div className="text-lg font-mono font-bold" style={{ color: "var(--text)" }}>
          ${totalVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs font-mono mt-0.5" style={{ color: totalPnL >= 0 ? "var(--up)" : "var(--down)" }}>
          {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)} ({totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%)
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
          <div>
            <div style={{ color: "var(--muted)" }}>Cash</div>
            <div className="font-mono" style={{ color: "var(--text)" }}>${usdBalance.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ color: "var(--muted)" }}>Positions</div>
            <div className="font-mono" style={{ color: "var(--text)" }}>${portfolioVal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Fear & Greed */}
      <div className="rounded-xl p-3 border" style={card}>
        <div className="text-[9px] mb-2" style={{ color: "var(--muted)" }}>Fear & Greed Index</div>
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="4" />
              <circle cx="18" cy="18" r="14" fill="none"
                stroke={fg.color} strokeWidth="4"
                strokeDasharray={`${(fg.value / 100) * 87.96} 87.96`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold font-mono" style={{ color: fg.color }}>{fg.value}</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: fg.color }}>{fg.label}</div>
            <div className="text-[9px] mt-0.5" style={{ color: "var(--muted)" }}>Market Sentiment</div>
          </div>
        </div>
      </div>

      {/* Gas tracker */}
      <div className="rounded-xl p-3 border" style={card}>
        <div className="text-[9px] mb-2" style={{ color: "var(--muted)" }}>ETH Gas Tracker</div>
        <div className="grid grid-cols-3 gap-1 text-center">
          {[
            { label: "Slow",  value: gas.slow,     color: "var(--muted)" },
            { label: "Std",   value: gas.standard, color: "var(--up)" },
            { label: "Fast",  value: gas.fast,     color: "var(--down)" },
          ].map((g) => (
            <div key={g.label} className="rounded-lg py-1.5 border" style={{ background: "var(--input-bg)", borderColor: "var(--border)" }}>
              <div className="text-xs font-mono font-bold" style={{ color: g.color }}>{g.value}</div>
              <div className="text-[8px]" style={{ color: "var(--muted)" }}>{g.label}</div>
              <div className="text-[8px]" style={{ color: "var(--muted)" }}>Gwei</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
