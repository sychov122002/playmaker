"use client";
import { useMemo, useState } from "react";
import { EventRow } from "@/components/EventRow";
import { upcoming } from "@/lib/events";
import { dayKey, fmtDay } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import { SPORTS, type Sport } from "@/lib/types";

export default function Line() {
  const now = useNow(30000);
  const [sport, setSport] = useState<Sport>("football");
  const [league, setLeague] = useState("");
  const [q, setQ] = useState("");
  const all = useMemo(() => (now ? upcoming(now) : []), [now]);
  const ofSport = all.filter((e) => e.sport === sport);
  const leagues = [...new Set(ofSport.map((e) => e.league))];
  const list = ofSport.filter((e) => (!league || e.league === league) && (!q || (e.home + e.away + e.league).toLowerCase().includes(q.toLowerCase())));
  const groups = new Map<string, typeof list>();
  for (const e of list) { const k = dayKey(e.start); groups.set(k, [...(groups.get(k) ?? []), e]); }

  return (
    <div>
      <div className="mb-4 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-[#4a3cff] via-[#6a4cff] to-[#ff2e7a] text-white p-5 sm:p-7">
        <div className="text-xs font-bold uppercase tracking-widest text-white/80">Real fixtures · virtual coins</div>
        <h1 className="mt-1 text-2xl font-black leading-tight sm:text-4xl">Upcoming matches</h1>
        <p className="mt-2 max-w-xl text-sm text-white/80">Premier League, La Liga, Serie A, Bundesliga, Champions League, NBA and NHL. Singles and parlays, live betting around the clock. You start with 10,000 coins.</p>
      </div>

      <div className="scroll-x mb-3 flex gap-2">
        {SPORTS.map((s) => (
          <button key={s.id} onClick={() => { setSport(s.id); setLeague(""); }} className={`flex h-10 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm font-bold ${sport === s.id ? "border-accent bg-accent text-accent-ink" : "border-line bg-panel text-muted hover:text-ink"}`}><span>{s.icon}</span>{s.name}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teams" className="ml-auto h-10 min-w-[140px] flex-1 rounded-xl border border-line bg-panel px-3 text-sm outline-none focus:border-accent sm:max-w-[240px] sm:flex-none" />
      </div>
      <div className="scroll-x mb-4 flex gap-1.5">
        {["", ...leagues].map((l) => <button key={l} onClick={() => setLeague(l)} className={`h-8 shrink-0 rounded-full border px-3 text-xs font-bold ${league === l ? "border-ink/40 bg-panel2 text-ink" : "border-line text-muted hover:text-ink"}`}>{l || "All leagues"}</button>)}
      </div>

      {!now && <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-panel" />)}</div>}
      {now > 0 && list.length === 0 && <div className="rounded-2xl border border-line bg-panel p-8 text-center text-muted">Nothing found.</div>}
      <div className="space-y-5">
        {[...groups].map(([k, evs]) => (
          <section key={k}>
            <h2 className="mb-2 px-1 text-sm font-extrabold capitalize text-muted">{fmtDay(evs[0].start)}</h2>
            <div className="space-y-3">
              {[...new Set(evs.map((e) => e.league))].map((lg) => (
                <div key={lg} className="overflow-hidden rounded-2xl border border-line bg-panel">
                  <div className="flex items-center justify-between border-b border-line bg-panel2/60 px-4 py-2 text-[13px] font-extrabold"><span>{lg}</span>{evs.find((e) => e.league === lg)?.virtual && <span className="rounded bg-amber/15 px-2 py-0.5 text-[10px] text-amber">virtual round</span>}</div>
                  {evs.filter((e) => e.league === lg).map((e) => <EventRow key={e.id} ev={e} />)}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
