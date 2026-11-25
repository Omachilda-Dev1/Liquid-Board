"use client";
import { SENTIMENT_ZONES, useFearGreed, useGasPrice } from "@/hooks/usePrices";
import { STARTING_BALANCE } from "@/hooks/useAccount";
import { fmtPct, fmtSignedUsd, fmtUsd, signClass } from "@/lib/format";
import SignBand from "./SignBand";

type Props = { cash: number; positionsValue: number; debt: number; onReset?: () => void };

export default function AccountPanel({ cash, positionsValue, debt, onReset }: Props) {
  const gas = useGasPrice();
  const fg = useFearGreed();
  const equity = cash + positionsValue;
  const pnl = equity - STARTING_BALANCE;
  const pnlPct = (pnl / STARTING_BALANCE) * 100;
  const zoneStarts = [0, ...SENTIMENT_ZONES.slice(0, -1).map((z) => z.upTo)];

  return (
    <section aria-label="Account" className="flex flex-col">
      <SignBand label="Account">
        <span>Paper · started at {fmtUsd(STARTING_BALANCE, 0)}</span>
      </SignBand>
      <div className="px-4 py-3">
        <div className="text-[12px] text-ink-3">Equity</div>
        <div className="num text-[22px] font-semibold leading-tight">{fmtUsd(equity)}</div>
        <div className={`num text-[13px] ${signClass(pnl)}`}>{fmtSignedUsd(pnl)} ({fmtPct(pnlPct)}) all time</div>
        <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-rule pt-3 text-[12px]">
          <div><dt className="text-ink-3">Cash</dt><dd className="num text-ink">{fmtUsd(cash)}</dd></div>
          <div><dt className="text-ink-3">In positions</dt><dd className="num text-ink">{fmtUsd(positionsValue)}</dd></div>
          <div><dt className="text-ink-3">Borrowed</dt><dd className="num text-ink">{fmtUsd(debt)}</dd></div>
        </dl>
        {onReset ? (
          <button type="button" onClick={() => { if (window.confirm("Reset the paper account to $50,000 and clear all positions and history?")) onReset(); }}
            className="mt-3 h-9 w-full border border-rule-strong text-[12px] font-semibold text-ink-2 hover:border-ink hover:text-ink">
            Reset paper account
          </button>
        ) : null}
      </div>

      <div className="border-t border-rule px-4 py-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.08em]">Fear &amp; greed</h3>
          <span className="text-[13px]"><span className="num font-semibold">{fg.value}</span> <span className="text-ink-2">{fg.label}</span></span>
        </div>
        <div className="relative mt-3 h-[30px]" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={fg.value} aria-label={`Fear and greed index: ${fg.value}, ${fg.label}`}>
          <div className="absolute inset-x-0 top-[10px] flex h-[6px] gap-[2px]">
            {SENTIMENT_ZONES.map((z, i) => (
              <span key={z.label} className="h-full" style={{
                width: `${z.upTo - zoneStarts[i]}%`,
                background: i < 2 ? "var(--down)" : i === 2 ? "var(--rule-strong)" : "var(--up)",
                opacity: i === 0 || i === 4 ? 1 : 0.55,
              }} />
            ))}
          </div>
          <span className="absolute top-[3px] block h-[20px] w-[20px] -translate-x-1/2 rounded-full border-[4px] border-ink bg-ground transition-[left] duration-700 ease-out"
            style={{ left: `${fg.value}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-ink-3"><span>Fear</span><span>Neutral</span><span>Greed</span></div>
      </div>

      <div className="border-t border-rule px-4 py-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[12px] font-bold uppercase tracking-[0.08em]">ETH gas</h3>
          <span className="text-[12px] text-ink-3">gwei</span>
        </div>
        <dl className="mt-2 grid grid-cols-3 border border-rule">
          {[
            { label: "Slow", value: gas.slow },
            { label: "Standard", value: gas.standard },
            { label: "Fast", value: gas.fast },
          ].map((g, i) => (
            <div key={g.label} className={`px-2.5 py-2 ${i ? "border-l border-rule" : ""}`}>
              <dt className="text-[11px] text-ink-3">{g.label}</dt>
              <dd className="num text-[15px] font-semibold">{g.value.toFixed(1)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
