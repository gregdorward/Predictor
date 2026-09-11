import {
  addTeamRoleResult,
  buildLeagueReliabilityFromFixtures,
  buildTeamReliabilityFromFixtures,
  classifyFixtureRoles,
  emptyRoleCounts,
  reliabilityLabelForScore,
  reliabilityToneForScore,
  roiFromProfit,
  summariseRoleCounts,
  unitStakePnl,
} from "./marketReliability";

function fixture({
  homeOdds,
  awayOdds,
  homeGoals,
  awayGoals,
  drawOdds = 3.4,
  home = "Alpha",
  away = "Beta",
}) {
  return {
    home_name: home,
    away_name: away,
    odds_ft_1: homeOdds,
    odds_ft_2: awayOdds,
    odds_ft_x: drawOdds,
    homeGoalCount: homeGoals,
    awayGoalCount: awayGoals,
    status: "complete",
  };
}

describe("unitStakePnl", () => {
  test("returns net profit including stake settlement", () => {
    expect(unitStakePnl(2.5, true)).toBe(1.5);
    expect(unitStakePnl(1.5, true)).toBe(0.5);
    expect(unitStakePnl(2.5, false)).toBe(-1);
  });

  test("roiFromProfit divides net by stakes", () => {
    expect(roiFromProfit(1.5, 2)).toBe(75);
    expect(roiFromProfit(-1, 2)).toBe(-50);
    expect(roiFromProfit(0, 0)).toBeNull();
  });
});

describe("classifyFixtureRoles", () => {
  test("marks the shorter-priced side as favourite and records a win", () => {
    expect(
      classifyFixtureRoles(fixture({ homeOdds: 1.6, awayOdds: 4.5, homeGoals: 2, awayGoals: 0 }))
    ).toMatchObject({
      homeIsFavourite: true,
      favouriteWon: true,
      favouriteDrew: false,
      favouriteLost: false,
    });
  });

  test("treats an away favourite win as a favourite win", () => {
    expect(
      classifyFixtureRoles(fixture({ homeOdds: 3.8, awayOdds: 1.9, homeGoals: 0, awayGoals: 1 }))
    ).toMatchObject({
      homeIsFavourite: false,
      favouriteWon: true,
    });
  });

  test("skips equal odds and missing prices", () => {
    expect(
      classifyFixtureRoles(fixture({ homeOdds: 2.5, awayOdds: 2.5, homeGoals: 1, awayGoals: 1 }))
    ).toBeNull();
    expect(
      classifyFixtureRoles(fixture({ homeOdds: null, awayOdds: 2.1, homeGoals: 1, awayGoals: 0 }))
    ).toBeNull();
  });
});

describe("summariseRoleCounts", () => {
  test("matches the live form reliability formula", () => {
    let counts = emptyRoleCounts();
    counts = addTeamRoleResult(counts, {
      isFavourite: true,
      won: true,
      drew: false,
      lost: false,
      odds: 1.5,
    });
    counts = addTeamRoleResult(counts, {
      isFavourite: true,
      won: false,
      drew: true,
      lost: false,
      odds: 1.8,
    });
    counts = addTeamRoleResult(counts, {
      isFavourite: false,
      won: false,
      drew: false,
      lost: true,
      odds: 4.0,
    });

    const summary = summariseRoleCounts(counts);
    expect(summary.oddsReliabilityWin).toBe(50);
    expect(summary.oddsReliabilityDraw).toBe(50);
    // reliable = 1 fav win + 1 underdog loss = 2
    // unreliable = 1 fav draw = 1
    expect(summary.predictabilityScore).toBe(2);
    expect(summary.reliabilityLabel).toBe("Reliable");
    // fav: +0.5 then -1 = -0.5 over 2 → -25%
    expect(summary.favouriteProfit).toBe(-0.5);
    expect(summary.favouriteRoi).toBe(-25);
    expect(summary.underdogProfit).toBe(-1);
    expect(summary.underdogRoi).toBe(-100);
    expect(summary.underdogPoints).toBe(0);
  });

  test("labels extreme scores", () => {
    expect(reliabilityLabelForScore(0.1)).toBe("Extremely unreliable");
    expect(reliabilityLabelForScore(1.0)).toBe("Mixed");
    expect(reliabilityLabelForScore(2.5)).toBe("Excellent");
    expect(reliabilityToneForScore(0.1)).toBe("extremely-unreliable");
    expect(reliabilityToneForScore(1.0)).toBe("mixed");
    expect(reliabilityToneForScore(2.5)).toBe("excellent");
  });
});

describe("buildLeagueReliabilityFromFixtures", () => {
  test("counts each priced match once", () => {
    const summary = buildLeagueReliabilityFromFixtures([
      fixture({ homeOdds: 1.5, awayOdds: 5, homeGoals: 2, awayGoals: 0 }),
      fixture({ homeOdds: 1.7, awayOdds: 4, homeGoals: 1, awayGoals: 1 }),
      fixture({ homeOdds: 2.8, awayOdds: 2.4, homeGoals: 0, awayGoals: 2 }),
      fixture({ homeOdds: 2.1, awayOdds: 2.1, homeGoals: 1, awayGoals: 0 }),
    ]);

    expect(summary.pricedMatches).toBe(3);
    expect(summary.favouriteHitRate).toBe(66.7);
    expect(summary.favouriteDrawRate).toBe(33.3);
    expect(summary.favouriteUpsetRate).toBe(0);
    // wins: +0.5 + 1.4 = 1.9; draw: -1 → profit 0.9 / 3 = 30%
    expect(summary.favouriteProfit).toBe(0.9);
    expect(summary.favouriteRoi).toBe(30);
  });
});

describe("buildTeamReliabilityFromFixtures", () => {
  test("builds per-team favourite and underdog records", () => {
    const teams = buildTeamReliabilityFromFixtures([
      fixture({
        home: "Alpha",
        away: "Beta",
        homeOdds: 1.5,
        awayOdds: 5,
        homeGoals: 2,
        awayGoals: 0,
      }),
      fixture({
        home: "Beta",
        away: "Alpha",
        homeOdds: 4.2,
        awayOdds: 1.7,
        homeGoals: 0,
        awayGoals: 1,
      }),
    ]);

    const alpha = teams.find((t) => t.name === "Alpha");
    const beta = teams.find((t) => t.name === "Beta");
    expect(alpha.favouriteCount).toBe(2);
    expect(alpha.winningFavouriteCount).toBe(2);
    expect(alpha.favouriteProfit).toBe(1.2); // 0.5 + 0.7
    expect(alpha.favouriteRoi).toBe(60);
    expect(beta.underdogCount).toBe(2);
    expect(beta.beatenUnderdogCount).toBe(2);
    expect(beta.underdogProfit).toBe(-2);
    expect(beta.underdogRoi).toBe(-100);
    expect(beta.underdogPoints).toBe(0);
  });

  test("awards underdog points on wins and draws", () => {
    const teams = buildTeamReliabilityFromFixtures([
      fixture({
        home: "Dog",
        away: "Fav",
        homeOdds: 4,
        awayOdds: 1.5,
        homeGoals: 1,
        awayGoals: 0,
      }),
      fixture({
        home: "Fav",
        away: "Dog",
        homeOdds: 1.6,
        awayOdds: 4.5,
        homeGoals: 1,
        awayGoals: 1,
      }),
    ]);
    const dog = teams.find((t) => t.name === "Dog");
    expect(dog.underdogPoints).toBe(4); // 3 + 1
    expect(dog.underdogProfit).toBe(2); // +3 then -1
    expect(dog.underdogRoi).toBe(100);
  });
});
