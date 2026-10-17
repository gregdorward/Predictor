import {
  formatStatsTipsShareText,
  formatStatsTipMetric,
} from "./formatStatsTipsShareText";

const sampleTips = [
  {
    game: "Arsenal v Chelsea",
    competition: "Premier League",
    prediction: "Arsenal to win",
    odds: "4/5",
    XGdifferentialValue: 1.42,
    outcome: "Pending",
  },
  {
    game: "Liverpool v Everton",
    prediction: "Liverpool to win",
    odds: "2/7",
    XGdifferentialValue: 2.1,
    outcomeSymbol: "✓",
    outcome: "Won",
  },
];

describe("formatStatsTipsShareText", () => {
  test("markdown table includes key metric column and values", () => {
    const markdown = formatStatsTipsShareText({
      sectionId: "xg",
      tips: sampleTips,
      format: "markdown",
    });

    expect(markdown).toContain("### Stats-based tips — xG differential (last 5)");
    expect(markdown).toContain("| Fixture | Pick | xG diff | Odds |");
    expect(markdown).toContain(
      "| Arsenal v Chelsea (Premier League) | Arsenal to win | 1.42 | 4/5 |"
    );
    expect(markdown).toContain("| Liverpool v Everton | Liverpool to win | 2.10 | 2/7 ✓ |");
  });

  test("plain text lists pick with metric and odds", () => {
    const text = formatStatsTipsShareText({
      sectionId: "xg",
      tips: sampleTips,
      format: "text",
    });

    expect(text).toContain("⚽ Stats-based tips — xG differential (last 5)");
    expect(text).toContain(
      "   Arsenal to win · xG diff 1.42 · 4/5"
    );
    expect(text).toContain("https://www.soccerstatshub.com");
  });

  test("formatStatsTipMetric uses section-specific values", () => {
    expect(
      formatStatsTipMetric(
        { dangerousAttacksDiffValue: -31.2 },
        "attacks"
      )
    ).toBe("31");
    expect(
      formatStatsTipMetric({ shotsOnTargetDiffValue: 4.25 }, "sot")
    ).toBe("4.3");
  });
});
