import {
  fetchCompetitionMetricRankings,
  fetchLeagueTeamMetricRankings,
  fetchPlayerMetricRankings,
} from "./competitionMetricRankings";

describe("competitionMetricRankings", () => {
  const originalOrigin = process.env.NEXT_PUBLIC_EXPRESS_SERVER;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_EXPRESS_SERVER = "https://api.example.com/";
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_EXPRESS_SERVER = originalOrigin;
    jest.resetAllMocks();
  });

  test("fetchLeagueTeamMetricRankings uses season cache URL without week", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ topTeams: { goals: [] } }),
    });

    await fetchLeagueTeamMetricRankings(17, 96668);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/LeagueTeamStats/17/96668"
    );
  });

  test("fetchPlayerMetricRankings uses season cache URL without week", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ topPlayers: { rating: [] } }),
    });

    await fetchPlayerMetricRankings(17, 96668);

    expect(fetch).toHaveBeenCalledWith(
      "https://api.example.com/bestPlayers/17/96668"
    );
  });

  test("fetchCompetitionMetricRankings returns null for unmapped leagues", async () => {
    const result = await fetchCompetitionMetricRankings(999999);

    expect(result).toEqual({
      rankingStats: null,
      playerRankingStats: null,
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
