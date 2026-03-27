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
  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${open ? "opacity-60" : "opacity-0 pointer-events-none"}`}
      />

      {/* Drawer — slides in from right */}
      <div className={`fixed top-0 right-0 h-full w-72 z-50 bg-[#1a1208] border-l border-[#3d2e14] flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#3d2e14] bg-[#231a0a]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#613910] flex items-center justify-center">
              <span className="text-[#a8ba41] font-black text-xs">LB</span>
            </div>
            <div>
              <div className="text-[#ecedf1] font-black text-xs tracking-widest">LIQUID BOARD</div>
              <div className="text-[8px] text-[#9a8a6a]">TRADING TERMINAL</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg border border-[#3d2e14] text-[#9a8a6a] hover:text-[#ecedf1] hover:border-[#613910] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Wallet summary */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-[#231a0a] border border-[#3d2e14]">
          <div className="text-[9px] text-[#9a8a6a] mb-1 tracking-wider">WALLET</div>
          <div className="text-base font-mono font-bold text-[#ecedf1]">{balance}</div>
          <div className={`text-xs font-mono mt-0.5 ${pnlPositive ? "text-[#a8ba41]" : "text-[#e05a3a]"}`}>
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
              <button
                key={item.id}
                onClick={() => { onSelect(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-150 text-left ${
                  isActive
                    ? "bg-[#a8ba4115] border-[#a8ba41] text-[#a8ba41]"
                    : "bg-[#231a0a] border-[#3d2e14] text-[#9a8a6a] hover:border-[#613910] hover:text-[#ecedf1]"
                }`}
              >
                <span className={`flex-shrink-0 ${isActive ? "text-[#a8ba41]" : "text-[#9a8a6a]"}`}>
                  <Icon />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight">{item.label}</div>
                  <div className="text-[10px] text-[#9a8a6a] mt-0.5">{item.desc}</div>
                </div>
                {badge !== null && badge > 0 && (
                  <span className="flex-shrink-0 text-[9px] font-bold bg-[#613910] text-[#a8ba41] px-1.5 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
                {isActive && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-[#a8ba41]">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#3d2e14]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a8ba41] animate-pulse" />
            <span className="text-[9px] text-[#9a8a6a] tracking-wider">LIVE MARKET DATA</span>
          </div>
        </div>
      </div>
    </>
  );
}
