"use client";
import { useSyncExternalStore } from "react";
import { evalOutcome } from "./odds";
import { findEvent, resultOf } from "./events";
import type { Bet, Ev, Leg, Limits, Profile, Settings, Tx } from "./types";

export interface State {
  balance: number; slip: Leg[]; bets: Bet[]; mode: "single" | "express"; bonusAt: number;
  profile: Profile; settings: Settings; limits: Limits; tx: Tx[]; promos: string[];
}
const KEY = "playmaker.v2", START = 10000;
const rid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const fresh = (): State => ({
  balance: START, slip: [], bets: [], mode: "single", bonusAt: 0,
  profile: { id: `PM-${rid()}${rid().slice(0, 2)}`, nick: "Player", avatar: "🦊", createdAt: Date.now() },
  settings: { odds: "decimal", notifyResults: true, notifyBonus: true, reality: 0 },
  limits: { maxStake: 0, dailyLoss: 0, excludeUntil: 0 },
  tx: [{ id: "t0", at: Date.now(), type: "bonus", amount: START, note: "Welcome balance" }], promos: [],
});
const initial: State = { ...fresh(), profile: { id: "PM-••••••", nick: "Player", avatar: "🦊", createdAt: 0 }, tx: [] };
let state: State = initial;
const subs = new Set<() => void>();
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY); if (!raw) { state = fresh(); persist(); return; }
    const p = JSON.parse(raw), d = fresh();
    state = { ...d, ...p, profile: { ...d.profile, ...p.profile }, settings: { ...d.settings, ...p.settings }, limits: { ...d.limits, ...p.limits } };
  } catch { /* storage unavailable */ }
}
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }
function set(next: State) { state = next; persist(); subs.forEach((f) => f()); }
export function useStore(): State {
  return useSyncExternalStore(
    (cb) => { load(); subs.add(cb); const t = setTimeout(cb, 0); return () => { subs.delete(cb); clearTimeout(t); }; },
    () => { load(); return state; },
    () => initial,
  );
}
const tx = (type: Tx["type"], amount: number, note: string): Tx => ({ id: `${Date.now()}${rid()}`, at: Date.now(), type, amount, note });

// ---------- slip ----------
export function toggleLeg(ev: Ev, marketKey: string, outKey: string) {
  const m = ev.markets.find((x) => x.key === marketKey)!, o = m.outcomes.find((x) => x.key === outKey)!;
  const exists = state.slip.find((l) => l.eventId === ev.id && l.marketKey === marketKey && l.outKey === outKey);
  let slip = state.slip.filter((l) => !(l.eventId === ev.id && (state.mode === "express" || l.marketKey === marketKey)));
  if (!exists) slip = [...slip, { eventId: ev.id, title: `${ev.home} — ${ev.away}`, market: m.title, marketKey, outKey, label: o.label, odds: o.odds }];
  set({ ...state, slip });
}
export const removeLeg = (i: number) => set({ ...state, slip: state.slip.filter((_, n) => n !== i) });
export const clearSlip = () => set({ ...state, slip: [] });
const dedupe = (s: Leg[]) => s.filter((l, i) => s.findIndex((x) => x.eventId === l.eventId) === i);
export const setMode = (mode: State["mode"]) => set({ ...state, mode, slip: mode === "express" ? dedupe(state.slip) : state.slip });

// ---------- wallet ----------
export const bonusReady = (s: State) => Date.now() - s.bonusAt > 86400e3;
export const claimBonus = () => { if (bonusReady(state)) set({ ...state, balance: state.balance + 1000, bonusAt: Date.now(), tx: [tx("bonus", 1000, "Daily bonus"), ...state.tx] }); };
export const PROMOS: Record<string, [number, string]> = { WELCOME: [2000, "Welcome promo"], PLAYMAKER: [500, "Playmaker promo"], DERBY: [1500, "Derby weekend"], LIVE: [750, "Live betting promo"] };
export function redeemPromo(code: string): string | null {
  const c = code.trim().toUpperCase(), p = PROMOS[c];
  if (!c) return "Enter a promo code";
  if (!p) return "Unknown promo code";
  if (state.promos.includes(c)) return "This code was already used";
  set({ ...state, balance: state.balance + p[0], promos: [...state.promos, c], tx: [tx("promo", p[0], `${p[1]} (${c})`), ...state.tx] });
  return null;
}
export function resetAccount() { const d = fresh(); set({ ...d, profile: { ...d.profile, nick: state.profile.nick, avatar: state.profile.avatar }, settings: state.settings }); }

// ---------- profile / settings / limits ----------
export const setProfile = (p: Partial<Profile>) => set({ ...state, profile: { ...state.profile, ...p } });
export const setSettings = (p: Partial<Settings>) => set({ ...state, settings: { ...state.settings, ...p } });
export const excludeFor = (days: number) => set({ ...state, limits: { ...state.limits, excludeUntil: Date.now() + days * 86400e3 } });
export const setLimits = (p: Partial<Limits>) => set({ ...state, limits: { ...state.limits, ...p } });

// ---------- bets ----------
export const MIN_STAKE = 10;
const startOfDay = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const lossToday = (s: State) => -s.tx.filter((t) => t.at >= startOfDay() && ["bet", "win", "cashout"].includes(t.type)).reduce((a, t) => a + t.amount, 0);

export function placeBet(stakes: number[]): string | null {
  const legs = state.slip; if (!legs.length) return "Bet slip is empty";
  if (state.limits.excludeUntil > Date.now()) return `Self-exclusion is active until ${new Date(state.limits.excludeUntil).toLocaleString("en-GB")}`;
  const singles = state.mode === "single" || legs.length === 1;
  const need = singles ? legs.length : 1;
  if (stakes.length < need || stakes.slice(0, need).some((s) => !(s >= MIN_STAKE))) return `Minimum stake is ${MIN_STAKE} coins`;
  const used = stakes.slice(0, need), total = used.reduce((a, b) => a + b, 0);
  if (state.limits.maxStake > 0 && used.some((s) => s > state.limits.maxStake)) return `Your max stake limit is ${state.limits.maxStake} coins`;
  if (state.limits.dailyLoss > 0 && lossToday(state) + total > state.limits.dailyLoss) return "This bet would exceed your daily loss limit";
  if (total > state.balance) return "Not enough coins";
  const now = Date.now(), bets: Bet[] = singles
    ? legs.map((l, i) => ({ id: `${now}-${i}`, at: now, mode: "single" as const, stake: used[i], legs: [l], odds: l.odds, status: "pending" as const, payout: 0, legStatus: {} }))
    : [{ id: `${now}`, at: now, mode: "express" as const, stake: used[0], legs, odds: Math.round(legs.reduce((p, l) => p * l.odds, 1) * 100) / 100, status: "pending" as const, payout: 0, legStatus: {} }];
  set({ ...state, balance: state.balance - total, bets: [...bets, ...state.bets], slip: [], tx: [...bets.map((b) => tx("bet", -b.stake, b.mode === "express" ? `Parlay ×${b.legs.length}` : b.legs[0].title)), ...state.tx] });
  return null;
}

const legKey = (l: Leg) => l.eventId + l.marketKey + l.outKey;
/** Current odds of a leg, or null if the market is unavailable. */
function currentOdds(l: Leg, now: number): number | null {
  const ev = findEvent(l.eventId, now); const o = ev?.markets.find((m) => m.key === l.marketKey)?.outcomes.find((x) => x.key === l.outKey);
  return o && o.odds < 60 ? o.odds : null;
}
/** Cash-out offer for an open bet (5% house cut), or null when not available. */
export function cashoutValue(b: Bet, now = Date.now()): number | null {
  if (b.status !== "pending") return null;
  let f = 0.95;
  for (const l of b.legs) {
    if (b.legStatus[legKey(l)] === "won") continue;
    const ev = findEvent(l.eventId, now); if (!ev || (!ev.live && ev.start <= now)) return null;
    const c = currentOdds(l, now); if (!c) return null; f *= l.odds / c;
  }
  const v = Math.floor(b.stake * f);
  return v >= 1 ? v : null;
}
export function cashOut(id: string): string | null {
  const b = state.bets.find((x) => x.id === id); if (!b) return "Bet not found";
  const v = cashoutValue(b); if (v === null) return "Cash out is not available for this bet";
  set({ ...state, balance: state.balance + v, bets: state.bets.map((x) => (x.id === id ? { ...x, status: v >= x.stake ? "won" : "lost", payout: v, cashedOut: true } : x)), tx: [tx("cashout", v, `Cash out · ${b.legs.length > 1 ? `Parlay ×${b.legs.length}` : b.legs[0].title}`), ...state.tx] });
  return null;
}

/** Settles bets whose events have finished. */
export function settle(now = Date.now()) {
  let changed = false, balance = state.balance; const newTx: Tx[] = [];
  const bets = state.bets.map((b) => {
    if (b.status !== "pending") return b;
    const legStatus = { ...b.legStatus };
    for (const l of b.legs) {
      const k = legKey(l); if (legStatus[k]) continue;
      const ev = findEvent(l.eventId, now); if (!ev) continue;
      const r = resultOf(ev, now); if (!r) continue;
      legStatus[k] = evalOutcome(l.marketKey, l.outKey, r.h, r.a, r.x) ? "won" : "lost";
    }
    const vals = b.legs.map((l) => legStatus[legKey(l)]);
    const lost = vals.includes("lost"), won = vals.every((v) => v === "won");
    if (!lost && !won && JSON.stringify(legStatus) === JSON.stringify(b.legStatus)) return b;
    changed = true;
    if (lost) return { ...b, legStatus, status: "lost" as const };
    if (won) { const payout = Math.floor(b.stake * b.odds); balance += payout; newTx.push(tx("win", payout, b.legs.length > 1 ? `Parlay ×${b.legs.length} won` : `${b.legs[0].title} won`)); return { ...b, legStatus, status: "won" as const, payout }; }
    return { ...b, legStatus };
  });
  if (changed) set({ ...state, bets, balance, tx: [...newTx, ...state.tx] });
}

// ---------- stats ----------
export interface Stats { total: number; settled: number; won: number; staked: number; profit: number; roi: number; winRate: number; best: number; streak: number; avgOdds: number; series: number[] }
export function statsOf(bets: Bet[]): Stats {
  const done = bets.filter((b) => b.status !== "pending").sort((a, b) => a.at - b.at);
  const won = done.filter((b) => b.status === "won" && b.payout > b.stake || (b.status === "won" && !b.cashedOut));
  const staked = done.reduce((s, b) => s + b.stake, 0);
  let cum = 0, streak = 0, run = 0; const series = [0];
  for (const b of done) { cum += b.payout - b.stake; series.push(cum); run = b.payout > b.stake ? run + 1 : 0; streak = Math.max(streak, run); }
  return {
    total: bets.length, settled: done.length, won: won.length, staked, profit: cum, roi: staked ? (cum / staked) * 100 : 0,
    winRate: done.length ? (won.length / done.length) * 100 : 0, best: Math.max(0, ...done.map((b) => b.payout - b.stake)), streak,
    avgOdds: bets.length ? bets.reduce((s, b) => s + b.odds, 0) / bets.length : 0, series,
  };
}
export const TIERS = [["Bronze", 0], ["Silver", 5000], ["Gold", 25000], ["Platinum", 100000], ["Diamond", 500000]] as const;
export function tierOf(totalStaked: number) {
  let i = 0; TIERS.forEach((t, n) => { if (totalStaked >= t[1]) i = n; });
  const next = TIERS[i + 1];
  return { name: TIERS[i][0], index: i, next: next?.[0] ?? null, progress: next ? (totalStaked - TIERS[i][1]) / (next[1] - TIERS[i][1]) : 1, need: next ? next[1] - totalStaked : 0 };
}
