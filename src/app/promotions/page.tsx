"use client";
import Link from "next/link";
import { Btn, Card } from "@/components/ui";
import { fmtCoins } from "@/lib/format";
import { bonusReady, cashbackInfo, claimBonus, claimCashback, PROMOS, useStore } from "@/lib/store";
import { useNow } from "@/lib/useNow";

const BOOST: [string, string][] = [["3 selections", "+5%"], ["4 selections", "+10%"], ["5 selections", "+15%"], ["6+ selections", "+25%"]];

export default function Promotions() {
  const st = useStore();
  const now = useNow(30000);
  const cb = cashbackInfo(st, now || 0);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black">Promotions</h1>
      <div className="hero-grad rounded-2xl p-5 sm:p-7">
        <div className="text-xs font-bold uppercase tracking-widest text-accent">Parlay boost</div>
        <h2 className="mt-1 text-xl font-black sm:text-2xl">More legs, bigger win</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">Build a parlay with 3+ selections (each odds 1.20 or higher) and your winnings are boosted automatically.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{BOOST.map(([k, v]) => <div key={k} className="rounded-xl bg-bg/50 p-3"><div className="text-xs text-muted">{k}</div><div className="num text-xl font-black text-accent">{v}</div></div>)}</div>
        <Link href="/" className="mt-4 inline-block rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-accent-ink">Build a parlay</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Weekly cashback 5%">
          <p className="text-sm text-muted">Get 5% of your net losses back each week.</p>
          <div className="num my-3 text-2xl font-black">{fmtCoins(cb.amount)} 🪙</div>
          <Btn disabled={!cb.ready} onClick={claimCashback}>{cb.ready ? "Claim cashback" : "Not available yet"}</Btn>
        </Card>
        <Card title="Daily bonus">
          <p className="text-sm text-muted">1,000 free coins every 24 hours.</p>
          <div className="mt-3"><Btn disabled={!bonusReady(st)} onClick={claimBonus}>{bonusReady(st) ? "Claim +1,000" : "Come back later"}</Btn></div>
        </Card>
      </div>
      <Card title="Promo codes" right={<Link href="/account/wallet" className="text-xs font-bold text-accent">Redeem →</Link>}>
        <div className="grid gap-2 sm:grid-cols-2">{Object.entries(PROMOS).map(([c, [n, t]]) => <div key={c} className="flex items-center justify-between rounded-xl bg-panel2 p-3 text-sm"><div><div className="font-black">{c}</div><div className="text-xs text-muted">{t}</div></div><div className={`num font-extrabold ${st.promos.includes(c) ? "text-muted line-through" : "text-win"}`}>+{fmtCoins(n)}</div></div>)}</div>
      </Card>
      <p className="text-xs text-muted">All bonuses are virtual coins with no cash value.</p>
    </div>
  );
}
