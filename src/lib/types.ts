export type Sport = "football" | "hockey" | "basketball" | "americanfootball" | "tennis" | "esports" | "tabletennis" | "volleyball" | "mma";
export interface RawEvent { sport: Sport; league: string; home: string; away: string; start: string; p?: [number, number, number] }
export interface Outcome { key: string; label: string; odds: number }
export interface Market { key: string; title: string; outcomes: Outcome[] }
export interface Ev {
  id: string; sport: Sport; league: string; home: string; away: string; start: number;
  p: [number, number, number]; markets: Market[]; virtual?: boolean; live?: boolean; inplay?: { minute: number; hs: number; as: number; clock: string };
}
export interface Result { h: number; a: number; x?: number }
export interface Leg { eventId: string; title: string; market: string; marketKey: string; outKey: string; label: string; odds: number }
export type BetStatus = "pending" | "won" | "lost";
export interface Bet { cashedOut?: boolean; boost?: number; id: string; at: number; mode: "single" | "express"; stake: number; legs: Leg[]; odds: number; status: BetStatus; payout: number; legStatus: Record<string, BetStatus> }
export const SPORTS: { id: Sport; name: string; icon: string; virtual?: boolean }[] = [
  { id: "football", name: "Football", icon: "⚽" },
  { id: "hockey", name: "Ice Hockey", icon: "🏒" },
  { id: "basketball", name: "Basketball", icon: "🏀" },
  { id: "americanfootball", name: "American Football", icon: "🏈" },
  { id: "tennis", name: "Tennis", icon: "🎾" },
  { id: "volleyball", name: "Volleyball", icon: "🏐" },
  { id: "mma", name: "MMA", icon: "🥊" },
];
export interface Tx { id: string; at: number; type: "bet" | "win" | "bonus" | "promo" | "cashout" | "reset" | "cashback"; amount: number; note: string }
export type OddsFormat = "decimal" | "fractional" | "american";
export interface Settings { odds: OddsFormat; notifyResults: boolean; notifyBonus: boolean; reality: 0 | 30 | 60; theme: "dark" | "light"; quickStakes: [number, number, number]; confirmBet: boolean; oddsChange: "any" | "higher" | "never" }
export interface Limits { maxStake: number; dailyLoss: number; excludeUntil: number }
export interface Profile { id: string; nick: string; avatar: string; createdAt: number; fullName: string; email: string; phone: string; country: string; birth: string; adult: boolean; registered?: boolean }
export interface Msg { id: string; at: number; icon: string; title: string; body: string; read: boolean }
