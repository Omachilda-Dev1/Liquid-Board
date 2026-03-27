"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { ASSETS, Asset, tickPrice, generateCandles, Candle } from "@/lib/mockData";

export type PriceMap = Record<string, number>;
export type CandleMap = Record<string, Candle[]>;

export function usePrices() {
  const [prices, setPrices] = useState<PriceMap>(() =>
    Object.fromEntries(ASSETS.map((a) => [a.symbol, a.price]))
  );
  const [prevPrices, setPrevPrices] = useState<PriceMap>(() =>
    Object.fromEntries(ASSETS.map((a) => [a.symbol, a.price]))
  );
  const [candles, setCandles] = useState<CandleMap>(() =>
    Object.fromEntries(ASSETS.map((a) => [a.symbol, generateCandles(a.price)]))
  );
  const [assets] = useState<Asset[]>(ASSETS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pricesRef = useRef(prices);
  pricesRef.current = prices;

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const current = pricesRef.current;
      const next: PriceMap = {};
      ASSETS.forEach((a) => { next[a.symbol] = tickPrice(current[a.symbol]); });

      setPrevPrices({ ...current });
      setPrices(next);

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setCandles((prev) => {
        const updated = { ...prev };
        ASSETS.forEach((a) => {
          const last = prev[a.symbol].at(-1)!;
          const newClose = next[a.symbol];
          const newCandle: Candle = {
            time: timeStr,
            open: last.close,
            high: Math.max(last.close, newClose) * (1 + Math.random() * 0.002),
            low: Math.min(last.close, newClose) * (1 - Math.random() * 0.002),
            close: newClose,
            volume: a.price * (0.3 + Math.random()) * 800,
          };
          updated[a.symbol] = [...prev[a.symbol].slice(-99), newCandle];
        });
        return updated;
      });
    }, 1500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return { assets, prices, prevPrices, candles };
}

export function useGasPrice() {
  const [gas, setGas] = useState({ slow: 18, standard: 24, fast: 38 });
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

export function useFearGreed() {
  const [value, setValue] = useState(62);
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => Math.max(5, Math.min(95, v + (Math.random() - 0.5) * 4)));
    }, 8000);
    return () => clearInterval(id);
  }, []);
  const label = value < 25 ? "Extreme Fear" : value < 45 ? "Fear" : value < 55 ? "Neutral" : value < 75 ? "Greed" : "Extreme Greed";
  const color = value < 25 ? "#e05a3a" : value < 45 ? "#e08a3a" : value < 55 ? "#a8ba41" : value < 75 ? "#a8ba41" : "#6abf41";
  return { value: Math.round(value), label, color };
}
