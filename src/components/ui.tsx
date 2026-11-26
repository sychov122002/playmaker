export const Card = ({ title, children, right }: { title?: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <section className="rounded-2xl bg-panel p-4 sm:p-5">
    {(title || right) && <div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-extrabold">{title}</h2>{right}</div>}
    {children}
  </section>
);
export const Stat = ({ k, v, tone }: { k: string; v: string; tone?: "win" | "lose" }) => (
  <div className="rounded-xl bg-panel2 p-3"><div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{k}</div><div className={`num mt-1 text-lg font-black sm:text-xl ${tone === "win" ? "text-win" : tone === "lose" ? "text-lose" : ""}`}>{v}</div></div>
);
export const Btn = ({ children, onClick, kind = "solid", disabled }: { children: React.ReactNode; onClick?: () => void; kind?: "solid" | "ghost" | "danger"; disabled?: boolean }) => (
  <button disabled={disabled} onClick={onClick} className={`h-10 rounded-lg px-4 text-sm font-bold transition active:scale-[.98] disabled:opacity-40 ${kind === "solid" ? "bg-accent text-accent-ink" : kind === "danger" ? "bg-lose/15 text-lose" : "bg-panel2 text-ink hover:text-accent"}`}>{children}</button>
);
export const Toggle = ({ on, set, label, hint }: { on: boolean; set: (v: boolean) => void; label: string; hint?: string }) => (
  <button onClick={() => set(!on)} className="flex w-full items-center justify-between gap-4 rounded-xl bg-panel2 p-3 text-left" aria-pressed={on}>
    <span><span className="block text-sm font-bold">{label}</span>{hint && <span className="block text-xs text-muted">{hint}</span>}</span>
    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-accent" : "bg-line"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} /></span>
  </button>
);
export function Chart({ data }: { data: number[] }) {
  const w = 600, h = 140, min = Math.min(0, ...data), max = Math.max(1, ...data), n = Math.max(1, data.length - 1);
  const x = (i: number) => (i / n) * w, y = (v: number) => h - 8 - ((v - min) / (max - min || 1)) * (h - 16);
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const up = (data.at(-1) ?? 0) >= 0;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full" role="img" aria-label="Profit over time">
      <line x1="0" x2={w} y1={y(0)} y2={y(0)} stroke="var(--line)" strokeDasharray="4 4" />
      {data.length > 1 && <polyline points={pts} fill="none" stroke={up ? "var(--win)" : "var(--lose)"} strokeWidth="2.5" strokeLinejoin="round" />}
      {data.length <= 1 && <text x={w / 2} y={h / 2} textAnchor="middle" fill="var(--muted)" fontSize="14">Settled bets will draw your profit curve here</text>}
    </svg>
  );
}
