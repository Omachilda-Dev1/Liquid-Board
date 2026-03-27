export type Position = {
  symbol: string;
  qty: number;
  avgEntry: number;
  side: "long" | "short";
};

export type WalletState = {
  usdBalance: number;
  positions: Record<string, Position>;
  totalDeposited: number;
};

export function calcPnL(pos: Position, currentPrice: number) {
  const raw = pos.side === "long"
    ? (currentPrice - pos.avgEntry) * pos.qty
    : (pos.avgEntry - currentPrice) * pos.qty;
  const pct = pos.side === "long"
    ? ((currentPrice - pos.avgEntry) / pos.avgEntry) * 100
    : ((pos.avgEntry - currentPrice) / pos.avgEntry) * 100;
  return { raw: parseFloat(raw.toFixed(2)), pct: parseFloat(pct.toFixed(2)) };
}

export function calcPortfolioValue(positions: Record<string, Position>, prices: Record<string, number>): number {
  return Object.values(positions).reduce((sum, pos) => {
    const price = prices[pos.symbol] ?? pos.avgEntry;
    return sum + pos.qty * price;
  }, 0);
}
