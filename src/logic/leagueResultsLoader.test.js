import {
  MIN_LEAGUE_FIXTURES_FOR_DERIVED_STATS,
  fetchAllLeagueFixturesPages,
  loadLeagueResultsForCompetition,
  mapLeagueFixtureResults,
  resolveLeagueResultsForCompetition,
} from "./leagueResultsLoader";

const makeFixtures = (count) =>
  Array.from({ length: count }, (_, index) => ({
    home_name: `Home ${index}`,
    away_name: `Away ${index}`,
    homeGoalCount: 1,
    awayGoalCount: 0,
    date_unix: index + 1,
    status: "complete",
  }));

describe("fetchAllLeagueFixturesPages", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("concatenates every pager page into one fixture list", async () => {
    global.fetch = jest.fn(async (url) => {
      const href = String(url);
      if (href.includes("page=2")) {
        return {
          ok: true,
          json: async () => ({
            data: [{ id: 2, status: "complete" }],
          }),
        };
      }
      if (href.includes("/leagueFixtures/12345")) {
        return {
          ok: true,
          json: async () => ({
            pager: { current_page: 1, max_page: 2 },
            data: [{ id: 1, status: "complete" }],
          }),
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const fixtures = await fetchAllLeagueFixturesPages(12345);

    expect(fixtures).toHaveLength(2);
    expect(fixtures.map((fixture) => fixture.id)).toEqual([1, 2]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("returns null when the first page fails", async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 500 }));

    await expect(fetchAllLeagueFixturesPages(99)).resolves.toBeNull();
  });
});

describe("mapLeagueFixtureResults", () => {
  test("keeps pens_recorded and team penalty counts", () => {
    const [mapped] = mapLeagueFixtureResults([
      {
        home_name: "Home",
        away_name: "Away",
        homeGoalCount: 2,
        awayGoalCount: 1,
        home_ppg: 1.5,
        away_ppg: 1.2,
        date_unix: 1000,
        team_a_xg: 1.5,
        team_b_xg: 0.9,
        odds_ft_1: 2,
        odds_ft_2: 3.5,
        odds_ft_x: 3.2,
        team_a_shots: 10,
        team_b_shots: 8,
        team_a_corners: 5,
        team_b_corners: 4,
        team_a_shotsOnTarget: 4,
        team_b_shotsOnTarget: 3,
        team_a_fouls: 10,
        team_b_fouls: 11,
        team_a_red_cards: 0,
        team_b_red_cards: 0,
        team_a_possession: 55,
        team_b_possession: 45,
        team_a_dangerous_attacks: 40,
        team_b_dangerous_attacks: 35,
        pre_match_teamA_overall_ppg: 1.5,
        pre_match_teamB_overall_ppg: 1.2,
        game_week: 1,
        homeGoals_timings: ["10"],
        awayGoals_timings: ["70"],
        goal_timings_recorded: 1,
        pens_recorded: 1,
        team_a_penalties_won: 1,
        team_b_penalties_won: 0,
        status: "complete",
      },
    ]);

    expect(mapped.pens_recorded).toBe(1);
    expect(mapped.team_a_penalties_won).toBe(1);
    expect(mapped.team_b_penalties_won).toBe(0);
    expect(mapped.status).toBe("complete");
  });
});

describe("resolveLeagueResultsForCompetition", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("uses cached /results entry when enough fixtures exist", async () => {
    const cachedFixtures = makeFixtures(MIN_LEAGUE_FIXTURES_FOR_DERIVED_STATS);
    global.fetch = jest.fn(async (url) => {
      if (String(url).includes("/results")) {
        return {
          ok: true,
          json: async () => [
            { id: 16537, name: "Irish Premier", fixtures: cachedFixtures },
          ],
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await resolveLeagueResultsForCompetition(16537, "Irish Premier");

    expect(result.id).toBe(16537);
    expect(result.fixtures).toHaveLength(MIN_LEAGUE_FIXTURES_FOR_DERIVED_STATS);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("falls back to live leagueFixtures when cache is missing", async () => {
    const now = Math.floor(Date.now() / 1000);
    const liveFixtures = makeFixtures(3).map((fixture, index) => ({
      ...fixture,
      date_unix: now - index * 86400,
    }));
    global.fetch = jest.fn(async (url) => {
      const href = String(url);
      if (href.includes("/results")) {
        return { ok: false, status: 404, json: async () => null };
      }
      if (href.includes("/leagueFixtures/16537")) {
        return {
          ok: true,
          json: async () => ({
            pager: { current_page: 1, max_page: 1 },
            data: liveFixtures.map((fixture) => ({
              ...fixture,
              status: "complete",
              home_ppg: 1.5,
              away_ppg: 1.2,
              team_a_xg: 1.1,
              team_b_xg: 0.9,
              odds_ft_1: 2,
              odds_ft_2: 3.5,
              odds_ft_x: 3.2,
              team_a_shots: 10,
              team_b_shots: 8,
              team_a_corners: 5,
              team_b_corners: 4,
              team_a_shotsOnTarget: 4,
              team_b_shotsOnTarget: 3,
              team_a_fouls: 10,
              team_b_fouls: 11,
              team_a_red_cards: 0,
              team_b_red_cards: 0,
              team_a_possession: 55,
              team_b_possession: 45,
              team_a_dangerous_attacks: 40,
              team_b_dangerous_attacks: 35,
              pre_match_teamA_overall_ppg: 1.5,
              pre_match_teamB_overall_ppg: 1.2,
              game_week: 1,
            })),
          }),
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await resolveLeagueResultsForCompetition(16537, "Irish Premier");

    expect(result.fixtures.length).toBeGreaterThan(0);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/leagueFixtures/16537")
    );
  });
});

describe("loadLeagueResultsForCompetition", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test("does not throw when page 2 returns no data array", async () => {
    const now = Math.floor(Date.now() / 1000);
    const page1Fixture = {
      home_name: "Home",
      away_name: "Away",
      homeGoalCount: 1,
      awayGoalCount: 0,
      date_unix: now,
      status: "complete",
      home_ppg: 1.5,
      away_ppg: 1.2,
      team_a_xg: 1.1,
      team_b_xg: 0.9,
      odds_ft_1: 2,
      odds_ft_2: 3.5,
      odds_ft_x: 3.2,
      team_a_shots: 10,
      team_b_shots: 8,
      team_a_corners: 5,
      team_b_corners: 4,
      team_a_shotsOnTarget: 4,
      team_b_shotsOnTarget: 3,
      team_a_fouls: 10,
      team_b_fouls: 11,
      team_a_red_cards: 0,
      team_b_red_cards: 0,
      team_a_possession: 55,
      team_b_possession: 45,
      team_a_dangerous_attacks: 40,
      team_b_dangerous_attacks: 35,
      pre_match_teamA_overall_ppg: 1.5,
      pre_match_teamB_overall_ppg: 1.2,
      game_week: 1,
    };

    global.fetch = jest.fn(async (url) => {
      const href = String(url);
      if (href.includes("page=2")) {
        return {
          ok: true,
          json: async () => ({ error: "rate limit" }),
        };
      }
      if (href.includes("/leagueFixtures/16537")) {
        return {
          ok: true,
          json: async () => ({
            pager: { current_page: 1, max_page: 2 },
            data: [page1Fixture],
          }),
        };
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });

    const result = await loadLeagueResultsForCompetition(16537, "Irish Premier");

    expect(result.fixtures).toHaveLength(1);
    expect(result.fixtures[0].home_name).toBe("Home");
  });
});
