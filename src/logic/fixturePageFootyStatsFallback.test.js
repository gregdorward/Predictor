jest.mock("./getScorePredictions", () => ({
  hydrateFormFromFootyStatsApi: jest.fn((_teamRoot, form) => {
    form.apiFormOnly = true;
    form.avgScored = form.ScoredAverageOverall ?? 1;
    return form;
  }),
}));

import {
  applyFixturePageFootyStatsFallback,
  hasDetailedAllTeamResults,
  preserveFormEntryWindows,
  shouldUseFootyStatsFixtureTemplate,
} from "./fixturePageFootyStatsFallback";

describe("fixturePageFootyStatsFallback", () => {
  describe("hasDetailedAllTeamResults", () => {
    test("returns false for empty or missing lists", () => {
      expect(hasDetailedAllTeamResults(undefined)).toBe(false);
      expect(hasDetailedAllTeamResults({ allTeamResults: [] })).toBe(false);
    });

    test("returns true when a row has a date", () => {
      expect(
        hasDetailedAllTeamResults({
          allTeamResults: [{ date: "01/02/2026", homeGoals: 1, awayGoals: 0 }],
        })
      ).toBe(true);
    });
  });

  describe("shouldUseFootyStatsFixtureTemplate", () => {
    test("returns false when both sides have match history", () => {
      const match = {
        formHome: {
          allTeamResults: [{ dateRaw: 1, date: "1 Jan 2026" }],
        },
        formAway: {
          allTeamResults: [{ dateRaw: 2, date: "2 Jan 2026" }],
        },
      };
      expect(shouldUseFootyStatsFixtureTemplate(match)).toBe(false);
    });

    test("returns true when either side lacks history", () => {
      expect(
        shouldUseFootyStatsFixtureTemplate({
          formHome: { allTeamResults: [{ dateRaw: 1 }] },
          formAway: { allTeamResults: [] },
        })
      ).toBe(true);
      expect(
        shouldUseFootyStatsFixtureTemplate({
          formHome: { allTeamResults: [] },
          formAway: { allTeamResults: [{ dateRaw: 2 }] },
        })
      ).toBe(true);
    });

    test("returns false for World Cup apiFormOnly path", () => {
      expect(
        shouldUseFootyStatsFixtureTemplate({
          apiFormOnly: true,
          formHome: { allTeamResults: [] },
          formAway: { allTeamResults: [] },
        })
      ).toBe(false);
    });
  });

  describe("preserveFormEntryWindows", () => {
    test("clones home and away windows", () => {
      const formEntry = {
        home: { 0: { a: 1 }, 1: { b: 2 }, 2: { XGOverall: 1.5 } },
        away: { 0: { c: 3 }, 1: { d: 4 }, 2: { XGOverall: 1.1 } },
      };
      const preserved = preserveFormEntryWindows(formEntry);
      expect(preserved.home[2].XGOverall).toBe(1.5);
      formEntry.home[2].XGOverall = 99;
      expect(preserved.home[2].XGOverall).toBe(1.5);
    });
  });

  describe("applyFixturePageFootyStatsFallback", () => {
    test("sets fixtureStatsSource when template should apply", () => {
      const match = {
        homeTeam: "Georgia",
        awayTeam: "Northern Ireland",
        leagueID: 16808,
        formHome: { allTeamResults: [] },
        formAway: { allTeamResults: [] },
      };
      const preserved = preserveFormEntryWindows({
        home: {
          0: { XGOverall: 1.2 },
          1: {},
          2: {
            XGOverall: 1.4,
            XGAgainstAvgOverall: 1.1,
            ScoredAverageOverall: 1.5,
            ConcededAverageOverall: 1.0,
            formRun: "WWDLW",
            LeaguePosition: "3rd",
            SeasonPPG: 1.8,
            BttsPercentage: 40,
            BttsPercentageHomeOrAway: 35,
            AverageShots: 12,
            AverageDangerousAttacksOverall: 45,
            CornersAverage: 5,
            CleanSheetPercentage: 30,
            PPG: 1.8,
          },
        },
        away: {
          0: { XGOverall: 1.0 },
          1: {},
          2: {
            XGOverall: 1.2,
            XGAgainstAvgOverall: 1.3,
            ScoredAverageOverall: 1.1,
            ConcededAverageOverall: 1.2,
            formRun: "LDWWD",
            LeaguePosition: "5th",
            SeasonPPG: 1.4,
            BttsPercentage: 50,
            BttsPercentageHomeOrAway: 45,
            AverageShots: 10,
            AverageDangerousAttacksOverall: 40,
            CornersAverage: 4,
            CleanSheetPercentage: 25,
            PPG: 1.4,
          },
        },
      });

      const applied = applyFixturePageFootyStatsFallback({
        match,
        preservedFormEntry: preserved,
        fixture: {
          team_a_xg_prematch: 1.35,
          team_b_xg_prematch: 1.05,
          btts_potential: 55,
        },
      });

      expect(applied).toBe(true);
      expect(match.fixtureStatsSource).toBe("footystats-api");
      expect(match.formHome.apiFormOnly).toBe(true);
      expect(match.formHome.avgScored).toBeTruthy();
      expect(match.footyStatsPrematch.homeXg).toBe(1.35);
    });
  });
});
