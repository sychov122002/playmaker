"use client";
import { useSyncExternalStore } from "react";
import type { Sport } from "./types";

/** Real fixtures, live scores and results from ESPN's public scoreboard (fetched in the browser). */
export interface FeedEv { id: string; sport: Sport; league: string; home: string; away: string; start: number; state: "pre" | "in" | "post"; clock: string; minute: number; hs: number; as: number; done: boolean; off: boolean; p: [number, number, number] }

const SOC = (path: string, name: string): [Sport, string, string] => ["football", `soccer/${path}`, name];
const SRC: [Sport, string, string][] = [
  SOC("eng.1", "Premier League"), SOC("esp.1", "La Liga"), SOC("ita.1", "Serie A"), SOC("ger.1", "Bundesliga"), SOC("fra.1", "Ligue 1"),
  SOC("uefa.champions", "Champions League"), SOC("uefa.europa", "Europa League"), SOC("uefa.europa.conf", "Conference League"),
  SOC("eng.2", "Championship"), SOC("eng.3", "League One"), SOC("eng.fa", "FA Cup"), SOC("eng.league_cup", "League Cup"), SOC("esp.2", "Segunda División"), SOC("ger.2", "2. Bundesliga"),
  SOC("ita.2", "Serie B"), SOC("fra.2", "Ligue 2"), SOC("ned.1", "Eredivisie"), SOC("por.1", "Primeira Liga"), SOC("tur.1", "Süper Lig"), SOC("sco.1", "Scottish Premiership"),
  SOC("bel.1", "Belgian Pro League"), SOC("usa.1", "MLS"), SOC("mex.1", "Liga MX"), SOC("bra.1", "Brasileirão"), SOC("arg.1", "Argentine Primera"),
  SOC("conmebol.libertadores", "Copa Libertadores"), SOC("aus.1", "A-League"), SOC("jpn.1", "J1 League"), SOC("esp.copa_del_rey", "Copa del Rey"), SOC("ger.dfb_pokal", "DFB-Pokal"),
  SOC("ita.coppa_italia", "Coppa Italia"), SOC("fra.coupe_de_france", "Coupe de France"), SOC("fifa.world", "World Cup"), SOC("uefa.nations", "Nations League"),
  ["basketball", "basketball/nba", "NBA"], ["basketball", "basketball/mens-college-basketball", "NCAA Basketball"], ["basketball", "basketball/wnba", "WNBA"],
  ["hockey", "hockey/nhl", "NHL"], ["americanfootball", "football/nfl", "NFL"], ["americanfootball", "football/college-football", "NCAA Football"],
  ["tennis", "tennis/atp", "ATP"], ["tennis", "tennis/wta", "WTA"], ["mma", "mma/ufc", "UFC"], ["volleyball", "volleyball/womens-college-volleyball", "NCAA Volleyball"],
];
const KEY = "playmaker.feed", BASE = "https://site.api.espn.com/apis/site/v2/sports/", DAY = 86400e3;
const cache = new Map<string, FeedEv>();
const subs = new Set<() => void>();
let version = 0, loaded = false, started = false, status: "loading" | "ok" | "offline" = "loading";
export const feedStatus = () => status;

function ensure() {
  if (loaded || typeof window === "undefined") return; loaded = true;
  try { for (const f of JSON.parse(localStorage.getItem(KEY) ?? "[]") as FeedEv[]) cache.set(f.id, f); } catch { /* ignore */ }
}
function bump() {
  version++;
  try { const cut = Date.now() - 4 * DAY; localStorage.setItem(KEY, JSON.stringify([...cache.values()].filter((f) => f.start > cut).slice(-700))); } catch { /* ignore */ }
  subs.forEach((s) => s());
}
export const feedAll = (): FeedEv[] => { ensure(); return [...cache.values()]; };
export const feedGet = (id: string): FeedEv | undefined => { ensure(); return cache.get(id); };
export function useFeedVersion() {
  return useSyncExternalStore((cb) => { ensure(); subs.add(cb); return () => { subs.delete(cb); }; }, () => version, () => 0);
}

const prob = (s: unknown) => { const n = parseFloat(String(s ?? "")); if (!isFinite(n) || !n) return null; return n > 0 ? 100 / (n + 100) : -n / (-n + 100); };
/* eslint-disable @typescript-eslint/no-explicit-any */
const sig = (x: number) => 1 / (1 + Math.exp(-x));
const rec = (t: any): number[] | null => { const sm = t.records?.find((r: any) => r.type === "total")?.summary ?? t.records?.[0]?.summary; const n = String(sm ?? "").split("-").map(Number); return n.length >= 2 && n.every((v) => isFinite(v)) && n.reduce((a, b) => a + b, 0) >= 3 ? n : null; };
/** Without market odds, strength is estimated from the season record of both teams. */
function fromRecords(sport: Sport, h: any, a: any): [number, number, number] {
  const rh = rec(h), ra = rec(a);
  if (sport === "football") {
    if (!rh || !ra || rh.length < 3 || ra.length < 3) return [40, 27, 33];
    const ppg = (r: number[]) => (3 * r[0] + r[1]) / (r[0] + r[1] + r[2]), d = ppg(rh) - ppg(ra);
    const pd = Math.min(30, Math.max(16, 27 - 4 * Math.abs(d))), ph = (100 - pd) * sig(0.9 * d + 0.3);
    return [ph, pd, 100 - pd - ph];
  }
  if (sport === "tennis" || sport === "mma" || sport === "volleyball") return [50, 0, 50];
  if (!rh || !ra) return [52, 0, 48];
  const wp = (r: number[]) => r[0] / (r[0] + r[1] + (r[2] ?? 0)), ph = 100 * sig(3.2 * (wp(rh) - wp(ra)) + 0.2);
  return [ph, 0, 100 - ph];
}
const mapState = (st: any) => ({ state: (st?.state === "in" ? "in" : st?.state === "post" ? "post" : "pre") as FeedEv["state"], name: String(st?.name ?? "") });
/** Tennis and MMA: one scoreboard event holds many matches/fights. */
function parseMulti(x: any, sport: Sport, league: string): FeedEv[] {
  const comps: any[] = (x.groupings ?? []).filter((g: any) => !/doubles/i.test(g.grouping?.displayName ?? "")).flatMap((g: any) => g.competitions ?? []).concat(x.competitions ?? []);
  const out: FeedEv[] = [];
  for (const c of comps) {
    try {
      const cs: any[] = c.competitors ?? []; if (cs.length !== 2) continue;
      const home = cs.find((t) => t.order === 1 || t.homeAway === "home") ?? cs[0], away = cs.find((t) => t !== home)!;
      const nm = (t: any) => t.athlete?.displayName ?? t.team?.displayName; if (!nm(home) || !nm(away) || /TBD|TBA/i.test(nm(home) + nm(away))) continue;
      const { state, name } = mapState(c.status?.type), ls = (t: any): number[] => (t.linescores ?? []).map((l: any) => Number(l.value) || 0);
      let hs = 0, as = 0;
      if (sport === "tennis") { const a = ls(home), b = ls(away); a.forEach((v, i) => { if (v > (b[i] ?? 0)) hs++; else if (v < (b[i] ?? 0)) as++; }); }
      const done = state === "post" && /FINAL|FULL|COMPLETE/.test(name) && !!(home.winner || away.winner);
      if (done) { if (sport === "mma") { hs = home.winner ? 1 : 0; as = away.winner ? 1 : 0; } else if (home.winner && hs <= as) hs = as + 1; else if (away.winner && as <= hs) as = hs + 1; }
      out.push({ id: `R${c.id}`, sport, league: sport === "tennis" ? `${league}: ${x.name ?? ""}`.trim() : (x.name ?? league), home: nm(home), away: nm(away), start: Date.parse(c.date ?? c.startDate ?? x.date), state, clock: String(c.status?.type?.shortDetail ?? ""), minute: 0, hs, as, done, off: /POSTPONED|CANCEL|SUSPEND|DELAY|FORFEIT|WALKOVER|RETIRED/.test(name) && state !== "in", p: [50, 0, 50] });
    } catch { /* skip */ }
  }
  return out;
}
function parse(x: any, sport: Sport, league: string): FeedEv | null {
  try {
    const c = x.competitions?.[0], home = c.competitors.find((t: any) => t.homeAway === "home"), away = c.competitors.find((t: any) => t.homeAway === "away");
    if (!home || !away) return null;
    const st = x.status?.type ?? {}, name = String(st.name ?? ""), o = c.odds?.[0];
    let p = fromRecords(sport, home, away);
    const ph = prob(o?.moneyline?.home?.close?.odds), pa = prob(o?.moneyline?.away?.close?.odds), pd = sport === "football" ? prob(o?.drawOdds?.moneyLine) : 0;
    if (ph && pa && (sport !== "football" || pd)) { const t = ph + pa + (pd ?? 0); p = [(ph / t) * 100, ((pd ?? 0) / t) * 100, (pa / t) * 100]; }
    const clock = String(x.status?.displayClock ?? ""), mm = parseInt(clock) || 0, extra = /\+(\d+)/.exec(clock);
    const minute = name.includes("HALFTIME") ? 45 : Math.min(120, mm + (extra ? Number(extra[1]) : 0));
    return {
      id: `R${x.id}`, sport, league, home: home.team.displayName, away: away.team.displayName, start: Date.parse(x.date),
      state: st.state === "in" ? "in" : st.state === "post" ? "post" : "pre", clock: name.includes("HALFTIME") ? "HT" : clock, minute,
      hs: Number(home.score) || 0, as: Number(away.score) || 0, done: st.state === "post" && st.completed === true,
      off: /POSTPONED|CANCEL|SUSPEND|DELAY|FORFEIT/.test(name) && st.state !== "in", p,
    };
  } catch { return null; }
}
async function load(offset: number, only?: Set<string>) {
  const d = new Date(Date.now() + offset * DAY), ds = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  let any = false;
  await Promise.all(SRC.filter(([, path]) => !only || only.has(path)).map(async ([sport, path, league]) => {
    try {
      const r = await fetch(`${BASE}${path}/scoreboard?dates=${ds}&limit=200`); if (!r.ok) return;
      const j = await r.json();
      for (const x of j.events ?? []) {
        const fs = sport === "tennis" || sport === "mma" ? parseMulti(x, sport, league) : [parse(x, sport, league)];
        for (const f of fs) if (f) { cache.set(f.id, f); any = true; }
      }
    } catch { /* offline or blocked: keep what we have */ }
  }));
  if (any) bump();
}
/** Starts polling once: sources with games in play are refreshed often, the rest rarely. */
export function startFeed() {
  if (started || typeof window === "undefined") return; started = true; ensure();
  const finish = (p: Promise<void>) => p.then(() => { if (status === "loading") { status = cache.size ? "ok" : "offline"; bump(); } });
  const hot = () => {
    const now = Date.now(), set = new Set<string>();
    for (const f of cache.values()) if (f.state === "in" || (f.state === "pre" && f.start - now < 15 * 60e3 && f.start > now - 3 * 3600e3)) set.add(`${f.sport === "football" ? "soccer/" : ""}${f.league}`);
    return SRC.filter(([sp, , lg]) => set.has(`${sp === "football" ? "soccer/" : ""}${lg}`)).map(([, path]) => path);
  };
  const midnight = () => Math.floor(Date.now() / DAY) * DAY;
  const fast = () => { const only = new Set(hot()); if (!only.size) return; void load(0, only); if ([...cache.values()].some((f) => f.state === "in" && f.start < midnight())) void load(-1, only); };
  const day0 = () => void load(0), slow = () => { for (const o of [-1, 1, 2, 3]) void load(o); };
  finish((async () => { await load(0); await Promise.all([load(1), load(-1)]); })()); void load(2); void load(3);
  setInterval(fast, 40e3); setInterval(day0, 5 * 60e3); setInterval(slow, 20 * 60e3);
}
