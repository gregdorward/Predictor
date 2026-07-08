import { getPointsFromLastX } from "../utils/getPointsFromLastX";

export const GROUP_STAGE_LEAGUE_IDS = [13964, 16494]; // WC Qual Europe, World Cup 2026

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

function toBasicTableRows(table) {
  if (!table?.length) {
    return null;
  }

  return table.map((item) => ({
    LeagueID: item.LeagueID,
    Name: item.Name,
    Position: item.Position,
    GoalDifference: item.GoalDifference,
    Played: item.Played,
    Points: item.Points,
    ...(item.GroupName ? { GroupName: item.GroupName } : {}),
  }));
}

function findGroupForTeam(groups, teamName) {
  return groups.find((group) =>
    group.table?.some((team) => team.Name === teamName)
  );
}

const WORLD_CUP_KNOCKOUT_STAGES_BY_MINIMUM = {
  4: "Round of 32",
  5: "Round of 16",
  6: "Quarter-finals",
  7: "Semi-finals",
  8: "Third place play-off",
  9: "Final",
};

const WORLD_CUP_KNOCKOUT_STAGES_BY_GAME_WEEK = {
  4: "Round of 32",
  5: "Round of 16",
  6: "Quarter-finals",
  7: "Semi-finals",
  8: "Third place play-off",
  9: "Final",
};

function inferWorldCupKnockoutStage(matchesCompletedMinimum, gameWeek) {
  const minimum = Number(matchesCompletedMinimum);
  if (
    !Number.isNaN(minimum) &&
    WORLD_CUP_KNOCKOUT_STAGES_BY_MINIMUM[minimum]
  ) {
    return WORLD_CUP_KNOCKOUT_STAGES_BY_MINIMUM[minimum];
  }

  const week = Number(gameWeek);
  if (!Number.isNaN(week) && WORLD_CUP_KNOCKOUT_STAGES_BY_GAME_WEEK[week]) {
    return WORLD_CUP_KNOCKOUT_STAGES_BY_GAME_WEEK[week];
  }

  if (!Number.isNaN(minimum) && minimum >= 4) {
    return "Knockout stage";
  }

  return null;
}

export function resolveCompetitionStage({
  leagueId,
  homeTeam,
  awayTeam,
  tableArray,
  roundName,
  matchesCompletedMinimum,
  gameWeek,
}) {
  if (roundName) {
    return roundName;
  }

  const isGroupStageLeague = GROUP_STAGE_LEAGUE_IDS.includes(Number(leagueId));
  if (!isGroupStageLeague) {
    return null;
  }

  const groups = tableArray.filter(
    (entry) => String(entry.id) === String(leagueId)
  );
  const homeGroup = findGroupForTeam(groups, homeTeam);
  const awayGroup = findGroupForTeam(groups, awayTeam);

  if (homeGroup && awayGroup && homeGroup === awayGroup) {
    return `Group stage - ${homeGroup.group}`;
  }

  if (homeGroup && awayGroup && homeGroup !== awayGroup) {
    return (
      inferWorldCupKnockoutStage(matchesCompletedMinimum, gameWeek) ||
      "Knockout stage"
    );
  }

  const minimum = Number(matchesCompletedMinimum);
  if (!Number.isNaN(minimum) && minimum < 4) {
    return `Group stage - Matchday ${minimum + 1}`;
  }

  return inferWorldCupKnockoutStage(matchesCompletedMinimum, gameWeek);
}

/**
 * Resolve league table context for AI match previews.
 * Group-stage cups return the fixture's group table; knockouts return each
 * team's group-stage table so that background remains available.
 */
export function resolveFixtureTableContext({
  leagueId,
  homeTeam,
  awayTeam,
  tableArray,
  basicTableArray,
  roundName,
  matchesCompletedMinimum,
  gameWeek,
}) {
  const isGroupStageLeague = GROUP_STAGE_LEAGUE_IDS.includes(Number(leagueId));

  if (!isGroupStageLeague) {
    const table = basicTableArray.find(
      (item) => String(item.id) === String(leagueId)
    );
    return {
      leagueTable: table?.table ?? null,
      competitionStage: roundName || null,
    };
  }

  const groups = tableArray.filter(
    (entry) => String(entry.id) === String(leagueId)
  );

  const homeGroup = groups.length ? findGroupForTeam(groups, homeTeam) : null;
  const awayGroup = groups.length ? findGroupForTeam(groups, awayTeam) : null;

  const relevantGroups = [];
  if (homeGroup) {
    relevantGroups.push(homeGroup);
  }
  if (awayGroup && awayGroup !== homeGroup) {
    relevantGroups.push(awayGroup);
  }

  let leagueTable = null;
  if (relevantGroups.length === 1) {
    leagueTable = toBasicTableRows(relevantGroups[0].table);
  } else if (relevantGroups.length > 1) {
    leagueTable = relevantGroups.map((group) => ({
      group: group.group,
      table: toBasicTableRows(group.table),
    }));
  }

  const competitionStage = resolveCompetitionStage({
    leagueId,
    homeTeam,
    awayTeam,
    tableArray,
    roundName,
    matchesCompletedMinimum,
    gameWeek,
  });

  return { leagueTable, competitionStage };
}
