import { apiGetUrl } from "../utils/apiUrl";
import { getLeagueResultsByLeagueId } from "../utils/leagueResultsAccess";

/** Same threshold as calculateScore's leagueHasEnoughFixtures gate. */
export const MIN_LEAGUE_FIXTURES_FOR_DERIVED_STATS = 11;

function mapLeagueFixtureResults(gamesFiltered) {
  return gamesFiltered.map(
    ({
      home_name,
      away_name,
      homeGoalCount,
      awayGoalCount,
      home_ppg,
      away_ppg,
      date_unix,
      team_a_xg,
      team_b_xg,
      odds_ft_1,
      odds_ft_2,
      odds_ft_x,
      team_a_shots,
      team_b_shots,
      team_a_corners,
      team_b_corners,
      team_a_shotsOnTarget,
      team_b_shotsOnTarget,
      team_a_fouls,
      team_b_fouls,
      team_a_red_cards,
      team_b_red_cards,
      team_a_possession,
      team_b_possession,
      team_a_dangerous_attacks,
      team_b_dangerous_attacks,
      pre_match_teamA_overall_ppg,
      pre_match_teamB_overall_ppg,
      game_week,
    }) => ({
      home_name,
      away_name,
      homeGoalCount,
      awayGoalCount,
      home_ppg,
      away_ppg,
      date_unix,
      team_a_xg,
      team_b_xg,
      odds_ft_1,
      odds_ft_2,
      odds_ft_x,
      team_a_shots,
      team_b_shots,
      team_a_corners,
      team_b_corners,
      team_a_shotsOnTarget,
      team_b_shotsOnTarget,
      team_a_fouls,
      team_b_fouls,
      team_a_red_cards,
      team_b_red_cards,
      team_a_possession,
      team_b_possession,
      team_a_dangerous_attacks,
      team_b_dangerous_attacks,
      pre_match_teamA_overall_ppg,
      pre_match_teamB_overall_ppg,
      game_week,
    })
  );
}

export async function loadLeagueResultsForCompetition(competitionId, leagueName) {
  const startDate = Math.floor(Date.now() / 1000);
  const targetDate = startDate - 23778463;

  const fixtures = await fetch(apiGetUrl(`leagueFixtures/${competitionId}`));
  const games = await fixtures.json();

  let gamesFiltered;
  if (games.pager?.current_page < games.pager?.max_page) {
    const page2 = await fetch(
      apiGetUrl(`leagueFixtures/${competitionId}&page=2`)
    );
    const page2Data = await page2.json();
    const gamesConcat = games.data.concat(page2Data.data);
    const gamesConcatFiltered = gamesConcat.filter(
      (game) => game.status === "complete"
    );
    const mostRecentResults = gamesConcatFiltered.filter(
      (game) => game.date_unix > targetDate
    );
    gamesFiltered = mostRecentResults
      .sort((a, b) => a.date_unix - b.date_unix)
      .slice(-600);
  } else {
    gamesFiltered = games.data
      .filter((game) => game.status === "complete")
      .filter((game) => game.date_unix > targetDate)
      .slice(-600);
  }

  return {
    name: leagueName,
    id: competitionId,
    fixtures: mapLeagueFixtureResults(gamesFiltered),
  };
}

/**
 * Prefer the shared /results cache (same blob the homepage uses after
 * generateFixtures), falling back to a live leagueFixtures fetch.
 */
export async function resolveLeagueResultsForCompetition(
  competitionId,
  leagueName
) {
  try {
    const cachedRes = await fetch(apiGetUrl("results"));
    if (cachedRes.ok) {
      const allResults = await cachedRes.json();
      const cachedEntry = getLeagueResultsByLeagueId(
        Array.isArray(allResults) ? allResults : [],
        competitionId
      );
      const fixtureCount = Array.isArray(cachedEntry?.fixtures)
        ? cachedEntry.fixtures.length
        : 0;

      if (fixtureCount >= MIN_LEAGUE_FIXTURES_FOR_DERIVED_STATS) {
        return {
          name: cachedEntry.name ?? leagueName,
          id: cachedEntry.id ?? competitionId,
          fixtures: cachedEntry.fixtures,
        };
      }
    }
  } catch (error) {
    console.warn("Cached league results unavailable, fetching live:", error);
  }

  return loadLeagueResultsForCompetition(competitionId, leagueName);
}
