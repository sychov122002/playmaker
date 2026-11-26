import { RAW_EVENTS } from "@/data/snapshot";
import { fitLambdas, gameProb, invCdf, liveFootball, marketsFor } from "./odds";
import { hash, mulberry32, poissonSample } from "./rng";
import type { Ev, Market, RawEvent, Result, Sport } from "./types";

export const MATCH_MS: Record<Sport, number> = { football: 115 * 60e3, hockey: 160 * 60e3, basketball: 150 * 60e3, americanfootball: 215 * 60e3, tennis: 150 * 60e3, esports: 120 * 60e3, tabletennis: 50 * 60e3, volleyball: 120 * 60e3, mma: 40 * 60e3 };
const DAY = 86400e3;

function defaultP(r: RawEvent): [number, number, number] {
  if (r.p) return r.p;
  const x = (hash(r.home + r.away) % 1000) / 1000; // no market estimate: a modest derived one
  const ph = 42 + x * 22; return [ph, 0, 100 - ph];
}
function build(r: RawEvent, id: string, virtual = false): Ev {
  const p = defaultP(r);
  return { id, sport: r.sport, league: r.league, home: r.home, away: r.away, start: Date.parse(r.start), p, markets: marketsFor(r.sport, p, r.league), virtual };
}
const real: Ev[] = RAW_EVENTS.map((r, i) => build(r, `e${i}`));

/** If the fixture snapshot gets stale, the lines are topped up with virtual rounds of the same clubs. */
function virtualEvents(now: number): Ev[] {
  const out: Ev[] = [];
  const byLeague = new Map<string, { sport: Sport; teams: string[] }>();
  for (const r of RAW_EVENTS) {
    if (r.league === "Champions League") continue;
    const e = byLeague.get(r.league) ?? { sport: r.sport, teams: [] };
    for (const t of [r.home, r.away]) if (!e.teams.includes(t)) e.teams.push(t);
    byLeague.set(r.league, e);
  }
  const day0 = Math.floor(now / DAY);
  for (let d = 0; d < 4; d++) {
    for (const [league, { sport, teams }] of byLeague) {
      const rnd = mulberry32(hash(`${league}${day0 + d}`));
      const pool = [...teams].sort(() => rnd() - 0.5);
      const n = sport === "football" ? 3 : 4;
      for (let k = 0; k < n && pool.length >= 2; k++) {
        const home = pool.pop()!, away = pool.pop()!;
        const ph = 30 + rnd() * 40, pd = sport === "football" ? 20 + rnd() * 10 : 0;
        const slot = [13, 15.5, 17.5, 19.75][k % 4];
        const start = (day0 + d) * DAY + slot * 3600e3;
        if (start < now) continue;
        const raw: RawEvent = { sport, league, home, away, start: new Date(start).toISOString(), p: sport === "football" ? [ph, pd, 100 - ph - pd] : [ph, 0, 100 - ph] };
        out.push(build(raw, `v${day0 + d}-${hash(league + k)}`, true));
      }
    }
  }
  return out;
}

const FIRST = ["Alex", "Marco", "Ilya", "Jon", "Leo", "Nico", "Pavel", "Sven", "Tomas", "Viktor", "Yuri", "Dario", "Emil", "Felix", "Hugo", "Ivo"];
const LAST = ["Brandt", "Castell", "Dorn", "Eklund", "Falk", "Garrow", "Holm", "Ibarra", "Jansen", "Kovac", "Lund", "Moreau", "Novak", "Orsini", "Petrov", "Quade", "Roth", "Stenn", "Torres", "Varga"];
const ADJ = ["Nova", "Iron", "Neon", "Apex", "Lunar", "Rapid", "Silent", "Crimson", "Arctic", "Solar", "Phantom", "Titan"];
const NOUN = ["Five", "Wolves", "Vipers", "Gaming", "Esports", "Squad", "Legion", "Pulse", "Hawks", "Storm"];
const VSPORTS: { sport: Sport; league: string; kind: "p" | "t"; n: number; fixed?: number }[] = [
  { sport: "tennis", league: "Virtual Tennis Open", kind: "p", n: 8 },
  { sport: "tennis", league: "Virtual Tennis Challenger", kind: "p", n: 6 },
  { sport: "esports", league: "Virtual CS Major", kind: "t", n: 6 },
  { sport: "esports", league: "Virtual Dota Series", kind: "t", n: 4 },
  { sport: "tabletennis", league: "Virtual Table Tennis Cup", kind: "p", n: 10 },
  { sport: "volleyball", league: "Virtual Volleyball League", kind: "t", n: 5 },
  { sport: "mma", league: "Virtual Fight Night", kind: "p", n: 6 },
];
function virtualSports(now: number): Ev[] {
  const out: Ev[] = [], day0 = Math.floor(now / DAY);
  for (let d = 0; d < 3; d++) for (const v of VSPORTS) {
    const rnd = mulberry32(hash(`${v.league}${day0 + d}`));
    const name = () => (v.kind === "p" ? `${FIRST[Math.floor(rnd() * FIRST.length)]} ${LAST[Math.floor(rnd() * LAST.length)]}` : `${ADJ[Math.floor(rnd() * ADJ.length)]} ${NOUN[Math.floor(rnd() * NOUN.length)]}`);
    for (let k = 0; k < v.n; k++) {
      const home = name(); let away = name(); if (away === home) away += " II";
      const start = (day0 + d) * DAY + (9 + k * (v.sport === "tabletennis" ? 0.9 : 1.4)) * 3600e3;
      if (start < now - 5 * 60e3) continue;
      const ph = 22 + rnd() * 56;
      out.push(build({ sport: v.sport, league: v.league, home, away, start: new Date(start).toISOString(), p: [ph, 0, 100 - ph] }, `x${day0 + d}-${hash(v.league + k)}`, true));
    }
  }
  return out;
}

export function upcoming(now: number): Ev[] {
  const list = real.filter((e) => e.start > now - 5 * 60e3);
  const extra = list.length < 40 ? virtualEvents(now) : [];
  return [...list, ...extra, ...virtualSports(now)].sort((a, b) => a.start - b.start);
}
export function allEvents(now: number): Ev[] { return [...real, ...virtualEvents(now)]; }
export function findEvent(id: string, now: number): Ev | undefined {
  if (id.startsWith("L")) return liveMatch(id, now)?.ev;
  const r = real.find((e) => e.id === id);
  if (r) return r;
  if (id.startsWith("v")) return virtualEvents(Number(id.slice(1, id.indexOf("-"))) * DAY).find((e) => e.id === id);
  if (id.startsWith("x")) return virtualSports(Number(id.slice(1, id.indexOf("-"))) * DAY).find((e) => e.id === id);
  return undefined;
}

/** Match result: deterministic simulation from market probabilities. */
export function simulate(e: Ev): Result {
  const rnd = mulberry32(hash(e.id + e.home + e.away));
  if (e.sport === "football") {
    const [lh, la] = fitLambdas(e.p[0], e.p[1], e.p[2]);
    return { h: poissonSample(lh, rnd), a: poissonSample(la, rnd) };
  }
  const p = e.p[0] / 100;
  if (e.sport === "tennis" || e.sport === "esports" || e.sport === "tabletennis" || e.sport === "volleyball") {
    const n = e.sport === "tennis" || e.sport === "esports" ? 3 : 5, q = gameProb(e.p[0] / 100, n), need = Math.ceil(n / 2);
    let h = 0, a = 0; while (h < need && a < need) { if (rnd() < q) h++; else a++; } return { h, a };
  }
  if (e.sport === "mma") { const w = rnd() < p; return { h: w ? 1 : 0, a: w ? 0 : 1, x: rnd() < 0.46 ? 1 : 0 }; }
  if (e.sport === "hockey") {
    const tot = 6, lh = tot * (0.5 + (p - 0.5) * 0.55);
    let h = poissonSample(lh, rnd), a = poissonSample(tot - lh, rnd);
    if (h === a) { if (rnd() < p) h++; else a++; }
    return { h, a };
  }
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
  const ncaa = e.league.startsWith("NCAA"), nfl = e.sport === "americanfootball";
  const sg = nfl ? 13.5 : ncaa ? 11 : 12.5, tm = nfl ? 45.5 : ncaa ? 141.5 : 226.5;
  const d = (invCdf(p) + gauss()) * sg, tot = tm + gauss() * tm * 0.06;
  const h = Math.round((tot + d) / 2), a = Math.round((tot - d) / 2);
  return h === a ? { h: h + 1, a } : { h, a };
}

export function resultOf(e: Ev, now: number): Result | null {
  if (e.live) { const m = liveMatch(e.id, now); return m && m.done ? m.res : null; }
  return now >= e.start + MATCH_MS[e.sport] ? simulate(e) : null;
}

// ---------- Virtual live: 1 match minute = 2 seconds, around the clock ----------
export const LIVE_TICK = 2000, LIVE_SLOT = 200e3, LIVE_MATCH_MIN = 90;
const CLUBS = ["Arsenal", "Manchester City", "Liverpool", "Chelsea", "Real Madrid", "Barcelona", "Atlético Madrid", "Bayern Munich", "Dortmund", "Inter", "AC Milan", "Juventus", "Napoli", "PSG", "Leverkusen", "Roma"];

export interface LiveMatch { ev: Ev; minute: number; gh: number; ga: number; done: boolean; res: Result; lh: number; la: number; goals: { t: number; side: "h" | "a" }[] }
export function liveMatch(id: string, now: number): LiveMatch | null {
  const m = /^L(\d+)-(\d)$/.exec(id); if (!m) return null;
  const slot = Number(m[1]), n = Number(m[2]), start = slot * LIVE_SLOT;
  const pr = mulberry32(hash(`pool${slot}`));
  const pool = [...CLUBS].sort(() => pr() - 0.5);
  const rnd = mulberry32(hash(`live${slot}-${n}`));
  const home = pool[n * 2], away = pool[n * 2 + 1];
  const ph = 25 + rnd() * 45, pd = 18 + rnd() * 10, p: [number, number, number] = [ph, pd, 100 - ph - pd];
  const [lh, la] = fitLambdas(p[0], p[1], p[2]);
  const goals: LiveMatch["goals"] = [];
  for (const [side, l] of [["h", lh], ["a", la]] as const) { const c = poissonSample(l, rnd); for (let i = 0; i < c; i++) goals.push({ t: 1 + Math.floor(rnd() * 89), side }); }
  goals.sort((x, y) => x.t - y.t);
  const minute = Math.min(LIVE_MATCH_MIN, Math.max(0, Math.floor((now - start) / LIVE_TICK)));
  const at = goals.filter((g) => g.t <= minute);
  const gh = at.filter((g) => g.side === "h").length, ga = at.length - gh;
  const res = { h: goals.filter((g) => g.side === "h").length, a: goals.filter((g) => g.side === "a").length };
  const done = minute >= LIVE_MATCH_MIN;
  const markets: Market[] = liveFootball(lh, la, minute, gh, ga);
  const ev: Ev = { id, sport: "football", league: "Virtual Football", home, away, start, p, markets, virtual: true, live: true };
  return { ev, minute, gh, ga, done, res, lh, la, goals };
}
/** Matches of the current slot. */
export function liveNow(now: number): LiveMatch[] {
  const slot = Math.floor(now / LIVE_SLOT);
  return [0, 1, 2, 3].map((n) => liveMatch(`L${slot}-${n}`, now)!);
}
