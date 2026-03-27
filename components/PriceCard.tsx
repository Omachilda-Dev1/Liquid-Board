"use client";
import { Asset, formatLargeNum } from "@/lib/mockData";

type Props = {
  asset: Asset;
  price: number;
  prevPrice: number;
  selected: boolean;
  onClick: () => void;
};

const TYPE_STYLE: Record<string, string> = {
  crypto: "bg-[#a8ba4120] text-[#a8ba41] border border-[#a8ba4140]",
  defi:   "bg-[#61391020] text-[#c8921a] border border-[#61391040]",
  stock:  "bg-[#ecedf120] text-[#ecedf1] border border-[#ecedf130]",
};

export default function PriceCard({ asset, price, prevPrice, selected, onClick }: Props) {
  const up = price >= prevPrice;
  const priceColor = up ? "text-[#a8ba41]" : "text-[#e05a3a]";
  const changeColor = asset.change24h >= 0 ? "text-[#a8ba41]" : "text-[#e05a3a]";
  const flashClass = price !== prevPrice ? (up ? "flash-up" : "flash-down") : "";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${flashClass} ${
        selected
          ? "border-[#a8ba41] bg-[#a8ba4110] glow-olive"
          : "border-[#3d2e14] bg-[#231a0a] hover:border-[#613910] hover:bg-[#2d2210]"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#ecedf1] text-sm">{asset.symbol}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TYPE_STYLE[asset.type]}`}>
            {asset.type}
          </span>
        </div>
        <span className={`text-xs font-semibold ${changeColor}`}>
          {asset.change24h >= 0 ? "+" : ""}{asset.change24h}%
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className={`text-base font-mono font-bold ${priceColor}`}>
          ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: price < 1 ? 4 : 2 })}
        </span>
        <span className="text-[10px] text-[#9a8a6a]">
          Vol {formatLargeNum(asset.volume24h)}
        </span>
      </div>
    </button>
  );
}
