const dt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const dd = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long" });
export const fmtTime = (t: number) => dt.format(t);
export const fmtDay = (t: number) => dd.format(t);
export const fmtCoins = (n: number) => new Intl.NumberFormat("en-US").format(Math.floor(n));
export const dayKey = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
