"use client";
import { useMemo, useState } from "react";
import { Crest } from "@/components/Crest";
import { resultsList } from "@/lib/events";
import { dayKey, fmtDay, fmtTime } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import { useFeedVersion } from "@/lib/feed";
import { SPORTS, type Sport } from "@/lib/types";

export default function Results() {
  const now = useNow(60000);
  const [sport, setSport] = useState<Sport | "">("");
  const fv = useFeedVersion();
  const all = useMemo(() => (now ? resultsList(now) : []), [now, fv]); // eslint-disable-line react-hooks/exhaustive-deps
  const list = all.filter((r) => !sport || r.ev.sport === sport);
  const days = new Map<string, typeof list>();
  for (const r of list) days.set(dayKey(r.ev.start), [...(days.get(dayKey(r.ev.start)) ?? []), r]);
  return (
    <div>
      <h1 className="mb-3 text-2xl font-black">Results</h1>
      <div className="scroll-x mb-4 flex gap-1.5">
        {[{ id: "" as const, name: "All", icon: "🌐" }, ...SPORTS].map((s) => <button key={s.id} onClick={() => setSport(s.id as Sport | "")} className={`h-9 shrink-0 rounded-full px-4 text-sm font-bold ${sport === s.id ? "bg-accent text-accent-ink" : "bg-panel text-muted"}`}>{s.icon} {s.name}</button>)}
      </div>
      {!now && <div className="h-32 animate-pulse rounded-2xl bg-panel" />}
      {now > 0 && list.length === 0 && <div className="rounded-2xl bg-panel p-8 text-center text-muted">No finished matches yet.</div>}
      <div className="space-y-5">
        {[...days].map(([k, rs]) => (
          <section key={k}>
            <h2 className="mb-2 px-1 text-[13px] font-extrabold capitalize text-accent">{fmtDay(rs[0].ev.start)}</h2>
            <div className="divide-y divide-line overflow-hidden rounded-2xl bg-panel">
              {rs.map(({ ev, res }) => (
                <div key={ev.id} className="flex items-center gap-3 px-3 py-3 text-sm">
                  <div className="w-12 shrink-0 text-xs text-muted"><div className="num">{fmtTime(ev.start)}</div><div className="truncate">FT</div></div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2"><Crest name={ev.home} size={20} /><span className="truncate font-bold">{ev.home}</span>{ev.virtual && <span className="rounded bg-amber/15 px-1 text-[9px] font-bold uppercase text-amber">virtual</span>}</div>
                    <div className="flex items-center gap-2"><Crest name={ev.away} size={20} /><span className="truncate font-bold">{ev.away}</span></div>
                  </div>
                  <div className="num space-y-1 text-right text-base font-black"><div className={res.h > res.a ? "text-accent" : ""}>{res.h}</div><div className={res.a > res.h ? "text-accent" : ""}>{res.a}</div></div>
                  <div className="hidden w-32 truncate text-right text-xs text-muted sm:block">{ev.league}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
