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

  test("sanitizeThinSeasonFormSide trims LastFiveForm to season played", () => {
    const form = {
      PlayedHome: 2,
      PlayedAway: 1,
      LastFiveForm: ["W", "L", "D", "W", "L"],
    };
    sanitizeThinSeasonFormSide(form);
    expect(form.LastFiveForm).toEqual(["W", "L", "D"]);
  });
});
