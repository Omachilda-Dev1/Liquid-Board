"use client";
import { useState } from "react";
import {
  ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, ReferenceLine,
} from "recharts";
import { Candle } from "@/lib/mockData";

type Props = {
  symbol: string;
  candles: Candle[];
  currentPrice: number;
};

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];

function subsample(candles: Candle[], tf: string): Candle[] {
  const factors: Record<string, number> = { "1m": 1, "5m": 5, "15m": 15, "1h": 60, "4h": 240, "1d": 1440 };
  const n = factors[tf] ?? 1;
  if (n === 1) return candles;
  const result: Candle[] = [];
  for (let i = 0; i < candles.length; i += n) {
    const slice = candles.slice(i, i + n);
    result.push({
      time: slice[0].time,
      open: slice[0].open,
      high: Math.max(...slice.map((c) => c.high)),
      low: Math.min(...slice.map((c) => c.low)),
      close: slice[slice.length - 1].close,
      volume: slice.reduce((s, c) => s + c.volume, 0),
    });
  }
  return result;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as Candle;
  if (!d) return null;
  const up = d.close >= d.open;
  return (
    <div className="bg-[#2d2210] border border-[#3d2e14] rounded-lg p-3 text-xs space-y-1 shadow-xl">
      <div className="text-[#9a8a6a] mb-1">{d.time}</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span className="text-[#9a8a6a]">O</span><span className="font-mono text-[#ecedf1]">${d.open.toLocaleString()}</span>
        <span className="text-[#9a8a6a]">H</span><span className="font-mono text-[#a8ba41]">${d.high.toLocaleString()}</span>
        <span className="text-[#9a8a6a]">L</span><span className="font-mono text-[#e05a3a]">${d.low.toLocaleString()}</span>
        <span className="text-[#9a8a6a]">C</span><span className={`font-mono font-bold ${up ? "text-[#a8ba41]" : "text-[#e05a3a]"}`}>${d.close.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default function Chart({ symbol, candles, currentPrice }: Props) {
  const [tf, setTf] = useState("1m");
  const data = subsample(candles, tf);
  const prices = data.map((c) => c.close);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.12;
  const isUp = data.length > 1 && data[data.length - 1].close >= data[0].open;

  return (
    <div className="flex flex-col h-full">
      {/* Timeframe selector */}
      <div className="flex items-center gap-1 mb-3">
        {TIMEFRAMES.map((t) => (
          <button
            key={t}
            onClick={() => setTf(t)}
            className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all ${
              tf === t
                ? "bg-[#613910] text-[#a8ba41] border border-[#a8ba41]"
                : "text-[#9a8a6a] hover:text-[#ecedf1] border border-transparent"
            }`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto text-xs text-[#9a8a6a] font-mono">
          {data.length} candles
        </div>
      </div>

      {/* Main chart */}
      <div className="flex-1 min-h-0" style={{ height: "clamp(140px, 35vw, 220px)" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isUp ? "#a8ba41" : "#e05a3a"} stopOpacity={0.25} />
                <stop offset="95%" stopColor={isUp ? "#a8ba41" : "#e05a3a"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#3d2e1460" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: "#9a8a6a", fontSize: 9 }} tickLine={false} axisLine={false} interval={Math.floor(data.length / 6)} />
            <YAxis
              domain={[min - pad, max + pad]}
              tick={{ fill: "#9a8a6a", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(2)}`}
              width={56}
              orientation="right"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={currentPrice} stroke="#a8ba4160" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isUp ? "#a8ba41" : "#e05a3a"}
              strokeWidth={1.5}
              fill={`url(#grad-${symbol})`}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume chart */}
      <div style={{ height: 48 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Bar
              dataKey="volume"
              fill="#613910"
              opacity={0.7}
              isAnimationActive={false}
              radius={[1, 1, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="text-[10px] text-[#9a8a6a] text-right mt-0.5">Volume</div>
    </div>
  );
}
