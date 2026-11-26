"use client";
import { useState } from "react";
import { Btn, Card, Toggle } from "@/components/ui";
import { setProfile, useStore } from "@/lib/store";

const COUNTRIES = ["United Kingdom", "Ireland", "Germany", "France", "Spain", "Italy", "Netherlands", "Poland", "Sweden", "Canada", "Australia", "Other"];
const inp = "h-10 w-full rounded-lg bg-panel2 px-3 text-sm outline-none ring-1 ring-line focus:ring-accent";

export default function ProfilePage() {
  const st = useStore();
  const p = st.profile;
  const [f, setF] = useState({ fullName: p.fullName, email: p.email, phone: p.phone, country: p.country, birth: p.birth });
  const [saved, setSaved] = useState(false);
  const [adult, setAdult] = useState(p.adult);
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setF({ ...f, [k]: e.target.value }); setSaved(false); };
  const emailOk = !f.email || /^\S+@\S+\.\S+$/.test(f.email);
  const filled = [f.fullName, f.email, f.phone, f.country, f.birth].filter(Boolean).length + (adult ? 1 : 0);
  return (
    <>
      <h1 className="text-2xl font-black">Profile</h1>
      <Card>
        <div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-panel2 text-4xl">{p.avatar}</div><div><div className="text-lg font-black">{p.nick}</div><div className="text-xs text-muted">Player ID {p.id}</div></div></div>
        <div className="mt-4"><div className="mb-1 flex justify-between text-xs text-muted"><span>Profile completion</span><span>{Math.round((filled / 6) * 100)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-panel2"><div className="h-full bg-accent" style={{ width: `${(filled / 6) * 100}%` }} /></div></div>
      </Card>
      <Card title="Personal data">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm"><span className="mb-1 block text-muted">Full name</span><input className={inp} value={f.fullName} onChange={up("fullName")} /></label>
          <label className="text-sm"><span className="mb-1 block text-muted">Email</span><input type="email" className={inp} value={f.email} onChange={up("email")} />{!emailOk && <span className="text-xs text-lose">Enter a valid email</span>}</label>
          <label className="text-sm"><span className="mb-1 block text-muted">Phone</span><input type="tel" className={inp} value={f.phone} onChange={up("phone")} /></label>
          <label className="text-sm"><span className="mb-1 block text-muted">Date of birth</span><input type="date" className={inp} value={f.birth} onChange={up("birth")} /></label>
          <label className="text-sm sm:col-span-2"><span className="mb-1 block text-muted">Country</span><select className={inp} value={f.country} onChange={up("country")}><option value="">Select…</option>{COUNTRIES.map((c) => <option key={c}>{c}</option>)}</select></label>
        </div>
        <div className="mt-3"><Toggle on={adult} set={(v) => { setAdult(v); setSaved(false); }} label="I confirm I am 18 or older" hint="Required for entertainment betting content" /></div>
        <div className="mt-4 flex items-center gap-3"><Btn disabled={!emailOk} onClick={() => { setProfile({ ...f, adult }); setSaved(true); }}>Save changes</Btn>{saved && <span className="text-sm text-win">Saved</span>}</div>
        <p className="mt-3 text-xs text-muted">Stored only in this browser. Nothing is sent anywhere.</p>
      </Card>
    </>
  );
}
