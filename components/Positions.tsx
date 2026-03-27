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
    <div className="rounded-xl overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>Open Positions</span>
      </div>
      {entries.length === 0 ? (
        <div className="text-center text-xs py-6" style={{ color: "var(--muted)" }}>No open positions</div>
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {entries.map((pos) => {
            const { raw, pct } = calcPnL(pos, prices[pos.symbol] ?? pos.avgEntry);
            const isProfit = raw >= 0;
            return (
              <div key={pos.symbol} className="px-3 py-2.5 flex items-center justify-between border-b last:border-0"
                style={{ borderColor: "var(--border)" }}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: "var(--text)" }}>{pos.symbol}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{
                        background: pos.side === "long" ? "var(--olive-dim)" : "var(--sell-dim)",
                        color: pos.side === "long" ? "var(--up)" : "var(--down)",
                      }}>
                      {pos.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono mt-0.5" style={{ color: "var(--muted)" }}>
                    {pos.qty.toFixed(4)} @ ${pos.avgEntry.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold" style={{ color: isProfit ? "var(--up)" : "var(--down)" }}>
                    {isProfit ? "+" : ""}${raw.toFixed(2)}
                  </div>
                  <div className="text-[10px] font-mono" style={{ color: isProfit ? "var(--up)" : "var(--down)" }}>
                    {isProfit ? "+" : ""}{pct.toFixed(2)}%
                  </div>
                </div>
                <button onClick={() => onClose(pos.symbol)}
                  className="ml-3 text-[10px] px-2 py-1 rounded border transition-all"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
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
