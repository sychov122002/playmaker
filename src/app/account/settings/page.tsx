"use client";
import { useState } from "react";
import { Btn, Card, Toggle } from "@/components/ui";
import { fmtOdds } from "@/lib/format";
import { resetAccount, setProfile, setSettings, useStore } from "@/lib/store";
import type { OddsFormat } from "@/lib/types";

const AVATARS = ["🦊", "🐺", "🦁", "🐯", "🐼", "🦅", "🐲", "🦈", "🚀", "⚡", "👑", "🎯"];

export default function Settings() {
  const st = useStore();
  const [nick, setNick] = useState(""), [sure, setSure] = useState(false);
  const exportData = () => { const b = new Blob([JSON.stringify(st, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "playmaker-data.json"; a.click(); };
  return (
    <>
      <h1 className="text-2xl font-black">Settings</h1>
      <Card title="Profile">
        <label className="text-sm"><span className="mb-1 block text-muted">Nickname</span>
          <div className="flex gap-2"><input value={nick || st.profile.nick} onChange={(e) => setNick(e.target.value.slice(0, 20))} className="h-10 min-w-0 flex-1 rounded-lg bg-panel2 px-3 font-bold outline-none ring-1 ring-line focus:ring-accent" /><Btn onClick={() => { if (nick.trim()) setProfile({ nick: nick.trim() }); setNick(""); }}>Save</Btn></div></label>
        <div className="mt-4 text-sm text-muted">Avatar</div>
        <div className="mt-2 flex flex-wrap gap-2">{AVATARS.map((a) => <button key={a} onClick={() => setProfile({ avatar: a })} className={`grid h-12 w-12 place-items-center rounded-xl text-2xl ${st.profile.avatar === a ? "bg-accent" : "bg-panel2"}`}>{a}</button>)}</div>
      </Card>
      <Card title="Appearance">
        <div className="grid grid-cols-2 gap-2">{(["dark", "light"] as const).map((t) => <button key={t} onClick={() => setSettings({ theme: t })} className={`rounded-xl p-3 text-sm font-bold capitalize ${st.settings.theme === t ? "bg-accent text-accent-ink" : "bg-panel2"}`}>{t === "dark" ? "🌙" : "☀️"} {t}</button>)}</div>
      </Card>
      <Card title="Betting">
        <div className="mb-1 text-sm text-muted">Quick stakes</div>
        <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <input key={i} type="number" min={10} value={st.settings.quickStakes[i]} onChange={(e) => { const q = [...st.settings.quickStakes] as [number, number, number]; q[i] = Math.max(0, Math.floor(+e.target.value || 0)); setSettings({ quickStakes: q }); }} className="num h-10 rounded-lg bg-panel2 px-3 text-center font-bold outline-none ring-1 ring-line focus:ring-accent" />)}</div>
        <div className="mt-3"><Toggle on={st.settings.confirmBet} set={(v) => setSettings({ confirmBet: v })} label="Confirm before placing a bet" hint="Adds a second tap to avoid mistakes" /></div>
        <div className="mb-1 mt-3 text-sm text-muted">When odds change</div>
        <div className="grid grid-cols-3 gap-2">{([["any", "Accept any"], ["higher", "Accept higher"], ["never", "Never accept"]] as const).map(([id, t]) => <button key={id} onClick={() => setSettings({ oddsChange: id })} className={`rounded-xl p-3 text-xs font-bold ${st.settings.oddsChange === id ? "bg-accent text-accent-ink" : "bg-panel2"}`}>{t}</button>)}</div>
      </Card>
      <Card title="Odds format">
        <div className="grid grid-cols-3 gap-2">
          {([["decimal", "Decimal"], ["fractional", "Fractional"], ["american", "American"]] as [OddsFormat, string][]).map(([id, t]) => (
            <button key={id} onClick={() => setSettings({ odds: id })} className={`rounded-xl p-3 text-center ${st.settings.odds === id ? "bg-accent text-accent-ink" : "bg-panel2"}`}><div className="text-xs font-bold opacity-80">{t}</div><div className="num mt-1 text-lg font-black">{fmtOdds(2.5, id)}</div></button>
          ))}
        </div>
      </Card>
      <Card title="Notifications">
        <div className="space-y-2">
          <Toggle on={st.settings.notifyResults} set={(v) => setSettings({ notifyResults: v })} label="Bet results" hint="Show a banner when your bets are settled" />
          <Toggle on={st.settings.notifyBonus} set={(v) => setSettings({ notifyBonus: v })} label="Bonus reminders" hint="Remind me when the daily bonus is available" />
        </div>
      </Card>
      <Card title="Your data">
        <p className="mb-3 text-sm text-muted">Everything is stored in this browser only. Clearing site data or switching device starts a new account.</p>
        <div className="flex flex-wrap gap-2"><Btn kind="ghost" onClick={exportData}>Export data (JSON)</Btn>
          {!sure ? <Btn kind="danger" onClick={() => setSure(true)}>Reset account</Btn> : <><Btn kind="danger" onClick={() => { resetAccount(); setSure(false); }}>Yes, reset everything</Btn><Btn kind="ghost" onClick={() => setSure(false)}>Cancel</Btn></>}</div>
      </Card>
    </>
  );
}
