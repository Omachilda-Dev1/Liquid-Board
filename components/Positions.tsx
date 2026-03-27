"use client";
import { Position, calcPnL } from "@/lib/wallet";

type Props = {
  positions: Record<string, Position>;
  prices: Record<string, number>;
  onClose: (symbol: string) => void;
};

export default function Positions({ positions, prices, onClose }: Props) {
  const entries = Object.values(positions).filter((p) => p.qty > 0);

  return (
    <div className="bg-[#231a0a] border border-[#3d2e14] rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-[#3d2e14]">
        <span className="text-xs font-semibold text-[#ecedf1]">Open Positions</span>
      </div>
      {entries.length === 0 ? (
        <div className="text-center text-[#9a8a6a] text-xs py-6">No open positions</div>
      ) : (
        <div className="divide-y divide-[#3d2e14]">
          {entries.map((pos) => {
            const { raw, pct } = calcPnL(pos, prices[pos.symbol] ?? pos.avgEntry);
            const isProfit = raw >= 0;
            return (
              <div key={pos.symbol} className="px-3 py-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#ecedf1]">{pos.symbol}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      pos.side === "long" ? "bg-[#a8ba4120] text-[#a8ba41]" : "bg-[#e05a3a20] text-[#e05a3a]"
                    }`}>
                      {pos.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#9a8a6a] font-mono mt-0.5">
                    {pos.qty.toFixed(4)} @ ${pos.avgEntry.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-mono font-bold ${isProfit ? "text-[#a8ba41]" : "text-[#e05a3a]"}`}>
                    {isProfit ? "+" : ""}${raw.toFixed(2)}
                  </div>
                  <div className={`text-[10px] font-mono ${isProfit ? "text-[#a8ba41]" : "text-[#e05a3a]"}`}>
                    {isProfit ? "+" : ""}{pct.toFixed(2)}%
                  </div>
                </div>
                <button
                  onClick={() => onClose(pos.symbol)}
                  className="ml-3 text-[10px] px-2 py-1 rounded border border-[#3d2e14] text-[#9a8a6a] hover:border-[#e05a3a] hover:text-[#e05a3a] transition-all"
                >
                  Close
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
