"use client";
import { useSyncExternalStore } from "react";
import { evalOutcome } from "./odds";
import { findEvent, resultOf } from "./events";
import type { Bet, Ev, Leg } from "./types";

export interface State { balance: number; slip: Leg[]; bets: Bet[]; mode: "single" | "express"; bonusAt: number }
const KEY = "playmaker.v1", START = 10000;
const initial: State = { balance: START, slip: [], bets: [], mode: "single", bonusAt: 0 };
let state: State = initial;
const subs = new Set<() => void>();
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = { ...initial, ...JSON.parse(raw) }; } catch { /* storage unavailable */ }
}
function set(next: State) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}
export function useStore(): State {
  return useSyncExternalStore(
    (cb) => { load(); subs.add(cb); const t = setTimeout(cb, 0); return () => { subs.delete(cb); clearTimeout(t); }; },
    () => { load(); return state; },
    () => initial,
  );
}

export function toggleLeg(ev: Ev, marketKey: string, outKey: string) {
  const m = ev.markets.find((x) => x.key === marketKey)!, o = m.outcomes.find((x) => x.key === outKey)!;
  const exists = state.slip.find((l) => l.eventId === ev.id && l.marketKey === marketKey && l.outKey === outKey);
  let slip = state.slip.filter((l) => !(l.eventId === ev.id && (state.mode === "express" || l.marketKey === marketKey)));
  if (!exists) slip = [...slip, { eventId: ev.id, title: `${ev.home} — ${ev.away}`, market: m.title, marketKey, outKey, label: o.label, odds: o.odds }];
  set({ ...state, slip });
}
export const removeLeg = (i: number) => set({ ...state, slip: state.slip.filter((_, n) => n !== i) });
export const clearSlip = () => set({ ...state, slip: [] });
export const setMode = (mode: State["mode"]) => set({ ...state, mode, slip: mode === "express" ? dedupe(state.slip) : state.slip });
const dedupe = (s: Leg[]) => s.filter((l, i) => s.findIndex((x) => x.eventId === l.eventId) === i);
export const claimBonus = () => { if (Date.now() - state.bonusAt > 86400e3) set({ ...state, balance: state.balance + 1000, bonusAt: Date.now() }); };
export const bonusReady = (s: State) => Date.now() - s.bonusAt > 86400e3;

export const MIN_STAKE = 10;
export function placeBet(stakes: number[]): string | null {
  const legs = state.slip; if (!legs.length) return "Bet slip is empty";
  const singles = state.mode === "single" || legs.length === 1;
  const need = singles ? legs.length : 1;
  if (stakes.length < need || stakes.slice(0, need).some((s) => !(s >= MIN_STAKE))) return `Minimum stake is ${MIN_STAKE} coins`;
  const total = stakes.slice(0, need).reduce((a, b) => a + b, 0);
  if (total > state.balance) return "Not enough coins";
  const now = Date.now(), bets: Bet[] = singles
    ? legs.map((l, i) => ({ id: `${now}-${i}`, at: now, mode: "single" as const, stake: stakes[i], legs: [l], odds: l.odds, status: "pending" as const, payout: 0, legStatus: {} }))
    : [{ id: `${now}`, at: now, mode: "express" as const, stake: stakes[0], legs, odds: Math.round(legs.reduce((p, l) => p * l.odds, 1) * 100) / 100, status: "pending" as const, payout: 0, legStatus: {} }];
  set({ ...state, balance: state.balance - total, bets: [...bets, ...state.bets], slip: [] });
  return null;
}

/** Settles bets whose events have finished. */
export function settle(now = Date.now()) {
  let changed = false, balance = state.balance;
  const bets = state.bets.map((b) => {
    if (b.status !== "pending") return b;
    const legStatus = { ...b.legStatus };
    for (const l of b.legs) {
      const k = l.eventId + l.marketKey + l.outKey;
      if (legStatus[k]) continue;
      const ev = findEvent(l.eventId, now); if (!ev) continue;
      const r = resultOf(ev, now); if (!r) continue;
      legStatus[k] = evalOutcome(l.marketKey, l.outKey, r.h, r.a) ? "won" : "lost";
    }
    const vals = b.legs.map((l) => legStatus[l.eventId + l.marketKey + l.outKey]);
    const lost = vals.includes("lost"), won = vals.every((v) => v === "won");
    if (!lost && !won && JSON.stringify(legStatus) === JSON.stringify(b.legStatus)) return b;
    changed = true;
    if (lost) return { ...b, legStatus, status: "lost" as const };
    if (won) { const payout = Math.floor(b.stake * b.odds); balance += payout; return { ...b, legStatus, status: "won" as const, payout }; }
    return { ...b, legStatus };
  });
  if (changed) set({ ...state, bets, balance });
}
