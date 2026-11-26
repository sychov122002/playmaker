import type { Market, Outcome, Sport } from "./types";

export const MARGIN = 0.06;
const clampOdds = (o: number) => Math.max(1.01, Math.round(o * 100) / 100);

/** Turns fair probabilities into odds with the house margin. */
export function toOdds(ps: number[], margin = MARGIN): number[] {
  const s = ps.reduce((a, b) => a + b, 0);
  return ps.map((p) => clampOdds(1 / ((p / s) * (1 + margin))));
}
function mk(key: string, title: string, items: [string, string, number][], margin = MARGIN): Market {
  const odds = toOdds(items.map((i) => Math.min(0.995, Math.max(0.005, i[2]))), margin);
  const outcomes: Outcome[] = items.map((i, n) => ({ key: i[0], label: i[1], odds: odds[n] }));
  return { key, title, outcomes };
}

export const pois = (k: number, l: number) => { let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; };
const N = 11;
export function scoreGrid(lh: number, la: number): number[][] {
  const g: number[][] = [];
  for (let i = 0; i < N; i++) { g[i] = []; for (let j = 0; j < N; j++) g[i][j] = pois(i, lh) * pois(j, la); }
  return g;
}
export function probs1x2(g: number[][]): [number, number, number] {
  let h = 0, d = 0, a = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { if (i > j) h += g[i][j]; else if (i === j) d += g[i][j]; else a += g[i][j]; }
  const s = h + d + a; return [h / s, d / s, a / s];
}
/** Fits expected goals so the 1X2 matches market probabilities. */
export function fitLambdas(ph: number, pd: number, pa: number): [number, number] {
  const s = ph + pd + pa; ph /= s; pd /= s; pa /= s;
  let best: [number, number] = [1.4, 1.1], err = 9;
  for (let lh = 0.2; lh <= 4; lh += 0.05) for (let la = 0.2; la <= 4; la += 0.05) {
    const [h, d, a] = probs1x2(scoreGrid(lh, la));
    const e = (h - ph) ** 2 + (d - pd) ** 2 + (a - pa) ** 2;
    if (e < err) { err = e; best = [lh, la]; }
  }
  return best;
}
const overP = (g: number[][], line: number) => { let o = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i + j > line) o += g[i][j]; return o; };
const bttsP = (g: number[][]) => { let y = 0; for (let i = 1; i < N; i++) for (let j = 1; j < N; j++) y += g[i][j]; return y; };

export function footballMarkets(ph: number, pd: number, pa: number, margin = MARGIN): Market[] {
  const [lh, la] = fitLambdas(ph, pd, pa);
  const g = scoreGrid(lh, la);
  const [h, d, a] = probs1x2(g);
  const m: Market[] = [
    mk("1x2", "Match result", [["1", "Home", h], ["X", "Draw", d], ["2", "Away", a]], margin),
    mk("dc", "Double chance", [["1X", "1X", h + d], ["12", "12", h + a], ["X2", "X2", d + a]], margin),
  ];
  for (const line of [1.5, 2.5, 3.5]) {
    const o = overP(g, line);
    m.push(mk(`tot_${line}`, `Total goals ${line}`, [["over", `Over ${line}`, o], ["under", `Under ${line}`, 1 - o]], margin));
  }
  const y = bttsP(g);
  m.push(mk("btts", "Both teams to score", [["yes", "Yes", y], ["no", "No", 1 - y]], margin));
  let hc = 0, hcd = 0; 
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { if (i - j >= 2) hc += g[i][j]; else if (i - j === 1) hcd += g[i][j]; }
  m.push(mk("hcp_-1.5", "Home handicap -1.5", [["h", "Home (-1.5)", hc], ["a", "Away (+1.5)", 1 - hc]], margin));
  void hcd;
  return m;
}

export function hockeyMarkets(ph: number, margin = MARGIN): Market[] {
  const p = ph / 100;
  const tot = 6.0, lh = tot * (0.5 + (p - 0.5) * 0.55), la = tot - lh;
  const g = scoreGrid(lh, la);
  return [
    mk("ml", "Moneyline (incl. OT)", [["h", "Home", p], ["a", "Away", 1 - p]], margin),
    mk("tot_5.5", "Total goals 5.5", [["over", "Over 5.5", overP(g, 5.5)], ["under", "Under 5.5", 1 - overP(g, 5.5)]], margin),
    mk("hcp_-1.5", "Home handicap -1.5", [["h", "Home (-1.5)", hcp(g, 1.5)], ["a", "Away (+1.5)", 1 - hcp(g, 1.5)]], margin),
  ];
}
function hcp(g: number[][], by: number) { let s = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i - j > by) s += g[i][j]; return s; }

const erf = (x: number) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
const cdf = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
export const invCdf = (p: number) => { let lo = -6, hi = 6; for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (cdf(mid) < p) lo = mid; else hi = mid; } return (lo + hi) / 2; };

export function basketballMarkets(ph: number, margin = MARGIN, sigma = 12.5, totLine = 226.5): Market[] {
  const p = ph / 100;
  const mu = invCdf(p) * sigma; // expected home margin
  const line = Math.round(-mu * 2) / 2 + (Math.round(-mu * 2) / 2 % 1 === 0 ? 0.5 : 0);
  const cover = 1 - cdf((-line - mu) / sigma); // P(diff + line > 0)
  const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);
  return [
    mk("ml", "Moneyline (incl. OT)", [["h", "Home", p], ["a", "Away", 1 - p]], margin),
    mk(`hcp_${line}`, `Home handicap ${sign(line)}`, [["h", `Home (${sign(line)})`, cover], ["a", `Away (${sign(-line)})`, 1 - cover]], margin),
    mk(`tot_${totLine}`, `Total points ${totLine}`, [["over", `Over ${totLine}`, 0.5], ["under", `Under ${totLine}`, 0.5]], margin),
  ];
}

/** Probability of winning one game/map that gives a best-of-n series win probability P. */
export function gameProb(P: number, n: number): number {
  let lo = 0.01, hi = 0.99;
  for (let i = 0; i < 40; i++) { const q = (lo + hi) / 2; if (seriesDist(q, n).reduce((s, d) => s + (d.h > d.a ? d.p : 0), 0) < P) lo = q; else hi = q; }
  return (lo + hi) / 2;
}
export function seriesDist(q: number, n: number): { h: number; a: number; p: number }[] {
  const need = Math.ceil(n / 2), out: { h: number; a: number; p: number }[] = [];
  const C = (a: number, b: number) => { let r = 1; for (let i = 1; i <= b; i++) r = (r * (a - b + i)) / i; return r; };
  for (let l = 0; l < need; l++) { out.push({ h: need, a: l, p: C(need - 1 + l, l) * q ** need * (1 - q) ** l }); out.push({ h: l, a: need, p: C(need - 1 + l, l) * (1 - q) ** need * q ** l }); }
  return out;
}
export function bestOfMarkets(ph: number, n: number, unit: string, margin = MARGIN): Market[] {
  const P = ph / 100, q = gameProb(P, n), d = seriesDist(q, n), need = Math.ceil(n / 2);
  const line = need - 0.5 + (n === 3 ? 0 : 0.0), tl = n === 3 ? 2.5 : 3.5;
  const over = d.filter((x) => x.h + x.a > tl).reduce((s, x) => s + x.p, 0);
  const cover = d.filter((x) => x.h - 1.5 > x.a).reduce((s, x) => s + x.p, 0);
  void line;
  return [
    mk("ml", "Match winner", [["h", "Home", P], ["a", "Away", 1 - P]], margin),
    mk(`tot_${tl}`, `Total ${unit} ${tl}`, [["over", `Over ${tl}`, over], ["under", `Under ${tl}`, 1 - over]], margin),
    mk("hcp_-1.5", `Home handicap -1.5 ${unit}`, [["h", "Home (-1.5)", cover], ["a", "Away (+1.5)", 1 - cover]], margin),
  ];
}
export function mmaMarkets(ph: number, margin = MARGIN): Market[] {
  const P = ph / 100;
  return [
    mk("ml", "Fight winner", [["h", "Fighter 1", P], ["a", "Fighter 2", 1 - P]], margin),
    mk("dist", "Fight goes the distance", [["yes", "Yes", 0.46], ["no", "No", 0.54]], margin),
  ];
}

export function marketsFor(sport: Sport, p: [number, number, number], league = "", margin = MARGIN): Market[] {
  switch (sport) {
    case "football": return footballMarkets(p[0], p[1], p[2], margin);
    case "hockey": return hockeyMarkets(p[0], margin);
    case "basketball": return league.startsWith("NCAA") ? basketballMarkets(p[0], margin, 11, 141.5) : basketballMarkets(p[0], margin);
    case "americanfootball": return basketballMarkets(p[0], margin, 13.5, 45.5).map((m) => (m.key.startsWith("tot_") ? { ...m, title: m.title.replace("points", "points") } : m));
    case "tennis": return bestOfMarkets(p[0], 3, "sets", margin);
    case "esports": return bestOfMarkets(p[0], 3, "maps", margin);
    case "tabletennis": return bestOfMarkets(p[0], 5, "games", margin);
    case "volleyball": return bestOfMarkets(p[0], 5, "sets", margin);
    case "mma": return mmaMarkets(p[0], margin);
  }
}

/** Live football odds from score and minute (Poisson on the remaining time). */
export function liveFootball(lh: number, la: number, minute: number, gh: number, ga: number): Market[] {
  const rem = Math.max(0.02, (90 - minute) / 90);
  const g = scoreGrid(lh * rem, la * rem);
  let h = 0, d = 0, a = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const dh = gh + i, da = ga + j; if (dh > da) h += g[i][j]; else if (dh === da) d += g[i][j]; else a += g[i][j]; }
  const m: Market[] = [mk("1x2", "Match result", [["1", "Home", h], ["X", "Draw", d], ["2", "Away", a]], 0.08)];
  const lines = [gh + ga + 0.5, gh + ga + 1.5];
  for (const line of lines) {
    let o = 0; for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (gh + ga + i + j > line) o += g[i][j];
    m.push(mk(`tot_${line}`, `Total goals ${line}`, [["over", `Over ${line}`, o], ["under", `Under ${line}`, 1 - o]], 0.08));
  }
  return m;
}

/** True if the outcome won, given the final score. Lines come from the market key. */
export function evalOutcome(marketKey: string, outKey: string, h: number, a: number, x = 0): boolean {
  const line = parseFloat(marketKey.split("_")[1] ?? "0");
  if (marketKey === "1x2") return outKey === (h > a ? "1" : h === a ? "X" : "2");
  if (marketKey === "dc") return (outKey === "1X" && h >= a) || (outKey === "12" && h !== a) || (outKey === "X2" && a >= h);
  if (marketKey === "ml") return outKey === (h > a ? "h" : "a");
  if (marketKey === "dist") return (x === 1) === (outKey === "yes");
  if (marketKey === "btts") return (h > 0 && a > 0) === (outKey === "yes");
  if (marketKey.startsWith("tot_")) return outKey === "over" ? h + a > line : h + a < line;
  if (marketKey.startsWith("hcp_")) return outKey === "h" ? h + line > a : h + line < a;
  return false;
}
