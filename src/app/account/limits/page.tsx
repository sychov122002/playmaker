"use client";
import { useState } from "react";
import { Btn, Card, Stat } from "@/components/ui";
import { fmtCoins } from "@/lib/format";
import { excludeFor, lossToday, setLimits, setSettings, useStore } from "@/lib/store";
import { useNow } from "@/lib/useNow";

export default function Limits() {
  const st = useStore(), now = useNow(30000);
  const [max, setMax] = useState(""), [loss, setLoss] = useState(""), [saved, setSaved] = useState(false);
  const active = now > 0 && st.limits.excludeUntil > now;
  const save = () => { setLimits({ ...(max !== "" && { maxStake: Number(max) || 0 }), ...(loss !== "" && { dailyLoss: Number(loss) || 0 }) }); setMax(""); setLoss(""); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <>
      <h1 className="text-2xl font-black">Limits & safe play</h1>
      <div className="grid grid-cols-2 gap-2"><Stat k="Max stake" v={st.limits.maxStake ? fmtCoins(st.limits.maxStake) : "No limit"} /><Stat k="Daily loss limit" v={st.limits.dailyLoss ? fmtCoins(st.limits.dailyLoss) : "No limit"} /><Stat k="Lost today" v={fmtCoins(Math.max(0, lossToday(st)))} /><Stat k="Self-exclusion" v={active ? `until ${new Date(st.limits.excludeUntil).toLocaleDateString("en-GB")}` : "Off"} tone={active ? "lose" : undefined} /></div>
      <Card title="Betting limits">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block text-muted">Max stake per bet (0 = none)</span><input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} placeholder={String(st.limits.maxStake)} className="num h-10 w-full rounded-lg bg-panel2 px-3 font-bold outline-none ring-1 ring-line focus:ring-accent" /></label>
          <label className="text-sm"><span className="mb-1 block text-muted">Daily loss limit (0 = none)</span><input inputMode="numeric" value={loss} onChange={(e) => setLoss(e.target.value.replace(/\D/g, ""))} placeholder={String(st.limits.dailyLoss)} className="num h-10 w-full rounded-lg bg-panel2 px-3 font-bold outline-none ring-1 ring-line focus:ring-accent" /></label>
        </div>
        <div className="mt-3 flex items-center gap-3"><Btn onClick={save}>Save limits</Btn>{saved && <span className="text-sm text-win">Saved</span>}</div>
      </Card>
      <Card title="Reality check">
        <p className="mb-3 text-sm text-muted">Get a reminder showing how long you have been playing.</p>
        <div className="flex gap-2">{([0, 30, 60] as const).map((m) => <button key={m} onClick={() => setSettings({ reality: m })} className={`h-9 rounded-full px-4 text-sm font-bold ${st.settings.reality === m ? "bg-accent text-accent-ink" : "bg-panel2 text-muted"}`}>{m ? `Every ${m} min` : "Off"}</button>)}</div>
      </Card>
      <Card title="Self-exclusion (take a break)">
        <p className="mb-3 text-sm text-muted">Betting is blocked for the chosen period. You can still look around the site. Longer breaks cannot be cancelled early.</p>
        <div className="flex flex-wrap gap-2">{[[1, "24 hours"], [7, "7 days"], [30, "30 days"]].map(([d, t]) => <Btn key={d} kind="danger" disabled={active} onClick={() => excludeFor(d as number)}>{t}</Btn>)}</div>
      </Card>
      <p className="text-xs text-muted">Playmaker uses virtual coins only. If gambling with real money is causing you problems, please contact a local support service.</p>
    </>
  );
}
