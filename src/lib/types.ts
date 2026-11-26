export type Sport = "football" | "hockey" | "basketball" | "americanfootball" | "tennis" | "esports" | "tabletennis" | "volleyball" | "mma";
export interface RawEvent { sport: Sport; league: string; home: string; away: string; start: string; p?: [number, number, number] }
export interface Outcome { key: string; label: string; odds: number }
export interface Market { key: string; title: string; outcomes: Outcome[] }
export interface Ev {
  id: string; sport: Sport; league: string; home: string; away: string; start: number;
  p: [number, number, number]; markets: Market[]; virtual?: boolean; live?: boolean;
}
export interface Result { h: number; a: number; x?: number }
export interface Leg { eventId: string; title: string; market: string; marketKey: string; outKey: string; label: string; odds: number }
export type BetStatus = "pending" | "won" | "lost";
export interface Bet { cashedOut?: boolean; id: string; at: number; mode: "single" | "express"; stake: number; legs: Leg[]; odds: number; status: BetStatus; payout: number; legStatus: Record<string, BetStatus> }
export const SPORTS: { id: Sport; name: string; icon: string; virtual?: boolean }[] = [
  { id: "football", name: "Football", icon: "⚽" },
  { id: "hockey", name: "Ice Hockey", icon: "🏒" },
  { id: "basketball", name: "Basketball", icon: "🏀" },
  { id: "americanfootball", name: "American Football", icon: "🏈" },
  { id: "tennis", name: "Tennis", icon: "🎾", virtual: true },
  { id: "esports", name: "Esports", icon: "🎮", virtual: true },
  { id: "tabletennis", name: "Table Tennis", icon: "🏓", virtual: true },
  { id: "volleyball", name: "Volleyball", icon: "🏐", virtual: true },
  { id: "mma", name: "MMA", icon: "🥊", virtual: true },
];
export interface Tx { id: string; at: number; type: "bet" | "win" | "bonus" | "promo" | "cashout" | "reset"; amount: number; note: string }
export type OddsFormat = "decimal" | "fractional" | "american";
export interface Settings { odds: OddsFormat; notifyResults: boolean; notifyBonus: boolean; reality: 0 | 30 | 60 }
export interface Limits { maxStake: number; dailyLoss: number; excludeUntil: number }
export interface Profile { id: string; nick: string; avatar: string; createdAt: number }
