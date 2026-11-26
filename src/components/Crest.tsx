import { hash } from "@/lib/rng";

// Own badge design in each club's traditional colours: [main, stripe/accent]. No official logos are used.
const C: Record<string, [string, string]> = {
  "Arsenal": ["#e30613", "#ffffff"], "Chelsea": ["#034694", "#ffffff"], "Liverpool": ["#c8102e", "#f6eb61"], "Manchester City": ["#6cabdd", "#ffffff"],
  "Manchester United": ["#da291c", "#fbe122"], "Tottenham": ["#ffffff", "#132257"], "Newcastle United": ["#1a1a1a", "#ffffff"], "Aston Villa": ["#670e36", "#95bfe5"],
  "Everton": ["#003399", "#ffffff"], "Brighton": ["#0057b8", "#ffffff"], "Nottingham Forest": ["#dd0000", "#ffffff"], "Leeds United": ["#ffffff", "#1d428a"],
  "Brentford": ["#e30613", "#ffffff"], "Fulham": ["#ffffff", "#111111"], "Bournemouth": ["#da291c", "#111111"], "Crystal Palace": ["#1b458f", "#c4122e"],
  "Sunderland": ["#eb172b", "#ffffff"], "Hull City": ["#f5a12d", "#111111"], "Coventry City": ["#6cc4ec", "#ffffff"], "Ipswich Town": ["#0044aa", "#ffffff"],
  "Real Madrid": ["#ffffff", "#febe10"], "Barcelona": ["#a50044", "#004d98"], "Atletico Madrid": ["#cb3524", "#ffffff"], "Sevilla": ["#ffffff", "#d4021d"],
  "Villarreal": ["#fbe122", "#005187"], "Real Sociedad": ["#0067b1", "#ffffff"], "Athletic Club": ["#ee2523", "#ffffff"], "Real Betis": ["#00954c", "#ffffff"],
  "Valencia": ["#ffffff", "#111111"], "Girona": ["#ce1126", "#ffffff"], "Celta Vigo": ["#8ac3ee", "#ffffff"],
  "Juventus": ["#ffffff", "#111111"], "Inter": ["#0068a8", "#111111"], "AC Milan": ["#fb090b", "#111111"], "Milan": ["#fb090b", "#111111"], "Napoli": ["#12a0d7", "#ffffff"],
  "Roma": ["#8e1f2f", "#f0bc42"], "Lazio": ["#87d8f7", "#ffffff"], "Atalanta": ["#1e71b8", "#111111"], "Fiorentina": ["#5b2a86", "#ffffff"], "Bologna": ["#1a2f48", "#a21c26"],
  "Bayern Munich": ["#dc052d", "#ffffff"], "Borussia Dortmund": ["#fde100", "#111111"], "Bayer Leverkusen": ["#e32221", "#111111"], "RB Leipzig": ["#dd0741", "#ffffff"],
  "Eintracht Frankfurt": ["#e1000f", "#111111"], "VfB Stuttgart": ["#ffffff", "#e32219"], "Werder Bremen": ["#1d9053", "#ffffff"], "Borussia M'gladbach": ["#ffffff", "#111111"],
  "Paris Saint-Germain": ["#004170", "#da291c"], "PSG": ["#004170", "#da291c"], "Marseille": ["#2faee0", "#ffffff"], "Monaco": ["#e51b22", "#ffffff"], "Lyon": ["#ffffff", "#1b3a8c"],
  "Lille": ["#e01e13", "#1d2d5c"], "Nice": ["#111111", "#e01e13"], "Benfica": ["#e30613", "#ffffff"], "Porto": ["#003c7a", "#ffffff"], "Sporting CP": ["#00864f", "#ffffff"],
  "Ajax": ["#ffffff", "#d2122e"], "PSV": ["#e2001a", "#ffffff"], "Feyenoord": ["#e2001a", "#ffffff"], "Celtic": ["#138a4a", "#ffffff"], "Club Brugge": ["#1e5aa8", "#111111"],
  "Galatasaray": ["#fdb913", "#a90432"], "Fenerbahce": ["#fcd116", "#00205b"], "Olympiacos": ["#e4002b", "#ffffff"],
  "Lakers": ["#552583", "#fdb927"], "Celtics": ["#007a33", "#ffffff"], "Warriors": ["#1d428a", "#ffc72c"], "Bulls": ["#ce1141", "#111111"], "Heat": ["#98002e", "#f9a01b"],
  "Knicks": ["#006bb6", "#f58426"], "Nets": ["#111111", "#ffffff"], "Bucks": ["#00471b", "#eee1c6"], "Suns": ["#1d1160", "#e56020"], "Mavericks": ["#00538c", "#b8c4ca"],
  "Nuggets": ["#0e2240", "#fec524"], "Spurs": ["#c4ced4", "#111111"], "Thunder": ["#007ac1", "#ef3b24"], "Clippers": ["#c8102e", "#1d428a"], "Rockets": ["#ce1141", "#111111"],
  "Cowboys": ["#003594", "#869397"], "Chiefs": ["#e31837", "#ffb81c"], "Eagles": ["#004c54", "#a5acaf"], "49ers": ["#aa0000", "#b3995d"], "Packers": ["#203731", "#ffb612"],
  "Patriots": ["#002244", "#c60c30"], "Bills": ["#00338d", "#c60c30"], "Ravens": ["#241773", "#9e7c0c"], "Lions": ["#0076b6", "#b0b7bc"], "Bengals": ["#fb4f14", "#111111"],
};

// A team is matched by its full name or by a known keyword inside it (e.g. "Los Angeles Lakers").
function colors(name: string): [string, string] {
  if (C[name]) return C[name];
  const k = Object.keys(C).find((x) => name.includes(x) || x.includes(name));
  if (k) return C[k];
  const h = (hash(name) % 12) * 30;
  return [`hsl(${h} 65% 45%)`, `hsl(${(h + 40) % 360} 70% 85%)`];
}

function light(c: string) {
  if (!c.startsWith("#")) return false;
  const n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return r * 0.299 + g * 0.587 + b * 0.114 > 150;
}

export function Crest({ name, size = 28 }: { name: string; size?: number }) {
  const [a, b] = colors(name);
  const ini = name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const ink = light(a) ? (light(b) ? "#111" : b) : "#fff";
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 40 40" className="shrink-0">
      <path d="M20 1.5 36 6v14c0 9-6.5 15.5-16 18.5C10.5 35.5 4 29 4 20V6z" fill={a} stroke={b} strokeWidth="2.2" />
      <path d="M4 20h32v0" stroke={b} strokeWidth="0" />
      <rect x="9" y="26" width="22" height="3" rx="1.5" fill={b} opacity=".85" />
      <text x="20" y="22" textAnchor="middle" fontSize="13" fontWeight="800" fill={ink} fontFamily="system-ui,sans-serif">{ini}</text>
    </svg>
  );
}
