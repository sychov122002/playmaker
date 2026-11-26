"use client";
import Link from "next/link";
import { use } from "react";
import { OddsBtn } from "@/components/OddsBtn";
import { findEvent } from "@/lib/events";
import { fmtDay, fmtTime } from "@/lib/format";
import { useNow } from "@/lib/useNow";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const now = useNow(30000);
  if (!now) return <div className="h-40 animate-pulse rounded-2xl bg-panel" />;
  const ev = findEvent(id, now);
  if (!ev) return <div className="rounded-2xl border border-line bg-panel p-8 text-center">Event not found or already finished. <Link href="/" className="text-accent">Back to lines</Link></div>;
  return (
    <div>
      <Link href="/" className="text-sm text-muted hover:text-ink">← Lines</Link>
      <div className="mt-3 rounded-2xl border border-line bg-gradient-to-r from-panel to-[#2b2410] p-5 sm:p-7">
        <div className="text-xs font-bold uppercase tracking-widest text-accent">{ev.league}</div>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">{ev.home} <span className="text-muted">—</span> {ev.away}</h1>
        <div className="mt-1 text-sm capitalize text-accent">{fmtDay(ev.start)}, {fmtTime(ev.start)}</div>
      </div>
      <div className="mt-4 space-y-3">
        {ev.markets.map((m) => (
          <div key={m.key} className="rounded-2xl border border-line bg-panel p-4">
            <div className="mb-3 text-sm font-extrabold">{m.title}</div>
            <div className={`grid gap-2 ${m.outcomes.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
              {m.outcomes.map((o) => <OddsBtn key={o.key} ev={ev} mk={m.key} out={o.key} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
