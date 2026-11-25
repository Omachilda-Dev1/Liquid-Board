"use client";
import { useEffect, useRef, useState } from "react";
import { Asset } from "@/lib/mockData";
import { fmtPct, fmtPrice } from "@/lib/format";

type Props = {
  asset: Asset;
  price: number;
  open: number;
  high: number;
  low: number;
  entry?: number;
};

type Stop = { key: string; label: string; value: number; entry?: boolean };
type Station = { p: number; stops: Stop[] };

/** Stations closer than this many pixels become one interchange. */
const MERGE_PX = 84;

/**
 * The 24h route: the day's range drawn as a line with stations, and the live
 * price riding it as the train.
 */
export default function RouteStrip({ asset, price, open, high, low, entry }: Props) {
  const lineRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const mergePct = width ? (MERGE_PX / width) * 100 : 8;
  const span = high - low || 1;
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - low) / span) * 100));
  const stops: Stop[] = [
    { key: "low", label: "24h low", value: low },
    { key: "open", label: "Open", value: open },
    ...(entry !== undefined ? [{ key: "entry", label: "Your entry", value: entry, entry: true }] : []),
    { key: "high", label: "24h high", value: high },
  ].sort((a, b) => a.value - b.value);

  const stations = stops.reduce<Station[]>((acc, s) => {
    const p = pos(s.value);
    const last = acc[acc.length - 1];
    if (last && p - last.p < mergePct) last.stops.push(s);
    else acc.push({ p, stops: [s] });
    return acc;
  }, []);

  const nowPct = pos(price);
  const fromLow = ((price - low) / low) * 100;
  const toHigh = ((high - price) / price) * 100;

  return (
    <section aria-label="24 hour route" className="border-t border-rule px-4 pb-4 pt-3 md:px-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[12px]">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.08em]">24h route</h2>
        <p className="text-ink-3">
          Now <span className="num font-semibold text-ink">{fmtPrice(price)}</span> ·{" "}
          <span className="num text-ink-2">{fmtPct(fromLow)}</span> above low ·{" "}
          <span className="num text-ink-2">{fmtPct(toHigh).replace("+", "")}</span> to high
        </p>
      </div>

      <div ref={lineRef} className="relative mx-3 mt-1 h-[104px]">
        <div className="absolute left-0 right-0 top-[30px] h-[8px] rounded-full" style={{ background: asset.route }} />
        <div className="absolute left-0 top-[30px] h-[8px] rounded-full bg-ink opacity-25" style={{ width: `${nowPct}%` }} />

        {stations.map((st) => {
          const align = st.p > 85 ? "right-[-10px] text-right" : st.p < 15 ? "left-[-10px]" : "-translate-x-1/2 text-center";
          const interchange = st.stops.length > 1;
          const hasEntry = st.stops.some((s) => s.entry);
          const first = st.stops[0];
          return (
            <div key={st.stops.map((s) => s.key).join("-")} className="absolute top-0" style={{ left: `${st.p}%` }}>
              {Math.abs(st.p - nowPct) * (width / 100) > 64 ? (
                <span className={`num absolute top-[6px] whitespace-nowrap text-[12px] text-ink-2 ${align}`}>{fmtPrice(first.value)}</span>
              ) : null}
              <span
                aria-hidden="true"
                className={`absolute top-[25px] block h-[18px] -translate-x-1/2 rounded-full border-[4px] border-ink ${hasEntry && !interchange ? "bg-ink" : "bg-ground"}`}
                style={{ width: interchange ? 18 + (st.stops.length - 1) * 14 : 18 }}
              />
              <span className={`absolute top-[50px] whitespace-nowrap text-[12px] leading-[16px] ${align}`}>
                {st.stops.map((s, i) => (
                  <span key={s.key} className={`block ${s.entry ? "font-semibold text-ink" : "font-semibold text-ink-2"}`}>
                    {s.label}
                    {i > 0 ? <span className="num ml-1.5 font-normal text-ink-3">{fmtPrice(s.value)}</span> : null}
                  </span>
                ))}
              </span>
            </div>
          );
        })}

        {/* the train */}
        <div
          className="absolute top-[18px] z-10 transition-[left] duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ left: `${nowPct}%` }}
          role="img"
          aria-label={`Now ${fmtPrice(price)}`}
        >
          <span
            className="flex h-[32px] w-[32px] -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-ink text-[9px] font-extrabold uppercase tracking-[-0.02em]"
            style={{ background: asset.route, color: asset.routeInk }}
          >
            Now
          </span>
        </div>
      </div>
    </section>
  );
}
