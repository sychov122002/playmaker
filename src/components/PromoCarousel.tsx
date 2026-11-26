"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  { t: "Parlay boost up to +25%", d: "Combine 3+ selections at odds of 1.20+ and get extra winnings.", cta: "How it works", href: "/promotions", bg: "linear-gradient(115deg,#14102e 0%,#5b3df5 70%,#a78bfa 130%)", icon: "🚀", tag: "Boost" },
  { t: "5% weekly cashback", d: "Lost a little this week? We return 5% of your net losses in coins.", cta: "Get cashback", href: "/promotions", bg: "linear-gradient(115deg,#1d0c14 0%,#e11d62 75%,#ff7aa8 130%)", icon: "💰", tag: "Cashback" },
  { t: "Live every 3 minutes", d: "Virtual football with odds that move minute by minute.", cta: "Go live", href: "/live", bg: "linear-gradient(115deg,#0b1a24 0%,#0ea5e9 75%,#67e8f9 130%)", icon: "🔴", tag: "Live" },
  { t: "Promo code WELCOME", d: "Redeem it in your wallet for 2,000 bonus coins.", cta: "Open wallet", href: "/account/wallet", bg: "linear-gradient(115deg,#1f1708 0%,#f59e0b 75%,#fde047 130%)", icon: "🎁", tag: "Gift" },
];

const MINI = [
  { t: "Daily bonus", d: "+1,000 coins every day", href: "/promotions", icon: "🎁", c: "#8b6cff" },
  { t: "Results", d: "Scores of finished matches", href: "/results", icon: "📊", c: "#0ea5e9" },
  { t: "VIP tiers", d: "Bronze to Diamond", href: "/account", icon: "👑", c: "#f59e0b" },
];

export function PromoCarousel() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 5500); return () => clearInterval(t); }, []);
  const s = SLIDES[i];
  const dark = i === 3;
  return (
    <div className="mb-4">
      <div className="relative overflow-hidden rounded-2xl text-white" style={{ background: s.bg }}>
        <div key={i} className="slide-in flex min-h-[190px] items-center justify-between gap-4 p-6 sm:min-h-[240px] sm:p-10">
          <div className="max-w-md">
            <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest">{s.tag}</span>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{s.t}</h2>
            <p className="mt-2 text-sm text-white/85 sm:text-base">{s.d}</p>
            <Link href={s.href} className={`mt-5 inline-block rounded-xl px-5 py-2.5 text-sm font-extrabold ${dark ? "bg-black text-white" : "bg-white text-black"}`}>{s.cta}</Link>
          </div>
          <div className="select-none text-7xl drop-shadow-lg sm:text-[120px]">{s.icon}</div>
        </div>
        <div className="absolute bottom-3 left-6 flex gap-1.5">{SLIDES.map((_, n) => <button key={n} aria-label={`Slide ${n + 1}`} onClick={() => setI(n)} className={`h-1.5 rounded-full transition-all ${n === i ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />)}</div>
      </div>
      <div className="scroll-x mt-3 flex gap-3 sm:grid sm:grid-cols-3">
        {MINI.map((m) => (
          <Link key={m.t} href={m.href} className="flex min-w-[210px] shrink-0 items-center gap-3 rounded-2xl bg-panel p-4 transition hover:bg-panel2 sm:min-w-0">
            <span className="grid h-11 w-11 place-items-center rounded-xl text-2xl" style={{ background: m.c + "33" }}>{m.icon}</span>
            <span><span className="block text-sm font-extrabold">{m.t}</span><span className="block text-xs text-muted">{m.d}</span></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
