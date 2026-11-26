"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [["/account", "Overview", "👤"], ["/account/bets", "My bets", "🎫"], ["/account/wallet", "Wallet & bonuses", "👛"], ["/account/achievements", "Achievements", "🏆"], ["/account/limits", "Limits & safe play", "🛡️"], ["/account/settings", "Settings", "⚙️"], ["/account/help", "Help", "❓"]];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <nav className="scroll-x flex shrink-0 gap-1.5 lg:w-[230px] lg:flex-col lg:gap-1 lg:rounded-2xl lg:bg-panel lg:p-2">
        {TABS.map(([href, t, i]) => (
          <Link key={href} href={href} className={`flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold ${path === href ? "bg-accent text-accent-ink lg:bg-panel2 lg:text-accent" : "bg-panel text-muted hover:text-ink lg:bg-transparent"}`}><span>{i}</span>{t}</Link>
        ))}
      </nav>
      <div className="min-w-0 flex-1 space-y-4">{children}</div>
    </div>
  );
}
