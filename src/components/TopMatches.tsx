import Link from "next/link";
import { Crest } from "./Crest";
import { OddsBtn } from "./OddsBtn";
import { fmtDay, fmtTime } from "@/lib/format";
import type { Ev } from "@/lib/types";

export function TopMatches({ events }: { events: Ev[] }) {
  if (!events.length) return null;
  return (
    <div className="mb-5">
      <h2 className="mb-2 px-1 text-[13px] font-extrabold uppercase tracking-wide text-muted">🔥 Top matches</h2>
      <div className="scroll-x -mx-3 flex gap-3 px-3 sm:mx-0 sm:px-0">
        {events.map((e) => (
          <div key={e.id} className="w-[290px] shrink-0 rounded-2xl bg-panel p-3.5">
            <div className="mb-3 flex items-center justify-between text-[11px] font-semibold text-muted"><span className="truncate">{e.league}</span><span className="num shrink-0">{fmtDay(e.start).split(",")[0]} {fmtTime(e.start)}</span></div>
            <Link href={`/event/${e.id}`} className="mb-3 flex items-center justify-between gap-2">
              <div className="flex w-[42%] flex-col items-center gap-1.5 text-center"><Crest name={e.home} size={40} /><span className="line-clamp-2 text-[13px] font-bold leading-tight">{e.home}</span></div>
              <span className="text-xs font-bold text-muted">VS</span>
              <div className="flex w-[42%] flex-col items-center gap-1.5 text-center"><Crest name={e.away} size={40} /><span className="line-clamp-2 text-[13px] font-bold leading-tight">{e.away}</span></div>
            </Link>
            <div className="grid grid-cols-3 gap-1.5"><OddsBtn ev={e} mk="1x2" out="1" tag="1" /><OddsBtn ev={e} mk="1x2" out="X" tag="X" /><OddsBtn ev={e} mk="1x2" out="2" tag="2" /></div>
          </div>
        ))}
      </div>
    </div>
  );
}
