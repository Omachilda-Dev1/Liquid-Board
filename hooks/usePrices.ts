"use client";
import { useEffect, useRef, useState } from "react";
import { ASSETS, Asset, Candle, TIMEFRAMES, TimeframeId, foldTick, generateDay, seriesFor, tickPrice } from "@/lib/mockData";

export type PriceMap = Record<string, number>;
export type SeriesMap = Record<string, Record<TimeframeId, Candle[]>>;
export type RangeMap = Record<string, { high: number; low: number }>;

const TICK_MS = 1500;

/** One bridged day per asset; every timeframe and the 24h range derive from it. */
function seedSeries(): { series: SeriesMap; ranges: RangeMap } {
  const series: SeriesMap = {};
  const ranges: RangeMap = {};
  ASSETS.forEach((a) => {
    const day = generateDay(a);
    ranges[a.symbol] = { high: Math.max(...day.map((c) => c.high)), low: Math.min(...day.map((c) => c.low)) };
    series[a.symbol] = Object.fromEntries(TIMEFRAMES.map((tf) => [tf.id, seriesFor(a, day, tf.minutes)])) as Record<TimeframeId, Candle[]>;
  });
  return { series, ranges };
}

export function usePrices() {
  const [prices, setPrices] = useState<PriceMap>(() => Object.fromEntries(ASSETS.map((a) => [a.symbol, a.price])));
  const [prevPrices, setPrevPrices] = useState<PriceMap>(() => Object.fromEntries(ASSETS.map((a) => [a.symbol, a.price])));
  const [ranges, setRanges] = useState<RangeMap>(() => Object.fromEntries(ASSETS.map((a) => [a.symbol, { high: a.high24h, low: a.low24h }])));
  // Generated on the client only: random history would mismatch server HTML.
  const [series, setSeries] = useState<SeriesMap | null>(null);
  const [tick, setTick] = useState(0);
  const pricesRef = useRef(prices);
  pricesRef.current = prices;

  useEffect(() => {
    const seeded = seedSeries();
    setSeries(seeded.series);
    setRanges(seeded.ranges);
    const id = setInterval(() => {
      const current = pricesRef.current;
      const next: PriceMap = {};
      ASSETS.forEach((a) => { next[a.symbol] = tickPrice(current[a.symbol]); });
      const now = Date.now();

      setPrevPrices(current);
      setPrices(next);
      setTick((t) => t + 1);
      setRanges((prev) => {
        const out: RangeMap = {};
        ASSETS.forEach((a) => {
          const p = next[a.symbol];
          out[a.symbol] = { high: Math.max(prev[a.symbol].high, p), low: Math.min(prev[a.symbol].low, p) };
        });
        return out;
      });
      setSeries((prev) => {
        if (!prev) return prev;
        const out: SeriesMap = {};
        ASSETS.forEach((a) => {
          const tickVol = (a.volume24h / a.price / 57600) * (0.3 + Math.random());
          const bySym = {} as Record<TimeframeId, Candle[]>;
          TIMEFRAMES.forEach((tf) => {
            bySym[tf.id] = foldTick(prev[a.symbol][tf.id], next[a.symbol], tf.minutes, now, tickVol);
          });
          out[a.symbol] = bySym;
        });
        return out;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return { assets: ASSETS as Asset[], prices, prevPrices, ranges, series, tick };
}

export function useGasPrice() {
  const [gas, setGas] = useState({ slow: 18.4, standard: 24.1, fast: 38.6 });
  useEffect(() => {
    const id = setInterval(() => {
      const base = 15 + Math.random() * 30;
      setGas({
        slow: parseFloat((base * 0.8).toFixed(1)),
        standard: parseFloat(base.toFixed(1)),
        fast: parseFloat((base * 1.6).toFixed(1)),
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);
  return gas;
}

export const SENTIMENT_ZONES = [
  { upTo: 25, label: "Extreme fear" },
  { upTo: 45, label: "Fear" },
  { upTo: 55, label: "Neutral" },
  { upTo: 75, label: "Greed" },
  { upTo: 100, label: "Extreme greed" },
] as const;

export function useFearGreed() {
  const [value, setValue] = useState(62);
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => Math.max(5, Math.min(95, v + (Math.random() - 0.5) * 4)));
    }, 8000);
    return () => clearInterval(id);
  }, []);
  const rounded = Math.round(value);
  const zone = SENTIMENT_ZONES.find((z) => rounded <= z.upTo) ?? SENTIMENT_ZONES[4];
  return { value: rounded, label: zone.label };
}
