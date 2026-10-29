import {
  DOMESTIC_STRENGTH_LEAGUES,
  LOWER_LEAGUE_PULL_STEP,
  NAMED_LEAGUE_PULLS,
  OTHER_LEAGUE_PULL,
  TOP_LEAGUE_COUNT,
  countryForStrengthLeague,
  getDomesticStrengthLeague,
  groupDomesticLeagues,
} from "./competitionStrengthBases";
import {
  STRENGTH_LONG_WINDOW,
  STRENGTH_RECENCY,
  STRENGTH_WINDOW,
  buildStrengthOverview,
  isValidStrengthOverviewPayload,
  maxLastSixSwing,
  recencyWeights,
  strengthMarginWeight,
} from "./strengthRankings";

function fixture({ home, away, hg, ag, date, status = "complete" }) {
  return {
    home_name: home,
    away_name: away,
    homeGoalCount: hg,
    awayGoalCount: ag,
    date_unix: date,
    status,
  };
}

function league(id, fixtures) {
  return { id, fixtures };
}

function team(overview, leagueId, name, list = "domestic") {
  if (list === "global") {
    return overview.global.find((row) => row.leagueId === leagueId && row.name === name);
  }
  const competition = overview.leagues.find((row) => row.id === leagueId);
  return competition?.teams.find((row) => row.name === name) ?? null;
}

function expectTwiceTheOldest(weights) {
  const [newest] = weights;
  const oldest = weights[weights.length - 1];
  expect(newest).toBeCloseTo(oldest * 2);
  expect(newest).toBeCloseTo(0.9);
  for (let index = 1; index < weights.length; index += 1) {
    expect(weights[index - 1]).toBeGreaterThan(weights[index]);
  }
}

describe("recency weights", () => {
  test("the latest game weighs twice the oldest in each window", () => {
    expect(STRENGTH_RECENCY).toEqual([0.9, 0.81, 0.72, 0.63, 0.54, 0.45]);
    expectTwiceTheOldest(STRENGTH_RECENCY);
    const ten = recencyWeights(STRENGTH_LONG_WINDOW);
    expect(ten).toEqual([0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45]);
    expectTwiceTheOldest(ten);
  });
});

describe("competition strength bases", () => {
  test("keeps the ClubElo Premier League well above Serie B", () => {
    const premier = getDomesticStrengthLeague(17146);
    const serieB = getDomesticStrengthLeague(17404);
    expect(premier.clubElo - serieB.clubElo).toBeGreaterThanOrEqual(200);
    expect(maxLastSixSwing()).toBeLessThan(premier.clubElo - serieB.clubElo);
    expect(premier.base).toBe(premier.clubElo);
    expect(serieB.base).toBeGreaterThan(serieB.clubElo);
    expect(premier.base).toBeGreaterThan(serieB.base);
  });

  test("pulls the top 10 toward the Premier League and tapers every league below", () => {
    const premier = getDomesticStrengthLeague(17146);
    expect(NAMED_LEAGUE_PULLS["la-liga"]).toBe(0.85);
    expect(NAMED_LEAGUE_PULLS["ligue-1"]).toBe(0.85);
    expect(NAMED_LEAGUE_PULLS["bundesliga"]).toBe(0.85);
    expect(NAMED_LEAGUE_PULLS["serie-a"]).toBe(0.8);
    expect(NAMED_LEAGUE_PULLS["brazil-serie-a"]).toBe(0.7);
    expect(OTHER_LEAGUE_PULL).toBe(0.65);
    expect(LOWER_LEAGUE_PULL_STEP).toBe(0.01);
    expect(TOP_LEAGUE_COUNT).toBe(10);
    expect(premier.base).toBe(1838);

    for (const id of [17199, 17102, 17084, 17210, 16544]) {
      const league = getDomesticStrengthLeague(id);
      const pull = NAMED_LEAGUE_PULLS[league.slug];
      expect(league.pull).toBe(pull);
      expect(league.base).toBe(
        Math.round(league.clubElo + pull * (premier.base - league.clubElo))
      );
      expect(league.base).toBeGreaterThan(league.clubElo);
      expect(league.base).toBeLessThan(premier.base);
    }

    const ranked = [...DOMESTIC_STRENGTH_LEAGUES].sort(
      (a, b) => b.clubElo - a.clubElo || a.name.localeCompare(b.name)
    );
    expect(ranked[TOP_LEAGUE_COUNT - 1].slug).toBe("championship");
    expect(ranked[TOP_LEAGUE_COUNT - 1].pull).toBe(OTHER_LEAGUE_PULL);

    const shared = new Set(["national-league-north", "national-league-south"]);
    let expectedPercent = Math.round(OTHER_LEAGUE_PULL * 100);
    let previousSlug = null;
    ranked.slice(TOP_LEAGUE_COUNT).forEach((league) => {
      const sharesStep = previousSlug && shared.has(previousSlug) && shared.has(league.slug);
      if (!sharesStep) {
        expectedPercent = Math.max(0, expectedPercent - Math.round(LOWER_LEAGUE_PULL_STEP * 100));
      }
      expect(Math.round(league.pull * 100)).toBe(expectedPercent);
      expect(league.base).toBe(
        Math.round(league.clubElo + league.pull * (premier.base - league.clubElo))
      );
      previousSlug = league.slug;
    });

    const north = getDomesticStrengthLeague(17263);
    const south = getDomesticStrengthLeague(17403);
    expect(north.pull).toBe(south.pull);
    expect(north.base).toBe(south.base);
  });

  test("steps the National League down from League Two", () => {
    const leagueTwo = getDomesticStrengthLeague(17185);
    const national = getDomesticStrengthLeague(17279);
    expect(leagueTwo.clubElo - national.clubElo).toBe(100);
    expect(leagueTwo.base).toBeGreaterThan(national.base);
    expect(national.source).toBe("step-down");
  });
});

describe("buildStrengthOverview", () => {
  test("a wider win adds more than a one-goal win, and a wider loss costs more", () => {
    expect(strengthMarginWeight(1, 0)).toBe(1);
    expect(strengthMarginWeight(2, 0)).toBe(1.5);
    expect(strengthMarginWeight(3, 0)).toBe(1.75);
    expect(strengthMarginWeight(0, 0)).toBe(1);
    expect(strengthMarginWeight(8, 0)).toBe(strengthMarginWeight(6, 0));

    const opponents = ["North", "South", "East", "West", "Central", "Coast"];
    const fixtures = opponents.flatMap((opponent, index) => [
      fixture({ home: "Scrape", away: opponent, hg: 1, ag: 0, date: index + 1 }),
      fixture({ home: "Rout", away: `${opponent} B`, hg: 4, ag: 0, date: index + 1 }),
      fixture({ home: "Narrow Loss", away: `${opponent} C`, hg: 0, ag: 1, date: index + 1 }),
      fixture({ home: "Heavy Loss", away: `${opponent} D`, hg: 0, ag: 4, date: index + 1 }),
    ]);

    const overview = buildStrengthOverview({ data: [league(17146, fixtures)] });
    const scrape = team(overview, 17146, "Scrape");
    const rout = team(overview, 17146, "Rout");
    const narrowLoss = team(overview, 17146, "Narrow Loss");
    const heavyLoss = team(overview, 17146, "Heavy Loss");

    expect(rout.rating).toBeGreaterThan(scrape.rating + 5);
    expect(heavyLoss.rating).toBeLessThan(narrowLoss.rating - 5);
    expect(rout.matches[0].delta).toBeGreaterThan(scrape.matches[0].delta);
    expect(heavyLoss.matches[0].delta).toBeLessThan(narrowLoss.matches[0].delta);
  });

  test("a run against strong sides outranks six wins over weak ones", () => {
    const weak = ["Pebble", "Dust", "Clay", "Sand", "Silt", "Mud"];
    const strong = ["Titan", "Chief", "Ace"];
    const fixtures = [];

    strong.forEach((opponent, index) => {
      fixtures.push(fixture({ home: "Raider", away: opponent, hg: 1, ag: 0, date: index + 1 }));
      fixtures.push(fixture({ home: "Raider", away: opponent, hg: 1, ag: 0, date: index + 4 }));
    });

    for (const side of strong) {
      weak.forEach((opponent, index) => {
        fixtures.push(
          fixture({ home: side, away: opponent, hg: 2, ag: 0, date: 10 + index })
        );
      });
    }

    weak.forEach((opponent, index) => {
      fixtures.push(
        fixture({ home: "Sweeper", away: opponent, hg: 1, ag: 0, date: 20 + index })
      );
    });

    const overview = buildStrengthOverview({
      data: [league(17146, fixtures)],
    });

    const raider = team(overview, 17146, "Raider");
    const sweeper = team(overview, 17146, "Sweeper");
    expect(raider.played).toBe(STRENGTH_WINDOW);
    expect(sweeper.played).toBe(STRENGTH_WINDOW);
    expect(raider.form).toBe("WWWWWW");
    expect(raider.rating).toBeGreaterThan(sweeper.rating + 5);
    expect(raider.matches[0].delta).toBeGreaterThan(0);
    expect(isValidStrengthOverviewPayload(overview)).toBe(true);
    expect(overview.window).toBe(STRENGTH_WINDOW);
    expect(overview.windows[STRENGTH_WINDOW].global).toEqual(overview.global);
    expect(overview.windows[STRENGTH_LONG_WINDOW].global).toHaveLength(overview.global.length);
  });

  test("ten games keep older results and pull a short run back toward the base", () => {
    const recent = ["A", "B", "C", "D", "E", "F"].map((name, index) =>
      fixture({ home: "Long", away: name, hg: 1, ag: 1, date: 20 + index })
    );
    const older = ["G", "H", "I", "J"].map((name, index) =>
      fixture({ home: "Long", away: name, hg: 5, ag: 0, date: 1 + index })
    );
    const brief = ["A", "B", "C", "D", "E", "F"].map((name, index) =>
      fixture({ home: "Brief", away: name, hg: 3, ag: 0, date: 30 + index })
    );

    const overview = buildStrengthOverview({
      data: [league(17146, [...recent, ...older, ...brief])],
    });
    const sixLong = team(overview, 17146, "Long");
    const sixBrief = team(overview, 17146, "Brief");
    const tenLeague = overview.windows[STRENGTH_LONG_WINDOW].leagues.find(
      (row) => row.id === 17146
    );
    const tenLong = tenLeague.teams.find((row) => row.name === "Long");
    const tenBrief = tenLeague.teams.find((row) => row.name === "Brief");

    expect(sixLong.played).toBe(6);
    expect(sixLong.form).toBe("DDDDDD");
    expect(tenLong.played).toBe(10);
    expect(tenLong.form).toHaveLength(10);
    expect(tenLong.rating).toBeGreaterThan(sixLong.rating);
    expect(Math.abs(tenBrief.rating - tenBrief.base)).toBeLessThan(
      Math.abs(sixBrief.rating - sixBrief.base)
    );
  });

  test("six Serie B wins stay below a Premier League side", () => {
    const serieB = ["Sweep", "A", "B", "C", "D", "E", "F"].flatMap((name, index) => {
      if (name === "Sweep") return [];
      return [
        fixture({
          home: "Sweep",
          away: name,
          hg: 3,
          ag: 0,
          date: index + 1,
        }),
      ];
    });
    const premier = [
      fixture({ home: "Anchor", away: "Other", hg: 0, ag: 1, date: 1 }),
    ];

    const overview = buildStrengthOverview({
      data: [league(17146, premier), league(17404, serieB)],
    });

    const sweep = team(overview, 17404, "Sweep", "global");
    const anchor = team(overview, 17146, "Anchor", "global");
    expect(sweep.played).toBe(STRENGTH_WINDOW);
    expect(sweep.base).toBeLessThan(anchor.base);
    expect(sweep.rating).toBeLessThan(anchor.rating);
    expect(sweep.rating - sweep.base).toBeLessThanOrEqual(Math.ceil(maxLastSixSwing()));
  });

  test("a European upset moves the global list and not the domestic one", () => {
    const premier = [fixture({ home: "Tower", away: "Keep", hg: 1, ag: 1, date: 1 })];
    const championship = [
      fixture({ home: "Climber", away: "Spare", hg: 1, ag: 1, date: 1 }),
      fixture({ home: "Flat", away: "Doormat", hg: 2, ag: 0, date: 1 }),
    ];
    const championsLeague = [
      fixture({ home: "Climber", away: "Tower", hg: 1, ag: 0, date: 8 }),
    ];

    const overview = buildStrengthOverview({
      data: [
        league(17146, premier),
        league(17184, championship),
        league(17128, championsLeague),
      ],
    });

    const climberDomestic = team(overview, 17184, "Climber");
    const flatDomestic = team(overview, 17184, "Flat");
    const climberGlobal = team(overview, 17184, "Climber", "global");
    const flatGlobal = team(overview, 17184, "Flat", "global");

    expect(flatDomestic.rating).toBeGreaterThan(climberDomestic.rating);
    expect(climberDomestic.matches.some((match) => match.opponent === "Tower")).toBe(false);
    expect(climberGlobal.rating).toBeGreaterThan(flatGlobal.rating);
    expect(climberGlobal.matches[0].opponent).toBe("Tower");
    expect(climberGlobal.matches[0].result).toBe("W");
    expect(climberGlobal.matches[0].delta).toBeGreaterThan(flatGlobal.matches[0].delta);
  });

  test("fewer than six games shrinks the move toward the base", () => {
    const overview = buildStrengthOverview({
      data: [
        league(17146, [fixture({ home: "Once", away: "Twice", hg: 4, ag: 0, date: 3 })]),
      ],
    });
    const once = team(overview, 17146, "Once");
    expect(once.played).toBe(1);
    expect(once.rating - once.base).toBeLessThan(8);
    expect(once.form).toBe("W");
  });

  test("ignores an unfinished match", () => {
    const overview = buildStrengthOverview({
      data: [
        league(17146, [
          fixture({ home: "Played", away: "Also", hg: 1, ag: 0, date: 2 }),
          fixture({
            home: "Played",
            away: "Also",
            hg: 5,
            ag: 0,
            date: 9,
            status: "incomplete",
          }),
        ]),
      ],
    });
    expect(team(overview, 17146, "Played").played).toBe(1);
  });
});

describe("strength ranking countries", () => {
  test("keeps a country's divisions together, top flight first", () => {
    expect(countryForStrengthLeague(getDomesticStrengthLeague(17146))).toBe("England");
    expect(countryForStrengthLeague({ slug: "serie-b" })).toBe("Italy");

    const groups = groupDomesticLeagues([
      { slug: "championship", name: "Championship", base: 1610 },
      { slug: "la-liga", name: "La Liga", base: 1766 },
      { slug: "premier-league", name: "Premier League", base: 1838 },
    ]);

    expect(groups.map((group) => group.country)).toEqual(["England", "Spain"]);
    expect(groups[0].leagues.map((league) => league.name)).toEqual([
      "Premier League",
      "Championship",
    ]);
  });
});
