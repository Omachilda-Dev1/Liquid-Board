export type OrderType = "Market" | "Limit" | "Stop";
export type Side = "buy" | "sell";

export type Position = {
  symbol: string;
  qty: number;
  avgEntry: number;
  side: "long";
  /** Borrowed USD from leverage; repaid pro rata on every sale. */
  debt: number;
  openedAt: number;
};

export type Trade = {
  id: number;
  side: Side;
  symbol: string;
  qty: number;
  price: number;
  total: number;
  orderType: OrderType | "Liquidation";
  leverage: number;
  time: number;
  /** Realised P&L on sells. */
  realised?: number;
};

export type PendingOrder = {
  id: number;
  side: Side;
  symbol: string;
  qty: number;
  type: Exclude<OrderType, "Market">;
  trigger: number;
  leverage: number;
  createdAt: number;
};

export function calcPnL(pos: Position, currentPrice: number) {
  const raw = (currentPrice - pos.avgEntry) * pos.qty;
  const margin = pos.avgEntry * pos.qty - pos.debt;
  const pct = margin > 0 ? (raw / margin) * 100 : 0;
  return { raw, pct };
}

/** Net value of positions: market value less what was borrowed. */
export function calcPortfolioValue(positions: Record<string, Position>, prices: Record<string, number>): number {
  return Object.values(positions).reduce((sum, pos) => sum + pos.qty * (prices[pos.symbol] ?? pos.avgEntry) - pos.debt, 0);
}

/** Does a resting order trigger at this price? */
export function triggers(order: Pick<PendingOrder, "side" | "type" | "trigger">, price: number): boolean {
  if (order.type === "Limit") return order.side === "buy" ? price <= order.trigger : price >= order.trigger;
  return order.side === "buy" ? price >= order.trigger : price <= order.trigger;
}
