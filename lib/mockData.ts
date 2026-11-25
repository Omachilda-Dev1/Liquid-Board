export type AssetType = "crypto" | "stock" | "defi";

export type Asset = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  type: AssetType;
  high24h: number;
  low24h: number;
  circulatingSupply?: number;
  /** Route colour: the asset's bullet. */
  route: string;
  /** Ink that reads on the route colour. */
  routeInk: string;
};

export const ASSETS: Asset[] = [
  { symbol: "BTC",  name: "Bitcoin",   price: 67420,  change24h: 2.4,  volume24h: 38.2e9, marketCap: 1.32e12, type: "crypto", high24h: 68100, low24h: 65800, circulatingSupply: 19.7e6, route: "#ff6319", routeInk: "#141414" },
  { symbol: "ETH",  name: "Ethereum",  price: 3512,   change24h: -1.2, volume24h: 18.6e9, marketCap: 421e9,   type: "crypto", high24h: 3620,  low24h: 3440,  circulatingSupply: 120e6,  route: "#2a5bd7", routeInk: "#ffffff" },
  { symbol: "SOL",  name: "Solana",    price: 178,    change24h: 5.8,  volume24h: 4.1e9,  marketCap: 79e9,    type: "crypto", high24h: 182,   low24h: 168,   circulatingSupply: 444e6,  route: "#b933ad", routeInk: "#ffffff" },
  { symbol: "AVAX", name: "Avalanche", price: 38.4,   change24h: 3.1,  volume24h: 820e6,  marketCap: 15.6e9,  type: "crypto", high24h: 39.8,  low24h: 36.9,  circulatingSupply: 406e6,  route: "#a7a9ac", routeInk: "#141414" },
  { symbol: "LINK", name: "Chainlink", price: 14.72,  change24h: -0.8, volume24h: 510e6,  marketCap: 8.6e9,   type: "defi",   high24h: 15.1,  low24h: 14.3,  circulatingSupply: 587e6,  route: "#00add0", routeInk: "#141414" },
  { symbol: "UNI",  name: "Uniswap",   price: 9.84,   change24h: 1.9,  volume24h: 290e6,  marketCap: 5.9e9,   type: "defi",   high24h: 10.2,  low24h: 9.5,   circulatingSupply: 600e6,  route: "#e05fae", routeInk: "#141414" },
  { symbol: "AAPL", name: "Apple",     price: 189.5,  change24h: 0.9,  volume24h: 6.2e9,  marketCap: 2.94e12, type: "stock",  high24h: 191.2, low24h: 188.1, route: "#8d8f92", routeInk: "#141414" },
  { symbol: "NVDA", name: "NVIDIA",    price: 875.4,  change24h: 3.3,  volume24h: 18.4e9, marketCap: 2.16e12, type: "stock",  high24h: 882,   low24h: 861,   route: "#996633", routeInk: "#ffffff" },
  { symbol: "TSLA", name: "Tesla",     price: 172.3,  change24h: -2.1, volume24h: 9.8e9,  marketCap: 548e9,   type: "stock",  high24h: 178.4, low24h: 170.1, route: "#fccc0a", routeInk: "#141414" },
];

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  crypto: "Crypto",
  defi: "DeFi",
  stock: "Equity",
};

/** Opening price 24h ago, derived from the seeded change. */
export function open24h(asset: Asset): number {
  return asset.price / (1 + asset.change24h / 100);
}

export type Candle = {
  /** Bucket start, epoch ms. */
  t: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export const TIMEFRAMES = [
  { id: "1m", minutes: 1 },
  { id: "5m", minutes: 5 },
  { id: "15m", minutes: 15 },
  { id: "1h", minutes: 60 },
  { id: "4h", minutes: 240 },
  { id: "1d", minutes: 1440 },
] as const;

export type TimeframeId = (typeof TIMEFRAMES)[number]["id"];

export const CANDLE_COUNT = 120;

function roundTo(price: number) {
  return parseFloat(price.toFixed(price >= 100 ? 2 : 4));
}

/**
 * Synthetic history that ends exactly at `endPrice`, walked backwards so the
 * last close always matches. `endT` is the bucket start of the last candle.
 */
export function generateCandles(endPrice: number, minutes: number, baseVolume: number, count = CANDLE_COUNT, endT?: number): Candle[] {
  const step = minutes * 60_000;
  const nowBucket = endT ?? Math.floor(Date.now() / step) * step;
  const vol = 0.0016 * Math.sqrt(minutes);
  const out: Candle[] = [];
  let close = endPrice;
  for (let i = 0; i < count; i++) {
    const drift = (Math.random() - 0.5) * 2 * vol + vol * 0.06;
    const open = close / (1 + drift);
    const wick = vol * 0.6;
    const high = Math.max(open, close) * (1 + Math.random() * wick);
    const low = Math.min(open, close) * (1 - Math.random() * wick);
    const volume = (baseVolume / 1440) * minutes * (0.4 + Math.random() * 1.2);
    out.push({
      t: nowBucket - i * step,
      open: roundTo(open),
      high: roundTo(high),
      low: roundTo(low),
      close: roundTo(close),
      volume: Math.round(volume),
    });
    close = open;
  }
  return out.reverse();
}

/**
 * The last 24 hours as one-minute candles, bridged from the 24h open to the
 * current price so the chart, the 24h stats and the route all agree.
 */
export function generateDay(asset: Asset, now = Date.now()): Candle[] {
  const n = 1440;
  const open = open24h(asset);
  const sigma = 0.00062;
  // Random walk in log space, then pinned at both ends (Brownian bridge).
  const walk = [0];
  for (let i = 1; i <= n; i++) walk.push(walk[i - 1] + (Math.random() - 0.5) * 2 * sigma * Math.sqrt(3));
  const target = Math.log(asset.price / open);
  const path = walk.map((w, i) => open * Math.exp(w - (i / n) * (walk[n] - target)));
  const lastMinute = Math.floor(now / 60_000) * 60_000;
  const perMinuteVol = asset.volume24h / asset.price / 1440;
  const out: Candle[] = [];
  for (let i = 0; i < n; i++) {
    const o = path[i];
    const c = path[i + 1];
    out.push({
      t: lastMinute - (n - 1 - i) * 60_000,
      open: roundTo(o),
      close: roundTo(c),
      high: roundTo(Math.max(o, c) * (1 + Math.random() * sigma * 0.5)),
      low: roundTo(Math.min(o, c) * (1 - Math.random() * sigma * 0.5)),
      volume: Math.round(perMinuteVol * (0.3 + Math.random() * 1.4)),
    });
  }
  out[n - 1].close = asset.price;
  return out;
}

/** Roll one-minute candles up into a coarser timeframe. */
export function aggregate(base: Candle[], minutes: number): Candle[] {
  if (minutes === 1) return base.slice();
  const step = minutes * 60_000;
  const out: Candle[] = [];
  for (const c of base) {
    const t = Math.floor(c.t / step) * step;
    const last = out[out.length - 1];
    if (last && last.t === t) {
      last.high = Math.max(last.high, c.high);
      last.low = Math.min(last.low, c.low);
      last.close = c.close;
      last.volume += c.volume;
    } else {
      out.push({ ...c, t });
    }
  }
  return out;
}

/** Full series for one timeframe: the bridged day, padded with older history. */
export function seriesFor(asset: Asset, day: Candle[], minutes: number): Candle[] {
  const recent = aggregate(day, minutes);
  if (recent.length >= CANDLE_COUNT) return recent.slice(-CANDLE_COUNT);
  const step = minutes * 60_000;
  const older = generateCandles(recent[0].open, minutes, asset.volume24h / asset.price, CANDLE_COUNT - recent.length, recent[0].t - step);
  return [...older, ...recent];
}

/** Fold a live tick into a candle series, opening a new bucket when time passes. */
export function foldTick(series: Candle[], price: number, minutes: number, now: number, tickVolume: number): Candle[] {
  const step = minutes * 60_000;
  const bucket = Math.floor(now / step) * step;
  const last = series[series.length - 1];
  if (last && last.t === bucket) {
    const next = { ...last, close: price, high: Math.max(last.high, price), low: Math.min(last.low, price), volume: last.volume + tickVolume };
    return [...series.slice(0, -1), next];
  }
  const open = last ? last.close : price;
  const fresh: Candle = { t: bucket, open, high: Math.max(open, price), low: Math.min(open, price), close: price, volume: tickVolume };
  return [...series.slice(-(CANDLE_COUNT - 1)), fresh];
}

export function tickPrice(price: number): number {
  const delta = (Math.random() - 0.495) * price * 0.002;
  return roundTo(price + delta);
}

export type OrderBookEntry = { price: number; size: number; total: number };

export function generateOrderBook(mid: number, rows = 10): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  let bidTotal = 0;
  let askTotal = 0;
  const notional = () => 4_000 + Math.random() ** 2 * 180_000;
  for (let i = 0; i < rows; i++) {
    const bidPrice = mid * (1 - 0.00012 - i * 0.00022 - Math.random() * 0.00008);
    const askPrice = mid * (1 + 0.00012 + i * 0.00022 + Math.random() * 0.00008);
    const bidSize = notional() / bidPrice;
    const askSize = notional() / askPrice;
    bidTotal += bidSize;
    askTotal += askSize;
    bids.push({ price: bidPrice, size: bidSize, total: bidTotal });
    asks.push({ price: askPrice, size: askSize, total: askTotal });
  }
  return { bids, asks };
}
