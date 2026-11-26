"use client";
import { useSyncExternalStore } from "react";
import type { Sport } from "./types";

/** Real fixtures, live scores and results from ESPN's public scoreboard (fetched in the browser). */
export interface FeedEv { id: string; sport: Sport; league: string; home: string; away: string; start: number; state: "pre" | "in" | "post"; clock: string; minute: number; hs: number; as: number; done: boolean; off: boolean; p: [number, number, number] }

const SRC: [Sport, string, string][] = [
  ["football", "soccer/eng.1", "Premier League"], ["football", "soccer/esp.1", "La Liga"], ["football", "soccer/ita.1", "Serie A"], ["football", "soccer/ger.1", "Bundesliga"],
  ["football", "soccer/fra.1", "Ligue 1"], ["football", "soccer/uefa.champions", "Champions League"], ["football", "soccer/uefa.europa", "Europa League"],
  ["football", "soccer/eng.2", "Championship"], ["football", "soccer/ned.1", "Eredivisie"], ["football", "soccer/por.1", "Primeira Liga"],
  ["basketball", "basketball/nba", "NBA"], ["basketball", "basketball/mens-college-basketball", "NCAA Basketball"],
  ["hockey", "hockey/nhl", "NHL"], ["americanfootball", "football/nfl", "NFL"],
];
const KEY = "playmaker.feed", BASE = "https://site.api.espn.com/apis/site/v2/sports/", DAY = 86400e3;
const cache = new Map<string, FeedEv>();
const subs = new Set<() => void>();
let version = 0, loaded = false, started = false;

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
function parse(x: any, sport: Sport, league: string): FeedEv | null {
  try {
    const c = x.competitions?.[0], home = c.competitors.find((t: any) => t.homeAway === "home"), away = c.competitors.find((t: any) => t.homeAway === "away");
    if (!home || !away) return null;
    const st = x.status?.type ?? {}, name = String(st.name ?? ""), o = c.odds?.[0];
    let p: [number, number, number] = sport === "football" ? [40, 27, 33] : [52, 0, 48];
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
async function load(offset: number) {
  const d = new Date(Date.now() + offset * DAY), ds = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
  let any = false;
  await Promise.all(SRC.map(async ([sport, path, league]) => {
    try {
      const r = await fetch(`${BASE}${path}/scoreboard?dates=${ds}&limit=200`); if (!r.ok) return;
      const j = await r.json();
      for (const x of j.events ?? []) { const f = parse(x, sport, league); if (f) { cache.set(f.id, f); any = true; } }
    } catch { /* offline or blocked: keep what we have */ }
  }));
  if (any) bump();
}
/** Starts polling once: live scores often, other days rarely. */
export function startFeed() {
  if (started || typeof window === "undefined") return; started = true; ensure();
  const fast = () => {
    const midnight = Math.floor(Date.now() / DAY) * DAY;
    const prev = [...cache.values()].some((f) => f.state === "in" && f.start < midnight);
    void load(0); if (prev) void load(-1);
  };
  const slow = () => { for (const o of [-1, 1, 2, 3]) void load(o); };
  slow(); fast();
  setInterval(fast, 40e3); setInterval(slow, 10 * 60e3);
}
