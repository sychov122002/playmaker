"use client";
import Link from "next/link";
import { Card, Chart, Stat } from "@/components/ui";
import { fmtCoins } from "@/lib/format";
import { statsOf, tierOf, useStore } from "@/lib/store";

export default function Overview() {
  const st = useStore(), s = statsOf(st.bets), staked = st.bets.reduce((a, b) => a + b.stake, 0), t = tierOf(staked);
  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-panel2 text-4xl">{st.profile.avatar}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><h1 className="truncate text-xl font-black">{st.profile.nick}</h1><span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-extrabold text-accent-ink">{t.name}</span></div>
            <div className="text-xs text-muted">ID {st.profile.id} · {st.profile.createdAt ? `member since ${new Date(st.profile.createdAt).toLocaleDateString("en-GB")}` : ""}</div>
          </div>
          <div className="text-right"><div className="text-xs text-muted">Balance</div><div className="num text-2xl font-black">{fmtCoins(st.balance)} <span className="text-amber">🪙</span></div></div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted"><span>{t.name}</span><span>{t.next ? `${fmtCoins(t.need)} coins staked to ${t.next}` : "Top tier reached"}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-panel2"><div className="h-full rounded-full bg-accent" style={{ width: `${Math.round(t.progress * 100)}%` }} /></div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
          <Link href="/account/wallet" className="rounded-lg bg-accent px-4 py-2 text-accent-ink">Get bonus</Link>
          <Link href="/account/bets" className="rounded-lg bg-panel2 px-4 py-2">My bets</Link>
          <Link href="/account/limits" className="rounded-lg bg-panel2 px-4 py-2">Set limits</Link>
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat k="Total bets" v={String(s.total)} /><Stat k="Win rate" v={`${s.winRate.toFixed(0)}%`} />
        <Stat k="Profit" v={`${s.profit >= 0 ? "+" : ""}${fmtCoins(s.profit)}`} tone={s.profit > 0 ? "win" : s.profit < 0 ? "lose" : undefined} /><Stat k="ROI" v={`${s.roi.toFixed(1)}%`} />
        <Stat k="Total staked" v={fmtCoins(s.staked)} /><Stat k="Best win" v={`+${fmtCoins(s.best)}`} /><Stat k="Best streak" v={String(s.streak)} /><Stat k="Avg. odds" v={s.avgOdds.toFixed(2)} />
      </div>
      <Card title="Profit over time"><Chart data={s.series} /></Card>
    </>
  );
}
