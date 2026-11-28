import {
  buildCompetitionLeagueTableViews,
  CONFERENCE_SCOPE_EAST,
  CONFERENCE_SCOPE_WEST,
  conferenceScopeLabel,
} from "../components/competition/competitionLeagueTable";
import { COMPARISON_LOW_SAMPLE_MATCHES } from "./competitionOverviewData";

/** Prose label e.g. "2026/2027" -> "2026/27". */
export function formatSeasonShort(season) {
  if (!season) return null;
  const text = String(season).trim();
  const long = text.match(/^(\d{4})\/(\d{4})$/);
  if (long) return `${long[1]}/${long[2].slice(-2)}`;
  return text;
}

function gameWord(count) {
  const n = Number(count);
  if (n === 1) return "game";
  return "games";
}

function buildLiveMarketParagraph({ avgGoals, btts, over25, under25 }) {
  const sentences = [];
  if (avgGoals != null) {
    sentences.push(`Matches average ${avgGoals} goals so far.`);
  }
  if (btts != null) {
    sentences.push(`Both teams have scored in ${btts} of games.`);
  }
  if (over25 != null && under25 != null) {
    sentences.push(
      `${over25} of games have gone over 2.5 and ${under25} have stayed under 2.5.`
    );
  } else if (over25 != null) {
    sentences.push(`${over25} of games have gone over 2.5.`);
  } else if (under25 != null) {
    sentences.push(`${under25} of games have stayed under 2.5.`);
  }

  if (!sentences.length) return null;
  return sentences.join(" ");
}

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

export function buildCompetitionRowsFromRawTable(teams = []) {
  const rows = (teams || [])
    .map((team, index) => {
      const name = team?.cleanName || team?.name || team?.english_name || null;
      const position = finiteNumber(team?.leaguePosition_overall) || index + 1;
      const played =
        finiteNumber(team?.matchesPlayed) ||
        finiteNumber(team?.seasonMatchesPlayed_overall);
      const goalDifference =
        finiteNumber(team?.seasonGoalDifference) ||
        finiteNumber(team?.seasonGoalDifference_overall);
      const wins =
        finiteNumber(team?.seasonWins_overall) ||
        finiteNumber(team?.seasonWinsNum_overall);
      const draws =
        finiteNumber(team?.seasonDraws_overall) ||
        finiteNumber(team?.seasonDrawsNum_overall);
      const points =
        finiteNumber(team?.points) ??
        (wins != null && draws != null ? wins * 3 + draws : null);

      if (!name || position == null || position < 1) return null;

      return {
        id: team.id ?? null,
        name,
        position,
        played,
        goalDifference,
        points,
        btts: team?.seasonBTTSPercentage_overall ?? null,
        over25: team?.seasonOver25Percentage_overall ?? null,
      };
    })
    .filter(Boolean);

  if (rows.length < 4) return [];

  return rows.sort((a, b) => a.position - b.position);
}

function buildCompetitionRowsFromViewTeams(teams = []) {
  return (teams || [])
    .map((team) => ({
      id: team.ID ?? null,
      name: team.Name || null,
      position: finiteNumber(team.Position),
      played: finiteNumber(team.Played),
      goalDifference: finiteNumber(team.GoalDifference),
      points: finiteNumber(team.Points),
      btts: finiteNumber(team.seasonBTTSPercentage_overall),
      over25: finiteNumber(team.seasonOver25Percentage_overall),
    }))
    .filter((row) => row.name && row.position != null)
    .sort((a, b) => a.position - b.position);
}

function normaliseLookupValue(value) {
  if (value == null || value === "") return null;
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function teamMarketLookupKeys(team) {
  const keys = [];
  [team?.id, team?.ID].forEach((id) => {
    if (id != null && id !== "") keys.push(`id:${String(id)}`);
  });
  [team?.name, team?.Name, team?.english_name, team?.cleanName].forEach(
    (name) => {
      const normalized = normaliseLookupValue(name);
      if (normalized) keys.push(`name:${normalized}`);
    }
  );
  return [...new Set(keys)];
}

function buildTeamMarketLookup(teams = []) {
  const lookup = new Map();
  teams.forEach((team) => {
    const rates = {
      btts: finiteNumber(team?.seasonBTTSPercentage_overall),
      over25: finiteNumber(team?.seasonOver25Percentage_overall),
    };
    if (rates.btts == null && rates.over25 == null) return;
    teamMarketLookupKeys(team).forEach((key) => lookup.set(key, rates));
  });
  return lookup;
}

function enrichRowWithTeamMarkets(row, lookup) {
  if (!lookup?.size) return row;
  if (row.btts != null && row.over25 != null) return row;

  const keys = teamMarketLookupKeys({
    id: row.id,
    name: row.name,
  });
  for (const key of keys) {
    const rates = lookup.get(key);
    if (!rates) continue;
    return {
      ...row,
      btts: row.btts ?? rates.btts,
      over25: row.over25 ?? rates.over25,
    };
  }
  return row;
}

export function buildCompetitionConferenceTableGroups(data) {
  const marketLookup = buildTeamMarketLookup(
    Array.isArray(data?.teams)
      ? data.teams
      : Array.isArray(data?.team)
        ? data.team
        : []
  );
  const withMarkets = (rows) =>
    rows.map((row) => enrichRowWithTeamMarkets(row, marketLookup));

  const groups = data?.specific_tables?.[0]?.groups;
  if (Array.isArray(groups) && groups.length > 0) {
    return groups
      .map((group) => ({
        name: group.name || group.round || "Conference",
        rows: withMarkets(buildCompetitionRowsFromRawTable(group.table)),
      }))
      .filter((group) => group.rows.length > 0);
  }

  const views = buildCompetitionLeagueTableViews(data?.id, { data });
  if (views?.mode !== "grouped") return [];

  return [
    CONFERENCE_SCOPE_EAST,
    CONFERENCE_SCOPE_WEST,
  ]
    .map((scope) => {
      const name = conferenceScopeLabel(scope);
      return {
        name,
        rows: withMarkets(
          buildCompetitionRowsFromViewTeams(
            views.teams.filter((team) => team.GroupName === name)
          )
        ),
      };
    })
    .filter((group) => group.rows.length > 0);
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
  matchesPlayed = null,
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
      } season has only just started. League averages and BTTS or Over 2.5 rates need more completed matches before they are worth reading.`
    );
    return paragraphs;
  }

  const marketParagraph = buildLiveMarketParagraph({
    avgGoals,
    btts,
    over25,
    under25,
  });

  const leaderName = tableLeader?.name;
  const leaderPoints = tableLeader?.points;
  const leaderPlayed = tableLeader?.played;
  const hasTableLeader =
    leaderName && leaderPoints != null && leaderPlayed != null;

  if (hasTableLeader && marketParagraph) {
    paragraphs.push(
      `${leaderName} are top of the ${name} on ${leaderPoints} points from ${leaderPlayed} ${gameWord(
        leaderPlayed
      )}. ${marketParagraph}`
    );
  } else if (hasTableLeader) {
    paragraphs.push(
      `${leaderName} are top of the ${name} on ${leaderPoints} points from ${leaderPlayed} ${gameWord(
        leaderPlayed
      )}.`
    );
  } else if (marketParagraph) {
    paragraphs.push(marketParagraph);
  }

  if (homeWin != null && draw != null && awayWin != null) {
    paragraphs.push(
      `Home wins are ${homeWin}, draws ${draw} and away wins ${awayWin}.`
    );
  }

  if (updatedOn) {
    paragraphs.push(`Figures as at ${updatedOn}.`);
  }

  paragraphs.push(
    `This page lists ${name} standings and season rates for home wins, BTTS and Over 2.5. Soccer Stats Hub updates the numbers daily for pre-match research.`
  );

  const seasonShort = formatSeasonShort(season);
  const leagueMatches = finiteNumber(matchesPlayed);
  const earlySeason =
    leagueMatches == null || leagueMatches < COMPARISON_LOW_SAMPLE_MATCHES;
  if (seasonShort && earlySeason) {
    paragraphs.push(
      `In ${seasonShort}, high-scoring rounds or a run of draws can change the table quickly. The standings below show the current order. Open a fixture on the homepage for head-to-head form and model probabilities.`
    );
  }

  return paragraphs;
}

function scorerLabel(row) {
  if (row.club) return `${row.name} (${row.club})`;
  return row.name;
}

/** One sentence for the crawlable scorers table. Freshness stays in the page intro. */
export function buildTopScorerLead(name, rows) {
  if (!name || !rows?.length) return null;
  const topGoals = Number(rows[0].goals);
  if (!Number.isFinite(topGoals)) return null;
  const leaders = rows.filter((row) => Number(row.goals) === topGoals);
  if (!leaders.length || leaders.some((row) => !row.name)) return null;

  const goalWord = topGoals === 1 ? "goal" : "goals";
  const labels = leaders.map(scorerLabel);

  if (labels.length === 1) {
    return `${labels[0]} is the leading ${name} scorer with ${topGoals} ${goalWord}.`;
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]} are the leading ${name} scorers with ${topGoals} ${goalWord} each.`;
  }

  const last = labels[labels.length - 1];
  const rest = labels.slice(0, -1).join(", ");
  return `${rest} and ${last} are the leading ${name} scorers with ${topGoals} ${goalWord} each.`;
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
