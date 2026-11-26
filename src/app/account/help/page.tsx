import { Card } from "@/components/ui";

const FAQ: [string, string][] = [
  ["What are coins?", "Virtual coins with no cash value. You start with 10,000, can claim 1,000 daily, and use promo codes. They cannot be bought, sold or withdrawn."],
  ["Are the matches real?", "Fixtures, kick-off times and probabilities for football, hockey, basketball and American football are real. Tennis, esports, table tennis, volleyball, MMA and Virtual Football are simulated with fictional teams."],
  ["How are results decided?", "A simulator draws each result from the market probabilities, so favourites win more often, but results do not match real-life scores."],
  ["How are odds calculated?", "Odds come from win probabilities with a 6% margin. Football markets use a Poisson goals model; other sports use series or normal models."],
  ["What is a parlay?", "A parlay combines several selections from different events into one bet. Odds are multiplied, and all selections must win."],
  ["What is cash out?", "Settle an open bet early for an offer based on current odds, with a 5% fee. It is only available while all open selections are still prematch or live."],
  ["Why is a price locked (🔒)?", "When an outcome is almost certain in live play, betting on it is suspended."],
  ["Where is my data?", "In your browser only. There is no sign-up yet, so clearing browser data or changing device resets your account."],
];
export default function Help() {
  return (
    <>
      <h1 className="text-2xl font-black">Help</h1>
      <div className="space-y-2">{FAQ.map(([q, a]) => <details key={q} className="group rounded-2xl bg-panel p-4"><summary className="cursor-pointer list-none font-bold marker:hidden">{q}<span className="float-right text-muted group-open:rotate-45">+</span></summary><p className="mt-2 text-sm text-muted">{a}</p></details>)}</div>
      <Card title="Play responsibly"><p className="text-sm text-muted">Even with virtual coins, take breaks. Use the limits, reality check and self-exclusion tools in your account whenever you want.</p></Card>
    </>
  );
}
