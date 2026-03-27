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
import MobileMenu from "@/components/MobileMenu";
import ThemeToggle from "@/components/ThemeToggle";
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
  const [menuOpen, setMenuOpen] = useState(false);
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


  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-3 md:px-4 py-2 border-b flex-shrink-0"
        style={{ background: "var(--header-bg)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--brown)" }}>
            <span className="font-black text-xs" style={{ color: "var(--olive)" }}>LB</span>
          </div>
          <div>
            <div className="font-black text-xs sm:text-sm tracking-widest leading-tight" style={{ color: "var(--text)" }}>LIQUID BOARD</div>
            <div className="text-[7px] sm:text-[8px] tracking-wider hidden sm:block" style={{ color: "var(--muted)" }}>DECENTRALIZED TRADING TERMINAL</div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px]">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--olive)" }} />
            <span className="hidden sm:inline" style={{ color: "var(--muted)" }}>LIVE</span>
          </div>
          <div style={{ color: "var(--muted)" }}>
            <span className="hidden sm:inline">Balance: </span>
            <span className="font-mono font-bold" style={{ color: "var(--olive)" }}>
              ${usdBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="hidden md:block" style={{ color: "var(--muted)" }}>
            P&L: <span className="font-mono font-bold" style={{ color: totalPnL >= 0 ? "var(--up)" : "var(--down)" }}>
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </span>
          </div>
          {/* Theme toggle */}
          <ThemeToggle />
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 rounded-lg border transition-colors"
            style={{ borderColor: "var(--border)", background: "var(--surface2)" }}
            aria-label="Open menu"
          >
            <span className="w-4 h-0.5 rounded-full" style={{ background: "var(--olive)" }} />
            <span className="w-4 h-0.5 rounded-full" style={{ background: "var(--olive)" }} />
            <span className="w-2.5 h-0.5 rounded-full" style={{ background: "var(--olive)" }} />
          </button>
        </div>
      </header>

      {/* ── Ticker tape ── */}
      <TickerTape assets={assets} prices={prices} prevPrices={prevPrices} />

      {/* Mobile drawer menu */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeTab={mobileTab}
        onSelect={setMobileTab}
        balance={`$${usdBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        pnl={`${totalPnL >= 0 ? "+" : ""}$${totalPnL.toFixed(2)}`}
        pnlPositive={totalPnL >= 0}
        posCount={Object.keys(positions).length}
        tradeCount={trades.length}
      />

      {/* ══════════════════════════════════════════
          DESKTOP layout (lg+): 3-column terminal
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
        {/* Left: asset list */}
        <aside className="w-56 border-r flex flex-col flex-shrink-0 overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="px-2 py-2 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="text-[9px] tracking-wider" style={{ color: "var(--muted)" }}>MARKETS</div>
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
          <div className="flex-1 min-h-0 p-3 border-b" style={{ borderColor: "var(--border)" }}>
            <Chart symbol={selected} candles={candles[selected] ?? []} currentPrice={currentPrice} />
          </div>
          <div className="p-3 border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
            <MarketStats asset={selectedAsset} price={currentPrice} />
          </div>
          <BottomTabs activeTab={activeTab} setActiveTab={setActiveTab}
            positions={positions} prices={prices} trades={trades}
            onClose={closePosition} posCount={Object.keys(positions).length} tradeCount={trades.length}
          />
        </main>

        {/* Right: widgets + order + book */}
        <aside className="w-64 border-l flex flex-col flex-shrink-0 overflow-y-auto" style={{ borderColor: "var(--border)" }}>
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
        <aside className="w-44 border-r flex flex-col flex-shrink-0 overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="px-2 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="text-[9px] tracking-wider" style={{ color: "var(--muted)" }}>MARKETS</div>
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
          <div className="flex border-b flex-shrink-0" style={{ borderColor: "var(--border)" }}>
            {(["chart", "trade", "portfolio"] as const).map((t) => (
              <button key={t} onClick={() => setMobileTab(t as MobileTab)}
                className="flex-1 py-2 text-[10px] font-semibold capitalize transition-colors border-b-2"
                style={{
                  borderBottomColor: mobileTab === t ? "var(--olive)" : "transparent",
                  color: mobileTab === t ? "var(--olive)" : "var(--muted)",
                }}
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
          MOBILE layout (<md): full screen, hamburger nav
      ══════════════════════════════════════════ */}
      <div className="flex md:hidden flex-1 flex-col min-h-0 overflow-hidden">
        {/* Active tab label bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
          style={{ background: "var(--header-bg)", borderColor: "var(--border)" }}>
          <span className="text-[10px] tracking-wider uppercase" style={{ color: "var(--muted)" }}>{mobileTab}</span>
          {mobileTab === "chart" && (
            <span className="text-xs font-mono font-bold" style={{ color: "var(--olive)" }}>
              {selected}/USD · ${currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {/* Content area — full height, scrollable */}
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
              <div className="flex items-center justify-between p-3 rounded-xl border"
                style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>{selected}/USD</span>
                <span className="text-sm font-mono font-bold" style={{ color: "var(--olive)" }}>
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
      </div>
    </div>
  );
}

/* ── Shared sub-components ── */

function AssetHeader({ asset, price }: { asset: { name: string; symbol: string; change24h: number }; price: number }) {
  return (
    <div className="px-3 py-2 border-b flex items-center gap-3 flex-shrink-0 flex-wrap" style={{ borderColor: "var(--border)" }}>
      <div>
        <span className="font-black text-sm" style={{ color: "var(--text)" }}>{asset.name}</span>
        <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>{asset.symbol}/USD</span>
      </div>
      <div className="text-lg font-mono font-bold" style={{ color: "var(--text)" }}>
        ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: price < 1 ? 4 : 2 })}
      </div>
      <div className="text-sm font-mono font-semibold" style={{ color: asset.change24h >= 0 ? "var(--up)" : "var(--down)" }}>
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
      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        {(["positions", "history"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-xs font-semibold capitalize transition-colors border-b-2"
            style={{
              borderBottomColor: activeTab === tab ? "var(--olive)" : "transparent",
              color: activeTab === tab ? "var(--olive)" : "var(--muted)",
            }}
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
