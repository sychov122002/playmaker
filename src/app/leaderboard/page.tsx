"use client";
import { useMemo, useState } from "react";
import { fmtCoins } from "@/lib/format";
import { mulberry32 } from "@/lib/rng";
import { statsOf, tierOf, useStore } from "@/lib/store";

const NAMES = ["LuckyFox", "NightOwl", "GoalHunter", "AceKing", "SharpEdge", "BlueWolf", "ParlayPro", "ZeroDraw", "IceBreaker", "TopSpin", "RedLine", "Striker9", "CourtVision", "PuckMaster", "HatTrick", "Comet", "Falcon7", "Maverick", "Gridiron", "StormRider", "OddsWizard", "Nova", "Raptor", "ClutchTime", "LongShot"];
const PERIODS = [["week", "This week", 1], ["month", "This month", 4], ["all", "All time", 12]] as const;

export default function Leaderboard() {
  const st = useStore();
  const [period, setPeriod] = useState<(typeof PERIODS)[number][0]>("week");
  const mult = PERIODS.find((p) => p[0] === period)![2];
  const me = statsOf(st.bets).profit;
  const rows = useMemo(() => {
    const seed = new Date().toISOString().slice(0, 10);
    return NAMES.map((n, i) => { const r = mulberry32([...(n + seed + period)].reduce((a, c) => a + c.charCodeAt(0) * 31, i))(); return { name: n, profit: Math.round((r * 9000 - 1500 + 500) * mult), staked: Math.round((20000 + r * 60000) * mult), you: false }; });
  }, [period, mult]);
  const all = [...rows, { name: st.profile.nick, profit: me, staked: st.bets.reduce((a, b) => a + b.stake, 0), you: true }].sort((a, b) => b.profit - a.profit);
  const rank = all.findIndex((r) => r.you) + 1;
  return (
    <div>
      <h1 className="mb-1 text-2xl font-black">Leaderboard</h1>
      <p className="mb-4 text-sm text-muted">Ranked by profit in virtual coins. Other players are simulated.</p>
      <div className="mb-4 flex gap-1.5">{PERIODS.map(([k, t]) => <button key={k} onClick={() => setPeriod(k)} className={`h-9 rounded-full px-4 text-sm font-bold ${period === k ? "bg-accent text-accent-ink" : "bg-panel text-muted"}`}>{t}</button>)}</div>
      <div className="hero-grad mb-4 flex items-center justify-between rounded-2xl p-4"><div><div className="text-xs text-muted">Your rank</div><div className="num text-3xl font-black">#{rank}</div></div><div className="text-right"><div className="text-xs text-muted">Your profit</div><div className={`num text-xl font-black ${me >= 0 ? "text-win" : "text-lose"}`}>{me >= 0 ? "+" : "−"}{fmtCoins(Math.abs(me))}</div></div></div>
      <div className="divide-y divide-line overflow-hidden rounded-2xl bg-panel">
        {all.slice(0, 20).map((r, i) => (
          <div key={r.name + i} className={`flex items-center gap-3 px-4 py-3 text-sm ${r.you ? "bg-accent/10" : ""}`}>
            <span className={`num w-7 text-center font-black ${i < 3 ? "text-amber" : "text-muted"}`}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
            <div className="min-w-0 flex-1"><div className="truncate font-bold">{r.name}{r.you && " (you)"}</div><div className="text-xs text-muted">{tierOf(r.staked).name ?? ""}</div></div>
            <div className={`num font-extrabold ${r.profit >= 0 ? "text-win" : "text-lose"}`}>{r.profit >= 0 ? "+" : "−"}{fmtCoins(Math.abs(r.profit))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
