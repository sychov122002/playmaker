import { describe, expect, it } from "vitest";
import { evalOutcome, fitLambdas, footballMarkets, hockeyMarkets, basketballMarkets, probs1x2, scoreGrid, toOdds } from "./odds";

describe("odds", () => {
  it("маржа около 6%", () => {
    const o = toOdds([0.5, 0.3, 0.2]);
    const book = o.reduce((s, x) => s + 1 / x, 0);
    expect(book).toBeGreaterThan(1.04); expect(book).toBeLessThan(1.09);
  });
  it("подбор лямбд воспроизводит 1X2", () => {
    const [lh, la] = fitLambdas(0.6, 0.2, 0.2);
    const [h] = probs1x2(scoreGrid(lh, la));
    expect(Math.abs(h - 0.6)).toBeLessThan(0.03);
  });
  it("фаворит имеет меньший коэффициент", () => {
    const m = footballMarkets(80, 12, 8)[0].outcomes;
    expect(m[0].odds).toBeLessThan(m[2].odds);
  });
  it("рынки спортов не пустые", () => {
    expect(hockeyMarkets(55).length).toBe(3);
    expect(basketballMarkets(70).length).toBe(3);
  });
  it("расчёт исходов", () => {
    expect(evalOutcome("1x2", "1", 2, 1)).toBe(true);
    expect(evalOutcome("tot_2.5", "over", 2, 1)).toBe(true);
    expect(evalOutcome("btts", "no", 2, 0)).toBe(true);
    expect(evalOutcome("hcp_-1.5", "h", 3, 1)).toBe(true);
    expect(evalOutcome("hcp_-1.5", "h", 2, 1)).toBe(false);
    expect(evalOutcome("hcp_3.5", "a", 100, 98)).toBe(false);
    expect(evalOutcome("dc", "1X", 1, 1)).toBe(true);
  });
});
