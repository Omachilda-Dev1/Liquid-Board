import { ASSET_TYPE_LABEL, Asset } from "@/lib/mockData";
import { fmtCompactUsd, fmtPct, fmtPrice, fmtSignedUsd, signClass } from "@/lib/format";
import RouteBullet from "./RouteBullet";

type Props = {
  asset: Asset;
  price: number;
  prevPrice: number;
  open: number;
  high: number;
  low: number;
  tick: number;
};

export default function PairHeader({ asset, price, prevPrice, open, high, low, tick }: Props) {
  const change = price - open;
  const changePct = (change / open) * 100;
  const flash = price > prevPrice ? "tick-up" : price < prevPrice ? "tick-down" : "";

  const stats = [
    { label: "24h high", value: fmtPrice(high) },
    { label: "24h low", value: fmtPrice(low) },
    { label: "24h volume", value: fmtCompactUsd(asset.volume24h) },
    { label: "Market cap", value: fmtCompactUsd(asset.marketCap) },
    asset.circulatingSupply
      ? { label: "Circulating", value: `${(asset.circulatingSupply / 1e6).toFixed(1)}M ${asset.symbol}` }
      : { label: "Type", value: ASSET_TYPE_LABEL[asset.type] },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-rule px-4 py-3 md:px-5">
      <div className="flex items-center gap-3.5">
        <RouteBullet asset={asset} size={44} />
        <div>
          <h1 className="text-[19px] font-extrabold leading-tight tracking-[-0.01em]">
            {asset.name} <span className="font-medium text-ink-3">{asset.symbol} / USD</span>
          </h1>
          <div className="mt-0.5 flex items-baseline gap-3">
            <span key={tick} className={`num -mx-1 px-1 text-[32px] font-semibold leading-none tracking-[-0.03em] md:text-[40px] ${flash}`} aria-live="off">
              {fmtPrice(price)}
            </span>
            <span className={`num text-[14px] font-medium ${signClass(change)}`}>
              {fmtSignedUsd(change).replace("$", "")} ({fmtPct(changePct)})
            </span>
          </div>
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-7 gap-y-2">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-[12px] text-ink-3">{s.label}</dt>
            <dd className="num text-[13px] text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
