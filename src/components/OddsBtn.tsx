"use client";
import { toggleLeg, useStore } from "@/lib/store";
import type { Ev } from "@/lib/types";

export function OddsBtn({ ev, mk, out, short }: { ev: Ev; mk: string; out: string; short?: string }) {
  const st = useStore();
  const m = ev.markets.find((x) => x.key === mk);
  const o = m?.outcomes.find((x) => x.key === out);
  if (!m || !o) return <div className="odd opacity-40"><small>—</small></div>;
  if (o.odds > 60) return <div className="odd opacity-40" title="Betting suspended"><small>{short ?? o.label}</small><span>🔒</span></div>;
  const on = st.slip.some((l) => l.eventId === ev.id && l.marketKey === mk && l.outKey === out);
  return (
    <button className="odd num" data-on={on} onClick={() => toggleLeg(ev, mk, out)} aria-pressed={on}>
      <small>{short ?? o.label}</small><span>{o.odds.toFixed(2)}</span>
    </button>
  );
}
