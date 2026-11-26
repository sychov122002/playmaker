import Link from "next/link";
import { Crest } from "./Crest";
import { OddsBtn } from "./OddsBtn";
import { fmtTime } from "@/lib/format";
import { toggleFav, useStore } from "@/lib/store";
import type { Ev } from "@/lib/types";

export interface Col { head: string; mk: string; out: string; tag?: string }
const lineOf = (k: string) => k.split("_")[1];
const sg = (n: number) => (n > 0 ? `+${n}` : `${n}`);
const find = (ev: Ev, pre: string) => ev.markets.find((m) => m.key === pre || m.key.startsWith(pre + "_"))?.key ?? "";

/** Колонки таблицы коэффициентов для вида спорта. */
export function colsFor(ev: Ev): Col[] {
  if (ev.sport === "football") return [
    { head: "1", mk: "1x2", out: "1" }, { head: "X", mk: "1x2", out: "X" }, { head: "2", mk: "1x2", out: "2" },
    { head: "1X", mk: "dc", out: "1X" }, { head: "X2", mk: "dc", out: "X2" },
    { head: "Over", mk: "tot_2.5", out: "over", tag: "2.5" }, { head: "Under", mk: "tot_2.5", out: "under", tag: "2.5" },
  ];
  if (ev.sport === "mma") return [{ head: "1", mk: "ml", out: "h" }, { head: "2", mk: "ml", out: "a" }, { head: "Dist. yes", mk: "dist", out: "yes" }, { head: "Dist. no", mk: "dist", out: "no" }];
  const h = find(ev, "hcp"), t = find(ev, "tot");
  return [
    { head: "1", mk: "ml", out: "h" }, { head: "2", mk: "ml", out: "a" },
    { head: "Hcp 1", mk: h, out: "h", tag: sg(parseFloat(lineOf(h))) }, { head: "Hcp 2", mk: h, out: "a", tag: sg(-parseFloat(lineOf(h))) },
    { head: "Over", mk: t, out: "over", tag: lineOf(t) }, { head: "Under", mk: t, out: "under", tag: lineOf(t) },
  ];
}
export const GRID = (n: number) => ({ gridTemplateColumns: `minmax(0,1fr) repeat(${n}, 68px) 44px` });

export function EventRow({ ev }: { ev: Ev }) {
  const fav = useStore().favs.includes(ev.id);
  const star = <button aria-label={fav ? "Remove from favorites" : "Add to favorites"} aria-pressed={fav} onClick={() => toggleFav(ev.id)} className={`shrink-0 text-lg leading-none ${fav ? "text-amber" : "text-muted/60 hover:text-amber"}`}>{fav ? "★" : "☆"}</button>;
  const cols = colsFor(ev);
  const extra = ev.markets.reduce((n, m) => n + m.outcomes.length, 0) - cols.length;
  return (
    <div className="border-t border-line px-3 py-2 first:border-t-0">
      <div className="hidden items-center gap-1.5 md:grid" style={GRID(cols.length)}>
        <div className="flex min-w-0 items-center gap-2">{star}<Link href={`/event/${ev.id}`} className="flex min-w-0 flex-1 items-center gap-3 pr-2">
          <span className="num w-11 shrink-0 text-xs font-bold text-muted">{fmtTime(ev.start)}</span>
          <span className="min-w-0 text-[13.5px] font-semibold leading-tight"><span className="flex items-center gap-2 truncate"><Crest name={ev.home} size={18} />{ev.home}</span><span className="mt-1 flex items-center gap-2 truncate"><Crest name={ev.away} size={18} />{ev.away}</span></span>
        </Link></div>
        {cols.map((c) => <OddsBtn key={c.head} ev={ev} mk={c.mk} out={c.out} tag={c.tag ?? ""} />)}
        <Link href={`/event/${ev.id}`} className="grid h-9 place-items-center rounded-lg bg-panel2 text-xs font-bold text-muted hover:text-accent">{extra > 0 ? `+${extra}` : "›"}</Link>
      </div>
      <div className="md:hidden">
        <div className="mb-2 flex items-center gap-2">{star}<Link href={`/event/${ev.id}`} className="flex min-w-0 flex-1 items-center gap-3">
          <span className="num w-11 shrink-0 text-xs font-bold text-muted">{fmtTime(ev.start)}</span>
          <span className="min-w-0 flex-1 text-sm font-semibold leading-tight"><span className="flex items-center gap-2 truncate"><Crest name={ev.home} size={18} />{ev.home}</span><span className="mt-1 flex items-center gap-2 truncate"><Crest name={ev.away} size={18} />{ev.away}</span></span>
          <span className="rounded-md bg-panel2 px-2 py-1 text-[11px] font-bold text-muted">{extra > 0 ? `+${extra}` : "›"}</span>
        </Link></div>
        <div className={`grid gap-1.5 ${cols.length > 4 && ev.sport === "football" ? "grid-cols-3" : "grid-cols-3"}`}>
          {cols.slice(0, 3).map((c) => <OddsBtn key={c.head} ev={ev} mk={c.mk} out={c.out} tag={c.head} />)}
        </div>
      </div>
    </div>
  );
}
