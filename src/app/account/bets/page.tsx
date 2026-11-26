"use client";
import { useState } from "react";
import { Btn, Card } from "@/components/ui";
import { fmtCoins, fmtOdds } from "@/lib/format";
import { cashOut, cashoutValue, statsOf, useStore } from "@/lib/store";
import { useNow } from "@/lib/useNow";

const BADGE = { pending: ["Open", "bg-amber/15 text-amber"], won: ["Won", "bg-win/15 text-win"], lost: ["Lost", "bg-lose/15 text-lose"] } as const;
const FILTERS = [["all", "All"], ["pending", "Open"], ["won", "Won"], ["lost", "Lost"]] as const;

export default function Bets() {
  const st = useStore(), now = useNow(2000);
  const [f, setF] = useState<(typeof FILTERS)[number][0]>("all");
  const [msg, setMsg] = useState("");
  const s = statsOf(st.bets), list = st.bets.filter((b) => f === "all" || b.status === f);
  return (
    <>
      <h1 className="text-2xl font-black">My bets</h1>
      <div className="grid grid-cols-3 gap-2">
        {[["Bets", String(s.total)], ["Profit", `${s.profit >= 0 ? "+" : ""}${fmtCoins(s.profit)}`], ["Open", String(st.bets.filter((b) => b.status === "pending").length)]].map(([k, v]) => <div key={k} className="rounded-xl bg-panel p-3"><div className="text-xs text-muted">{k}</div><div className="num mt-1 text-lg font-black">{v}</div></div>)}
      </div>
      <div className="flex gap-1.5">{FILTERS.map(([id, t]) => <button key={id} onClick={() => setF(id)} className={`h-9 rounded-full px-4 text-sm font-bold ${f === id ? "bg-accent text-accent-ink" : "bg-panel text-muted"}`}>{t}</button>)}</div>
      {msg && <div className="rounded-xl bg-panel p-3 text-sm text-amber">{msg}</div>}
      {list.length === 0 && <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No bets here yet.</div>}
      <div className="space-y-3">
        {list.map((b) => {
          const co = now ? cashoutValue(b, now) : null;
          return (
            <Card key={b.id}>
              <div className="mb-2 flex items-center justify-between">
                <div><div className="text-sm font-extrabold">{b.mode === "express" ? `Parlay · ${b.legs.length} legs` : "Single"}</div><div className="text-xs text-muted">{new Date(b.at).toLocaleString("en-GB")}</div></div>
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${BADGE[b.status][1]}`}>{b.cashedOut ? "Cashed out" : BADGE[b.status][0]}</span>
              </div>
              <div className="space-y-2">
                {b.legs.map((l) => { const x = b.legStatus[l.eventId + l.marketKey + l.outKey]; return (
                  <div key={l.eventId + l.marketKey} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0"><div className="truncate font-bold">{l.title}</div><div className="truncate text-xs text-muted">{l.market}: {l.label}</div></div>
                    <div className="flex shrink-0 items-center gap-2"><span className="num font-bold text-accent">{fmtOdds(l.odds, st.settings.odds)}</span><span className={x === "won" ? "text-win" : x === "lost" ? "text-lose" : "text-muted"}>{x === "won" ? "✓" : x === "lost" ? "✕" : "…"}</span></div>
                  </div>); })}
              </div>
              <div className="num mt-3 flex items-center justify-between gap-3 border-t border-line pt-3 text-sm">
                <span className="text-muted">Stake {fmtCoins(b.stake)} × {fmtOdds(b.odds, st.settings.odds)}</span>
                <span className="font-extrabold">{b.status === "pending" ? `to win ${fmtCoins(b.stake * b.odds)}` : b.status === "won" ? `+${fmtCoins(b.payout)}` : b.cashedOut ? fmtCoins(b.payout) : "0"} 🪙</span>
              </div>
              {b.status === "pending" && <div className="mt-3"><Btn kind="ghost" disabled={co === null} onClick={() => setMsg(cashOut(b.id) ?? "Bet cashed out")}>{co === null ? "Cash out unavailable" : `Cash out ${fmtCoins(co)} 🪙`}</Btn></div>}
            </Card>
          );
        })}
      </div>
    </>
  );
}
