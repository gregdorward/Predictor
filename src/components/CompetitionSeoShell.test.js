import { render, screen } from "@testing-library/react";
import CompetitionSeoShell, {
  buildCompetitionSeoShell,
  isCompetitionSeasonEmpty,
} from "./CompetitionSeoShell";

describe("competition empty-season SSR", () => {
  test("detects all-zero market block as empty", () => {
    expect(
      isCompetitionSeasonEmpty({
        seasonAVG_overall: 0,
        seasonBTTSPercentage: 0,
        seasonOver25Percentage_overall: 0,
        seasonUnder25Percentage_overall: 0,
      })
    ).toBe(true);
  });

  test("keeps in-season competitions with live averages", () => {
    expect(
      isCompetitionSeasonEmpty({
        seasonAVG_overall: 3.24,
        seasonBTTSPercentage: 60,
        seasonOver25Percentage_overall: 62,
        seasonUnder25Percentage_overall: 38,
      })
    ).toBe(false);
  });

  test("buildCompetitionSeoShell omits zero stats for empty seasons", () => {
    const shell = buildCompetitionSeoShell(
      {
        english_name: "Premier League",
        country: "England",
        season: "2026/2027",
        seasonAVG_overall: 0,
        seasonBTTSPercentage: 0,
        seasonOver25Percentage_overall: 0,
        seasonUnder25Percentage_overall: 0,
        homeWinPercentage: 0,
        drawPercentage: 0,
        awayWinPercentage: 0,
        team: {},
      },
      { slug: "premier-league", name: "Premier League" }
    );

    expect(shell.seasonStarted).toBe(false);
    expect(shell.avgGoals).toBeNull();
    expect(shell.btts).toBeNull();
    expect(shell.topOver25Teams).toEqual([]);
    expect(shell.tableRows).toEqual([]);
    expect(shell.relatedLinks.length).toBeLessThanOrEqual(7);
    expect(
      shell.relatedLinks.every((link) => link.href.startsWith("/competition/"))
    ).toBe(true);
  });

  test("renders the leader sentence and standings table", () => {
    render(
      <CompetitionSeoShell
        name="Premier League"
        season="2025/2026"
        country="England"
        avgGoals="2.70"
        btts="50.0%"
        over25="48.0%"
        tableLeader={{ name: "Manchester City", points: 15, played: 5 }}
        updatedOn="21 September 2026"
        tableRows={[
          {
            id: 1,
            name: "Manchester City",
            position: 1,
            played: 5,
            goalDifference: 8,
            points: 15,
            btts: 60,
            over25: 60,
          },
        ]}
        seasonStarted
      />
    );

    expect(
      screen.getByText(/Manchester City lead the Premier League on 15 points/)
    ).toBeTruthy();
    expect(screen.getByText("Premier League table, 2025/2026")).toBeTruthy();
    expect(screen.getByRole("row", { name: /Manchester City/ })).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/interactive view/);
  });
});
