/**
 * Backtest-only match builder (copied from generateFixtures essentials).
 * Does not modify getFixtures.js.
 */
export function buildMatchFromFixture(fixture, leagueName) {
  const dateObject = new Date(fixture.date_unix * 1000);

  const homeOdds = Number(fixture.odds_ft_1);
  const awayOdds = Number(fixture.odds_ft_2);
  const drawOdds = Number(fixture.odds_ft_x);

  return {
    id: fixture.id,
    competition_id: fixture.competition_id,
    leagueID: fixture.competition_id,
    leagueDesc: leagueName,
    leagueName,
    date: fixture.date_unix,
    time: dateObject.toLocaleString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    homeTeam: fixture.home_name,
    awayTeam: fixture.away_name,
    stadium: fixture.stadium_name,
    refereeID: fixture.refereeID,
    homeOdds: homeOdds.toFixed(2),
    awayOdds: awayOdds.toFixed(2),
    drawOdds: drawOdds.toFixed(2),
    homeDoubleChance: fixture.odds_doublechance_1x,
    awayDoubleChance: fixture.odds_doublechance_x2,
    bttsOdds: fixture.odds_btts_yes,
    homeId: fixture.homeID,
    awayId: fixture.awayID,
    form: [],
    btts: false,
    matches_completed_minimum: fixture.matches_completed_minimum,
    homeBadge: fixture.home_image,
    awayBadge: fixture.away_image,
    homePpg:
      fixture.home_ppg != null ? Number(fixture.home_ppg).toFixed(2) : "N/A",
    awayPpg:
      fixture.away_ppg != null ? Number(fixture.away_ppg).toFixed(2) : "N/A",
    status: fixture.status,
    over25Odds: fixture.odds_ft_over25,
    btts_potential: fixture.btts_potential,
    game: `${fixture.home_name} v ${fixture.away_name}`,
    homeGoals: fixture.homeGoalCount,
    awayGoals: fixture.awayGoalCount,
    expectedGoalsHomeToDate: fixture.team_a_xg_prematch,
    expectedGoalsAwayToDate: fixture.team_b_xg_prematch,
    game_week: fixture.game_week,
    omit: false,
    fractionHome: "N/A",
    fractionAway: "N/A",
    fractionDraw: "N/A",
    bttsFraction: "N/A",
    over25Fraction: "N/A",
    homeRawPosition: 0,
    awayRawPosition: 0,
  };
}
