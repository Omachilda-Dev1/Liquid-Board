"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Candle, TIMEFRAMES, TimeframeId } from "@/lib/mockData";
import { fmtCompactUsd, fmtPct, fmtPrice, priceDecimals } from "@/lib/format";

type Props = {
  series: Record<TimeframeId, Candle[]> | null;
  price: number;
  route: string;
  routeInk: string;
  entry?: number;
};

const AXIS_W = 76;
const TIME_H = 24;
const PAD_TOP = 36;

function niceStep(range: number, target: number) {
  const raw = range / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
}

function timeLabel(t: number, minutes: number) {
  const d = new Date(t);
  if (minutes >= 1440) return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  if (minutes >= 240) return `${d.toLocaleDateString("en-GB", { day: "2-digit" })} ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export default function PriceChart({ series, price, route, routeInk, entry }: Props) {
  const [tf, setTf] = useState<TimeframeId>("15m");
  const [style, setStyle] = useState<"candles" | "line">("candles");
  const [hover, setHover] = useState<number | null>(null);
  const [hoverY, setHoverY] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const minutes = TIMEFRAMES.find((t) => t.id === tf)!.minutes;
  const all = series?.[tf] ?? [];
  const plotW = Math.max(0, size.w - AXIS_W);
  const maxBars = Math.max(20, Math.floor(plotW / 7));
  const data = all.slice(-maxBars);

  const geo = useMemo(() => {
    if (!data.length || size.h === 0) return null;
    const volH = Math.round((size.h - TIME_H - PAD_TOP) * 0.16);
    const priceH = size.h - TIME_H - PAD_TOP - volH - 8;
    let lo = Math.min(...data.map((c) => c.low));
    let hi = Math.max(...data.map((c) => c.high));
    if (entry !== undefined && entry > lo * 0.97 && entry < hi * 1.03) {
      lo = Math.min(lo, entry);
      hi = Math.max(hi, entry);
    }
    const pad = (hi - lo) * 0.08 || hi * 0.001;
    lo -= pad;
    hi += pad;
    const slot = plotW / data.length;
    const body = Math.max(1, Math.min(14, slot * 0.66));
    const y = (p: number) => PAD_TOP + ((hi - p) / (hi - lo)) * priceH;
    const x = (i: number) => i * slot + slot / 2;
    const maxVol = Math.max(...data.map((c) => c.volume));
    const volTop = PAD_TOP + priceH + 8;
    const step = niceStep(hi - lo, Math.max(3, Math.floor(priceH / 56)));
    const ticks: number[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
    return { priceH, volH, volTop, lo, hi, slot, body, y, x, maxVol, ticks };
  }, [data, size.h, plotW, entry]);

  const focus = hover !== null ? data[hover] : data[data.length - 1];
  const decimals = priceDecimals(price);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!geo) return;
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    if (mx > plotW) { setHover(null); setHoverY(null); return; }
    setHover(Math.max(0, Math.min(data.length - 1, Math.floor(mx / geo.slot))));
    setHoverY(my >= PAD_TOP && my <= PAD_TOP + geo.priceH ? my : null);
  }

  const timeTicks = geo
    ? data
        .map((c, i) => ({ c, i }))
        .filter(({ i }) => i % Math.max(1, Math.round(data.length / Math.max(2, Math.floor(plotW / 110)))) === 0)
        .filter(({ i }) => geo.x(i) > 28 && geo.x(i) < plotW - 28)
    : [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-3 md:px-5">
        <div role="tablist" aria-label="Timeframe" className="flex">
          {TIMEFRAMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tf === t.id}
              onClick={() => setTf(t.id)}
              className={`num h-8 min-w-[40px] px-2 text-[13px] font-semibold transition-colors ${
                tf === t.id ? "bg-selected text-selected-ink" : "text-ink-2 hover:bg-ground-3 hover:text-ink"
              }`}
            >
              {t.id}
            </button>
          ))}
        </div>
        <div role="tablist" aria-label="Chart style" className="flex border border-rule-strong">
          {(["candles", "line"] as const).map((s) => (
            <button
              key={s}
              type="button"
              role="tab"
              aria-selected={style === s}
              onClick={() => setStyle(s)}
              className={`h-7 px-3 text-[12px] font-semibold capitalize transition-colors ${
                style === s ? "bg-selected text-selected-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div ref={boxRef} className="relative min-h-[200px] flex-1 select-none">
        {focus ? (
          <div className="pointer-events-none absolute left-4 top-1.5 z-10 flex flex-wrap gap-x-3 text-[12px] md:left-5">
            <span className="text-ink-3">{timeLabel(focus.t, minutes)}</span>
            {(["open", "high", "low", "close"] as const).map((k) => (
              <span key={k}>
                <span className="text-ink-3">{k[0].toUpperCase()}</span>{" "}
                <span className={`num ${focus.close >= focus.open ? "up" : "down"}`}>{fmtPrice(focus[k], decimals)}</span>
              </span>
            ))}
            <span className={`num ${focus.close >= focus.open ? "up" : "down"}`}>{fmtPct(((focus.close - focus.open) / focus.open) * 100)}</span>
            <span><span className="text-ink-3">Vol</span> <span className="num text-ink-2">{fmtCompactUsd(focus.volume * focus.close)}</span></span>
          </div>
        ) : null}

        {!geo ? (
          <div className="absolute inset-0 flex items-center justify-center text-[13px] text-ink-3">Loading price history…</div>
        ) : (
          <svg
            width={size.w}
            height={size.h}
            className="absolute inset-0 block"
            onMouseMove={onMove}
            onMouseLeave={() => { setHover(null); setHoverY(null); }}
            role="img"
            aria-label={`${tf} price chart, last ${fmtPrice(price)}`}
          >
            {geo.ticks.map((v) => (
              <g key={v}>
                <line x1={0} x2={plotW} y1={geo.y(v)} y2={geo.y(v)} stroke="var(--rule)" strokeWidth={1} />
                {Math.abs(geo.y(v) - geo.y(price)) > 16 ? (
                  <text x={plotW + 8} y={geo.y(v) + 4} fontSize={11} fill="var(--ink-3)" className="num">{fmtPrice(v, decimals)}</text>
                ) : null}
              </g>
            ))}
            <line x1={plotW} x2={plotW} y1={0} y2={size.h - TIME_H} stroke="var(--rule)" />
            <line x1={0} x2={size.w} y1={size.h - TIME_H} y2={size.h - TIME_H} stroke="var(--rule)" />
            {timeTicks.map(({ c, i }) => (
              <text key={c.t} x={geo.x(i)} y={size.h - 8} fontSize={11} fill="var(--ink-3)" textAnchor="middle" className="num">
                {timeLabel(c.t, minutes)}
              </text>
            ))}

            {data.map((c, i) => {
              const up = c.close >= c.open;
              const h = (c.volume / geo.maxVol) * geo.volH;
              return (
                <rect key={`v${c.t}`} x={geo.x(i) - geo.body / 2} width={geo.body} y={geo.volTop + geo.volH - h} height={h}
                  fill={up ? "var(--up)" : "var(--down)"} opacity={hover === i ? 0.55 : 0.28} />
              );
            })}

            {style === "candles"
              ? data.map((c, i) => {
                  const up = c.close >= c.open;
                  const color = up ? "var(--up)" : "var(--down)";
                  const top = geo.y(Math.max(c.open, c.close));
                  const bh = Math.max(1, Math.abs(geo.y(c.open) - geo.y(c.close)));
                  return (
                    <g key={c.t}>
                      <line x1={geo.x(i)} x2={geo.x(i)} y1={geo.y(c.high)} y2={geo.y(c.low)} stroke={color} strokeWidth={1} />
                      <rect x={geo.x(i) - geo.body / 2} y={top} width={geo.body} height={bh} fill={color} />
                    </g>
                  );
                })
              : (
                <polyline fill="none" stroke={route} strokeWidth={2.5} strokeLinejoin="round"
                  points={data.map((c, i) => `${geo.x(i)},${geo.y(c.close)}`).join(" ")} />
              )}

            {entry !== undefined && entry >= geo.lo && entry <= geo.hi ? (
              <g>
                <line x1={0} x2={plotW} y1={geo.y(entry)} y2={geo.y(entry)} stroke="var(--ink-2)" strokeDasharray="2 4" />
                <text x={8} y={geo.y(entry) + (geo.y(entry) > geo.y(price) ? 14 : -6)} fontSize={11} fill="var(--ink)" stroke="var(--ground)" strokeWidth={4} paintOrder="stroke" className="num">
                  Your entry {fmtPrice(entry, decimals)}
                </text>
              </g>
            ) : null}

            <line x1={0} x2={plotW} y1={geo.y(price)} y2={geo.y(price)} stroke={route} strokeWidth={1} strokeDasharray="5 4" />
            <rect x={plotW} y={geo.y(price) - 11} width={AXIS_W} height={22} fill={route} />
            <text x={plotW + 6} y={geo.y(price) + 4} fontSize={12} fontWeight={600} fill={routeInk} className="num">{fmtPrice(price, decimals)}</text>

            {hover !== null ? (
              <g pointerEvents="none">
                <line x1={geo.x(hover)} x2={geo.x(hover)} y1={0} y2={size.h - TIME_H} stroke="var(--ink-3)" strokeDasharray="3 3" />
                {hoverY !== null ? (
                  <>
                    <line x1={0} x2={plotW} y1={hoverY} y2={hoverY} stroke="var(--ink-3)" strokeDasharray="3 3" />
                    <rect x={plotW} y={hoverY - 10} width={AXIS_W} height={20} fill="var(--ink)" />
                    <text x={plotW + 6} y={hoverY + 4} fontSize={11} fill="var(--ground)" className="num">
                      {fmtPrice(geo.hi - ((hoverY - PAD_TOP) / geo.priceH) * (geo.hi - geo.lo), decimals)}
                    </text>
                  </>
                ) : null}
              </g>
            ) : null}
          </svg>
        )}
      </div>
    </div>
  );
}
