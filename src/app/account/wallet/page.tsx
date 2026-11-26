"use client";
import { useState } from "react";
import { Btn, Card } from "@/components/ui";
import { fmtCoins } from "@/lib/format";
import { bonusReady, claimBonus, PROMOS, redeemPromo, useStore } from "@/lib/store";

const ICON: Record<string, string> = { bet: "🎫", win: "🏆", bonus: "🎁", promo: "🏷️", cashout: "💸", reset: "♻️" };

export default function Wallet() {
  const st = useStore();
  const [code, setCode] = useState(""), [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const ready = bonusReady(st);
  return (
    <>
      <Card>
        <div className="text-xs text-muted">Balance</div>
        <div className="num text-4xl font-black">{fmtCoins(st.balance)} <span className="text-amber">🪙</span></div>
        <p className="mt-2 text-xs text-muted">Virtual coins for entertainment only. They have no cash value, cannot be bought, sold or withdrawn.</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Daily bonus">
          <p className="mb-3 text-sm text-muted">Claim 1,000 free coins once every 24 hours.</p>
          <Btn disabled={!ready} onClick={claimBonus}>{ready ? "Claim +1,000" : `Available ${new Date(st.bonusAt + 86400e3).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}</Btn>
        </Card>
        <Card title="Promo code">
          <div className="flex gap-2">
            <input value={code} onChange={(e) => { setCode(e.target.value); setMsg(null); }} placeholder="Enter code" className="h-10 min-w-0 flex-1 rounded-lg bg-panel2 px-3 text-sm font-bold uppercase outline-none ring-1 ring-line focus:ring-accent" />
            <Btn onClick={() => { const e = redeemPromo(code); setMsg(e ? { ok: false, t: e } : { ok: true, t: "Promo code applied!" }); if (!e) setCode(""); }}>Apply</Btn>
          </div>
          {msg && <div className={`mt-2 text-sm ${msg.ok ? "text-win" : "text-lose"}`}>{msg.t}</div>}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted">Try: {Object.keys(PROMOS).map((c) => <button key={c} onClick={() => setCode(c)} className={`rounded bg-panel2 px-2 py-1 font-bold ${st.promos.includes(c) ? "line-through opacity-50" : "text-ink"}`}>{c}</button>)}</div>
        </Card>
      </div>
      <Card title="Transaction history">
        <div className="divide-y divide-line">
          {st.tx.slice(0, 60).map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-panel2">{ICON[t.type]}</span>
              <div className="min-w-0 flex-1"><div className="truncate font-semibold">{t.note}</div><div className="text-xs text-muted">{new Date(t.at).toLocaleString("en-GB")}</div></div>
              <div className={`num font-extrabold ${t.amount >= 0 ? "text-win" : "text-lose"}`}>{t.amount >= 0 ? "+" : "−"}{fmtCoins(Math.abs(t.amount))}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
