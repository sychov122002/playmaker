"use client";
import Link from "next/link";
import { use, useState } from "react";
import { Crest } from "@/components/Crest";
import { OddsBtn } from "@/components/OddsBtn";
import { findEvent } from "@/lib/events";
import { fmtDay, fmtTime } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import { useFeedVersion } from "@/lib/feed";

const GROUPS: [string, (k: string) => boolean][] = [["All", () => true], ["Main", (k) => ["1x2", "ml", "dc", "dist"].includes(k)], ["Totals", (k) => k.startsWith("tot_") || k === "btts"], ["Handicaps", (k) => k.startsWith("hcp_")]];

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  useFeedVersion();
  const now = useNow(30000);
  const [tab, setTab] = useState(0);
  if (!now) return <div className="h-40 animate-pulse rounded-2xl bg-panel" />;
  const ev = findEvent(id, now);
  if (!ev) return <div className="rounded-2xl border border-line bg-panel p-8 text-center">Event not found or already finished. <Link href="/" className="text-accent">Back to lines</Link></div>;
  const [ph, pd, pa] = ev.p, tot = ph + pd + pa, pct = (v: number) => Math.round((v / tot) * 100);
  const shown = ev.markets.filter((m) => GROUPS[tab][1](m.key));
  return (
    <div>
      <Link href="/" className="text-sm text-muted hover:text-ink">← Lines</Link>
      <div className="hero-grad mt-3 rounded-2xl p-5 sm:p-7">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-accent"><span>{ev.league}</span>{ev.virtual && <span className="rounded bg-amber/20 px-2 py-0.5 text-[10px] text-amber">virtual</span>}</div>
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex flex-col items-center gap-2 text-center"><Crest name={ev.home} size={56} /><span className="text-base font-extrabold leading-tight sm:text-lg">{ev.home}</span></div>
          <div className="text-center"><div className="num text-2xl font-black">{fmtTime(ev.start)}</div><div className="text-xs capitalize text-muted">{fmtDay(ev.start)}</div></div>
          <div className="flex flex-col items-center gap-2 text-center"><Crest name={ev.away} size={56} /><span className="text-base font-extrabold leading-tight sm:text-lg">{ev.away}</span></div>
        </div>
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-[11px] font-bold text-muted"><span>{pct(ph)}%</span>{pd > 0 && <span>Draw {pct(pd)}%</span>}<span>{pct(pa)}%</span></div>
          <div className="flex h-2 overflow-hidden rounded-full bg-bg/60"><div className="bg-accent" style={{ width: `${pct(ph)}%` }} />{pd > 0 && <div className="bg-muted/60" style={{ width: `${pct(pd)}%` }} />}<div className="bg-[#6a8dff]" style={{ width: `${pct(pa)}%` }} /></div>
          <div className="mt-1 text-center text-[11px] text-muted">Win probability</div>
        </div>
      </div>
      <div className="scroll-x my-4 flex gap-1.5">{GROUPS.map(([t], i) => <button key={t} onClick={() => setTab(i)} className={`h-9 shrink-0 rounded-full px-4 text-sm font-bold ${tab === i ? "bg-accent text-accent-ink" : "bg-panel text-muted"}`}>{t}</button>)}</div>
      <div className="space-y-3">
        {shown.map((m) => (
          <div key={m.key} className="rounded-2xl bg-panel p-4">
            <div className="mb-3 text-sm font-extrabold">{m.title}</div>
            <div className={`grid gap-2 ${m.outcomes.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>{m.outcomes.map((o) => <OddsBtn key={o.key} ev={ev} mk={m.key} out={o.key} />)}</div>
          </div>
        ))}
        {shown.length === 0 && <div className="rounded-2xl bg-panel p-8 text-center text-muted">No markets in this group.</div>}
      </div>
    </div>
  );
}
