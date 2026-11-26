"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register, useStore } from "@/lib/store";

const COUNTRIES = ["United Kingdom", "Ireland", "Germany", "France", "Spain", "Italy", "Netherlands", "Poland", "Sweden", "Canada", "Australia", "Other"];
export const inp = "h-11 w-full rounded-xl bg-panel2 px-3 text-sm outline-none ring-1 ring-line focus:ring-accent";

export default function Register() {
  const st = useStore(), router = useRouter();
  const [f, setF] = useState({ nick: "", email: "", password: "", birth: "", country: "", promo: "" });
  const [ok18, setOk18] = useState(false), [terms, setTerms] = useState(false), [err, setErr] = useState<string | null>(null), [busy, setBusy] = useState(false), [show, setShow] = useState(false);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setF({ ...f, [k]: e.target.value }); setErr(null); };
  if (st.profile.registered) return <div className="mx-auto max-w-md rounded-2xl bg-panel p-6 text-center">You are signed in as <b>{st.profile.nick}</b>. <Link href="/account" className="text-accent">Open account</Link></div>;
  const submit = async () => {
    if (!ok18) return setErr("Please confirm that you are 18 or older");
    if (!terms) return setErr("Please accept the terms");
    setBusy(true); const e = await register(f); setBusy(false);
    if (e) setErr(e); else router.push("/account");
  };
  return (
    <div className="mx-auto max-w-md">
      <div className="hero-grad mb-4 rounded-2xl p-5"><h1 className="text-2xl font-black">Create account</h1><p className="mt-1 text-sm text-muted">Get 10,000 virtual coins to start. Use promo code WELCOME for 2,000 more.</p></div>
      <div className="space-y-3 rounded-2xl bg-panel p-5">
        <label className="block text-sm"><span className="mb-1 block text-muted">Nickname</span><input className={inp} value={f.nick} onChange={up("nick")} autoComplete="nickname" /></label>
        <label className="block text-sm"><span className="mb-1 block text-muted">Email</span><input type="email" className={inp} value={f.email} onChange={up("email")} autoComplete="email" /></label>
        <label className="block text-sm"><span className="mb-1 block text-muted">Password (8+ characters)</span><div className="flex gap-2"><input type={show ? "text" : "password"} className={inp} value={f.password} onChange={up("password")} autoComplete="new-password" /><button type="button" onClick={() => setShow(!show)} className="h-11 rounded-xl bg-panel2 px-3 text-xs font-bold text-muted">{show ? "Hide" : "Show"}</button></div></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm"><span className="mb-1 block text-muted">Date of birth</span><input type="date" className={inp} value={f.birth} onChange={up("birth")} /></label>
          <label className="block text-sm"><span className="mb-1 block text-muted">Country</span><select className={inp} value={f.country} onChange={up("country")}><option value="">Select…</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        </div>
        <label className="block text-sm"><span className="mb-1 block text-muted">Promo code (optional)</span><input className={`${inp} uppercase`} value={f.promo} onChange={up("promo")} /></label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={ok18} onChange={(e) => setOk18(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" /><span>I am 18 years old or older</span></label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--accent)]" /><span>I accept the terms. Playmaker uses virtual coins only, with no real-money deposits or withdrawals.</span></label>
        {err && <div className="rounded-lg bg-lose/10 px-3 py-2 text-sm text-lose">{err}</div>}
        <button disabled={busy} onClick={submit} className="h-12 w-full rounded-xl bg-accent font-extrabold text-accent-ink disabled:opacity-50">{busy ? "Creating…" : "Create account"}</button>
        <p className="text-center text-sm text-muted">Already registered? <Link href="/login" className="font-bold text-accent">Log in</Link></p>
        <p className="text-[11px] leading-relaxed text-muted">Your account is stored in this browser only: nothing is sent to a server, and you can only log in again on this device.</p>
      </div>
    </div>
  );
}
