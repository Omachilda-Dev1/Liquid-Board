/** Decimal places a price is quoted at. */
export function priceDecimals(price: number): number {
  if (price >= 100) return 2;
  if (price >= 1) return 3;
  return 4;
}

export function fmtPrice(price: number, decimals = priceDecimals(price)): string {
  return price.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtUsd(value: number, decimals = 2): string {
  const sign = value < 0 ? "−" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function fmtSignedUsd(value: number): string {
  if (Math.abs(value) < 0.005) return "$0.00";
  return `${value > 0 ? "+" : "−"}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtPct(value: number, decimals = 2): string {
  if (Math.abs(value) < 0.005) return `0.${"0".repeat(decimals)}%`;
  return `${value > 0 ? "+" : "−"}${Math.abs(value).toFixed(decimals)}%`;
}

export function fmtCompactUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function fmtQty(qty: number): string {
  if (qty >= 1000) return qty.toLocaleString("en-US", { maximumFractionDigits: 1 });
  if (qty >= 1) return qty.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return qty.toFixed(4);
}

export function fmtTime(ms: number, withSeconds = false): string {
  return new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", ...(withSeconds ? { second: "2-digit" } : {}) });
}

export function signClass(value: number): "up" | "down" | "flat" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}
