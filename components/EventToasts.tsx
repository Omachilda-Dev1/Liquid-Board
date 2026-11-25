import type { AccountEvent } from "@/hooks/useAccount";

export default function EventToasts({ events }: { events: AccountEvent[] }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-20 right-3 z-50 flex w-[min(360px,calc(100vw-24px))] flex-col gap-2 md:bottom-4">
      {events.map((e) => (
        <div key={e.id} className="band border border-[#4a4a4a] px-4 pb-3 pt-3 text-[13px]">
          <span className={`mr-2 inline-block h-2 w-2 rounded-full ${e.tone === "ok" ? "bg-[#2fc46c]" : "bg-[#fccc0a]"}`} aria-hidden="true" />
          {e.text}
        </div>
      ))}
    </div>
  );
}
