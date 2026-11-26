const dt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const dd = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long" });
export const fmtTime = (t: number) => dt.format(t);
export const fmtDay = (t: number) => dd.format(t);
export const fmtCoins = (n: number) => new Intl.NumberFormat("en-US").format(Math.floor(n));
export const dayKey = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };

import type { OddsFormat } from "./types";
const FR: [number, number][] = [[1, 10], [1, 8], [1, 6], [1, 5], [1, 4], [2, 7], [1, 3], [4, 11], [2, 5], [4, 9], [1, 2], [8, 15], [4, 7], [8, 13], [4, 6], [5, 6], [10, 11], [1, 1], [11, 10], [6, 5], [5, 4], [11, 8], [6, 4], [13, 8], [7, 4], [15, 8], [2, 1], [9, 4], [5, 2], [11, 4], [3, 1], [7, 2], [4, 1], [9, 2], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [12, 1], [14, 1], [16, 1], [20, 1], [25, 1], [33, 1], [50, 1]];
export function fmtOdds(o: number, f: OddsFormat = "decimal"): string {
  if (f === "decimal") return o.toFixed(2);
  if (f === "american") return o >= 2 ? `+${Math.round((o - 1) * 100)}` : `-${Math.round(100 / (o - 1))}`;
  const t = o - 1; let best = FR[0], d = 9;
  for (const x of FR) { const e = Math.abs(x[0] / x[1] - t); if (e < d) { d = e; best = x; } }
  return `${best[0]}/${best[1]}`;
}
