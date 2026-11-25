"use client";
import { useEffect, useId, useState } from "react";
import { Asset } from "@/lib/mockData";
import { OrderType, Side } from "@/lib/wallet";
import { fmtPrice, fmtQty, fmtUsd, priceDecimals } from "@/lib/format";
import type { OrderRequest, OrderResult } from "@/hooks/useAccount";
import SignBand from "./SignBand";

type Props = {
  asset: Asset;
  price: number;
  cash: number;
  held: number;
  side: Side;
  onSideChange: (side: Side) => void;
  onOrder: (req: OrderRequest) => OrderResult;
  /** Price clicked in the order book; prefills the limit price. */
  pickedPrice?: { value: number; nonce: number };
};

const TYPES: OrderType[] = ["Market", "Limit", "Stop"];
const PRESETS = [25, 50, 75, 100];
const LEVERAGE_MARKS = [1, 2, 5, 10, 20];

export default function OrderTicket({ asset, price, cash, held, side, onSideChange, onOrder, pickedPrice }: Props) {
  const uid = useId();
  const [type, setType] = useState<OrderType>("Market");
  const [qty, setQty] = useState("");
  const [trigger, setTrigger] = useState("");
  const [leverage, setLeverage] = useState(1);
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  // A new market resets the ticket.
  useEffect(() => {
    setQty("");
    setTrigger("");
    setStatus(null);
  }, [asset.symbol]);

  useEffect(() => {
    if (!pickedPrice) return;
    setType((t) => (t === "Market" ? "Limit" : t));
    setTrigger(pickedPrice.value.toFixed(priceDecimals(pickedPrice.value)));
  }, [pickedPrice]);

  useEffect(() => {
    if (!status) return;
    const id = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(id);
  }, [status]);

  const q = parseFloat(qty);
  const t = parseFloat(trigger);
  const execPrice = type === "Market" ? price : t > 0 ? t : price;
  const lev = side === "buy" ? leverage : 1;
  const notional = (q > 0 ? q : 0) * execPrice;
  const margin = notional / lev;
  const maxQty = side === "buy" ? (cash * lev) / execPrice : held;
  const overCash = side === "buy" && margin > cash + 1e-6;
  const overHeld = side === "sell" && q > held + 1e-9;
  const noPosition = side === "sell" && held <= 0;

  function setPct(pct: number) {
    const v = (maxQty * pct) / 100;
    setQty(v > 0 ? (Math.floor(v * 10_000) / 10_000).toString() : "");
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = onOrder({ side, symbol: asset.symbol, qty: q, type, trigger: t, leverage: lev });
    if (!res.ok) { setStatus({ tone: "error", text: res.error }); return; }
    if (res.kind === "filled") {
      setStatus({ tone: "ok", text: `Filled: ${side === "buy" ? "bought" : "sold"} ${fmtQty(res.trade.qty)} ${asset.symbol} at ${fmtPrice(res.trade.price)}` });
    } else {
      setStatus({ tone: "ok", text: `${type} ${side} resting at ${fmtPrice(res.order.trigger)}. It fills when price ${
        (type === "Limit") === (side === "buy") ? "falls to" : "rises to"
      } it.` });
    }
    setQty("");
  }

  const isBuy = side === "buy";
  const disabled = !(q > 0) || overCash || noPosition || (type !== "Market" && !(t > 0));
  const triggerHint = type === "Limit"
    ? isBuy ? "Buys when price falls to this level." : "Sells when price rises to this level."
    : type === "Stop"
      ? isBuy ? "Buys when price rises to this level." : "Sells when price falls to this level."
      : "";

  return (
    <section aria-labelledby={`${uid}-h`} className="flex flex-col">
      <SignBand id={`${uid}-h`} label="Order ticket">
        <span className="num">{asset.symbol}/USD</span>
      </SignBand>
      <form onSubmit={submit} className="space-y-4 px-4 pb-4 pt-3" noValidate>
        <div role="tablist" aria-label="Side" className="grid grid-cols-2 border-2 border-ink">
          {(["buy", "sell"] as const).map((s) => {
            const active = side === s;
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSideChange(s)}
                className={`h-10 text-[14px] font-extrabold uppercase tracking-[0.06em] transition-colors ${
                  active ? (s === "buy" ? "bg-up-fill text-white" : "bg-down-fill text-white") : "text-ink-2 hover:bg-ground-3 hover:text-ink"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <div role="tablist" aria-label="Order type" className="flex border-b border-rule">
          {TYPES.map((ty) => (
            <button
              key={ty}
              type="button"
              role="tab"
              aria-selected={type === ty}
              onClick={() => setType(ty)}
              className={`-mb-px h-9 flex-1 border-b-[3px] text-[13px] font-semibold transition-colors ${
                type === ty ? "border-ink text-ink" : "border-transparent text-ink-3 hover:text-ink"
              }`}
            >
              {ty}
            </button>
          ))}
        </div>

        {type !== "Market" ? (
          <div>
            <label htmlFor={`${uid}-trigger`} className="mb-1.5 flex justify-between text-[12px] font-semibold text-ink-2">
              <span>{type} price</span>
              <button type="button" className="font-medium text-ink-3 underline-offset-4 hover:text-ink hover:underline" onClick={() => setTrigger(price.toFixed(priceDecimals(price)))}>
                Use last
              </button>
            </label>
            <div className="flex h-11 items-center border border-rule-strong bg-ground focus-within:border-ink">
              <input
                id={`${uid}-trigger`}
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder={fmtPrice(price).replace(/,/g, "")}
                className="num h-full w-full bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-ink-3"
              />
              <span className="pr-3 text-[12px] font-semibold text-ink-3">USD</span>
            </div>
            <p className="mt-1.5 text-[12px] text-ink-3">{triggerHint}</p>
          </div>
        ) : null}

        <div>
          <label htmlFor={`${uid}-qty`} className="mb-1.5 flex justify-between text-[12px] font-semibold text-ink-2">
            <span>Amount</span>
            <span className="num font-medium text-ink-3">
              {isBuy ? `Max ${fmtQty(Math.max(0, maxQty))}` : `Held ${fmtQty(held)}`}
            </span>
          </label>
          <div className={`flex h-11 items-center border bg-ground focus-within:border-ink ${overCash || overHeld ? "border-down" : "border-rule-strong"}`}>
            <input
              id={`${uid}-qty`}
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0.0000"
              aria-invalid={overCash || overHeld}
              aria-describedby={`${uid}-status`}
              className="num h-full w-full bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-ink-3"
            />
            <span className="pr-3 text-[12px] font-semibold text-ink-3">{asset.symbol}</span>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPct(p)}
                disabled={maxQty <= 0}
                className="num h-8 border border-rule-strong text-[12px] font-semibold text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                {p === 100 ? "Max" : `${p}%`}
              </button>
            ))}
          </div>
        </div>

        {isBuy ? (
          <div>
            <label htmlFor={`${uid}-lev`} className="mb-1 flex justify-between text-[12px] font-semibold text-ink-2">
              <span>Leverage</span>
              <span className="num text-[13px] text-ink">{leverage}×</span>
            </label>
            <input
              id={`${uid}-lev`}
              type="range"
              min={1}
              max={20}
              step={1}
              value={leverage}
              onChange={(e) => setLeverage(+e.target.value)}
              className="lb-range"
              style={{ ["--fill" as string]: `${((leverage - 1) / 19) * 100}%` }}
            />
            <div className="flex justify-between">
              {LEVERAGE_MARKS.map((m) => (
                <button key={m} type="button" onClick={() => setLeverage(m)}
                  className={`num text-[11px] ${leverage === m ? "font-bold text-ink" : "text-ink-3 hover:text-ink"}`}>
                  {m}×
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <dl className="space-y-1.5 border-t border-rule pt-3 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-ink-3">{type === "Market" ? "Est. price" : `${type} price`}</dt>
            <dd className="num">{fmtPrice(execPrice)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-3">Position size</dt>
            <dd className="num">{fmtUsd(notional)}</dd>
          </div>
          {isBuy ? (
            <div className="flex justify-between">
              <dt className="text-ink-3">{lev > 1 ? `Margin (${lev}×)` : "Cost"}</dt>
              <dd className={`num font-semibold ${overCash ? "down" : ""}`}>{fmtUsd(margin)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-ink-3">Cash available</dt>
            <dd className="num">{fmtUsd(cash)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={disabled}
          className={`h-12 w-full text-[15px] font-extrabold text-white transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${
            isBuy ? "bg-up-fill" : "bg-down-fill"
          }`}
        >
          {noPosition ? `No ${asset.symbol} to sell` : `${type === "Market" ? "" : `${type} · `}${isBuy ? "Buy" : "Sell"} ${q > 0 ? `${fmtQty(Math.min(q, isBuy ? q : held))} ` : ""}${asset.symbol}`}
        </button>

        <p id={`${uid}-status`} role="status" aria-live="polite" className="min-h-[18px] text-[12px]">
          {status ? <span className={status.tone === "error" ? "down" : "text-ink"}>{status.text}</span>
            : overCash ? <span className="down">Margin exceeds your cash. Lower the amount or raise leverage.</span>
              : overHeld ? <span className="text-ink-2">You hold {fmtQty(held)} {asset.symbol}; the sale will be capped there.</span>
                : <span className="text-ink-3">Paper trading. Fills use simulated prices.</span>}
        </p>
      </form>
    </section>
  );
}
