const RECENT_H2H_MATCHES = 4;

function formatH2hDate(unixTimestamp) {
  if (unixTimestamp == null) {
    return "—";
  }
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function resolveTeamName(teamId, fixture) {
  const homeId = fixture.homeID ?? fixture.homeId;
  const awayId = fixture.awayID ?? fixture.awayId;

  if (teamId === homeId) {
    return fixture.home_name ?? fixture.homeTeam;
  }
  if (teamId === awayId) {
    return fixture.away_name ?? fixture.awayTeam;
  }

  return null;
}

function mapSummaryResults(h2h, fixture) {
  const results = h2h?.previous_matches_results;
  if (!results || results.totalMatches <= 0) {
    return null;
  }

  const homeId = fixture.homeID ?? fixture.homeId;
  const teamAIsFixtureHome = h2h.team_a_id === homeId;

  return {
    totalMatches: results.totalMatches,
    homeTeamWins: teamAIsFixtureHome ? results.team_a_wins : results.team_b_wins,
    awayTeamWins: teamAIsFixtureHome ? results.team_b_wins : results.team_a_wins,
    draws: results.draw ?? 0,
    homeWinPercent: teamAIsFixtureHome
      ? results.team_a_win_percent
      : results.team_b_win_percent,
    awayWinPercent: teamAIsFixtureHome
      ? results.team_b_win_percent
      : results.team_a_win_percent,
  };
}

function mapRecentMatches(h2h, fixture) {
  const matches = h2h?.previous_matches_ids;
  if (!Array.isArray(matches) || matches.length === 0) {
    return [];
  }

  return [...matches]
    .sort((a, b) => (b.date_unix ?? 0) - (a.date_unix ?? 0))
    .slice(0, RECENT_H2H_MATCHES)
    .map((match) => {
      const teamAName =
        resolveTeamName(match.team_a_id, fixture) ?? match.team_a_name ?? "Team A";
      const teamBName =
        resolveTeamName(match.team_b_id, fixture) ?? match.team_b_name ?? "Team B";

      return {
        date: formatH2hDate(match.date_unix),
        homeTeam: teamAName,
        awayTeam: teamBName,
        homeGoals: match.team_a_goals,
        awayGoals: match.team_b_goals,
      };
    });
}

export function buildFixtureHeadToHead(fixture) {
  const h2h = fixture?.h2h;
  if (!h2h?.previous_matches_results) {
    return null;
  }

  const summary = mapSummaryResults(h2h, fixture);
  if (!summary) {
    return null;
  }

  return {
    summary,
    recentMatches: mapRecentMatches(h2h, fixture),
  };
}
