"use client";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { fmtPct, fmtSignedUsd, fmtUsd, signClass } from "@/lib/format";

type Props = {
  equity: number;
  cash: number;
  pnl: number;
  pnlPct: number;
  onReset: () => void;
};

function Clock() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setNow(new Date().toLocaleTimeString("en-GB"));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="num tabular-nums">{now ?? "--:--:--"}</span>;
}

export default function TopBar({ equity, cash, pnl, pnlPct, onReset }: Props) {
  const pnlTone = signClass(pnl) === "up" ? "text-[#2fc46c]" : signClass(pnl) === "down" ? "text-[#ff5c50]" : "text-band-ink";
  return (
    <header className="band flex h-[56px] shrink-0 items-center gap-4 px-3 md:gap-8 md:px-4">
      <div className="flex items-center gap-2.5">
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-band-ink text-[12px] font-extrabold tracking-[-0.03em] text-band">LB</span>
        <span className="text-[15px] font-extrabold tracking-[0.04em] md:text-[17px]">LIQUID BOARD</span>
      </div>

      <dl className="hidden items-center gap-7 md:flex">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-band-ink2">Equity</dt>
          <dd className="num text-[15px] font-semibold">{fmtUsd(equity)}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-band-ink2">Total P&amp;L</dt>
          <dd className={`num text-[15px] font-semibold ${pnlTone}`}>
            {fmtSignedUsd(pnl)} <span className="text-[13px]">{fmtPct(pnlPct)}</span>
          </dd>
        </div>
        <div className="hidden lg:block">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-band-ink2">Cash</dt>
          <dd className="num text-[15px] font-semibold">{fmtUsd(cash)}</dd>
        </div>
      </dl>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 text-[12px] text-band-ink2 sm:flex">
          <span className="border border-[#4a4a4a] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-band-ink">Simulated</span>
          <Clock />
        </div>
        <div className="text-right md:hidden">
          <div className="num text-[14px] font-semibold">{fmtUsd(equity)}</div>
          <div className={`num text-[12px] ${pnlTone}`}>{fmtSignedUsd(pnl)}</div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset the paper account to $50,000 and clear all positions and history?")) onReset();
          }}
          className="hidden h-9 border border-[#4a4a4a] px-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-band-ink transition-colors hover:bg-band-ink hover:text-band lg:block"
        >
          Reset account
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
