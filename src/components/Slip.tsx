"use client";
import { useState } from "react";
import { clearSlip, MIN_STAKE, placeBet, removeLeg, setMode, useStore } from "@/lib/store";
import { fmtCoins, fmtOdds } from "@/lib/format";

export function Slip({ onDone }: { onDone?: () => void }) {
  const st = useStore();
  const [stakes, setStakes] = useState<number[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const legs = st.slip;
  const singles = st.mode === "single" || legs.length === 1;
  const stake = (i: number) => stakes[singles ? i : 0] ?? 0;
  const setStake = (i: number, v: number) => { const n = [...stakes]; n[singles ? i : 0] = v; setStakes(n); setErr(null); };
  const exprOdds = legs.reduce((p, l) => p * l.odds, 1);
  const total = singles ? legs.reduce((s, _, i) => s + stake(i), 0) : stake(0);
  const win = singles ? legs.reduce((s, l, i) => s + stake(i) * l.odds, 0) : stake(0) * exprOdds;

  const submit = () => {
    const e = placeBet(singles ? legs.map((_, i) => stake(i)) : [stake(0)]);
    if (e) { setErr(e); return; }
    setStakes([]); setOk(true); setTimeout(() => setOk(false), 2500); onDone?.();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <div className="text-[15px] font-extrabold">Bet slip {legs.length > 0 && <span className="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-ink">{legs.length}</span>}</div>
        {legs.length > 0 && <button onClick={clearSlip} className="text-xs text-muted hover:text-ink">Clear</button>}
      </div>
      <div className="mx-4 mb-3 grid grid-cols-2 rounded-xl border border-line bg-bg p-1 text-sm font-bold">
        {(["single", "express"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded-lg py-1.5 ${st.mode === m ? "bg-panel2 text-accent" : "text-muted"}`}>{m === "single" ? "Singles" : "Parlay"}</button>
        ))}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-4">
        {legs.length === 0 && <div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">Pick any odds from the lines and your selection will appear here.</div>}
        {legs.map((l, i) => (
          <div key={l.eventId + l.marketKey} className="pop rounded-xl border border-line bg-panel2 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0"><div className="truncate text-[13px] font-bold">{l.title}</div><div className="truncate text-xs text-muted">{l.market}: <span className="text-ink">{l.label}</span></div></div>
              <div className="flex items-center gap-2"><span className="num font-extrabold text-accent">{fmtOdds(l.odds, st.settings.odds)}</span><button aria-label="Remove" onClick={() => removeLeg(i)} className="text-muted hover:text-lose">✕</button></div>
            </div>
            {singles && <StakeInput v={stake(i)} on={(v) => setStake(i, v)} />}
          </div>
        ))}
        {!singles && legs.length > 1 && <StakeInput v={stake(0)} on={(v) => setStake(0, v)} label="Parlay stake" />}
      </div>
      <div className="space-y-2 border-t border-line p-4">
        {legs.length > 1 && !singles && <Row k="Total odds" v={fmtOdds(exprOdds, st.settings.odds)} />}
        <Row k="Stake" v={`${fmtCoins(total)} 🪙`} />
        <Row k="Potential win" v={`${fmtCoins(win)} 🪙`} strong />
        {err && <div className="text-sm text-lose">{err}</div>}
        {ok && <div className="pop text-sm text-win">Bet placed! Track it in My bets.</div>}
        <button disabled={!legs.length} onClick={submit} className="h-12 w-full rounded-xl bg-accent text-[15px] font-extrabold text-accent-ink transition active:scale-[.98] disabled:opacity-40">Place bet</button>
        <p className="text-center text-[11px] leading-snug text-muted">Virtual coins with no cash value. Outcomes are simulated.</p>
      </div>
    </div>
  );
}
const Row = ({ k, v, strong }: { k: string; v: string; strong?: boolean }) => <div className="flex justify-between text-sm"><span className="text-muted">{k}</span><span className={`num ${strong ? "font-extrabold text-ink" : "font-bold"}`}>{v}</span></div>;
function StakeInput({ v, on, label }: { v: number; on: (n: number) => void; label?: string }) {
  return (
    <div className="mt-2">
      {label && <div className="mb-1 text-xs text-muted">{label}</div>}
      <div className="flex gap-1.5">
        <input inputMode="numeric" placeholder={`min ${MIN_STAKE}`} value={v || ""} onChange={(e) => on(Math.max(0, parseInt(e.target.value.replace(/\D/g, "") || "0", 10)))} className="num h-9 min-w-0 flex-1 rounded-lg border border-line bg-bg px-3 text-sm font-bold outline-none focus:border-accent" />
        {[100, 500, 1000].map((n) => <button key={n} onClick={() => on(n)} className="h-9 rounded-lg border border-line px-2 text-xs font-bold text-muted hover:text-ink">{n}</button>)}
      </div>
    </div>
  );
}
