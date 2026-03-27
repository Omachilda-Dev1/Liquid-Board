"use client";
import { useState, useRef } from "react";
import { usePrices } from "@/hooks/usePrices";
import TickerTape from "@/components/TickerTape";
import PriceCard from "@/components/PriceCard";
import Chart from "@/components/Chart";
import OrderBook from "@/components/OrderBook";
import OrderPanel from "@/components/OrderPanel";
import Positions from "@/components/Positions";
import TradeHistory, { Trade } from "@/components/TradeHistory";
import MarketStats from "@/components/MarketStats";
import Widgets from "@/components/Widgets";
import { Position, calcPortfolioValue } from "@/lib/wallet";

const INITIAL_BALANCE = 50000;

type MobileTab = "markets" | "chart" | "trade" | "portfolio";

export default function Home() {
  const { assets, prices, prevPrices, candles } = usePrices();
  const [selected, setSelected] = useState("BTC");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [usdBalance, setUsdBalance] = useState(INITIAL_BALANCE);
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chart");
  const tradeId = useRef(0);

  const selectedAsset = assets.find((a) => a.symbol === selected)!;
  const currentPrice = prices[selected] ?? selectedAsset.price;
  const totalVal = usdBalance + calcPortfolioValue(positions, prices);
  const totalPnL = totalVal - INITIAL_BALANCE;

  function handleOrder(side: "buy" | "sell", qty: number, total: number, orderType: string) {
    const cost = qty * currentPrice;
    if (side === "buy" && cost > usdBalance) return;
    setTrades((prev) => [
      ...prev,
      { id: tradeId.current++, side, symbol: selected, qty, price: currentPrice, total: cost, orderType, time: new Date().toLocaleTimeString() },
    ]);
    if (side === "buy") {
      setUsdBalance((b) => b - cost);
      setPositions((prev) => {
        const existing = prev[selected];
        if (existing) {
          const newQty = existing.qty + qty;
          const newAvg = (existing.avgEntry * existing.qty + currentPrice * qty) / newQty;
          return { ...prev, [selected]: { ...existing, qty: newQty, avgEntry: newAvg } };
        }
        return { ...prev, [selected]: { symbol: selected, qty, avgEntry: currentPrice, side: "long" } };
      });
    } else {
      const pos = positions[selected];
      const sellQty = Math.min(qty, pos?.qty ?? 0);
      const proceeds = sellQty * currentPrice;
      setUsdBalance((b) => b + proceeds);
      setPositions((prev) => {
        const existing = prev[selected];
        if (!existing) return prev;
        const newQty = existing.qty - sellQty;
        if (newQty <= 0) { const { [selected]: _, ...rest } = prev; return rest; }
        return { ...prev, [selected]: { ...existing, qty: newQty } };
      });
    }
  }

  function closePosition(symbol: string) {
    const pos = positions[symbol];
    if (!pos) return;
    const price = prices[symbol] ?? pos.avgEntry;
    const proceeds = pos.qty * price;
    setUsdBalance((b) => b + proceeds);
    setTrades((prev) => [
      ...prev,
      { id: tradeId.current++, side: "sell", symbol, qty: pos.qty, price, total: proceeds, orderType: "Market", time: new Date().toLocaleTimeString() },
    ]);
    setPositions((prev) => { const { [symbol]: _, ...rest } = prev; return rest; });
  }

  const pnlColor = totalPnL >= 0 ? "text-[#a8ba41]" : "text-[#e05a3a]";

  return (
    <div className="flex flex-col h-screen bg-[#1a1208] overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-3 md:px-4 py-2 border-b border-[#3d2e14] bg-[#231a0a] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#613910] flex items-center justify-center flex-shrink-0">
            <span className="text-[#a8ba41] font-black text-xs">LB</span>
          </div>
          <div>
            <div className="text-[#ecedf1] font-black text-xs sm:text-sm tracking-widest leading-tight">LIQUID BOARD</div>
            <div className="text-[7px] sm:text-[8px] text-[#9a8a6a] tracking-wider hidden sm:block">DECENTRALIZED TRADING TERMINAL</div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a8ba41] animate-pulse" />
            <span className="text-[#9a8a6a] hidden sm:inline">LIVE</span>
          </div>
          <div className="text-[#9a8a6a]">
            <span className="hidden sm:inline">Balance: </span>
            <span className="text-[#a8ba41] font-mono font-bold">${usdBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="text-[#9a8a6a] hidden md:block">
            P&L: <span className={`font-mono font-bold ${pnlColor}`}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </span>
          </div>
        </div>
      </header>

      {/* ── Ticker tape ── */}
      <TickerTape assets={assets} prices={prices} prevPrices={prevPrices} />

      {/* ══════════════════════════════════════════
          DESKTOP layout (lg+): 3-column terminal
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
        {/* Left: asset list */}
        <aside className="w-56 border-r border-[#3d2e14] flex flex-col flex-shrink-0 overflow-hidden">
          <div className="px-2 py-2 border-b border-[#3d2e14]">
            <div className="text-[9px] text-[#9a8a6a] tracking-wider">MARKETS</div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {assets.map((asset) => (
              <PriceCard key={asset.symbol} asset={asset}
                price={prices[asset.symbol] ?? asset.price}
                prevPrice={prevPrices[asset.symbol] ?? asset.price}
                selected={selected === asset.symbol}
                onClick={() => setSelected(asset.symbol)}
              />
            ))}
          </div>
        </aside>

        {/* Center: chart + stats + tabs */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AssetHeader asset={selectedAsset} price={currentPrice} />
          <div className="flex-1 min-h-0 p-3 border-b border-[#3d2e14]">
            <Chart symbol={selected} candles={candles[selected] ?? []} currentPrice={currentPrice} />
          </div>
          <div className="p-3 border-b border-[#3d2e14] flex-shrink-0">
            <MarketStats asset={selectedAsset} price={currentPrice} />
          </div>
          <BottomTabs activeTab={activeTab} setActiveTab={setActiveTab}
            positions={positions} prices={prices} trades={trades}
            onClose={closePosition} posCount={Object.keys(positions).length} tradeCount={trades.length}
          />
        </main>

        {/* Right: widgets + order + book */}
        <aside className="w-64 border-l border-[#3d2e14] flex flex-col flex-shrink-0 overflow-y-auto">
          <div className="p-3 space-y-3">
            <Widgets usdBalance={usdBalance} positions={positions} prices={prices} totalDeposited={INITIAL_BALANCE} />
            <OrderPanel symbol={selected} price={currentPrice} balance={usdBalance} onOrder={handleOrder} />
            <OrderBook symbol={selected} price={currentPrice} />
          </div>
        </aside>
      </div>

      {/* ══════════════════════════════════════════
          TABLET layout (md–lg): 2-column
      ══════════════════════════════════════════ */}
      <div className="hidden md:flex lg:hidden flex-1 min-h-0 overflow-hidden">
        {/* Left: asset list narrow */}
        <aside className="w-44 border-r border-[#3d2e14] flex flex-col flex-shrink-0 overflow-hidden">
          <div className="px-2 py-1.5 border-b border-[#3d2e14]">
            <div className="text-[9px] text-[#9a8a6a] tracking-wider">MARKETS</div>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
            {assets.map((asset) => (
              <PriceCard key={asset.symbol} asset={asset}
                price={prices[asset.symbol] ?? asset.price}
                prevPrice={prevPrices[asset.symbol] ?? asset.price}
                selected={selected === asset.symbol}
                onClick={() => setSelected(asset.symbol)}
              />
            ))}
          </div>
        </aside>

        {/* Right: tabbed content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AssetHeader asset={selectedAsset} price={currentPrice} />
          {/* Tab bar */}
          <div className="flex border-b border-[#3d2e14] flex-shrink-0">
            {(["chart", "trade", "portfolio"] as const).map((t) => (
              <button key={t} onClick={() => setMobileTab(t as MobileTab)}
                className={`flex-1 py-2 text-[10px] font-semibold capitalize transition-colors border-b-2 ${
                  mobileTab === t ? "border-[#a8ba41] text-[#a8ba41]" : "border-transparent text-[#9a8a6a]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {mobileTab === "chart" && (
              <div className="p-3 space-y-3">
                <div className="h-64">
                  <Chart symbol={selected} candles={candles[selected] ?? []} currentPrice={currentPrice} />
                </div>
                <MarketStats asset={selectedAsset} price={currentPrice} />
                <OrderBook symbol={selected} price={currentPrice} />
              </div>
            )}
            {mobileTab === "trade" && (
              <div className="p-3 space-y-3">
                <OrderPanel symbol={selected} price={currentPrice} balance={usdBalance} onOrder={handleOrder} />
                <Widgets usdBalance={usdBalance} positions={positions} prices={prices} totalDeposited={INITIAL_BALANCE} />
              </div>
            )}
            {mobileTab === "portfolio" && (
              <div className="p-3 space-y-3">
                <Positions positions={positions} prices={prices} onClose={closePosition} />
                <TradeHistory trades={trades} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          MOBILE layout (<md): bottom nav tabs
      ══════════════════════════════════════════ */}
      <div className="flex md:hidden flex-1 flex-col min-h-0 overflow-hidden">
        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {mobileTab === "markets" && (
            <div className="p-2 space-y-1.5">
              {assets.map((asset) => (
                <PriceCard key={asset.symbol} asset={asset}
                  price={prices[asset.symbol] ?? asset.price}
                  prevPrice={prevPrices[asset.symbol] ?? asset.price}
                  selected={selected === asset.symbol}
                  onClick={() => { setSelected(asset.symbol); setMobileTab("chart"); }}
                />
              ))}
            </div>
          )}
          {mobileTab === "chart" && (
            <div className="p-3 space-y-3">
              <AssetHeader asset={selectedAsset} price={currentPrice} />
              <div style={{ height: 260 }}>
                <Chart symbol={selected} candles={candles[selected] ?? []} currentPrice={currentPrice} />
              </div>
              <MarketStats asset={selectedAsset} price={currentPrice} />
              <OrderBook symbol={selected} price={currentPrice} />
            </div>
          )}
          {mobileTab === "trade" && (
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#ecedf1]">{selected}/USD</span>
                <span className="text-sm font-mono font-bold text-[#a8ba41]">
                  ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <OrderPanel symbol={selected} price={currentPrice} balance={usdBalance} onOrder={handleOrder} />
              <Widgets usdBalance={usdBalance} positions={positions} prices={prices} totalDeposited={INITIAL_BALANCE} />
            </div>
          )}
          {mobileTab === "portfolio" && (
            <div className="p-3 space-y-3">
              <Positions positions={positions} prices={prices} onClose={closePosition} />
              <TradeHistory trades={trades} />
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <nav className="flex-shrink-0 flex border-t border-[#3d2e14] bg-[#231a0a]">
          {([
            { id: "markets", icon: "◈", label: "Markets" },
            { id: "chart",   icon: "◉", label: "Chart" },
            { id: "trade",   icon: "⊕", label: "Trade" },
            { id: "portfolio", icon: "◎", label: "Portfolio" },
          ] as { id: MobileTab; icon: string; label: string }[]).map((tab) => (
            <button key={tab.id} onClick={() => setMobileTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
                mobileTab === tab.id ? "text-[#a8ba41]" : "text-[#9a8a6a]"
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="text-[9px] font-semibold">{tab.label}</span>
              {mobileTab === tab.id && <span className="w-4 h-0.5 bg-[#a8ba41] rounded-full" />}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function AssetHeader({ asset, price }: { asset: { name: string; symbol: string; change24h: number }; price: number }) {
  return (
    <div className="px-3 py-2 border-b border-[#3d2e14] flex items-center gap-3 flex-shrink-0 flex-wrap">
      <div>
        <span className="text-[#ecedf1] font-black text-sm">{asset.name}</span>
        <span className="text-[#9a8a6a] text-xs ml-2">{asset.symbol}/USD</span>
      </div>
      <div className="text-lg font-mono font-bold text-[#ecedf1]">
        ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: price < 1 ? 4 : 2 })}
      </div>
      <div className={`text-sm font-mono font-semibold ${asset.change24h >= 0 ? "text-[#a8ba41]" : "text-[#e05a3a]"}`}>
        {asset.change24h >= 0 ? "▲" : "▼"} {Math.abs(asset.change24h)}%
      </div>
    </div>
  );
}

function BottomTabs({ activeTab, setActiveTab, positions, prices, trades, onClose, posCount, tradeCount }: {
  activeTab: "positions" | "history";
  setActiveTab: (t: "positions" | "history") => void;
  positions: Record<string, Position>;
  prices: Record<string, number>;
  trades: Trade[];
  onClose: (s: string) => void;
  posCount: number;
  tradeCount: number;
}) {
  return (
    <div className="flex-shrink-0" style={{ height: 220 }}>
      <div className="flex border-b border-[#3d2e14]">
        {(["positions", "history"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold capitalize transition-colors border-b-2 ${
              activeTab === tab ? "border-[#a8ba41] text-[#a8ba41]" : "border-transparent text-[#9a8a6a] hover:text-[#ecedf1]"
            }`}
          >
            {tab === "positions" ? `Positions (${posCount})` : `History (${tradeCount})`}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto" style={{ height: 180 }}>
        {activeTab === "positions"
          ? <Positions positions={positions} prices={prices} onClose={onClose} />
          : <TradeHistory trades={trades} />
        }
      </div>
    </div>
  );
}
