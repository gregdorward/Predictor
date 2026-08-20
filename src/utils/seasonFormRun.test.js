import {
  buildThinLeagueFormSlices,
  limitFormRunToSeasonPlayed,
  capFormResultsToSeasonPlayed,
  resolveDisplaySeasonPlayed,
  sanitizeThinSeasonFormSide,
} from "./seasonFormRun";

describe("seasonFormRun", () => {
  test("limitFormRunToSeasonPlayed keeps only this season's newest results", () => {
    expect(limitFormRunToSeasonPlayed("WDLWLWL", 3)).toEqual(["L", "W", "L"]);
    expect(limitFormRunToSeasonPlayed("WWWWW", 0)).toEqual([]);
    expect(limitFormRunToSeasonPlayed("LDLDL", 2)).toEqual(["D", "L"]);
  });

  test("buildThinLeagueFormSlices uses table WDL instead of padding to 5", () => {
    const slices = buildThinLeagueFormSlices("WWW", "LWL");
    expect(slices.lastFiveFormHome).toEqual(["W", "W", "W"]);
    expect(slices.lastFiveFormAway).toEqual(["L", "W", "L"]);
    expect(slices.lastThreeFormHome).toEqual(["W", "W", "W"]);
    expect(slices.leagueOrAll).toBe("League");
    expect(slices.hasLeagueForm).toBe(true);
  });

  test("buildThinLeagueFormSlices falls back to season-capped formRun when wdl missing", () => {
    const slices = buildThinLeagueFormSlices("", "", {
      homeFormRunOverall: "LDLDLWL",
      awayFormRunOverall: "WWLWDWW",
      homeSeasonPlayed: 3,
      awaySeasonPlayed: 3,
    });
    expect(slices.lastFiveFormHome).toEqual(["L", "W", "L"]);
    expect(slices.lastFiveFormAway).toEqual(["D", "W", "W"]);
    expect(slices.hasLeagueForm).toBe(true);
  });

  test("capFormResultsToSeasonPlayed trims newest-first lists", () => {
    expect(capFormResultsToSeasonPlayed(["W", "L", "D", "W", "L"], 3)).toEqual([
      "W",
      "L",
      "D",
    ]);
  });

  test("resolveDisplaySeasonPlayed hard-caps inflated Played* by mcm early season", () => {
    expect(
      resolveDisplaySeasonPlayed(
        { PlayedHome: 3, PlayedAway: 2 },
        {
          kind: "all",
          matchesCompletedMinimum: 3,
          currentSeasonOnly: true,
        }
      )
    ).toBe(3);
  });

  test("resolveDisplaySeasonPlayed prefers leaguePlayed over home+away", () => {
    expect(
      resolveDisplaySeasonPlayed(
        { PlayedHome: 4, PlayedAway: 4, leaguePlayed: 3 },
        { kind: "all", currentSeasonOnly: true, matchesCompletedMinimum: 5 }
      )
    ).toBe(3);
  });

  test("resolveDisplaySeasonPlayed does not shrink league fixture WDL to a lower mcm", () => {
    expect(
      resolveDisplaySeasonPlayed(
        {
          leaguePlayed: 4,
          leaguePlayedHome: 2,
          leaguePlayedAway: 2,
          WDLRecord: "WWWD",
        },
        {
          kind: "all",
          matchesCompletedMinimum: 2,
          currentSeasonOnly: true,
        }
      )
    ).toBe(4);
    expect(
      resolveDisplaySeasonPlayed(
        {
          leaguePlayed: 4,
          leaguePlayedHome: 2,
          leaguePlayedAway: 2,
          WDLRecord: "WWWD",
        },
        {
          kind: "away",
          matchesCompletedMinimum: 2,
          currentSeasonOnly: true,
        }
      )
    ).toBe(2);
  });

  test("resolveDisplaySeasonPlayed never lets home exceed overall All cap", () => {
    expect(
      resolveDisplaySeasonPlayed(
        { PlayedHome: 4, PlayedAway: 1, leaguePlayed: 2 },
        {
          kind: "home",
          matchesCompletedMinimum: 3,
          currentSeasonOnly: true,
        }
      )
    ).toBe(2);
  });

  test("resolveDisplaySeasonPlayed never lets away exceed overall All cap", () => {
    expect(
      resolveDisplaySeasonPlayed(
        { PlayedHome: 0, PlayedAway: 5, leaguePlayed: 2 },
        {
          kind: "away",
          matchesCompletedMinimum: 2,
          currentSeasonOnly: true,
        }
      )
    ).toBe(2);
  });

  test("resolveDisplaySeasonPlayed hides away pills when the only league game was at home", () => {
    expect(
      resolveDisplaySeasonPlayed(
        {
          PlayedHome: 1,
          PlayedAway: 1,
          leaguePlayed: 1,
          WDLRecord: "W",
        },
        {
          kind: "away",
          matchesCompletedMinimum: 1,
          currentSeasonOnly: true,
        }
      )
    ).toBe(0);
    expect(
      resolveDisplaySeasonPlayed(
        {
          PlayedHome: 1,
          PlayedAway: 0,
          leaguePlayed: 1,
          WDLRecord: "W",
        },
        {
          kind: "home",
          matchesCompletedMinimum: 1,
          currentSeasonOnly: true,
        }
      )
    ).toBe(1);
  });

  test("resolveDisplaySeasonPlayed does not borrow overall games when venue played is missing", () => {
    expect(
      resolveDisplaySeasonPlayed(
        { PlayedHome: 1, leaguePlayed: 1, WDLRecord: "W" },
        {
          kind: "away",
          matchesCompletedMinimum: 1,
          currentSeasonOnly: true,
        }
      )
    ).toBe(0);
  });

  test("resolveDisplaySeasonPlayed does not hide Europa venue form when FootyStats Played* includes domestic games", () => {
    expect(
      resolveDisplaySeasonPlayed(
        {
          PlayedHome: 8,
          PlayedAway: 7,
          leaguePlayed: 4,
          WDLRecord: "LLLW",
        },
        {
          kind: "home",
          matchesCompletedMinimum: 4,
          currentSeasonOnly: true,
        }
      )
    ).toBe(4);
    expect(
      resolveDisplaySeasonPlayed(
        {
          PlayedHome: 8,
          PlayedAway: 7,
          leaguePlayed: 4,
          WDLRecord: "WDW",
        },
        {
          kind: "away",
          matchesCompletedMinimum: 3,
          currentSeasonOnly: true,
        }
      )
    ).toBe(3);
  });

  test("resolveDisplaySeasonPlayed prefers competition home/away played over FootyStats", () => {
    expect(
      resolveDisplaySeasonPlayed(
        {
          PlayedHome: 8,
          PlayedAway: 7,
          leaguePlayed: 4,
          leaguePlayedHome: 2,
          leaguePlayedAway: 2,
          WDLRecord: "LLLW",
        },
        {
          kind: "home",
          currentSeasonOnly: true,
        }
      )
    ).toBe(2);
    expect(
      resolveDisplaySeasonPlayed(
        {
          PlayedHome: 1,
          PlayedAway: 5,
          leaguePlayed: 1,
          leaguePlayedHome: 1,
          leaguePlayedAway: 0,
          WDLRecord: "W",
        },
        {
          kind: "away",
          currentSeasonOnly: true,
        }
      )
    ).toBe(0);
  });

  test("sanitizeThinSeasonFormSide trims LastFiveForm to season played", () => {
    const form = {
      PlayedHome: 2,
      PlayedAway: 1,
      LastFiveForm: ["W", "L", "D", "W", "L"],
    };
    sanitizeThinSeasonFormSide(form);
    expect(form.LastFiveForm).toEqual(["W", "L", "D"]);
  });

  test("sanitizeThinSeasonFormSide drops venue splits when home+away counts exceed league games", () => {
    const form = {
      PlayedHome: 1,
      PlayedAway: 1,
      leaguePlayed: 1,
      WDLRecord: "W",
      LastFiveForm: ["W"],
      resultsAll: ["W"],
      resultsHome: ["W"],
      resultsAway: ["L"],
    };
    sanitizeThinSeasonFormSide(form);
    expect(form.resultsAll).toEqual(["W"]);
    expect(form.resultsHome).toEqual([]);
    expect(form.resultsAway).toEqual([]);
  });

  test("sanitizeThinSeasonFormSide treats PlayedAway 0 as no away games, not overall played", () => {
    const form = {
      PlayedHome: 1,
      PlayedAway: 0,
      leaguePlayed: 1,
      WDLRecord: "W",
      resultsAll: ["W"],
      resultsAway: ["L"],
    };
    sanitizeThinSeasonFormSide(form);
    expect(form.resultsAway).toEqual([]);
  });
});
