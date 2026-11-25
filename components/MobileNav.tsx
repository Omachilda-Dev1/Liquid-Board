import { ArrowLeftRight, CandlestickChart, List, Wallet } from "lucide-react";

export type MobileTab = "markets" | "chart" | "trade" | "portfolio";

const ITEMS = [
  { id: "markets", label: "Markets", Icon: List },
  { id: "chart", label: "Chart", Icon: CandlestickChart },
  { id: "trade", label: "Trade", Icon: ArrowLeftRight },
  { id: "portfolio", label: "Portfolio", Icon: Wallet },
] as const;

type Props = { active: MobileTab; onChange: (t: MobileTab) => void; badge: number; include?: MobileTab[] };

export default function MobileNav({ active, onChange, badge, include }: Props) {
  const items = include ? ITEMS.filter((i) => include.includes(i.id)) : ITEMS;
  return (
    <nav aria-label="Sections" className="band shrink-0 pb-[env(safe-area-inset-bottom)]">
      <ul className="flex">
        {items.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={on ? "page" : undefined}
                className={`relative flex h-[56px] w-full flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${on ? "text-band-ink" : "text-band-ink2"}`}
              >
                <Icon size={20} strokeWidth={on ? 2.4 : 1.8} aria-hidden="true" />
                {label}
                {id === "portfolio" && badge > 0 ? (
                  <span className="num absolute right-[calc(50%-22px)] top-2 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-band-ink px-1 text-[10px] font-bold text-band">{badge}</span>
                ) : null}
                {on ? <span className="absolute inset-x-6 top-[5px] h-[3px] bg-band-ink" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
