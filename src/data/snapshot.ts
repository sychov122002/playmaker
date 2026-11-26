// Upcoming fixtures (real pairings and kick-off times) with market win probabilities.
// Snapshot of 2026-11-26. Times are UTC. Probabilities (%) are used to derive fair odds.
import type { RawEvent } from "@/lib/types";

const f = (league: string, h: string, a: string, t: string, ph: number, pd: number, pa: number): RawEvent => ({ sport: "football", league, home: h, away: a, start: `${t}:00Z`, p: [ph, pd, pa] });
const b = (sport: "basketball" | "hockey", league: string, h: string, a: string, t: string, ph?: number): RawEvent => ({ sport, league, home: h, away: a, start: `${t}:00Z`, p: ph ? [ph, 0, 100 - ph] : undefined });

const APL = "Premier League", LL = "La Liga", SA = "Serie A", BL = "Bundesliga", LCH = "Champions League", NBA = "NBA", NHL = "NHL";

export const SNAPSHOT_DATE = "2026-11-26";

export const RAW_EVENTS: RawEvent[] = [
  // Премьер-лига
  f(APL, "Nottingham Forest", "Chelsea", "2026-11-27T20:00", 38.5, 27.8, 33.7),
  f(APL, "Leeds United", "Coventry City", "2026-11-28T15:00", 65.3, 20, 14.7),
  f(APL, "Manchester United", "Brentford", "2026-11-28T15:00", 44.9, 25.4, 29.7),
  f(APL, "Ipswich Town", "Aston Villa", "2026-11-28T17:30", 26.4, 24.6, 49),
  f(APL, "Everton", "Liverpool", "2026-11-29T12:00", 21.7, 24.5, 53.8),
  f(APL, "Brighton", "Newcastle United", "2026-11-29T14:05", 61.3, 20.8, 17.9),
  f(APL, "Crystal Palace", "Hull City", "2026-11-29T14:05", 50.7, 25.2, 24.1),
  f(APL, "Fulham", "Bournemouth", "2026-11-29T14:05", 35.2, 27.6, 37.2),
  f(APL, "Sunderland", "Tottenham", "2026-11-29T14:05", 26.2, 27.7, 46.1),
  f(APL, "Arsenal", "Manchester City", "2026-11-29T16:30", 47.8, 26, 26.2),
  // Ла Лига
  f(LL, "Levante", "Racing Santander", "2026-11-27T20:00", 45.7, 24.5, 29.8),
  f(LL, "Real Betis", "Rayo Vallecano", "2026-11-28T13:00", 60.6, 21.4, 18),
  f(LL, "Málaga", "Athletic Bilbao", "2026-11-28T15:15", 19.2, 24.4, 56.4),
  f(LL, "Elche", "Atlético Madrid", "2026-11-28T17:30", 14.4, 18.7, 66.9),
  f(LL, "Real Madrid", "Alavés", "2026-11-28T20:00", 86.5, 9.1, 4.4),
  f(LL, "Valencia", "Osasuna", "2026-11-29T13:00", 43.8, 29.4, 26.8),
  f(LL, "Deportivo La Coruña", "Barcelona", "2026-11-29T15:15", 8.8, 11.9, 79.3),
  f(LL, "Celta Vigo", "Villarreal", "2026-11-29T17:30", 34.6, 27.2, 38.2),
  f(LL, "Real Sociedad", "Sevilla", "2026-11-29T20:00", 44.9, 26.7, 28.4),
  f(LL, "Espanyol", "Getafe", "2026-11-30T20:00", 46, 29.6, 24.4),
  // Серия A
  f(SA, "Venezia", "Bologna", "2026-11-27T19:45", 29.2, 28.6, 42.2),
  f(SA, "Frosinone", "Parma", "2026-11-28T14:00", 66.3, 18.1, 15.6),
  f(SA, "Torino", "Lazio", "2026-11-28T17:00", 26.6, 27.6, 45.8),
  f(SA, "Inter", "Genoa", "2026-11-28T19:45", 73.6, 16, 10.4),
  f(SA, "Udinese", "Fiorentina", "2026-11-29T11:30", 31, 26.9, 42.1),
  f(SA, "Sassuolo", "Napoli", "2026-11-29T14:00", 19.9, 22.5, 57.6),
  f(SA, "Roma", "Monza", "2026-11-29T17:00", 80.8, 11.9, 7.3),
  f(SA, "Como", "Juventus", "2026-11-29T19:45", 46.3, 26.5, 27.2),
  f(SA, "Lecce", "Atalanta", "2026-11-30T17:30", 25.2, 25.2, 49.6),
  f(SA, "Cagliari", "AC Milan", "2026-11-30T19:45", 19, 24.5, 56.5),
  // Бундеслига
  f(BL, "Werder Bremen", "Gladbach", "2026-11-27T19:30", 55.3, 22.5, 22.2),
  f(BL, "Mainz", "Union Berlin", "2026-11-28T14:30", 64.2, 19.8, 16),
  f(BL, "Hamburg", "Bayern Munich", "2026-11-28T14:30", 9.9, 13.3, 76.8),
  f(BL, "Köln", "Elversberg", "2026-11-28T14:30", 47.2, 25.1, 27.7),
  f(BL, "Paderborn", "Schalke 04", "2026-11-28T14:30", 38.6, 27.5, 33.9),
  f(BL, "Stuttgart", "Eintracht Frankfurt", "2026-11-28T17:30", 54.5, 21, 24.5),
  f(BL, "Freiburg", "RB Leipzig", "2026-11-29T14:30", 34.7, 24.9, 40.4),
  f(BL, "Hoffenheim", "Augsburg", "2026-11-29T16:30", 55.4, 21, 23.6),
  f(BL, "Dortmund", "Leverkusen", "2026-11-29T18:30", 44.9, 24.2, 30.9),
  f(BL, "Bayern Munich", "Paderborn", "2026-12-04T19:30", 89.7, 6.7, 3.6),
  // Лига чемпионов
  f(LCH, "Viking", "Feyenoord", "2026-12-08T17:45", 35.6, 24.4, 40),
  f(LCH, "Villarreal", "Sabah", "2026-12-08T17:45", 80.5, 11.5, 8),
  f(LCH, "AEK Athens", "Galatasaray", "2026-12-08T20:00", 38.2, 25.4, 36.4),
  f(LCH, "Roma", "Sporting CP", "2026-12-08T20:00", 59.5, 21.2, 19.3),
  f(LCH, "Aston Villa", "PSG", "2026-12-08T20:00", 25.4, 24, 50.6),
  f(LCH, "Barcelona", "Manchester City", "2026-12-08T20:00", 53.6, 21.2, 25.2),
  f(LCH, "Bayern Munich", "Slavia Prague", "2026-12-08T20:00", 84.1, 9.9, 6),
  f(LCH, "Manchester United", "RB Leipzig", "2026-12-08T20:00", 55, 22.1, 22.9),
  f(LCH, "Napoli", "Club Brugge", "2026-12-08T20:00", 53.8, 22.8, 23.4),
  f(LCH, "Real Betis", "Como", "2026-12-09T17:45", 35.7, 24.6, 39.7),
  // НБА
  b("basketball", NBA, "New York Knicks", "Miami Heat", "2026-11-28T00:00", 61),
  b("basketball", NBA, "Detroit Pistons", "Milwaukee Bucks", "2026-11-28T00:30"),
  b("basketball", NBA, "Toronto Raptors", "Brooklyn Nets", "2026-11-28T00:30"),
  b("basketball", NBA, "Indiana Pacers", "Philadelphia 76ers", "2026-11-28T00:30", 37.8),
  b("basketball", NBA, "Boston Celtics", "Atlanta Hawks", "2026-11-28T01:00", 77),
  b("basketball", NBA, "Minnesota Timberwolves", "Memphis Grizzlies", "2026-11-28T01:30"),
  b("basketball", NBA, "Phoenix Suns", "Dallas Mavericks", "2026-11-28T02:00"),
  b("basketball", NBA, "Utah Jazz", "Denver Nuggets", "2026-11-28T02:30", 22.9),
  b("basketball", NBA, "San Antonio Spurs", "Los Angeles Lakers", "2026-11-28T02:30", 65.9),
  b("basketball", NBA, "LA Clippers", "New Orleans Pelicans", "2026-11-28T02:30"),
  b("basketball", NBA, "Portland Trail Blazers", "Golden State Warriors", "2026-11-28T02:30"),
  b("basketball", NBA, "Washington Wizards", "Orlando Magic", "2026-11-28T22:00"),
  b("basketball", NBA, "Charlotte Hornets", "Brooklyn Nets", "2026-11-28T23:00"),
  b("basketball", NBA, "Chicago Bulls", "Indiana Pacers", "2026-11-29T01:00"),
  b("basketball", NBA, "Milwaukee Bucks", "Oklahoma City Thunder", "2026-11-29T01:00"),
  // НХЛ
  b("hockey", NHL, "Boston Bruins", "Toronto Maple Leafs", "2026-11-27T18:00", 59.9),
  b("hockey", NHL, "New Jersey Devils", "Calgary Flames", "2026-11-27T18:00", 70.2),
  b("hockey", NHL, "Nashville Predators", "Utah Mammoth", "2026-11-27T18:00", 49.6),
  b("hockey", NHL, "St. Louis Blues", "Dallas Stars", "2026-11-27T19:00", 44.2),
  b("hockey", NHL, "Columbus Blue Jackets", "Detroit Red Wings", "2026-11-27T20:00", 54.3),
  b("hockey", NHL, "Philadelphia Flyers", "Vancouver Canucks", "2026-11-27T20:00", 66.7),
  b("hockey", NHL, "Washington Capitals", "Florida Panthers", "2026-11-27T20:00", 50.1),
  b("hockey", NHL, "Tampa Bay Lightning", "Ottawa Senators", "2026-11-27T20:00", 56.3),
  b("hockey", NHL, "Minnesota Wild", "Colorado Avalanche", "2026-11-27T21:00", 54),
  b("hockey", NHL, "San Jose Sharks", "Vegas Golden Knights", "2026-11-27T21:00", 35.1),
  b("hockey", NHL, "Anaheim Ducks", "Los Angeles Kings", "2026-11-27T21:00"),
  b("hockey", NHL, "Chicago Blackhawks", "New York Rangers", "2026-11-27T22:30"),
  b("hockey", NHL, "New York Islanders", "Winnipeg Jets", "2026-11-28T00:30"),
  b("hockey", NHL, "Buffalo Sabres", "Pittsburgh Penguins", "2026-11-28T01:00"),
  b("hockey", NHL, "Edmonton Oilers", "Seattle Kraken", "2026-11-28T01:00"),
];
