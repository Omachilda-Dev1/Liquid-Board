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
};

export const ASSETS: Asset[] = [
  { symbol: "BTC",  name: "Bitcoin",   price: 67420,  change24h: 2.4,  volume24h: 38.2e9,  marketCap: 1.32e12, type: "crypto", high24h: 68100, low24h: 65800, circulatingSupply: 19.7e6 },
  { symbol: "ETH",  name: "Ethereum",  price: 3512,   change24h: -1.2, volume24h: 18.6e9,  marketCap: 421e9,   type: "crypto", high24h: 3620,  low24h: 3440,  circulatingSupply: 120e6 },
  { symbol: "SOL",  name: "Solana",    price: 178,    change24h: 5.8,  volume24h: 4.1e9,   marketCap: 79e9,    type: "crypto", high24h: 182,   low24h: 168,   circulatingSupply: 444e6 },
  { symbol: "AVAX", name: "Avalanche", price: 38.4,   change24h: 3.1,  volume24h: 820e6,   marketCap: 15.6e9,  type: "crypto", high24h: 39.8,  low24h: 36.9,  circulatingSupply: 406e6 },
  { symbol: "LINK", name: "Chainlink", price: 14.72,  change24h: -0.8, volume24h: 510e6,   marketCap: 8.6e9,   type: "defi",   high24h: 15.1,  low24h: 14.3,  circulatingSupply: 587e6 },
  { symbol: "UNI",  name: "Uniswap",   price: 9.84,   change24h: 1.9,  volume24h: 290e6,   marketCap: 5.9e9,   type: "defi",   high24h: 10.2,  low24h: 9.5,   circulatingSupply: 600e6 },
  { symbol: "AAPL", name: "Apple",     price: 189.5,  change24h: 0.9,  volume24h: 6.2e9,   marketCap: 2.94e12, type: "stock",  high24h: 191.2, low24h: 188.1 },
  { symbol: "NVDA", name: "NVIDIA",    price: 875.4,  change24h: 3.3,  volume24h: 18.4e9,  marketCap: 2.16e12, type: "stock",  high24h: 882,   low24h: 861 },
  { symbol: "TSLA", name: "Tesla",     price: 172.3,  change24h: -2.1, volume24h: 9.8e9,   marketCap: 548e9,   type: "stock",  high24h: 178.4, low24h: 170.1 },
];

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export function generateCandles(basePrice: number, count = 80): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice * 0.9;
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.012;
    const close = Math.max(open + change, 1);
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    const volume = basePrice * (0.5 + Math.random()) * 1000;
    candles.push({
      time: new Date(now - i * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(0)),
    });
    price = close;
  }
  return candles;
}

export function tickPrice(price: number): number {
  const delta = (Math.random() - 0.495) * price * 0.002;
  return parseFloat((price + delta).toFixed(price > 100 ? 2 : 4));
}

export function formatLargeNum(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toFixed(2)}`;
}

export type OrderBookEntry = { price: number; size: number; total: number };

export function generateOrderBook(midPrice: number): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  let bidTotal = 0, askTotal = 0;
  for (let i = 0; i < 12; i++) {
    const bidPrice = midPrice * (1 - (i + 1) * 0.0008 - Math.random() * 0.0003);
    const askPrice = midPrice * (1 + (i + 1) * 0.0008 + Math.random() * 0.0003);
    const bidSize = parseFloat((Math.random() * 3 + 0.1).toFixed(4));
    const askSize = parseFloat((Math.random() * 3 + 0.1).toFixed(4));
    bidTotal += bidSize;
    askTotal += askSize;
    bids.push({ price: parseFloat(bidPrice.toFixed(2)), size: bidSize, total: parseFloat(bidTotal.toFixed(4)) });
    asks.push({ price: parseFloat(askPrice.toFixed(2)), size: askSize, total: parseFloat(askTotal.toFixed(4)) });
  }
  return { bids, asks };
}
