"use client";

export type Trade = {
  id: number;
  side: "buy" | "sell";
  symbol: string;
  qty: number;
  price: number;
  total: number;
  time: string;
};

type Props = { trades: Trade[] };

export default function Portfolio({ trades }: Props) {
  if (trades.length === 0) {
    return (
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
        <h3 className="text-white font-semibold mb-3">Trade History</h3>
        <p className="text-gray-500 text-sm text-center py-4">No trades yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3">Trade History</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {[...trades].reverse().map((t) => (
          <div key={t.id} className="flex items-center justify-between text-sm py-2 border-b border-[#2a2d3a] last:border-0">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.side === "buy" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                {t.side.toUpperCase()}
              </span>
              <span className="text-white font-mono">{t.qty} {t.symbol}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-mono">${t.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-gray-500 text-xs">{t.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
