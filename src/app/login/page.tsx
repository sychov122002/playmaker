"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, useStore } from "@/lib/store";

const inp = "h-11 w-full rounded-xl bg-panel2 px-3 text-sm outline-none ring-1 ring-line focus:ring-accent";
export default function Login() {
  const st = useStore(), router = useRouter();
  const [email, setEmail] = useState(""), [pwd, setPwd] = useState(""), [err, setErr] = useState<string | null>(null), [busy, setBusy] = useState(false);
  if (st.profile.registered) return <div className="mx-auto max-w-md rounded-2xl bg-panel p-6 text-center">You are signed in as <b>{st.profile.nick}</b>. <Link href="/account" className="text-accent">Open account</Link></div>;
  const submit = async () => { setBusy(true); const e = await login(email, pwd); setBusy(false); if (e) setErr(e); else router.push("/"); };
  return (
    <div className="mx-auto max-w-md">
      <div className="hero-grad mb-4 rounded-2xl p-5"><h1 className="text-2xl font-black">Log in</h1><p className="mt-1 text-sm text-muted">Welcome back.</p></div>
      <form onSubmit={(e) => { e.preventDefault(); void submit(); }} className="space-y-3 rounded-2xl bg-panel p-5">
        <label className="block text-sm"><span className="mb-1 block text-muted">Email</span><input type="email" className={inp} value={email} onChange={(e) => { setEmail(e.target.value); setErr(null); }} autoComplete="email" /></label>
        <label className="block text-sm"><span className="mb-1 block text-muted">Password</span><input type="password" className={inp} value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(null); }} autoComplete="current-password" /></label>
        {err && <div className="rounded-lg bg-lose/10 px-3 py-2 text-sm text-lose">{err}</div>}
        <button disabled={busy || !email || !pwd} className="h-12 w-full rounded-xl bg-accent font-extrabold text-accent-ink disabled:opacity-50">{busy ? "Checking…" : "Log in"}</button>
        <p className="text-center text-sm text-muted">New here? <Link href="/register" className="font-bold text-accent">Create account</Link></p>
        <p className="text-[11px] text-muted">Accounts live in this browser only. There is no password reset: if you forget the password, create a new account.</p>
      </form>
    </div>
  );
}
