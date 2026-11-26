"use client";
import { fmtCoins } from "@/lib/format";
import { useStore } from "@/lib/store";

const BADGE = { pending: ["Open", "bg-amber/15 text-amber"], won: ["Won", "bg-win/15 text-win"], lost: ["Lost", "bg-lose/15 text-lose"] } as const;

export default function Bets() {
  const st = useStore();
  const won = st.bets.filter((b) => b.status === "won").reduce((s, b) => s + b.payout - b.stake, 0);
  const lost = st.bets.filter((b) => b.status === "lost").reduce((s, b) => s + b.stake, 0);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">My bets</h1>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {[["Total bets", String(st.bets.length)], ["Won", `+${fmtCoins(won)}`], ["Lost", `−${fmtCoins(lost)}`]].map(([k, v]) => <div key={k} className="rounded-2xl border border-line bg-panel p-3 sm:p-4"><div className="text-xs text-muted">{k}</div><div className="num mt-1 text-lg font-black sm:text-2xl">{v}</div></div>)}
      </div>
      {st.bets.length === 0 && <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No bets yet. Head to the lines or live section.</div>}
      <div className="space-y-3">
        {st.bets.map((b) => (
          <div key={b.id} className="rounded-2xl border border-line bg-panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-extrabold">{b.mode === "express" ? `Parlay · ${b.legs.length} legs` : "Single"}</div>
              <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${BADGE[b.status][1]}`}>{BADGE[b.status][0]}</span>
            </div>
            <div className="space-y-1.5">
              {b.legs.map((l) => { const s = b.legStatus[l.eventId + l.marketKey + l.outKey]; return (
                <div key={l.eventId + l.marketKey} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0"><div className="truncate font-bold">{l.title}</div><div className="truncate text-xs text-muted">{l.market}: {l.label}</div></div>
                  <div className="flex shrink-0 items-center gap-2"><span className="num font-bold text-accent">{l.odds.toFixed(2)}</span><span className={s === "won" ? "text-win" : s === "lost" ? "text-lose" : "text-muted"}>{s === "won" ? "✓" : s === "lost" ? "✕" : "…"}</span></div>
                </div>); })}
            </div>
            <div className="num mt-3 flex justify-between border-t border-line pt-3 text-sm"><span className="text-muted">Stake {fmtCoins(b.stake)} × {b.odds.toFixed(2)}</span><span className="font-extrabold">{b.status === "won" ? `+${fmtCoins(b.payout)}` : b.status === "lost" ? "0" : `up to ${fmtCoins(b.stake * b.odds)}`} 🪙</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
