import { getPointsFromLastX } from "../logic/getScorePredictions";

function getGroupStageTable(league) {
  return league?.data?.specific_tables?.find((st) => st.groups?.length > 0);
}

/**
 * Transform a league API response into group-stage table rows.
 * @returns {{ id: number, group: string, table: object[] }[]}
 */
export function transformGroupStageTables(leagueApiResponse, leagueId) {
  const groupStage =
    getGroupStageTable(leagueApiResponse) ||
    leagueApiResponse?.data?.specific_tables?.[0];
  const cupGroups = groupStage?.groups;

  if (!cupGroups?.length) {
    return [];
  }

  const tables = [];

  cupGroups.forEach((group) => {
    const groupInstance = [];

    group.table.forEach((currentTeam, index) => {
      const last5 = (currentTeam.wdl_record || "").slice(-5).toUpperCase();

      groupInstance.push({
        LeagueID: leagueId,
        Position: index + 1,
        GroupName: group.name,
        Name: currentTeam.cleanName,
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
        LastXPoints: getPointsFromLastX(last5.split("")),
        Points: currentTeam.points,
        wdl: currentTeam.wdl_record,
        seasonGoals: currentTeam.seasonGoals,
        seasonConceded: currentTeam.seasonConceded,
        zone: currentTeam.zone?.name || "mid-table",
      });
    });

    tables.push({
      id: leagueId,
      group: group.name,
      table: groupInstance,
    });
  });

  return tables;
}

export function flattenGroupTables(groups) {
  return groups.flatMap((g) => g.table || []);
}
