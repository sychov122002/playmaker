import Link from "next/link";
import { OddsBtn } from "./OddsBtn";
import { fmtTime } from "@/lib/format";
import type { Ev } from "@/lib/types";

export function EventRow({ ev }: { ev: Ev }) {
  const fb = ev.sport === "football";
  const totKey = ev.markets.find((m) => m.key.startsWith("tot_"))?.key ?? "";
  const line = totKey.split("_")[1];
  return (
    <div className="border-t border-line px-3 py-3 first:border-t-0 sm:px-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Link href={`/event/${ev.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <div className="num w-11 shrink-0 text-sm font-bold text-muted">{fmtTime(ev.start)}</div>
          <div className="min-w-0 text-[15px] font-bold leading-tight">
            <div className="truncate">{ev.home}</div><div className="truncate">{ev.away}</div>
          </div>
        </Link>
        <div className="grid flex-1 grid-cols-[repeat(3,1fr)_auto] items-center gap-1.5 md:max-w-[560px]">
          {fb ? (<><OddsBtn ev={ev} mk="1x2" out="1" short="1" /><OddsBtn ev={ev} mk="1x2" out="X" short="X" /><OddsBtn ev={ev} mk="1x2" out="2" short="2" /></>)
            : (<><OddsBtn ev={ev} mk="ml" out="h" short="1" /><OddsBtn ev={ev} mk={totKey} out="over" short={`O ${line}`} /><OddsBtn ev={ev} mk={totKey} out="under" short={`U ${line}`} /></>)}
          <Link href={`/event/${ev.id}`} className="grid h-[42px] w-12 place-items-center rounded-[10px] border border-line text-xs font-bold text-muted hover:text-accent">+{ev.markets.reduce((n, m) => n + m.outcomes.length, 0) - 3}</Link>
        </div>
      </div>
    </div>
  );
}
