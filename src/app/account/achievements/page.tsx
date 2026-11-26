"use client";
import { Card } from "@/components/ui";
import { statsOf, tierOf, useStore } from "@/lib/store";

export default function Achievements() {
  const st = useStore(), s = statsOf(st.bets), staked = st.bets.reduce((a, b) => a + b.stake, 0);
  const wonBets = st.bets.filter((b) => b.status === "won" && !b.cashedOut);
  const list: [string, string, string, boolean][] = [
    ["🎯", "First bet", "Place your first bet", st.bets.length >= 1],
    ["🏆", "First win", "Win a bet", wonBets.length >= 1],
    ["🔟", "Regular", "Place 10 bets", st.bets.length >= 10],
    ["🔥", "Hot streak", "Win 3 bets in a row", s.streak >= 3],
    ["🧩", "Parlay master", "Win a parlay with 3+ legs", wonBets.some((b) => b.legs.length >= 3)],
    ["🚀", "Long shot", "Win a bet at odds of 5.00 or more", wonBets.some((b) => b.odds >= 5)],
    ["💸", "Smart exit", "Use cash out once", st.bets.some((b) => b.cashedOut)],
    ["🏷️", "Promo hunter", "Redeem a promo code", st.promos.length >= 1],
    ["🥈", "Silver player", "Reach the Silver tier", tierOf(staked).index >= 1],
    ["🥇", "Gold player", "Reach the Gold tier", tierOf(staked).index >= 2],
    ["🛡️", "Safe player", "Set a betting limit", st.limits.maxStake > 0 || st.limits.dailyLoss > 0],
  ];
  const got = list.filter((x) => x[3]).length;
  return (
    <>
      <div className="flex items-end justify-between"><h1 className="text-2xl font-black">Achievements</h1><span className="num text-sm text-muted">{got} / {list.length}</span></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map(([i, t, d, ok]) => (
          <Card key={t}><div className={`flex items-center gap-3 ${ok ? "" : "opacity-45"}`}><div className={`grid h-12 w-12 place-items-center rounded-xl text-2xl ${ok ? "bg-accent" : "bg-panel2 grayscale"}`}>{i}</div><div><div className="font-extrabold">{t}</div><div className="text-xs text-muted">{d}</div></div>{ok && <span className="ml-auto text-win">✓</span>}</div></Card>
        ))}
      </div>
    </>
  );
}
