"use client";
import { useMemo, useState } from "react";
import { colsFor, EventRow, GRID } from "@/components/EventRow";
import { upcoming } from "@/lib/events";
import { dayKey, fmtDay } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import { SPORTS, type Sport } from "@/lib/types";

export default function Lines() {
  const now = useNow(30000);
  const [sport, setSport] = useState<Sport>("football");
  const [league, setLeague] = useState("");
  const [q, setQ] = useState("");
  const all = useMemo(() => (now ? upcoming(now) : []), [now]);
  const count = (s: Sport) => all.filter((e) => e.sport === s).length;
  const ofSport = all.filter((e) => e.sport === sport);
  const leagues = [...new Map(ofSport.map((e) => [e.league, 0])).keys()].map((l) => ({ l, n: ofSport.filter((e) => e.league === l).length }));
  const list = ofSport.filter((e) => (!league || e.league === league) && (!q || (e.home + e.away + e.league).toLowerCase().includes(q.toLowerCase())));
  const days = new Map<string, typeof list>();
  for (const e of list) days.set(dayKey(e.start), [...(days.get(dayKey(e.start)) ?? []), e]);
  const sample = list[0];
  const cols = sample ? colsFor(sample) : [];
  const isVirtual = SPORTS.find((s) => s.id === sport)?.virtual;

  return (
    <div>
      <div className="scroll-x -mx-1 mb-4 flex gap-1.5 px-1">
        {SPORTS.map((s) => (
          <button key={s.id} onClick={() => { setSport(s.id); setLeague(""); }} className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs font-bold ${sport === s.id ? "bg-accent text-accent-ink" : "bg-panel text-muted hover:text-ink"}`}>
            <span className="text-xl leading-none">{s.icon}</span><span className="whitespace-nowrap">{s.name}</span><span className={`num text-[10px] ${sport === s.id ? "text-accent-ink/70" : "text-muted"}`}>{now ? count(s.id) : "…"}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <aside className="hidden w-[220px] shrink-0 lg:block">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teams" className="mb-3 h-10 w-full rounded-lg bg-panel px-3 text-sm outline-none ring-1 ring-line focus:ring-accent" />
          <div className="rounded-xl bg-panel p-1.5">
            <div className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted">Tournaments</div>
            {[{ l: "", n: ofSport.length }, ...leagues].map((x) => (
              <button key={x.l} onClick={() => setLeague(x.l)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] font-semibold ${league === x.l ? "bg-panel2 text-accent" : "text-ink/80 hover:bg-panel2"}`}>
                <span className="truncate">{x.l || "All events"}</span><span className="num text-xs text-muted">{x.n}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="scroll-x mb-3 flex gap-1.5 lg:hidden">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-8 w-28 shrink-0 rounded-full bg-panel px-3 text-xs outline-none ring-1 ring-line focus:ring-accent" />
            {["", ...leagues.map((x) => x.l)].map((l) => <button key={l} onClick={() => setLeague(l)} className={`h-8 shrink-0 rounded-full px-3 text-xs font-bold ${league === l ? "bg-accent text-accent-ink" : "bg-panel text-muted"}`}>{l || "All"}</button>)}
          </div>
          {isVirtual && <div className="mb-3 rounded-xl border border-amber/30 bg-amber/10 px-4 py-2.5 text-xs text-amber">Virtual {SPORTS.find((s) => s.id === sport)?.name.toLowerCase()}: fictional players and teams, odds and results are simulated.</div>}
          {!now && <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-panel" />)}</div>}
          {now > 0 && list.length === 0 && <div className="rounded-xl bg-panel p-8 text-center text-muted">Nothing found.</div>}
          <div className="space-y-5">
            {[...days].map(([k, evs]) => (
              <section key={k}>
                <h2 className="mb-2 px-1 text-[13px] font-extrabold capitalize text-accent">{fmtDay(evs[0].start)}</h2>
                <div className="space-y-2.5">
                  {[...new Set(evs.map((e) => e.league))].map((lg) => {
                    const rows = evs.filter((e) => e.league === lg), c = colsFor(rows[0]);
                    return (
                      <div key={lg} className="overflow-hidden rounded-xl bg-panel">
                        <div className="hidden items-center gap-1.5 border-b border-line bg-panel2/70 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-muted md:grid" style={GRID(c.length)}>
                          <span className="text-[13px] normal-case tracking-normal text-ink">{lg}</span>
                          {c.map((x) => <span key={x.head} className="text-center">{x.head}</span>)}<span />
                        </div>
                        <div className="border-b border-line bg-panel2/70 px-3 py-2 text-[13px] font-extrabold md:hidden">{lg}</div>
                        {rows.map((e) => <EventRow key={e.id} ev={e} />)}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          {sample && cols.length === 0 && null}
        </div>
      </div>
    </div>
  );
}
