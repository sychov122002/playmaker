"use client";
import { fmtCoins } from "@/lib/format";
import { claimMission, missionClaimed, missions, useStore, type Mission } from "@/lib/store";

function Row({ m, done, ready }: { m: Mission; done: boolean; ready: boolean }) {
  const pct = Math.min(100, (m.value / m.goal) * 100);
  return (
    <div className="rounded-2xl bg-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0"><div className="font-extrabold">{m.title}</div><div className="text-xs text-muted">{m.hint}</div></div>
        <button disabled={!ready} onClick={() => claimMission(m.id)} className={`h-9 shrink-0 rounded-lg px-4 text-sm font-bold disabled:opacity-100 ${ready ? "bg-accent text-accent-ink" : done ? "bg-win/15 text-win" : "bg-panel2 text-muted"}`}>{done ? "Claimed ✓" : `+${fmtCoins(m.reward)} 🪙`}</button>
      </div>
      <div className="mt-3 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-panel2"><div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} /></div><span className="num text-xs text-muted">{fmtCoins(Math.min(m.value, m.goal))}/{fmtCoins(m.goal)}</span></div>
    </div>
  );
}

export default function Challenges() {
  const st = useStore();
  const ms = missions(st);
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-black">Challenges</h1><p className="text-sm text-muted">Complete tasks by placing bets and collect virtual coins. Daily tasks reset at midnight, weekly on Monday.</p></div>
      {(["daily", "weekly"] as const).map((p) => (
        <section key={p}>
          <h2 className="mb-2 px-1 text-[13px] font-extrabold uppercase tracking-wide text-accent">{p === "daily" ? "Daily" : "Weekly"}</h2>
          <div className="space-y-2.5">{ms.filter((m) => m.period === p).map((m) => <Row key={m.id} m={m} done={missionClaimed(st, m)} ready={m.value >= m.goal && !missionClaimed(st, m)} />)}</div>
        </section>
      ))}
    </div>
  );
}
