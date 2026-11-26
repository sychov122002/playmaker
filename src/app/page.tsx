"use client";
import { useMemo, useState } from "react";
import { colsFor, EventRow, GRID } from "@/components/EventRow";
import { PromoCarousel } from "@/components/PromoCarousel";
import { TopMatches } from "@/components/TopMatches";
import { upcoming } from "@/lib/events";
import { dayKey, fmtDay } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import { SPORTS, type Sport } from "@/lib/types";
import { useStore } from "@/lib/store";

const WHEN = [["all", "All"], ["3h", "Next 3h"], ["today", "Today"], ["tomorrow", "Tomorrow"]] as const;

const TOP = ["Champions League", "Premier League", "La Liga", "Serie A", "Bundesliga"];

export default function Lines() {
  const now = useNow(30000);
  const [sport, setSport] = useState<Sport>("football");
  const [league, setLeague] = useState("");
  const [q, setQ] = useState(""), [when, setWhen] = useState<(typeof WHEN)[number][0]>("all"), [favOnly, setFavOnly] = useState(false);
  const favs = useStore().favs;
  const all = useMemo(() => (now ? upcoming(now) : []), [now]);
  const count = (s: Sport) => all.filter((e) => e.sport === s).length;
  const ofSport = all.filter((e) => e.sport === sport);
  const leagues = [...new Set(ofSport.map((e) => e.league))].map((l) => ({ l, n: ofSport.filter((e) => e.league === l).length }));
  const inWhen = (t: number) => when === "all" || (when === "3h" ? t < now + 3 * 3600e3 : dayKey(t) === dayKey(now + (when === "tomorrow" ? 86400e3 : 0)));
  const list = (favOnly ? all.filter((e) => favs.includes(e.id)) : ofSport).filter((e) => inWhen(e.start) && (favOnly || !league || e.league === league) && (!q || (e.home + e.away + e.league).toLowerCase().includes(q.toLowerCase())));
  const days = new Map<string, typeof list>();
  for (const e of list) days.set(dayKey(e.start), [...(days.get(dayKey(e.start)) ?? []), e]);
  const top = useMemo(() => all.filter((e) => e.sport === "football" && !e.virtual && TOP.includes(e.league)).sort((a, b) => TOP.indexOf(a.league) - TOP.indexOf(b.league) || a.start - b.start).slice(0, 8), [all]);
  const info = SPORTS.find((s) => s.id === sport);

  return (
    <div className="flex gap-5">
      <aside className="hidden w-[232px] shrink-0 lg:block">
        <div className="sticky top-[72px] space-y-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teams or leagues" className="h-10 w-full rounded-xl bg-panel px-3 text-sm outline-none ring-1 ring-line focus:ring-accent" />
          <div className="rounded-2xl bg-panel p-1.5">
            {SPORTS.map((s) => (
              <div key={s.id}>
                <button onClick={() => { setSport(s.id); setLeague(""); }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold ${sport === s.id ? "bg-panel2 text-accent" : "text-ink/85 hover:bg-panel2"}`}>
                  <span className="w-6 text-center text-lg">{s.icon}</span><span className="flex-1 truncate">{s.name}</span><span className="num text-xs text-muted">{now ? count(s.id) : ""}</span>
                </button>
                {sport === s.id && leagues.length > 1 && (
                  <div className="mb-1 ml-5 border-l border-line pl-2">
                    {leagues.map((x) => <button key={x.l} onClick={() => setLeague(league === x.l ? "" : x.l)} className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-[13px] font-semibold ${league === x.l ? "text-accent" : "text-muted hover:text-ink"}`}><span className="truncate">{x.l}</span><span className="num text-[11px]">{x.n}</span></button>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <PromoCarousel />
        <div className="scroll-x -mx-1 mb-3 flex gap-1.5 px-1 lg:hidden">
          {SPORTS.map((s) => (
            <button key={s.id} onClick={() => { setSport(s.id); setLeague(""); }} className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl px-3.5 py-2 text-[11px] font-bold ${sport === s.id ? "bg-accent text-accent-ink" : "bg-panel text-muted"}`}><span className="text-xl leading-none">{s.icon}</span><span className="whitespace-nowrap">{s.name}</span></button>
          ))}
        </div>
        <div className="scroll-x mb-3 flex gap-1.5 lg:hidden">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-8 w-28 shrink-0 rounded-full bg-panel px-3 text-xs outline-none ring-1 ring-line focus:ring-accent" />
          {["", ...leagues.map((x) => x.l)].map((l) => <button key={l} onClick={() => setLeague(l)} className={`h-8 shrink-0 rounded-full px-3 text-xs font-bold ${league === l ? "bg-accent text-accent-ink" : "bg-panel text-muted"}`}>{l || "All"}</button>)}
        </div>

        <div className="scroll-x mb-3 flex gap-1.5">
          <button onClick={() => setFavOnly(!favOnly)} className={`h-8 shrink-0 rounded-full px-3 text-xs font-bold ${favOnly ? "bg-amber text-black" : "bg-panel text-muted"}`}>★ Favorites{favs.length ? ` (${favs.length})` : ""}</button>
          {WHEN.map(([k, t]) => <button key={k} onClick={() => setWhen(k)} className={`h-8 shrink-0 rounded-full px-3 text-xs font-bold ${when === k ? "bg-accent text-accent-ink" : "bg-panel text-muted"}`}>{t}</button>)}
        </div>
        {sport === "football" && !league && !q && !favOnly && when === "all" && <TopMatches events={top} />}
        {info?.virtual && <div className="mb-3 rounded-xl border border-amber/30 bg-amber/10 px-4 py-2.5 text-xs text-amber">Virtual {info.name.toLowerCase()}: fictional players and teams, odds and results are simulated.</div>}
        {!now && <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-panel" />)}</div>}
        {now > 0 && list.length === 0 && <div className="rounded-xl bg-panel p-8 text-center text-muted">{favOnly ? "No favorites yet. Tap ☆ next to a match." : "Nothing found."}</div>}
        <div className="space-y-5">
          {[...days].map(([k, evs]) => (
            <section key={k}>
              <h2 className="mb-2 px-1 text-[13px] font-extrabold capitalize text-accent">{fmtDay(evs[0].start)}</h2>
              <div className="space-y-2.5">
                {[...new Set(evs.map((e) => e.league))].map((lg) => {
                  const rows = evs.filter((e) => e.league === lg), c = colsFor(rows[0]);
                  return (
                    <div key={lg} className="overflow-hidden rounded-2xl bg-panel">
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
      </div>
    </div>
  );
}
