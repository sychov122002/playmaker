"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Slip } from "./Slip";
import { bonusReady, claimBonus, markAllRead, remindBonus, setSettings, settle, useStore } from "@/lib/store";
import { fmtCoins } from "@/lib/format";

const NAV = [{ href: "/", t: "Lines" }, { href: "/live", t: "Live" }, { href: "/results", t: "Results" }, { href: "/promotions", t: "Promotions" }];
const MENU: [string, string, string][] = [["/account", "Profile", "👤"], ["/account/bets", "My bets", "🎫"], ["/account/wallet", "Wallet", "👛"], ["/account/settings", "Settings", "⚙️"], ["/challenges", "Challenges", "🎯"], ["/account/help", "Help", "❓"], ["/leaderboard", "Leaderboard", "🏅"]];

function useOutside(ref: React.RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => { const f = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close(); }; document.addEventListener("mousedown", f); return () => document.removeEventListener("mousedown", f); }, [ref, close]);
}

import { logout } from "@/lib/store";
import { liveReal } from "@/lib/events";
import { startFeed, useFeedVersion } from "@/lib/feed";

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(), st = useStore();
  const [open, setOpen] = useState(false), [menu, setMenu] = useState(false), [bell, setBell] = useState(false), [reality, setReality] = useState(0);
  const mref = useRef<HTMLDivElement>(null), bref = useRef<HTMLDivElement>(null);
  useOutside(mref, () => setMenu(false)); useOutside(bref, () => setBell(false));
  useFeedVersion(); const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const liveCount = mounted ? liveReal().length : 0;
  useEffect(() => { startFeed(); }, []);
  useEffect(() => { settle(); remindBonus(); const t = setInterval(() => { settle(); remindBonus(); }, 2000); return () => clearInterval(t); }, []);
  useEffect(() => { document.documentElement.dataset.theme = st.settings.theme; }, [st.settings.theme]);
  useEffect(() => {
    if (!st.settings.reality) return; const t0 = Date.now();
    const t = setInterval(() => setReality(Math.round((Date.now() - t0) / 60000)), st.settings.reality * 60000);
    return () => clearInterval(t);
  }, [st.settings.reality]);
  const pending = st.bets.filter((b) => b.status === "pending").length, unread = st.inbox.filter((m) => !m.read).length;
  const active = (h: string) => (h === "/" ? path === "/" || path.startsWith("/event") : path.startsWith(h));
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1500px] flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-5">
          <Link href="/" className="flex items-center gap-2 font-black tracking-tight"><span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-ink">P</span><span className="hidden text-lg sm:block">Playmaker</span></Link>
          <nav className="ml-1 flex gap-0.5 text-sm font-bold sm:ml-3 sm:gap-1">
            {NAV.map((n) => <Link key={n.href} href={n.href} className={`${n.href === "/results" || n.href === "/promotions" ? "hidden md:block " : ""}whitespace-nowrap rounded-lg px-2.5 py-1.5 sm:px-3 ${active(n.href) ? "bg-panel2 text-accent" : "text-muted hover:text-ink"}`}>{n.t}{n.href === "/live" && liveCount > 0 && <span className="ml-1.5 rounded-full bg-[color:var(--hot)] px-1.5 text-[10px] text-white">{liveCount}</span>}</Link>)}
            <Link href="/account/bets" className={`hidden sm:block whitespace-nowrap rounded-lg px-2.5 py-1.5 sm:px-3 ${path.startsWith("/account/bets") ? "bg-panel2 text-accent" : "text-muted hover:text-ink"}`}>My bets{pending > 0 && <span className="ml-1 rounded-full bg-accent px-1.5 text-[10px] text-accent-ink">{pending}</span>}</Link>
          </nav>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {bonusReady(st) && <button onClick={claimBonus} className="hidden rounded-lg border border-accent/60 px-2.5 py-1.5 text-xs font-bold text-accent lg:block">+1000 bonus</button>}
            <div ref={bref} className="relative">
              <button aria-label="Notifications" onClick={() => { setBell(!bell); setMenu(false); }} className="relative grid h-9 w-9 place-items-center rounded-lg bg-panel text-base">🔔{unread > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-lose px-1 text-[10px] font-bold text-white">{unread}</span>}</button>
              {bell && (
                <div className="absolute right-0 top-11 z-40 w-[320px] max-w-[88vw] overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-3"><span className="text-sm font-extrabold">Notifications</span><button onClick={markAllRead} className="text-xs text-accent">Mark all read</button></div>
                  <div className="max-h-80 divide-y divide-line overflow-y-auto">
                    {st.inbox.slice(0, 6).map((m) => <div key={m.id} className={`flex gap-3 px-4 py-3 text-sm ${m.read ? "opacity-60" : ""}`}><span>{m.icon}</span><div className="min-w-0"><div className="font-bold">{m.title}</div><div className="text-xs text-muted">{m.body}</div></div></div>)}
                    {st.inbox.length === 0 && <div className="px-4 py-6 text-center text-sm text-muted">No notifications</div>}
                  </div>
                  <Link href="/account/inbox" onClick={() => setBell(false)} className="block border-t border-line px-4 py-3 text-center text-sm font-bold text-accent">All notifications</Link>
                </div>
              )}
            </div>
            <Link href="/account/wallet" className="num whitespace-nowrap rounded-lg border border-line bg-panel px-2.5 py-1.5 text-sm font-extrabold">{fmtCoins(st.balance)} <span className="text-amber">🪙</span></Link>
            {!st.profile.registered && <div className="flex items-center gap-1.5"><Link href="/login" className="hidden rounded-lg px-2.5 py-1.5 text-sm font-bold text-muted hover:text-ink sm:block">Log in</Link><Link href="/register" className="whitespace-nowrap rounded-lg bg-accent px-3 py-1.5 text-sm font-extrabold text-accent-ink">Sign up</Link></div>}
            <div ref={mref} className={`relative ${st.profile.registered ? "" : "hidden sm:block"}`}>
              <button aria-label="Account menu" onClick={() => { setMenu(!menu); setBell(false); }} className="grid h-9 w-9 place-items-center rounded-lg bg-panel text-lg">{st.profile.avatar}</button>
              {menu && (
                <div className="absolute right-0 top-11 z-40 w-60 overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl">
                  <Link href="/account" onClick={() => setMenu(false)} className="flex items-center gap-3 border-b border-line px-4 py-3"><span className="text-2xl">{st.profile.avatar}</span><span className="min-w-0"><span className="block truncate text-sm font-extrabold">{st.profile.nick}</span><span className="block text-xs text-muted">{st.profile.id}</span></span></Link>
                  {MENU.map(([h, t, i]) => <Link key={h} href={h} onClick={() => setMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold hover:bg-panel2"><span>{i}</span>{t}</Link>)}
                  <button onClick={() => setSettings({ theme: st.settings.theme === "dark" ? "light" : "dark" })} className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left text-sm font-semibold hover:bg-panel2"><span>{st.settings.theme === "dark" ? "☀️" : "🌙"}</span>{st.settings.theme === "dark" ? "Light theme" : "Dark theme"}</button>
                  {st.profile.registered ? <button onClick={() => { logout(); setMenu(false); }} className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-left text-sm font-semibold text-lose hover:bg-panel2"><span>🚪</span>Log out</button> : <Link href="/login" onClick={() => setMenu(false)} className="flex w-full items-center gap-3 border-t border-line px-4 py-2.5 text-sm font-semibold text-accent hover:bg-panel2"><span>🔑</span>Log in</Link>}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {reality > 0 && <div className="mx-3 mt-3 flex items-center justify-between rounded-xl border border-amber/40 bg-amber/10 px-4 py-2.5 text-sm text-amber sm:mx-5"><span>⏱ You have been playing for {reality} minutes. Remember to take breaks.</span><button onClick={() => setReality(0)} className="font-bold">OK</button></div>}
      <div className="flex flex-1 gap-5 px-3 py-4 sm:px-5">
        <main className="min-w-0 flex-1 pb-24 lg:pb-6">{children}</main>
        <aside className="sticky top-[72px] hidden h-[calc(100dvh-90px)] w-[330px] shrink-0 overflow-hidden rounded-2xl border border-line bg-panel lg:block"><Slip /></aside>
      </div>
      <footer className="border-t border-line px-5 py-5 pb-24 text-xs leading-relaxed text-muted lg:pb-5">
        <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 font-semibold text-ink/70"><Link href="/promotions">Promotions</Link><Link href="/leaderboard">Leaderboard</Link><Link href="/challenges">Challenges</Link><Link href="/results">Results</Link><Link href="/account/limits">Responsible play</Link><Link href="/account/help">Help</Link></div>
        Playmaker is an entertainment game played with virtual coins. Coins have no cash value and cannot be bought or withdrawn. Fixtures and probabilities are based on real data, but results are drawn by a simulator, so they do not match real-life outcomes. 18+ only.
      </footer>
      {st.slip.length > 0 && !open && (
        <button onClick={() => setOpen(true)} className="fixed inset-x-3 bottom-3 z-40 flex h-14 items-center justify-between rounded-2xl bg-accent px-5 font-extrabold text-accent-ink shadow-2xl lg:hidden"><span>Bet slip · {st.slip.length}</span><span className="num">{st.mode === "express" && st.slip.length > 1 ? `×${st.slip.reduce((p, l) => p * l.odds, 1).toFixed(2)}` : "Open"}</span></button>
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
