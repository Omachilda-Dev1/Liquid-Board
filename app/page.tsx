"use client";
import { useCallback, useEffect, useState } from "react";
import { usePrices } from "@/hooks/usePrices";
import { STARTING_BALANCE, useAccount } from "@/hooks/useAccount";
import { open24h } from "@/lib/mockData";
import { Side, calcPortfolioValue } from "@/lib/wallet";
import TopBar from "@/components/TopBar";
import TickerTape from "@/components/TickerTape";
import MarketList from "@/components/MarketList";
import PairHeader from "@/components/PairHeader";
import PriceChart from "@/components/PriceChart";
import RouteStrip from "@/components/RouteStrip";
import OrderTicket from "@/components/OrderTicket";
import OrderBook from "@/components/OrderBook";
import AccountPanel from "@/components/AccountPanel";
import PortfolioTables from "@/components/PortfolioTables";
import MobileNav, { MobileTab } from "@/components/MobileNav";
import EventToasts from "@/components/EventToasts";

type Layout = "desktop" | "tablet" | "mobile";

function useLayout(): Layout | null {
  const [layout, setLayout] = useState<Layout | null>(null);
  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1180px)");
    const md = window.matchMedia("(min-width: 768px)");
    const update = () => setLayout(lg.matches ? "desktop" : md.matches ? "tablet" : "mobile");
    update();
    lg.addEventListener("change", update);
    md.addEventListener("change", update);
    return () => { lg.removeEventListener("change", update); md.removeEventListener("change", update); };
  }, []);
  return layout;
}

export default function Home() {
  const { assets, prices, prevPrices, ranges, series, tick } = usePrices();
  const account = useAccount(prices);
  const layout = useLayout();
  const [selected, setSelected] = useState("BTC");
  const [side, setSide] = useState<Side>("buy");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chart");
  const [picked, setPicked] = useState<{ value: number; nonce: number } | undefined>();

  const asset = assets.find((a) => a.symbol === selected)!;
  const price = prices[selected];
  const open = open24h(asset);
  const range = ranges[selected];
  const position = account.positions[selected];
  const positionsValue = calcPortfolioValue(account.positions, prices);
  const debt = Object.values(account.positions).reduce((s, p) => s + p.debt, 0);
  const equity = account.cash + positionsValue;
  const pnl = equity - STARTING_BALANCE;

  const pickPrice = useCallback((value: number) => {
    setPicked({ value, nonce: Date.now() });
    if (layout !== "desktop") setMobileTab("trade");
  }, [layout]);

  // Keyboard: B / S pick the side, 1-9 pick a market. Ignored while typing.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || el.closest("input, textarea, select, [contenteditable]")) return;
      const k = e.key.toLowerCase();
      if (k === "b") setSide("buy");
      else if (k === "s") setSide("sell");
      else if (/^[1-9]$/.test(k) && assets[+k - 1]) setSelected(assets[+k - 1].symbol);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [assets]);

  const selectMarket = (sym: string) => {
    setSelected(sym);
    if (layout === "mobile") setMobileTab("chart");
  };

  const marketList = (
    <MarketList assets={assets} prices={prices} prevPrices={prevPrices} selected={selected} onSelect={selectMarket} tick={tick} />
  );
  const pairHeader = (
    <PairHeader asset={asset} price={price} prevPrice={prevPrices[selected]} open={open} high={range.high} low={range.low} tick={tick} />
  );
  const chart = <PriceChart series={series?.[selected] ?? null} price={price} route={asset.route} routeInk={asset.routeInk} entry={position?.avgEntry} />;
  const route = <RouteStrip asset={asset} price={price} open={open} high={range.high} low={range.low} entry={position?.avgEntry} />;
  const ticket = (
    <OrderTicket asset={asset} price={price} cash={account.cash} held={position?.qty ?? 0} side={side} onSideChange={setSide}
      onOrder={account.placeOrder} pickedPrice={picked} />
  );
  const book = <OrderBook symbol={selected} price={price} route={asset.route} routeInk={asset.routeInk} onPickPrice={pickPrice} />;
  const bookFill = <OrderBook symbol={selected} price={price} rows={24} fill route={asset.route} routeInk={asset.routeInk} onPickPrice={pickPrice} />;
  const accountPanel = <AccountPanel cash={account.cash} positionsValue={positionsValue} debt={debt} onReset={layout === "desktop" ? undefined : account.reset} />;
  const portfolio = (compact: boolean) => (
    <PortfolioTables positions={account.positions} orders={account.orders} trades={account.trades} prices={prices}
      onClose={account.closePosition} onCancel={account.cancelOrder} onSelect={selectMarket} compact={compact} />
  );
  const openCount = Object.keys(account.positions).length + account.orders.length;

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-ground text-ink">
      <TopBar equity={equity} cash={account.cash} pnl={pnl} pnlPct={(pnl / STARTING_BALANCE) * 100} onReset={account.reset} />
      {layout && layout !== "mobile" ? <TickerTape assets={assets} prices={prices} onSelect={selectMarket} /> : null}

      {layout === "desktop" ? (
        <div className="grid min-h-0 flex-1 grid-cols-[240px_minmax(0,1fr)_320px] min-[1440px]:grid-cols-[260px_minmax(0,1fr)_340px]">
          <aside className="min-h-0 overflow-y-auto border-r border-rule">
            {marketList}
          </aside>
          {/* On short windows the centre scrolls instead of crushing the chart. */}
          <main className="min-h-0 overflow-y-auto">
            <div className="flex min-h-full flex-col">
              {pairHeader}
              <div className="grid min-h-[500px] flex-1 grid-cols-[minmax(0,1fr)_272px]">
                <div className="flex min-w-0 flex-col">
                  <div className="min-h-[300px] flex-1">{chart}</div>
                  {route}
                </div>
                <div className="relative border-l border-rule">
                  <div className="absolute inset-0">{bookFill}</div>
                </div>
              </div>
              <div className="h-[220px] shrink-0">{portfolio(false)}</div>
            </div>
          </main>
          <aside className="min-h-0 overflow-y-auto border-l border-rule">
            {ticket}
            {accountPanel}
          </aside>
        </div>
      ) : null}

      {layout === "tablet" ? (
        <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-r border-rule">
            {marketList}
            {accountPanel}
          </aside>
          <main className="flex min-h-0 flex-col">
            {pairHeader}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {mobileTab === "trade" ? (
                <div className="grid grid-cols-2 border-b border-rule"><div className="border-r border-rule">{ticket}</div><div>{book}</div></div>
              ) : mobileTab === "portfolio" ? (
                <div className="h-full">{portfolio(false)}</div>
              ) : (
                <div className="flex h-full min-h-[460px] flex-col"><div className="min-h-0 flex-1">{chart}</div>{route}</div>
              )}
            </div>
            <MobileNav active={mobileTab === "markets" ? "chart" : mobileTab} onChange={setMobileTab} badge={openCount} include={["chart", "trade", "portfolio"]} />
          </main>
        </div>
      ) : null}

      {layout === "mobile" ? (
        <>
          <main className="min-h-0 flex-1 overflow-y-auto">
            {mobileTab === "markets" ? <>{marketList}{accountPanel}</> : null}
            {mobileTab === "chart" ? (
              <>
                {pairHeader}
                <div className="h-[340px]">{chart}</div>
                {route}
                {book}
              </>
            ) : null}
            {mobileTab === "trade" ? <>{pairHeader}{ticket}</> : null}
            {mobileTab === "portfolio" ? <div className="min-h-full">{portfolio(true)}</div> : null}
          </main>
          <MobileNav active={mobileTab} onChange={setMobileTab} badge={openCount} />
        </>
      ) : null}

      <EventToasts events={account.events} />
    </div>
  );
}
