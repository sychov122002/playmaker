"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Slip } from "./Slip";
import { bonusReady, claimBonus, settle, useStore } from "@/lib/store";
import { fmtCoins } from "@/lib/format";

const NAV = [{ href: "/", t: "Lines" }, { href: "/live", t: "Live" }, { href: "/account/bets", t: "My bets" }, { href: "/account", t: "Account" }];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(), st = useStore();
  const [open, setOpen] = useState(false);
  useEffect(() => { settle(); const t = setInterval(() => settle(), 2000); return () => clearInterval(t); }, []);
  const pending = st.bets.filter((b) => b.status === "pending").length;
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1400px] flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-5">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-ink">P</span>
            <span className="hidden text-lg sm:block">Playmaker</span>
          </Link>
          <nav className="ml-1 flex gap-0.5 sm:ml-2 sm:gap-1 text-sm font-bold">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={`${n.href === "/account" ? "hidden sm:block " : ""}relative whitespace-nowrap rounded-lg px-2.5 py-1.5 sm:px-3 ${(n.href === "/" ? path === "/" || path.startsWith("/event") : n.href === "/account" ? path === "/account" || (path.startsWith("/account") && !path.startsWith("/account/bets")) : path.startsWith(n.href)) ? "bg-panel2 text-accent" : "text-muted hover:text-ink"}`}>
                {n.t}{n.href === "/account/bets" && pending > 0 && <span className="ml-1 rounded-full bg-amber px-1.5 text-[10px] text-black">{pending}</span>}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {bonusReady(st) && <button onClick={claimBonus} className="hidden rounded-lg border border-accent/50 px-2.5 py-1.5 text-xs font-bold text-accent sm:block">+1000 daily bonus</button>}
            <Link href="/account/wallet" className="num whitespace-nowrap rounded-lg border border-line bg-panel px-2.5 py-1.5 text-sm font-extrabold">{fmtCoins(st.balance)} <span className="text-amber">🪙</span></Link>
            <Link href="/account" aria-label="Account" className="grid h-9 w-9 place-items-center rounded-lg bg-panel text-lg">{st.profile.avatar}</Link>
          </div>
        </div>
      </header>
      <div className="flex flex-1 gap-5 px-3 py-4 sm:px-5">
        <main className="min-w-0 flex-1 pb-24 lg:pb-6">{children}</main>
        <aside className="sticky top-[72px] hidden h-[calc(100dvh-90px)] w-[330px] shrink-0 overflow-hidden rounded-2xl border border-line bg-panel lg:block"><Slip /></aside>
      </div>
      <footer className="border-t border-line px-5 py-5 pb-24 text-xs leading-relaxed text-muted lg:pb-5">
        Playmaker is an entertainment game played with virtual coins. Coins have no cash value and cannot be bought or withdrawn. Fixtures and probabilities are based on real data, but results are drawn by a simulator, so they do not match real-life outcomes.
      </footer>
      {st.slip.length > 0 && !open && (
        <button onClick={() => setOpen(true)} className="fixed inset-x-3 bottom-3 z-40 flex h-14 items-center justify-between rounded-2xl bg-accent px-5 font-extrabold text-accent-ink shadow-2xl lg:hidden">
          <span>Bet slip · {st.slip.length}</span><span className="num">{st.slip.reduce((p, l) => p * (st.mode === "express" ? l.odds : 1), 1) > 1 && st.mode === "express" ? `×${st.slip.reduce((p, l) => p * l.odds, 1).toFixed(2)}` : "Open"}</span>
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-x-0 bottom-0 h-[82dvh] rounded-t-3xl border-t border-line bg-panel" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute right-4 top-4 z-10 text-muted">Close</button>
            <Slip onDone={() => setTimeout(() => setOpen(false), 900)} />
          </div>
        </div>
      )}
    </div>
  );
}
