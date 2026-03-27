"use client";
export type Trade = {
  id: number;
  side: "buy" | "sell";
  symbol: string;
  qty: number;
  price: number;
  total: number;
  orderType: string;
  time: string;
};

type Props = { trades: Trade[] };

export default function TradeHistory({ trades }: Props) {
  return (
    <div className="bg-[#231a0a] border border-[#3d2e14] rounded-xl overflow-hidden">
      <div className="px-3 py-2 border-b border-[#3d2e14]">
        <span className="text-xs font-semibold text-[#ecedf1]">Trade History</span>
      </div>
      {trades.length === 0 ? (
        <div className="text-center text-[#9a8a6a] text-xs py-6">No trades yet</div>
      ) : (
        <div className="max-h-48 overflow-y-auto divide-y divide-[#3d2e14]">
          {[...trades].reverse().map((t) => (
            <div key={t.id} className="px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  t.side === "buy" ? "bg-[#a8ba4120] text-[#a8ba41]" : "bg-[#e05a3a20] text-[#e05a3a]"
                }`}>
                  {t.side.toUpperCase()}
                </span>
                <div>
                  <div className="text-xs font-mono text-[#ecedf1]">{t.qty.toFixed(4)} {t.symbol}</div>
                  <div className="text-[9px] text-[#9a8a6a]">{t.orderType} · {t.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-[#ecedf1]">
                  ${t.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[9px] text-[#9a8a6a] font-mono">@ ${t.price.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
