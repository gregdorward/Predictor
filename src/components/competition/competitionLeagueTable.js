import { getPointsFromLastX } from "../../utils/getPointsFromLastX";
import {
  transformGroupStageTables,
  flattenGroupTables,
  GROUP_STAGE_LEAGUE_IDS,
} from "../../utils/groupStageTables";

function getLast5(wdlRecord) {
  if (!wdlRecord?.length) {
    return "N/A";
  }
  if (wdlRecord.length < 5) {
    return wdlRecord.slice(-wdlRecord.length).toUpperCase();
  }
  return wdlRecord.slice(-5).toUpperCase();
}

export function teamRowHasHomeAwaySplit(currentTeam) {
  return (
    currentTeam?.seasonWins_home != null &&
    currentTeam?.seasonWins_away != null &&
    currentTeam?.seasonGoals_home != null &&
    currentTeam?.seasonGoals_away != null
  );
}

function mapTeamRow(currentTeam, leagueId, index, groupName) {
  const last5 = getLast5(currentTeam.wdl_record);
  const team = {
    LeagueID: leagueId,
    Position: index + 1,
    Name: currentTeam.cleanName || currentTeam.name,
    ID: currentTeam.id,
    Played: currentTeam.matchesPlayed,
    Wins: currentTeam.seasonWins_overall,
    Draws: currentTeam.seasonDraws_overall,
    Losses: currentTeam.seasonLosses_overall,
    For: currentTeam.seasonGoals,
    Against:
      currentTeam.seasonConceded_home + currentTeam.seasonConceded_away,
    GoalDifference: currentTeam.seasonGoalDifference,
    Form: last5,
    LastXPoints: getPointsFromLastX(last5 === "N/A" ? [] : last5.split("")),
    Points: currentTeam.points,
    wdl: currentTeam.wdl_record,
    seasonGoals: currentTeam.seasonGoals,
    seasonConceded: currentTeam.seasonConceded,
    zone: currentTeam.zone?.name ?? "mid-table",
  };

  if (teamRowHasHomeAwaySplit(currentTeam)) {
    team.HomeWins = currentTeam.seasonWins_home;
    team.HomeDraws = currentTeam.seasonDraws_home;
    team.HomeLosses = currentTeam.seasonLosses_home;
    team.HomeFor = currentTeam.seasonGoals_home;
    team.HomeAgainst = currentTeam.seasonConceded_home;
    team.AwayWins = currentTeam.seasonWins_away;
    team.AwayDraws = currentTeam.seasonDraws_away;
    team.AwayLosses = currentTeam.seasonLosses_away;
    team.AwayFor = currentTeam.seasonGoals_away;
    team.AwayAgainst = currentTeam.seasonConceded_away;
  }

  if (groupName) {
    team.GroupName = groupName;
  }

  return team;
}

function viewsSupportClassicTable(teams) {
  return Array.isArray(teams) && teams.some((team) => team.HomeWins != null);
}

function withClassicTableFlag(view) {
  if (!view) {
    return null;
  }

  if (view.mode === "divisions") {
    const divisions = view.divisions.map((division) => ({
      ...division,
      teams: division.teams,
    }));
    const supportsClassicTable = divisions.some((division) =>
      viewsSupportClassicTable(division.teams)
    );
    return { ...view, divisions, supportsClassicTable };
  }

  return {
    ...view,
    supportsClassicTable: viewsSupportClassicTable(view.teams),
  };
}

function mapTableRows(source, leagueId, groupName) {
  if (!source?.length) {
    return [];
  }

  return source.map((currentTeam, index) =>
    mapTeamRow(currentTeam, leagueId, index, groupName)
  );
}

function buildMlsConferenceViews(leagueId, data) {
  const groups = data.specific_tables?.[0]?.groups;
  if (leagueId !== 16504 || !groups?.length) {
    return null;
  }

  const teams = groups.flatMap((group) =>
    mapTableRows(group.table, leagueId, group.name || group.round)
  );

  return teams.length ? { mode: "grouped", teams } : null;
}

/**
 * Resolve homepage/fixture table rows for leagues with conference tables (e.g. MLS).
 * Prefers pre-built bespoke divisions; falls back to raw league payload.
 */
export function resolveConferenceLeagueTeams(
  seasonId,
  bespokeDivisions = [],
  leaguePayload = null
) {
  const id = Number(seasonId);
  const fromBespoke = bespokeDivisions.filter(
    (entry) => Number(entry.id) === id && entry.table?.length
  );

  if (fromBespoke.length > 0) {
    return fromBespoke.flatMap((division) =>
      division.table.map((team) => ({
        ...team,
        GroupName: team.GroupName || division.group,
      }))
    );
  }

  const views = leaguePayload
    ? buildCompetitionLeagueTableViews(seasonId, leaguePayload)
    : null;

  if (views?.mode === "grouped" || views?.mode === "standard") {
    return views.teams;
  }

  return [];
}

/**
 * Build LeagueTable-compatible team rows from a single league tables API response.
 * Mirrors generateTables() in getFixtures.js for one competition.
 */
export function buildCompetitionLeagueTableViews(seasonId, league) {
  const leagueId = Number(seasonId);
  const data = league?.data;
  if (!data) {
    return null;
  }

  if (GROUP_STAGE_LEAGUE_IDS.includes(leagueId)) {
    const groupTables = transformGroupStageTables(league, leagueId);
    if (!groupTables.length) {
      return null;
    }

    return withClassicTableFlag({
      mode: "grouped",
      teams: flattenGroupTables(groupTables),
    });
  }

  const mlsViews = buildMlsConferenceViews(leagueId, data);
  if (mlsViews) {
    return withClassicTableFlag(mlsViews);
  }

  const specificTable = data.specific_tables?.[0]?.table;

  if (specificTable?.length && leagueId !== 12933) {
    return withClassicTableFlag({
      mode: "standard",
      teams: mapTableRows(specificTable, leagueId),
    });
  }

  if (Array.isArray(data.league_table) && data.league_table.length) {
    return withClassicTableFlag({
      mode: "standard",
      teams: mapTableRows(data.league_table, leagueId),
    });
  }

  if (data.league_table === null && data.all_matches_table_overall?.length) {
    return withClassicTableFlag({
      mode: "standard",
      teams: mapTableRows(data.all_matches_table_overall, leagueId),
    });
  }

  return null;
}
