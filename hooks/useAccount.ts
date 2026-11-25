"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { OrderType, PendingOrder, Position, Side, Trade, triggers } from "@/lib/wallet";
import { fmtPrice, fmtUsd } from "@/lib/format";

export const STARTING_BALANCE = 50_000;
const STORAGE_KEY = "lb-account-v3";

type AccountState = {
  cash: number;
  positions: Record<string, Position>;
  trades: Trade[];
  orders: PendingOrder[];
  nextId: number;
};

const fresh = (): AccountState => ({ cash: STARTING_BALANCE, positions: {}, trades: [], orders: [], nextId: 1 });

export type OrderRequest = { side: Side; symbol: string; qty: number; type: OrderType; trigger?: number; leverage: number };
export type OrderResult =
  | { ok: true; kind: "filled"; trade: Trade }
  | { ok: true; kind: "resting"; order: PendingOrder }
  | { ok: false; error: string };

type Fill = { state: AccountState; trade?: Trade; error?: string };

/** Pure fill against a state snapshot; used by market orders, triggers and liquidations. */
function fill(s: AccountState, side: Side, symbol: string, qty: number, price: number, orderType: Trade["orderType"], leverage: number, time: number): Fill {
  const id = s.nextId;
  if (side === "buy") {
    const notional = qty * price;
    const margin = notional / leverage;
    if (margin > s.cash + 1e-6) return { state: s, error: `Not enough cash: this needs ${fmtUsd(margin)} of margin and you have ${fmtUsd(s.cash)}.` };
    const debt = notional - margin;
    const ex = s.positions[symbol];
    const pos: Position = ex
      ? { ...ex, qty: ex.qty + qty, avgEntry: (ex.avgEntry * ex.qty + notional) / (ex.qty + qty), debt: ex.debt + debt }
      : { symbol, qty, avgEntry: price, side: "long", debt, openedAt: time };
    const trade: Trade = { id, side, symbol, qty, price, total: notional, orderType, leverage, time };
    return { trade, state: { ...s, cash: s.cash - margin, positions: { ...s.positions, [symbol]: pos }, trades: [trade, ...s.trades].slice(0, 300), nextId: id + 1 } };
  }
  const ex = s.positions[symbol];
  if (!ex) return { state: s, error: `You hold no ${symbol} to sell.` };
  const sellQty = Math.min(qty, ex.qty);
  const debtShare = ex.debt * (sellQty / ex.qty);
  const gross = sellQty * price;
  const net = Math.max(0, gross - debtShare);
  const remaining = ex.qty - sellQty;
  const positions = { ...s.positions };
  if (remaining <= 1e-9) delete positions[symbol];
  else positions[symbol] = { ...ex, qty: remaining, debt: ex.debt - debtShare };
  const trade: Trade = { id, side, symbol, qty: sellQty, price, total: gross, orderType, leverage: 1, time, realised: (price - ex.avgEntry) * sellQty };
  return { trade, state: { ...s, cash: s.cash + net, positions, trades: [trade, ...s.trades].slice(0, 300), nextId: id + 1 } };
}

export type AccountEvent = { id: number; tone: "ok" | "warn"; text: string };

export function useAccount(prices: Record<string, number>) {
  const [state, setState] = useState<AccountState>(fresh);
  const [hydrated, setHydrated] = useState(false);
  const [events, setEvents] = useState<AccountEvent[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  const eventId = useRef(0);

  const pushEvent = useCallback((tone: AccountEvent["tone"], text: string) => {
    const id = ++eventId.current;
    setEvents((e) => [...e.slice(-2), { id, tone, text }]);
    setTimeout(() => setEvents((e) => e.filter((x) => x.id !== id)), 5000);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AccountState;
        if (typeof parsed.cash === "number" && parsed.positions && Array.isArray(parsed.trades) && Array.isArray(parsed.orders)) setState(parsed);
      }
    } catch {
      /* unreadable storage: start fresh */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state, hydrated]);

  // Every tick: trigger resting orders, then liquidate positions whose equity is gone.
  useEffect(() => {
    if (!hydrated) return;
    let s = stateRef.current;
    let changed = false;
    const now = Date.now();
    const keep: PendingOrder[] = [];
    for (const o of s.orders) {
      const p = prices[o.symbol];
      if (p === undefined || !triggers(o, p)) { keep.push(o); continue; }
      changed = true;
      const r = fill({ ...s, orders: [] }, o.side, o.symbol, o.qty, p, o.type, o.leverage, now);
      s = { ...r.state, orders: s.orders };
      if (r.trade) pushEvent("ok", `${o.type} ${o.side} filled: ${r.trade.qty.toFixed(4)} ${o.symbol} at ${fmtPrice(p)}`);
      else pushEvent("warn", `${o.type} ${o.side} ${o.symbol} cancelled. ${r.error}`);
    }
    if (changed) s = { ...s, orders: keep };
    for (const pos of Object.values(s.positions)) {
      const p = prices[pos.symbol];
      if (p !== undefined && pos.debt > 0 && pos.qty * p - pos.debt <= pos.qty * p * 0.005) {
        changed = true;
        const r = fill(s, "sell", pos.symbol, pos.qty, p, "Liquidation", 1, now);
        s = r.state;
        pushEvent("warn", `${pos.symbol} position liquidated at ${fmtPrice(p)}: margin exhausted.`);
      }
    }
    if (changed) setState(s);
  }, [prices, hydrated, pushEvent]);

  const placeOrder = useCallback(
    (req: OrderRequest): OrderResult => {
      const s = stateRef.current;
      const price = prices[req.symbol];
      if (!(req.qty > 0) || !Number.isFinite(req.qty)) return { ok: false, error: "Enter an amount above zero." };
      if (req.side === "sell" && !s.positions[req.symbol]) return { ok: false, error: `You hold no ${req.symbol} to sell.` };

      if (req.type !== "Market") {
        const trigger = req.trigger ?? NaN;
        if (!(trigger > 0)) return { ok: false, error: `Enter a ${req.type.toLowerCase()} price.` };
        if (req.side === "buy" && (req.qty * trigger) / req.leverage > s.cash) {
          return { ok: false, error: `Not enough cash for this order at ${fmtPrice(trigger)}.` };
        }
        if (!triggers({ side: req.side, type: req.type, trigger }, price)) {
          const order: PendingOrder = { id: s.nextId, side: req.side, symbol: req.symbol, qty: req.qty, type: req.type, trigger, leverage: req.leverage, createdAt: Date.now() };
          setState({ ...s, orders: [order, ...s.orders], nextId: s.nextId + 1 });
          return { ok: true, kind: "resting", order };
        }
      }

      const r = fill(s, req.side, req.symbol, req.qty, price, req.type, req.side === "buy" ? req.leverage : 1, Date.now());
      if (!r.trade) return { ok: false, error: r.error ?? "Order rejected." };
      setState(r.state);
      return { ok: true, kind: "filled", trade: r.trade };
    },
    [prices],
  );

  const closePosition = useCallback(
    (symbol: string) => {
      const pos = stateRef.current.positions[symbol];
      if (pos) placeOrder({ side: "sell", symbol, qty: pos.qty, type: "Market", leverage: 1 });
    },
    [placeOrder],
  );

  const cancelOrder = useCallback((id: number) => {
    setState((s) => ({ ...s, orders: s.orders.filter((o) => o.id !== id) }));
  }, []);

  const reset = useCallback(() => setState(fresh()), []);

  return { ...state, hydrated, events, placeOrder, closePosition, cancelOrder, reset };
}
