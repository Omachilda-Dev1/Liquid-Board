"use client";
import { useEffect } from "react";

type MobileTab = "markets" | "chart" | "trade" | "portfolio";

type Props = {
  open: boolean;
  onClose: () => void;
  activeTab: MobileTab;
  onSelect: (tab: MobileTab) => void;
  balance: string;
  pnl: string;
  pnlPositive: boolean;
  posCount: number;
  tradeCount: number;
};

const NAV_ITEMS: { id: MobileTab; label: string; desc: string }[] = [
  { id: "markets",   label: "Markets",   desc: "Live prices & assets" },
  { id: "chart",     label: "Chart",     desc: "Price chart & stats" },
  { id: "trade",     label: "Trade",     desc: "Buy / Sell orders" },
  { id: "portfolio", label: "Portfolio", desc: "Positions & history" },
];

function IconMarkets() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <polyline points="7 17 10 13 13 15 17 9" />
    </svg>
  );
}
function IconTrade() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
function IconPortfolio() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

const ICONS = { markets: IconMarkets, chart: IconChart, trade: IconTrade, portfolio: IconPortfolio };

export default function MobileMenu({ open, onClose, activeTab, onSelect, balance, pnl, pnlPositive, posCount, tradeCount }: Props) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose}
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${open ? "opacity-60" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 z-50 flex flex-col border-l transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "var(--drawer-bg)", borderColor: "var(--border)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ background: "var(--header-bg)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--brown)" }}>
              <span className="font-black text-xs" style={{ color: "var(--olive)" }}>LB</span>
            </div>
            <div>
              <div className="font-black text-xs tracking-widest" style={{ color: "var(--text)" }}>LIQUID BOARD</div>
              <div className="text-[8px]" style={{ color: "var(--muted)" }}>TRADING TERMINAL</div>
            </div>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Wallet summary */}
        <div className="mx-4 mt-4 p-3 rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="text-[9px] mb-1 tracking-wider" style={{ color: "var(--muted)" }}>WALLET</div>
          <div className="text-base font-mono font-bold" style={{ color: "var(--text)" }}>{balance}</div>
          <div className="text-xs font-mono mt-0.5" style={{ color: pnlPositive ? "var(--up)" : "var(--down)" }}>
            P&L {pnl}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.id];
            const isActive = activeTab === item.id;
            const badge = item.id === "portfolio" ? posCount + tradeCount : null;
            return (
              <button key={item.id} onClick={() => { onSelect(item.id); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-150 text-left"
                style={{
                  background: isActive ? "var(--olive-dim)" : "var(--surface)",
                  borderColor: isActive ? "var(--olive)" : "var(--border)",
                  color: isActive ? "var(--olive)" : "var(--muted)",
                }}
              >
                <span className="flex-shrink-0"><Icon /></span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight" style={{ color: isActive ? "var(--olive)" : "var(--text)" }}>{item.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>{item.desc}</div>
                </div>
                {badge !== null && badge > 0 && (
                  <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "var(--brown)", color: "var(--olive)" }}>
                    {badge}
                  </span>
                )}
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" style={{ color: "var(--olive)" }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--olive)" }} />
            <span className="text-[9px] tracking-wider" style={{ color: "var(--muted)" }}>LIVE MARKET DATA</span>
          </div>
        </div>
      </div>
    </>
  );
}
