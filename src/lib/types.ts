export type Sport = "football" | "hockey" | "basketball";
export interface RawEvent { sport: Sport; league: string; home: string; away: string; start: string; p?: [number, number, number] }
export interface Outcome { key: string; label: string; odds: number }
export interface Market { key: string; title: string; outcomes: Outcome[] }
export interface Ev {
  id: string; sport: Sport; league: string; home: string; away: string; start: number;
  p: [number, number, number]; markets: Market[]; virtual?: boolean; live?: boolean;
}
export interface Result { h: number; a: number }
export interface Leg { eventId: string; title: string; market: string; marketKey: string; outKey: string; label: string; odds: number }
export type BetStatus = "pending" | "won" | "lost";
export interface Bet { id: string; at: number; mode: "single" | "express"; stake: number; legs: Leg[]; odds: number; status: BetStatus; payout: number; legStatus: Record<string, BetStatus> }
export const SPORTS: { id: Sport; name: string; icon: string }[] = [
  { id: "football", name: "Football", icon: "⚽" },
  { id: "hockey", name: "Hockey", icon: "🏒" },
  { id: "basketball", name: "Basketball", icon: "🏀" },
];
