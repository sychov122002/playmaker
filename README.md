# Playmaker

A sportsbook-style game on **virtual coins** (no cash value, no deposits, no withdrawals).
Real fixtures and market win probabilities, odds derived with a Poisson / normal model plus a 6% margin,
singles and parlays, a virtual live section, and simulated settlement.

- `src/data/snapshot.ts` – upcoming real fixtures (refresh periodically)
- `src/lib/odds.ts` – odds engine (tested)
- `src/lib/events.ts` – events, virtual rounds, live simulation, results
- `src/lib/store.ts` – balance, bet slip, bets (localStorage)

`npm run dev` · `npm test` · `npm run build`
