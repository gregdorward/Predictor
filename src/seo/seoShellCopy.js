export function formatSeoUpdatedDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(date);
}

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/**
 * Compact standings for the server-rendered competition page.
 * Uses leaguePosition_overall so cups (all zeros) do not get a fake table.
 * Returns [] unless positions are a complete 1..n ranking.
 */
export function buildCompetitionTableRows(teams) {
  const rows = (teams || [])
    .map((team) => {
      const position = finiteNumber(team?.leaguePosition_overall);
      const played = finiteNumber(team?.seasonMatchesPlayed_overall);
      const goalDifference = finiteNumber(team?.seasonGoalDifference_overall);
      const wins = finiteNumber(team?.seasonWinsNum_overall);
      const draws = finiteNumber(team?.seasonDrawsNum_overall);
      const name = team?.cleanName || team?.name || team?.english_name || null;
      if (!name || position == null || position < 1) return null;

      return {
        id: team.id ?? null,
        name,
        position,
        played,
        goalDifference,
        points: wins != null && draws != null ? wins * 3 + draws : null,
        btts: team?.seasonBTTSPercentage_overall ?? null,
        over25: team?.seasonOver25Percentage_overall ?? null,
      };
    })
    .filter(Boolean);

  if (rows.length < 4) return [];

  const positions = new Set(rows.map((row) => row.position));
  const maxPosition = rows.reduce((max, row) => Math.max(max, row.position), 0);
  if (positions.size !== rows.length || maxPosition !== rows.length) return [];

  return rows.sort((a, b) => a.position - b.position);
}

/** True when formatted market stats are present (not an empty / unstarted season). */
export function hasLiveCompetitionMarkets({
  avgGoals,
  btts,
  over25,
  under25,
} = {}) {
  return [avgGoals, btts, over25, under25].some((value) => value != null);
}

export function buildCompetitionSeoParagraphs({
  name,
  country,
  season,
  avgGoals,
  btts,
  over25,
  under25,
  homeWin,
  draw,
  awayWin,
  tableLeader = null,
  updatedOn = null,
  seasonStarted = undefined,
}) {
  const paragraphs = [];
  const location = [country, season].filter(Boolean).join(", ");
  const hasMarkets =
    seasonStarted !== false &&
    hasLiveCompetitionMarkets({ avgGoals, btts, over25, under25 });

  if (!hasMarkets) {
    paragraphs.push(
      `Season stats for ${name}${location ? ` (${location})` : ""}.`
    );
    paragraphs.push(
      `The ${
        season || "new"
      } season is still getting underway, so league-wide averages and team market rates are not meaningful yet. Check back once enough fixtures have been played.`
    );
    return paragraphs;
  }

  const marketBits = [];
  if (avgGoals != null) {
    marketBits.push(`matches are averaging ${avgGoals} goals`);
  }
  if (btts != null) {
    marketBits.push(`both teams have scored in ${btts} of games`);
  }
  if (over25 != null) {
    marketBits.push(`${over25} of fixtures have gone Over 2.5 goals`);
  }
  if (under25 != null) {
    marketBits.push(`${under25} have stayed Under 2.5 goals`);
  }

  const leaderName = tableLeader?.name;
  const leaderPoints = tableLeader?.points;
  const leaderPlayed = tableLeader?.played;
  const hasTableLeader =
    leaderName && leaderPoints != null && leaderPlayed != null;

  if (hasTableLeader && marketBits.length > 0) {
    paragraphs.push(
      `${leaderName} lead the ${name} on ${leaderPoints} points from ${leaderPlayed} matches. So far, ${marketBits.join(
        ", "
      )}.`
    );
  } else if (hasTableLeader) {
    paragraphs.push(
      `${leaderName} lead the ${name} on ${leaderPoints} points from ${leaderPlayed} matches.`
    );
  } else if (marketBits.length > 0) {
    paragraphs.push(
      `Across the ${name} season so far, ${marketBits.join(", ")}.`
    );
  }

  if (homeWin != null && draw != null && awayWin != null) {
    paragraphs.push(
      `Home teams have won ${homeWin} of games, with ${draw} drawn and ${awayWin} won by the away side.`
    );
  }

  if (updatedOn) {
    paragraphs.push(`Figures as of ${updatedOn}.`);
  }

  return paragraphs;
}

export function buildFixtureSeoParagraphs({
  home,
  away,
  league,
  competitionName,
}) {
  const competition = league || competitionName;
  return [
    `Pre-match stats and predictions for ${home} vs ${away}${
      competition ? ` in ${competition}` : ""
    }: form, head-to-head, xG trends, BTTS and Over/Under markets.`,
  ];
}
