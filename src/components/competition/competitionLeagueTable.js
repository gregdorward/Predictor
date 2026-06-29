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

  if (groupName) {
    team.GroupName = groupName;
  }

  return team;
}

function mapTableRows(source, leagueId, groupName) {
  if (!source?.length) {
    return [];
  }

  return source.map((currentTeam, index) =>
    mapTeamRow(currentTeam, leagueId, index, groupName)
  );
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

    return {
      mode: "grouped",
      teams: flattenGroupTables(groupTables),
    };
  }

  const specificTable = data.specific_tables?.[0]?.table;

  if (specificTable?.length && leagueId !== 12933) {
    return {
      mode: "standard",
      teams: mapTableRows(specificTable, leagueId),
    };
  }

  if (leagueId === 16504 && data.specific_tables?.[0]?.groups?.length) {
    const divisions = data.specific_tables[0].groups.map((group) => ({
      name: group.name || group.round,
      teams: mapTableRows(group.table, leagueId),
    }));

    if (!divisions.length) {
      return null;
    }

    return { mode: "divisions", divisions };
  }

  if (Array.isArray(data.league_table) && data.league_table.length) {
    return {
      mode: "standard",
      teams: mapTableRows(data.league_table, leagueId),
    };
  }

  if (data.league_table === null && data.all_matches_table_overall?.length) {
    return {
      mode: "standard",
      teams: mapTableRows(data.all_matches_table_overall, leagueId),
    };
  }

  return null;
}
