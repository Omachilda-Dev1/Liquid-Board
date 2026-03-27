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

  return (
    <div className="space-y-2">
      {/* Portfolio summary */}
      <div className="bg-[#231a0a] border border-[#3d2e14] rounded-xl p-3">
        <div className="text-[9px] text-[#9a8a6a] mb-1">Portfolio Value</div>
        <div className="text-lg font-mono font-bold text-[#ecedf1]">
          ${totalVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`text-xs font-mono mt-0.5 ${totalPnL >= 0 ? "text-[#a8ba41]" : "text-[#e05a3a]"}`}>
          {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)} ({totalPnLPct >= 0 ? "+" : ""}{totalPnLPct.toFixed(2)}%)
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">          <div>
            <div className="text-[#9a8a6a]">Cash</div>
            <div className="font-mono text-[#ecedf1]">${usdBalance.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[#9a8a6a]">Positions</div>
            <div className="font-mono text-[#ecedf1]">${portfolioVal.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Fear & Greed */}
      <div className="bg-[#231a0a] border border-[#3d2e14] rounded-xl p-3">
        <div className="text-[9px] text-[#9a8a6a] mb-2">Fear & Greed Index</div>
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#3d2e14" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="14" fill="none"
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
            <div className="text-[9px] text-[#9a8a6a] mt-0.5">Market Sentiment</div>
          </div>
        </div>
      </div>

      {/* Gas tracker */}
      <div className="bg-[#231a0a] border border-[#3d2e14] rounded-xl p-3">
        <div className="text-[9px] text-[#9a8a6a] mb-2">ETH Gas Tracker</div>
        <div className="grid grid-cols-3 gap-1 text-center">
          {[
            { label: "Slow", value: gas.slow, color: "text-[#9a8a6a]" },
            { label: "Std", value: gas.standard, color: "text-[#a8ba41]" },
            { label: "Fast", value: gas.fast, color: "text-[#e05a3a]" },
          ].map((g) => (
            <div key={g.label} className="bg-[#1a1208] rounded-lg py-1.5">
              <div className={`text-xs font-mono font-bold ${g.color}`}>{g.value}</div>
              <div className="text-[8px] text-[#9a8a6a]">{g.label}</div>
              <div className="text-[8px] text-[#9a8a6a]">Gwei</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
