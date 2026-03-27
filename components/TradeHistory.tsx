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
    <div className="rounded-xl overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
      <div className="px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>Trade History</span>
      </div>
      {trades.length === 0 ? (
        <div className="text-center text-xs py-6" style={{ color: "var(--muted)" }}>No trades yet</div>
      ) : (
        <div className="max-h-48 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
          {[...trades].reverse().map((t) => (
            <div key={t.id} className="px-3 py-2 flex items-center justify-between border-b last:border-0"
              style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                  style={{
                    background: t.side === "buy" ? "var(--olive-dim)" : "var(--sell-dim)",
                    color: t.side === "buy" ? "var(--up)" : "var(--down)",
                  }}>
                  {t.side.toUpperCase()}
                </span>
                <div>
                  <div className="text-xs font-mono" style={{ color: "var(--text)" }}>{t.qty.toFixed(4)} {t.symbol}</div>
                  <div className="text-[9px]" style={{ color: "var(--muted)" }}>{t.orderType} · {t.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono" style={{ color: "var(--text)" }}>
                  ${t.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[9px] font-mono" style={{ color: "var(--muted)" }}>@ ${t.price.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
