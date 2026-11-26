"use client";
import { useSyncExternalStore } from "react";
import { evalOutcome } from "./odds";
import { findEvent, resultOf } from "./events";
import type { Bet, Ev, Leg, Limits, Msg, Profile, Settings, Tx } from "./types";

export interface State {
  balance: number; slip: Leg[]; bets: Bet[]; mode: "single" | "express"; bonusAt: number;
  profile: Profile; settings: Settings; limits: Limits; tx: Tx[]; promos: string[]; inbox: Msg[]; cashbackAt: number; favs: string[]; claimed: string[];
}
const KEY = "playmaker.v3", START = 10000;
const rid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const fresh = (): State => ({
  balance: START, slip: [], bets: [], mode: "single", bonusAt: 0,
  profile: { id: `PM-${rid()}${rid().slice(0, 2)}`, nick: "Player", avatar: "🦊", createdAt: Date.now(), fullName: "", email: "", phone: "", country: "", birth: "", adult: false },
  settings: { odds: "decimal", notifyResults: true, notifyBonus: true, reality: 0, theme: "dark", quickStakes: [100, 500, 1000], confirmBet: false, oddsChange: "any" },
  limits: { maxStake: 0, dailyLoss: 0, excludeUntil: 0 },
  tx: [{ id: "t0", at: Date.now(), type: "bonus", amount: START, note: "Welcome balance" }], promos: [], cashbackAt: 0, favs: [], claimed: [],
  inbox: [{ id: "m0", at: Date.now(), icon: "👋", title: "Welcome to Playmaker", body: "You have 10,000 virtual coins. Check Promotions for boosts and cashback.", read: false }],
});
const initial: State = { ...fresh(), profile: { id: "PM-••••••", nick: "Player", avatar: "🦊", createdAt: 0, fullName: "", email: "", phone: "", country: "", birth: "", adult: false }, tx: [], inbox: [] };
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
let t0: ReturnType<typeof setTimeout> | undefined;
function saveCurrentSoon() { clearTimeout(t0); t0 = setTimeout(() => saveCurrent(), 400); }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }
function set(next: State) { state = next; persist(); if (next.profile.registered) saveCurrentSoon(); subs.forEach((f) => f()); }
export function useStore(): State {
  return useSyncExternalStore(
    (cb) => { load(); subs.add(cb); const t = setTimeout(cb, 0); return () => { subs.delete(cb); clearTimeout(t); }; },
    () => { load(); return state; },
    () => initial,
  );
}
export const markAllRead = () => set({ ...state, inbox: state.inbox.map((m) => ({ ...m, read: true })) });
export const clearInbox = () => set({ ...state, inbox: [] });
const msg = (icon: string, title: string, body: string): Msg => ({ id: `${Date.now()}${rid()}`, at: Date.now(), icon, title, body, read: false });
export function remindBonus() { const id = `bonus-${new Date().toDateString()}`; if (state.settings.notifyBonus && bonusReady(state) && !state.inbox.some((m) => m.id === id)) set({ ...state, inbox: [{ ...msg("🎁", "Daily bonus is ready", "Claim your free 1,000 coins in Wallet."), id }, ...state.inbox] }); }
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

// ---------- cashback ----------
export const CASHBACK_RATE = 0.05;
export function cashbackInfo(s: State, now: number) {
  const since = Math.max(s.cashbackAt, now - 7 * 86400e3);
  const loss = -s.tx.filter((t) => t.at >= since && ["bet", "win", "cashout"].includes(t.type)).reduce((a, t) => a + t.amount, 0);
  const amount = Math.floor(Math.max(0, loss) * CASHBACK_RATE), nextAt = s.cashbackAt + 7 * 86400e3;
  return { loss: Math.max(0, loss), amount, ready: amount >= 1 && now >= nextAt, nextAt };
}
export function claimCashback() { const i = cashbackInfo(state, Date.now()); if (!i.ready) return; set({ ...state, balance: state.balance + i.amount, cashbackAt: Date.now(), tx: [tx("cashback", i.amount, "Weekly cashback 5%"), ...state.tx], inbox: [msg("💰", "Cashback received", `+${i.amount} coins`), ...state.inbox] }); }

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
  let legs = state.slip; if (!legs.length) return "Bet slip is empty";
  if (state.limits.excludeUntil > Date.now()) return `Self-exclusion is active until ${new Date(state.limits.excludeUntil).toLocaleString("en-GB")}`;
  const singles = state.mode === "single" || legs.length === 1;
  const need = singles ? legs.length : 1;
  if (stakes.length < need || stakes.slice(0, need).some((s) => !(s >= MIN_STAKE))) return `Minimum stake is ${MIN_STAKE} coins`;
  const used = stakes.slice(0, need), total = used.reduce((a, b) => a + b, 0);
  if (state.limits.maxStake > 0 && used.some((s) => s > state.limits.maxStake)) return `Your max stake limit is ${state.limits.maxStake} coins`;
  if (state.limits.dailyLoss > 0 && lossToday(state) + total > state.limits.dailyLoss) return "This bet would exceed your daily loss limit";
  if (total > state.balance) return "Not enough coins";
  // odds-change policy
  const nowT = Date.now(); let moved = false; const fixed = legs.map((l) => { const c = currentOdds(l, nowT); if (c === null) { moved = true; return l; } if (Math.abs(c - l.odds) < 0.005) return l; const worse = c < l.odds; if (state.settings.oddsChange === "never" || (state.settings.oddsChange === "higher" && worse)) moved = true; return { ...l, odds: c }; });
  if (moved || fixed.some((l, i) => l !== legs[i])) { set({ ...state, slip: fixed }); if (moved) return "Odds changed — please review your slip and confirm again"; legs = fixed; }
  const now = Date.now(), bets: Bet[] = singles
    ? legs.map((l, i) => ({ id: `${now}-${i}`, at: now, mode: "single" as const, stake: used[i], legs: [l], odds: l.odds, status: "pending" as const, payout: 0, legStatus: {} }))
    : [{ id: `${now}`, at: now, mode: "express" as const, boost: parlayBoost(legs), stake: used[0], legs, odds: Math.round(legs.reduce((p, l) => p * l.odds, 1) * 100) / 100, status: "pending" as const, payout: 0, legStatus: {} }];
  set({ ...state, balance: state.balance - total, bets: [...bets, ...state.bets], slip: [], tx: [...bets.map((b) => tx("bet", -b.stake, b.mode === "express" ? `Parlay ×${b.legs.length}` : b.legs[0].title)), ...state.tx] });
  return null;
}

/** Parlay boost: +5/10/15/25% to winnings for 3/4/5/6+ legs, each at odds of 1.20+. */
export function parlayBoost(legs: Leg[]): number { if (legs.length < 3 || legs.some((l) => l.odds < 1.2)) return 0; return legs.length >= 6 ? 0.25 : legs.length === 5 ? 0.15 : legs.length === 4 ? 0.1 : 0.05; }
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
  let changed = false, balance = state.balance; const newTx: Tx[] = [], newMsgs: Msg[] = [];
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
    if (lost) { if (state.settings.notifyResults) newMsgs.push(msg("📉", "Bet lost", b.legs.length > 1 ? `Parlay ×${b.legs.length}` : b.legs[0].title)); return { ...b, legStatus, status: "lost" as const }; }
    if (won) { const payout = Math.floor(b.stake * b.odds * (1 + (b.boost ?? 0))); balance += payout; newTx.push(tx("win", payout, b.legs.length > 1 ? `Parlay ×${b.legs.length} won` : `${b.legs[0].title} won`)); if (state.settings.notifyResults) newMsgs.push(msg("🏆", "Bet won", `${b.legs.length > 1 ? `Parlay ×${b.legs.length}` : b.legs[0].title}: +${payout} coins`)); return { ...b, legStatus, status: "won" as const, payout }; }
    return { ...b, legStatus };
  });
  if (changed) set({ ...state, bets, balance, tx: [...newTx, ...state.tx], inbox: [...newMsgs, ...state.inbox].slice(0, 80) });
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

export const toggleFav = (id: string) => set({ ...state, favs: state.favs.includes(id) ? state.favs.filter((x) => x !== id) : [...state.favs, id] });
/** Booking code: the slip serialised as text so it can be shared and loaded again. */
export const slipCode = (legs: Leg[]) => btoa(legs.map((l) => `${l.eventId}|${l.marketKey}|${l.outKey}`).join(";")).replace(/=+$/, "");
export function loadCode(code: string, now: number): string | null {
  let parts: string[][];
  try { parts = atob(code.trim()).split(";").map((x) => x.split("|")); } catch { return "Invalid code"; }
  let added = 0;
  for (const [id, mk, ok] of parts) {
    const ev = id && mk && ok ? findEvent(id, now) : null;
    if (ev && ev.markets.some((m) => m.key === mk && m.outcomes.some((o) => o.key === ok))) { if (!state.slip.some((l) => l.eventId === id && l.marketKey === mk && l.outKey === ok)) toggleLeg(ev, mk, ok); added++; }
  }
  return added ? null : "No matches from this code are available any more";
}

// ---------- challenges ----------
export interface Mission { id: string; title: string; hint: string; goal: number; reward: number; value: number; period: "daily" | "weekly" }
const startOfWeek = () => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d.getTime(); };
export const periodKey = (p: "daily" | "weekly") => (p === "daily" ? new Date(startOfDay()).toDateString() : new Date(startOfWeek()).toDateString());
export function missions(s: State): Mission[] {
  const d = s.bets.filter((b) => b.at >= startOfDay()), w = s.bets.filter((b) => b.at >= startOfWeek());
  const matches = (bs: Bet[]) => new Set(bs.flatMap((b) => b.legs.map((l) => l.eventId))).size;
  return [
    { id: "d-bets", title: "Place 3 bets", hint: "Any bets placed today", goal: 3, reward: 300, value: d.length, period: "daily" },
    { id: "d-win", title: "Win a bet", hint: "Settle at least one winning bet today", goal: 1, reward: 400, value: d.filter((b) => b.status === "won").length, period: "daily" },
    { id: "d-parlay", title: "Build a parlay of 3+ selections", hint: "Enjoy the parlay boost", goal: 1, reward: 350, value: d.filter((b) => b.mode === "express" && b.legs.length >= 3).length, period: "daily" },
    { id: "w-matches", title: "Bet on 10 different matches", hint: "Across the week", goal: 10, reward: 1200, value: matches(w), period: "weekly" },
    { id: "w-wins", title: "Win 5 bets", hint: "Across the week", goal: 5, reward: 1500, value: w.filter((b) => b.status === "won").length, period: "weekly" },
    { id: "w-staked", title: "Stake 5,000 coins", hint: "Total stake this week", goal: 5000, reward: 800, value: w.reduce((a, b) => a + b.stake, 0), period: "weekly" },
  ];
}
export const missionClaimed = (s: State, m: Mission) => s.claimed.includes(`${m.id}:${periodKey(m.period)}`);
export function claimMission(id: string) {
  const m = missions(state).find((x) => x.id === id); if (!m || m.value < m.goal || missionClaimed(state, m)) return;
  set({ ...state, balance: state.balance + m.reward, claimed: [...state.claimed.slice(-60), `${m.id}:${periodKey(m.period)}`], tx: [tx("promo", m.reward, `Challenge: ${m.title}`), ...state.tx], inbox: [msg("🎯", "Challenge complete", `${m.title}: +${m.reward} coins`), ...state.inbox] });
}

// ---------- accounts (kept in this browser only) ----------
const ACC = "playmaker.accounts";
type Saved = { pwd: string; data: State };
const readAcc = (): Record<string, Saved> => { try { return JSON.parse(localStorage.getItem(ACC) ?? "{}"); } catch { return {}; } };
const writeAcc = (a: Record<string, Saved>) => { try { localStorage.setItem(ACC, JSON.stringify(a)); } catch { /* ignore */ } };
async function hashPwd(email: string, pwd: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`playmaker:${email}:${pwd}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const saveCurrent = () => { const e = state.profile.email.toLowerCase(); if (state.profile.registered && e) { const a = readAcc(); if (a[e]) { a[e].data = state; writeAcc(a); } } };
export interface SignUp { nick: string; email: string; password: string; birth: string; country: string; promo: string }
export const ageOf = (birth: string, now = Date.now()) => { const b = new Date(birth).getTime(); return isFinite(b) ? Math.floor((now - b) / (365.25 * 86400e3)) : 0; };
export async function register(f: SignUp): Promise<string | null> {
  const email = f.email.trim().toLowerCase();
  if (f.nick.trim().length < 3) return "Nickname must be at least 3 characters";
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email";
  if (f.password.length < 8) return "Password must be at least 8 characters";
  if (ageOf(f.birth) < 18) return "You must be 18 or older";
  const a = readAcc(); if (a[email]) return "This email is already registered. Log in instead.";
  if (f.promo.trim() && (!PROMOS[f.promo.trim().toUpperCase()])) return "Unknown promo code";
  const nextProfile = { ...state.profile, nick: f.nick.trim().slice(0, 20), email, birth: f.birth, country: f.country, adult: true, registered: true };
  set({ ...state, profile: nextProfile, inbox: [msg("🎉", "Welcome to Playmaker", "Your account is ready. Daily bonus and challenges are waiting."), ...state.inbox] });
  if (f.promo.trim()) redeemPromo(f.promo);
  a[email] = { pwd: await hashPwd(email, f.password), data: state }; writeAcc(a);
  return null;
}
export async function login(emailIn: string, password: string): Promise<string | null> {
  const email = emailIn.trim().toLowerCase(), a = readAcc(), acc = a[email];
  if (!acc || acc.pwd !== (await hashPwd(email, password))) return "Wrong email or password";
  const d = fresh(); set({ ...d, ...acc.data, profile: { ...d.profile, ...acc.data.profile }, settings: { ...d.settings, ...acc.data.settings }, limits: { ...d.limits, ...acc.data.limits } });
  return null;
}
export function logout() { saveCurrent(); const d = fresh(); set({ ...d, settings: state.settings }); }
export const hasAccounts = () => Object.keys(readAcc()).length > 0;
